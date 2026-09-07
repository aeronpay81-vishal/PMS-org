const API_KEY =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_GROQ_API_KEY) ||
    "";

const MODELS_URL = "https://api.groq.com/openai/v1/models";
const CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

// Preference order matters here — this is the order models will be tried in.
// Strongest / most instruction-following models first, smaller and older
// ones as last-resort fallbacks. Any other model Groq happens to expose
// gets appended after these, never before.
const FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
];

let cachedActiveModels = null;

/**
 * Dynamically queries Groq for currently active and supported models on this API key,
 * then re-orders them so known-strong models are always tried before small/instant ones.
 * FIX: previously used whatever order Groq's /models endpoint happened to return, which
 * could put a weak model (e.g. llama-3.1-8b-instant) first and produce generic/incorrect
 * answers even though the prompt and data were correct.
 */
async function getAvailableModels() {
    if (cachedActiveModels && cachedActiveModels.length > 0) {
        return cachedActiveModels;
    }

    try {
        const res = await fetch(MODELS_URL, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.data)) {

                const validModels = data.data
                    .map((m) => m.id)
                    .filter((id) => {
                        const lower = id.toLowerCase();
                        return (
                            !lower.includes("whisper") &&
                            !lower.includes("guard") &&
                            !lower.includes("embedding") &&
                            !lower.includes("vision") &&
                            !lower.includes("tts")
                        );
                    });

                if (validModels.length > 0) {
                    // Put preferred/strong models first (in FALLBACK_MODELS order),
                    // then anything else Groq exposes that we didn't explicitly rank.
                    const ranked = FALLBACK_MODELS.filter((m) => validModels.includes(m));
                    const unranked = validModels.filter((m) => !FALLBACK_MODELS.includes(m));
                    const ordered = [...ranked, ...unranked];

                    cachedActiveModels = ordered;
                    return ordered;
                }
            }
        }
    } catch (e) {
        console.warn("Could not dynamically query Groq models list, using fallbacks:", e);
    }

    return FALLBACK_MODELS;
}

/**
 * Calls Groq directly from the browser with automatic model discovery and fallback.
 * @param {string} system - system/context instructions
 * @param {string} prompt - the actual question/instruction
 * @param {boolean} jsonMode - if true, asks for raw JSON back and parses it
 * @param {number} maxTokens - max tokens for this call (defaults to 800; longer/detailed
 *   answers like the free-form "ask" endpoint use a higher value so responses don't get cut off)
 */
async function callAI({ system, prompt, jsonMode = false, maxTokens = 800 }) {
    if (!API_KEY) {
        throw new Error(
            "Missing Groq API key. Please check VITE_GROQ_API_KEY in your frontend/.env file."
        );
    }

    const modelList = await getAvailableModels();
    let lastError = null;

    for (const model of modelList) {
        try {
            const body = {
                model,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt },
                ],
                temperature: 0.3,
                max_tokens: maxTokens,
                ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
            };

            const response = await fetch(CHAT_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errText = await response.text();
                let parsedErr = "";
                try {
                    const errObj = JSON.parse(errText);
                    parsedErr = errObj?.error?.message || errText;
                } catch (_) {
                    parsedErr = errText;
                }

                console.warn(`Groq model ${model} failed (${response.status}): ${parsedErr}`);
                lastError = new Error(`AI request error (${response.status}): ${parsedErr.slice(0, 250)}`);
                // Move to next available model
                continue;
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content?.trim() || "";

            if (jsonMode) {
                try {
                    const cleaned = text
                        .replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/```\s*$/i, "")
                        .trim();
                    return JSON.parse(cleaned);
                } catch (e) {
                    const start = text.indexOf("{");
                    const end = text.lastIndexOf("}");
                    if (start !== -1 && end !== -1 && end > start) {
                        return JSON.parse(text.slice(start, end + 1));
                    }
                    throw new Error("Unable to parse AI structured response.");
                }
            }

            return text;
        } catch (err) {
            console.warn(`Groq error with model ${model}:`, err.message);
            lastError = err;
            continue;
        }
    }

    throw lastError || new Error("All Groq AI models failed. Please check your API key at console.groq.com");
}

/**
 * Builds a compact text summary of real project + task data so every AI
 * answer is grounded in real data instead of being generic.
 */
export function buildProjectContext(projects = []) {
    if (!projects || projects.length === 0) {
        return "No project data is available right now in the system.";
    }

    const lines = projects.map((project) => {
        const tasks = project.tasks || project.assignments || [];
        const done = tasks.filter((t) => {
            const s = (t.status || "").toLowerCase();
            return s === "done" || s === "completed" || s === "closed";
        }).length;

        const overdue = tasks.filter((t) => {
            const s = (t.status || "").toLowerCase();
            if (!t.due_date || s === "done" || s === "completed" || s === "closed") return false;
            return new Date(t.due_date) < new Date();
        });

        const taskLines = tasks
            .map((t) => {
                // FIX: previously this only accepted a *string* assigned_to as a last
                // resort, so a numeric/UUID assigned_to (no populated assignee object)
                // silently became "Unassigned" — even though the task WAS assigned.
                // That wrong fact then got baked into the AI's context and repeated
                // back as if it were true. Now we say "Assigned (id: X)" instead of
                // lying that nobody owns it.
                let assigneeName =
                    t.assignee?.full_name ||
                    t.assignee?.username ||
                    t.assigned_to_name ||
                    null;

                if (!assigneeName) {
                    if (t.assigned_to) {
                        assigneeName = `Assigned (user id: ${t.assigned_to})`;
                    } else {
                        assigneeName = "Unassigned";
                    }
                }

                const title = t.summary || t.task_detail || t.title || "Untitled task";
                const prio = t.priority || "medium";
                const due = t.due_date ? new Date(t.due_date).toLocaleDateString() : "no date";
                const stat = t.status || "open";
                return `    - [${stat}] ${title} (priority: ${prio}, assignee: ${assigneeName}, due: ${due})`;
            })
            .join("\n");

        const projTitle = project.summary || project.title || `Project #${project.id}`;
        const projDue = project.due_date ? new Date(project.due_date).toLocaleDateString() : "not set";

        return (
            `PROJECT: ${projTitle} (ID: ${project.id})\n` +
            `  Status: ${project.status || "active"} | Priority: ${project.priority || "medium"}\n` +
            `  Due Date: ${projDue}\n` +
            `  Tasks: ${tasks.length} total, ${done} done, ${overdue.length} overdue\n` +
            (taskLines ? taskLines : "    - No individual tasks created yet")
        );
    });

    return lines.join("\n\n");
}

const SYSTEM_PREFIX =
    "You are an expert AI project analyst and agile project management assistant. " +
    "Analyze the real project and task data below to give accurate, actionable, concise insights. " +
    "Be specific: cite real project titles, task names, dates, priorities, and team members when available. " +
    "If no projects exist yet, provide helpful general project management advice. " +
    "Never invent numbers, names, or dates that are not present in the data below — if something isn't in the data, say it's not available instead of guessing.\n\n";

export const aiClient = {
    async generateInsights(projects) {
        const system = SYSTEM_PREFIX + buildProjectContext(projects);
        const result = await callAI({
            system,
            jsonMode: true,
            prompt:
                'Generate exactly 3 recommended actions for the project manager based on the project data. Respond ONLY with valid JSON in this exact structure: ' +
                '{"actions": [{"type": "danger", "title": "short title", "description": "one sentence action item", "action": "2-3 word button label"}]}. ' +
                'type must be one of: "danger", "warning", "success".',
        });
        return result.actions || [];
    },

    async ask(question, projects) {
        const system =
            SYSTEM_PREFIX +
            buildProjectContext(projects) +
            "\n\nWhen you answer, you MUST ground every claim in the specific data above — " +
            "name the actual project(s) and task(s) involved, their exact status, priority, due dates, " +
            "and assignees, and use real numbers (counts, percentages) instead of vague words like " +
            "'some tasks' or 'a few issues'. Never give a generic, high-level answer that could apply to any project.";

        return callAI({
            system,
            maxTokens: 1000,
            prompt:
                `Answer this question in detail based on the project data above: "${question}"\n\n` +
                "Write a clear, well-structured answer (roughly 4-8 sentences, or a short list of bullet points " +
                "if that fits the question better). Reference specific project names, task titles, exact dates, " +
                "priorities, and assignee names wherever relevant. If the data doesn't contain enough information " +
                "to fully answer, say exactly what's missing instead of guessing.",
        });
    },

    async generateSprintPlan(projects) {
        const system = SYSTEM_PREFIX + buildProjectContext(projects);
        return callAI({
            system,
            jsonMode: true,
            prompt:
                'Propose a practical sprint plan using the tasks and projects above. Respond ONLY with valid JSON in this structure: ' +
                '{"capacity": 75, "tasks": ["Task name 1", "Task name 2", "Task name 3"], "note": "one sentence rationale explaining sprint focus."}',
        });
    },
};
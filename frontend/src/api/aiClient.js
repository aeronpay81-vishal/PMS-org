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
 * Builds a compact text summary of real project + task data.
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
    "You are AeroPilot AI, a helpful project management assistant. " +
    "You help users with projects, tasks, deadlines, priorities, team workload, progress, and productivity. " +
    "You have access to project data when it is provided below, but NOT every user message is a project-data question.\n\n" +

    "CONVERSATION RULES:\n" +

    "1. CASUAL CONVERSATION:\n" +
    "If the user says hi, hello, hey, good morning, good afternoon, good evening, thanks, thank you, okay, ok, etc., " +
    "respond naturally and briefly. Do NOT mention missing project data.\n" +
    "Examples:\n" +
    '- User: "hi" → "Hi! 👋 How can I help you with your projects today?"\n' +
    '- User: "good morning" → "Good morning! 👋 How can I help you today?"\n' +
    '- User: "thanks" → "You\'re welcome! 😊"\n\n' +

    "2. VERY SHORT OR UNCLEAR MESSAGES:\n" +
    "If the user sends something like h, hmm, yes, ok, okay, or another unclear short message, " +
    "do not say that project data is missing. Ask what they would like help with.\n" +
    'Example: User: "h" → "Hey! 👋 What would you like help with?"\n\n' +

    "3. GENERAL PROJECT MANAGEMENT QUESTIONS:\n" +
    "If the user asks for general advice such as how to manage projects better, " +
    "how to prioritize tasks, how to improve team productivity, how to plan a sprint, " +
    "or how to manage deadlines, provide useful general advice. " +
    "You do NOT need project data for these questions.\n\n" +

    "4. PROJECT-DATA QUESTIONS:\n" +
    "Only use the project data when the user asks about their actual projects, tasks, team members, " +
    "deadlines, statuses, priorities, progress, workload, or other specific PMS information.\n" +
    "Examples:\n" +
    '- "Show my projects"\n' +
    '- "Which tasks are overdue?"\n' +
    '- "What is the status of my project?"\n' +
    '- "Who is working on the frontend task?"\n\n' +

    "5. MISSING DATA:\n" +
    "If a user asks for actual PMS information and the required data is unavailable, " +
    "clearly explain what data is missing. Do NOT use the missing-data message for greetings, small talk, " +
    "or general project-management questions.\n\n" +

    "6. NEVER INVENT DATA:\n" +
    "Never invent project names, task names, users, dates, statuses, priorities, numbers, or progress. " +
    "Only mention specific PMS data that exists in the provided context.\n\n" +

    "7. RESPONSE STYLE:\n" +
    "Be natural, concise, friendly, and practical. " +
    "Do not automatically use bullet points for greetings or casual conversation. " +
    "Do not repeatedly say 'No project data is available'. " +
    "Only say that when the user's question genuinely requires PMS data that is unavailable.\n\n";

export const aiClient = {
    async generateInsights(projects) {
        const system =
            SYSTEM_PREFIX +
            "\nPROJECT DATA:\n" +
            buildProjectContext(projects);

        const result = await callAI({
            system,
            jsonMode: true,
            prompt:
                "Generate exactly 3 recommended actions for the project manager based on the available project data. " +
                "If there are no projects, provide useful general project-management actions instead of pretending specific projects exist. " +
                "Never invent project or task names. " +
                'Respond ONLY with valid JSON in this exact structure: ' +
                '{"actions": [{"type": "danger", "title": "short title", "description": "one sentence action item", "action": "2-3 word button label"}]}. ' +
                'type must be one of: "danger", "warning", "success".',
        });

        return result.actions || [];
    },

    async ask(question, projects) {
        const projectContext = buildProjectContext(projects);

        const system =
            SYSTEM_PREFIX +
            "\nPROJECT DATA:\n" +
            projectContext;

        return callAI({
            system,
            maxTokens: 1000,
            prompt:
                `User message: "${question}"\n\n` +

                "First determine the type of request internally:\n" +
                "- CASUAL: greeting, thanks, small talk, or short unclear message\n" +
                "- GENERAL_ADVICE: general project-management advice that does not require actual PMS data\n" +
                "- PROJECT_DATA: question about actual projects, tasks, users, deadlines, statuses, priorities, progress, or workload\n\n" +

                "Response rules:\n" +
                "- For CASUAL messages, reply naturally and briefly. Do not mention project data.\n" +
                "- For GENERAL_ADVICE, give practical general advice. Do not claim it comes from the user's PMS data.\n" +
                "- For PROJECT_DATA questions, use the provided project data and mention real project/task names, statuses, dates, priorities, assignees, and numbers when available.\n" +
                "- If PROJECT_DATA is requested but the required data is unavailable, clearly say what is unavailable.\n" +
                "- Never invent PMS data.\n" +
                "- Do not force every answer to contain project data.\n" +
                "- Do not use bullet points for simple greetings or casual messages.\n" +
                "- Format every section heading or list label with Markdown bold (**Heading**); do not bold whole paragraphs.\n" +
                "- Keep the answer concise and natural.\n",
        });
    },

    async generateSprintPlan(projects) {
        const system =
            SYSTEM_PREFIX +
            "\nPROJECT DATA:\n" +
            buildProjectContext(projects);

        return callAI({
            system,
            jsonMode: true,
            prompt:
                "Create a practical sprint plan using the available project and task data. " +
                "Never invent task names. If there are no tasks, return an empty task list and explain that tasks need to be created first. " +
                'Respond ONLY with valid JSON in this structure: ' +
                '{"capacity": 75, "tasks": ["Task name 1", "Task name 2"], "note": "one sentence rationale explaining sprint focus."}',
        });
    },
};
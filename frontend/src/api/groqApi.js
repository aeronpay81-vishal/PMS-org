// groqAPI.js
// Enhanced Groq API wrapper with multiple automation functions
// 
// ⚠️ SECURITY NOTE
// Before shipping to production, move all API calls behind a backend route
// (e.g. POST /api/automation/parse) and keep the Groq key server-side only.

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

const VALID_STATUSES = [
  "open",
  "in_progress",
  "review",
  "closed",
  "cancelled",
  "active",
  "on_hold",
  "completed",
];

const GROQ_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_GROQ_API_KEY) ||
  "";

// ============ HELPER FUNCTION ============

async function callGroqAPI(systemPrompt, userContent) {
  if (!GROQ_API_KEY) {
    throw new Error( 
      "Missing Groq API key. Set VITE_GROQ_API_KEY or REACT_APP_GROQ_API_KEY"
    );
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error("AI returned unparsable JSON response");
  }
}

// ============ TASK TITLE + DESCRIPTION GENERATOR ============

const TASK_TITLE_DESCRIPTION_PROMPT = `You are a seasoned team lead who writes clear, practical task instructions for developers and team members. The task description must tell the person WHAT NEEDS TO BE DONE, HOW the work should be approached when the information is available, and WHAT the expected result should be. Do not explain what the AI is doing and do not write a generic summary of the task.

You will receive:
- A TASK TITLE (may be short, rough, or just a rough idea)
- An optional EXISTING description (may be empty, rough notes, or a partial draft)

Your job: produce a polished TASK TITLE and a clear, actionable DESCRIPTION that a developer or team member can directly use as instructions.

═══════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════

1. LANGUAGE & TONE
   - Write like an experienced team lead giving instructions to a team member.
   - Be clear, direct, practical, and specific.
   - Do not sound like an AI explaining the task.
   - Avoid corporate buzzwords such as "leverage", "synergy", "robust", "cutting-edge", "seamless", "holistic", "paradigm", "best-in-class", "empower", "unlock", "streamline".
   - Avoid marketing language and unnecessary filler.
   - Use plain English.
   - Keep sentences easy to understand.
   - The description should feel like something a manager/developer would actually write in a task.

2. TITLE RULES
   - Keep it short and scannable — 3 to 8 words maximum.
   - Use Title Case.
   - Start with an action verb when possible:
     "Add", "Fix", "Update", "Build", "Create", "Remove", "Improve", "Refactor", "Implement", "Change".
   - No trailing punctuation.
   - No emojis.
   - No quotes.
   - No "Task:" prefix.
   - If the user's title is already good, keep it with minor polishing.
   - If the title is vague, rewrite it based on the description.
   - If both title and description are vague, use "General Task".

3. DESCRIPTION MUST BE ACTIONABLE
   - The description must be written as DIRECT TASK INSTRUCTIONS.
   - Tell the developer/team member what needs to be done.
   - Focus on actions, requirements, changes, and expected results.
   - Do NOT simply explain what the task is about.
   - Do NOT describe what the AI is doing.
   - Do NOT use generic project-summary language.

   Avoid phrases like:
   "This task focuses on..."
   "This task aims to..."
   "This task is about..."
   "The goal of this task is..."
   "This will help..."
   "We are going to..."
   "We're building..."

   Prefer direct instruction language such as:
   "Implement..."
   "Add..."
   "Update..."
   "Fix..."
   "Create..."
   "Remove..."
   "Change..."
   "Improve..."
   "Make sure..."
   "Ensure..."
   "Verify..."

4. EXISTING DESCRIPTION — ENHANCE VS GENERATE
   - If EXISTING description contains meaningful information:
     • Convert it into clear, actionable instructions.
     • Preserve the user's original intent, requirements, and technical details.
     • Fix grammar.
     • Remove repetition.
     • Make the instructions clearer.
     • Do NOT invent requirements that the user did not mention.
   - If NO existing description OR it is too short/vague:
     • Generate a fresh actionable description based on the task title.
     • Only include requirements that can reasonably be inferred from the title.
     • Do not invent specific technologies, APIs, tools, screens, or functionality unless provided by the user.

5. DESCRIPTION STRUCTURE
   The description should naturally cover:

   - What needs to be changed or implemented.
   - What specific part/behavior should be handled.
   - Any important requirement or expected behavior.
   - What should be considered "done".

   Example:

   "Update the login flow to handle failed authentication attempts correctly. Show a clear error message when the credentials are invalid and keep the user on the login screen without resetting the entered email. Make sure successful login still redirects to the dashboard as expected."

6. ACCEPTANCE / DONE CONDITION
   - End with a practical expected outcome whenever enough information is available.
   - Use phrases like:
     "Make sure..."
     "The final result should..."
     "Verify that..."
     "Ensure that..."
   - Do not create artificial acceptance criteria if the input does not provide enough information.

7. LENGTH
   - 2-4 sentences.
   - Roughly 40-100 words.
   - One clean paragraph.
   - No line breaks inside the description.
   - NO markdown.
   - NO bullets.
   - NO headings.
   - NO emojis.

8. DO NOT INVENT DETAILS
   - Never invent specific APIs, libraries, frameworks, database changes, UI elements, user roles, deadlines, metrics, or business requirements.
   - If the user mentions React, API, dashboard, login, UI, etc., you may use those details.
   - If the user does not mention them, keep the instructions general.

═══════════════════════════════════════
IMPORTANT DISTINCTION
═══════════════════════════════════════

The description must NOT primarily answer:

"What is this task?"

It MUST answer:

"What should the developer/team member DO?"

❌ BAD:
"This task focuses on improving the login experience and making authentication more reliable."

✅ GOOD:
"Update the login flow to handle authentication errors correctly. Show a clear message when login fails and make sure the user can retry without losing the entered information. Verify that successful authentication still takes the user to the expected screen."

───────────────────────────────────────

❌ BAD:
"This task is about improving the task management UI."

✅ GOOD:
"Update the task management UI to make task information easier to scan and interact with. Improve the layout, spacing, and visual hierarchy while keeping the existing task functionality intact. Make sure the updated UI remains consistent across the available task views."

───────────────────────────────────────

❌ BAD:
"We are building a password reset feature for users."

✅ GOOD:
"Add a password reset option to the login screen. Allow users to request a reset link and set a new password through the reset flow. Make sure invalid or expired reset links are handled clearly and that the user can successfully log in with the new password."

═══════════════════════════════════════
STYLE EXAMPLES
═══════════════════════════════════════

❌ BAD DESCRIPTION:
"Improve the dashboard experience for users."

✅ GOOD DESCRIPTION:
"Update the dashboard layout to make the most important project information easier to find. Improve the structure and visual hierarchy while keeping the existing functionality intact. Remove unnecessary clutter where possible and make sure the final layout is clear and easy to scan."

───────────────────────────────────────

❌ BAD DESCRIPTION:
"This task aims to fix the task creation functionality."

✅ GOOD DESCRIPTION:
"Fix the task creation flow so new tasks can be submitted successfully with the required information. Validate the required fields and handle submission errors with clear feedback. Make sure successfully created tasks appear correctly in the task list after submission."

───────────────────────────────────────

❌ BAD DESCRIPTION:
"The task is to add a new UI for the project details."

✅ GOOD DESCRIPTION:
"Create the project details UI and organize the available project information into clear sections. Keep the layout simple and make important details easy to find. Make sure the new UI fits consistently with the existing application design."

═══════════════════════════════════════
VAGUE INPUT
═══════════════════════════════════════

If BOTH title and description are vague (e.g. "test", "abc", "asdf"):

Title:
"General Task"

Description:
"Define the task scope and clarify the specific work that needs to be completed before implementation begins. Document the required changes and expected outcome so the team has clear direction. Make sure the final requirements are specific enough to start the work without unnecessary assumptions."

Set "confidence" to "low".

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Respond ONLY with valid JSON, no extra text:

{
  "title": "the polished task title",
  "description": "the actionable task instructions",
  "mode": "enhanced" | "generated",
  "tone": "professional" | "technical" | "creative",
  "confidence": "high" | "medium" | "low"
}`;
// ============ PROJECT TITLE + DESCRIPTION GENERATOR ============
const PROJECT_TITLE_DESCRIPTION_PROMPT = `You are a seasoned project lead who writes project briefs as clear, practical project instructions for a real development/design team. The description should tell the team WHAT NEEDS TO BE DONE and WHAT THE EXPECTED OUTCOME IS — not explain what the AI is doing or describe the project in a generic way.

You will receive:
- A PROJECT TITLE (may be short, rough, or even a rough idea)
- An optional EXISTING description (may be empty, rough notes, or a partial draft)

Your job: produce a polished PROJECT TITLE and a clear, actionable DESCRIPTION that gives the team practical instructions for the project.

═══════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════

1. LANGUAGE & TONE
   - Write like an experienced project lead giving clear instructions to a team.
   - Be direct, practical, and easy to understand.
   - Do not sound like an AI explaining the project.
   - Do not describe what you are doing as an assistant.
   - Avoid corporate buzzwords such as "leverage", "synergy", "robust", "cutting-edge", "seamless", "holistic", "paradigm", "best-in-class", "state-of-the-art", "empower", "unlock", "streamline" unless truly necessary.
   - Avoid marketing language and unnecessary filler.
   - Use plain English and clear action-oriented sentences.

2. TITLE RULES
   - Keep it short and scannable — 3 to 7 words maximum.
   - Use Title Case.
   - No trailing punctuation, emojis, or quotes.
   - Make it specific and meaningful.
   - If the user's title is already good, keep it with only minor polishing.
   - If the title is vague, rewrite it based on the description.
   - If both are vague, use "New Project Initiative".
   - Do NOT include dates, version numbers, or "Project:" prefix.

3. DESCRIPTION RULES
   - The description must be written as PROJECT INSTRUCTIONS.
   - Tell the team what needs to be done, what areas need attention, and what the expected result should be.
   - Focus on ACTIONS and EXPECTATIONS, not on explaining what the project is.
   - Do NOT write phrases such as:
     "This project focuses on..."
     "This project aims to..."
     "We're building..."
     "The project is about..."
     "This will help..."
     "The goal of this project is..."
   - Instead, use direct instruction language such as:
     "Implement..."
     "Update..."
     "Design..."
     "Improve..."
     "Add..."
     "Create..."
     "Make sure..."
     "Ensure..."
     "The final result should..."
   - If the user provides specific features, requirements, or instructions, preserve them.
   - Do NOT invent features, tools, technologies, or requirements that the user did not mention.
   - Keep the instructions practical enough that a team member can understand what needs to be done.
   - End with a clear expected outcome or acceptance expectation.
   - Length: 3-5 sentences, roughly 70-150 words.
   - One clean paragraph.
   - No line breaks inside the paragraph.
   - NO markdown, NO bullets, NO headings, NO emojis.

4. EXISTING DESCRIPTION — ENHANCE VS GENERATE
   - If EXISTING description contains meaningful requirements:
     • Convert it into clear, actionable project instructions.
     • Keep the user's original intent, features, and specifics intact.
     • Fix grammar and remove repetition.
     • Make unclear statements more direct where possible.
     • Do NOT add requirements that were not provided.
   - If NO existing description OR it is too short/vague/placeholder:
     • Generate practical instructions based only on the project title.
     • Keep the instructions general enough to avoid inventing specific features.
     • Explain what should be implemented, reviewed, improved, or prepared based on the available context.

5. DESCRIPTION STYLE
   The description should answer these questions naturally:
   - What needs to be done?
   - What areas/features should be worked on?
   - What should be checked or improved?
   - What should the final result look like?

   Example structure:
   "Implement [main requirement]. Update [specific area] to support [required behavior]. Make sure [important requirement/quality expectation]. The final result should be clear, functional, and ready for use."

6. VAGUE INPUT
   If BOTH title and description are vague (e.g. "test", "abc", "asdf"):
   - Title: "New Project Initiative"
   - Description: "Define the project scope, clarify the main requirements, and identify the key work needed before implementation begins. Document the expected functionality and any important constraints so the team has clear direction. Make sure the final scope is specific enough to begin development without unnecessary assumptions."
   - Set "confidence" to "low".

═══════════════════════════════════════
STYLE EXAMPLES
═══════════════════════════════════════

❌ BAD DESCRIPTION:
"This project focuses on redesigning the customer onboarding experience to reduce drop-off and improve engagement."

Why bad:
- Explains the project instead of giving instructions.
- Does not clearly tell the team what to do.

✅ GOOD DESCRIPTION:
"Redesign the customer onboarding flow to make signup and first-time setup easier to complete. Simplify the signup steps, improve the walkthrough, and make the in-app instructions clearer. Review the flow for unnecessary steps and confusing interactions. The final experience should be simple, consistent, and easy for new users to complete without additional help."

❌ BAD DESCRIPTION:
"We're building a mobile companion app that lets customers track orders, manage returns, and reach support."

Why bad:
- Describes what is being built.
- Does not provide actionable instructions.

✅ GOOD DESCRIPTION:
"Create the mobile experience for order tracking and return management. Implement clear tracking information, an easy return flow, and straightforward navigation between the main customer actions. Keep the experience simple and make sure important order and return information is easy to find. The final result should allow customers to complete these tasks without needing to use the website."

❌ BAD DESCRIPTION:
"The project aims to improve the dashboard and provide a better user experience."

Why bad:
- Too generic.
- No actionable instructions.

✅ GOOD DESCRIPTION:
"Update the dashboard layout to make important project information easier to find and understand. Improve the structure, spacing, and visual hierarchy while keeping the existing functionality intact. Review the main sections and remove unnecessary visual clutter where possible. The final dashboard should feel organized, consistent, and easy to use."

═══════════════════════════════════════
IMPORTANT DISTINCTION
═══════════════════════════════════════

The DESCRIPTION must NOT answer:
"What is this project doing?"

It MUST answer:
"What does the team need to do?"

Always prefer:

❌ "This project focuses on improving the task management experience."

over:

✅ "Improve the task management experience by updating the task creation flow, refining the task UI, and making task details easier to understand. Review the existing interactions and remove unnecessary steps. Keep the existing functionality intact while improving usability and consistency. The final experience should be clear, efficient, and easy for users to work with."

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Respond ONLY with valid JSON, no extra text:

{
  "title": "the polished project title",
  "description": "the actionable project instructions",
  "mode": "enhanced" | "generated",
  "tone": "professional" | "technical" | "creative",
  "confidence": "high" | "medium" | "low"
}`;
/**
 * Generate or enhance a project title AND description.
 */
export async function suggestProjectTitleAndDescription(projectTitle, existingDescription = "") {
  if (!projectTitle || !projectTitle.trim()) {
    throw new Error("Project title is required to generate content");
  }

  const trimmedTitle = projectTitle.trim();
  const trimmedExisting = (existingDescription || "").trim();

  const userContent = `Project title: "${trimmedTitle}"

${trimmedExisting
      ? `Existing description (enhance this if meaningful, keep the user's intent):\n"""\n${trimmedExisting}\n"""`
      : `Existing description: (none provided — generate fresh)`
    }`;

  const result = await callGroqAPI(PROJECT_TITLE_DESCRIPTION_PROMPT, userContent);

  if (!result?.description) {
    throw new Error("AI did not return a description. Try again.");
  }

  return {
    title: (result.title || trimmedTitle).trim(),
    description: result.description.trim(),
    mode: result.mode || (trimmedExisting ? "enhanced" : "generated"),
    tone: result.tone || "professional",
    confidence: result.confidence || "medium",
  };
}

/**
 * Backward-compatible alias — returns only description for project.
 */
export async function suggestProjectDescription(projectName, existingDescription = "") {
  const result = await suggestProjectTitleAndDescription(projectName, existingDescription);
  return {
    description: result.description,
    mode: result.mode,
    tone: result.tone,
  };
}

/**
 * Generate or enhance a task title AND description.
 */
export async function suggestTaskTitleAndDescription(taskTitle, existingDescription = "") {
  if (!taskTitle || !taskTitle.trim()) {
    throw new Error("Task title is required to generate content");
  }

  const trimmedTitle = taskTitle.trim();
  const trimmedExisting = (existingDescription || "").trim();

  const userContent = `Task title: "${trimmedTitle}"

${trimmedExisting
      ? `Existing description (enhance this if meaningful, keep the user's intent):\n"""\n${trimmedExisting}\n"""`
      : `Existing description: (none provided — generate fresh)`
    }`;

  const result = await callGroqAPI(TASK_TITLE_DESCRIPTION_PROMPT, userContent);

  if (!result?.description) {
    throw new Error("AI did not return a description. Try again.");
  }

  return {
    title: (result.title || trimmedTitle).trim(),
    description: result.description.trim(),
    mode: result.mode || (trimmedExisting ? "enhanced" : "generated"),
    tone: result.tone || "professional",
    confidence: result.confidence || "medium",
  };
}

/**
 * Backward-compatible alias — returns only description for task.
 */
export async function suggestTaskDescription(taskName, existingDescription = "") {
  const result = await suggestTaskTitleAndDescription(taskName, existingDescription);
  return {
    description: result.description,
    mode: result.mode,
    tone: result.tone,
  };
}

// ============ SYSTEM PROMPTS ============

const SYSTEM_PROMPT = `You are an intent parser for a project/report admin panel automation tool.
Given a natural-language command from an admin, respond with ONLY a JSON object (no markdown, no prose) matching this shape:

{
  "action": "create" | "update" | "delete" | "get" | "unknown",
  "entity": "project" | "report" | "task" | "unknown",
  "target": {
    "id": string | null,
    "name": string | null
  },
  "fields": { [key: string]: any },
  "summary": "one short human-readable sentence describing exactly what will happen",
  "confidence": number
}

Rules:
- "target.name" is the human-readable project name mentioned (e.g. "Website Redesign"), used to look it up if no id is known.
- "fields" only contains what should be created/updated. Examples:
  - project update: { "status": "completed" } — "status" MUST be exactly one of: ${VALID_STATUSES.join(", ")}. Map casual language to the closest valid value (e.g. "delayed"/"stuck"/"blocked" → "on_hold", "done"/"finished" → "completed", "cancel it" → "cancelled").
  - report create: { "title": "...", "content": "..." } — ALWAYS include both. If the admin didn't dictate the body, write a short (2-4 sentence) plausible report body yourself based on what they described (e.g. a "weekly progress" report should read like a brief status update). Never leave "content" empty or omit it.
  - task create: { "title": "...", "status": "todo", "project_id": null } (project_id gets filled in from target automatically, you don't need to resolve it)
  - task update/delete: include "taskId" in fields if the command mentions a specific task
- If the command is ambiguous or not related to projects/reports/tasks, set action to "unknown" and explain why in "summary".
- confidence is 0 to 1, how sure you are of this parse.
- Output raw JSON only. No backticks, no extra text.`;

const STATUS_SUGGESTION_PROMPT = `You are a project status analyzer. Your job is to read a project report and infer the project's current health/status.

CRITICAL RULES:
1. The status MUST be exactly one of: ${VALID_STATUSES.join(", ")}
2. Do NOT invent any status value outside this list
3. Analyze the entire report holistically — look for progress, blockers, risks, and timeline mentions
4. If the text is too short/vague (like just a single word "status" or random chatter), respond with status: null
5. Only return null if it's genuinely not a report — actual short reports should still get analyzed

Respond ONLY with JSON:
{
  "status": "${VALID_STATUSES.join('" | "')}",
  "reason": "one short sentence explaining your choice",
  "confidence": number between 0 and 1,
  "analysis": "brief one-liner about key factors (progress, risks, blockers if any)"
}

Analysis hints:
- On track + no risks → "in_progress" or "active"
- Behind schedule, stuck, blocked → "on_hold"
- Code review stage → "review"
- Testing/ready to ship → "in_progress"
- Done/shipped/archived → "completed"
- Project cancelled → "cancelled"
- Awaiting stakeholder decision → "review"

If you genuinely cannot tell from the report, still make your best guess and set confidence lower (0.4-0.6).`;

const RISK_DETECTION_PROMPT = `You are a project risk analyst. Analyze this report for risks, blockers, delays, or red flags.

Respond ONLY with JSON:
{
  "hasRisk": boolean,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "risks": ["risk 1", "risk 2"],
  "blockers": ["blocker 1", "blocker 2"],
  "recommendation": "one sentence action to take"
}`;

const TEAM_HEALTH_PROMPT = `You are a team dynamics analyzer. Read this report and assess team morale and workload.

Respond ONLY with JSON:
{
  "morale": "low" | "medium" | "high",
  "workloadStatus": "understaffed" | "balanced" | "overloaded",
  "concerns": ["concern 1", "concern 2"]
}`;

const MILESTONE_PROMPT = `You are a milestone tracker. Extract progress toward milestones from this report.

Respond ONLY with JSON:
{
  "completionPercentage": number (0-100),
  "milestonesCompleted": ["milestone 1"],
  "milestonesAtRisk": ["milestone 2"],
  "estimatedDelay": "days" | null
}`;

// ============ EXPORTED FUNCTIONS ============

/**
 * Parse a natural-language command into a structured intent
 */
export async function parseCommand(command, context = []) {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Missing Groq API key. Set VITE_GROQ_API_KEY or REACT_APP_GROQ_API_KEY"
    );
  }

  const contextNote =
    context.length > 0
      ? `\n\nKnown records for name-resolution:\n${JSON.stringify(context)}`
      : "";

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextNote },
        { role: "user", content: command },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("AI returned an unparsable response. Try rephrasing your command.");
  }
}

/**
 * Analyze a report and suggest a project status
 */
export async function suggestStatusFromReport(reportContent) {
  const trimmed = reportContent.trim();
  if (!trimmed) {
    return {
      status: null,
      reason: "Report is empty",
      confidence: 0,
      analysis: "Please paste actual report content"
    };
  }

  if (trimmed.length < 10 || /^(status|test|hello|hi|ok|yes|no)$/i.test(trimmed)) {
    return {
      status: null,
      reason: "Text is too short or generic to analyze as a report",
      confidence: 0,
      analysis: "Paste actual report content (e.g., 'This week we completed X, faced Y blocker, and Z is on track')"
    };
  }

  try {
    return await callGroqAPI(STATUS_SUGGESTION_PROMPT, reportContent);
  } catch (err) {
    throw new Error(`Status analysis failed: ${err.message}`);
  }
}

/**
 * Detect risks and blockers in a report
 */
export async function detectRisksFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(RISK_DETECTION_PROMPT, reportContent);
}

/**
 * Assess team health from a report
 */
export async function analyzeTeamHealthFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(TEAM_HEALTH_PROMPT, reportContent);
}

/**
 * Extract milestone progress from a report
 */
export async function extractMilestoneProgressFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(MILESTONE_PROMPT, reportContent);
}

/**
 * Comprehensive report analysis (all insights at once)
 */
export async function analyzeReportComprehensive(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }

  const [status, risks, team, milestones] = await Promise.all([
    suggestStatusFromReport(reportContent),
    detectRisksFromReport(reportContent),
    analyzeTeamHealthFromReport(reportContent),
    extractMilestoneProgressFromReport(reportContent),
  ]);

  return {
    status,
    risks,
    team,
    milestones,
    timestamp: new Date().toISOString(),
  };
}

export { VALID_STATUSES };

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

// ============ HELPER FUNCTIONS ============

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

// ============ EXPORTED FUNCTIONS ============

/**
 * Parse a natural-language command into a structured intent
 * @param {string} command - e.g. "mark Project Alpha as completed"
 * @param {Array<{id:string,name:string}>} context - known projects for name resolution
 * @returns {Promise<object>} intent object with action, entity, target, fields, etc
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
 * @param {string} reportContent - the full report text
 * @returns {Promise<{status: string | null, reason: string, confidence: number, analysis: string}>}
 */
export async function suggestStatusFromReport(reportContent) {
  // Validation: check if content is too short/empty
  const trimmed = reportContent.trim();
  if (!trimmed) {
    return {
      status: null,
      reason: "Report is empty",
      confidence: 0,
      analysis: "Please paste actual report content"
    };
  }

  // Check for obviously non-report content (single word, generic placeholders)
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
 * @param {string} reportContent
 * @returns {Promise<{hasRisk: boolean, riskLevel: string, risks: string[], blockers: string[], recommendation: string}>}
 */
export async function detectRisksFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(RISK_DETECTION_PROMPT, reportContent);
}

/**
 * Assess team health from a report
 * @param {string} reportContent
 * @returns {Promise<{morale: string, workloadStatus: string, concerns: string[]}>}
 */
export async function analyzeTeamHealthFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(TEAM_HEALTH_PROMPT, reportContent);
}

/**
 * Extract milestone progress from a report
 * @param {string} reportContent
 * @returns {Promise<{completionPercentage: number, milestonesCompleted: string[], milestonesAtRisk: string[], estimatedDelay: string | null}>}
 */
export async function extractMilestoneProgressFromReport(reportContent) {
  if (!reportContent.trim()) {
    throw new Error("Report content is empty");
  }
  return await callGroqAPI(MILESTONE_PROMPT, reportContent);
}

/**
 * Comprehensive report analysis (all insights at once)
 * @param {string} reportContent
 * @returns {Promise<object>} combined insights from status, risks, team, and milestones
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
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

const TASK_TITLE_DESCRIPTION_PROMPT = `You are a seasoned team lead who writes task briefs the way an experienced human would — clear, practical, and direct. Not corporate. Not robotic. Not marketing fluff.

You will receive:
- A TASK TITLE (may be short, rough, or just a rough idea)
- An optional EXISTING description (may be empty, rough notes, or a partial draft)

Your job: produce a polished TASK TITLE and a clear, actionable DESCRIPTION that a developer or team member would actually want to read.

═══════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════

1. LANGUAGE & TONE
   - Write like a competent human, not like an AI.
   - Avoid buzzwords: "leverage", "synergy", "robust", "cutting-edge", "seamless", "holistic", "paradigm", "best-in-class", "empower", "unlock", "streamline".
   - Use plain English. Short sentences. Direct and useful.
   - Clear but not cold. Practical but not dry.

2. TITLE RULES
   - Keep it short and scannable — 3 to 8 words maximum.
   - Use Title Case.
   - Start with an action verb when possible: "Add", "Fix", "Refactor", "Update", "Build", "Remove".
   - No trailing punctuation, no emojis, no quotes, no "Task:" prefix.
   - If the user's title is already good, keep it (maybe minor polish).
   - If vague (e.g. "test", "fix", "abc"), rewrite it based on the description. If both are vague, generate something sensible based on context or use "General Task".

3. DESCRIPTION RULES (ENHANCE vs GENERATE)
   - If EXISTING description is meaningful (real content, not "test" or "asdf"):
     • ENHANCE it. Keep the user's intent, requirements, and specifics intact.
     • Fix grammar, tighten wording, remove repetition.
     • Do NOT invent requirements the user didn't mention.
   - If NO existing description OR it's too short/vague:
     • GENERATE a fresh, actionable description based on the title.
     • Focus on: what needs to be done, why it matters, and what "done" looks like.
   - Length: 2-4 sentences, roughly 40-100 words.
   - One clean paragraph. No line breaks inside.
   - NO markdown, NO bullets, NO headings, NO emojis.

4. WHAT TO INCLUDE IN DESCRIPTION
   - Start naturally — with the goal or the problem being solved.
   - Be specific about what needs to be done.
   - Mention acceptance criteria or the outcome in plain terms.
   - Do NOT mention specific deadlines or team member names.

5. IF BOTH TITLE AND DESCRIPTION ARE VAGUE (e.g. "test", "abc", "asdf")
   - Title: "General Task"
   - Description: "Details for this task are still being defined. Once the scope is clear, this section will outline what needs to be done and what a successful outcome looks like."
   - Set "confidence" to "low".

═══════════════════════════════════════
STYLE EXAMPLES
═══════════════════════════════════════

❌ BAD TITLE: "Fix the issue related to authentication flow in the login component"
✅ GOOD TITLE: "Fix Login Redirect Loop"

❌ BAD TITLE: "test"
✅ GOOD TITLE: "Add Password Reset Flow"

❌ BAD DESCRIPTION (robotic):
"Leverage modern best practices to seamlessly integrate a robust authentication flow ensuring optimal user experience."

✅ GOOD DESCRIPTION (human):
"Users are getting stuck in a redirect loop when they log in from the mobile web view. The session token isn't persisting across the navigation boundary. Fix the token storage so users land on the dashboard as expected, and add a regression test so this doesn't break again."

❌ BAD DESCRIPTION (vague):
"Improve the app and make it better."

✅ GOOD DESCRIPTION (specific):
"Add a password reset option to the login screen so users can recover access without contacting support. The flow should send a reset link by email, let the user set a new password, and invalidate old sessions. Success means users can complete the reset in under a minute."

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Respond ONLY with valid JSON, no extra text:

{
  "title": "the polished task title",
  "description": "the final polished paragraph",
  "mode": "enhanced" | "generated",
  "tone": "professional" | "technical" | "creative",
  "confidence": "high" | "medium" | "low"
}`;

/**
 * Generate or enhance a TASK title AND description.
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

// ============ PROJECT TITLE + DESCRIPTION GENERATOR ============

const PROJECT_TITLE_DESCRIPTION_PROMPT = `You are a seasoned project lead who writes project briefs the way an experienced human would — clear, warm, and direct. Not corporate. Not robotic. Not marketing fluff.

You will receive:
- A PROJECT TITLE (may be short, rough, or even a rough idea)
- An optional EXISTING description (may be empty, rough notes, or a partial draft)

Your job: produce a polished PROJECT TITLE and a clear, natural DESCRIPTION that a real team member would actually want to read.

═══════════════════════════════════════
CRITICAL RULES
═══════════════════════════════════════

1. LANGUAGE & TONE
   - Write like a competent human, not like an AI.
   - Avoid buzzwords: "leverage", "synergy", "robust", "cutting-edge", "seamless", "holistic", "paradigm", "best-in-class", "state-of-the-art", "empower", "unlock", "streamline" (unless truly fitting).
   - Avoid clichés: "in today's fast-paced world", "at the end of the day", "game-changer".
   - Use plain English. Short sentences. Natural rhythm.
   - Confident but not boastful. Clear but not cold.

2. TITLE RULES
   - Keep it short and scannable — 3 to 7 words maximum.
   - Use Title Case (capitalize major words).
   - No trailing punctuation, no emojis, no quotes.
   - Make it specific enough to be meaningful, but not overly long.
   - If the user's title is already good, keep it (maybe minor polish).
   - If the user's title is vague (e.g. "test", "project", "abc"), rewrite it based on what the description suggests. If both are vague, generate a sensible generic title like "New Project Initiative".
   - Do NOT include dates, version numbers, or "Project:" prefix.

3. DESCRIPTION RULES (ENHANCE vs GENERATE)
   - If EXISTING description is meaningful (real content, not "test" or "asdf"):
     • ENHANCE it. Keep the user's intent, features, and specifics intact.
     • Fix grammar, tighten wording, remove repetition.
     • Do NOT invent features the user didn't mention.
   - If NO existing description OR it's too short/vague/placeholder:
     • GENERATE a fresh, sensible description based on the title.
     • Focus on: what we're building, why it matters, what success looks like.
   - Length: 3-5 sentences, roughly 70-150 words.
   - One clean paragraph. No line breaks inside the paragraph.
   - NO markdown, NO bullets, NO headings, NO emojis.

4. WHAT TO INCLUDE IN DESCRIPTION
   - Start naturally — sometimes with the goal, sometimes with the problem, sometimes with what's being built. Vary the opening.
   - Mention 1-3 concrete deliverables or focus areas (only if relevant).
   - End with what a successful outcome looks like (in plain terms).
   - Do NOT mention specific dates, deadlines, or team member names.
   - Do NOT invent specific tools (Figma, React, AWS) unless the user named them.

5. IF BOTH TITLE AND DESCRIPTION ARE VAGUE (e.g. "test", "abc", "asdf")
   - Title: "New Project Initiative"
   - Description: "Details for this project are still being defined. Once the scope is clear, this section will outline the goals, key deliverables, and what success looks like."
   - Set "confidence" to "low".

═══════════════════════════════════════
STYLE EXAMPLES
═══════════════════════════════════════

❌ BAD TITLE: "Redesign of the Official Company Website and Its Various Sub-pages"
✅ GOOD TITLE: "Website Redesign"

❌ BAD TITLE: "test"
✅ GOOD TITLE: "Customer Onboarding Revamp"

❌ BAD DESCRIPTION (robotic):
"Leverage cutting-edge synergies to streamline holistic deliverables and empower stakeholders with seamless, robust solutions."

✅ GOOD DESCRIPTION (human):
"This project focuses on redesigning the customer onboarding experience to reduce drop-off and improve first-week engagement. The main deliverables include a simplified signup flow, a guided walkthrough, and clearer in-app messaging. Success means more users reaching their first meaningful action within 24 hours of signing up."

❌ BAD DESCRIPTION (vague):
"This project aims to deliver value and achieve goals in an efficient manner."

✅ GOOD DESCRIPTION (specific):
"We're building a mobile companion app that lets customers track orders, manage returns, and reach support without opening the website. The first release covers the tracking and returns flows, with support chat planned for a later phase. The goal is to reduce support tickets and give repeat customers a faster way to self-serve."

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Respond ONLY with valid JSON, no extra text:

{
  "title": "the polished project title",
  "description": "the final polished paragraph",
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
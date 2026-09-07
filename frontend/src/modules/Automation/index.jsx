import React, { useEffect, useMemo, useState } from "react";
import { projectsAPI, reportsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";
import {
  parseCommand,
  suggestStatusFromReport,
  detectRisksFromReport,
  analyzeTeamHealthFromReport,
  extractMilestoneProgressFromReport,
  VALID_STATUSES,
} from "../../api/groqAPI";

/**
 * Automation Component
 * 
 * Three AI-powered features:
 * 1) Command Bar — natural language instructions
 * 2) Report → Status Suggestion — AI infers project status from report
 * 3) Advanced Report Analysis — risks, team health, milestones
 */

function getProjectName(p) {
  return p?.name || p?.title || p?.summary || p?.description || "";
}

function getProjectId(p) {
  return p?.id ?? p?._id;
}

export const Automation = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // ---- command bar state ----
  const [command, setCommand] = useState("");
  const [parsing, setParsing] = useState(false);
  const [intent, setIntent] = useState(null);
  const [commandError, setCommandError] = useState("");
  const [executing, setExecuting] = useState(false);

  // ---- status suggestion state ----
  const [statusProjectId, setStatusProjectId] = useState("");
  const [reportText, setReportText] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestError, setSuggestError] = useState("");
  const [applyingStatus, setApplyingStatus] = useState(false);
  const [reportValid, setReportValid] = useState(false);

  // ---- advanced analysis state ----
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedReport, setAdvancedReport] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  // ---- activity log ----
  const [history, setHistory] = useState([]);
  const [projectsLoadError, setProjectsLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsAPI.getAll();
        const list = extractProjectList(res);
        if (list === null) {
          console.warn("[Automation] Unrecognized projectsAPI.getAll() response:", res);
          setProjectsLoadError(
            "API responded but couldn't find projects array. Check browser console (F12)."
          );
          setProjects([]);
        } else {
          setProjects(list);
        }
      } catch (e) {
        console.error("Failed to load projects for automation context", e);
        setProjectsLoadError(
          typeof e === "string" ? e : e?.message || "Couldn't load your projects."
        );
      } finally {
        setProjectsLoading(false);
      }
    })();
  }, []);

  function extractProjectList(res) {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.projects)) return res.data.projects;
    if (Array.isArray(res?.projects)) return res.projects;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return null;
  }

  const projectContext = useMemo(
    () => projects.map((p) => ({ id: getProjectId(p), name: getProjectName(p) })),
    [projects]
  );

  const commandHints = useMemo(() => {
    const names = projectContext.map((p) => p.name).filter(Boolean);
    if (names.length === 0) {
      return projectsLoading
        ? ["Loading your projects…"]
        : ["No projects found yet — create one first"];
    }
    return [
      `mark ${names[0]} as completed`,
      `create a report for ${names[0]} about weekly progress`,
      `update ${names[1] || names[0]} status to delayed`,
    ];
  }, [projectContext, projectsLoading]);

  // Validate report content
  useEffect(() => {
    const trimmed = reportText.trim();
    const isValid = trimmed.length >= 10 && !/^(status|test|hello|hi|ok|yes|no)$/i.test(trimmed);
    setReportValid(isValid);
  }, [reportText]);

  function pushHistory(entry) {
    setHistory((h) =>
      [{ ...entry, time: new Date().toLocaleTimeString() }, ...h].slice(0, 12)
    );
  }

  // ============ COMMAND BAR ============

  async function handleParse(e) {
    e.preventDefault();
    if (!command.trim()) return;
    setParsing(true);
    setCommandError("");
    setIntent(null);
    try {
      const result = await parseCommand(command.trim(), projectContext);
      if (result.action === "unknown" || result.entity === "unknown") {
        setCommandError(result.summary || "Couldn't understand that command — try rephrasing.");
      } else {
        setIntent(result);
      }
    } catch (err) {
      setCommandError(err.message || "Something went wrong parsing that command.");
    } finally {
      setParsing(false);
    }
  }

  function resolveTargetId(target) {
    if (target?.id) return target.id;
    if (target?.name) {
      const match = projects.find(
        (p) => getProjectName(p).toLowerCase() === target.name.toLowerCase()
      );
      return match ? getProjectId(match) : null;
    }
    return null;
  }

  async function handleExecute() {
    if (!intent) return;
    setExecuting(true);
    setCommandError("");
    try {
      const { action, entity, fields } = intent;
      const targetId = resolveTargetId(intent.target);

      if (entity === "project") {
        if (action === "create") {
          const created = await projectsAPI.create(fields);
          pushHistory({ label: `Created project "${fields.name || fields.title}"`, ok: true });
          setProjects((p) => [...p, created]);
        } else if (action === "update") {
          if (!targetId) throw new Error(`Couldn't find project "${intent.target?.name}".`);
          await projectsAPI.update(targetId, fields);
          pushHistory({ label: `Updated project "${intent.target?.name}"`, ok: true });
        } else if (action === "delete") {
          if (!targetId) throw new Error(`Couldn't find project "${intent.target?.name}".`);
          await projectsAPI.delete(targetId);
          pushHistory({ label: `Deleted project "${intent.target?.name}"`, ok: true });
          setProjects((p) => p.filter((x) => getProjectId(x) !== targetId));
        }
      } else if (entity === "report") {
        if (!targetId) throw new Error(`Couldn't find which project this report belongs to.`);
        if (action === "create") {
          const reportFields = {
            ...fields,
            content: fields.content?.trim() || `Report: ${fields.title || intent.summary}`,
          };
          await reportsAPI.create(targetId, reportFields);
          pushHistory({ label: `Created report for "${intent.target?.name}"`, ok: true });
        } else if (action === "delete") {
          if (!fields?.reportId) throw new Error("Missing report id to delete.");
          await reportsAPI.delete(targetId, fields.reportId);
          pushHistory({ label: `Deleted report from "${intent.target?.name}"`, ok: true });
        }
      } else if (entity === "task") {
        if (action === "create") {
          const payload = targetId ? { ...fields, project_id: targetId } : fields;
          await tasksAPI.create(payload);
          pushHistory({ label: `Created task "${fields.title || fields.name}"`, ok: true });
        } else if (action === "update") {
          if (!fields?.taskId) throw new Error("Missing task id to update.");
          const { taskId, ...rest } = fields;
          await tasksAPI.update(taskId, rest);
          pushHistory({ label: `Updated task "${intent.target?.name || taskId}"`, ok: true });
        } else if (action === "delete") {
          if (!fields?.taskId) throw new Error("Missing task id to delete.");
          await tasksAPI.delete(fields.taskId);
          pushHistory({ label: `Deleted task "${intent.target?.name || fields.taskId}"`, ok: true });
        }
      }

      setCommand("");
      setIntent(null);
    } catch (err) {
      setCommandError(err.message || "Execution failed.");
      pushHistory({ label: intent.summary || "Automation action", ok: false });
    } finally {
      setExecuting(false);
    }
  }

  // ============ STATUS SUGGESTION ============

  async function handleSuggestStatus(e) {
    e.preventDefault();
    if (!reportText.trim()) return;
    setSuggesting(true);
    setSuggestError("");
    setSuggestion(null);
    try {
      const result = await suggestStatusFromReport(reportText.trim());
      setSuggestion(result);
    } catch (err) {
      setSuggestError(err.message || "Couldn't analyze that report.");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleApplyStatus() {
    if (!suggestion || !statusProjectId) return;
    setApplyingStatus(true);
    try {
      await projectsAPI.update(statusProjectId, { status: suggestion.status });
      const proj = projects.find((p) => getProjectId(p) === statusProjectId);
      pushHistory({
        label: `Set "${proj ? getProjectName(proj) : "project"}" status → ${suggestion.status}`,
        ok: true,
      });
      setSuggestion(null);
      setReportText("");
    } catch (err) {
      pushHistory({ label: "Status update failed", ok: false });
    } finally {
      setApplyingStatus(false);
    }
  }

  // ============ ADVANCED ANALYSIS ============

  async function handleAdvancedAnalysis(e) {
    e.preventDefault();
    if (!advancedReport.trim()) return;
    setAnalyzing(true);
    setAnalysisError("");
    setAnalysis(null);
    try {
      const risks = await detectRisksFromReport(advancedReport.trim());
      const team = await analyzeTeamHealthFromReport(advancedReport.trim());
      const milestones = await extractMilestoneProgressFromReport(advancedReport.trim());
      setAnalysis({ risks, team, milestones });
    } catch (err) {
      setAnalysisError(err.message || "Couldn't analyze that report.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="auto-wrap">
      <style>{`
        .auto-wrap{ font-family:'Segoe UI', system-ui, sans-serif; max-width:920px; margin:0 auto; padding:12px 20px; color:#1a1f1c; }
        .auto-header{ margin-bottom:28px; }
        .auto-header h1{ font-size:26px; font-weight:700; letter-spacing:-0.01em; margin:0 0 4px; color:#0e2a1c; }
        .auto-header p{ color:#657268; font-size:14px; margin:0; }

        .auto-card{
          background:#fff; border:1px solid #e6ebe7; border-radius:16px;
          padding:22px 24px; margin-bottom:20px;
          box-shadow:0 1px 2px rgba(16,24,20,0.04);
        }
        .auto-card h2{ font-size:15px; font-weight:700; margin:0 0 4px; color:#0e2a1c; display:flex; align-items:center; gap:8px; }
        .auto-card .sub{ font-size:13px; color:#7c9284; margin:0 0 16px; }

        .cmd-row{ display:flex; gap:10px; }
        .cmd-input{
          flex:1; padding:12px 14px; border-radius:10px; border:1.5px solid #dfe6e1;
          font-size:14px; outline:none; transition:border-color .15s;
        }
        .cmd-input:focus{ border-color:#1a4a2e; }
        .cmd-btn{
          padding:12px 20px; border-radius:10px; border:none; background:#123322; color:#fff;
          font-weight:600; font-size:14px; cursor:pointer; transition:background .15s, transform .1s;
          display:flex; align-items:center; gap:6px;
        }
        .cmd-btn:hover:not(:disabled){ background:#1a4a2e; }
        .cmd-btn:active:not(:disabled){ transform:scale(0.97); }
        .cmd-btn:disabled{ opacity:0.55; cursor:not-allowed; }
        .cmd-btn.ghost{ background:#f2f5f3; color:#0e2a1c; }
        .cmd-btn.ghost:hover:not(:disabled){ background:#e6ebe7; }
        .cmd-btn.danger{ background:#b3261e; }
        .cmd-btn.danger:hover:not(:disabled){ background:#8f1e17; }

        .hint-row{ margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; }
        .hint-chip{
          font-size:12px; color:#657268; background:#f2f5f3; border:1px solid #e6ebe7;
          padding:5px 10px; border-radius:999px; cursor:pointer; transition:all .15s;
        }
        .hint-chip:hover{ background:#e6ebe7; }

        .spin{
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.4);
          border-top-color:#fff; border-radius:50%; animation:auto-spin .7s linear infinite;
        }
        @keyframes auto-spin{ to{ transform:rotate(360deg);} }

        .alert{
          margin-top:14px; padding:12px 14px; border-radius:10px; font-size:13px;
        }
        .alert.err{ background:#fdecea; color:#8f1e17; border:1px solid #f6c8c3; }
        .alert.warn{ background:#fdf3e0; color:#8a5a12; border:1px solid #f6ddc5; }
        .alert.info{ background:#e0f0ff; color:#144a7c; border:1px solid #c6e1f7; }

        .preview{
          margin-top:16px; border:1.5px dashed #1a4a2e; border-radius:12px;
          padding:16px 18px; background:#f4f9f5;
        }
        .preview .badge{
          display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.06em;
          text-transform:uppercase; color:#1a4a2e; background:#dff0e4; padding:3px 8px; border-radius:6px; margin-bottom:8px;
        }
        .preview p{ font-size:14px; color:#1a1f1c; margin:0 0 12px; line-height:1.5; }
        .preview .field-row{
          display:flex; gap:10px; padding:8px 0; border-bottom:1px solid #eef2ef;
          font-size:13px;
        }
        .preview .field-row:last-child{ border-bottom:none; }
        .preview .field-row .k{
          flex:0 0 100px; font-weight:600; color:#0e2a1c; text-transform:capitalize;
        }
        .preview .field-row .v{ flex:1; color:#3a453e; line-height:1.5; white-space:pre-wrap; }
        .preview .fields-box{
          background:#fff; border:1px solid #e6ebe7; border-radius:10px;
          padding:4px 14px; margin-bottom:14px;
        }
        .preview .actions{ display:flex; gap:10px; }

        .status-form{ display:grid; gap:12px; }
        select, textarea{
          width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid #dfe6e1; font-size:14px;
          font-family:inherit; outline:none;
        }
        textarea{ min-height:140px; resize:vertical; }
        select:focus, textarea:focus{ border-color:#1a4a2e; }
        textarea.invalid{ border-color:#b3261e; background:#fdecea; }

        .validation-note{
          font-size:12px; margin-top:6px; padding:8px 10px; border-radius:6px;
          display:flex; align-items:center; gap:6px;
        }
        .validation-note.valid{ color:#1a4a2e; background:#dff0e4; }
        .validation-note.invalid{ color:#8f1e17; background:#fdecea; }

        .suggestion-box{
          margin-top:4px; border-radius:12px; padding:16px; background:#f4f9f5; border:1px solid #dfe6e1;
        }
        .suggestion-box .status-pill{
          display:inline-block; font-size:12px; font-weight:700; text-transform:uppercase;
          padding:4px 10px; border-radius:999px; margin-bottom:8px;
        }
        .status-pill.open{ background:#e0f0ff; color:#144a7c; }
        .status-pill.in_progress{ background:#e0f0ff; color:#144a7c; }
        .status-pill.review{ background:#f0e8fd; color:#5a2ea6; }
        .status-pill.active{ background:#e0f0ff; color:#144a7c; }
        .status-pill.completed{ background:#dff0e4; color:#1a4a2e; }
        .status-pill.closed{ background:#eceff1; color:#455a64; }
        .status-pill.cancelled{ background:#fdecea; color:#8f1e17; }
        .status-pill.on_hold{ background:#fdf3e0; color:#8a5a12; }

        .analysis-grid{
          display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:12px;
        }
        .analysis-box{
          background:#fff; border:1px solid #e6ebe7; border-radius:10px; padding:12px;
        }
        .analysis-box h4{ font-size:12px; font-weight:700; text-transform:uppercase; color:#0e2a1c; margin:0 0 8px; }
        .analysis-box p{ font-size:13px; color:#3a453e; margin:0 0 6px; line-height:1.4; }
        .analysis-box ul{ font-size:12px; color:#3a453e; padding-left:16px; margin:0; }
        .analysis-box li{ margin:4px 0; }

        .history{ display:flex; flex-direction:column; gap:8px; }
        .history-item{
          display:flex; align-items:center; justify-content:space-between;
          font-size:13px; padding:8px 10px; border-radius:8px; background:#f8faf9;
        }
        .history-item .dot{ width:8px; height:8px; border-radius:50%; margin-right:8px; display:inline-block; }
        .history-item .dot.ok{ background:#1a4a2e; }
        .history-item .dot.fail{ background:#b3261e; }
        .history-item .time{ color:#9aa79f; font-size:11px; }
        .empty{ font-size:13px; color:#9aa79f; padding:6px 0; }
      `}</style>

      <div className="auto-header">
        <h1>⚡ Automation</h1>
        <p>
          {user?.name ? `Hey ${user.name} — ` : ""}AI-powered shortcuts for your projects and reports, powered by Groq.
        </p>
      </div>

      {/* ========== COMMAND BAR ========== */}
      <div className="auto-card">
        <h2>💬 Command Bar</h2>
        <p className="sub">
          Type an instruction in plain English. The AI will show you exactly what it plans to do before anything runs.
        </p>

        <form onSubmit={handleParse} className="cmd-row">
          <input
            className="cmd-input"
            placeholder='e.g. "mark Project Alpha as completed" or "create a report for Project Beta about Q3 progress"'
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={parsing || executing}
          />
          <button className="cmd-btn" type="submit" disabled={parsing || executing || !command.trim()}>
            {parsing ? <span className="spin" /> : "✨"} {parsing ? "Thinking…" : "Parse"}
          </button>
        </form>

        <div className="hint-row">
          {commandHints.map((h) => (
            <span
              key={h}
              className="hint-chip"
              onClick={() => {
                if (projectContext.length > 0) setCommand(h);
              }}
              style={projectContext.length === 0 ? { cursor: "default", opacity: 0.7 } : undefined}
            >
              {h}
            </span>
          ))}
        </div>

        {projectsLoadError && (
          <div className="alert warn">
            Couldn't load your projects — command bar will work but can't resolve project names to IDs.
          </div>
        )}
        {commandError && <div className="alert err">{commandError}</div>}

        {intent && (
          <div className="preview">
            <span className="badge">
              {intent.action} · {intent.entity} · {Math.round((intent.confidence ?? 0) * 100)}% confident
            </span>
            <p>{intent.summary}</p>
            {intent.fields && Object.keys(intent.fields).length > 0 && (
              <div className="fields-box">
                {Object.entries(intent.fields).map(([key, value]) => (
                  <div className="field-row" key={key}>
                    <span className="k">{key.replace(/_/g, " ")}</span>
                    <span className="v">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="actions">
              <button className="cmd-btn" onClick={handleExecute} disabled={executing}>
                {executing ? <span className="spin" /> : "✓"} {executing ? "Running…" : "Confirm & run"}
              </button>
              <button className="cmd-btn ghost" onClick={() => setIntent(null)} disabled={executing}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== REPORT → STATUS SUGGESTION ========== */}
      <div className="auto-card">
        <h2>📊 Report → Status Suggestion</h2>
        <p className="sub">
          Paste a project report (e.g., weekly update, sprint summary) and let AI suggest the best status.
        </p>

        <form onSubmit={handleSuggestStatus} className="status-form">
          <select
            value={statusProjectId}
            onChange={(e) => setStatusProjectId(e.target.value)}
            disabled={projectsLoading}
          >
            <option value="">
              {projectsLoading
                ? "Loading projects…"
                : projects.length === 0
                ? "No projects found"
                : "Select project…"}
            </option>
            {projects.map((p) => (
              <option key={getProjectId(p)} value={getProjectId(p)}>
                {getProjectName(p)}
              </option>
            ))}
          </select>

          <textarea
            className={reportText && !reportValid ? "invalid" : ""}
            placeholder="Paste actual report text here, e.g.:

'This week the team completed the API layer and started frontend integration. We hit a blocker with the payment gateway vendor — waiting on their support. Overall 2 days behind schedule but catching up. QA found 3 minor issues, all assigned. We're on track for beta by end of month.'"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />

          {reportText && (
            <div className={`validation-note ${reportValid ? "valid" : "invalid"}`}>
              {reportValid ? (
                <>✓ Report looks good — ready to analyze</>
              ) : (
                <>⚠️ Report too short or generic — needs at least 10 characters with real content</>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="cmd-btn"
              type="submit"
              disabled={suggesting || !reportValid || !statusProjectId}
            >
              {suggesting ? <span className="spin" /> : "🔍"} {suggesting ? "Analyzing…" : "Suggest status"}
            </button>
          </div>
        </form>

        {suggestError && <div className="alert err">{suggestError}</div>}

        {suggestion && suggestion.status && (
          <div className="suggestion-box">
            <span className={`status-pill ${suggestion.status}`}>
              {suggestion.status.replace("_", " ")}
            </span>
            <p style={{ fontSize: 13, margin: "0 0 8px", color: "#1a1f1c" }}>
              <strong>{suggestion.reason}</strong>
            </p>
            <p style={{ fontSize: 12, margin: "0 0 12px", color: "#657268" }}>
              {suggestion.analysis} ({Math.round((suggestion.confidence ?? 0) * 100)}% confident)
            </p>
            <div className="actions">
              <button className="cmd-btn" onClick={handleApplyStatus} disabled={applyingStatus}>
                {applyingStatus ? <span className="spin" /> : "✓"} {applyingStatus ? "Applying…" : "Apply to project"}
              </button>
              <button className="cmd-btn ghost" onClick={() => setSuggestion(null)} disabled={applyingStatus}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {suggestion && !suggestion.status && (
          <div className="alert err">
            {suggestion.reason || "Couldn't analyze that report — paste actual project content with real updates, blockers, or progress."}
          </div>
        )}
      </div>

      {/* ========== ADVANCED ANALYSIS ========== */}
      <div className="auto-card">
        <h2>🔬 Advanced Report Analysis</h2>
        <p className="sub">
          Deep-dive into report data: risks, team health, milestone progress, and more.
        </p>

        {!showAdvanced ? (
          <button
            className="cmd-btn ghost"
            onClick={() => setShowAdvanced(true)}
            style={{ marginBottom: 12 }}
          >
            + Expand advanced analysis
          </button>
        ) : (
          <>
            <form onSubmit={handleAdvancedAnalysis} className="status-form">
              <textarea
                placeholder="Paste your report here to analyze risks, team health, and milestones..."
                value={advancedReport}
                onChange={(e) => setAdvancedReport(e.target.value)}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="cmd-btn"
                  type="submit"
                  disabled={analyzing || !advancedReport.trim()}
                >
                  {analyzing ? <span className="spin" /> : "📊"} {analyzing ? "Analyzing…" : "Analyze report"}
                </button>
                <button
                  className="cmd-btn ghost"
                  type="button"
                  onClick={() => {
                    setShowAdvanced(false);
                    setAdvancedReport("");
                    setAnalysis(null);
                  }}
                >
                  Close
                </button>
              </div>
            </form>

            {analysisError && <div className="alert err">{analysisError}</div>}

            {analysis && (
              <div className="analysis-grid">
                {/* Risks */}
                <div className="analysis-box">
                  <h4>🚨 Risks</h4>
                  <p style={{ fontWeight: 600, color: analysis.risks.riskLevel === "critical" ? "#b3261e" : analysis.risks.riskLevel === "high" ? "#8a5a12" : "#1a4a2e" }}>
                    {analysis.risks.riskLevel?.toUpperCase()}
                  </p>
                  {analysis.risks.risks.length > 0 && (
                    <ul>
                      {analysis.risks.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                  {analysis.risks.blockers.length > 0 && (
                    <>
                      <p style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Blockers:</p>
                      <ul>
                        {analysis.risks.blockers.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Team Health */}
                <div className="analysis-box">
                  <h4>👥 Team Health</h4>
                  <p>
                    <strong>Morale:</strong> {analysis.team.morale?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Workload:</strong> {analysis.team.workloadStatus?.replace("_", " ").toUpperCase()}
                  </p>
                  {analysis.team.concerns.length > 0 && (
                    <>
                      <p style={{ fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Concerns:</p>
                      <ul>
                        {analysis.team.concerns.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Milestones */}
                <div className="analysis-box">
                  <h4>🎯 Milestones</h4>
                  <p>
                    <strong>Progress:</strong> {analysis.milestones.completionPercentage}%
                  </p>
                  {analysis.milestones.estimatedDelay && (
                    <p>
                      <strong>Delay:</strong> {analysis.milestones.estimatedDelay}
                    </p>
                  )}
                  {analysis.milestones.milestonesCompleted.length > 0 && (
                    <>
                      <p style={{ fontWeight: 600, marginTop: 8, marginBottom: 4, color: "#1a4a2e" }}>✓ Completed:</p>
                      <ul>
                        {analysis.milestones.milestonesCompleted.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {analysis.milestones.milestonesAtRisk.length > 0 && (
                    <>
                      <p style={{ fontWeight: 600, marginTop: 8, marginBottom: 4, color: "#8a5a12" }}>⚠️ At Risk:</p>
                      <ul>
                        {analysis.milestones.milestonesAtRisk.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== ACTIVITY LOG ========== */}
      <div className="auto-card">
        <h2>🕒 Recent activity</h2>
        <div className="history">
          {history.length === 0 && <div className="empty">No automation actions yet.</div>}
          {history.map((h, i) => (
            <div className="history-item" key={i}>
              <span>
                <span className={`dot ${h.ok ? "ok" : "fail"}`} />
                {h.label}
              </span>
              <span className="time">{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Automation;
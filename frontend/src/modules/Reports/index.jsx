import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  ListChecks,
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { projectsAPI } from "../../api/project";

const STATUS_META = {
  open: { label: "Open", dot: "bg-slate-400", color: "text-slate-600", bgLight: "bg-slate-100" },
  todo: { label: "To do", dot: "bg-slate-400", color: "text-slate-600", bgLight: "bg-slate-100" },
  in_progress: { label: "In progress", dot: "bg-blue-500", color: "text-blue-600", bgLight: "bg-blue-100" },
  review: { label: "In review", dot: "bg-amber-500", color: "text-amber-600", bgLight: "bg-amber-100" },
  active: { label: "Active", dot: "bg-blue-500", color: "text-blue-600", bgLight: "bg-blue-100" },
  on_hold: { label: "On hold", dot: "bg-amber-500", color: "text-amber-600", bgLight: "bg-amber-100" },
  closed: { label: "Closed", dot: "bg-slate-500", color: "text-slate-600", bgLight: "bg-slate-100" },
  completed: { label: "Completed", dot: "bg-emerald-500", color: "text-emerald-600", bgLight: "bg-emerald-100" },
  done: { label: "Done", dot: "bg-emerald-500", color: "text-emerald-600", bgLight: "bg-emerald-100" },
  cancelled: { label: "Cancelled", dot: "bg-red-400", color: "text-red-600", bgLight: "bg-red-100" },
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const statusMeta = (value) =>
  STATUS_META[(value || "").toLowerCase()] || { label: value || "—", dot: "bg-slate-300", color: "text-slate-600", bgLight: "bg-slate-100" };

// ProgressBar Component
const ProgressBar = ({ completed, total, size = "sm" }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${sizeClasses[size]} bg-slate-200 rounded-full overflow-hidden`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// StatusChart Component
const StatusChart = ({ statusCounts, totalTasks }) => {
  const sortedStatuses = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {sortedStatuses.map(([status, count]) => {
        const meta = statusMeta(status);
        const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
        return (
          <div key={status} className="flex items-center gap-3">
            <span className={`text-xs font-medium w-20 truncate ${meta.color}`}>
              {meta.label}
            </span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-2 ${meta.dot} rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-12 text-right">
              {count} ({Math.round(percentage)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("progress"); // progress, name, tasks

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await projectsAPI.getAll();
      const list = res?.data || res || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load projects for report:", err);
      setError("Couldn't load project data. Try refreshing.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const taskRows = useMemo(() => {
    const rows = [];
    projects.forEach((p) => {
      const tasks = (p.assignments && p.assignments.length ? p.assignments : p.tasks) || [];
      if (tasks.length === 0) {
        rows.push({
          project: p.summary,
          projectId: p.id,
          detail: "No tasks yet",
          assignee: "—",
          email: "",
          priority: "",
          status: "",
          start: "",
          due: "",
          duration: "",
        });
        return;
      }
      tasks.forEach((t) => {
        const start = t.start_date;
        const due = t.due_date;
        const duration =
          start && due ? Math.max(0, Math.ceil((new Date(due) - new Date(start)) / (1000 * 60 * 60 * 24))) : "";
        rows.push({
          project: p.summary,
          projectId: p.id,
          detail: t.task_detail || t.description || t.summary || "",
          assignee: t.assignee ? t.assignee.full_name || t.assignee.username : "Unassigned",
          email: t.assignee?.email || "",
          priority: t.priority || "",
          status: t.status || "",
          start,
          due,
          duration,
        });
      });
    });
    return rows;
  }, [projects]);

  const projectsWithProgress = useMemo(() => {
    return projects.map((p) => {
      const tasks = (p.assignments && p.assignments.length ? p.assignments : p.tasks) || [];
      const completedCount = tasks.filter((t) =>
        ["done", "completed", "closed"].includes((t.status || "").toLowerCase())
      ).length;
      return {
        ...p,
        taskCount: tasks.length,
        completedCount,
        completionPercentage: tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0,
      };
    });
  }, [projects]);

  const sortedProjects = useMemo(() => {
    const sorted = [...projectsWithProgress];
    if (sortBy === "progress") {
      sorted.sort((a, b) => b.completionPercentage - a.completionPercentage);
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.summary.localeCompare(b.summary));
    } else if (sortBy === "tasks") {
      sorted.sort((a, b) => b.taskCount - a.taskCount);
    }
    return sorted;
  }, [projectsWithProgress, sortBy]);

  const stats = useMemo(() => {
    const totalTasks = taskRows.filter((r) => r.status).length;
    const completedTasks = taskRows.filter((r) =>
      ["done", "completed", "closed"].includes((r.status || "").toLowerCase())
    ).length;
    const distinctAssignees = new Set(taskRows.map((r) => r.email).filter(Boolean)).size;

    const statusCounts = {};
    taskRows.forEach((r) => {
      if (!r.status) return;
      const label = statusMeta(r.status).label;
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });

    const avgCompletion = projectsWithProgress.length > 0
      ? projectsWithProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / projectsWithProgress.length
      : 0;

    return {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      distinctAssignees,
      statusCounts,
      avgCompletion: Math.round(avgCompletion),
    };
  }, [projects, taskRows, projectsWithProgress]);

  const handleExport = () => {
    if (projects.length === 0) return;
    setExporting(true);
    setError("");
    try {
      const wb = XLSX.utils.book_new();

      // --- Sheet 1: Projects overview ---
      const projectRows = projects.map((p) => ({
        "Project ID": p.id,
        "Project Name": p.summary,
        Description: p.description || "",
        Status: statusMeta(p.status).label,
        Priority: p.priority || "",
        Reporter: p.reporter || "",
        Creator: p.creator ? p.creator.full_name || p.creator.username : "",
        "Start Date": formatDate(p.start_date),
        "Due Date": formatDate(p.due_date),
        Labels: Array.isArray(p.labels) ? p.labels.join(", ") : "",
        Members: p.member_count ?? (p.members ? p.members.length : ""),
        Tasks: p.task_count ?? (p.tasks ? p.tasks.length : ""),
        "Created On": formatDate(p.created_at),
      }));
      const wsProjects = XLSX.utils.json_to_sheet(projectRows);
      wsProjects["!cols"] = [
        { wch: 10 }, { wch: 32 }, { wch: 42 }, { wch: 14 }, { wch: 10 },
        { wch: 20 }, { wch: 20 }, { wch: 13 }, { wch: 13 }, { wch: 26 },
        { wch: 9 }, { wch: 7 }, { wch: 13 },
      ];
      if (wsProjects["!ref"]) wsProjects["!autofilter"] = { ref: wsProjects["!ref"] };
      XLSX.utils.book_append_sheet(wb, wsProjects, "Projects");

      // --- Sheet 2: Tasks ---
      const taskExportRows = taskRows.map((r) => ({
        Project: r.project,
        Task: r.detail,
        "Assigned To": r.assignee,
        Email: r.email,
        Priority: r.priority,
        Status: statusMeta(r.status).label,
        "Start Date": formatDate(r.start),
        "Due Date": formatDate(r.due),
        "Duration (days)": r.duration,
      }));
      const wsTasks = XLSX.utils.json_to_sheet(taskExportRows);
      wsTasks["!cols"] = [
        { wch: 30 }, { wch: 42 }, { wch: 22 }, { wch: 26 },
        { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 15 },
      ];
      if (wsTasks["!ref"]) wsTasks["!autofilter"] = { ref: wsTasks["!ref"] };
      XLSX.utils.book_append_sheet(wb, wsTasks, "Tasks");

      // --- Sheet 3: Summary ---
      const summaryRows = [
        { Metric: "Total projects", Value: stats.totalProjects },
        { Metric: "Total tasks", Value: stats.totalTasks },
        { Metric: "Completed tasks", Value: stats.completedTasks },
        { Metric: "Average completion %", Value: stats.avgCompletion },
        { Metric: "Distinct assignees", Value: stats.distinctAssignees },
        { Metric: "", Value: "" },
        ...Object.entries(stats.statusCounts).map(([label, count]) => ({ Metric: `Tasks — ${label}`, Value: count })),
        { Metric: "", Value: "" },
        { Metric: "Report generated", Value: new Date().toLocaleString() },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 26 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      const filename = `project-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Excel export failed:", err);
      setError("Couldn't generate the Excel file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Reports</h1>
            {/* <p className="mt-2 text-sm text-slate-500">
              Dekho kitna kaam ho chuka hai aur kitna baaki hai. Sara data ek Excel file mein export kar sakte ho.
            </p> */}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadProjects}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading || projects.length === 0}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "File ban rahi hai..." : "Excel mein Export"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard
            icon={FolderKanban}
            label="Projects"
            value={stats.totalProjects}
            loading={loading}
            sublabel="Total"
          />
          <StatCard
            icon={ListChecks}
            label="Tasks"
            value={stats.totalTasks}
            loading={loading}
            sublabel="Assigned"
          />
          <StatCard
            icon={CheckCircle2}
            label="Done"
            value={stats.completedTasks}
            loading={loading}
            sublabel={`${Math.round((stats.completedTasks / stats.totalTasks) * 100 || 0)}%`}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Progress"
            value={`${stats.avgCompletion}%`}
            loading={loading}
            sublabel="All projects"
          />
          <StatCard
            icon={Users}
            label="Team"
            value={stats.distinctAssignees}
            loading={loading}
            sublabel="Assigned"
          />
        </div>
      </div>

      {/* Status Distribution */}
      {!loading && taskRows.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Status Distribution</h2>
          </div>
          <StatusChart statusCounts={stats.statusCounts} totalTasks={stats.totalTasks} />
        </div>
      )}

      {/* Projects with Progress */}
      {!loading && projectsWithProgress.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Projects ka Progress</h2>
            </div>
            <div className="flex gap-2">
              {["progress", "name", "tasks"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === opt
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {opt === "progress" ? "🔥 Progress" : opt === "name" ? "📝 Name" : "📊 Tasks"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sortedProjects.map((p) => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{p.summary}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.completedCount} / {p.taskCount} tasks completed
                    </p>
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${p.completionPercentage === 100
                    ? "bg-emerald-100 text-emerald-700"
                    : p.completionPercentage >= 50
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                    {Math.round(p.completionPercentage)}%
                  </span>
                </div>
                <ProgressBar completed={p.completedCount} total={p.taskCount} size="md" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Export preview</h2>
          </div>
          <p className="text-xs text-slate-400">
            {taskRows.length} row{taskRows.length !== 1 ? "s" : ""} • {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading projects...
          </div>
        ) : taskRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FileSpreadsheet className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Koi project nahi</p>
            <p className="text-xs text-slate-400">Pehle project banao, phir report dekh sakte ho.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400 bg-slate-50">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-3 py-3">Task</th>
                  <th className="px-3 py-3">Assigned</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taskRows.slice(0, 8).map((r, i) => {
                  const meta = statusMeta(r.status);
                  return (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{r.project}</td>
                      <td className="px-3 py-3 text-slate-600 max-w-xs truncate">{r.detail}</td>
                      <td className="px-3 py-3 text-slate-600 text-sm">{r.assignee}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${meta.bgLight} ${meta.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500 text-sm">{formatDate(r.due) || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {taskRows.length > 8 && (
              <p className="px-6 py-3 text-xs text-slate-400 border-t border-slate-100 bg-slate-50">
                +{taskRows.length - 8} aur row{taskRows.length - 8 !== 1 ? "s" : ""} Excel file mein hoga.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, loading, sublabel }) => (
  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-slate-100/40 hover:shadow-md px-4 py-3.5 transition-shadow">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="mt-1.5 text-2xl font-bold text-slate-900">
      {loading ? <span className="inline-block h-6 w-10 animate-pulse rounded bg-slate-300" /> : value}
    </p>
    {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
  </div>
);

export default Reports;
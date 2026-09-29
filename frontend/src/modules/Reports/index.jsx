import { useState, useEffect, useMemo, useCallback } from "react";
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
  Clock3,
  Zap,
  ChevronDown,
  BarChart3,
  CalendarDays,
  CircleCheck,
  ArrowUpRight,
  Search,
  X,
} from "lucide-react";
import { projectsAPI } from "../../api/project";

const STATUS_META = {
  open: {
    label: "Open",
    dot: "bg-slate-400",
    color: "text-slate-600 dark:text-slate-300",
    bgLight: "bg-slate-100 dark:bg-slate-800",
  },
  todo: {
    label: "To do",
    dot: "bg-slate-400",
    color: "text-slate-600 dark:text-slate-300",
    bgLight: "bg-slate-100 dark:bg-slate-800",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-blue-500",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-500/10",
  },
  review: {
    label: "In review",
    dot: "bg-amber-500",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-500/10",
  },
  active: {
    label: "Active",
    dot: "bg-blue-500",
    color: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-500/10",
  },
  on_hold: {
    label: "On hold",
    dot: "bg-amber-500",
    color: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50 dark:bg-amber-500/10",
  },
  closed: {
    label: "Closed",
    dot: "bg-slate-500",
    color: "text-slate-600 dark:text-slate-300",
    bgLight: "bg-slate-100 dark:bg-slate-800",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  done: {
    label: "Done",
    dot: "bg-emerald-500",
    color: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    color: "text-red-600 dark:text-red-400",
    bgLight: "bg-red-50 dark:bg-red-500/10",
  },
};

const COMPLETED_STATUSES = ["done", "completed", "closed"];

const formatDate = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusMeta = (value) =>
  STATUS_META[(value || "").toLowerCase()] || {
    label: value || "—",
    dot: "bg-slate-300",
    color: "text-slate-600 dark:text-slate-300",
    bgLight: "bg-slate-100 dark:bg-slate-800",
  };

const ProgressBar = ({ completed, total, size = "md" }) => {
  const percentage = total > 0
    ? Math.min(100, (completed / total) * 100)
    : 0;

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${sizeClasses[size]}`}
    >
      <div
        className={`rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-700 ${sizeClasses[size]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const StatusChart = ({ statusCounts, totalTasks }) => {
  const sortedStatuses = Object.entries(statusCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  if (!sortedStatuses.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        No status data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedStatuses.map(([status, count]) => {
        const meta = statusMeta(status);
        const percentage =
          totalTasks > 0 ? (count / totalTasks) * 100 : 0;

        return (
          <div key={status} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`}
                />
                <span
                  className={`truncate text-xs font-medium ${meta.color}`}
                >
                  {meta.label}
                </span>
              </div>

              <span className="shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {count}
                <span className="ml-1 font-normal text-slate-400">
                  ({Math.round(percentage)}%)
                </span>
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${meta.dot}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  loading,
  sublabel,
  iconClass = "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10",
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_35px_-20px_rgba(79,70,229,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30">
    <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/5 blur-2xl transition-all group-hover:bg-indigo-500/10" />

    <div className="relative">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-indigo-400 dark:text-slate-700" />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {loading ? (
            <span className="inline-block h-7 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          ) : (
            value
          )}
        </p>

        {sublabel && (
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getProjectTasks = useCallback((project) => {
    if (Array.isArray(project?.tasks)) {
      return project.tasks;
    }

    if (Array.isArray(project?.assignments)) {
      return project.assignments;
    }

    return [];
  }, []);

  const taskRows = useMemo(() => {
    const rows = [];

    projects.forEach((p) => {
      const tasks = getProjectTasks(p);

      if (tasks.length === 0) {
        rows.push({
          project: p.summary || "Untitled Project",
          projectId: p.id,
          type: "Task",
          parentTask: "",
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
          start && due
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(due) - new Date(start)) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : "";

        rows.push({
          project: p.summary || "Untitled Project",
          projectId: p.id,
          type: "Task",
          parentTask: "",
          detail:
            t.task_detail ||
            t.description ||
            t.summary ||
            "Untitled task",
          assignee: t.assignee
            ? t.assignee.full_name || t.assignee.username
            : "Unassigned",
          email: t.assignee?.email || "",
          priority: t.priority || "",
          status: t.status || "",
          start,
          due,
          duration,
        });

        (t.subtasks || []).forEach((subtask) => {
          rows.push({
            project: p.summary || "Untitled Project",
            projectId: p.id,
            type: "Subtask",
            parentTask:
              t.summary ||
              t.task_detail ||
              "Parent task",
            detail:
              subtask.title ||
              subtask.description ||
              "Untitled subtask",
            assignee: t.assignee
              ? t.assignee.full_name || t.assignee.username
              : "Unassigned",
            email: t.assignee?.email || "",
            priority: subtask.priority || t.priority || "",
            status: subtask.status || "",
            start: subtask.date,
            due: subtask.date,
            duration: "",
          });
        });
      });
    });

    return rows;
  }, [projects, getProjectTasks]);

  const projectsWithProgress = useMemo(() => {
    return projects.map((p) => {
      const tasks = getProjectTasks(p);

      const subtasks = tasks.flatMap((task) =>
        Array.isArray(task.subtasks) ? task.subtasks : []
      );

      const workItems = [...tasks, ...subtasks];

      const completedCount = workItems.filter((item) =>
        COMPLETED_STATUSES.includes(
          (item.status || "").toLowerCase()
        )
      ).length;

      const completionPercentage =
        workItems.length > 0
          ? (completedCount / workItems.length) * 100
          : 0;

      return {
        ...p,
        taskCount: tasks.length,
        subtaskCount: subtasks.length,
        workItemCount: workItems.length,
        completedCount,
        completionPercentage,
      };
    });
  }, [projects, getProjectTasks]);

  const filteredProjects = useMemo(() => {
    let result = [...projectsWithProgress];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((project) =>
        String(project.summary || "")
          .toLowerCase()
          .includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (project) =>
          (project.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (sortBy === "progress") {
      result.sort(
        (a, b) =>
          b.completionPercentage - a.completionPercentage
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.summary || "").localeCompare(
          String(b.summary || "")
        )
      );
    }

    if (sortBy === "tasks") {
      result.sort((a, b) => b.taskCount - a.taskCount);
    }

    return result;
  }, [
    projectsWithProgress,
    search,
    statusFilter,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const taskOnlyRows = taskRows.filter(
      (row) => row.type === "Task" && row.status
    );

    const subtaskOnlyRows = taskRows.filter(
      (row) => row.type === "Subtask" && row.status
    );

    const completedTasks = taskOnlyRows.filter((row) =>
      COMPLETED_STATUSES.includes(
        (row.status || "").toLowerCase()
      )
    ).length;

    const completedSubtasks = subtaskOnlyRows.filter((row) =>
      COMPLETED_STATUSES.includes(
        (row.status || "").toLowerCase()
      )
    ).length;

    const distinctAssignees = new Set(
      taskRows.map((row) => row.email).filter(Boolean)
    ).size;

    const statusCounts = {};

    taskRows.forEach((row) => {
      if (!row.status) return;

      const key = (row.status || "").toLowerCase();

      statusCounts[key] =
        (statusCounts[key] || 0) + 1;
    });

    const avgCompletion =
      projectsWithProgress.length > 0
        ? projectsWithProgress.reduce(
            (sum, project) =>
              sum + project.completionPercentage,
            0
          ) / projectsWithProgress.length
        : 0;

    return {
      totalProjects: projects.length,
      totalTasks: taskOnlyRows.length,
      totalSubtasks: subtaskOnlyRows.length,
      completedTasks,
      completedSubtasks,
      distinctAssignees,
      statusCounts,
      avgCompletion: Math.round(avgCompletion),
    };
  }, [projects, taskRows, projectsWithProgress]);

  const overallCompletion = stats.totalTasks > 0
    ? Math.round(
        (stats.completedTasks / stats.totalTasks) * 100
      )
    : 0;

  const handleExport = () => {
    if (projects.length === 0) return;

    setExporting(true);
    setError("");

    try {
      const wb = XLSX.utils.book_new();

      // -----------------------------------------
      // SHEET 1: PROJECTS
      // -----------------------------------------
      const projectRows = projects.map((p) => ({
        "Project ID": p.id,
        "Project Name": p.summary || "",
        Description: p.description || "",
        Status: statusMeta(p.status).label,
        Priority: p.priority || "",
        Reporter: p.reporter || "",
        Creator: p.creator
          ? p.creator.full_name || p.creator.username
          : "",
        "Start Date": formatDate(p.start_date),
        "Due Date": formatDate(p.due_date),
        Labels: Array.isArray(p.labels)
          ? p.labels.join(", ")
          : "",
        Members:
          p.member_count ??
          (p.members ? p.members.length : ""),
        Tasks:
          p.task_count ??
          (p.tasks ? p.tasks.length : ""),
        "Created On": formatDate(p.created_at),
      }));

      const wsProjects =
        XLSX.utils.json_to_sheet(projectRows);

      wsProjects["!cols"] = [
        { wch: 10 },
        { wch: 32 },
        { wch: 42 },
        { wch: 14 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 26 },
        { wch: 10 },
        { wch: 10 },
        { wch: 18 },
      ];

      if (wsProjects["!ref"]) {
        wsProjects["!autofilter"] = {
          ref: wsProjects["!ref"],
        };
      }

      XLSX.utils.book_append_sheet(
        wb,
        wsProjects,
        "Projects"
      );

      // -----------------------------------------
      // SHEET 2: TASKS
      // -----------------------------------------
      const taskExportRows = taskRows.map((row) => ({
        Project: row.project,
        Type: row.type,
        "Parent Task": row.parentTask,
        Task: row.detail,
        "Assigned To": row.assignee,
        Email: row.email,
        Priority: row.priority,
        Status: statusMeta(row.status).label,
        "Start Date": formatDate(row.start),
        "Due Date": formatDate(row.due),
        "Duration (days)": row.duration,
      }));

      const wsTasks =
        XLSX.utils.json_to_sheet(taskExportRows);

      wsTasks["!cols"] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 30 },
        { wch: 42 },
        { wch: 22 },
        { wch: 28 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
      ];

      if (wsTasks["!ref"]) {
        wsTasks["!autofilter"] = {
          ref: wsTasks["!ref"],
        };
      }

      XLSX.utils.book_append_sheet(
        wb,
        wsTasks,
        "Tasks"
      );

      // -----------------------------------------
      // SHEET 3: SUMMARY
      // -----------------------------------------
      const summaryRows = [
        {
          Metric: "Total projects",
          Value: stats.totalProjects,
        },
        {
          Metric: "Total tasks",
          Value: stats.totalTasks,
        },
        {
          Metric: "Total subtasks",
          Value: stats.totalSubtasks,
        },
        {
          Metric: "Completed tasks",
          Value: stats.completedTasks,
        },
        {
          Metric: "Completed subtasks",
          Value: stats.completedSubtasks,
        },
        {
          Metric: "Overall completion %",
          Value: overallCompletion,
        },
        {
          Metric: "Average project completion %",
          Value: stats.avgCompletion,
        },
        {
          Metric: "Distinct assignees",
          Value: stats.distinctAssignees,
        },
        {
          Metric: "",
          Value: "",
        },
        ...Object.entries(stats.statusCounts).map(
          ([status, count]) => ({
            Metric: `Tasks — ${statusMeta(status).label}`,
            Value: count,
          })
        ),
        {
          Metric: "",
          Value: "",
        },
        {
          Metric: "Report generated",
          Value: new Date().toLocaleString(),
        },
      ];

      const wsSummary =
        XLSX.utils.json_to_sheet(summaryRows);

      wsSummary["!cols"] = [
        { wch: 32 },
        { wch: 24 },
      ];

      XLSX.utils.book_append_sheet(
        wb,
        wsSummary,
        "Summary"
      );

      const filename = `project-report-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Excel export failed:", err);
      setError(
        "Couldn't generate the Excel file. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-1 dark:bg-slate-950">
      {/* =========================================
          HEADER
      ========================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <BarChart3 className="h-4 w-4" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                  Project Analytics
                </span>
              </div>

              <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Reports
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Track project progress, task activity and team
                workload from one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadProjects}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={
                  exporting ||
                  loading ||
                  projects.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}

                {exporting
                  ? "Generating..."
                  : "Export Excel"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* =========================================
              STAT CARDS
          ========================================== */}
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={FolderKanban}
              label="Projects"
              value={stats.totalProjects}
              loading={loading}
              sublabel="Total projects"
            />

            <StatCard
              icon={ListChecks}
              label="Tasks"
              value={stats.totalTasks}
              loading={loading}
              sublabel="Main tasks"
              iconClass="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10"
            />

            <StatCard
              icon={ListChecks}
              label="Subtasks"
              value={stats.totalSubtasks}
              loading={loading}
              sublabel={`${stats.completedSubtasks} completed`}
              iconClass="text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10"
            />

            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={`${overallCompletion}%`}
              loading={loading}
              sublabel={`${stats.completedTasks} tasks done`}
              iconClass="text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
            />

            <StatCard
              icon={TrendingUp}
              label="Avg Progress"
              value={`${stats.avgCompletion}%`}
              loading={loading}
              sublabel="Across projects"
              iconClass="text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-500/10"
            />

            <StatCard
              icon={Users}
              label="Team"
              value={stats.distinctAssignees}
              loading={loading}
              sublabel="Assigned members"
              iconClass="text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
            />
          </div>
        </div>
      </div>

      {/* =========================================
          ANALYTICS ROW
      ========================================== */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Overall progress */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Overall Progress
                    </h2>
                    <p className="text-xs text-slate-400">
                      Current task completion
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {overallCompletion}%
                </p>
                <p className="text-[11px] text-slate-400">
                  {stats.completedTasks} of{" "}
                  {stats.totalTasks} tasks
                </p>
              </div>
            </div>

            <div className="mt-7">
              <ProgressBar
                completed={stats.completedTasks}
                total={stats.totalTasks}
                size="lg"
              />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniMetric
                label="Completed"
                value={stats.completedTasks}
                icon={CircleCheck}
              />

              <MiniMetric
                label="Remaining"
                value={Math.max(
                  0,
                  stats.totalTasks -
                    stats.completedTasks
                )}
                icon={Clock3}
              />

              <MiniMetric
                label="Projects"
                value={stats.totalProjects}
                icon={FolderKanban}
              />
            </div>
          </div>

          {/* Status distribution */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Zap className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Status Distribution
                  </h2>
                  <p className="text-xs text-slate-400">
                    Task activity by status
                  </p>
                </div>
              </div>
            </div>

            <StatusChart
              statusCounts={stats.statusCounts}
              totalTasks={
                stats.totalTasks +
                stats.totalSubtasks
              }
            />
          </div>
        </div>
      )}

      {/* =========================================
          PROJECT PROGRESS
      ========================================== */}
      {!loading && projectsWithProgress.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_50px_-35px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <FolderKanban className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Project Progress
                    </h2>
                    <p className="text-xs text-slate-400">
                      Track work completed across projects
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search project..."
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-500 sm:w-48"
                  />

                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                    className="h-9 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:border-indigo-200 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="progress">
                      Sort: Progress
                    </option>
                    <option value="name">
                      Sort: Name
                    </option>
                    <option value="tasks">
                      Sort: Tasks
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["open", "Open"],
                ["active", "Active"],
                ["in_progress", "In progress"],
                ["completed", "Completed"],
                ["done", "Done"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                    statusFilter === value
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No projects found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredProjects.map((project) => (
                  <ProjectProgressCard
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          EXPORT PREVIEW
      ========================================== */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_50px_-35px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Export Preview
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Preview of data included in the Excel report
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {taskRows.length} row
            {taskRows.length !== 1 ? "s" : ""} •{" "}
            {projects.length} project
            {projects.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading report data...
            </p>
          </div>
        ) : taskRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FileSpreadsheet className="h-6 w-6 text-slate-300 dark:text-slate-600" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              You don't have any projects
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Create a project to view reports here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
                    <th className="px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Project
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Parent
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Task
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Assigned
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-3 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Due
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {taskRows.slice(0, 10).map((row, index) => {
                    const meta = statusMeta(row.status);

                    return (
                      <tr
                        key={`${row.projectId}-${index}`}
                        className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-[190px] truncate font-medium text-slate-800 dark:text-slate-200">
                            {row.project}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-semibold ${
                              row.type === "Subtask"
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <div className="max-w-[170px] truncate text-xs text-slate-400">
                            {row.parentTask || "—"}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="max-w-[260px] truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                            {row.detail}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="max-w-[150px] truncate text-xs text-slate-500 dark:text-slate-400">
                            {row.assignee}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold ${meta.bgLight} ${meta.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                            />
                            {meta.label}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-400">
                            {row.due && (
                              <CalendarDays className="h-3 w-3" />
                            )}
                            {formatDate(row.due) || "—"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {taskRows.length > 10 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs text-slate-400">
                  Showing 10 of {taskRows.length} rows
                </p>

                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  +{taskRows.length - 10} more in Excel
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ProjectProgressCard = ({ project }) => {
  const percentage = Math.round(
    project.completionPercentage
  );

  const progressTone =
    percentage === 100
      ? {
          badge:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
          icon:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        }
      : percentage >= 60
      ? {
          badge:
            "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
          icon:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        }
      : {
          badge:
            "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
          icon:
            "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_16px_35px_-25px_rgba(79,70,229,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${progressTone.icon}`}
          >
            <FolderKanban className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-white">
              {project.summary || "Untitled Project"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {project.completedCount} of{" "}
              {project.workItemCount} work items completed
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold ${progressTone.badge}`}
        >
          {percentage}%
        </span>
      </div>

      <div className="mt-5">
        <ProgressBar
          completed={project.completedCount}
          total={project.workItemCount}
          size="md"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3 text-slate-400">
          <span>
            {project.taskCount}{" "}
            {project.taskCount === 1
              ? "task"
              : "tasks"}
          </span>

          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />

          <span>
            {project.subtaskCount}{" "}
            {project.subtaskCount === 1
              ? "subtask"
              : "subtasks"}
          </span>
        </div>

        <span className="font-medium text-slate-500 dark:text-slate-400">
          {percentage === 100
            ? "Completed"
            : percentage >= 60
            ? "Good progress"
            : "Needs attention"}
        </span>
      </div>
    </div>
  );
};

const MiniMetric = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
    <div className="flex items-center gap-1.5 text-slate-400">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-medium">
        {label}
      </span>
    </div>

    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
      {value}
    </p>
  </div>
);

export default Reports;
import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  AlertTriangle,
  Users,
  Flag,
  Layers,
  GitBranch,
  Circle,
  Diamond,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Clock3,
  X,
  FolderKanban,
  Target,
  ArrowUpRight,
} from "lucide-react";

import { projectsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";
import { useTheme } from "../../context/ThemeContext";

const STATUS_META = {
  todo: {
    label: "To Do",
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },

  active: {
    label: "Active",
    dot: "bg-indigo-500",
    badge:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  },

  open: {
    label: "Open",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },

  in_progress: {
    label: "In Progress",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },

  review: {
    label: "In Review",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },

  in_review: {
    label: "In Review",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },

  on_hold: {
    label: "On Hold",
    dot: "bg-orange-500",
    badge:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },

  cancelled: {
    label: "Cancelled",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  },

  done: {
    label: "Done",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },

  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },

  closed: {
    label: "Closed",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
};

const PRIORITY_META = {
  critical: {
    label: "Critical",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50",
  },

  high: {
    label: "High",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900/50",
  },

  medium: {
    label: "Medium",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50",
  },

  low: {
    label: "Low",
    className:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

const BAR_COLORS = [
  "#4f46e5",
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#ea580c",
];

const DAY_MS = 86400000;
const ROW_HEIGHT = 58;

const toDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date, amount) =>
  new Date(date.getTime() + amount * DAY_MS);

const startOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const dayDiff = (a, b) =>
  Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) /
      DAY_MS
  );

const formatDate = (date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const formatLongDate = (date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const SmartTime = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [projects, setProjects] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProject, setSelectedProject] = useState("all");

  const [view, setView] = useState("2weeks");

  const [timelineStart, setTimelineStart] = useState(
    startOfDay(new Date())
  );

  const [search, setSearch] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectsRes, tasksRes] =
        await Promise.allSettled([
          projectsAPI.getAll(),
          tasksAPI.getAll(),
        ]);

      const projectData =
        projectsRes.status === "fulfilled"
          ? projectsRes.value?.data ||
            projectsRes.value ||
            []
          : [];

      const taskData =
        tasksRes.status === "fulfilled"
          ? tasksRes.value?.data ||
            tasksRes.value ||
            []
          : [];

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : []
      );

      setRawTasks(
        Array.isArray(taskData)
          ? taskData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to load project timeline"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================================
     PROJECT ID HELPER
  ========================================================= */

  const getProjectId = (task) => {
    return (
      task.project_id ??
      task.projectId ??
      task.project?.id ??
      task.project?.project_id ??
      null
    );
  };

  /* =========================================================
     SELECTED PROJECT
  ========================================================= */

  const activeProject = useMemo(() => {
    if (selectedProject === "all") return null;

    return projects.find(
      (project) =>
        String(project.id) ===
        String(selectedProject)
    );
  }, [projects, selectedProject]);

  /* =========================================================
     PROJECT TASKS
  ========================================================= */

  const projectTasks = useMemo(() => {
    let result = rawTasks;

    if (selectedProject !== "all") {
      result = result.filter(
        (task) =>
          String(getProjectId(task)) ===
          String(selectedProject)
      );
    }

    if (search.trim()) {
      const query = search
        .trim()
        .toLowerCase();

      result = result.filter((task) =>
        String(
          task.summary ||
            task.title ||
            task.name ||
            ""
        )
          .toLowerCase()
          .includes(query)
      );
    }

    return result;
  }, [
    rawTasks,
    selectedProject,
    search,
  ]);

  /* =========================================================
     NORMALIZE TASKS
  ========================================================= */

  const tasks = useMemo(() => {
    const today = startOfDay(new Date());

    return projectTasks.map((task) => {
      const start =
        toDate(task.start_date) ||
        toDate(task.created_at) ||
        today;

      const end =
        toDate(task.due_date) ||
        addDays(start, 3);

      const capacity =
        typeof task.capacity === "number"
          ? task.capacity
          : typeof task.workload === "number"
          ? task.workload
          : null;

      const isDone = [
        "done",
        "completed",
        "closed",
      ].includes(task.status);

      const overdue =
        end < today && !isDone;

      const atRisk =
        Boolean(task.at_risk) ||
        overdue ||
        (capacity != null &&
          capacity > 100);

      return {
        ...task,

        id: String(task.id),

        summary:
          task.summary ||
          task.title ||
          task.name ||
          "Untitled task",

        owner:
          task.assignee?.full_name ||
          task.assignee?.username ||
          task.assignee?.name ||
          task.reporter ||
          "Unassigned",

        priority:
          task.priority || "medium",

        status:
          task.status || "todo",

        start,

        end,

        capacity,

        isDone,

        atRisk,

        dependencies: Array.isArray(
          task.dependencies
        )
          ? task.dependencies
          : [],
      };
    });
  }, [projectTasks]);

  /* =========================================================
     TIMELINE RANGE
  ========================================================= */

  const totalDays =
    view === "month" ? 30 : 14;

  const timelineEnd = addDays(
    timelineStart,
    totalDays - 1
  );

  /* =========================================================
     DATE NAVIGATION
  ========================================================= */

  const goPrevious = () => {
    setTimelineStart(
      addDays(timelineStart, -totalDays)
    );
  };

  const goNext = () => {
    setTimelineStart(
      addDays(timelineStart, totalDays)
    );
  };

  const goToday = () => {
    setTimelineStart(
      startOfDay(new Date())
    );
  };

  /* =========================================================
     DATE LIST
  ========================================================= */

  const dateList = useMemo(() => {
    return Array.from(
      { length: totalDays },
      (_, index) =>
        addDays(timelineStart, index)
    );
  }, [timelineStart, totalDays]);

  /* =========================================================
     DATE POSITION
  ========================================================= */

  const getPosition = (date) => {
    const diff = dayDiff(
      timelineStart,
      date
    );

    return (
      (diff / (totalDays - 1)) * 100
    );
  };

  /* =========================================================
     STATS
  ========================================================= */

  const completedCount = tasks.filter(
    (task) => task.isDone
  ).length;

  const atRiskCount = tasks.filter(
    (task) => task.atRisk
  ).length;

  const milestones = tasks.filter(
    (task) =>
      task.is_milestone ||
      task.type === "milestone"
  );

  const progress =
    tasks.length > 0
      ? Math.round(
          (completedCount /
            tasks.length) *
            100
        )
      : 0;

  const capacities = tasks
    .filter(
      (task) => task.capacity != null
    )
    .map((task) => task.capacity);

  const avgCapacity =
    capacities.length > 0
      ? Math.round(
          capacities.reduce(
            (a, b) => a + b,
            0
          ) / capacities.length
        )
      : null;

  const teamMembers = Array.from(
    new Set(
      tasks
        .map((task) => task.owner)
        .filter(
          (name) => name !== "Unassigned"
        )
    )
  );

  /* =========================================================
     TODAY POSITION
  ========================================================= */

  const today = startOfDay(new Date());

  const todayVisible =
    today >= timelineStart &&
    today <= timelineEnd;

  const todayPosition = todayVisible
    ? getPosition(today)
    : null;

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const stats = [
    {
      label: "Tasks",
      value: tasks.length,
      icon: CheckSquare,
      color:
        "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    },

    {
      label: "Completed",
      value: `${progress}%`,
      icon: Target,
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    },

    {
      label: "At Risk",
      value: atRiskCount,
      icon: AlertTriangle,
      color:
        "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },

    {
      label: "Milestones",
      value: milestones.length,
      icon: Flag,
      color:
        "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    },

    {
      label: "Capacity",
      value:
        avgCapacity != null
          ? `${avgCapacity}%`
          : "—",
      icon: Users,
      color:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    },
  ];

  /* =========================================================
     DEPENDENCIES
  ========================================================= */

  const taskIndex = useMemo(() => {
    const map = {};

    tasks.forEach((task, index) => {
      map[String(task.id)] = index;
    });

    return map;
  }, [tasks]);

  const dependencies = useMemo(() => {
    const result = [];

    tasks.forEach((task) => {
      task.dependencies.forEach(
        (dependencyId) => {
          const dependencyIndex =
            taskIndex[
              String(dependencyId)
            ];

          if (
            dependencyIndex == null
          )
            return;

          result.push({
            from: tasks[dependencyIndex],
            to: task,
          });
        }
      );
    });

    return result;
  }, [tasks, taskIndex]);

  return (
    <div className="space-y-5 pb-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="relative p-5">

          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Project Timeline
                  </h1>

                  {activeProject && (
                    <>
                      <span className="text-slate-300">
                        /
                      </span>

                      <span className="max-w-[220px] truncate text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {activeProject.name ||
                          activeProject.title ||
                          "Project"}
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Track project tasks, deadlines,
                  milestones and workload.
                </p>
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:self-auto"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ===================================================
            PROJECT SELECTOR
        ==================================================== */}

        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Timeline Project
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select a project to view its tasks
              </p>
            </div>

            <div className="flex flex-1 justify-end">
              <div className="relative w-full max-w-sm">

                <FolderKanban className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />

                <select
                  value={selectedProject}
                  onChange={(event) => {
                    setSelectedProject(
                      event.target.value
                    );

                    setTimelineStart(
                      startOfDay(new Date())
                    );
                  }}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">
                    All Projects — All Tasks
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name ||
                        project.title ||
                        ` ${project.summary}`}
                    </option>
                  ))}
                </select>

                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>
          </div>

          {/* ACTIVE PROJECT INFO */}

          {activeProject && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">

              <div className="flex min-w-0 items-center gap-2">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <FolderKanban className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    {activeProject.name ||
                      activeProject.title ||
                      "Selected Project"}
                  </p>

                  <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70">
                    {tasks.length} task
                    {tasks.length !== 1
                      ? "s"
                      : ""}{" "}
                    in timeline
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedProject("all")
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            STATS
        ==================================================== */}

        <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800 sm:grid-cols-3 lg:grid-cols-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="border-b border-slate-100 p-4 last:border-b-0 dark:border-slate-800 lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />

            <div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                Unable to load timeline
              </p>

              <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TIMELINE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        {/* TOOLBAR */}

        <div className="border-b border-slate-100 p-4 dark:border-slate-800">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex flex-wrap items-center gap-2">

              {/* VIEW */}

              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
                <button
                  onClick={() => {
                    setView("2weeks");
                    setTimelineStart(
                      startOfDay(
                        new Date()
                      )
                    );
                  }}
                  className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${
                    view === "2weeks"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  2 Weeks
                </button>

                <button
                  onClick={() => {
                    setView("month");
                    setTimelineStart(
                      startOfDay(
                        new Date()
                      )
                    );
                  }}
                  className={`rounded-md px-3 py-1.5 text-[10px] font-semibold transition ${
                    view === "month"
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Month
                </button>
              </div>

              {/* NAVIGATION */}

              <div className="flex items-center gap-1">

                <button
                  onClick={goPrevious}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={goToday}
                  className="h-8 rounded-lg border border-slate-200 px-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Today
                </button>

                <button
                  onClick={goNext}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {formatLongDate(
                  timelineStart
                )}{" "}
                —{" "}
                {formatLongDate(
                  timelineEnd
                )}
              </div>
            </div>

            {/* RIGHT CONTROLS */}

            <div className="flex items-center gap-2">

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search tasks..."
                  className="h-8 w-44 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[10px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold ${
                  showFilters
                    ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400"
                    : "border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>

              <button className="hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex">
                <Layers className="h-3.5 w-3.5" />
                Baseline
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {[
                "All",
                "Active",
                "In Progress",
                "At Risk",
                "Completed",
              ].map((filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================
            NO TASK
        ==================================================== */}

        {!loading && tasks.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FolderKanban className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedProject === "all"
                ? "No tasks available"
                : "No tasks in this project"}
            </h3>

            <p className="mt-1 max-w-md text-center text-xs text-slate-400">
              {selectedProject === "all"
                ? "Select a project above to view its tasks on the timeline."
                : "This project doesn't have any tasks with timeline data yet."}
            </p>

            {selectedProject !==
              "all" && (
              <button
                onClick={() =>
                  setSelectedProject(
                    "all"
                  )
                }
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                View all projects
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">

            {/* =================================================
                TIMELINE HEADER
            ================================================== */}

            <div
              className="grid h-12 items-center border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50"
              style={{
                gridTemplateColumns:
                  "minmax(250px, 1.2fr) minmax(0, 3fr)",
              }}
            >
              <div className="px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task
              </div>

              <div className="relative h-full">

                {dateList.map(
                  (date, index) => {
                    const isToday =
                      date.toDateString() ===
                      today.toDateString();

                    return (
                      <div
                        key={index}
                        className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center justify-center"
                        style={{
                          left: `${getPosition(
                            date
                          )}%`,
                        }}
                      >
                        <span
                          className={`text-[9px] font-semibold ${
                            isToday
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400"
                          }`}
                        >
                          {date.toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                            }
                          )}
                        </span>

                        <span
                          className={`mt-0.5 text-[11px] font-bold ${
                            isToday
                              ? "flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white"
                              : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                TASK ROWS
            ================================================== */}

            <div>
              {loading ? (
                Array.from({
                  length: 5,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[58px] animate-pulse border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  />
                ))
              ) : (
                tasks.map((task, index) => {
                  const status =
                    STATUS_META[
                      task.status
                    ] ||
                    STATUS_META.todo;

                  const priority =
                    PRIORITY_META[
                      task.priority
                    ] ||
                    PRIORITY_META.medium;

                  const startPercent =
                    getPosition(
                      task.start
                    );

                  const endPercent =
                    getPosition(
                      task.end
                    );

                  const left = Math.max(
                    0,
                    Math.min(
                      startPercent,
                      100
                    )
                  );

                  const right = Math.max(
                    0,
                    Math.min(
                      endPercent,
                      100
                    )
                  );

                  const width = Math.max(
                    right - left,
                    1.5
                  );

                  const color =
                    BAR_COLORS[
                      index %
                        BAR_COLORS.length
                    ];

                  const isMilestone =
                    task.is_milestone ||
                    task.type ===
                      "milestone";

                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        setSelectedTask(
                          task
                        )
                      }
                      className="grid h-[58px] cursor-pointer border-b border-slate-100 transition hover:bg-indigo-50/30 dark:border-slate-800 dark:hover:bg-indigo-950/10"
                      style={{
                        gridTemplateColumns:
                          "minmax(250px, 1.2fr) minmax(0, 3fr)",
                      }}
                    >
                      {/* TASK INFO */}

                      <div className="flex min-w-0 items-center gap-3 px-5">

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isMilestone
                              ? "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {isMilestone ? (
                            <Diamond className="h-3.5 w-3.5" />
                          ) : (
                            <CheckSquare className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {task.summary}
                            </span>

                            {task.priority && (
                              <span
                                className={`hidden rounded border px-1.5 py-0.5 text-[7px] font-bold uppercase sm:inline ${priority.className}`}
                              >
                                {priority.label}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2">

                            <span className="flex items-center gap-1 text-[9px] text-slate-400">
                              <Circle
                                className={`h-1.5 w-1.5 fill-current ${status.dot}`}
                                strokeWidth={0}
                              />
                              {status.label}
                            </span>

                            <span className="text-slate-300">
                              •
                            </span>

                            <span className="truncate text-[9px] text-slate-400">
                              {task.owner}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TIMELINE */}

                      <div className="relative">

                        {/* DATE GRID */}

                        {dateList.map(
                          (date, dateIndex) => (
                            <div
                              key={dateIndex}
                              className="absolute top-0 bottom-0 border-l border-slate-100/80 dark:border-slate-800/60"
                              style={{
                                left: `${getPosition(
                                  date
                                )}%`,
                              }}
                            />
                          )
                        )}

                        {/* TODAY */}

                        {todayVisible && (
                          <div
                            className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-indigo-500/50"
                            style={{
                              left: `${todayPosition}%`,
                            }}
                          />
                        )}

                        {/* BAR */}

                        {isMilestone ? (
                          <div
                            className="absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] bg-violet-500 shadow-md shadow-violet-500/20"
                            style={{
                              left: `${left}%`,
                            }}
                          />
                        ) : (
                          <div
                            className="absolute top-1/2 z-20 h-7 -translate-y-1/2 overflow-hidden rounded-lg"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              minWidth: 36,
                              backgroundColor: `${color}16`,
                              border: `1px solid ${color}50`,
                            }}
                          >
                            <div
                              className="h-full rounded-l-lg"
                              style={{
                                width: task.isDone
                                  ? "100%"
                                  : task.status ===
                                    "in_progress"
                                  ? "60%"
                                  : "30%",
                                backgroundColor:
                                  color,
                              }}
                            />

                            {task.atRisk && (
                              <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-500 shadow-sm" />
                            )}
                          </div>
                        )}

                        {/* DATE LABEL */}

                        {!isMilestone && (
                          <div
                            className="pointer-events-none absolute top-1/2 z-30 hidden -translate-y-1/2 text-[8px] font-semibold text-slate-500 xl:block"
                            style={{
                              left: `${Math.min(
                                left + width + 1,
                                90
                              )}%`,
                            }}
                          >
                            {formatDate(
                              task.end
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* =================================================
                LEGEND
            ================================================== */}

            <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/30">

              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Timeline
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                <Circle className="h-2 w-2 fill-indigo-500 text-indigo-500" />
                Active
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                Completed
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                <Diamond className="h-2.5 w-2.5 text-violet-500" />
                Milestone
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                <span className="h-3 w-px bg-indigo-500" />
                Today
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                At Risk
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          INSIGHTS
      ====================================================== */}

  
      
      {/* =====================================================
          TASK DETAIL DRAWER
      ====================================================== */}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[2px]">

          <div className="h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                  Task Details
                </p>

                <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  Timeline Item
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedTask(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTask.summary}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-semibold ${
                      (
                        STATUS_META[
                          selectedTask
                            .status
                        ] ||
                        STATUS_META.todo
                      ).badge
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        (
                          STATUS_META[
                            selectedTask
                              .status
                          ] ||
                          STATUS_META.todo
                        ).dot
                      }`}
                    />

                    {
                      (
                        STATUS_META[
                          selectedTask
                            .status
                        ] ||
                        STATUS_META.todo
                      ).label
                    }
                  </span>

                  <span
                    className={`rounded-md border px-2 py-1 text-[9px] font-semibold ${
                      (
                        PRIORITY_META[
                          selectedTask
                            .priority
                        ] ||
                        PRIORITY_META.medium
                      ).className
                    }`}
                  >
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <DetailBox
                  label="Start"
                  value={formatLongDate(
                    selectedTask.start
                  )}
                />

                <DetailBox
                  label="Due"
                  value={formatLongDate(
                    selectedTask.end
                  )}
                />

                <DetailBox
                  label="Owner"
                  value={
                    selectedTask.owner
                  }
                />

                <DetailBox
                  label="Capacity"
                  value={
                    selectedTask.capacity !=
                    null
                      ? `${selectedTask.capacity}%`
                      : "Not set"
                  }
                />
              </div>

              {selectedTask.atRisk && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />

                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                      Task needs attention
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] text-red-600 dark:text-red-400">
                    This task is overdue,
                    over capacity or has
                    been marked as at risk.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   INSIGHT CARD
========================================================= */

const InsightCard = ({
  icon: Icon,
  title,
  color,
  children,
}) => {
  const colors = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",

    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",

    red:
      "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",

    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  };

  return (
    <div className="min-h-[150px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

      <div className="mb-4 flex items-center gap-2">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[color]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
};

const EmptyInsight = ({ text }) => (
  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
    <p className="text-[10px] text-slate-400">
      {text}
    </p>
  </div>
);

const DetailBox = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

export default SmartTime;
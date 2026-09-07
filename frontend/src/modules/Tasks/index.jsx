import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Loader,
  X,
  Sparkles,
  Tag,
  Folder,
  LayoutGrid,
  Kanban,
  List,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Flame,
} from "lucide-react";
import { tasksAPI } from "../../api/task";
import { projectsAPI } from "../../api/project";
import { authAPI } from "../../api/admin";
import { useTheme } from "../../context/ThemeContext";

const PRIORITY_META = {
  critical: { label: "Critical", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50", dot: "bg-rose-500" },
  high: { label: "High", badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50", dot: "bg-red-500" },
  medium: { label: "Medium", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50", dot: "bg-amber-500" },
  low: { label: "Low", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50", dot: "bg-blue-500" },
};

const STATUS_META = {
  todo: { label: "To Do", badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700", icon: "📋" },
  in_progress: { label: "In Progress", badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60", icon: "⚡" },
  done: { label: "Done", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60", icon: "✅" },
};

const Tasks = ({ user }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentUser = user || authAPI.getStoredUser() || {};
  const currentUserId = Number(currentUser?.id ?? currentUser?.user_id ?? 0);

  // Data state
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const isManager = currentUser?.role === "manager" || projects.some((project) =>
    project.my_role === "owner" || project.my_role === "manager"
  );

  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    project_id: "",
    assigned_to: "",
    priority: "medium",
    status: "todo",
    due_date: "",
    start_date: "",
    labels: "",
  });

  const canCreateTask = isManager;

  useEffect(() => {
    loadAllData();
  }, [isManager]);

  // When project is selected in modal, load that project's members
  useEffect(() => {
    if (formData.project_id && isModalOpen) {
      loadProjectMembers(formData.project_id);
    } else if (!formData.project_id) {
      setUsersList([]);
    }
  }, [formData.project_id, isModalOpen]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [
        tasksAPI.getAll(),
        projectsAPI.getAll(),
      ];

      const [tasksRes, projectsRes] = await Promise.allSettled(promises);

      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value?.data || tasksRes.value || [];
        setTasks(Array.isArray(tData) ? tData : []);
      } else {
        console.error("Failed to load tasks:", tasksRes.reason);
        setError("Failed to load tasks. Please try again.");
      }

      if (projectsRes.status === "fulfilled") {
        const pData = projectsRes.value?.data || projectsRes.value || [];
        setProjects(Array.isArray(pData) ? pData : []);
      }
    } catch (err) {
      console.error("Error loading task center data:", err);
      setError(err?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMembers = async (projectId) => {
    if (!projectId) { setUsersList([]); return; }
    try {
      // Fetch members of this specific project
      const res = await projectsAPI.getMembers(projectId);
      const members = res?.data || res || [];
      const assignableMembers = Array.isArray(members)
        ? members
          .filter((member) => member.user)
          .map((member) => ({
            ...member.user,
            project_role: member.role,
          }))
        : [];
      setUsersList(assignableMembers);
    } catch (err) {
      console.error("Failed to load project members:", err);
      setUsersList([]);
    }
  };

  const handleOpenCreateModal = (defaultProjectId = "", defaultStatus = "todo") => {
    if (!canCreateTask) {
      setError("Only a project owner or manager can create and assign tasks.");
      return;
    }

    setIsEditMode(false);
    setEditingTaskId(null);
    setFormData({
      summary: "",
      description: "",
      project_id: defaultProjectId || (projectFilter !== "all" ? projectFilter : ""),
      assigned_to: "",
      priority: "medium",
      status: defaultStatus || "todo",
      due_date: "",
      start_date: "",
      labels: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    const isCreator = Number(task.user_id) === Number(currentUserId);
    const isAssignee = Number(task.assigned_to) === Number(currentUserId);
    if (!isManager && !isCreator && !isAssignee) {
      setError("You can only update your own assigned task status and details.");
      return;
    }

    setIsEditMode(true);
    setEditingTaskId(task.id);
    setFormData({
      summary: task.summary || "",
      description: task.description || "",
      project_id: task.project_id ? String(task.project_id) : "",
      assigned_to: task.assigned_to ? String(task.assigned_to) : "",
      priority: task.priority || "medium",
      status: task.status || "todo",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      start_date: task.start_date ? task.start_date.slice(0, 10) : "",
      labels: Array.isArray(task.labels) ? task.labels.join(", ") : task.labels || "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.summary.trim()) {
      setModalError("Task summary is required");
      return;
    }

    const existingTask = isEditMode ? tasks.find((task) => task.id === editingTaskId) : null;
    const isAssignedTaskOwner = existingTask && Number(existingTask.assigned_to) === Number(currentUserId) && !isManager && Number(existingTask.user_id) !== Number(currentUserId);
    const isTaskCreator = existingTask && Number(existingTask.user_id) === Number(currentUserId);
    const canManageTaskFields = isManager || isTaskCreator;
    const canEditTaskDescription = isManager || isTaskCreator || isAssignedTaskOwner;

    if (!isManager && !isAssignedTaskOwner && isEditMode && existingTask && Number(existingTask.user_id) !== Number(currentUserId)) {
      setModalError("You can only update your own task status and description.");
      return;
    }

    if (isEditMode && !canEditTaskDescription) {
      setModalError("You can only update your own task status and description.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      const payload = {
        summary: formData.summary.trim(),
        description: formData.description.trim() || null,
        project_id: formData.project_id ? parseInt(formData.project_id, 10) : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        start_date: formData.start_date || null,
        labels: formData.labels ? formData.labels.split(",").map((l) => l.trim()).filter(Boolean) : [],
      };

      // Non-managers who aren't the task creator (i.e. plain assignees) can
      // ONLY ever send status + description — every other field is stripped
      // out here so a restricted request never even leaves the browser.
      if (isEditMode && !canManageTaskFields) {
        delete payload.summary;
        delete payload.project_id;
        delete payload.assigned_to;
        delete payload.priority;
        delete payload.due_date;
        delete payload.start_date;
        delete payload.labels;
        payload.description = formData.description.trim() || null;
        if (!payload.status) {
          payload.status = existingTask?.status || "todo";
        }
      }

      if (isEditMode) {
        const res = await tasksAPI.update(editingTaskId, payload);
        const updated = res.data || res;
        setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? updated : t)));
        setSuccessMessage("Task updated successfully");
      } else {
        const res = await tasksAPI.create(payload);
        const created = res.data || res;
        setTasks((prev) => [created, ...prev]);
        setSuccessMessage("Task created and assigned to project!");
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setModalError(err?.message || "Failed to save task");
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setSuccessMessage(`Task moved to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) {
      setError(err?.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksAPI.delete(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        setSuccessMessage("Task deleted successfully");
        setTimeout(() => setSuccessMessage(null), 2500);
      } catch (err) {
        setError(err?.message || "Failed to delete task");
      }
    }
  };

  // NOTE: this used to be referenced from inside TaskCard but TaskCard is a
  // sibling component, not nested in Tasks — it never had access to this
  // closure. It must be passed down explicitly as a prop (done below).
  const canManageTask = (task) =>
    isManager ||
    Number(task.user_id) === Number(currentUserId) ||
    Number(task.assigned_to) === Number(currentUserId);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const highPriority = tasks.filter((t) => t.priority === "high" || t.priority === "critical").length;
    const today = new Date();
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < today && t.status !== "done"
    ).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, inProgress, done, highPriority, overdue, completionRate };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        task.summary?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.project?.summary?.toLowerCase().includes(q) ||
        task.assignee?.full_name?.toLowerCase().includes(q) ||
        task.assignee?.username?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesProject =
        projectFilter === "all"
          ? true
          : projectFilter === "none"
            ? !task.project_id
            : String(task.project_id) === String(projectFilter);

      const matchesAssignee =
        assigneeFilter === "all"
          ? true
          : assigneeFilter === "unassigned"
            ? !task.assigned_to
            : String(task.assigned_to) === String(assigneeFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (projectFilter !== "all" ? 1 : 0) +
    (assigneeFilter !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setAssigneeFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* ─── Header Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-white dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-900 p-6 shadow-sm">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 overflow-hidden opacity-50 dark:opacity-20">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-indigo-300/40 dark:bg-indigo-600/20 blur-3xl" />
          <div className="absolute right-16 bottom-0 h-32 w-32 rounded-full bg-blue-300/40 dark:bg-blue-600/20 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-100/80 dark:bg-indigo-950/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <CheckSquare className="h-3.5 w-3.5" />
              {isManager ? "Task Management & Assignment Hub" : "My Assigned Work Board"}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Task Center
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isManager
                ? "Assign tasks to database team members, link them to projects, set deadlines, and monitor real-time completion."
                : "Manage and update your assigned project tasks, change status, and submit completed deliverables."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenCreateModal()}
              disabled={!canCreateTask}
              title={canCreateTask ? "Assign New Task" : "Create and accept a project before assigning tasks"}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Assign New Task
            </button>
          </div>
        </div>

        {/* ─── Metric Cards Strip ─────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tasks</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{stats.completionRate}% completion rate</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In Progress</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Active workload</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.done}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Successfully closed</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">High / Critical</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.highPriority}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Priority items</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-3.5 shadow-sm backdrop-blur col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Overdue</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stats.overdue}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Passed deadline</p>
          </div>
        </div>
      </section>

      {/* ─── Alerts ─────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/60 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-900/60 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── Search, Filters & View Switcher ─────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, project, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters & View switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project Filter */}
            <div className="flex items-center gap-1">
              <Folder className="h-3.5 w-3.5 text-indigo-500" />
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-indigo-500"
              >
                <option value="all">📁 All Projects</option>
                <option value="none">Standalone (No Project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.summary}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-indigo-500"
            >
              <option value="all">Status: All</option>
              <option value="todo">📋 To Do</option>
              <option value="in_progress">⚡ In Progress</option>
              <option value="done">✅ Done</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-indigo-500"
            >
              <option value="all">Priority: All</option>
              <option value="critical">🔥 Critical</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>

            {/* Reset Filters button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
              >
                Reset ({activeFiltersCount})
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition ${viewMode === "grid"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`rounded-lg p-1.5 transition ${viewMode === "kanban"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Kanban Board View"
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-1.5 transition ${viewMode === "list"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Table / List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Task Content Views ─────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 shadow-sm">
          <Loader className="h-9 w-9 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading Task Center...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fetching latest task assignments & projects</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-16 px-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-4">
            <CheckSquare className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tasks found</h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            {activeFiltersCount > 0
              ? "No tasks match your active filters. Try resetting the filters to view all tasks."
              : isManager
                ? "You haven't assigned any tasks yet. Click 'Assign New Task' to create tasks linked to your projects!"
                : "No tasks are currently assigned to you."}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              onClick={resetFilters}
              className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={() => handleOpenCreateModal()}
              disabled={!canCreateTask}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Assign New Task
            </button>
          )}
        </div>
      ) : viewMode === "kanban" ? (
        /* ─── Kanban Board View ───────────────────────────────── */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {["todo", "in_progress", "done"].map((colStatus) => {
            const colMeta = STATUS_META[colStatus];
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{colMeta.icon}</span>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{colMeta.label}</h3>
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenCreateModal("", colStatus)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                    title={`Add task to ${colMeta.label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs">No tasks in {colMeta.label}</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isManager={isManager}
                        canManageTask={canManageTask}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "list" ? (
        /* ─── Table / List View ───────────────────────────────── */
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Task Details</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTasks.map((task) => {
                  const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                  const sMeta = STATUS_META[task.status] || STATUS_META.todo;
                  const isDone = task.status === "done";
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;

                  return (
                    <tr
                      key={task.id}
                      className="transition-colors hover:bg-indigo-50/40 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {task.summary}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {task.project ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40 max-w-[150px] truncate">
                            <Folder className="h-3 w-3 shrink-0" />
                            <span className="truncate">{task.project.summary}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Standalone</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[10px]">
                              {(task.assignee.full_name || task.assignee.username).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {task.assignee.full_name || task.assignee.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pMeta.badge}`}>
                          {pMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {task.due_date ? (
                          <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue && <span className="text-[10px] uppercase font-extrabold text-red-500">Overdue</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none cursor-pointer ${sMeta.badge}`}
                        >
                          <option value="todo">📋 To Do</option>
                          <option value="in_progress">⚡ In Progress</option>
                          <option value="done">✅ Done</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canManageTask(task) && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                                title="Edit Task"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
                                title="Delete Task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── Grid Cards View ─────────────────────────────────── */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isManager={isManager}
              canManageTask={canManageTask}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ─── Create / Edit Task Modal ────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isEditMode ? "Edit Task" : "Assign New Task"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditMode
                      ? "Modify task parameters and assignment"
                      : "Create task and assign to project and team member"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3.5 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Task Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Task Summary / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Design checkout flow wireframes"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Project & Assignee Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Project Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    📁 Associated Project
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Standalone Task (No Project)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.summary}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    👤 Assign To Member
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Unassigned</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.username && u.role == "manager"} 
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Status Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="low">🔵 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="critical">🔥 Critical Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500"
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Due Date / Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    disabled={isEditMode && !isManager && Number(tasks.find((task) => task.id === editingTaskId)?.user_id ?? 0) !== Number(currentUserId)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Description — always editable, even for a plain assignee */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide complete instructions or criteria for this task..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 resize-none"
                />
              </div>

              {/* Tags / Labels */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags / Labels (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frontend, UI/UX, Sprint 1"
                  value={formData.labels}
                  onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-50"
                >
                  {modalLoading && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  {isEditMode ? "Save Changes" : "Create & Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Task Card Subcomponent ───────────────────────────────────── */
// canManageTask is passed in from the parent (Tasks) — it was previously
// referenced here as a bare identifier, but this component doesn't sit
// inside Tasks' closure, so that threw a ReferenceError at render time.
const TaskCard = ({ task, isManager, canManageTask, onEdit, onDelete, onStatusChange }) => {
  const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const sMeta = STATUS_META[task.status] || STATUS_META.todo;
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";
  const isTodo = task.status === "todo";
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;
  const canManage = canManageTask ? canManageTask(task) : isManager;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800">
      <div>
        {/* Project Tag & Priority Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {task.project ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 max-w-[200px] truncate shadow-2xs">
              <Folder className="h-3 w-3 shrink-0" />
              <span className="truncate">{task.project.summary}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Standalone
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pMeta.badge}`}>
              {pMeta.label}
            </span>

            {canManage && (
              <div className="flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(task)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
                  title="Edit Task"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
                  title="Delete Task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Summary */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1.5">
          {task.summary}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {task.description}
          </p>
        )}

        {/* Labels / Tags */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((lbl, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400"
              >
                #{lbl}
              </span>
            ))}
          </div>
        )}

        {/* Assignee & Dates footer */}
        <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Assignee:</span>
            {task.assignee ? (
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px]">
                  {(task.assignee.full_name || task.assignee.username).charAt(0).toUpperCase()}
                </div>
                <span>{task.assignee.full_name || task.assignee.username}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Unassigned</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Due Date:</span>
            {task.due_date ? (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400"}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
                {isOverdue && <span className="text-[9px] uppercase font-extrabold text-red-500">(Overdue)</span>}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 text-[11px]">No deadline</span>
            )}
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Status:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "todo")}
            disabled={isTodo}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${isTodo
                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
          >
            To Do
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "in_progress")}
            disabled={isInProgress}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${isInProgress
                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(task.id, "done")}
            disabled={isDone}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${isDone
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
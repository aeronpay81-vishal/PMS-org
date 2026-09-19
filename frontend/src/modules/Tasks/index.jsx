import { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Loader,
  X,
  Tag,
  Folder,
  LayoutGrid,
  Kanban,
  List,
  Table2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  Paperclip,
  FileText,
  Upload,
  Circle,
  CircleDot,
  CheckCircle,
  MoreHorizontal,
  Eye,
  ArrowLeft,
  Share2,
  Smile,
  AtSign,
  User,
  GripVertical,
  MessageSquare,
  History,
  Timer,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  Sparkles,
  RefreshCw,
  Wand2,
  Lightbulb,
} from "lucide-react";
import { tasksAPI } from "../../api/task";
import { projectsAPI } from "../../api/project";
import { authAPI } from "../../api/admin";
import { suggestTaskTitleAndDescription } from "../../api/groqApi";
import { useTheme } from "../../context/ThemeContext";

/* ─── Jira-like constants ───────────────────────────────────────── */
const PRIORITY_META = {
  critical: { label: "Critical", dot: "bg-rose-600", chip: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60", bar: "bg-rose-500" },
  high:     { label: "High",     dot: "bg-orange-500", chip: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60", bar: "bg-orange-500" },
  medium:   { label: "Medium",   dot: "bg-amber-500", chip: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60", bar: "bg-amber-500" },
  low:      { label: "Low",      dot: "bg-sky-500",   chip: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60", bar: "bg-sky-500" },
};

const STATUS_META = {
  todo:        { label: "To Do",       chip: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",     color: "text-slate-500",  icon: Circle },
  in_progress: { label: "In Progress", chip: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",       color: "text-blue-500",   icon: CircleDot },
  done:        { label: "Done",        chip: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60", color: "text-emerald-500", icon: CheckCircle },
};

const SUBTASK_STATUS_META = {
  todo:        { label: "To Do",       dot: "bg-slate-400",   chip: "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  in_progress: { label: "In Progress", dot: "bg-blue-500",    chip: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60" },
  done:        { label: "Done",        dot: "bg-emerald-500", chip: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60" },
};

const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";

const avatarColor = (seed = "") => {
  const palette = ["from-blue-500 to-indigo-500", "from-emerald-500 to-teal-500", "from-rose-500 to-pink-500", "from-amber-500 to-orange-500", "from-violet-500 to-purple-500"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

/* ─── Main Tasks Component ─────────────────────────────────────── */
const Tasks = ({ user }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentUser = user || authAPI.getStoredUser() || {};
  const currentUserId = Number(currentUser?.id ?? currentUser?.user_id ?? 0);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const [openTaskId, setOpenTaskId] = useState(null);

  const isManager = currentUser?.role === "manager" || projects.some((p) => p.my_role === "owner" || p.my_role === "manager");

  const [formData, setFormData] = useState({
    summary: "", description: "", project_id: "", assigned_to: "",
    priority: "medium", status: "todo", due_date: "", start_date: "", labels: "",
  });

  useEffect(() => { loadAllData(); }, [isManager]);
  useEffect(() => {
    if (formData.project_id && isModalOpen) loadProjectMembers(formData.project_id);
    else if (!formData.project_id) setUsersList([]);
  }, [formData.project_id, isModalOpen]);

  const loadAllData = async () => {
    setLoading(true); setError(null);
    try {
      const [tasksRes, projectsRes] = await Promise.allSettled([tasksAPI.getAll(), projectsAPI.getAll()]);
      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value?.data || tasksRes.value || [];
        setTasks(Array.isArray(tData) ? tData : []);
      } else setError("Failed to load tasks. Please try again.");
      if (projectsRes.status === "fulfilled") {
        const pData = projectsRes.value?.data || projectsRes.value || [];
        setProjects(Array.isArray(pData) ? pData : []);
      }
    } catch (err) { setError(err?.message || "Failed to load tasks"); }
    finally { setLoading(false); }
  };

  const loadProjectMembers = async (projectId) => {
    if (!projectId) { setUsersList([]); return; }
    try {
      const res = await projectsAPI.getMembers(projectId);
      const members = res?.data || res || [];
      setUsersList(Array.isArray(members) ? members.filter((m) => m.user).map((m) => ({ ...m.user, project_role: m.role })) : []);
    } catch { setUsersList([]); }
  };

  const handleOpenCreateModal = (defaultProjectId = "", defaultStatus = "todo") => {
    if (!isManager) { setError("Only a project owner or manager can create tasks."); return; }
    setIsEditMode(false); setEditingTaskId(null);
    setFormData({
      summary: "", description: "",
      project_id: defaultProjectId || (projectFilter !== "all" ? projectFilter : ""),
      assigned_to: "", priority: "medium", status: defaultStatus || "todo",
      due_date: "", start_date: "", labels: "",
    });
    setModalError(""); setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setIsEditMode(true); setEditingTaskId(task.id);
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
    setModalError(""); setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.summary.trim()) { setModalError("Task summary is required"); return; }
    setModalLoading(true); setModalError("");
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
      if (isEditMode) {
        const res = await tasksAPI.update(editingTaskId, payload);
        const updated = res.data || res;
        setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? updated : t)));
        setSuccessMessage("Task updated successfully");
      } else {
        const res = await tasksAPI.create(payload);
        const created = res.data || res;
        setTasks((prev) => [created, ...prev]);
        setSuccessMessage("Task created successfully");
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) { setModalError(err?.message || "Failed to save task"); }
    finally { setModalLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      setSuccessMessage(`Task moved to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) { setError(err?.message || "Failed to update task status"); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSuccessMessage("Task deleted");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err) { setError(err?.message || "Failed to delete task"); }
  };

  const canManageTask = (task) =>
    isManager || Number(task.user_id) === Number(currentUserId) || Number(task.assigned_to) === Number(currentUserId);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const highPriority = tasks.filter((t) => t.priority === "high" || t.priority === "critical").length;
    const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;
    return { total, done, inProgress, highPriority, overdue, completionRate: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        task.summary?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.project?.summary?.toLowerCase().includes(q) ||
        task.assignee?.full_name?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesProject = projectFilter === "all" ? true
        : projectFilter === "none" ? !task.project_id
        : String(task.project_id) === String(projectFilter);
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter]);

  const activeFiltersCount = (statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0) + (projectFilter !== "all" ? 1 : 0) + (searchQuery ? 1 : 0);
  const resetFilters = () => { setSearchQuery(""); setStatusFilter("all"); setPriorityFilter("all"); setProjectFilter("all"); };

  const openTask = tasks.find((t) => t.id === openTaskId) || null;

  if (openTask) {
    return (
      <IssueDetailView
        task={openTask}
        projects={projects}
        usersList={usersList}
        currentUserId={currentUserId}
        isManager={isManager}
        canManageTask={canManageTask}
        onBack={() => setOpenTaskId(null)}
        onEdit={handleOpenEditModal}
        onDelete={(id) => { handleDeleteTask(id); setOpenTaskId(null); }}
        onStatusChange={handleStatusChange}
        onUpdate={(updatedTask) => setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <CheckSquare className="h-3.5 w-3.5" />
                {isManager ? "Project Board" : "Assigned to me"}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Task board</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {stats.total} issues · {stats.completionRate}% complete · {stats.inProgress} in progress
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateModal()}
              disabled={!isManager}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0747A6] transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> New item
            </button>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-900/60">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-200 dark:border-emerald-900/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Search issues..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs">
              <option value="all">All projects</option>
              <option value="none">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.summary}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs">
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs">
              <option value="all">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                Clear ({activeFiltersCount})
              </button>
            )}
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-0.5">
              {[
                { key: "table", Icon: Table2, label: "Table" },
                { key: "grid", Icon: LayoutGrid, label: "Board" },
                { key: "kanban", Icon: Kanban, label: "Kanban" },
                { key: "list", Icon: List, label: "List" },
              ].map(({ key, Icon, label }) => (
                <button key={key} onClick={() => setViewMode(key)} title={label}
                  className={`rounded p-1.5 transition ${viewMode === key ? "bg-[#0052CC] text-white" : "text-slate-400 hover:text-slate-600"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-20">
            <Loader className="h-8 w-8 text-[#0052CC] animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading tasks…</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-20 text-center">
            <CheckSquare className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No issues found</h3>
            <p className="mt-1 text-xs text-slate-500">Try adjusting filters or create a new task.</p>
          </div>
        ) : viewMode === "table" ? (
          <TaskTableView
            tasks={filteredTasks}
            canManageTask={canManageTask}
            onOpen={setOpenTaskId}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onCreate={handleOpenCreateModal}
          />
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            canManageTask={canManageTask}
            onOpen={setOpenTaskId}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onCreate={handleOpenCreateModal}
          />
        ) : viewMode === "list" ? (
          <ListView
            tasks={filteredTasks}
            onOpen={setOpenTaskId}
            canManageTask={canManageTask}
          />
        ) : (
          <BoardGrid
            tasks={filteredTasks}
            canManageTask={canManageTask}
            onOpen={setOpenTaskId}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {isModalOpen && (
        <CreateTaskModal
          isEditMode={isEditMode}
          editingTaskId={editingTaskId}
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          usersList={usersList}
          modalError={modalError}
          modalLoading={modalLoading}
          onSubmit={handleModalSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

/* ─── Board Grid ─────────────────────────────────────────────── */
const TABLE_STATUS_META = {
  todo: { label: "Backlog", className: "bg-slate-800 text-white" },
  in_progress: { label: "In Progress", className: "bg-[#176B78] text-white" },
  review: { label: "Ready for review", className: "bg-amber-400 text-slate-900" },
  done: { label: "Done", className: "bg-emerald-500 text-white" },
};

const TaskTableView = ({ tasks, canManageTask, onOpen, onEdit, onDelete, onCreate }) => {
  const groups = tasks.reduce((result, task) => {
    const group = task.project?.summary || "Unassigned work";
    if (!result[group]) result[group] = [];
    result[group].push(task);
    return result;
  }, {});

  return (
    <div className="overflow-x-auto rounded-xl border border-[#D6DCE8] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-[1020px]">
        <div className="grid grid-cols-[minmax(270px,1.8fr)_140px_150px_120px_135px_145px_80px] border-b border-[#D6DCE8] bg-[#F8F9FB] text-[11px] font-semibold text-[#626F86] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          <div className="px-4 py-3">Item</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Project</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Task type</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Priority</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Target date</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Status</div>
          <div className="border-l border-[#D6DCE8] px-3 py-3 dark:border-slate-800">Owner</div>
        </div>
        {Object.entries(groups).map(([group, groupTasks]) => (
          <section key={group}>
            <div className="flex items-center gap-2 border-b border-[#D6DCE8] bg-[#F7F9FC] px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
              <ChevronDown className="h-4 w-4 text-[#0C66E4]" />
              <span className="text-[15px] font-semibold text-[#0C66E4] dark:text-blue-300">{group}</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">{groupTasks.length}</span>
            </div>
            {groupTasks.map((task) => {
              const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;
              const status = TABLE_STATUS_META[task.status] || TABLE_STATUS_META.todo;
              const owner = task.assignee?.full_name || task.assignee?.username || "Unassigned";
              const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
              const canManage = canManageTask(task);
              return (
                <div key={task.id} className="group grid grid-cols-[minmax(270px,1.8fr)_140px_150px_120px_135px_145px_80px] border-b border-[#E6E9EF] text-xs last:border-b-0 hover:bg-[#F8FAFD] dark:border-slate-800 dark:hover:bg-slate-800/60">
                  <button type="button" onClick={() => onOpen(task.id)} className="flex min-w-0 items-center gap-3 px-4 py-3 text-left">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#579DFF]" />
                    <span className="truncate font-medium text-[#172B4D] dark:text-white">{task.summary}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">TASK-{task.id}</span>
                  </button>
                  <div className="border-l border-[#E6E9EF] px-3 py-3 text-slate-500 dark:border-slate-800 dark:text-slate-400">{task.project?.summary || "-"}</div>
                  <div className="border-l border-[#E6E9EF] px-3 py-3 dark:border-slate-800"><span className="inline-flex rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{task.labels?.[0] || "Task"}</span></div>
                  <div className="border-l border-[#E6E9EF] px-3 py-3 dark:border-slate-800"><span className={`inline-flex rounded px-2 py-1 text-[10px] font-semibold ${priority.chip}`}>{priority.label}</span></div>
                  <div className={`border-l border-[#E6E9EF] px-3 py-3 dark:border-slate-800 ${overdue ? "font-semibold text-red-600" : "text-slate-500 dark:text-slate-400"}`}>{task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}</div>
                  <div className="border-l border-[#E6E9EF] px-3 py-2 dark:border-slate-800"><span className={`inline-flex rounded px-2.5 py-1.5 text-[10px] font-semibold ${status.className}`}>{status.label}</span></div>
                  <div className="flex items-center gap-1 border-l border-[#E6E9EF] px-3 py-2 dark:border-slate-800">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(owner)} text-[10px] font-bold text-white`} title={owner}>{initials(owner)}</div>
                    {canManage && <button type="button" onClick={() => onEdit(task)} className="hidden rounded p-1 text-slate-400 hover:text-blue-600 group-hover:block"><Edit3 className="h-3.5 w-3.5" /></button>}
                    {canManage && <button type="button" onClick={() => onDelete(task.id)} className="hidden rounded p-1 text-slate-400 hover:text-red-600 group-hover:block"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => onCreate(groupTasks[0]?.project_id ? String(groupTasks[0].project_id) : "")} className="flex w-full items-center gap-2 border-b border-[#E6E9EF] px-12 py-2.5 text-left text-xs text-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"><Plus className="h-3.5 w-3.5" />Add item</button>
          </section>
        ))}
      </div>
    </div>
  );
};

const BoardGrid = ({ tasks, canManageTask, onOpen, onEdit, onDelete, onStatusChange }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {tasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        canManageTask={canManageTask}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    ))}
  </div>
);

const KanbanBoard = ({ tasks, canManageTask, onOpen, onCreate }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    {["todo", "in_progress", "done"].map((col) => {
      const meta = STATUS_META[col];
      const StatusIcon = meta.icon;
      const colTasks = tasks.filter((t) => t.status === col);
      return (
        <div key={col} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${meta.color}`} />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">{meta.label}</h3>
              <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">{colTasks.length}</span>
            </div>
            <button onClick={() => onCreate("", col)} className="rounded p-1 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-[#0052CC]">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-2.5 max-h-[calc(100vh-320px)]">
            {colTasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 py-8 text-center text-[11px] text-slate-400">No issues</p>
            ) : colTasks.map((task) => (
              <KanbanCard key={task.id} task={task} onOpen={onOpen} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const KanbanCard = ({ task, onOpen }) => {
  const p = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
  return (
    <button onClick={() => onOpen(task.id)}
      className="group w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-left shadow-sm transition hover:border-[#0052CC] hover:shadow-md">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
        <span className="text-[10px] font-mono text-slate-400">TASK-{task.id}</span>
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2 mb-2">{task.summary}</p>
      {task.project && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
            <Folder className="h-2.5 w-2.5" />{task.project.summary}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          {task.assignee && (
            <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(task.assignee.username || task.assignee.full_name)} text-[9px] font-bold text-white`}>
              {initials(task.assignee.full_name || task.assignee.username)}
            </div>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-bold" : "text-slate-400"}`}>
              <Calendar className="h-2.5 w-2.5" />
              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${p.chip} border`}>{p.label}</span>
      </div>
    </button>
  );
};

const ListView = ({ tasks, onOpen, canManageTask }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="py-3 px-4">Key</th>
            <th className="py-3 px-4">Summary</th>
            <th className="py-3 px-4">Project</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Due</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((task) => {
            const p = PRIORITY_META[task.priority] || PRIORITY_META.medium;
            const s = STATUS_META[task.status] || STATUS_META.todo;
            const StatusIcon = s.icon;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
            return (
              <tr key={task.id} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => onOpen(task.id)}>
                <td className="py-3 px-4">
                  <span className="font-mono text-[11px] font-semibold text-[#0052CC]">TASK-{task.id}</span>
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-xs">{task.summary}</p>
                </td>
                <td className="py-3 px-4">
                  {task.project ? (
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                      <Folder className="h-2.5 w-2.5" />{task.project.summary}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-3 px-4">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(task.assignee.username)} text-[9px] font-bold text-white`}>
                        {initials(task.assignee.full_name || task.assignee.username)}
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{task.assignee.full_name || task.assignee.username}</span>
                    </div>
                  ) : <span className="text-slate-400 text-[11px]">Unassigned</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${p.chip}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {task.due_date ? (
                    <span className={`text-[11px] ${isOverdue ? "text-red-500 font-bold" : "text-slate-500"}`}>
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${s.chip}`}>
                    <StatusIcon className="h-2.5 w-2.5" />{s.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onOpen(task.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0052CC]">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const TaskCard = ({ task, canManageTask, onOpen, onEdit, onDelete, onStatusChange }) => {
  const p = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const s = STATUS_META[task.status] || STATUS_META.todo;
  const StatusIcon = s.icon;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
  const canManage = canManageTask(task);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:border-[#0052CC] hover:shadow-md">
      <div className={`absolute left-0 top-0 h-full w-1 ${p.bar}`} />
      <div className="p-4 pl-5">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => onOpen(task.id)} className="text-[10px] font-mono font-semibold text-[#0052CC] hover:underline">
            TASK-{task.id}
          </button>
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${p.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}
            </span>
            {canManage && (
              <div className="flex opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => onEdit(task)} className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0052CC]">
                  <Edit3 className="h-3 w-3" />
                </button>
                <button onClick={() => onDelete(task.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => onOpen(task.id)} className="block text-left w-full">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2 hover:text-[#0052CC]">
            {task.summary}
          </h4>
        </button>

        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {task.project && (
            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              <Folder className="h-2.5 w-2.5" />{task.project.summary}
            </span>
          )}
          {task.labels?.map((lbl, i) => (
            <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">{lbl}</span>
          ))}
        </div>

        <SubtaskInline task={task} />

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(task.assignee.username)} text-[9px] font-bold text-white`} title={task.assignee.full_name}>
                {initials(task.assignee.full_name || task.assignee.username)}
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                <User className="h-3 w-3" />
              </div>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-bold" : "text-slate-500"}`}>
                <Calendar className="h-2.5 w-2.5" />
                {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${s.chip}`}>
            <StatusIcon className="h-2.5 w-2.5" />{s.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const SubtaskInline = ({ task }) => {
  const [subtasks, setSubtasks] = useState(() => task.subtasks || []);
  const [loaded, setLoaded] = useState(!!task.subtasks);

  useEffect(() => {
    if (loaded) return;
    let active = true;
    tasksAPI.getSubtasks(task.id)
      .then((r) => { const d = r?.data || r || []; if (active) { setSubtasks(Array.isArray(d) ? d : []); setLoaded(true); } })
      .catch(() => active && setLoaded(true));
    return () => { active = false; };
  }, [task.id, loaded]);

  if (!loaded || subtasks.length === 0) return null;
  const done = subtasks.filter((s) => s.status === "done").length;
  const pct = Math.round((done / subtasks.length) * 100);

  return (
    <div className="flex items-center gap-2">
      <Layers className="h-3 w-3 text-slate-400" />
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-[#0052CC] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-500">{done}/{subtasks.length}</span>
    </div>
  );
};

const SubtaskItem = ({ subtask, onToggle, onEdit, onDelete, isEditing }) => {
  const statusMeta = SUBTASK_STATUS_META[subtask.status] || SUBTASK_STATUS_META.todo;
  const isDone = subtask.status === "done";
  const isInProgress = subtask.status === "in_progress";

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3 transition-all duration-150 ${
        isEditing
          ? "bg-blue-50/60 dark:bg-blue-950/20 border-l-[3px] border-l-[#0052CC]"
          : "border-l-[3px] border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
      }`}
    >
      <button
        onClick={() => onToggle(subtask)}
        className={`mt-0.5 shrink-0 rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC]/40 ${
          isDone
            ? "text-emerald-500 hover:text-emerald-600"
            : isInProgress
            ? "text-blue-500 hover:text-blue-600"
            : "text-slate-300 hover:text-[#0052CC]"
        }`}
        aria-label={isDone ? "Mark as todo" : "Mark as done"}
      >
        {isDone ? (
          <CircleCheck className="h-4.5 w-4.5" strokeWidth={1.75} />
        ) : isInProgress ? (
          <CircleDashed className="h-4.5 w-4.5" strokeWidth={1.75} />
        ) : (
          <Circle className="h-4.5 w-4.5" strokeWidth={1.75} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium leading-snug transition-all duration-150 ${
                isDone
                  ? "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            >
              {subtask.title}
            </p>
            {subtask.description && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {subtask.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <button
              onClick={() => onEdit(subtask)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-[#0052CC] dark:hover:bg-indigo-950/40 transition-colors"
              title="Edit subtask"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(subtask.id)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 transition-colors"
              title="Delete subtask"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${statusMeta.chip}`}
          >
            <span className={`h-1 w-1 rounded-full ${statusMeta.dot}`} />
            {statusMeta.label}
          </span>

          {subtask.date && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Calendar className="h-3 w-3" />
              {new Date(`${subtask.date}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}

          {subtask.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Paperclip className="h-3 w-3" />
              {subtask.attachments.length}
            </span>
          )}
        </div>

        {subtask.attachments?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {subtask.attachments.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-sm"
              >
                <FileText className="h-3 w-3 text-[#0052CC]" />
                <span className="max-w-[120px] truncate">{a.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const IssueDetailView = ({
  task, currentUserId, isManager, canManageTask,
  onBack, onEdit, onDelete, onStatusChange, onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("comments");
  const [commentText, setCommentText] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [subtasksLoaded, setSubtasksLoaded] = useState(false);
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [subtaskForm, setSubtaskForm] = useState({ title: "", description: "", date: new Date().toISOString().slice(0, 10), status: "todo" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [subtaskLoading, setSubtaskLoading] = useState(false);
  const [subtaskError, setSubtaskError] = useState("");
  const [comments, setComments] = useState([]);
  const [showMoreFields, setShowMoreFields] = useState(false);
  const fileInputRef = useRef(null);

  const p = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const s = STATUS_META[task.status] || STATUS_META.todo;
  const StatusIcon = s.icon;
  const canManage = canManageTask(task);

  useEffect(() => {
    let active = true;
    setSubtasksLoaded(false);
    tasksAPI.getSubtasks(task.id)
      .then((r) => { const d = r?.data || r || []; if (active) { setSubtasks(Array.isArray(d) ? d : []); setSubtasksLoaded(true); } })
      .catch(() => active && setSubtasksLoaded(true));
    return () => { active = false; };
  }, [task.id]);

  useEffect(() => {
    let active = true;
    if (tasksAPI.getComments) {
      tasksAPI.getComments(task.id)
        .then((r) => { const d = r?.data || r || []; if (active) setComments(Array.isArray(d) ? d : []); })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [task.id]);

  const reloadSubtasks = () => {
    tasksAPI.getSubtasks(task.id)
      .then((r) => { const d = r?.data || r || []; setSubtasks(Array.isArray(d) ? d : []); })
      .catch(() => {});
  };

  const resetSubtaskForm = () => {
    setSubtaskForm({
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      status: "todo",
    });
    setSelectedFiles([]);
    setEditingSubtaskId(null);
    setSubtaskFormOpen(false);
    setSubtaskError("");
  };

  const startEditingSubtask = (subtask) => {
    setSubtaskForm({
      title: subtask.title || "",
      description: subtask.description || "",
      date: subtask.date ? subtask.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: subtask.status || "todo",
    });
    setSelectedFiles([]);
    setEditingSubtaskId(subtask.id);
    setSubtaskFormOpen(true);
    setSubtaskError("");
    setTimeout(() => {
      document.getElementById("subtask-form-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskForm.title.trim()) { setSubtaskError("Title is required"); return; }

    setSubtaskLoading(true);
    setSubtaskError("");

    const payload = new FormData();
    payload.append("title", subtaskForm.title.trim());
    payload.append("description", subtaskForm.description || "");
    payload.append("date", subtaskForm.date);
    payload.append("status", subtaskForm.status);
    selectedFiles.forEach((f) => payload.append("files", f));

    try {
      if (editingSubtaskId) {
        const res = await tasksAPI.updateSubtask(task.id, editingSubtaskId, payload);
        const saved = res?.data || res;
        setSubtasks((items) =>
          items.map((item) => (item.id === editingSubtaskId ? { ...item, ...saved } : item))
        );
      } else {
        const res = await tasksAPI.createSubtask(task.id, payload);
        const saved = res?.data || res;
        setSubtasks((items) => [...items, saved]);
      }
      resetSubtaskForm();
      reloadSubtasks();
    } catch (err) {
      setSubtaskError(err?.message || err?.response?.data?.message || "Failed to save subtask");
    } finally {
      setSubtaskLoading(false);
    }
  };

  const handleDeleteSubtask = async (id) => {
    if (!window.confirm("Delete this subtask?")) return;
    try { await tasksAPI.deleteSubtask(task.id, id); reloadSubtasks(); } catch {}
  };

  const handleToggleSubtask = async (subtask) => {
    const next = subtask.status === "done" ? "todo" : "done";
    setSubtasks((items) =>
      items.map((item) => (item.id === subtask.id ? { ...item, status: next } : item))
    );
    const payload = new FormData();
    payload.append("status", next);
    try {
      await tasksAPI.updateSubtask(task.id, subtask.id, payload);
      reloadSubtasks();
    } catch {
      setSubtasks((items) =>
        items.map((item) => (item.id === subtask.id ? { ...item, status: subtask.status } : item))
      );
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: `temp-${Date.now()}`,
      body: commentText.trim(),
      author: { full_name: "You", username: "you" },
      created_at: new Date().toISOString(),
    };
    setComments((c) => [...c, newComment]);
    setCommentText("");
    try {
      if (tasksAPI.addComment) {
        const res = await tasksAPI.addComment(task.id, { body: newComment.body });
        const saved = res?.data || res;
        setComments((c) => c.map((x) => (x.id === newComment.id ? saved : x)));
      }
    } catch {}
  };

  const doneSubtasks = subtasks.filter((x) => x.status === "done").length;
  const subtaskPct = subtasks.length ? Math.round((doneSubtasks / subtasks.length) * 100) : 0;
  const allAttachments = subtasks.flatMap((st) => (st.attachments || []).map((a) => ({ ...a, subtask: st.title })));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tasks</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-sm font-semibold text-[#0052CC]">TASK-{task.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Share"><Share2 className="h-4 w-4" /></button>
            <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Watch"><Eye className="h-4 w-4" /></button>
            <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="More"><MoreHorizontal className="h-4 w-4" /></button>
            {canManage && (
              <>
                <button onClick={() => onEdit(task)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => onDelete(task.id)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row">
        <div className="flex-1 min-w-0 space-y-5">
          <h1 className="text-2xl font-semibold leading-snug text-slate-900 dark:text-white">
            {task.summary}
          </h1>

          {task.description && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{task.description}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0052CC]/10 dark:bg-[#0052CC]/20">
                  <Layers className="h-3.5 w-3.5 text-[#0052CC]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Subtasks</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {subtasks.length > 0
                      ? `${doneSubtasks} of ${subtasks.length} completed`
                      : "Break this issue into smaller pieces of work"}
                  </p>
                </div>
                {subtasks.length > 0 && (
                  <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {subtaskPct}%
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (subtaskFormOpen) resetSubtaskForm();
                  else setSubtaskFormOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  subtaskFormOpen
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    : "bg-[#0052CC] text-white hover:bg-[#0747A6] shadow-sm"
                }`}
              >
                {subtaskFormOpen ? (
                  <><X className="h-3.5 w-3.5" /> Cancel</>
                ) : (
                  <><Plus className="h-3.5 w-3.5" /> Add subtask</>
                )}
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0052CC] to-blue-400 transition-all duration-500 ease-out"
                    style={{ width: `${subtaskPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {subtasksLoaded && subtasks.length === 0 && !subtaskFormOpen && (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                    <Layers className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No subtasks yet</p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    Click "Add subtask" to get started
                  </p>
                </div>
              )}

              {subtasks.map((st) => (
                <SubtaskItem
                  key={st.id}
                  subtask={st}
                  onToggle={handleToggleSubtask}
                  onEdit={startEditingSubtask}
                  onDelete={handleDeleteSubtask}
                  isEditing={editingSubtaskId === st.id}
                />
              ))}
            </div>

            {subtaskFormOpen && (
              <form
                id="subtask-form-anchor"
                onSubmit={handleAddSubtask}
                className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#0052CC]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {editingSubtaskId ? "Edit subtask" : "New subtask"}
                    </h4>
                  </div>
                  {editingSubtaskId && (
                    <span className="rounded-md bg-[#0052CC]/10 px-2 py-0.5 text-[10px] font-bold text-[#0052CC]">
                      Editing #{editingSubtaskId}
                    </span>
                  )}
                </div>

                {subtaskError && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-3 py-2 text-[11px] font-medium text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {subtaskError}
                  </div>
                )}

                <div className="space-y-2.5">
                  <input
                    autoFocus
                    required
                    value={subtaskForm.title}
                    onChange={(e) => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                    placeholder="Subtask title"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/15"
                  />
                  <textarea
                    rows={2}
                    value={subtaskForm.description}
                    onChange={(e) => setSubtaskForm({ ...subtaskForm, description: e.target.value })}
                    placeholder="Add details..."
                    className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/15"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={subtaskForm.date}
                        onChange={(e) => setSubtaskForm({ ...subtaskForm, date: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </label>
                      <select
                        value={subtaskForm.status}
                        onChange={(e) => setSubtaskForm({ ...subtaskForm, status: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/15"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-500 transition-colors hover:border-[#0052CC] hover:bg-[#0052CC]/5">
                    <Upload className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {selectedFiles.length
                        ? `${selectedFiles.length} file(s) selected`
                        : editingSubtaskId
                          ? "Attach additional files (optional)"
                          : "Attach files (optional)"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    />
                  </label>

                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFiles.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          <FileText className="h-3 w-3 text-[#0052CC]" />
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resetSubtaskForm}
                    className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={subtaskLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0052CC] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0747A6] disabled:opacity-50 transition-colors"
                  >
                    {subtaskLoading && <Loader className="h-3.5 w-3.5 animate-spin" />}
                    {subtaskLoading ? "Saving…" : editingSubtaskId ? "Save changes" : "Create subtask"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {allAttachments.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Attachments</h3>
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {allAttachments.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {allAttachments.map((a, i) => (
                  <div key={a.id || i} className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex h-20 items-center justify-center bg-slate-100 dark:bg-slate-900">
                      <FileText className="h-7 w-7 text-[#0052CC]" />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activity</h3>
                <button className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-1">
                {[
                  { k: "comments", label: "Comments", icon: MessageSquare },
                  { k: "history", label: "History", icon: History },
                  { k: "worklog", label: "Work log", icon: Timer },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.k}
                      onClick={() => setActiveTab(tab.k)}
                      className={`relative inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-semibold transition ${
                        activeTab === tab.k
                          ? "text-[#0052CC] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#0052CC]"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4">
              {activeTab === "comments" && (
                <>
                  <form onSubmit={handleAddComment} className="mb-5">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 focus-within:border-[#0052CC] focus-within:ring-1 focus-within:ring-[#0052CC]/30 transition">
                      <textarea
                        rows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full resize-none rounded-t-lg bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none"
                      />
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Paperclip className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Smile className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><AtSign className="h-3.5 w-3.5" /></button>
                        </div>
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="rounded-md bg-[#0052CC] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0747A6] disabled:opacity-40"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </form>

                  {comments.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">No comments yet. Be the first to comment.</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => {
                        const author = c.author?.full_name || c.author?.username || "User";
                        return (
                          <div key={c.id} className="flex gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(author)} text-[10px] font-bold text-white`}>
                              {initials(author)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{author}</span>
                                <span className="text-[11px] text-slate-400">
                                  {new Date(c.created_at || Date.now()).toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {c.body}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              {activeTab === "history" && (
                <p className="py-6 text-center text-xs text-slate-400">History will show changes to this issue.</p>
              )}
              {activeTab === "worklog" && (
                <p className="py-6 text-center text-xs text-slate-400">No work logged yet.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Details</h3>
              {canManage && (
                <button onClick={() => onEdit(task)} className="text-xs font-medium text-[#0052CC] hover:underline">Edit</button>
              )}
            </div>

            <div className="space-y-4">
              <DetailRow label="Status" icon={StatusIcon}>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className="rounded-md border border-transparent bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-200 dark:hover:border-slate-700 focus:border-[#0052CC] outline-none px-1 py-0.5"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </DetailRow>

              <DetailRow label="Assignee">
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(task.assignee.username)} text-[9px] font-bold text-white`}>
                      {initials(task.assignee.full_name || task.assignee.username)}
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {task.assignee.full_name || task.assignee.username}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400">Unassigned</span>
                )}
              </DetailRow>

              <DetailRow label="Reporter">
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor("reporter")} text-[9px] font-bold text-white`}>
                    {initials("Reporter User")}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">You</span>
                </div>
              </DetailRow>

              <DetailRow label="Priority">
                <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${p.chip}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}
                </span>
              </DetailRow>

              {task.due_date && (
                <DetailRow label="Due date">
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </DetailRow>
              )}

              {task.start_date && (
                <DetailRow label="Start date">
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    {new Date(task.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </DetailRow>
              )}

              {task.labels?.length > 0 && (
                <DetailRow label="Labels">
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map((l, i) => (
                      <span key={i} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">{l}</span>
                    ))}
                  </div>
                </DetailRow>
              )}

              {task.project && (
                <DetailRow label="Project">
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    <Folder className="h-2.5 w-2.5" />{task.project.summary}
                  </span>
                </DetailRow>
              )}
            </div>

            <button
              onClick={() => setShowMoreFields((v) => !v)}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#0052CC] hover:underline"
            >
              {showMoreFields ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMoreFields ? "Hide" : "Show"} more fields
            </button>
            {showMoreFields && (
              <div className="mt-3 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                <DetailRow label="Created">
                  <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                </DetailRow>
                <DetailRow label="Updated">
                  <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                </DetailRow>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const DetailRow = ({ label, icon: Icon, children }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-center gap-1.5 shrink-0 w-24">
      {Icon && <Icon className="h-3 w-3 text-slate-400" />}
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>
    <div className="min-w-0 flex-1 text-right">{children}</div>
  </div>
);

/* ─── Create / Edit Modal ──────────────────────────────────────── */
const CreateTaskModal = ({
  isEditMode, editingTaskId, formData, setFormData, projects, usersList,
  modalError, modalLoading, onSubmit, onClose,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiUsed, setAiUsed] = useState(false);
  const [aiMode, setAiMode] = useState("");

  const hasDescription = formData.description.trim().length > 0;
  const buttonLabel = hasDescription
    ? aiUsed ? "Regenerate" : "Enhance with AI"
    : "Generate with AI";

  const handleAISuggest = async () => {
    const taskTitle = formData.summary.trim();
    const existingDesc = formData.description.trim();

    if (!taskTitle) {
      setAiError("Please enter a task summary first");
      setTimeout(() => setAiError(""), 3000);
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const result = await suggestTaskTitleAndDescription(taskTitle, existingDesc);
      if (result?.description) {
        setFormData((prev) => ({ ...prev, description: result.description }));
        setAiUsed(true);
        setAiMode(result.mode || "generated");
      } else {
        setAiError("AI returned an empty response. Try again.");
      }
    } catch (err) {
      console.error("AI suggest error:", err);
      setAiError(err?.message || "Failed to generate description.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
    if (aiUsed) {
      setAiUsed(false);
      setAiMode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D6DCE8] bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#0C66E4] text-white">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditMode ? `Edit TASK-${editingTaskId}` : "New task item"}
              </h3>
              <p className="text-[11px] text-slate-500">Required fields are marked *</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          {modalError && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 p-3 text-xs font-medium text-red-700 dark:text-red-300">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text" required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0C66E4] focus:ring-2 focus:ring-[#0C66E4]/15 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          {/* ✨ DESCRIPTION with AI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Description <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleAISuggest}
                disabled={aiLoading || !formData.summary.trim()}
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/40 hover:scale-[1.03] active:scale-[0.98] disabled:from-slate-300 disabled:via-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 dark:disabled:from-slate-700 dark:disabled:via-slate-700 dark:disabled:to-slate-800"
                title={!formData.summary.trim() ? "Enter a task summary first" : buttonLabel}
              >
                {!aiLoading && formData.summary.trim() && (
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
                {aiLoading ? (
                  <><Loader className="h-3 w-3 animate-spin" /><span>Generating...</span></>
                ) : aiUsed ? (
                  <><RefreshCw className="h-3 w-3" /><span>Regenerate</span></>
                ) : hasDescription ? (
                  <><Wand2 className="h-3 w-3" /><span>Enhance with AI</span></>
                ) : (
                  <><Sparkles className="h-3 w-3" /><span>Generate with AI</span></>
                )}
              </button>
            </div>

            <p className="mb-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              {hasDescription
                ? "AI will enhance your existing description — or write fresh if it's too short."
                : "Write your own, or let AI generate a clear description from the task summary."}
            </p>

            <div className="relative">
              <div
                className={`rounded-lg p-[1.5px] transition-all duration-300 ${
                  aiLoading
                    ? "bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 animate-pulse"
                    : aiUsed
                    ? "bg-gradient-to-r from-violet-300 to-indigo-300 dark:from-violet-800 dark:to-indigo-800"
                    : "bg-transparent"
                }`}
              >
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  disabled={aiLoading}
                  placeholder={
                    formData.summary.trim()
                      ? hasDescription ? "" : "Click 'Generate with AI' to auto-write, or type your own..."
                      : "Enter a task summary first, then let AI write it for you..."
                  }
                  className={`w-full resize-none rounded-md border px-3 py-2.5 text-sm leading-relaxed outline-none transition-all disabled:cursor-not-allowed ${
                    aiLoading
                      ? "border-violet-300 dark:border-violet-700 opacity-70"
                      : aiUsed
                      ? "border-violet-200 dark:border-violet-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900/50"
                      : "border-[#C7D0E0] dark:border-slate-700 focus:border-[#0C66E4] focus:ring-2 focus:ring-[#0C66E4]/15"
                  } bg-white dark:bg-slate-950 dark:text-slate-200`}
                />
              </div>

              {aiLoading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/60 dark:to-indigo-950/60 px-3.5 py-2 shadow-sm border border-violet-200 dark:border-violet-800">
                    <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
                    <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                      AI is {hasDescription ? "enhancing" : "writing"}...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {aiUsed && !aiLoading && !aiError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                  <Sparkles className="h-2.5 w-2.5" />
                </div>
                <span>
                  {aiMode === "enhanced" ? "Enhanced by AI — feel free to edit" : "Generated by AI — feel free to edit"}
                </span>
              </div>
            )}

            {aiError && (
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/30 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.summary}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Assignee</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Unassigned</option>
                {usersList.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Start date</label>
              <input type="date" value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Due date</label>
              <input type="date" value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">Labels</label>
            <input
              type="text"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="Comma separated"
              className="w-full rounded border border-[#C7D0E0] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0C66E4] dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[#D6DCE8] pt-4 dark:border-slate-800">
            <button type="button" onClick={onClose}
              className="rounded px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={modalLoading}
              className="inline-flex items-center gap-2 rounded bg-[#0C66E4] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0055CC] disabled:opacity-50">
              {modalLoading && <Loader className="h-3.5 w-3.5 animate-spin" />}
              {isEditMode ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tasks;
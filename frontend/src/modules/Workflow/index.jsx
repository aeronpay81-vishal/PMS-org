import React, { useEffect, useMemo, useState } from "react";
import {
    Plus,
    MoreHorizontal,
    CalendarDays,
    Settings2,
    Zap,
    BarChart3,
    Clock3,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Loader2,
    X,
    Trash2,
} from "lucide-react";
import { projectsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";
import { authAPI } from "../../api/admin";

// Stage/column definitions. `key` must match the value stored in task.status
// coming back from the API (to_dict()'s `status` field on each task).
// Adjust these keys if your backend uses different status strings.
const STAGE_DEFS = [
    { id: "backlog", statusKey: "backlog", name: "Backlog", description: "Ideas & incoming tasks", color: "slate" },
    { id: "todo", statusKey: "todo", name: "To Do", description: "Tasks to be started", color: "blue" },
    { id: "progress", statusKey: "in_progress", name: "In Progress", description: "Tasks currently being worked on", color: "amber" },
    { id: "review", statusKey: "review", name: "Review", description: "Waiting for approval", color: "purple" },
    { id: "testing", statusKey: "testing", name: "Testing", description: "Quality verification", color: "cyan" },
    { id: "done", statusKey: "done", name: "Done", description: "Completed tasks", color: "green" },
];

const colorMap = {
    slate: "bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700",
    blue: "bg-blue-50/60 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900",
    amber: "bg-amber-50/60 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900",
    purple: "bg-purple-50/60 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900",
    cyan: "bg-cyan-50/60 border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900",
    green: "bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900",
};

const headingColors = {
    slate: "text-slate-700",
    blue: "text-blue-700",
    amber: "text-amber-700",
    purple: "text-purple-700",
    cyan: "text-cyan-700",
    green: "text-emerald-700",
};

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return "—";
    }
};

const initials = (name) => {
    if (!name) return "?";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
};

const priorityColor = (priority, isDone) => {
    if (isDone) return "text-emerald-500";
    if (priority === "high") return "text-red-500";
    return "text-amber-500";
};

// NEW: normalizes any status string the backend might send ("In Progress",
// "in-progress", " Review ", etc.) down to the flat keys used in STAGE_DEFS
// ("in_progress", "review", ...). Without this, a task whose status doesn't
// match a statusKey EXACTLY just silently disappears from every column.
const normalizeStatus = (raw) => {
    if (!raw) return "";
    return String(raw)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
};

const emptyForm = {
    summary: "",
    description: "",
    priority: "medium",
    status: "todo",
    assigned_to: "",
    due_date: "",
    start_date: "",
    labels: "",
};

const Workflow = ({ user }) => {
    // Only managers are allowed to add new tasks. Normal users can view the
    // board and its tasks, but the "Add Task" entry points are hidden/blocked
    // for them.
    const currentUser = user || authAPI.getStoredUser() || {};
    const isManager = currentUser?.role === "manager";

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectDetail, setProjectDetail] = useState(null);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assignable users (for the manager -> user assignment dropdown)
    const [users, setUsers] = useState([]);

    // Add-task side panel state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Load all projects for the selector
    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await projectsAPI.getAll();
                const list = data?.data || [];
                setProjects(list);
                if (list.length > 0) {
                    setSelectedProjectId(list[0].id);
                }
            } catch (err) {
                setError(err?.message || "Failed to load projects");
            } finally {
                setLoading(false);
            }
        };
        loadProjects();
    }, []);

    // Load assignable users once
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await authAPI.getUsers();
                setUsers(data?.data || data?.users || []);
            } catch (err) {
                // Non-fatal — the assignee dropdown just stays empty.
                setUsers([]);
            }
        };
        loadUsers();
    }, []);

    // Load full detail (with tasks) for the selected project.
    // FIX: projectsAPI.getById() doesn't always embed tasks the same way —
    // some backends return them under `tasks`, others under `assignments`,
    // and some don't embed them at all. We now fall back to fetching all
    // tasks separately and filtering by project_id, exactly like the AI
    // Insights page already does, so the board is never empty just because
    // of a field-name mismatch.
    const loadProjectDetail = async (silent = false) => {
        if (!selectedProjectId) return;
        try {
            if (!silent) setLoading(true);
            setError(null);

            const [detailRes, allTasksRes] = await Promise.all([
                projectsAPI.getById(selectedProjectId),
                tasksAPI.getAll().catch((e) => {
                    console.warn("Could not fetch fallback task list:", e);
                    return null;
                }),
            ]);

            const detail = detailRes?.data || detailRes || {};

            let embeddedTasks =
                (Array.isArray(detail.tasks) && detail.tasks.length > 0 && detail.tasks) ||
                (Array.isArray(detail.assignments) && detail.assignments.length > 0 && detail.assignments) ||
                [];

            if (embeddedTasks.length === 0 && allTasksRes) {
                const allTasks = Array.isArray(allTasksRes?.data)
                    ? allTasksRes.data
                    : Array.isArray(allTasksRes)
                        ? allTasksRes
                        : [];
                embeddedTasks = allTasks.filter((t) => t.project_id === selectedProjectId);
            }

            setProjectDetail({ ...detail, tasks: embeddedTasks });
        } catch (err) {
            setError(err?.message || "Failed to load project");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadProjectDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProjectId]);

    const tasks = projectDetail?.tasks || [];

    // Group tasks into stages based on their (normalized) status field.
    // FIX: uses normalizeStatus() on both sides so "In Progress", "in-progress",
    // "in_progress " etc. all land in the right column instead of vanishing.
    const stages = useMemo(() => {
        return STAGE_DEFS.map((def) => {
            const stageTasks = tasks.filter(
                (t) => normalizeStatus(t.status) === def.statusKey
            );
            return { ...def, tasks: stageTasks, count: stageTasks.length };
        });
    }, [tasks]);

    // Any tasks whose status didn't match ANY known stage — surfaced so this
    // is visible instead of tasks just silently disappearing.
    const unmatchedTasks = useMemo(() => {
        const knownKeys = new Set(STAGE_DEFS.map((d) => d.statusKey));
        return tasks.filter((t) => !knownKeys.has(normalizeStatus(t.status)));
    }, [tasks]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => normalizeStatus(t.status) === "done").length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const bottlenecks = STAGE_DEFS
            .filter((d) => ["review", "testing"].includes(d.id))
            .map((d) => ({
                name: d.name,
                count: tasks.filter((t) => normalizeStatus(t.status) === d.statusKey).length,
                color: d.color,
            }))
            .filter((b) => b.count > 0);
        return { total, completed, progress, bottlenecks };
    }, [tasks]);

    // ---------- Add Task drawer handlers ----------

    const openDrawer = (presetStatus) => {
        // Guard: normal users should never be able to open the create-task
        // drawer, even if this gets called from somewhere unexpected.
        if (!isManager) return;
        setForm({ ...emptyForm, status: presetStatus || "todo" });
        setFormError(null);
        setIsDrawerOpen(true);
        setIsClosing(false);
    };

    const closeDrawer = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsDrawerOpen(false);
            setIsClosing(false);
        }, 220);
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!isManager) {
            setFormError("Only managers can add tasks.");
            return;
        }
        if (!form.summary.trim()) {
            setFormError("Task title is required.");
            return;
        }
        if (!selectedProjectId) {
            setFormError("Select a project first.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);
            await tasksAPI.create({
                project_id: selectedProjectId,
                summary: form.summary,
                description: form.description,
                priority: form.priority,
                status: form.status,
                assigned_to: form.assigned_to || null,
                due_date: form.due_date || null,
                start_date: form.start_date || null,
                labels: form.labels,
            });
            await loadProjectDetail(true);
            closeDrawer();
        } catch (err) {
            setFormError(err?.message || "Failed to create task.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Remove this task?")) return;
        try {
            setDeletingId(taskId);
            await tasksAPI.delete(taskId);
            await loadProjectDetail(true);
        } catch (err) {
            setError(err?.message || "Failed to delete task.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading && !projectDetail) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Zap size={20} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Workflow Engine
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage tasks and project workflow stages
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        {/* PROJECT SELECTOR */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProjectMenu((v) => !v)}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left dark:border-slate-700 dark:bg-slate-800"
                            >
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                        Project
                                    </p>

                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                        {projectDetail?.summary || "Select a project"}
                                    </p>
                                </div>

                                <ChevronDown size={16} className="text-slate-400" />
                            </button>

                            {showProjectMenu && (
                                <div className="absolute left-0 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                    {projects.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedProjectId(p.id);
                                                setShowProjectMenu(false);
                                            }}
                                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                                        >
                                            {p.summary}
                                        </button>
                                    ))}
                                    {projects.length === 0 && (
                                        <p className="px-3 py-2 text-sm text-slate-400">No projects found</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            <Settings2 size={17} />
                            Settings
                        </button>

                        {/* Add Task — managers only */}
                        {isManager && (
                            <button
                                onClick={() => openDrawer("todo")}
                                disabled={!selectedProjectId}
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Plus size={17} />
                                Add Task
                            </button>
                        )}
                    </div>
                </div>
            </div>


            {/* WORKFLOW INFO */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {projectDetail?.summary || "Workflow"}
                        </h2>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40">
                            {projectDetail?.status || "Active"}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {projectDetail?.description || "Move tasks through the development lifecycle."}
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm">

                    <div>
                        <p className="text-xs text-slate-400">Total Tasks</p>
                        <p className="font-bold text-slate-800 dark:text-white">{stats.total}</p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">Completed</p>
                        <p className="font-bold text-emerald-600">{stats.completed}</p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">Progress</p>
                        <p className="font-bold text-blue-600">{stats.progress}%</p>
                    </div>
                </div>
            </div>

            {/* Heads-up banner if some tasks came back with a status that doesn't
                match any column — so they're visible instead of silently missing */}
            {unmatchedTasks.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">
                            {unmatchedTasks.length} task{unmatchedTasks.length > 1 ? "s" : ""} not shown on the board
                        </p>
                        <p className="mt-1">
                            Their status doesn't match a known stage (
                            {[...new Set(unmatchedTasks.map((t) => t.status || "empty"))].join(", ")}
                            ). Update STAGE_DEFS' statusKey values to match, or fix the task's status.
                        </p>
                    </div>
                </div>
            )}


            {/* WORKFLOW BOARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="mb-5 flex items-center justify-between">

                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Project Workflow
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Track your project from planning to completion.
                        </p>
                    </div>

                    {isManager && (
                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
                            <Plus size={14} />
                            Add Stage
                        </button>
                    )}
                </div>


                {/* HORIZONTAL BOARD */}
                <div className="overflow-x-auto pb-3">

                    <div className="flex min-w-[1500px] gap-4">

                        {stages.map((stage) => (

                            <div
                                key={stage.id}
                                className={`w-[245px] shrink-0 rounded-xl border p-3 ${colorMap[stage.color]}`}
                            >

                                {/* STAGE HEADER */}
                                <div className="mb-3 flex items-start justify-between">

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-sm font-bold ${headingColors[stage.color]}`}>
                                                {stage.name}
                                            </h3>

                                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:bg-slate-800">
                                                {stage.count}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {stage.description}
                                        </p>
                                    </div>

                                    <button className="rounded-lg p-1 hover:bg-white/70 dark:hover:bg-slate-800">
                                        <MoreHorizontal size={17} className="text-slate-400" />
                                    </button>
                                </div>


                                {/* ADD TASK — managers only */}
                                {isManager && (
                                    <button
                                        onClick={() => openDrawer(stage.statusKey)}
                                        className="mb-3 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white/50 py-2 text-xs font-medium text-blue-600 hover:bg-white dark:border-slate-700 dark:bg-slate-900/30"
                                    >
                                        <Plus size={14} />
                                        Add Task
                                    </button>
                                )}


                                {/* TASKS */}
                                <div className="space-y-2">

                                    {stage.tasks.map((task) => {
                                        const isDone = normalizeStatus(task.status) === "done";
                                        const assigneeName = task.assignee?.full_name || task.assignee?.username;
                                        return (
                                            <div
                                                key={task.id}
                                                className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="text-xs font-semibold leading-5 text-slate-800 dark:text-slate-100">
                                                        {task.summary || task.description}
                                                    </h4>

                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        disabled={deletingId === task.id}
                                                        title="Remove task"
                                                        className="shrink-0 rounded p-0.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30"
                                                    >
                                                        {deletingId === task.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                        {task.labels?.[0] || "General"}
                                                    </span>

                                                    <span className={`text-[10px] font-semibold ${priorityColor(task.priority, isDone)}`}>
                                                        {isDone ? "Done" : (task.priority || "Medium")}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                        <CalendarDays size={12} />
                                                        {formatDate(task.due_date)}
                                                    </div>

                                                    <div
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
                                                        title={assigneeName || "Unassigned"}
                                                    >
                                                        {initials(assigneeName)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {stage.tasks.length === 0 && (
                                        <p className="py-4 text-center text-[11px] text-slate-400">
                                            No tasks
                                        </p>
                                    )}
                                </div>

                            </div>

                        ))}

                    </div>
                </div>
            </div>


            {/* BOTTOM ANALYTICS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <BarChart3 size={17} />
                        Workflow Overview
                    </div>

                    <div className="mt-4 flex items-end gap-5">
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-slate-400">Total Tasks</p>
                        </div>

                        <div>
                            <p className="text-2xl font-bold text-blue-600">{stats.total - stats.completed}</p>
                            <p className="text-xs text-slate-400">Active</p>
                        </div>
                    </div>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <CheckCircle2 size={17} />
                        Completion
                    </div>

                    <p className="mt-4 text-2xl font-bold text-emerald-600">{stats.progress}%</p>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <Clock3 size={17} />
                        Average Cycle Time
                    </div>

                    <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                        {/* Backend doesn't currently expose cycle time; wire this up once that field/endpoint exists */}
                        —
                    </p>

                    <p className="mt-1 text-xs text-slate-400">Not available yet</p>
                </div>


                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <AlertTriangle size={17} />
                        Bottlenecks
                    </div>

                    <div className="mt-4 space-y-2">
                        {stats.bottlenecks.length > 0 ? (
                            stats.bottlenecks.map((b) => (
                                <div key={b.name} className="flex justify-between text-xs">
                                    <span className="text-slate-500">{b.name}</span>
                                    <span className={`font-semibold ${headingColors[b.color]}`}>
                                        {b.count} {b.count === 1 ? "task" : "tasks"}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400">No bottlenecks</p>
                        )}
                    </div>
                </div>

            </div>


            {/* AUTOMATION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-amber-500" />

                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Workflow Automation
                            </h3>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            Automate common project actions.
                        </p>
                    </div>

                    <button className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 dark:bg-blue-950/30">
                        Manage Rules
                    </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <AutomationItem
                        title="Move task to Review"
                        description="When all subtasks are completed"
                    />
                    <AutomationItem
                        title="Notify team"
                        description="When a task is assigned"
                    />
                    <AutomationItem
                        title="Prioritize overdue"
                        description="When task passes due date"
                    />
                </div>
            </div>


            {/* ADD TASK DRAWER — managers only, slides in from the right, closes back to the right */}
            {isManager && isDrawerOpen && (
                <div className="fixed inset-0 z-50">
                    {/* Overlay */}
                    <div
                        onClick={closeDrawer}
                        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${isClosing ? "opacity-0" : "opacity-100"
                            }`}
                    />

                    {/* Panel */}
                    <div
                        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ease-out dark:bg-slate-900 ${isClosing ? "translate-x-full" : "translate-x-0"
                            }`}
                        style={!isClosing ? { animation: "workflowDrawerIn 220ms ease-out" } : undefined}
                    >
                        <style>{`
                            @keyframes workflowDrawerIn {
                                from { transform: translateX(100%); }
                                to { transform: translateX(0); }
                            }
                        `}</style>

                        <form onSubmit={handleCreateTask} className="flex h-full flex-col">

                            {/* Panel header */}
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        New Task
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {projectDetail?.summary || "Select a project"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Panel body */}
                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.summary}
                                        onChange={(e) => handleFormChange("summary", e.target.value)}
                                        placeholder="e.g. Design login screen"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => handleFormChange("description", e.target.value)}
                                        placeholder="Add more detail..."
                                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                {/* Assign to user — manager -> user assignment */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Assign to
                                    </label>
                                    <select
                                        value={form.assigned_to}
                                        onChange={(e) => handleFormChange("assigned_to", e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.full_name || u.username}{u.role ? ` · ${u.role}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {users.length === 0 && (
                                        <p className="mt-1 text-[11px] text-amber-600">
                                            No users loaded yet.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Priority
                                        </label>
                                        <select
                                            value={form.priority}
                                            onChange={(e) => handleFormChange("priority", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Stage
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) => handleFormChange("status", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        >
                                            {STAGE_DEFS.map((s) => (
                                                <option key={s.id} value={s.statusKey}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Start date
                                        </label>
                                        <input
                                            type="date"
                                            value={form.start_date}
                                            onChange={(e) => handleFormChange("start_date", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            Due date
                                        </label>
                                        <input
                                            type="date"
                                            value={form.due_date}
                                            onChange={(e) => handleFormChange("due_date", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Labels
                                    </label>
                                    <input
                                        type="text"
                                        value={form.labels}
                                        onChange={(e) => handleFormChange("labels", e.target.value)}
                                        placeholder="Design, Frontend (comma separated)"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                {formError && (
                                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/30">
                                        {formError}
                                    </p>
                                )}
                            </div>

                            {/* Panel footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting && <Loader2 size={15} className="animate-spin" />}
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};


const AutomationItem = ({ title, description }) => {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</p>
                <p className="mt-1 text-[11px] text-slate-400">{description}</p>
            </div>

            <div className="h-5 w-9 rounded-full bg-emerald-500 p-0.5">
                <div className="ml-auto h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
        </div>
    );
};

export default Workflow;
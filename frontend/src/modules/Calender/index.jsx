import React, { useEffect, useMemo, useState } from "react";
import {CalendarDays,ChevronLeft,ChevronRight,ChevronDown,Filter,Plus,CheckCircle2,Clock3,AlertTriangle,
    ListTodo,
    Loader2,
} from "lucide-react";
import { projectsAPI } from "../../api/project";

// Reference "today" used for highlighting the current day and grouping the
// Upcoming Deadlines panel. Swap this for `new Date()` once you want the
// calendar to always default to the real current date instead of a fixed one.
const REFERENCE_TODAY = new Date(2026, 8, 20);

const toDateKey = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;
};

const dateKeyFromYMD = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// Maps a task's raw status/priority (as stored by the API) to the display
// labels the calendar's styling helpers expect (Low / Medium / High / Completed).
const getDisplayPriority = (task) => {
    if ((task.status || "").toLowerCase() === "done") return "Completed";
    const p = (task.priority || "medium").toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1);
};

export const Calender = ({ user }) => {
    const [currentDate, setCurrentDate] = useState(REFERENCE_TODAY);
    const [view, setView] = useState("Month");

    // Project API state
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectDetail, setProjectDetail] = useState(null);
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const monthName = currentDate.toLocaleString("en-US", {
        month: "long",
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

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

    // Load full detail (with tasks) for the selected project
    useEffect(() => {
        const loadProjectDetail = async () => {
            if (!selectedProjectId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await projectsAPI.getById(selectedProjectId);
                setProjectDetail(data?.data || data);
            } catch (err) {
                setError(err?.message || "Failed to load project");
            } finally {
                setLoading(false);
            }
        };
        loadProjectDetail();
    }, [selectedProjectId]);

    // Normalize tasks coming back from the API into the shape the calendar
    // grid/deadlines panel work with: { id, title, date, priority, status }
    const tasks = useMemo(() => {
        const rawTasks = projectDetail?.tasks || [];
        return rawTasks
            .map((t) => ({
                id: t.id,
                title: t.summary || t.description || "Untitled task",
                date: toDateKey(t.due_date),
                priority: getDisplayPriority(t),
                status: (t.status || "").toLowerCase(),
                project: projectDetail?.summary || "",
            }))
            .filter((t) => t.date); // skip tasks with no due date on the calendar grid
    }, [projectDetail]);

    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Monday first
        const mondayFirst = firstDay === 0 ? 6 : firstDay - 1;

        const result = [];

        for (let i = 0; i < mondayFirst; i++) {
            result.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            result.push(i);
        }

        while (result.length < 42) {
            result.push(null);
        }

        return result;
    }, [year, month]);

    const getDateString = (day) => {
        if (!day) return "";
        return dateKeyFromYMD(year, month, day);
    };

    const getTasksForDay = (day) => {
        if (!day) return [];

        const date = getDateString(day);

        return tasks.filter((task) => task.date === date);
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-50 text-red-600 border-red-100";

            case "Medium":
                return "bg-orange-50 text-orange-600 border-orange-100";

            case "Completed":
                return "bg-purple-50 text-purple-600 border-purple-100";

            default:
                return "bg-emerald-50 text-emerald-600 border-emerald-100";
        }
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-500";

            case "Medium":
                return "bg-orange-500";

            case "Completed":
                return "bg-purple-500";

            default:
                return "bg-emerald-500";
        }
    };

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToday = () => {
        setCurrentDate(new Date(REFERENCE_TODAY));
    };

    const todayKey = toDateKey(REFERENCE_TODAY);
    const todayDay = REFERENCE_TODAY.getDate();
    const todayMonth = REFERENCE_TODAY.getMonth();
    const todayYear = REFERENCE_TODAY.getFullYear();

    // Group upcoming (non-completed) tasks by day for the side panel:
    // Today / Tomorrow / actual date, in ascending date order.
    const upcomingGroups = useMemo(() => {
        const upcoming = tasks
            .filter((t) => t.status !== "done" && t.date && t.date >= todayKey)
            .sort((a, b) => a.date.localeCompare(b.date));

        const groups = [];
        const byDate = new Map();

        upcoming.forEach((task) => {
            if (!byDate.has(task.date)) byDate.set(task.date, []);
            byDate.get(task.date).push(task);
        });

        const tomorrow = new Date(todayYear, todayMonth, todayDay + 1);
        const tomorrowKey = toDateKey(tomorrow);

        Array.from(byDate.keys())
            .sort()
            .slice(0, 3) // cap at 3 date groups so the panel stays compact
            .forEach((dateKey) => {
                let label;
                if (dateKey === todayKey) {
                    label = `Today · ${new Date(dateKey).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}`;
                } else if (dateKey === tomorrowKey) {
                    label = `Tomorrow · ${new Date(dateKey).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}`;
                } else {
                    label = new Date(dateKey).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });
                }
                groups.push({ dateKey, label, tasks: byDate.get(dateKey) });
            });

        return groups;
    }, [tasks, todayKey, todayYear, todayMonth, todayDay]);

    // Stats derived from the currently loaded project's tasks
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === "done").length;
        const inProgress = tasks.filter((t) => t.status === "in_progress").length;
        const todo = tasks.filter((t) => t.status === "todo" || t.status === "backlog").length;
        const overdue = tasks.filter(
            (t) => t.status !== "done" && t.date && t.date < todayKey
        ).length;

        const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

        return {
            total,
            completed,
            inProgress,
            todo,
            overdue,
            completedPct: pct(completed),
            inProgressPct: pct(inProgress),
            todoPct: pct(todo),
            overduePct: pct(overdue),
        };
    }, [tasks, todayKey]);

    const isBoardLoading = loading && !projectDetail;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <CalendarDays size={22} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Calendar
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    View and manage project tasks, deadlines and events.
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                        {/* Project selector */}
                        <div className="relative min-w-[210px]">
                            <button
                                onClick={() => setShowProjectMenu((v) => !v)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800"
                            >

                                <div className="flex items-center gap-2">

                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {projectDetail?.summary || "Select a project"}
                                    </span>

                                </div>

                                <ChevronDown
                                    size={16}
                                    className="text-slate-400"
                                />

                            </button>

                            {showProjectMenu && (
                                <div className="absolute left-0 z-10 mt-2 w-full min-w-[210px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
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

                        {/* Add Task */}
                        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                            <Plus size={17} />
                            Add Task
                        </button>

                    </div>
                </div>
            </div>


            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/20">
                    {error}
                </div>
            )}


            {/* Calendar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                {/* Calendar Toolbar */}
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    <div className="flex items-center gap-2">

                        <button
                            onClick={previousMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <button
                            onClick={nextMonth}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={17} />
                        </button>

                        <button
                            onClick={goToday}
                            className="ml-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Today
                        </button>

                        <div className="ml-3 flex items-center gap-2">

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {monthName} {year}
                            </h2>

                            <ChevronDown
                                size={17}
                                className="text-slate-400"
                            />

                        </div>
                    </div>


                    <div className="flex items-center gap-3">

                        {/* View */}
                        <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">

                            {["Month", "Week", "Day"].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setView(item)}
                                    className={`px-4 py-2 text-xs font-semibold transition ${view === item
                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                                            : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}

                        </div>

                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            <Filter size={14} />
                            Filters
                        </button>

                    </div>
                </div>


                {/* Calendar + Deadlines */}
                <div className="grid gap-5 xl:grid-cols-[1fr_300px]">

                    {/* Calendar Grid */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

                        {isBoardLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-900/70">
                                <Loader2 className="animate-spin text-blue-600" size={26} />
                            </div>
                        )}

                        {/* Week Days */}
                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">

                            {[
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                                "Sun",
                            ].map((day) => (
                                <div
                                    key={day}
                                    className="px-3 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400"
                                >
                                    {day}
                                </div>
                            ))}

                        </div>


                        {/* Days */}
                        <div className="grid grid-cols-7">

                            {days.map((day, index) => {

                                const dayTasks = getTasksForDay(day);
                                const isToday =
                                    day === todayDay && month === todayMonth && year === todayYear;

                                return (
                                    <div
                                        key={index}
                                        className="min-h-[115px] border-b border-r border-slate-100 p-2 dark:border-slate-800"
                                    >

                                        {day && (
                                            <>
                                                <div className="mb-2 flex justify-between">

                                                    <span
                                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday
                                                                ? "bg-blue-600 text-white"
                                                                : "text-slate-600 dark:text-slate-400"
                                                            }`}
                                                    >
                                                        {day}
                                                    </span>

                                                    {dayTasks.length > 2 && (
                                                        <span className="text-[10px] text-slate-400">
                                                            +{dayTasks.length - 2}
                                                        </span>
                                                    )}

                                                </div>


                                                <div className="space-y-1">

                                                    {dayTasks.slice(0, 2).map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`truncate rounded-md border px-2 py-1.5 text-[10px] font-medium ${getPriorityStyle(
                                                                task.priority
                                                            )}`}
                                                            title={task.title}
                                                        >
                                                            <div className="flex items-center gap-1">

                                                                <span
                                                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPriorityDot(
                                                                        task.priority
                                                                    )}`}
                                                                />

                                                                <span className="truncate">
                                                                    {task.title}
                                                                </span>

                                                            </div>
                                                        </div>
                                                    ))}

                                                    {dayTasks.length === 0 && null}

                                                </div>
                                            </>
                                        )}

                                    </div>
                                );
                            })}

                        </div>
                    </div>


                    {/* Upcoming Deadlines */}
                    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-2">

                                <CalendarDays
                                    size={17}
                                    className="text-blue-600"
                                />

                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Upcoming Deadlines
                                </h3>

                            </div>

                        </div>

                        {upcomingGroups.length === 0 && !isBoardLoading && (
                            <p className="mt-5 text-xs text-slate-400">
                                No upcoming deadlines for this project.
                            </p>
                        )}

                        {upcomingGroups.map((group) => (
                            <div key={group.dateKey} className="mt-5">

                                <p
                                    className={`mb-2 text-xs font-semibold ${group.dateKey === todayKey ? "text-blue-600" : "text-slate-500"
                                        }`}
                                >
                                    {group.label}
                                </p>

                                {group.tasks.map((task) => (
                                    <DeadlineItem
                                        key={task.id}
                                        title={task.title}
                                        project={task.project}
                                        priority={task.priority === "Completed" ? "Medium" : task.priority}
                                        color={
                                            task.priority === "High"
                                                ? "red"
                                                : task.priority === "Medium"
                                                    ? "orange"
                                                    : "green"
                                        }
                                    />
                                ))}

                            </div>
                        ))}


                        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50">
                            View All Tasks
                            <ChevronRight size={14} />
                        </button>

                    </div>

                </div>


                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-5 px-2">

                    <Legend color="bg-emerald-500" text="Low Priority" />
                    <Legend color="bg-orange-500" text="Medium Priority" />
                    <Legend color="bg-red-500" text="High Priority" />
                    <Legend color="bg-blue-500" text="In Progress" />
                    <Legend color="bg-purple-500" text="Completed" />

                </div>
            </div>


            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

                <Stat
                    icon={ListTodo}
                    title="Total Tasks"
                    value={stats.total}
                    color="purple"
                />

                <Stat
                    icon={CheckCircle2}
                    title="Completed"
                    value={stats.completed}
                    extra={`${stats.completedPct}%`}
                    color="blue"
                />

                <Stat
                    icon={Clock3}
                    title="In Progress"
                    value={stats.inProgress}
                    extra={`${stats.inProgressPct}%`}
                    color="orange"
                />

                <Stat
                    icon={ListTodo}
                    title="To Do"
                    value={stats.todo}
                    extra={`${stats.todoPct}%`}
                    color="green"
                />

                <Stat
                    icon={AlertTriangle}
                    title="Overdue"
                    value={stats.overdue}
                    extra={`${stats.overduePct}%`}
                    color="red"
                />

            </div>

        </div>
    );
};


const DeadlineItem = ({
    title,
    project,
    priority,
    color,
}) => {

    const dots = {
        green: "bg-emerald-500",
        orange: "bg-orange-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        red: "bg-red-500",
    };

    const priorityColor =
        priority === "High"
            ? "text-red-500"
            : "text-orange-500";

    return (
        <div className="mb-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">

            <div className="flex items-start gap-2">

                <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dots[color] || "bg-slate-400"}`}
                />

                <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {title}
                        </p>

                        <span className={`shrink-0 text-[10px] font-semibold ${priorityColor}`}>
                            {priority}
                        </span>

                    </div>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                        {project}
                    </p>

                </div>

            </div>

        </div>
    );
};


const Legend = ({ color, text }) => {
    return (
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {text}
        </div>
    );
};


const Stat = ({
    icon: Icon,
    title,
    value,
    extra,
    color,
}) => {

    const colors = {
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/30",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/30",
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30",
        red: "bg-red-50 text-red-600 dark:bg-red-950/30",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
                >
                    <Icon size={18} />
                </div>

                <div>
                    <p className="text-xs text-slate-400">
                        {title}
                    </p>

                    <div className="mt-1 flex items-end gap-2">

                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {value}
                        </p>

                        {extra && (
                            <span className="mb-1 text-[10px] font-semibold text-slate-400">
                                {extra}
                            </span>
                        )}

                    </div>
                </div>

            </div>

        </div>
    );
};

export default Calender;
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
    Activity, AlertTriangle, ArrowRight, Brain, CalendarDays, Check, ChevronRight, Clock3, Flame, GitBranch,
    Lightbulb,
    Loader2,
    MessageSquare,
    RefreshCw,
    Send,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Zap,
    X,
} from "lucide-react";
import { aiClient } from "../../api/aiClient";
import { projectsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";

export default function Aiinsight({ user, projectId = null }) {
    const [projects, setProjects] = useState([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [question, setQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [showSprintModal, setShowSprintModal] = useState(false);
    const [sprintPlan, setSprintPlan] = useState(null);
    const [sprintLoading, setSprintLoading] = useState(false);

    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState("");

    const [actions, setActions] = useState([
        // {
        //     id: 1,
        //     type: "danger",
        //     title: "3 overdue tasks need attention",
        //     description:
        //         "AI recommends prioritizing API Integration and moving QA Review ahead of Documentation.",
        //     action: "Review tasks",
        // },
        // {
        //     id: 2,
        //     type: "warning",
        //     title: "Deadline risk detected",
        //     description:
        //         "The current velocity suggests the project may finish 2 days after the planned date.",
        //     action: "View prediction",
        // },
        // {
        //     id: 3,
        //     type: "success",
        //     title: "Workload can be optimized",
        //     description:
        //         "2 tasks can be moved from an overloaded team member to available capacity.",
        //     action: "Optimize workload",
        // },
    ]);

    // -----------------------------------------------------------------------
    // Fetch real project data & tasks using projectsAPI and tasksAPI
    // -----------------------------------------------------------------------
    const loadProjects = useCallback(async () => {
        try {
            let projectsList = [];
            let allTasks = [];

            try {
                const taskRes = await tasksAPI.getAll();
                allTasks = Array.isArray(taskRes?.data) ? taskRes.data : (Array.isArray(taskRes) ? taskRes : []);
            } catch (e) {
                console.warn("Could not fetch separate tasks:", e);
            }

            if (projectId) {
                const single = await projectsAPI.getById(projectId);
                const projData = single?.data || single;
                projectsList = Array.isArray(projData) ? projData : (projData ? [projData] : []);
            } else {
                const res = await projectsAPI.getAll();
                projectsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            }

            // Merge tasks into projects
            const enriched = projectsList.map((p) => {
                const projTasks =
                    (p.tasks && p.tasks.length > 0)
                        ? p.tasks
                        : (p.assignments && p.assignments.length > 0)
                            ? p.assignments
                            : allTasks.filter((t) => t.project_id === p.id);
                return {
                    ...p,
                    tasks: projTasks,
                };
            });

            setProjects(enriched);
        } catch (err) {
            console.error("Error loading projects for AI Insight:", err);
            setProjects([]);
        } finally {
            setProjectsLoaded(true);
        }
    }, [projectId]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // -----------------------------------------------------------------------
    // Compute dynamic or fallback analytics from real data
    // -----------------------------------------------------------------------
    const allProjectTasks = useMemo(() => {
        return projects.flatMap((p) => p.tasks || []);
    }, [projects]);

    const totalTasksCount = allProjectTasks.length;
    const completedTasksCount = allProjectTasks.filter((t) => {
        const s = (t.status || "").toLowerCase();
        return s === "done" || s === "completed" || s === "closed";
    }).length;
    const overdueTasksCount = allProjectTasks.filter((t) => {
        const s = (t.status || "").toLowerCase();
        if (!t.due_date || s === "done" || s === "completed" || s === "closed") return false;
        return new Date(t.due_date) < new Date();
    }).length;

    const health = useMemo(() => {
        if (totalTasksCount === 0) return 82;
        const completionRate = completedTasksCount / totalTasksCount;
        const overdueRate = overdueTasksCount / totalTasksCount;
        let score = Math.round(50 + completionRate * 40 - overdueRate * 30);
        return Math.max(20, Math.min(98, score));
    }, [totalTasksCount, completedTasksCount, overdueTasksCount]);

    const risks = useMemo(() => {
        if (projects.length === 0) {
            return [
                {
                    title: "Release deadline risk",
                    probability: 72,
                    severity: "High",
                    description: "Current sprint velocity is below the required pace for the planned release.",
                    tasks: ["API Integration", "QA Testing", "Deployment"],
                },
                {
                    title: "Team capacity risk",
                    probability: 58,
                    severity: "Medium",
                    description: "One team member is carrying significantly more work than the team average.",
                    tasks: ["Frontend Polish", "Dashboard UI"],
                },
                {
                    title: "Dependency risk",
                    probability: 41,
                    severity: "Medium",
                    description: "API completion is blocking multiple downstream tasks.",
                    tasks: ["Authentication", "Testing", "Deployment"],
                },
            ];
        }

        const criticalProjects = projects.filter((p) => (p.priority || "").toLowerCase() === "critical" || (p.priority || "").toLowerCase() === "high");
        return [
            {
                title: overdueTasksCount > 0 ? `${overdueTasksCount} overdue tasks risk` : "Timeline and delivery pace",
                probability: overdueTasksCount > 0 ? Math.min(88, 40 + overdueTasksCount * 12) : 35,
                severity: overdueTasksCount > 2 ? "High" : "Medium",
                description: overdueTasksCount > 0
                    ? `${overdueTasksCount} tasks are currently past their due dates and need immediate rescheduling.`
                    : "All tracked milestones are on schedule with acceptable cycle times.",
                tasks: allProjectTasks.slice(0, 3).map((t) => t.summary || t.task_detail || "Active task"),
            },
            {
                title: `${criticalProjects.length} critical priority initiatives`,
                probability: criticalProjects.length > 0 ? 65 : 25,
                severity: criticalProjects.length > 1 ? "High" : "Low",
                description: `${criticalProjects.length} projects require leadership oversight and high attention.`,
                tasks: criticalProjects.slice(0, 3).map((p) => p.summary || "Critical Project"),
            },
            {
                title: "Resource & task allocation",
                probability: 42,
                severity: "Medium",
                description: "Workload distribution is actively managed across active project assignments.",
                tasks: allProjectTasks.slice(3, 6).map((t) => t.summary || t.task_detail || "Team task"),
            },
        ];
    }, [projects, allProjectTasks, overdueTasksCount]);

    const team = useMemo(() => {
        if (projects.length === 0) {
            return [
                { name: "Manish", role: "Frontend", workload: 92, status: "Overloaded", color: "bg-red-500" },
                { name: "Rahul", role: "Backend", workload: 67, status: "Balanced", color: "bg-blue-500" },
                { name: "Priya", role: "QA", workload: 43, status: "Available", color: "bg-emerald-500" },
                { name: "Aman", role: "UI/UX", workload: 76, status: "Busy", color: "bg-amber-500" },
            ];
        }

        const memberMap = {};
        allProjectTasks.forEach((t) => {
            const name = t.assignee?.full_name || t.assignee?.username || t.assigned_to_name || "Assigned Team";
            const role = t.assignee?.role || "Developer";
            if (!memberMap[name]) {
                memberMap[name] = { name, role, total: 0, done: 0 };
            }
            memberMap[name].total += 1;
            if (["done", "completed", "closed"].includes((t.status || "").toLowerCase())) {
                memberMap[name].done += 1;
            }
        });

        const members = Object.values(memberMap);
        if (members.length === 0) {
            return [
                { name: "Team Member 1", role: "Lead", workload: 65, status: "Balanced", color: "bg-blue-500" },
                { name: "Team Member 2", role: "Engineer", workload: 45, status: "Available", color: "bg-emerald-500" },
            ];
        }

        return members.map((m, idx) => {
            const active = m.total - m.done;
            const workload = Math.min(95, Math.max(30, active * 20 + 20));
            const status = workload > 80 ? "Overloaded" : workload > 65 ? "Busy" : workload > 40 ? "Balanced" : "Available";
            const color = workload > 80 ? "bg-red-500" : workload > 65 ? "bg-amber-500" : workload > 40 ? "bg-blue-500" : "bg-emerald-500";
            return {
                name: m.name,
                role: m.role,
                workload,
                status,
                color,
            };
        });
    }, [projects, allProjectTasks]);

    const priorities = useMemo(() => {
        if (allProjectTasks.length === 0) {
            return [
                { title: "Complete API Integration", project: "Website Redesign", priority: "Critical", due: "Today", reason: "Blocking 4 downstream tasks" },
                { title: "Fix authentication issue", project: "Mobile App", priority: "High", due: "Tomorrow", reason: "High customer impact" },
                { title: "QA dashboard flows", project: "Admin Portal", priority: "High", due: "Tomorrow", reason: "Release dependency" },
                { title: "Update project documentation", project: "Internal Tools", priority: "Medium", due: "Aug 23", reason: "Low urgency" },
            ];
        }

        return allProjectTasks.slice(0, 5).map((t) => ({
            title: t.summary || t.task_detail || "Project Task",
            project: projects.find((p) => p.id === t.project_id)?.summary || "General",
            priority: (t.priority || "medium").toUpperCase(),
            due: t.due_date ? new Date(t.due_date).toLocaleDateString() : "Flexible",
            reason: t.status === "in_progress" ? "In active development" : "Scheduled milestone item",
        }));
    }, [projects, allProjectTasks]);

    const dependencies = [
        { task: "API Integration", blocks: 0, status: "Blocked", color: "red" },
        { task: "Authentication", blocks: 0, status: "At Risk", color: "amber" },
        { task: "QA Testing", blocks: 0, status: "Waiting", color: "blue" },
    ];

    const weeklyStats = useMemo(() => {
        if (projects.length === 0) {
            return [
                { label: "Tasks completed", value: "34", change: "+18%", positive: true },
                { label: "On-time delivery", value: "81%", change: "+7%", positive: true },
                { label: "Avg. cycle time", value: "2.8d", change: "-12%", positive: true },
                { label: "Overdue tasks", value: "7", change: "+2", positive: false },
            ];
        }

        const deliveryRate = totalTasksCount > 0 ? Math.round(((totalTasksCount - overdueTasksCount) / totalTasksCount) * 100) : 100;
        return [
            { label: "Tasks completed", value: `${completedTasksCount}`, change: `of ${totalTasksCount}`, positive: true },
            { label: "On-time delivery", value: `${deliveryRate}%`, change: "Target: 85%", positive: deliveryRate >= 80 },
            { label: "Active projects", value: `${projects.length}`, change: `${totalTasksCount} tasks`, positive: true },
            { label: "Overdue tasks", value: `${overdueTasksCount}`, change: overdueTasksCount > 0 ? "Needs review" : "None", positive: overdueTasksCount === 0 },
        ];
    }, [projects, totalTasksCount, completedTasksCount, overdueTasksCount]);

    // -----------------------------------------------------------------------
    // AI Calls to Groq API
    // -----------------------------------------------------------------------
    const askAI = useCallback(async () => {
        if (!question.trim() || aiLoading) return;
        setAiLoading(true);
        setAiError("");
        setAiAnswer("");
        try {
            const answer = await aiClient.ask(question, projects);
            setAiAnswer(answer);
        } catch (err) {
            setAiError(err?.message || "Couldn't reach the AI just now. Please check your network or API key.");
        } finally {
            setAiLoading(false);
        }
    }, [question, aiLoading, projects]);

    const askSuggestion = (suggestion) => {
        setQuestion(suggestion);
        setAiLoading(true);
        setAiError("");
        setAiAnswer("");
        aiClient
            .ask(suggestion, projects)
            .then((answer) => setAiAnswer(answer))
            .catch((err) => setAiError(err?.message || "Couldn't reach the AI just now."))
            .finally(() => setAiLoading(false));
    };

    // Regenerate the "AI Recommended Actions" list
    const generateAIInsights = useCallback(async () => {
        setInsightsLoading(true);
        setInsightsError("");
        try {
            const items = await aiClient.generateInsights(projects);
            if (items && items.length > 0) {
                setActions(
                    items.slice(0, 3).map((item, index) => ({
                        id: Date.now() + index,
                        type: ["danger", "warning", "success"].includes(item.type) ? item.type : "warning",
                        title: item.title || "AI recommendation",
                        description: item.description || "",
                        action: item.action || "View details",
                    }))
                );
            }
        } catch (err) {
            console.error("AI Insight error:", err);
            setInsightsError(err?.message || "Couldn't refresh AI insights right now.");
        } finally {
            setInsightsLoading(false);
        }
    }, [projects]);

    useEffect(() => {
        if (projectsLoaded) {
            generateAIInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectsLoaded]);

    const generateSprintPlan = useCallback(async () => {
        setSprintLoading(true);
        setSprintPlan(null);
        try {
            const result = await aiClient.generateSprintPlan(projects);
            setSprintPlan(result);
        } catch (err) {
            setSprintPlan({ error: true });
        } finally {
            setSprintLoading(false);
        }
    }, [projects]);

    const dismissAction = (id) => {
        setActions((current) => current.filter((item) => item.id !== id));
    };

    const healthLabel = useMemo(() => {
        if (health >= 80) return "Healthy";
        if (health >= 60) return "At Risk";
        return "Critical";
    }, [health]);


    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                <Sparkles size={18} />
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                AI Powered · Live
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            AI Insights
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your AI-powered project command center
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={generateAIInsights}
                            disabled={insightsLoading}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            {insightsLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <RefreshCw size={16} />
                            )}
                            Refresh AI
                        </button>

                        <button
                            onClick={() => {
                                setShowSprintModal(true);
                                setSprintPlan(null);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            <Sparkles size={16} />
                            Plan Sprint
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                    {[
                        ["overview", "Overview"],
                        ["risks", "Risks"],
                        ["team", "Team"],
                        ["priorities", "Priorities"],
                        ["dependencies", "Dependencies"],
                    ].map(([id, label]) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === id
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Top cards */}
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                            {/* Health */}
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            AI Project Health
                                        </p>

                                        <div className="mt-2 flex items-end gap-2">
                                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                                {health}
                                            </span>
                                            <span className="mb-1 text-sm text-slate-400">/ 100</span>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-sm font-semibold text-emerald-600">
                                                {healthLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                                        <Activity size={26} />
                                    </div>
                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                                        style={{ width: `${health}%` }}
                                    />
                                </div>

                                <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                    <div className="flex gap-2">
                                        <Brain size={16} className="mt-0.5 shrink-0 text-blue-500" />
                                        <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                                            Project is healthy overall, but deadline pressure and team
                                            workload require attention.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            AI Deadline Prediction
                                        </p>

                                        <div className="mt-3 flex items-center gap-2">
                                            <CalendarDays size={20} className="text-blue-500" />
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                Aug 27
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10">
                                        <Clock3 size={22} />
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Planned</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        Aug 25
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                    <TrendingDown size={14} />
                                    Likely 2 days late
                                </div>
                            </div>

                            {/* Risk */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Deadline Risk
                                        </p>

                                        <div className="mt-2 flex items-end gap-2">
                                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                                72%
                                            </span>
                                            <span className="mb-1 text-sm font-semibold text-red-500">High</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10">
                                        <AlertTriangle size={22} />
                                    </div>
                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-orange-400 to-red-500" />
                                </div>

                                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Current velocity is below the pace required to hit the planned
                                    deadline.
                                </p>
                            </div>
                        </div>

                        {/* AI actions */}
                        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                        <Lightbulb size={18} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">
                                            AI Recommended Actions
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {insightsLoading
                                                ? "AI is analyzing your project…"
                                                : "Generated live by AI from your project data"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={generateAIInsights}
                                    disabled={insightsLoading}
                                    className="hidden items-center gap-1.5 text-xs font-semibold text-blue-600 disabled:opacity-60 sm:flex"
                                >
                                    {insightsLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                    Regenerate
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {insightsError && (
                                    <div className="flex items-center gap-2 bg-red-50/60 px-5 py-3 text-xs font-medium text-red-600 dark:bg-red-500/5">
                                        <AlertTriangle size={14} />
                                        {insightsError}
                                    </div>
                                )}

                                {insightsLoading && actions.length === 0 ? (
                                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating AI insights…
                                    </div>
                                ) : actions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Check className="mx-auto mb-2 text-emerald-500" />
                                        <p className="font-medium text-slate-700 dark:text-slate-200">
                                            All caught up!
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            No urgent AI recommendations.
                                        </p>
                                    </div>
                                ) : (
                                    actions.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                                        >
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.type === "danger"
                                                    ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                                                    : item.type === "warning"
                                                        ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10"
                                                        : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
                                                    }`}
                                            >
                                                {item.type === "danger" ? (
                                                    <AlertTriangle size={19} />
                                                ) : item.type === "warning" ? (
                                                    <Flame size={19} />
                                                ) : (
                                                    <Zap size={19} />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                                                    {item.action}
                                                </button>

                                                <button
                                                    onClick={() => dismissAction(item.id)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Priorities + Team */}
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Priorities */}
                            <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
                                            <Target size={18} />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                                Smart Priorities
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                What your team should focus on
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab("priorities")}
                                        className="text-xs font-semibold text-blue-600"
                                    >
                                        See all
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {priorities.slice(0, 3).map((task, index) => (
                                        <div key={task.title} className="flex items-center gap-3 p-4">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                                                {index + 1}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                        {task.title}
                                                    </p>

                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.priority === "Critical"
                                                            ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                                                            : "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                                                            }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-xs text-slate-400">{task.reason}</p>
                                            </div>

                                            <ChevronRight size={16} className="shrink-0 text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Team workload */}
                            <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                                            <Users size={18} />
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                                Team Intelligence
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                AI workload analysis
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab("team")}
                                        className="text-xs font-semibold text-blue-600"
                                    >
                                        View team
                                    </button>
                                </div>

                                <div className="space-y-4 p-5">
                                    {team.map((member) => (
                                        <div key={member.name}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                        {member.name.charAt(0)}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">{member.role}</p>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`text-xs font-semibold ${member.workload >= 85
                                                        ? "text-red-500"
                                                        : member.workload >= 70
                                                            ? "text-amber-500"
                                                            : "text-emerald-500"
                                                        }`}
                                                >
                                                    {member.workload}%
                                                </span>
                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                <div
                                                    className={`h-full rounded-full ${member.color}`}
                                                    style={{ width: `${member.workload}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Dependencies */}
                        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                                        <GitBranch size={18} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">
                                            Dependency Intelligence
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            AI detected these potential bottlenecks
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveTab("dependencies")}
                                    className="text-xs font-semibold text-blue-600"
                                >
                                    Analyze
                                </button>
                            </div>

                            <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                                {dependencies.map((dependency) => (
                                    <div key={dependency.task} className="p-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {dependency.task}
                                            </span>

                                            <span
                                                className={`rounded-full px-2 py-1 text-[10px] font-bold ${dependency.color === "red"
                                                    ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                                                    : dependency.color === "amber"
                                                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                                                        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                                                    }`}
                                            >
                                                {dependency.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-end gap-1">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {dependency.blocks}
                                            </span>
                                            <span className="mb-1 text-xs text-slate-400">tasks blocked</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Weekly report */}
                        <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                                        <TrendingUp size={18} />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">
                                            AI Weekly Report
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Project performance this week
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800 lg:grid-cols-4 lg:divide-y-0">
                                {weeklyStats.map((stat) => (
                                    <div key={stat.label} className="p-5">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>

                                        <div className="mt-2 flex items-end gap-2">
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {stat.value}
                                            </span>

                                            <span
                                                className={`mb-1 flex items-center gap-0.5 text-xs font-semibold ${stat.positive ? "text-emerald-500" : "text-red-500"
                                                    }`}
                                            >
                                                {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* Risks */}
                {activeTab === "risks" && (
                    <div className="space-y-4">
                        <SectionHeader
                            icon={<AlertTriangle size={18} />}
                            title="AI Risk Predictor"
                            description="Potential problems detected from your project data"
                        />

                        {risks.map((risk) => (
                            <div
                                key={risk.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                                        <AlertTriangle />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {risk.title}
                                            </h3>

                                            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 dark:bg-red-500/10">
                                                {risk.severity}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {risk.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {risk.tasks.map((task) => (
                                                <span
                                                    key={task}
                                                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                >
                                                    {task}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="min-w-[140px]">
                                        <div className="mb-2 flex justify-between text-xs">
                                            <span className="text-slate-400">Probability</span>
                                            <span className="font-bold text-red-500">{risk.probability}%</span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-red-500"
                                                style={{ width: `${risk.probability}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Team */}
                {activeTab === "team" && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={<Users size={18} />}
                            title="Team Intelligence"
                            description="AI-powered workload and capacity analysis"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {team.map((member) => (
                                <div
                                    key={member.name}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                            {member.name.charAt(0)}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {member.name}
                                            </h3>
                                            <p className="text-xs text-slate-400">{member.role}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Current workload</span>
                                            <strong className="text-slate-700 dark:text-slate-200">
                                                {member.workload}%
                                            </strong>
                                        </div>

                                        <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className={`h-full rounded-full ${member.color}`}
                                                style={{ width: `${member.workload}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        <span
                                            className={`text-xs font-semibold ${member.workload >= 85
                                                ? "text-red-500"
                                                : member.workload >= 70
                                                    ? "text-amber-500"
                                                    : "text-emerald-500"
                                                }`}
                                        >
                                            {member.status}
                                        </span>

                                        {member.workload >= 85 && (
                                            <button className="text-xs font-semibold text-blue-600">
                                                Rebalance
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/5">
                            <div className="flex gap-3">
                                <Brain className="mt-0.5 text-blue-600" size={20} />

                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                        AI Recommendation
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-blue-800/80 dark:text-blue-200/70">
                                        Manish is currently overloaded at 92%. Priya has 57% available
                                        capacity. Moving 2 medium-priority tasks could reduce the workload
                                        imbalance by approximately 24%.
                                    </p>

                                    <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                                        Optimize Workload
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Priorities */}
                {activeTab === "priorities" && (
                    <div className="space-y-4">
                        <SectionHeader
                            icon={<Target size={18} />}
                            title="Smart Prioritization"
                            description="AI ranked tasks based on urgency, impact and dependencies"
                        />

                        {priorities.map((task, index) => (
                            <div
                                key={task.title}
                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500 dark:bg-slate-800">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {task.title}
                                        </h3>

                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${task.priority === "Critical"
                                                ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                                                : task.priority === "High"
                                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10"
                                                    : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {task.project} · Due {task.due}
                                    </p>

                                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Brain size={13} className="text-blue-500" />
                                        AI reason: {task.reason}
                                    </div>
                                </div>

                                <button className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    Open Task
                                    <ArrowRight size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dependencies */}
                {activeTab === "dependencies" && (
                    <div className="space-y-4">
                        <SectionHeader
                            icon={<GitBranch size={18} />}
                            title="Dependency Intelligence"
                            description="Find the tasks that are slowing down your project"
                        />

                        {dependencies.map((dependency) => (
                            <div
                                key={dependency.task}
                                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                                        <GitBranch size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {dependency.task}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            This task is currently blocking{" "}
                                            <strong className="text-slate-700 dark:text-slate-200">
                                                {dependency.blocks} other tasks
                                            </strong>
                                            .
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${dependency.color === "red"
                                            ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                                            : dependency.color === "amber"
                                                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                                                : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                                            }`}
                                    >
                                        {dependency.status}
                                    </span>

                                    <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                        View Chain
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ask AI */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-blue-500/10">
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                                <MessageSquare size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">Ask Your Project AI</h2>
                                <p className="mt-1 text-xs leading-5 text-blue-100">
                                    Ask anything about project health, deadlines, risks, team workload
                                    or priorities. Answered live by AI.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <div className="flex flex-1 items-center rounded-xl bg-white/10 px-4 backdrop-blur">
                                <Sparkles size={17} className="mr-3 text-blue-100" />

                                <input
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") askAI();
                                    }}
                                    placeholder="Why are we behind?"
                                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-blue-100/60"
                                />
                            </div>

                            <button
                                onClick={askAI}
                                disabled={aiLoading || !question.trim()}
                                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                            >
                                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {aiLoading ? "Thinking…" : "Ask AI"}
                            </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {[
                                "Why are we behind?",
                                "Who is overloaded?",
                                "What should I do today?",
                                "Summarize this project",
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => askSuggestion(suggestion)}
                                    disabled={aiLoading}
                                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-blue-50 transition hover:bg-white/20 disabled:opacity-60"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {aiError && (
                            <div className="mt-5 rounded-xl border border-red-300/40 bg-red-500/10 p-4 text-sm text-red-50">
                                {aiError}
                            </div>
                        )}

                        {aiAnswer && !aiError && (
                            <div className="mt-5 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                <div className="flex gap-3">
                                    <div className="mt-0.5 text-white">
                                        <Brain size={18} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                                            AI Analysis
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-white">{aiAnswer}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sprint Planner Modal */}
            {showSprintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                                    <Sparkles size={19} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        AI Sprint Planner
                                    </h2>
                                    <p className="text-xs text-slate-400">Let AI build your next sprint</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSprintModal(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Team capacity
                                    </span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {sprintPlan?.capacity ?? 78}%
                                    </span>
                                </div>

                                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                                    <div
                                        className="h-full rounded-full bg-blue-500"
                                        style={{ width: `${sprintPlan?.capacity ?? 78}%` }}
                                    />
                                </div>
                            </div>

                            {!sprintPlan ? (
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                        AI will prioritize
                                    </p>

                                    <div className="mt-3 space-y-2">
                                        {[
                                            "Critical and overdue tasks",
                                            "Tasks blocking other work",
                                            "Tasks matching available team capacity",
                                            "Tasks required for the next milestone",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                                            >
                                                <Check size={14} className="text-emerald-500" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : sprintPlan.error ? (
                                <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-500/10">
                                    Couldn't generate a sprint plan right now. Please try again.
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                        AI's sprint picks
                                    </p>
                                    <div className="mt-3 space-y-2">
                                        {(sprintPlan.tasks || []).map((t, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                                            >
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                    {i + 1}
                                                </span>
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                    {sprintPlan.note && (
                                        <p className="mt-3 flex gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                            <Brain size={14} className="mt-0.5 shrink-0 text-blue-500" />
                                            {sprintPlan.note}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={generateSprintPlan}
                                disabled={sprintLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {sprintLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Sparkles size={16} />
                                )}
                                {sprintLoading ? "Generating…" : "Generate Sprint Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionHeader({ icon, title, description }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                {icon}
            </div>

            <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
    );
}
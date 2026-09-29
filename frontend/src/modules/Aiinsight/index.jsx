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

    const [actions, setActions] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(projectId || "all");

    const filteredProjects = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === "all") return projects;
        return projects.filter((project) => String(project.id) === String(selectedProjectId));
    }, [projects, selectedProjectId]);

    const selectedProject = filteredProjects[0] || null;
    const selectedProjectTasks = useMemo(() => {
        return filteredProjects.flatMap((project) => project.tasks || []);
    }, [filteredProjects]);
    const aiScopeProjects = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === "all") return projects;
        return filteredProjects;
    }, [projects, filteredProjects, selectedProjectId]);

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
    const allProjectTasks = selectedProjectTasks;

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
        if (filteredProjects.length === 0) {
            return [
                {
                    title: "No active project selected",
                    probability: 0,
                    severity: "Low",
                    description: "Select a project to see AI risk analysis for that specific delivery plan.",
                    tasks: ["No project data"],
                },
            ];
        }

        const criticalProjects = filteredProjects.filter((p) => (p.priority || "").toLowerCase() === "critical" || (p.priority || "").toLowerCase() === "high");
        return [
            {
                title: overdueTasksCount > 0 ? `${overdueTasksCount} overdue tasks need attention` : "Delivery pace is steady",
                probability: overdueTasksCount > 0 ? Math.min(88, 40 + overdueTasksCount * 12) : 35,
                severity: overdueTasksCount > 2 ? "High" : "Medium",
                description: overdueTasksCount > 0
                    ? `${overdueTasksCount} tasks in ${selectedProject?.summary || "this project"} are past due and should be prioritized this week.`
                    : `${selectedProject?.summary || "This project"} is on a stable timeline with no critical overdue work right now.`,
                tasks: allProjectTasks.slice(0, 3).map((t) => t.summary || t.task_detail || "Active task"),
            },
            {
                title: `${criticalProjects.length} high-priority project items`,
                probability: criticalProjects.length > 0 ? 65 : 25,
                severity: criticalProjects.length > 1 ? "High" : "Low",
                description: criticalProjects.length > 0
                    ? `The project currently has ${criticalProjects.length} high-priority item(s) that need direct attention.`
                    : "No major high-priority blockers are reported for this project right now.",
                tasks: criticalProjects.slice(0, 3).map((p) => p.summary || "Critical item"),
            },
            {
                title: "Resource capacity check",
                probability: 42,
                severity: "Medium",
                description: "AI is reviewing workload balance and delivery capacity for the selected project.",
                tasks: allProjectTasks.slice(0, 3).map((t) => t.summary || t.task_detail || "Team task"),
            },
        ];
    }, [filteredProjects, selectedProject, allProjectTasks, overdueTasksCount]);

    const team = useMemo(() => {
        if (filteredProjects.length === 0) {
            return [
                { name: "No project selected", role: "—", workload: 0, status: "Waiting", color: "bg-slate-400" },
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
    }, [filteredProjects, allProjectTasks]);

    const priorities = useMemo(() => {
        if (allProjectTasks.length === 0) {
            return [
                { title: "No task data available", project: selectedProject?.summary || "Selected project", priority: "Low", due: "—", reason: "Add tasks to generate AI priority recommendations." },
            ];
        }

        return allProjectTasks.slice(0, 5).map((t) => ({
            title: t.summary || t.task_detail || "Project Task",
            project: filteredProjects.find((p) => p.id === t.project_id)?.summary || selectedProject?.summary || "Selected project",
            priority: (t.priority || "medium").toUpperCase(),
            due: t.due_date ? new Date(t.due_date).toLocaleDateString() : "Flexible",
            reason: t.status === "in_progress" ? "In active development" : "Scheduled milestone item",
        }));
    }, [filteredProjects, selectedProject, allProjectTasks]);

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
            const answer = await aiClient.ask(
                `${question}${selectedProject ? ` Focus only on ${selectedProject.summary || selectedProject.title || "this project"}.` : ""}`,
                aiScopeProjects
            );
            setAiAnswer(answer);
        } catch (err) {
            setAiError(err?.message || "Couldn't reach the AI just now. Please check your network or API key.");
        } finally {
            setAiLoading(false);
        }
    }, [question, aiLoading, aiScopeProjects, selectedProject]);

    const askSuggestion = (suggestion) => {
        setQuestion(suggestion);
        setAiLoading(true);
        setAiError("");
        setAiAnswer("");
        aiClient
            .ask(
                `${suggestion}${selectedProject ? ` Focus only on ${selectedProject.summary || selectedProject.title || "this project"}.` : ""}`,
                aiScopeProjects
            )
            .then((answer) => setAiAnswer(answer))
            .catch((err) => setAiError(err?.message || "Couldn't reach the AI just now."))
            .finally(() => setAiLoading(false));
    };

    // Regenerate the "AI Recommended Actions" list
    const generateAIInsights = useCallback(async () => {
        setInsightsLoading(true);
        setInsightsError("");
        try {
            const items = await aiClient.generateInsights(aiScopeProjects);
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
    }, [aiScopeProjects]);

    useEffect(() => {
        if (projectsLoaded && projects.length > 0) {
            if (!projectId && selectedProjectId === "all" && projects[0]) {
                setSelectedProjectId(String(projects[0].id));
            }
        }
    }, [projectsLoaded, projects, projectId, selectedProjectId]);

    useEffect(() => {
        if (projectsLoaded) {
            generateAIInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectsLoaded, selectedProjectId]);

    const generateSprintPlan = useCallback(async () => {
        setSprintLoading(true);
        setSprintPlan(null);
        try {
            const result = await aiClient.generateSprintPlan(aiScopeProjects);
            setSprintPlan(result);
        } catch (err) {
            setSprintPlan({ error: true });
        } finally {
            setSprintLoading(false);
        }
    }, [aiScopeProjects]);

    const dismissAction = (id) => {
        setActions((current) => current.filter((item) => item.id !== id));
    };

    const formatAiAnswer = useCallback((answer) => {
        if (!answer) return [];
        const normalized = answer
            .replace(/\*\*/g, "")
            .replace(/\r/g, "")
            .trim();

        const blocks = normalized
            .split(/\n\s*\n/)
            .map((block) => block.trim())
            .filter(Boolean);

        if (blocks.length === 0) return [normalized];

        return blocks.flatMap((block) => {
            const lines = block
                .split(/\n/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, ""));

            return lines.length > 1 ? lines : [block];
        });
    }, []);

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

                        <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                            AI Insights
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {selectedProject
                                ? `Focused on: ${selectedProject.summary || selectedProject.title || "Selected project"}`
                                : "Your AI-powered project command center"}
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
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition"
                        >
                            <Sparkles size={16} />
                            Plan Sprint
                        </button>
                    </div>
                </div>

                {projects.length > 0 && (
                    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Project focus
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                            <option value="all">All projects</option>
                            {projects.map((project) => (
                                <option key={project.id} value={String(project.id)}>
                                    {project.summary || project.title || `Project ${project.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
{/* 
                {/* Ask AI */}
               <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
    {/* AI Header */}
    <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {/* subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30" />

        <div className="relative p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    {/* AI Icon */}
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:border-indigo-500/30">
                        <Sparkles size={19} />

                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                                Project AI
                            </h2>

                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                                Live
                            </span>
                        </div>

                        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                            Get instant insights about project health, deadlines,
                            workload, risks and priorities.
                        </p>
                    </div>
                </div>

                {/* AI status */}
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-[10px] font-medium text-slate-500 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    AI Ready
                </div>
            </div>

            {/* Search / Ask Box */}
            <div className="mt-5">
                <div
                    className={`group flex items-center rounded-xl border bg-white shadow-sm transition-all dark:bg-slate-950 ${
                        aiLoading
                            ? "border-indigo-400 ring-4 ring-indigo-500/10"
                            : "border-slate-200 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:hover:border-indigo-500/50"
                    }`}
                >
                    <div className="pl-4 text-indigo-500">
                        <Sparkles size={17} />
                    </div>

                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") askAI();
                        }}
                        placeholder="Ask about your project..."
                        className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
                    />

                    <button
                        onClick={askAI}
                        disabled={aiLoading || !question.trim()}
                        className="mr-1.5 flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Thinking
                            </>
                        ) : (
                            <>
                                <Send size={15} />
                                Ask AI
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Suggested Questions */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Try asking
                </span>

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
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    </div>

    {/* Error */}
    {aiError && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-4 dark:border-red-500/10 dark:bg-red-500/5">
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <AlertCircle size={16} />
                </div>

                <div>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                        AI couldn't complete the analysis
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-red-600/80 dark:text-red-400/70">
                        {aiError}
                    </p>
                </div>
            </div>
        </div>
    )}

    {/* AI Response */}
    {aiAnswer && !aiError && (
        <div className="bg-slate-50/70 p-5 dark:bg-slate-950/40 sm:p-6">
            {/* Response Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Brain size={16} />
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            AI Analysis
                        </p>

                        <p className="text-[10px] text-slate-400">
                            Based on current project data
                        </p>
                    </div>
                </div>

                {selectedProject && (
                    <div className="max-w-[180px] truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {selectedProject.summary ||
                            selectedProject.title ||
                            "Selected project"}
                    </div>
                )}
            </div>

            {/* Analysis Points */}
            <div className="space-y-2">
                {formatAiAnswer(aiAnswer).map((point, index) => (
                    <div
                        key={`${point}-${index}`}
                        className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/30"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            </div>

                            <p className="flex-1 text-left text-[13px] leading-6 text-slate-600 dark:text-slate-300">
                                {point}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                <Sparkles size={12} />
                AI-generated insights may change as project data updates.
            </div>
        </div>
    )}
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
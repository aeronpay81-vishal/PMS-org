import { useState, useEffect, useMemo } from "react";
import {
  Target,
  CheckSquare,
  AlertTriangle,
  Users,
  Flag,
  Filter,
  Maximize2,
  Layers,
  GitBranch,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { projectsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";
import { useTheme } from "../../context/ThemeContext";


const STATUS_META = {
  todo: { label: "To Do", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  active: { label: "Active", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  open: { label: "Open", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  in_progress: { label: "In Progress", badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  review: { label: "In Review", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  in_review: { label: "In Review", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  on_hold: { label: "On Hold", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  cancelled: { label: "Cancelled", badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
  done: { label: "Done", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  completed: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
  closed: { label: "Closed", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
};

const BAR_PALETTE = ["#10b981", "#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#0ea5e9", "#22c55e"];

const PRIORITY_BADGE = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40",
  critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
};

const ROW_HEIGHT = 44;
const DAY_MS = 86400000;
const LEFT_COLS = "minmax(180px,1.2fr) 100px 85px 1fr 100px 85px 60px";
const FIXED_LEFT = 180 + 100 + 85;
const FIXED_RIGHT = 100 + 85 + 60;

const toDate = (v) => (v ? new Date(v) : null);
const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
const dayDiff = (a, b) => Math.round((b.getTime() - a.getTime()) / DAY_MS);
const fmtShort = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtFull = (d) => d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

const SmartTime = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("Timeline");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, tasksRes] = await Promise.allSettled([
        projectsAPI.getAll(),
        tasksAPI.getAll(),
      ]);

      const projects = projectsRes.status === "fulfilled"
        ? Array.isArray(projectsRes.value?.data || projectsRes.value)
          ? projectsRes.value?.data || projectsRes.value
          : []
        : [];

      const tasks = tasksRes.status === "fulfilled"
        ? Array.isArray(tasksRes.value?.data || tasksRes.value)
          ? tasksRes.value?.data || tasksRes.value
          : []
        : [];

      const tagged = [
        ...projects.map((p) => ({ ...p, _type: "project" })),
        ...tasks.map((t) => ({ ...t, _type: "task" })),
      ];
      setRawItems(tagged);
    } catch (err) {
      console.error("Error fetching timeline data:", err);
      setError(err?.message || "Failed to load timeline data");
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => {
    const today = new Date();
    return rawItems.map((t) => {
      const start = toDate(t.start_date) || toDate(t.created_at) || today;
      const isMilestone = Boolean(t.is_milestone || t.type === "milestone");
      const end = isMilestone ? start : toDate(t.due_date) || addDays(start, 7);

      const capacity = typeof t.capacity === "number" ? t.capacity : typeof t.workload === "number" ? t.workload : null;
      const isDone = ["done", "completed", "closed"].includes(t.status);
      const overdue = toDate(t.due_date) && toDate(t.due_date) < today && !isDone;
      const atRisk = Boolean(t.at_risk) || overdue || (capacity != null && capacity > 100);
      const riskReason = t.at_risk_reason ||
        (capacity != null && capacity > 100 ? "Over capacity" : overdue ? "Behind schedule" : atRisk ? "High workload" : null);

      return {
        id: `${t._type}-${t.id}`,
        _type: t._type,
        summary: t.summary || (t._type === "project" ? "Untitled project" : "Untitled task"),
        owner: t.assignee?.full_name || t.assignee?.username || t.reporter || t.creator?.full_name || t.creator?.username || "Unassigned",
        priority: t.priority || "medium",
        status: t.status || (t._type === "project" ? "active" : "todo"),
        isDone,
        start,
        end,
        isMilestone,
        capacity,
        atRisk,
        riskReason,
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      };
    });
  }, [rawItems]);

  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    if (items.length === 0) {
      const today = new Date();
      if (view === "Week") return { rangeStart: today, rangeEnd: addDays(today, 7), totalDays: 7 };
      if (view === "Month") return { rangeStart: today, rangeEnd: addDays(today, 30), totalDays: 30 };
      return { rangeStart: today, rangeEnd: addDays(today, 20), totalDays: 20 };
    }

    let min = items[0].start;
    let max = items[0].end;
    items.forEach((it) => {
      if (it.start < min) min = it.start;
      if (it.end > max) max = it.end;
    });

    let start, end;
    if (view === "Week") {
      start = new Date();
      start.setDate(start.getDate() - start.getDay());
      end = addDays(start, 7);
    } else if (view === "Month") {
      start = new Date();
      start.setDate(1);
      end = addDays(start, 30);
    } else {
      start = addDays(min, -1);
      end = addDays(max, 1);
    }

    return { rangeStart: start, rangeEnd: end, totalDays: Math.max(dayDiff(start, end), 1) };
  }, [items, view]);

  const pctFor = (d) => {
    if (d < rangeStart) return 0;
    if (d > rangeEnd) return 100;
    return (dayDiff(rangeStart, d) / totalDays) * 100;
  };

  const dayList = useMemo(() => {
    const step = totalDays > 45 ? 3 : totalDays > 25 ? 2 : 1;
    const arr = [];
    for (let i = 0; i <= totalDays; i += step) arr.push(addDays(rangeStart, i));
    return arr;
  }, [rangeStart, totalDays]);

  const today = new Date();
  const todayPct = today >= rangeStart && today <= rangeEnd ? pctFor(today) : null;

  const totalTasks = items.length;
  const doneTasks = items.filter((i) => i.isDone).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const atRiskTasks = items.filter((i) => i.atRisk);
  const capacities = items.filter((i) => i.capacity != null).map((i) => i.capacity);
  const avgCapacity = capacities.length ? Math.round(capacities.reduce((a, b) => a + b, 0) / capacities.length) : null;
  const milestones = items.filter((i) => i.isMilestone);
  const upcomingMilestones = milestones.filter((m) => m.start >= today);
  const teamMembers = Array.from(new Set(items.map((i) => i.owner))).filter((o) => o !== "Unassigned");

  const idToIndex = useMemo(() => {
    const map = {};
    items.forEach((it, idx) => (map[it.id] = idx));
    return map;
  }, [items]);

  const dependencyEdges = useMemo(() => {
    const edges = [];
    items.forEach((it, rowIdx) => {
      it.dependencies.forEach((depId) => {
        const depIdx = idToIndex[depId];
        if (depIdx == null) return;
        const dep = items[depIdx];
        edges.push({
          x1: pctFor(dep.end),
          y1: depIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
          x2: pctFor(it.start),
          y2: rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2,
        });
      });
    });
    return edges;
  }, [items, idToIndex, rangeStart, totalDays]);

  const handleBarClick = (item) => {
    setSelectedItem(item);
    alert(`Clicked: ${item.summary}\nType: ${item._type}\nStatus: ${item.status}\nDue: ${fmtFull(item.end)}`);
  };

  const statCards = [
    { label: "Progress", value: `${progressPct}%`, sub: progressPct >= 70 ? "On Track" : progressPct >= 40 ? "In Progress" : "Getting Started", icon: Target, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40" },
    { label: "Total Tasks", value: totalTasks, sub: "All items", icon: CheckSquare, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" },
    { label: "At Risk", value: atRiskTasks.length, sub: "Need attention", icon: AlertTriangle, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40" },
    { label: "Capacity", value: avgCapacity != null ? `${avgCapacity}%` : "—", sub: avgCapacity == null ? "No data" : avgCapacity > 100 ? "Overloaded" : "Healthy", icon: Users, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" },
    { label: "Milestones", value: upcomingMilestones.length, sub: "Upcoming", icon: Flag, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40" },
  ];

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 border border-red-200 dark:border-red-900">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Header with Stats */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Timeline View</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Projects and tasks in a unified timeline</p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-start gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white leading-tight">{card.value}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex rounded-md border border-slate-200 dark:border-slate-800 p-0.5">
            {["Timeline", "Week", "Month"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${view === v
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <button type="button" className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button type="button" className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Baseline</span>
            </button>
            <button type="button" className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
            {fmtFull(rangeStart)} — {fmtFull(rangeEnd)}
          </p>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No items to display</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Add projects or tasks with dates to see them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2" style={{ scrollBehavior: "smooth" }}>
            <div style={{ minWidth: Math.max(860, (totalDays + 1) * 32 + 400) }}>
              {/* Header */}
              <div
                className="grid items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1"
                style={{ gridTemplateColumns: LEFT_COLS }}
              >
                <span>Task / Milestone</span>
                <span>Owner</span>
                <span>Priority</span>
                <span className="relative h-5">
                  {dayList.map((d, idx) => {
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <span
                        key={idx}
                        className={`absolute -translate-x-1/2 ${isToday ? "flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white text-[9px] font-bold" : ""}`}
                        style={{ left: `${pctFor(d)}%` }}
                      >
                        {d.getDate()}
                      </span>
                    );
                  })}
                </span>
                <span>Status</span>
                <span>Capacity</span>
                <span>Risk</span>
              </div>

              {/* Rows */}
              <div className="relative" style={{ height: items.length * ROW_HEIGHT }}>
                {items.map((it, rowIdx) => {
                  const statusMeta = STATUS_META[it.status] || STATUS_META.todo;
                  const left = pctFor(it.start);
                  const width = Math.max(pctFor(it.end) - left, it.isMilestone ? 0 : 2);
                  const barColor = BAR_PALETTE[rowIdx % BAR_PALETTE.length];

                  return (
                    <div
                      key={it.id}
                      className="grid items-center absolute left-0 right-0 border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      style={{ gridTemplateColumns: LEFT_COLS, top: rowIdx * ROW_HEIGHT, height: ROW_HEIGHT }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        {it.isMilestone ? (
                          <Diamond className="h-3 w-3 text-violet-500 flex-shrink-0" />
                        ) : (
                          <CheckSquare className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate font-medium">{it.summary}</span>
                      </div>

                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate pr-1">{it.owner}</span>

                      <span>
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${PRIORITY_BADGE[it.priority] || PRIORITY_BADGE.medium}`}>
                          {it.priority}
                        </span>
                      </span>

                      <div className="relative h-5">
                        {it.isMilestone ? (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-violet-500 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            style={{ left: `${left}%` }}
                            title={it.summary}
                            onClick={() => handleBarClick(it)}
                          />
                        ) : (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-3.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: barColor,
                              boxShadow: it.atRisk ? "0 0 0 1.5px #ef4444 inset" : "none",
                            }}
                            title={`${it.summary}: ${fmtShort(it.start)} – ${fmtShort(it.end)}`}
                            onClick={() => handleBarClick(it)}
                          />
                        )}
                      </div>

                      <span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-xs font-medium">
                        {it.capacity != null ? (
                          <>
                            <Circle
                              className={`h-1.5 w-1.5 fill-current ${it.capacity > 100 ? "text-red-500" : it.capacity >= 80 ? "text-amber-500" : "text-emerald-500"
                                }`}
                              strokeWidth={0}
                            />
                            <span className={it.capacity > 100 ? "text-red-500" : it.capacity >= 80 ? "text-amber-500" : "text-emerald-500"}>
                              {it.capacity}%
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </span>

                      <span>
                        {it.atRisk ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        )}
                      </span>
                    </div>
                  );
                })}

                {/* Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `calc(${FIXED_LEFT}px)`,
                    width: `calc(100% - ${FIXED_LEFT}px - ${FIXED_RIGHT}px)`,
                    height: items.length * ROW_HEIGHT,
                    pointerEvents: "none",
                  }}
                >
                  {todayPct != null && (
                    <div className="absolute top-0 bottom-0 w-px bg-indigo-400/60" style={{ left: `${todayPct}%` }} />
                  )}

                  {dependencyEdges.length > 0 && (
                    <svg
                      className="absolute top-0 left-0 w-full h-full overflow-visible"
                      viewBox={`0 0 100 ${items.length * ROW_HEIGHT}`}
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                          <path d="M0,0 L5,2.5 L0,5 Z" fill={isDark ? "#64748b" : "#94a3b8"} />
                        </marker>
                      </defs>
                      {dependencyEdges.map((e, idx) => {
                        const midX = (e.x1 + e.x2) / 2;
                        return (
                          <path
                            key={idx}
                            d={`M ${e.x1} ${e.y1} C ${midX} ${e.y1}, ${midX} ${e.y2}, ${e.x2} ${e.y2}`}
                            fill="none"
                            stroke={isDark ? "#64748b" : "#94a3b8"}
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* Legend - Compact */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-current text-emerald-500" strokeWidth={0} /> Done</span>
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-current text-blue-500" strokeWidth={0} /> Active</span>
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-current text-amber-500" strokeWidth={0} /> Review</span>
                <span className="flex items-center gap-1"><Circle className="h-2 w-2 fill-current text-slate-400" strokeWidth={0} /> To Do</span>
                <span className="flex items-center gap-1"><Diamond className="h-2.5 w-2.5 text-violet-500" /> Milestone</span>
                <span className="flex items-center gap-1"><span className="inline-block h-3 w-px bg-indigo-400" /> Today</span>
                <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /> At Risk</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panels - Compact */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Dependencies</h3>
          </div>
          {dependencyEdges.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">None recorded</p>
          ) : (
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              {items.flatMap((it) =>
                it.dependencies
                  .map((depId) => idToIndex[depId])
                  .filter((idx) => idx != null)
                  .map((idx) => `${it.summary} → ${items[idx].summary}`)
              ).slice(0, 4).map((line, idx) => (
                <li key={idx} className="truncate">• {line}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Milestones</h3>
          </div>
          {milestones.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">None set</p>
          ) : (
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              {milestones.slice(0, 4).map((m) => (
                <li key={m.id} className="truncate">• {m.summary} <span className="text-slate-400">{fmtShort(m.start)}</span></li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">At Risk</h3>
          </div>
          {atRiskTasks.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">All clear</p>
          ) : (
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              {atRiskTasks.slice(0, 4).map((t) => (
                <li key={t.id} className="truncate">• {t.summary}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Team</h3>
          </div>
          {teamMembers.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">No assignees</p>
          ) : (
            <>
              <div className="flex -space-x-1.5 mb-1.5">
                {teamMembers.slice(0, 4).map((name, idx) => (
                  <div
                    key={idx}
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-semibold text-white"
                    style={{ backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length] }}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                ))}
                {teamMembers.length > 4 && (
                  <div className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                    +{teamMembers.length - 4}
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{avgCapacity != null ? `${avgCapacity}%` : "—"}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Avg Capacity</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTime;
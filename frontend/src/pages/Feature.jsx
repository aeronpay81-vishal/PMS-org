
import { useState } from "react";
import {
  KanbanSquare,
  BellRing,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Users,
  Clock,
  Zap,
  ChevronRight,
  MoreHorizontal,
  Circle,
  CalendarDays,
  AlertCircle,
  Sparkles,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Footer from "./Footer";
import Navbar from "../components/navigation/Navbar";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeIn = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   FEATURE DATA
========================================================= */

const TABS = [
  {
    id: "boards",
    label: "Smart boards",
    icon: KanbanSquare,
    title: "Boards that organize themselves",
    body: "Drag tasks across custom columns, group by owner or sprint, and let AeroPilot auto-sort overdue work to the top so nothing gets buried.",
    points: [
      "Custom columns per project",
      "Auto-sort by due date or priority",
      "Switch between board, list, and timeline",
    ],
    color: "#0C66E4",
    soft: "#E9F2FF",
  },
  {
    id: "reminders",
    label: "Automated reminders",
    icon: BellRing,
    title: "Deadlines nobody has to chase",
    body: "Every task carries its own owner and due date. AeroPilot nudges the right person automatically, so status updates stop living in chat.",
    points: [
      "Owner-aware notifications",
      "Escalation for tasks left untouched",
      "Digest emails instead of noise",
    ],
    color: "#E2B203",
    soft: "#FFF7D6",
  },
  {
    id: "reporting",
    label: "Live reporting",
    icon: BarChart3,
    title: "Progress you can see at a glance",
    body: "Burndown charts and workload views update in real time, turning status meetings into decisions instead of updates.",
    points: [
      "Real-time burndown charts",
      "Per-teammate workload view",
      "One-click shareable reports",
    ],
    color: "#1F845A",
    soft: "#DCFFF1",
  },
];

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const Avatar = ({ children = "JD", className = "" }) => (
  <div
    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-600 ${className}`}
  >
    {children}
  </div>
);

const StatusDot = ({ color = "bg-slate-400" }) => (
  <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
);

/* =========================================================
   SMART BOARDS MOCKUP
========================================================= */

const BoardsMock = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={{
      y: -5,
      transition: { duration: 0.25 },
    }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
  >
    <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden h-5 w-32 rounded bg-white shadow-sm sm:block" />
        <MoreHorizontal className="h-4 w-4 text-slate-400" />
      </div>
    </div>

    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <KanbanSquare className="h-3.5 w-3.5" />
            </div>

            <p className="text-[12px] font-semibold text-slate-900">
              Product Launch
            </p>

            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-semibold text-emerald-600">
              On track
            </span>
          </div>

          <p className="mt-1 text-[9px] text-slate-400">
            Sprint 24 · 13 tasks
          </p>
        </div>

        <button className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-medium text-slate-500 sm:flex">
          <CalendarDays className="h-3 w-3" />
          This sprint
        </button>
      </div>
    </div>

    <div className="overflow-x-auto bg-slate-50/70 p-4 sm:p-5">
      <div className="grid min-w-[500px] grid-cols-3 gap-3">
        {[
          {
            label: "To do",
            count: 4,
            dot: "bg-slate-400",
            tasks: [
              ["Update landing page", "High"],
              ["Prepare launch copy", "Medium"],
            ],
          },
          {
            label: "In progress",
            count: 3,
            dot: "bg-blue-500",
            tasks: [
              ["Design dashboard", "High"],
              ["API integration", "Medium"],
            ],
          },
          {
            label: "Done",
            count: 6,
            dot: "bg-emerald-500",
            tasks: [
              ["Research competitors", "Done"],
              ["Create wireframes", "Done"],
            ],
          },
        ].map((column) => (
          <motion.div
            key={column.label}
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-slate-200 bg-slate-100/80 p-2.5"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StatusDot color={column.dot} />
                <span className="text-[9px] font-bold text-slate-600">
                  {column.label}
                </span>
              </div>

              <span className="rounded-md bg-white px-1.5 py-0.5 text-[8px] font-medium text-slate-400">
                {column.count}
              </span>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {column.tasks.map(([task, priority], index) => (
                <motion.div
                  key={task}
                  variants={cardAnimation}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2 },
                  }}
                  className="group rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[9px] font-semibold leading-4 text-slate-700">
                      {task}
                    </p>

                    {index === 0 && (
                      <MoreHorizontal className="h-3 w-3 shrink-0 text-slate-300" />
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[7px] font-semibold ${
                        priority === "High"
                          ? "bg-red-50 text-red-500"
                          : priority === "Done"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {priority}
                    </span>

                    <Avatar>{index === 1 ? "AM" : "VP"}</Avatar>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[8px] font-medium text-slate-400 transition hover:bg-white hover:text-slate-600">
              <span className="text-base leading-none">+</span>
              Add task
            </button>
          </motion.div>
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3 text-[8px] text-slate-400">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-blue-500" />
          Live updates
        </span>

        <span className="hidden items-center gap-1 sm:flex">
          <Users className="h-3 w-3 text-slate-400" />
          8 members
        </span>
      </div>

      <span className="flex items-center gap-1 text-[8px] font-semibold text-blue-600">
        View board
        <ChevronRight className="h-3 w-3" />
      </span>
    </div>
  </motion.div>
);

/* =========================================================
   AUTOMATED REMINDERS MOCKUP
========================================================= */

const RemindersMock = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={{
      y: -5,
      transition: { duration: 0.25 },
    }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
  >
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <div>
        <p className="text-[11px] font-bold text-slate-800">
          Notification center
        </p>

        <p className="mt-0.5 text-[8px] text-slate-400">
          Stay on top of what needs attention
        </p>
      </div>

      <motion.div
        animate={{
          rotate: [0, -8, 8, -4, 4, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
      >
        <BellRing className="h-4 w-4" />
      </motion.div>
    </div>

    <div className="grid grid-cols-3 border-b border-slate-100">
      {[
        ["03", "New"],
        ["02", "Due today"],
        ["01", "Overdue"],
      ].map(([value, label]) => (
        <div
          key={label}
          className="border-r border-slate-100 px-4 py-3 last:border-r-0"
        >
          <p className="text-[14px] font-bold tracking-tight text-slate-800">
            {value}
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">{label}</p>
        </div>
      ))}
    </div>

    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-2.5 bg-slate-50/70 p-4 sm:p-5"
    >
      {[
        {
          title: "Update client presentation",
          description: "Due today · Product Launch",
          tag: "Today",
          icon: Clock,
          iconClass: "bg-red-50 text-red-500",
          tagClass: "bg-red-50 text-red-500",
        },
        {
          title: "Review API specification",
          description: "2 days overdue · Engineering",
          tag: "Overdue",
          icon: AlertCircle,
          iconClass: "bg-amber-50 text-amber-600",
          tagClass: "bg-amber-50 text-amber-600",
        },
        {
          title: "QA pass assigned to you",
          description: "Assigned 10 minutes ago",
          tag: "New",
          icon: CheckCircle2,
          iconClass: "bg-blue-50 text-blue-600",
          tagClass: "bg-blue-50 text-blue-600",
        },
        {
          title: "Sprint review tomorrow",
          description: "Tomorrow · 10:00 AM",
          tag: "Reminder",
          icon: BellRing,
          iconClass: "bg-violet-50 text-violet-600",
          tagClass: "bg-violet-50 text-violet-600",
        },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            variants={cardAnimation}
            whileHover={{
              x: 3,
              transition: { duration: 0.2 },
            }}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold text-slate-700">
                {item.title}
              </p>

              <p className="mt-0.5 truncate text-[8px] text-slate-400">
                {item.description}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-md px-2 py-1 text-[7px] font-bold ${item.tagClass}`}
            >
              {item.tag}
            </span>
          </motion.div>
        );
      })}
    </motion.div>

    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
      <span className="text-[8px] text-slate-400">
        Notifications are automatically prioritized
      </span>

      <span className="text-[8px] font-semibold text-blue-600">
        View all
      </span>
    </div>
  </motion.div>
);

/* =========================================================
   REPORTING MOCKUP
========================================================= */

const ReportingMock = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    }}
    whileHover={{
      y: -5,
      transition: { duration: 0.25 },
    }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
  >
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <div>
        <p className="text-[11px] font-bold text-slate-800">
          Project overview
        </p>

        <p className="mt-0.5 text-[8px] text-slate-400">
          Product Launch · Sprint 24
        </p>
      </div>

      <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[8px] font-medium text-slate-500">
        Last 7 days
        <ChevronRight className="h-2.5 w-2.5 rotate-90" />
      </button>
    </div>

    <div className="grid grid-cols-3 border-b border-slate-100">
      {[
        {
          value: "78%",
          label: "Completed",
          change: "+12%",
        },
        {
          value: "42",
          label: "Velocity",
          change: "+8%",
        },
        {
          value: "8",
          label: "Members",
          change: "Active",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="border-r border-slate-100 px-4 py-3 last:border-r-0"
        >
          <p className="text-[15px] font-bold tracking-tight text-slate-800">
            {item.value}
          </p>

          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span className="text-[8px] text-slate-400">
              {item.label}
            </span>

            <span className="hidden text-[7px] font-semibold text-emerald-600 sm:block">
              {item.change}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-700">
            Sprint burndown
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            Remaining work across the sprint
          </p>
        </div>

        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-bold text-emerald-600">
          <TrendingUp className="h-2.5 w-2.5" />
          On track
        </span>
      </div>

      <div className="relative h-32 overflow-hidden rounded-lg border border-slate-100 bg-slate-50/60">
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          {[0, 1, 2, 3].map((line) => (
            <div
              key={line}
              className="border-t border-dashed border-slate-200"
            />
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-3 top-3 flex items-end gap-2">
          {[88, 76, 68, 56, 48, 34, 20].map((height, index) => (
            <motion.div
              key={index}
              initial={{
                height: 0,
              }}
              animate={{
                height: `${height}%`,
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex h-full flex-1 items-end"
            >
              <div className="w-full rounded-t-md bg-emerald-500/80 transition-all hover:bg-emerald-500" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-lg border border-slate-100 bg-slate-50 p-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="text-[8px] font-semibold text-slate-600">
              Team velocity
            </span>
          </div>

          <p className="mt-1 text-[12px] font-bold text-slate-800">
            42 pts
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-lg border border-slate-100 bg-slate-50 p-3"
        >
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-emerald-600" />
            <span className="text-[8px] font-semibold text-slate-600">
              Workload
            </span>
          </div>

          <p className="mt-1 text-[12px] font-bold text-slate-800">
            Balanced
          </p>
        </motion.div>
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
      <span className="flex items-center gap-1.5 text-[8px] text-slate-400">
        <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
        Updated just now
      </span>

      <button className="flex items-center gap-1 text-[8px] font-semibold text-blue-600">
        Share report
        <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  </motion.div>
);

/* =========================================================
   FEATURE MOCKUP SWITCHER
========================================================= */

const FeatureMock = ({ active }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{
          opacity: 0,
          x: 25,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          x: -25,
          scale: 0.98,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {active === "boards" && <BoardsMock />}
        {active === "reminders" && <RemindersMock />}
        {active === "reporting" && <ReportingMock />}
      </motion.div>
    </AnimatePresence>
  );
};

/* =========================================================
   FEATURES PAGE
========================================================= */

const Features = ({ showChrome = true }) => {
  const [active, setActive] = useState("boards");

  const current =
    TABS.find((tab) => tab.id === active) || TABS[0];

  const CurrentIcon = current.icon;

  return (
    <div
      className={`min-h-screen ${
        showChrome
          ? "marketing-page bg-white"
          : "bg-slate-50"
      }`}
    >
      {showChrome && <Navbar activePage="features" />}

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={`relative overflow-hidden ${
          showChrome ? "py-16 sm:py-20 lg:py-24" : "py-12"
        }`}
      >
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-50/70 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[8%] top-40 h-32 w-32 rounded-full bg-indigo-50 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-[8%] top-56 h-40 w-40 rounded-full bg-violet-50 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600"
            >
              <Sparkles className="h-3 w-3" />
              Built for modern teams
            </motion.div>

            <motion.h3
              variants={fadeUp}
              className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[48px] lg:leading-[1.05]"
            >
              Do more with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                less busy work.
              </span>
            </motion.h3>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-base"
            >
              AeroPilot handles the tracking, reminders and reporting,
              so your team can spend more time shipping meaningful work
              and less time updating status.
            </motion.p>
          </motion.div>

          {/* =================================================
              FEATURE TABS
          ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.35,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 flex justify-center"
          >
            <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className="group relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-[11px] font-semibold sm:px-4 sm:text-[12px]"
                  >
                    {/* Animated active background */}
                    {isActive && (
                      <motion.span
                        layoutId="activeFeatureTab"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                        }}
                        className="absolute inset-0 rounded-lg bg-indigo-600 shadow-md shadow-slate-900/10"
                      />
                    )}

                    <Icon
                      className={`relative z-10 h-3.5 w-3.5 transition ${
                        isActive
                          ? "text-blue-300"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />

                    <span
                      className={`relative z-10 ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* =================================================
              FEATURE CONTENT
          ================================================= */}

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            {/* Preview */}
            <motion.div
              key={`preview-${active}`}
              initial={{
                opacity: 0,
                x: -25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative order-2 lg:order-1"
            >
              <motion.div
                animate={{
                  scale: [1, 1.015, 1],
                  opacity: [0.25, 0.4, 0.25],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -inset-5 rounded-[32px] blur-3xl"
                style={{
                  backgroundColor: current.soft,
                }}
              />

              <div className="relative">
                <FeatureMock active={active} />
              </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  x: 25,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -15,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="order-1 lg:order-2"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
                  style={{
                    backgroundColor: current.color,
                    boxShadow: `0 10px 25px ${current.color}25`,
                  }}
                >
                  <CurrentIcon className="h-5 w-5" />
                </motion.div>

                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      color: current.color,
                    }}
                  >
                    {current.label}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    AeroPilot
                  </span>
                </div>

                <h4 className="max-w-xl text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-[36px] sm:leading-[1.12]">
                  {current.title}
                </h4>

                <p className="mt-4 max-w-xl text-[14px] leading-7 text-slate-500 sm:text-[15px]">
                  {current.body}
                </p>

                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="mt-7 space-y-3.5"
                >
                  {current.points.map((point) => (
                    <motion.li
                      key={point}
                      variants={cardAnimation}
                      className="flex items-center gap-3 text-[13px] font-medium text-slate-600"
                    >
                      <motion.span
                        whileHover={{
                          scale: 1.12,
                          rotate: 5,
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: current.soft,
                          color: current.color,
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </motion.span>

                      {point}
                    </motion.li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.4,
                  }}
                >
                  <Link
                    to="/"
                    className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                  >
                    Explore this feature

                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUE STRIP
      ===================================================== */}

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.2,
        }}
        variants={staggerContainer}
        className="border-y border-slate-200 bg-slate-50/60"
      >
       
      </motion.section>

      {showChrome && <Footer />}
    </div>
  );
};

export default Features;


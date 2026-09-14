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
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "./Footer";
import MarketingNavbar from "../components/MarketingNavbar";

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

const BoardsMock = () => (
  <div className="marketing-card overflow-hidden p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#C9372C]" />
        <span className="h-2 w-2 rounded-full bg-[#E2B203]" />
        <span className="h-2 w-2 rounded-full bg-[#1F845A]" />
      </div>
      <span className="rounded bg-[#E9F2FF] px-2 py-0.5 text-[10px] font-semibold text-[#0C66E4]">
        Sprint 24
      </span>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "To do", count: 4, color: "bg-[#8993A4]" },
        { label: "In progress", count: 3, color: "bg-[#0C66E4]" },
        { label: "Done", count: 6, color: "bg-[#1F845A]" },
      ].map((col) => (
        <div key={col.label} className="rounded bg-[#F7F8F9] p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${col.color}`} />
              <p className="text-[10px] font-semibold text-[#44546F]">{col.label}</p>
            </div>
            <span className="text-[9px] text-[#8993A4]">{col.count}</span>
          </div>
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded border border-[#DCDFE4] bg-white p-2">
                <div className="mb-1.5 h-1 w-8 rounded bg-[#B3D4FF]" />
                <div className="h-1.5 w-full rounded bg-[#F1F2F4]" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-4 w-4 rounded-full bg-[#0C66E4]" />
                  <Clock className="h-2.5 w-2.5 text-[#8993A4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RemindersMock = () => (
  <div className="marketing-card overflow-hidden p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626F86]">Notifications</p>
      <span className="flex items-center gap-1 rounded bg-[#FFF7D6] px-2 py-0.5 text-[9px] font-semibold text-[#946F00]">
        <BellRing className="h-2.5 w-2.5" />3 new
      </span>
    </div>
    <div className="space-y-2">
      {[
        { text: "Due today: Update client deck", tag: "Today", tagColor: "bg-[#FFEEF0] text-[#C9372C]" },
        { text: "Overdue: Review API spec", tag: "Overdue", tagColor: "bg-[#FFF7D6] text-[#946F00]" },
        { text: "Assigned to you: QA pass", tag: "New", tagColor: "bg-[#E9F2FF] text-[#0C66E4]" },
      ].map((row) => (
        <div key={row.text} className="flex items-center gap-3 rounded border border-[#F1F2F4] bg-[#F7F8F9] px-3 py-2.5">
          <span className="flex-1 text-[11px] font-medium text-[#172B4D]">{row.text}</span>
          <span className={`rounded px-2 py-0.5 text-[8px] font-semibold ${row.tagColor}`}>{row.tag}</span>
        </div>
      ))}
    </div>
  </div>
);

const ReportingMock = () => (
  <div className="marketing-card overflow-hidden p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#626F86]">Sprint burndown</p>
      <span className="flex items-center gap-1 rounded bg-[#DCFFF1] px-2 py-0.5 text-[9px] font-semibold text-[#1F845A]">
        <TrendingUp className="h-2.5 w-2.5" />
        On track
      </span>
    </div>
    <div className="flex h-32 items-end gap-2">
      {[82, 68, 58, 48, 40, 28, 12].map((h, i) => (
        <div key={i} className="flex-1 rounded-t bg-[#1F845A]" style={{ height: `${h}%`, minHeight: "8px" }} />
      ))}
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-[#F1F2F4] pt-3 text-[9px] text-[#626F86]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[#0C66E4]" />Velocity 42</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3 text-[#1F845A]" />Team 8</span>
      </div>
      <span className="flex items-center gap-0.5 font-medium text-[#0C66E4]">
        Share report <ChevronRight className="h-2.5 w-2.5" />
      </span>
    </div>
  </div>
);

const FeatureMock = ({ active }) => {
  if (active === "boards") return <BoardsMock />;
  if (active === "reminders") return <RemindersMock />;
  return <ReportingMock />;
};

const Features = ({ showChrome = true }) => {
  const [active, setActive] = useState("boards");
  const current = TABS.find((t) => t.id === active);

  return (
    <div className={`${showChrome ? "marketing-page" : "bg-[#F7F8F9]"}`}>
      {showChrome && <MarketingNavbar activePage="features" />}

      <section className={`mx-auto max-w-6xl px-4 ${showChrome ? "py-16 sm:px-6" : "py-12 sm:px-8"}`}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0C66E4]">Platform</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#172B4D] sm:text-5xl">Do more with less busywork</h1>
          <p className="mt-4 text-[15px] leading-7 text-[#44546F]">AeroPilot handles the tracking and nudges, so your team spends time on the work itself — not on updating status.</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 rounded border px-4 py-2 text-[13px] font-medium transition ${isActive
                    ? "border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4]"
                    : "border-[#DCDFE4] bg-white text-[#44546F] hover:bg-[#F1F2F4]"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FeatureMock active={active} />
          <div>
            <div
              className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded text-white"
              style={{ background: current.color }}
            >
              <current.icon className="h-5 w-5" />
            </div>
            <h3 className="text-[24px] font-semibold tracking-tight text-[#172B4D] sm:text-[28px]">
              {current.title}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#44546F]">{current.body}</p>
            <ul className="mt-6 space-y-3">
              {current.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14px] text-[#44546F]">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: current.soft, color: current.color }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/"
              className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0C66E4] hover:text-[#0055CC]"
            >
              Explore this feature
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#DCDFE4] bg-white py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8993A4]">
            Trusted by teams at
          </span>
          {["Vercel", "Linear", "Raycast", "Loom", "Ramp"].map((name) => (
            <span key={name} className="text-[14px] font-semibold text-[#B3BAC5]">
              {name}
            </span>
          ))}
        </div>
      </section>

      {showChrome && <Footer />}
    </div>
  );
};

export default Features;

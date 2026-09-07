import {
  Sparkles,
  Plus,
  CalendarDays,
  Crown,
  UserCheck,
} from "lucide-react";
import { authAPI } from "../../api/admin";

const DashboardHeader = ({ user, onCreateProject, onCreateTask }) => {
  const currentUser = user || authAPI.getStoredUser() || {};
  const isManager = currentUser?.role === "manager";
  const displayName = currentUser?.full_name || currentUser?.name || currentUser?.username || "User";

  return (
    <section className="mb-6 rounded-2xl overflow-hidden border border-indigo-100 dark:border-slate-800 bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 shadow-sm">
      {/* Subtle decorative background blobs */}
      <div className="relative p-5 sm:p-6">
        {/* Background decoration */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 overflow-hidden opacity-60 dark:opacity-20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-200/60 dark:bg-indigo-600/10 blur-3xl" />
          <div className="absolute right-20 bottom-0 h-28 w-28 rounded-full bg-blue-200/60 dark:bg-blue-600/10 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              isManager
                ? "border border-indigo-200 dark:border-indigo-800/50 bg-indigo-100/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400"
                : "border border-emerald-200 dark:border-emerald-800/50 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
            }`}>
              {isManager ? <Crown className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
              {isManager ? "Project Manager Workspace" : "Personal Workspace"}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-3xl">
              Welcome back, {displayName} 👋
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isManager
                ? "Create projects, assign tasks, and monitor your team's real-time progress."
                : "Create your own projects or review tasks assigned to you."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300">
              <CalendarDays className="h-4 w-4 text-indigo-400" />
              Today
            </button>

            <button
              onClick={onCreateProject}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-300/40 dark:shadow-indigo-900/30 transition hover:from-indigo-600 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-300/50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
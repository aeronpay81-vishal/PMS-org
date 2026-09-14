import { Plus, CalendarDays } from "lucide-react";
import { authAPI } from "../../api/admin";

const DashboardHeader = ({ user, onCreateProject }) => {
  const currentUser = user || authAPI.getStoredUser() || {};
  const displayName = currentUser?.full_name || currentUser?.name || currentUser?.username || "User";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="mb-6 flex flex-col gap-4 border-b border-[#DCDFE4] pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[12px] font-medium text-[#626F86] dark:text-slate-400">For you</p>
        <h2 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-[#172B4D] dark:text-white">
          Welcome back, {displayName}
        </h2>
        <p className="mt-1 max-w-xl text-[14px] text-[#44546F] dark:text-slate-400">
          Pick up where you left off. Track issues, projects, and team progress in one place.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded border border-[#DCDFE4] bg-white px-3 py-1.5 text-[13px] font-medium text-[#44546F] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <CalendarDays className="h-3.5 w-3.5 text-[#626F86]" />
          {today}
        </span>
        <button
          type="button"
          onClick={onCreateProject}
          className="inline-flex items-center gap-1.5 rounded bg-[#0C66E4] px-3.5 py-1.5 text-[14px] font-medium text-white hover:bg-[#0055CC]"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>
    </section>
  );
};

export default DashboardHeader;

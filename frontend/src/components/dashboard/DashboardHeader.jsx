import { Plus, CalendarDays, Sparkles } from "lucide-react";
import { authAPI } from "../../api/admin";

const DashboardHeader = ({ user, onCreateProject }) => {
  const currentUser = user || authAPI.getStoredUser() || {};

  const displayName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.username ||
    "User";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      className="
        relative mb-7
        overflow-hidden
        rounded-2xl
        border border-slate-200/80
        bg-white
        px-5 py-5
        shadow-[0_4px_20px_rgba(15,23,42,0.04)]
        dark:border-slate-800
        dark:bg-[#0F1117]
        dark:shadow-none
        sm:px-6 sm:py-6
      "
    >
      {/* Subtle background glow */}
      <div
        className="
          pointer-events-none
          absolute -right-20 -top-24
          h-52 w-52
          rounded-full
          bg-indigo-500/5
          blur-3xl
          dark:bg-indigo-500/10
        "
      />

      <div
        className="
          relative
          flex flex-col gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* Left */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full
                border border-indigo-100
                bg-indigo-50
                px-2.5 py-1
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-indigo-600

                dark:border-indigo-500/20
                dark:bg-indigo-500/10
                dark:text-indigo-400
              "
            >
              <Sparkles className="h-3 w-3" />
              For you
            </span>
          </div>

          <h2
            className="
              text-[24px]
              font-semibold
              leading-tight
              tracking-[-0.02em]
              text-slate-900
              dark:text-white
              sm:text-[27px]
            "
          >
            Welcome back,{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {displayName}
            </span>
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-[13px]
              leading-5
              text-slate-500
              dark:text-slate-400
            "
          >
            Pick up where you left off. Track issues, projects, and
            team progress in one place.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {/* Date */}
          <div
            className="
              inline-flex h-10
              items-center gap-2
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-3
              text-[12px]
              font-medium
              text-slate-600

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <CalendarDays
              className="
                h-4 w-4
                text-slate-400
                dark:text-slate-500
              "
            />

            <span>{today}</span>
          </div>

          {/* Create Project */}
          <button
            type="button"
            onClick={onCreateProject}
            className="
              group
              inline-flex h-10
              items-center gap-2
              rounded-xl
              bg-indigo-600
              px-4
              text-[12px]
              font-semibold
              text-white
              shadow-sm
              shadow-indigo-500/20
              transition-all duration-200

              hover:bg-indigo-700
              hover:shadow-md
              hover:shadow-indigo-500/25
              active:scale-[0.98]

              dark:bg-indigo-500
              dark:hover:bg-indigo-400
              dark:shadow-indigo-500/10
            "
          >
            <span
              className="
                flex h-5 w-5
                items-center justify-center
                rounded-md
                bg-white/15
              "
            >
              <Plus
                className="
                  h-3.5 w-3.5
                  transition-transform
                  duration-200
                  group-hover:rotate-90
                "
              />
            </span>

            Create project
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
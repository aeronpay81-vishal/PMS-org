import {
  Menu,
  Bell,
  Search,
  LogOut,
  Crown,
  User as UserIcon,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { authAPI } from "../../api/admin";
import { useTheme } from "../../context/ThemeContext";

const Topbar = ({ user, onLogout, onMenuClick, pageTitle = "Dashboard" }) => {
  const { theme, toggleTheme } = useTheme();
  const currentUser = user || authAPI.getStoredUser() || {};
  const userName = currentUser?.full_name || currentUser?.name || currentUser?.username || "User";
  const userEmail = currentUser?.email || "user@example.com";
  const isManager = currentUser?.role === "manager";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400 transition hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Project Management
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                isManager
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
              }`}
            >
              {isManager ? (
                <><Crown className="h-3 w-3" /> Project Manager</>
              ) : (
                <><UserIcon className="h-3 w-3" /> Account</>
              )}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Search */}
        <div className="ml-1 hidden w-[280px] lg:block">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              ⌘
            </span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Role Badge (Mobile only) */}
        <div className="md:hidden">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
              isManager
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isManager ? <Crown className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
            {isManager ? "Manager" : "Member"}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-amber-400"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] text-amber-400" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-indigo-500" />
          )}
        </button>

        {/* Notification */}
        <button className="relative rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="mx-1.5 hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md ${
            isManager
              ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-300/40 dark:shadow-indigo-900/30"
              : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-300/40 dark:shadow-emerald-900/30"
          }`}>
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden lg:block text-left">
            <p className="max-w-[130px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {userName}
            </p>
            <p className="max-w-[130px] truncate text-[11px] text-slate-400 dark:text-slate-500">
              {userEmail}
            </p>
          </div>

          <ChevronDown className="hidden lg:block h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Logout"
          className="ml-1 rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
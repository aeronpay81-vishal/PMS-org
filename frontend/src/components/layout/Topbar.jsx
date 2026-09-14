import {
  Menu,
  Bell,
  Search,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#DCDFE4] bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded p-1.5 text-[#44546F] hover:bg-[#F1F2F4] lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden min-w-0 items-center gap-1 text-[13px] sm:flex">
        <span className="text-[#626F86] dark:text-slate-500">Workspace</span>
        <ChevronRight className="h-3.5 w-3.5 text-[#8993A4]" />
        <span className="truncate font-medium text-[#172B4D] dark:text-slate-100">{pageTitle}</span>
      </nav>

      <div className="mx-auto hidden w-full max-w-lg md:block">
        <div className="flex items-center gap-2 rounded border border-[#DCDFE4] bg-[#F7F8F9] px-3 py-1.5 focus-within:border-[#0C66E4] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0C66E4]/20 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-blue-500">
          <Search className="h-4 w-4 shrink-0 text-[#626F86]" />
          <input
            type="text"
            placeholder="Search issues, projects, people"
            className="w-full bg-transparent text-[13px] text-[#172B4D] outline-none placeholder:text-[#8993A4] dark:text-slate-200"
          />
          <span className="hidden rounded border border-[#DCDFE4] bg-white px-1.5 py-px text-[10px] font-medium text-[#8993A4] sm:inline dark:border-slate-700 dark:bg-slate-800">
            /
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="rounded p-2 text-[#44546F] hover:bg-[#F1F2F4] dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          className="relative rounded p-2 text-[#44546F] hover:bg-[#F1F2F4] dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C9372C]" />
        </button>

        <div className="mx-2 hidden h-6 w-px bg-[#DCDFE4] sm:block dark:bg-slate-800" />

        <div className="flex items-center gap-2 pl-0.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${
              isManager ? "bg-[#0C66E4]" : "bg-[#1F845A]"
            }`}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left lg:block">
            <p className="max-w-[150px] truncate text-[13px] font-medium text-[#172B4D] dark:text-slate-200">
              {userName}
            </p>
            <p className="max-w-[150px] truncate text-[11px] text-[#626F86]">{userEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className="rounded p-2 text-[#626F86] hover:bg-[#FFEEF0] hover:text-[#C9372C] dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

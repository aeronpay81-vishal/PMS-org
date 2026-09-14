import { useState } from "react";
import {
  Home,
  Clock3,
  FolderKanban,
  CheckSquare,
  Sparkles,
  CalendarDays,
  BarChart3,
  Settings,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = ({ activeItem = "Dashboard", onNavigate, mobileOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const planningItems = [
    { label: "Dashboard", icon: Home },
    { label: "Projects", icon: FolderKanban },
    { label: "Tasks", icon: CheckSquare },
    { label: "Smart Timeline", icon: Clock3 },
    { label: "Calendar", icon: CalendarDays },
  ];

  const insightItems = [
    { label: "AI Insights", icon: Sparkles, badge: "New" },
    { label: "Workflow Engine", icon: Workflow },
    { label: "Reports", icon: BarChart3 },
    { label: "Settings", icon: Settings },
  ];

  const handleNavigation = (item) => {
    if (onNavigate) onNavigate(item);
    if (onClose) onClose();
  };

  const renderGroup = (title, items) => (
    <div className="mb-5">
      {!collapsed && (
        <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#626F86] dark:text-slate-500">
          {title}
        </p>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigation(item.label)}
              title={collapsed ? item.label : ""}
              className={`relative flex w-full items-center gap-3 rounded px-2.5 py-1.5 text-[14px] transition-colors ${
                active
                  ? "bg-[#E9F2FF] font-medium text-[#0C66E4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "font-normal text-[#44546F] hover:bg-[#F1F2F4] dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#0C66E4]" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-px text-[10px] font-semibold ${
                        active
                          ? "bg-white text-[#0C66E4] dark:bg-slate-900 dark:text-blue-300"
                          : "bg-[#E9F2FF] text-[#0C66E4] dark:bg-blue-500/20 dark:text-blue-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#172B4D]/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#DCDFE4] bg-[#FAFBFC] transition-all duration-300 dark:border-slate-800 dark:bg-slate-950
          ${collapsed ? "w-[72px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-[#DCDFE4] px-3 dark:border-slate-800">
          <BrandLogo collapsed={collapsed} isDark={isDark} />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded p-1.5 text-[#626F86] hover:bg-[#F1F2F4] lg:hidden dark:hover:bg-slate-800"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          {renderGroup("Your work", planningItems)}
          {renderGroup("Insights", insightItems)}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 w-full items-center justify-center gap-2 border-t border-[#DCDFE4] text-[#626F86] transition-colors hover:bg-[#F1F2F4] lg:flex dark:border-slate-800 dark:hover:bg-slate-900"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;

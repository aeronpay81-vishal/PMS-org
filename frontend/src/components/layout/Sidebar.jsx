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

const Sidebar = ({
  activeItem = "Dashboard",
  onNavigate,
  mobileOpen,
  onClose,
}) => {
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
    { label: "AI Insights", icon: Sparkles, badge: "NEW" },
    { label: "Workflow", icon: Workflow },
    { label: "Reports", icon: BarChart3 },
    { label: "Settings", icon: Settings },
  ];

  const handleNavigation = (item) => {
    onNavigate?.(item);
    onClose?.();
  };

  const renderGroup = (title, items) => (
    <section className="mb-8">
      {!collapsed && (
        <div className="mb-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-600">
            {title}
          </span>
        </div>
      )}

      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => handleNavigation(item.label)}
              className={`
                group relative flex h-10 w-full items-center
                rounded-lg transition-all duration-200
                ${collapsed ? "justify-center" : "px-3"}
                ${
                  active
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-slate-100"
                }
              `}
            >
              {/* Active line */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-indigo-500" />
              )}

              <Icon
                className={`
                  h-[17px] w-[17px] shrink-0 transition-colors
                  ${
                    active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                  }
                `}
                strokeWidth={active ? 2.2 : 1.8}
              />

              {!collapsed && (
                <>
                  <span
                    className={`
                      ml-3 flex-1 text-left text-[13px]
                      ${
                        active
                          ? "font-semibold"
                          : "font-medium"
                      }
                    `}
                  >
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className="
                        rounded-md
                        border border-indigo-100
                        bg-indigo-50
                        px-1.5 py-0.5
                        text-[8px]
                        font-bold
                        tracking-wide
                        text-indigo-600
                        dark:border-indigo-500/20
                        dark:bg-indigo-500/10
                        dark:text-indigo-400
                      "
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-slate-950/20
            backdrop-blur-sm
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200/80
          bg-[#FCFCFD]
          transition-[width,transform] duration-300 ease-out
          dark:border-slate-800
          dark:bg-[#0B0D12]
          ${collapsed ? "w-[68px]" : "w-[238px]"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div
          className={`
            flex h-[64px] shrink-0 items-center
            border-b border-slate-200/70
            dark:border-slate-800
            ${collapsed ? "justify-center px-2" : "px-4"}
          `}
        >
          <BrandLogo
            collapsed={collapsed}
            isDark={isDark}
          />

          <button
            type="button"
            onClick={onClose}
            className="
              ml-auto flex h-8 w-8 items-center justify-center
              rounded-lg text-slate-400
              hover:bg-slate-100 hover:text-slate-700
              dark:hover:bg-slate-900 dark:hover:text-white
              lg:hidden
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-5">
          {renderGroup("Workspace", planningItems)}
          {renderGroup("Insights", insightItems)}
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200/70 p-2.5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`
              flex h-9 w-full items-center rounded-lg
              text-slate-400 transition-colors
              hover:bg-slate-100 hover:text-slate-700
              dark:hover:bg-slate-900 dark:hover:text-slate-200
              ${collapsed ? "justify-center" : "px-3"}
            `}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2 text-[11px] font-medium">
                  Collapse sidebar
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
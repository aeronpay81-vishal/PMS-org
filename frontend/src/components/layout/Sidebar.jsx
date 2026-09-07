import { useState } from "react";
import {
  Home,
  Clock3,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  Workflow,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { authAPI } from "../../api/admin";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "./BrandLogo";

const Sidebar = ({ user, activeItem = "Dashboard", onNavigate, mobileOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const currentUser = user || authAPI.getStoredUser() || {};
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuItems = [
    { label: "Dashboard", icon: Home },
    { label: "Smart Timeline", icon: Clock3 },
    { label: "Projects", icon: FolderKanban },
    { label: "Tasks", icon: CheckSquare },
    { label: "AI Insights", icon: Sparkles, badge: "New" },
    { label: "Workflow Engine", icon: Workflow },
    // { label: "Automation", icon: Users },
    { label: "Calendar", icon: CalendarDays },
    { label: "Reports", icon: BarChart3 },
    { label: "Settings", icon: Settings },
  ];

  const handleNavigation = (item) => {
    if (onNavigate) onNavigate(item);
    if (onClose) onClose();
  };

  // ─── Colors matched to AeroPilot reference UI ───────────────────────
  const SIDEBAR_BG = isDark
    ? "linear-gradient(180deg, #0B1B33 0%, #071426 100%)"
    : "linear-gradient(180deg, #EEF4FF 0%, #E4EEFF 32%, #CFE0FF 62%, #6BA8F8 100%)";

  const SIDEBAR_BORDER = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(255, 255, 255, 0.45)";
  const ACTIVE_BG = isDark
    ? "linear-gradient(135deg, #4F6EF7 0%, #3B56E8 100%)"
    : "#FFFFFF";
  const ACTIVE_SHADOW = isDark
    ? "0 4px 16px rgba(79, 110, 247, 0.55)"
    : "0 4px 14px rgba(15, 23, 42, 0.08)";
  const ACTIVE_TEXT = isDark ? "#ffffff" : "#2563EB";
  const ACTIVE_ICON = isDark ? "#ffffff" : "#2563EB";

  const LABEL_COLOR = isDark ? "#64748B" : "#94A3B8";
  const TEXT_COLOR = isDark ? "#94A3B8" : "#475569";
  const ICON_COLOR = isDark ? "#7C93B8" : "#64748B";
  const HOVER_BG = isDark ? "rgba(79, 110, 247, 0.18)" : "rgba(255, 255, 255, 0.55)";
  const HOVER_TEXT = isDark ? "#C7D6FF" : "#1E293B";
  const BRAND_BLUE = isDark ? "#DCE6FF" : "#0F172A";
  const BRAND_ACCENT = isDark ? "#6C8CFF" : "#2563EB";
  const CARD_BG = isDark
    ? "rgba(79, 110, 247, 0.14)"
    : "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(224,236,255,0.88) 100%)";
  const CARD_BORDER = isDark ? "rgba(148, 163, 184, 0.14)" : "rgba(255, 255, 255, 0.95)";
  const PROGRESS_TRACK = isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(37, 99, 235, 0.12)";
  const PROGRESS_FILL = "linear-gradient(90deg, #93C5FD 0%, #2563EB 100%)";
  const BADGE_BG_INACTIVE = isDark ? "rgba(79,110,247,0.18)" : "#DBEAFE";
  const SCROLLBAR_THUMB = isDark ? "#3B56E8" : "rgba(37, 99, 235, 0.28)";
  const MOBILE_OVERLAY_BG = isDark ? "rgba(2, 6, 23, 0.6)" : "rgba(15,23,42,0.35)";
  // ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: ${SCROLLBAR_THUMB}; border-radius: 4px; }
        .sb-scroll { scrollbar-width: thin; scrollbar-color: ${SCROLLBAR_THUMB} transparent; }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: MOBILE_OVERLAY_BG, backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300
          ${collapsed ? "w-[76px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ background: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}`, transition: "background 0.3s ease" }}
      >
        {/* ── Logo ── */}
        <div
          className="flex h-[76px] shrink-0 items-center px-5"
          style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}
        >
          <BrandLogo collapsed={collapsed} isDark={isDark} />

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 lg:hidden transition"
            style={{ color: LABEL_COLOR }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* ── Nav ── */}
        <div className="sb-scroll flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.label)}
                  title={collapsed ? item.label : ""}
                  className="relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-[11px] text-[13px] font-semibold transition-all duration-200"
                  style={
                    active
                      ? {
                        background: ACTIVE_BG,
                        color: ACTIVE_TEXT,
                        boxShadow: ACTIVE_SHADOW,
                      }
                      : { color: TEXT_COLOR, background: "transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = HOVER_BG;
                      e.currentTarget.style.color = HOVER_TEXT;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = TEXT_COLOR;
                    }
                  }}
                >
                  <Icon
                    style={{
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      color: active ? ACTIVE_ICON : ICON_COLOR,
                      transition: "color 0.15s",
                    }}
                  />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>

                      {item.badge && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={
                            active
                              ? { background: "rgba(37, 99, 235, 0.1)", color: ACTIVE_TEXT }
                              : {
                                background: BADGE_BG_INACTIVE,
                                color: "#2563EB",
                              }
                          }
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

        {/* ── AI Learning card ── */}
        {!collapsed && (
          <div className="p-3" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
            <div
              className="rounded-2xl p-4"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: BRAND_BLUE }}>
                  AI Learning
                </span>
                <Sparkles style={{ width: 13, height: 13, color: BRAND_ACCENT }} />
              </div>

              <p className="mb-3 text-[11px] leading-relaxed" style={{ color: TEXT_COLOR }}>
                AeroPilot is learning your team's work patterns.
              </p>

              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span style={{ color: LABEL_COLOR }}>Progress</span>
                <span className="font-bold" style={{ color: BRAND_ACCENT }}>92%</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: PROGRESS_TRACK }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: "92%", background: PROGRESS_FILL }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Collapse button ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-11 w-full items-center justify-center gap-2 lg:flex transition-all duration-200"
          style={{ borderTop: `1px solid ${SIDEBAR_BORDER}`, color: LABEL_COLOR }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = HOVER_BG;
            e.currentTarget.style.color = BRAND_ACCENT;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = LABEL_COLOR;
          }}
        >
          {collapsed ? (
            <ChevronRight style={{ width: 15, height: 15, color: TEXT_COLOR }} />
          ) : (
            <>
              <ChevronLeft style={{ width: 14, height: 14, color: TEXT_COLOR }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_COLOR }}>Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
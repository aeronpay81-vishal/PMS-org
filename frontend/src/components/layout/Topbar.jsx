import { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

import { authAPI } from "../../api/admin";
import { notificationsAPI } from "../../api/notifications";
import { useTheme } from "../../context/ThemeContext";

const Topbar = ({
  user,
  onLogout,
  onMenuClick,
  pageTitle = "Dashboard",
}) => {
  const { theme, toggleTheme } = useTheme();

  const currentUser = user || authAPI.getStoredUser() || {};

  const userName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.username ||
    "User";

  const userEmail = currentUser?.email || "user@example.com";
  const isManager = currentUser?.role === "manager";

  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    notificationsAPI
      .getAll()
      .then((response) => {
        if (mounted) {
          setNotifications(response?.data || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setNotifications([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const markNotificationRead = async (notification) => {
    if (notification.is_read) return;

    try {
      await notificationsAPI.markRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markAllRead();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );
    } catch {}
  };

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[64px] items-center gap-3
        border-b border-slate-200/80
        bg-white/90 px-4
        backdrop-blur-xl
        dark:border-slate-800
        dark:bg-[#0B0D12]/90
        sm:px-6
      "
    >
      {/* Mobile Menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="
          flex h-9 w-9 items-center justify-center
          rounded-xl
          text-slate-500
          transition-all
          hover:bg-slate-100
          hover:text-slate-900
          dark:text-slate-400
          dark:hover:bg-slate-900
          dark:hover:text-white
          lg:hidden
        "
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      {/* Breadcrumb */}
      <nav className="hidden min-w-0 items-center gap-2 sm:flex">
        <span
          className="
            text-[12px] font-medium
            text-slate-400
            dark:text-slate-500
          "
        >
          Workspace
        </span>

        <ChevronRight
          className="
            h-3.5 w-3.5
            text-slate-300
            dark:text-slate-700
          "
        />

        <span
          className="
            max-w-[180px]
            truncate
            text-[13px]
            font-semibold
            text-slate-800
            dark:text-slate-100
          "
        >
          {pageTitle}
        </span>
      </nav>

      {/* Search */}
      <div className="mx-auto hidden w-full max-w-md md:block">
        <div
          className="
            group
            flex h-9 items-center gap-2.5
            rounded-xl
            border border-slate-200
            bg-slate-50/80
            px-3
            transition-all duration-200

            focus-within:border-indigo-300
            focus-within:bg-white
            focus-within:ring-4
            focus-within:ring-indigo-500/10

            dark:border-slate-800
            dark:bg-slate-900/60
            dark:focus-within:border-indigo-500/40
            dark:focus-within:bg-slate-900
          "
        >
          <Search
            className="
              h-4 w-4 shrink-0
              text-slate-400
              transition-colors
              group-focus-within:text-indigo-500
            "
          />

          <input
            type="text"
            placeholder="Search issues, projects, people..."
            className="
              w-full
              bg-transparent
              text-[12px]
              font-medium
              text-slate-800
              outline-none

              placeholder:text-slate-400

              dark:text-slate-200
              dark:placeholder:text-slate-600
            "
          />

          <span
            className="
              hidden
              rounded-md
              border border-slate-200
              bg-white
              px-1.5 py-0.5
              text-[9px]
              font-semibold
              text-slate-400
              shadow-sm
              sm:inline-flex

              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-500
            "
          >
            /
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1.5">

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            border border-transparent
            text-slate-500
            transition-all

            hover:border-slate-200
            hover:bg-slate-50
            hover:text-slate-800

            dark:text-slate-400
            dark:hover:border-slate-800
            dark:hover:bg-slate-900
            dark:hover:text-white
          "
        >
          {theme === "dark" ? (
            <Sun className="h-[17px] w-[17px] text-amber-400" />
          ) : (
            <Moon className="h-[17px] w-[17px]" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() =>
              setNotificationsOpen((current) => !current)
            }
            className="
              relative
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              border border-transparent
              text-slate-500
              transition-all

              hover:border-slate-200
              hover:bg-slate-50
              hover:text-slate-800

              dark:text-slate-400
              dark:hover:border-slate-800
              dark:hover:bg-slate-900
              dark:hover:text-white
            "
          >
            <Bell className="h-[17px] w-[17px]" />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  right-1 top-1
                  flex h-3.5 min-w-3.5
                  items-center justify-center
                  rounded-full
                  border-2 border-white
                  bg-indigo-600
                  px-0.5
                  text-[8px]
                  font-bold
                  leading-none
                  text-white

                  dark:border-[#0B0D12]
                "
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationsOpen && (
            <>
              {/* Mobile backdrop */}
              <div
                className="
                  fixed inset-0 z-40
                  bg-slate-950/10
                  backdrop-blur-[2px]
                  sm:hidden
                "
                onClick={() => setNotificationsOpen(false)}
              />

              <div
                className="
                  absolute right-0 top-11 z-50
                  w-[340px]
                  overflow-hidden
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  shadow-[0_20px_50px_rgba(15,23,42,0.14)]

                  dark:border-slate-800
                  dark:bg-[#11141B]
                  dark:shadow-black/40
                "
              >
                {/* Header */}
                <div
                  className="
                    flex items-center justify-between
                    border-b border-slate-100
                    px-4 py-3

                    dark:border-slate-800
                  "
                >
                  <div>
                    <p
                      className="
                        text-[13px]
                        font-semibold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Notifications
                    </p>

                    {unreadCount > 0 && (
                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {unreadCount} unread notification
                        {unreadCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="
                        flex items-center gap-1
                        rounded-lg
                        px-2 py-1
                        text-[10px]
                        font-semibold
                        text-indigo-600
                        transition-colors
                        hover:bg-indigo-50

                        dark:text-indigo-400
                        dark:hover:bg-indigo-500/10
                      "
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all
                    </button>
                  )}
                </div>

                {/* Notifications */}
                <div className="max-h-[340px] overflow-y-auto p-2">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <div
                        className="
                          mx-auto mb-3
                          flex h-10 w-10
                          items-center justify-center
                          rounded-full
                          bg-slate-100
                          text-slate-400

                          dark:bg-slate-800
                          dark:text-slate-500
                        "
                      >
                        <Bell className="h-4 w-4" />
                      </div>

                      <p
                        className="
                          text-[12px]
                          font-medium
                          text-slate-600
                          dark:text-slate-300
                        "
                      >
                        No notifications yet
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-slate-400
                        "
                      >
                        You're all caught up.
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          markNotificationRead(notification)
                        }
                        className={`
                          group
                          flex w-full
                          gap-3
                          rounded-xl
                          p-3
                          text-left
                          transition-all

                          hover:bg-slate-50

                          dark:hover:bg-slate-900

                          ${
                            !notification.is_read
                              ? "bg-indigo-50/50 dark:bg-indigo-500/5"
                              : "opacity-70"
                          }
                        `}
                      >
                        {/* Indicator */}
                        <span
                          className={`
                            mt-1.5
                            h-2 w-2
                            shrink-0
                            rounded-full

                            ${
                              !notification.is_read
                                ? "bg-indigo-500"
                                : "bg-slate-300 dark:bg-slate-700"
                            }
                          `}
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate
                              text-[12px]
                              font-semibold
                              text-slate-800
                              dark:text-slate-100
                            "
                          >
                            {notification.title}
                          </p>

                          <p
                            className="
                              mt-1
                              line-clamp-2
                              text-[11px]
                              leading-4
                              text-slate-500
                              dark:text-slate-400
                            "
                          >
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div
          className="
            mx-1.5
            hidden h-6 w-px
            bg-slate-200
            sm:block
            dark:bg-slate-800
          "
        />

        {/* User */}
        <div className="flex items-center gap-2 pl-1">
          <div
            className={`
              flex h-8 w-8
              items-center justify-center
              rounded-xl
              text-[11px]
              font-bold
              text-white
              shadow-sm

              ${
                isManager
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
              }
            `}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="hidden min-w-0 lg:block">
            <p
              className="
                max-w-[140px]
                truncate
                text-[12px]
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              {userName}
            </p>

            <p
              className="
                max-w-[140px]
                truncate
                text-[10px]
                text-slate-400
                dark:text-slate-500
              "
            >
              {userEmail}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className="
            ml-0.5
            flex h-9 w-9
            items-center justify-center
            rounded-xl
            text-slate-400
            transition-all

            hover:bg-red-50
            hover:text-red-500

            dark:hover:bg-red-500/10
            dark:hover:text-red-400
          "
        >
          <LogOut className="h-[16px] w-[16px]" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
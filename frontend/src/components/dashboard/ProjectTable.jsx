import {
  Calendar,
  Edit2,
  Trash2,
  MoreHorizontal,
  Loader2,
  Inbox,
  UserPlus,
  FolderKanban,
  ArrowUpRight,
} from "lucide-react";

import { authAPI } from "../../api/admin";

const STATUS_META = {
  open: {
    label: "TO DO",
    classes:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  active: {
    label: "TO DO",
    classes:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  in_progress: {
    label: "IN PROGRESS",
    classes:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300",
  },
  review: {
    label: "IN REVIEW",
    classes:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300",
  },
  on_hold: {
    label: "ON HOLD",
    classes:
      "bg-slate-100 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400",
  },
  closed: {
    label: "DONE",
    classes:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  completed: {
    label: "DONE",
    classes:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  cancelled: {
    label: "CANCELLED",
    classes:
      "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  },
};

const PRIORITY_META = {
  low: {
    label: "Low",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    dot: "bg-blue-500",
  },
  high: {
    label: "High",
    dot: "bg-amber-500",
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
  },
};

const AVATAR_PALETTE = [
  "bg-indigo-600",
  "bg-violet-600",
  "bg-teal-600",
  "bg-rose-600",
  "bg-amber-600",
];

const avatarColor = (seed) => {
  const str = String(seed || "");
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash =
      str.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[
    Math.abs(hash) % AVATAR_PALETTE.length
  ];
};

const getUserDisplayName = (user) => {
  if (!user) return null;

  return (
    user.full_name ||
    user.username ||
    user.name ||
    user.email ||
    null
  );
};

const resolveProjectAssigneeName = (project) => {
  if (!project) return null;

  const directName =
    getUserDisplayName(project.assignee) ||
    getUserDisplayName(project.assigned_to_user) ||
    project.assigned_to_name ||
    project.assignee_name ||
    null;

  if (directName) return directName;

  const assignedToId = project.assigned_to;

  if (assignedToId) {
    const memberMatch = (project.members || []).find(
      (member) => {
        const memberId =
          member?.user_id ??
          member?.user?.id ??
          member?.id;

        return (
          String(memberId) ===
          String(assignedToId)
        );
      }
    );

    const memberName =
      getUserDisplayName(memberMatch?.user) ||
      memberMatch?.full_name ||
      memberMatch?.username;

    if (memberName) return memberName;

    const taskMatch = (
      project.assignments ||
      project.tasks ||
      []
    ).find((task) => {
      const taskAssigneeId =
        task?.assigned_to ??
        task?.assignee?.id ??
        task?.assignee_id;

      return (
        String(taskAssigneeId) ===
        String(assignedToId)
      );
    });

    const taskName =
      getUserDisplayName(taskMatch?.assignee) ||
      taskMatch?.assigned_to_name ||
      taskMatch?.assignee_name;

    if (taskName) return taskName;
  }

  const fallbackTask = (
    project.assignments ||
    project.tasks ||
    []
  ).find(
    (task) =>
      task?.assignee ||
      task?.assigned_to ||
      task?.assigned_to_name ||
      task?.assignee_name
  );

  if (fallbackTask) {
    const fallbackName =
      getUserDisplayName(
        fallbackTask.assignee
      ) ||
      fallbackTask.assigned_to_name ||
      fallbackTask.assignee_name ||
      null;

    if (fallbackName) return fallbackName;

    if (fallbackTask.assigned_to) {
      return `Assigned (user id: ${fallbackTask.assigned_to})`;
    }
  }

  return null;
};

const ProjectTable = ({
  projects,
  onDelete,
  onEdit,
  onInvite,
  isLoading,
  user,
  onViewAll,
}) => {
  const currentUser =
    user ||
    authAPI.getStoredUser() ||
    {};

  const isManager =
    currentUser?.role === "manager";

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    try {
      return new Date(
        dateString
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getLabelsArray = (labels) => {
    if (!labels) return [];

    if (Array.isArray(labels)) {
      return labels.map((l) =>
        String(l).trim()
      );
    }

    return String(labels)
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
  };

  const headerCopy = {
    title: "Projects",
    subtitle: isManager
      ? "Manage and track workspace projects"
      : "Projects assigned to you",
  };

  const Shell = ({ children }) => (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border border-slate-200/80
        bg-white
        shadow-[0_4px_20px_rgba(15,23,42,0.035)]

        dark:border-slate-800
        dark:bg-[#0F1117]
        dark:shadow-none
      "
    >
      {/* Header */}
      <div
        className="
          flex flex-col gap-4
          border-b border-slate-100
          px-5 py-4

          dark:border-slate-800

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-xl
              bg-indigo-50
              text-indigo-600

              dark:bg-indigo-500/10
              dark:text-indigo-400
            "
          >
            <FolderKanban className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3
                className="
                  text-[14px]
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                {headerCopy.title}
              </h3>

              {projects.length > 0 && (
                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2 py-0.5
                    text-[10px]
                    font-bold
                    text-slate-500

                    dark:bg-slate-800
                    dark:text-slate-400
                  "
                >
                  {projects.length}
                </span>
              )}
            </div>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-400
                dark:text-slate-500
              "
            >
              {headerCopy.subtitle}
            </p>
          </div>
        </div>

        {projects.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="
              group
              inline-flex
              items-center gap-1.5
              self-start
              rounded-lg
              px-2.5 py-1.5
              text-[11px]
              font-semibold
              text-indigo-600
              transition-all

              hover:bg-indigo-50

              dark:text-indigo-400
              dark:hover:bg-indigo-500/10
            "
          >
            View all

            <ArrowUpRight
              className="
                h-3.5 w-3.5
                transition-transform
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </button>
        )}
      </div>

      {children}
    </section>
  );

  /* Loading */
  if (isLoading) {
    return (
      <Shell>
        <div
          className="
            flex
            min-h-[260px]
            flex-col
            items-center
            justify-center
          "
        >
          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-indigo-50
              dark:bg-indigo-500/10
            "
          >
            <Loader2
              className="
                h-5 w-5
                animate-spin
                text-indigo-500
              "
            />
          </div>

          <p
            className="
              mt-3
              text-[11px]
              font-medium
              text-slate-400
            "
          >
            Loading projects...
          </p>
        </div>
      </Shell>
    );
  }

  /* Empty */
  if (projects.length === 0) {
    return (
      <Shell>
        <div
          className="
            flex
            min-h-[260px]
            flex-col
            items-center
            justify-center
            px-6
            text-center
          "
        >
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-slate-100
              text-slate-400

              dark:bg-slate-800
              dark:text-slate-500
            "
          >
            <Inbox className="h-5 w-5" />
          </div>

          <p
            className="
              mt-4
              text-[13px]
              font-semibold
              text-slate-700
              dark:text-slate-200
            "
          >
            No projects yet
          </p>

          <p
            className="
              mt-1
              max-w-sm
              text-[11px]
              leading-5
              text-slate-400
              dark:text-slate-500
            "
          >
            {isManager
              ? "Create your first project to get started."
              : "No projects have been assigned to you yet."}
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          {/* Table Header */}
          <thead>
            <tr
              className="
                border-b
                border-slate-100
                bg-slate-50/60

                dark:border-slate-800
                dark:bg-slate-900/30
              "
            >
              {[
                "Project",
                "Status",
                "Priority",
                "Assignee",
                "Due date",
                "Reporter",
                "",
              ].map((heading, index) => (
                <th
                  key={`${heading}-${index}`}
                  className={`
                    px-5
                    py-3
                    text-left
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400

                    dark:text-slate-500

                    ${
                      index === 6
                        ? "text-right"
                        : ""
                    }
                  `}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          {/* Rows */}
          <tbody
            className="
              divide-y
              divide-slate-100
              dark:divide-slate-800
            "
          >
            {projects.map((project) => {
              const canManageProject =
                isManager ||
                ["owner", "manager"].includes(
                  project.my_role
                );

              const canDeleteProject =
                isManager ||
                project.my_role === "owner";

              const roleLabel =
                project.my_role === "owner"
                  ? "Owner"
                  : project.my_role === "manager"
                  ? "Manager"
                  : "Member";

              const labelsArray =
                getLabelsArray(
                  project.labels
                );

              const assigneeName =
                resolveProjectAssigneeName(
                  project
                );

              const status =
                STATUS_META[
                  project.status
                ] || {
                  label: (
                    project.status ||
                    "Unknown"
                  )
                    .replace("_", " ")
                    .toUpperCase(),
                  classes:
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                };

              const priority =
                PRIORITY_META[
                  project.priority
                ] ||
                PRIORITY_META.medium;

              return (
                <tr
                  key={project.id}
                  className="
                    group
                    transition-colors
                    hover:bg-indigo-50/30

                    dark:hover:bg-indigo-500/[0.025]
                  "
                >
                  {/* Project */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-9 w-9
                          shrink-0
                          items-center justify-center
                          rounded-xl
                          border
                          border-indigo-100
                          bg-indigo-50
                          text-[10px]
                          font-bold
                          text-indigo-600

                          dark:border-indigo-500/20
                          dark:bg-indigo-500/10
                          dark:text-indigo-400
                        "
                      >
                        {project.summary
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "P"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="
                              font-mono
                              text-[10px]
                              font-semibold
                              text-indigo-500
                              dark:text-indigo-400
                            "
                          >
                            AERO-{project.id}
                          </span>

                          {project.my_role && (
                            <span
                              className="
                                rounded-md
                                bg-slate-100
                                px-1.5 py-0.5
                                text-[8px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-500

                                dark:bg-slate-800
                                dark:text-slate-400
                              "
                            >
                              {roleLabel}
                            </span>
                          )}
                        </div>

                        <p
                          className="
                            mt-1
                            max-w-[270px]
                            truncate
                            text-[13px]
                            font-semibold
                            text-slate-800

                            dark:text-slate-100
                          "
                        >
                          {project.summary}
                        </p>

                        {labelsArray.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1">
                            {labelsArray
                              .slice(0, 2)
                              .map((label) => (
                                <span
                                  key={label}
                                  className="
                                    rounded-md
                                    bg-slate-100
                                    px-1.5 py-0.5
                                    text-[9px]
                                    font-medium
                                    text-slate-500

                                    dark:bg-slate-800
                                    dark:text-slate-400
                                  "
                                >
                                  {label}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        rounded-lg
                        px-2 py-1
                        text-[9px]
                        font-bold
                        tracking-wide
                        ${status.classes}
                      `}
                    >
                      {status.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-4">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-[12px]
                        font-medium
                        text-slate-600

                        dark:text-slate-300
                      "
                    >
                      <span
                        className={`
                          h-2
                          w-2
                          rounded-full
                          ${priority.dot}
                        `}
                      />

                      {priority.label}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-5 py-4">
                    {assigneeName ? (
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`
                            flex h-7 w-7
                            shrink-0
                            items-center justify-center
                            rounded-lg
                            text-[9px]
                            font-bold
                            text-white
                            ${avatarColor(
                              assigneeName
                            )}
                          `}
                        >
                          {assigneeName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <p
                          className="
                            max-w-[130px]
                            truncate
                            text-[12px]
                            font-medium
                            text-slate-700

                            dark:text-slate-200
                          "
                        >
                          {assigneeName}
                        </p>
                      </div>
                    ) : (
                      <span
                        className="
                          text-[11px]
                          text-slate-400
                        "
                      >
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Due */}
                  <td className="px-5 py-4">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-[11px]
                        font-medium
                        text-slate-500

                        dark:text-slate-400
                      "
                    >
                      <Calendar
                        className="
                          h-3.5 w-3.5
                          text-slate-400
                        "
                      />

                      {formatDate(
                        project.due_date
                      )}
                    </span>
                  </td>

                  {/* Reporter */}
                  <td className="px-5 py-4">
                    <span
                      className="
                        text-[11px]
                        font-medium
                        text-slate-500

                        dark:text-slate-400
                      "
                    >
                      {project.reporter ||
                        project.creator
                          ?.full_name ||
                        "Manager"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div
                      className="
                        flex
                        justify-end
                        gap-1
                        opacity-60
                        transition-opacity

                        group-hover:opacity-100
                      "
                    >
                      {canManageProject && (
                        <button
                          type="button"
                          onClick={() =>
                            onInvite &&
                            onInvite(project)
                          }
                          aria-label="Invite member"
                          title="Invite member"
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-slate-400
                            transition-all

                            hover:bg-indigo-50
                            hover:text-indigo-600

                            dark:hover:bg-indigo-500/10
                            dark:hover:text-indigo-400
                          "
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onEdit(project)
                        }
                        aria-label={
                          canManageProject
                            ? `Edit project as ${roleLabel}`
                            : "Open assigned work"
                        }
                        title={
                          canManageProject
                            ? "Edit project"
                            : "Open assigned work"
                        }
                        className="
                          flex h-8 w-8
                          items-center justify-center
                          rounded-lg
                          text-slate-400
                          transition-all

                          hover:bg-slate-100
                          hover:text-slate-700

                          dark:hover:bg-slate-800
                          dark:hover:text-slate-200
                        "
                      >
                        {canManageProject ? (
                          <Edit2 className="h-3.5 w-3.5" />
                        ) : (
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {canDeleteProject && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(project.id)
                          }
                          aria-label="Delete project"
                          title="Delete project"
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            text-slate-400
                            transition-all

                            hover:bg-red-50
                            hover:text-red-500

                            dark:hover:bg-red-500/10
                            dark:hover:text-red-400
                          "
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
};

export default ProjectTable;
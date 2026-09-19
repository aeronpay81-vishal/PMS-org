import { Calendar, Edit2, Trash2, MoreHorizontal, Loader2, Inbox, UserPlus } from "lucide-react";
import { authAPI } from "../../api/admin";

const STATUS_META = {
  open: { label: "TO DO", classes: "bg-[#F1F2F4] text-[#44546F] dark:bg-slate-800 dark:text-slate-300" },
  active: { label: "TO DO", classes: "bg-[#F1F2F4] text-[#44546F] dark:bg-slate-800 dark:text-slate-300" },
  in_progress: { label: "IN PROGRESS", classes: "bg-[#E9F2FF] text-[#0C66E4] dark:bg-blue-950/30 dark:text-blue-300" },
  review: { label: "IN REVIEW", classes: "bg-[#F3F0FF] text-[#6E5DC6] dark:bg-violet-950/30 dark:text-violet-300" },
  on_hold: { label: "ON HOLD", classes: "bg-[#F1F2F4] text-[#626F86] dark:bg-slate-800/60 dark:text-slate-400" },
  closed: { label: "DONE", classes: "bg-[#DCFFF1] text-[#1F845A] dark:bg-emerald-950/30 dark:text-emerald-300" },
  completed: { label: "DONE", classes: "bg-[#DCFFF1] text-[#1F845A] dark:bg-emerald-950/30 dark:text-emerald-300" },
  cancelled: { label: "CANCELLED", classes: "bg-[#FFEEF0] text-[#C9372C] dark:bg-red-950/30 dark:text-red-400" },
};

const PRIORITY_META = {
  low: { label: "Low", dot: "bg-slate-400" },
  medium: { label: "Medium", dot: "bg-blue-500" },
  high: { label: "High", dot: "bg-amber-500" },
  critical: { label: "Critical", dot: "bg-red-500" },
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
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const getUserDisplayName = (user) => {
  if (!user) return null;
  return user.full_name || user.username || user.name || user.email || null;
};

const resolveProjectAssigneeName = (project) => {
  if (!project) return null;

  const directName = getUserDisplayName(project.assignee)
    || getUserDisplayName(project.assigned_to_user)
    || project.assigned_to_name
    || project.assignee_name
    || null;

  if (directName) return directName;

  const assignedToId = project.assigned_to;
  if (assignedToId) {
    const memberMatch = (project.members || []).find((member) => {
      const memberId = member?.user_id ?? member?.user?.id ?? member?.id;
      return String(memberId) === String(assignedToId);
    });

    const memberName = getUserDisplayName(memberMatch?.user) || memberMatch?.full_name || memberMatch?.username;
    if (memberName) return memberName;

    const taskMatch = (project.assignments || project.tasks || []).find((task) => {
      const taskAssigneeId = task?.assigned_to ?? task?.assignee?.id ?? task?.assignee_id;
      return String(taskAssigneeId) === String(assignedToId);
    });

    const taskName = getUserDisplayName(taskMatch?.assignee) || taskMatch?.assigned_to_name || taskMatch?.assignee_name;
    if (taskName) return taskName;
  }

  const fallbackTask = (project.assignments || project.tasks || []).find(
    (task) => task?.assignee || task?.assigned_to || task?.assigned_to_name || task?.assignee_name
  );

  if (fallbackTask) {
    const fallbackName = getUserDisplayName(fallbackTask.assignee)
      || fallbackTask.assigned_to_name
      || fallbackTask.assignee_name
      || null;

    if (fallbackName) return fallbackName;

    if (fallbackTask.assigned_to) {
      return `Assigned (user id: ${fallbackTask.assigned_to})`;
    }
  }

  return null;
};

const ProjectTable = ({ projects, onDelete, onEdit, onInvite, isLoading, user, onViewAll }) => {
  const currentUser = user || authAPI.getStoredUser() || {};
  const isManager = currentUser?.role === "manager";

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Normalizes labels to an array of strings regardless of whether
  // the API/DB gives us a comma-separated string, an array, or null.
  const getLabelsArray = (labels) => {
    if (!labels) return [];
    if (Array.isArray(labels)) return labels.map((l) => String(l).trim());
    return String(labels)
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
  };

  const headerCopy = {
    title: "Projects",
    subtitle: isManager
      ? "Work items in this workspace"
      : "Projects assigned to you",
  };

  const Shell = ({ children }) => (
    <section className="overflow-hidden rounded border border-[#DCDFE4] bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-[#DCDFE4] px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">{headerCopy.title}</h3>
          <p className="mt-0.5 text-[12px] text-[#626F86] dark:text-slate-400">
            {headerCopy.subtitle}
            {projects.length > 0 && ` · ${projects.length}`}
          </p>
        </div>
        {projects.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 self-start rounded px-2 py-1 text-[13px] font-medium text-[#0C66E4] hover:bg-[#E9F2FF] dark:hover:bg-blue-950/30"
          >
            View all
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );

  // Loading State
  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center px-6 py-14">
          <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          {/* <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading projects...</p> */}
        </div>
      </Shell>
    );
  }

  // Empty State
  if (projects.length === 0) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center px-6 py-14">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
            <Inbox className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No projects yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {isManager ? "Create your first project to get started." : "No projects have been assigned to you yet."}
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-[#DCDFE4] bg-[#F7F8F9] dark:border-slate-800 dark:bg-slate-800/30">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Key
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Summary
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Status
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Priority
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Assignee
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Due
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Reporter
              </th>
              <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-[#626F86]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F2F4] dark:divide-slate-800">
            {projects.map((project) => {
              const canManageProject = isManager || ["owner", "manager"].includes(project.my_role);
              const canDeleteProject = isManager || project.my_role === "owner";
              const roleLabel = project.my_role === "owner" ? "Owner" : project.my_role === "manager" ? "Manager" : "Member";
              const labelsArray = getLabelsArray(project.labels);
              const assigneeName = resolveProjectAssigneeName(project);
              const status = STATUS_META[project.status] || {
                label: (project.status || "Unknown").replace("_", " ").toUpperCase(),
                classes: "bg-[#F1F2F4] text-[#44546F] dark:bg-slate-800/60 dark:text-slate-400",
              };
              const priority = PRIORITY_META[project.priority] || PRIORITY_META.medium;

              return (
                <tr key={project.id} className="group hover:bg-[#F7F8F9] dark:hover:bg-slate-800/20">
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[12px] font-medium text-[#0C66E4]">AERO-{project.id}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="max-w-[260px] truncate text-[13px] font-medium text-[#172B4D] dark:text-slate-100">
                        {project.summary}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {project.my_role && (
                          <span className="text-[10px] font-semibold uppercase text-[#626F86]">
                            {roleLabel}
                          </span>
                        )}
                        {labelsArray.length > 0 && (
                          <span className="rounded bg-[#F1F2F4] px-1.5 py-0.5 text-[10px] font-medium text-[#44546F] dark:bg-slate-800 dark:text-slate-400">
                            {labelsArray[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${status.classes}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#44546F] dark:text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {assigneeName ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(
                            assigneeName
                          )}`}
                        >
                          {assigneeName.charAt(0).toUpperCase()}
                        </div>
                        <p className="max-w-[120px] truncate text-[13px] text-[#172B4D] dark:text-slate-200">
                          {assigneeName}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[13px] text-[#8993A4]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#44546F] dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-[#8993A4]" />
                      {formatDate(project.due_date)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[13px] text-[#44546F] dark:text-slate-400">
                      {project.reporter || project.creator?.full_name || "Manager"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-0.5">
                      {canManageProject && (
                        <button
                          type="button"
                          onClick={() => onInvite && onInvite(project)}
                          aria-label="Invite member"
                          title="Invite member"
                          className="rounded p-1.5 text-[#626F86] hover:bg-[#F1F2F4] hover:text-[#0C66E4] dark:hover:bg-slate-800"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canManageProject ? (
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          aria-label={`Edit project as ${roleLabel}`}
                          title={`Edit project as ${roleLabel}`}
                          className="rounded p-1.5 text-[#626F86] hover:bg-[#F1F2F4] hover:text-[#0C66E4] dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          aria-label="Open assigned work"
                          title="Open assigned work"
                          className="rounded p-1.5 text-[#626F86] hover:bg-[#F1F2F4] hover:text-[#0C66E4] dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDeleteProject && (
                        <button
                          type="button"
                          onClick={() => onDelete(project.id)}
                          aria-label="Delete project"
                          title="Delete project"
                          className="rounded p-1.5 text-[#626F86] hover:bg-[#FFEEF0] hover:text-[#C9372C] dark:hover:bg-red-950/30"
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
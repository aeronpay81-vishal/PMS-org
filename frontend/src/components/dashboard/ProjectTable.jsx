import { Calendar, Edit2, Trash2, MoreHorizontal, Loader2, Inbox, UserPlus } from "lucide-react";
import { authAPI } from "../../api/admin";

const STATUS_META = {
  open: { label: "Open", classes: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40" },
  active: { label: "Active", classes: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40" },
  in_progress: { label: "In progress", classes: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40" },
  review: { label: "In review", classes: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40" },
  on_hold: { label: "On hold", classes: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700" },
  closed: { label: "Closed", classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" },
  completed: { label: "Completed", classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40" },
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

const ProjectTable = ({ projects, onDelete, onEdit, onInvite, isLoading, user }) => {
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
    title: isManager ? "Active projects" : "My assigned projects",
    subtitle: isManager
      ? "Manage your current projects and track progress."
      : "Projects assigned to you by your project manager.",
  };

  const Shell = ({ children }) => (
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{headerCopy.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {headerCopy.subtitle}
            {projects.length > 0 && ` (${projects.length} ${projects.length === 1 ? "project" : "projects"})`}
          </p>
        </div>
        {projects.length > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 self-start rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
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
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Project
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Status
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Priority
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Assignee
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Due date
              </th>
              <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Reporter
              </th>
              <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.map((project) => {
              const canManageProject = isManager || ["owner", "manager"].includes(project.my_role);
              const canDeleteProject = isManager || project.my_role === "owner";
              const roleLabel = project.my_role === "owner" ? "Owner" : project.my_role === "manager" ? "Manager" : "Member";
              const labelsArray = getLabelsArray(project.labels);
              const assigneeName = project.assignee ? project.assignee.full_name || project.assignee.username : null;
              const status = STATUS_META[project.status] || {
                label: project.status || "Unknown",
                classes: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700",
              };
              const priority = PRIORITY_META[project.priority] || PRIORITY_META.medium;

              return (
                <tr key={project.id} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/20">
                  {/* Project */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {(project.summary || "P")
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[220px]">
                          {project.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">#{project.id}</span>
                          {project.my_role && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${project.my_role === "owner"
                              ? "bg-amber-50 text-amber-700"
                              : project.my_role === "manager"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-emerald-50 text-emerald-700"
                              }`}>
                              {roleLabel}
                            </span>
                          )}
                          {labelsArray.length > 0 && (
                            <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              {labelsArray[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.classes}`}>
                      {status.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                      {priority.label}
                    </span>
                  </td>

                  {/* Assignee */}
                  <td className="px-5 py-3.5">
                    {project.assignee ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(
                            project.assignee.username
                          )}`}
                        >
                          {assigneeName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                            {assigneeName}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(project.due_date)}
                    </span>
                  </td>

                  {/* Reporter */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {project.reporter || project.creator?.full_name || "Manager"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      {canManageProject && (
                        <button
                          type="button"
                          onClick={() => onInvite && onInvite(project)}
                          aria-label="Invite member"
                          title="Invite member"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
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
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEdit(project)}
                          aria-label="Open assigned work"
                          title="Open assigned work"
                          className="rounded-md p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition-colors"
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
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
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
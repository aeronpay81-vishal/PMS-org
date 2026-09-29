import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Loader,
  X,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  Inbox,
  Check,
  XCircle,
} from "lucide-react";

import { authAPI, projectsAPI as adminProjectsAPI } from "../../api/admin";
import { projectsAPI } from "../../api/project";

import ProjectTable from "../../components/dashboard/ProjectTable";
import ProjectFormModal from "../../components/dashboard/ProjectFormModal";
import InviteModal from "../../components/dashboard/InviteModal";

const Projects = ({ user }) => {
  const currentUser = user || authAPI.getStoredUser() || {};

  const isManager = currentUser?.role === "manager";
  const workspaceRole = isManager ? "global_manager" : "member";

  const [projects, setProjects] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitingProject, setInvitingProject] = useState(null);

  // --------------------------------------------------
  // Fetch
  // --------------------------------------------------

  useEffect(() => {
    fetchProjects();
    fetchPendingInvitations();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectsAPI.getAll();
      const data = response.data || response || [];

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const res = await adminProjectsAPI.getPendingInvitations();
      const data = res?.data || res || [];

      setPendingInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  };

  // --------------------------------------------------
  // Notifications
  // --------------------------------------------------

  const showSuccess = (message, duration = 3000) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage(null);
    }, duration);
  };

  // --------------------------------------------------
  // Invitations
  // --------------------------------------------------

  const handleAcceptInvitation = async (token) => {
    try {
      await adminProjectsAPI.acceptInvitation(token);

      showSuccess(
        "Invitation accepted! Project has been added to your list.",
        4000
      );

      fetchProjects();
      fetchPendingInvitations();
    } catch (err) {
      setError(err?.message || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (id) => {
    try {
      await adminProjectsAPI.declineInvitation(id);

      showSuccess("Invitation declined.");

      fetchPendingInvitations();
    } catch (err) {
      setError(err?.message || "Failed to decline invitation");
    }
  };

  // --------------------------------------------------
  // Project Actions
  // --------------------------------------------------

  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectsAPI.delete(id);

      setProjects((prev) => prev.filter((p) => p.id !== id));

      showSuccess("Project deleted successfully");
    } catch (err) {
      setError(err?.message || "Failed to delete project");
    }
  };

  const handleCreateProject = () => {
    setIsEditMode(false);
    setEditingProjectId(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleInviteProject = (project) => {
    setInvitingProject(project);
    setIsInviteModalOpen(true);
  };

  const handleInviteSuccess = (message) => {
    showSuccess(message);
  };

  // --------------------------------------------------
  // Form Submit
  // --------------------------------------------------

  const handleFormSubmit = async (formData, useFormData = false) => {
    try {
      let response;

      if (isEditMode) {
        response = await projectsAPI.update(
          editingProjectId,
          formData,
          useFormData
        );

        const updated = response.data || response;

        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProjectId ? updated : p
          )
        );

        showSuccess("Project updated successfully");
      } else {
        let invitesString = "";
        let inviteRoles = {};

        if (useFormData) {
          invitesString = formData.get("invites");

          inviteRoles = JSON.parse(
            formData.get("invite_roles") || "{}"
          );

          formData.delete("invites");
          formData.delete("invite_roles");
        } else {
          invitesString = formData.invites;
          inviteRoles = formData.invite_roles || {};

          delete formData.invites;
          delete formData.invite_roles;
        }

        response = await projectsAPI.create(
          formData,
          useFormData
        );

        const created =
          response?.data?.data ||
          response?.data ||
          response;

        setProjects((prev) => [created, ...prev]);

        showSuccess("Project created and assigned successfully");

        if (invitesString) {
          const emails = Array.from(
            new Set(
              invitesString
                .split(",")
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean)
            )
          );

          const failed = [];

          for (const email of emails) {
            try {
              await adminProjectsAPI.inviteToProject(
                created.id,
                email,
                inviteRoles[email.toLowerCase()] || "member"
              );
            } catch (e) {
              console.error(
                "Failed to invite",
                email,
                e?.message || e
              );

              failed.push(email);
            }
          }

          if (failed.length === 0) {
            showSuccess(
              `Project created! Invitation${
                emails.length > 1 ? "s" : ""
              } sent to ${emails.join(", ")}`
            );
          } else {
            showSuccess(
              `Project created! But invite failed for: ${failed.join(
                ", "
              )}`
            );
          }
        }
      }

      setIsFormOpen(false);
      setIsEditMode(false);
      setEditingProjectId(null);

      fetchProjects();
    } catch (err) {
      throw new Error(
        err?.message || "Failed to save project"
      );
    }
  };

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase().trim();

    const projectSummary =
      project?.summary ||
      project?.name ||
      project?.title ||
      "";

    const projectDescription =
      project?.description || "";

    const assigneeName =
      project?.assignee?.full_name ||
      project?.assignee?.username ||
      "";

    const matchesSearch =
      !query ||
      projectSummary.toLowerCase().includes(query) ||
      projectDescription.toLowerCase().includes(query) ||
      assigneeName.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      project.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      project.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-full space-y-6 pb-8">

      {/* ============================================= */}
      {/* HERO HEADER */}
      {/* ============================================= */}

      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F1117]">

        {/* Soft background glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0">

            {/* Label */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" />
              {isManager
                ? "Organization workspace"
                : "Your workspace"}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">
              {isManager
                ? "All Projects"
                : "My Projects"}
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-500 dark:text-slate-400">
              {isManager
                ? "Create, manage and monitor projects across your organization."
                : "Track your assigned projects, responsibilities and delivery progress."}
            </p>

            {/* Quick stats */}
            <div className="mt-5 flex flex-wrap items-center gap-2">

              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {projects.length}
                </span>
                <span className="text-[11px] text-slate-400">
                  projects
                </span>
              </div>

              {pendingInvitations.length > 0 && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <Inbox className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {pendingInvitations.length}
                  </span>
                  <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
                    pending
                  </span>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                  Clear filters
                </button>
              )}

            </div>
          </div>

          {/* Create button */}
          {isManager && (
            <button
              type="button"
              onClick={handleCreateProject}
              className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15">
                <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" />
              </span>
              Create project
            </button>
          )}

        </div>
      </section>


      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && (
        <div className="relative flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              Something went wrong
            </p>

            <p className="mt-0.5 text-xs leading-5 text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}


      {/* ============================================= */}
      {/* SUCCESS */}
      {/* ============================================= */}

      {successMessage && (
        <div className="relative flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Success
            </p>

            <p className="mt-0.5 text-xs leading-5 text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded-lg p-1 text-emerald-400 transition hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}


      {/* ============================================= */}
      {/* PENDING INVITATIONS */}
      {/* ============================================= */}

      {pendingInvitations.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.035)] dark:border-slate-800 dark:bg-[#0F1117]">

          {/* Section header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Inbox className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Pending invitations
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Projects waiting for your response
                </p>
              </div>

            </div>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              {pendingInvitations.length}
            </span>

          </div>


          {/* Invitations */}
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">

            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-500/30 dark:hover:bg-slate-900"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <FolderKanban className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {inv.project_summary}
                      </h3>

                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        Invited by{" "}
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {inv.inviter_name}
                        </span>
                      </p>
                    </div>

                  </div>

                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                    Pending
                  </span>

                </div>


                <div className="mt-4 flex items-center justify-between">

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <User className="h-3 w-3" />
                    <span className="capitalize">
                      {inv.role}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleDeclineInvitation(inv.id)
                      }
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAcceptInvitation(inv.token)
                      }
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-[11px] font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        </section>
      )}


      {/* ============================================= */}
      {/* SEARCH + FILTER TOOLBAR */}
      {/* ============================================= */}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_4px_20px_rgba(15,23,42,0.035)] dark:border-slate-800 dark:bg-[#0F1117]">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* Search */}
          <div className="relative min-w-0 flex-1">

            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search projects, descriptions or assignees..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-indigo-500/40 dark:focus:bg-slate-900"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

          </div>


          {/* Divider */}
          <div className="hidden h-7 w-px bg-slate-200 dark:bg-slate-800 lg:block" />


          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">

            <div className="mr-1 hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 sm:flex">
              <SlidersHorizontal className="h-3 w-3" />
              Filters
            </div>


            {/* Status */}
            <div className="relative">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-[11px] font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">
                  All statuses
                </option>
                <option value="open">
                  Open
                </option>
                <option value="in_progress">
                  In progress
                </option>
                <option value="review">
                  Review
                </option>
                <option value="active">
                  Active
                </option>
                <option value="closed">
                  Closed
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>

              <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />

            </div>


            {/* Priority */}
            <div className="relative">

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                className="h-9 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-[11px] font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">
                  All priorities
                </option>
                <option value="low">
                  Low
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">
                  High
                </option>
                <option value="critical">
                  Critical
                </option>
              </select>

              <Filter className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />

            </div>

          </div>

        </div>


        {/* Result count */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-1 pt-3 dark:border-slate-800">

          <p className="text-[10px] font-medium text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {filteredProjects.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {projects.length}
            </span>{" "}
            projects
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Reset filters
            </button>
          )}

        </div>

      </section>


      {/* ============================================= */}
      {/* PROJECT TABLE */}
      {/* ============================================= */}

      <ProjectTable
        projects={filteredProjects}
        onDelete={deleteProject}
        onEdit={handleEditProject}
        onInvite={handleInviteProject}
        isLoading={loading}
        user={user}
      />


      {/* ============================================= */}
      {/* PROJECT FORM MODAL */}
      {/* ============================================= */}

      <ProjectFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        editingProject={foundProject}
        isManager={isManager}
        projectRole={
          isEditMode
            ? foundProject?.my_role
            : workspaceRole
        }
        onClose={() => {
          setIsFormOpen(false);
          setIsEditMode(false);
          setEditingProjectId(null);
        }}
        onSubmit={handleFormSubmit}
      />


      {/* ============================================= */}
      {/* INVITE MODAL */}
      {/* ============================================= */}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInvitingProject(null);
        }}
        project={invitingProject}
        onSuccess={handleInviteSuccess}
      />

    </div>
  );
};

export default Projects;
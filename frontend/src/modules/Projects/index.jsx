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

  const handleAcceptInvitation = async (token) => {
    try {
      await adminProjectsAPI.acceptInvitation(token);
      setSuccessMessage("Invitation accepted! Project has been added to your list.");
      setTimeout(() => setSuccessMessage(null), 4000);
      // Refresh both projects and invitations
      fetchProjects();
      fetchPendingInvitations();
    } catch (err) {
      setError(err?.message || err?.message || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (id) => {
    try {
      await adminProjectsAPI.declineInvitation(id);
      setSuccessMessage("Invitation declined.");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchPendingInvitations();
    } catch (err) {
      setError(err?.message || "Failed to decline invitation");
    }
  };

  const deleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setSuccessMessage("Project deleted successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err?.message || "Failed to delete project");
      }
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
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleFormSubmit = async (formData, useFormData = false) => {
    try {
      let response;
      if (isEditMode) {
        response = await projectsAPI.update(editingProjectId, formData, useFormData);
        const updated = response.data || response;
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? updated : p))
        );
        setSuccessMessage("Project updated successfully");
      } else {
        let invitesString = "";
        let inviteRoles = {};
        if (useFormData) {
          invitesString = formData.get("invites");
          inviteRoles = JSON.parse(formData.get("invite_roles") || "{}");
          formData.delete("invites");
          formData.delete("invite_roles");
        } else {
          invitesString = formData.invites;
          inviteRoles = formData.invite_roles || {};
          delete formData.invites;
          delete formData.invite_roles;
        }

        response = await projectsAPI.create(formData, useFormData);
        // Backend returns { success, data: project } → axios wraps in response.data
        // so response.data = { success, data: project }, and actual project = response.data.data
        const created = response?.data?.data || response?.data || response;
        setProjects((prev) => [created, ...prev]);
        setSuccessMessage("Project created and assigned successfully");

        if (invitesString) {
          const emails = Array.from(new Set(
            invitesString
              .split(',')
              .map(e => e.trim().toLowerCase())
              .filter(Boolean)
          ));
          const failed = [];
          for (const email of emails) {
            try {
              console.log('Inviting:', email, 'to project ID:', created.id);
              await adminProjectsAPI.inviteToProject(
                created.id,
                email,
                inviteRoles[email.toLowerCase()] || 'member'
              );
            } catch (e) {
              console.error('Failed to invite', email, e?.message || e);
              failed.push(email);
            }
          }
          if (failed.length === 0) {
            setSuccessMessage(`Project created! Invitation${emails.length > 1 ? 's' : ''} sent to ${emails.join(', ')}`);
          } else {
            setSuccessMessage(`Project created! But invite failed for: ${failed.join(', ')} — check console`);
          }
        }
      }

      setIsFormOpen(false);
      setIsEditMode(false);
      setEditingProjectId(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchProjects();
    } catch (err) {
      throw new Error(err?.message || "Failed to save project");
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.assignee && (project.assignee.full_name || project.assignee.username).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <FolderKanban className="h-3.5 w-3.5" />
              {isManager ? "Organization Control Center" : "Member Delivery Board"}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isManager ? "All Projects" : "My Assigned Projects"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isManager
                ? "Create projects, oversee owners and managers, and control delivery."
                : "Track your assigned projects and update only the work you own."}
            </p>
          </div>

          <button
            onClick={handleCreateProject}
            hidden={!isManager}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        </div>
      </section>

      {/* Alerts */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {pendingInvitations.length}
            </span>
            Pending Invitations
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{inv.project_summary}</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Invited by <span className="font-medium text-slate-700">{inv.inviter_name}</span> · Role: <span className="font-medium text-indigo-700 capitalize">{inv.role}</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptInvitation(inv.token)}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(inv.id)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">Success</h3>
            <p className="text-sm text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, description, assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">📋 Open</option>
            <option value="in_progress">⚙️ In Progress</option>
            <option value="review">🔍 Review</option>
            <option value="active">✨ Active</option>
            <option value="closed">✅ Closed</option>
            <option value="completed">🎉 Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Projects Table Component */}
      <ProjectTable
        projects={filteredProjects}
        onDelete={deleteProject}
        onEdit={handleEditProject}
        onInvite={handleInviteProject}
        isLoading={loading}
        user={user}
      />

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        editingProject={foundProject}
        isManager={isManager}
        projectRole={isEditMode ? foundProject?.my_role : workspaceRole}
        onClose={() => {
          setIsFormOpen(false);
          setIsEditMode(false);
          setEditingProjectId(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Invite Modal */}
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
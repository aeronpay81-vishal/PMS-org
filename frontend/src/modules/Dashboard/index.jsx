import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Users,
  Activity,
  AlertCircle,
  CheckSquare,
  Calendar,
  CalendarDays,
  Plus,
  BarChart3,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import ProjectTable from "../../components/dashboard/ProjectTable";
import ProjectFormModal from "../../components/dashboard/ProjectFormModal";
import { projectsAPI } from "../../api/project";
import { tasksAPI } from "../../api/task";
import { authAPI, projectsAPI as adminProjectsAPI } from "../../api/admin";
import { useTheme } from "../../context/ThemeContext";

const PROJECT_STATUS_META = {
  open: { label: "Open", done: false, upcoming: false },
  active: { label: "Active", done: false, upcoming: false },
  in_progress: { label: "In progress", done: false, upcoming: false },
  review: { label: "In review", done: false, upcoming: false },
  on_hold: { label: "On hold", done: false, upcoming: false },
  closed: { label: "Closed", done: true, upcoming: false },
  completed: { label: "Completed", done: true, upcoming: false },
  cancelled: { label: "Cancelled", done: false, upcoming: false },
};

const TASK_STATUS_META = {
  todo: { label: "TO DO", badge: "bg-[#F1F2F4] text-[#44546F] dark:bg-slate-800 dark:text-slate-300" },
  in_progress: { label: "IN PROGRESS", badge: "bg-[#FFF7D6] text-[#946F00] dark:bg-amber-950/30 dark:text-amber-300" },
  done: { label: "DONE", badge: "bg-[#DCFFF1] text-[#1F845A] dark:bg-emerald-950/30 dark:text-emerald-300" },
};

const TASK_PRIORITY_META = {
  high: "bg-[#FFEEF0] text-[#C9372C] dark:bg-red-950/30 dark:text-red-400",
  medium: "bg-[#FFF7D6] text-[#946F00] dark:bg-amber-950/30 dark:text-amber-400",
  low: "bg-[#E9F2FF] text-[#0C66E4] dark:bg-blue-950/30 dark:text-blue-400",
};

const Dashboard = ({ user, onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const currentUser = user || authAPI.getStoredUser() || {};
  const isManager = currentUser?.role === "manager";
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, tasksRes, invitesRes] = await Promise.allSettled([
        projectsAPI.getAll(),
        tasksAPI.getAll(),
        adminProjectsAPI.getPendingInvitations(),
      ]);

      if (projRes.status === "fulfilled") {
        const pData = projRes.value?.data || projRes.value || [];
        setProjects(Array.isArray(pData) ? pData : []);
      }

      if (tasksRes.status === "fulfilled") {
        const tData = tasksRes.value?.data || tasksRes.value || [];
        setTasks(Array.isArray(tData) ? tData : []);
      }

      if (invitesRes.status === "fulfilled") {
        const iData = invitesRes.value?.data || invitesRes.value || [];
        setPendingInvitations(Array.isArray(iData) ? iData : []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (token) => {
    try {
      await adminProjectsAPI.acceptInvitation(token);
      setSuccessMessage("Invitation accepted!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err?.message || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (id) => {
    try {
      await adminProjectsAPI.declineInvitation(id);
      setSuccessMessage("Invitation declined");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err?.message || "Failed to decline invitation");
    }
  };

  const deleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        setProjects((currentProjects) =>
          currentProjects.filter((project) => project.id !== id)
        );
        setSuccessMessage("Project deleted");
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

  const handleFormSubmit = async (formData, useFormData = false) => {
    try {
      let response;

      if (isEditMode) {
        response = await projectsAPI.update(editingProjectId, formData, useFormData);
        const updatedProject = response?.data?.data || response?.data || response;
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProjectId ? updatedProject : p))
        );
        setSuccessMessage("Project updated");
      } else {
        // Extract invites before sending to backend
        let invitesString = "";
        let inviteRoles = {};
        if (useFormData) {
          invitesString = formData.get("invites") || "";
          inviteRoles = JSON.parse(formData.get("invite_roles") || "{}");
          formData.delete("invites");
          formData.delete("invite_roles");
        } else {
          invitesString = formData.invites || "";
          inviteRoles = formData.invite_roles || {};
          delete formData.invites;
          delete formData.invite_roles;
        }

        response = await projectsAPI.create(formData, useFormData);
        // Backend returns { success, data: project } wrapped in axios response.data
        const newProject = response?.data?.data || response?.data || response;
        setProjects((prev) => [...prev, newProject]);
        setSuccessMessage("Project created");

        // Send invitations
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
              console.log('Dashboard: Inviting', email, 'to project', newProject.id);
              await adminProjectsAPI.inviteToProject(
                newProject.id,
                email,
                inviteRoles[email] || 'member'
              );
            } catch (e) {
              console.error('Invite failed:', email, e?.message || e);
              failed.push(email);
            }
          }
          if (failed.length === 0) {
            setSuccessMessage(`Project created! Invitation sent to ${emails.join(', ')}`);
          } else {
            setSuccessMessage(`Project created! But invite failed for: ${failed.join(', ')}`);
          }
        }
      }

      setIsFormOpen(false);
      setIsEditMode(false);
      setEditingProjectId(null);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh tasks
      try {
        const tasksRes = await tasksAPI.getAll();
        const tData = tasksRes?.data || tasksRes || [];
        setTasks(Array.isArray(tData) ? tData : []);
      } catch { }
    } catch (err) {
      throw new Error(err?.message || "Failed to save project");
    }
  };

  const handleQuickTaskStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      setSuccessMessage(`Task marked ${newStatus.replace("_", " ")}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err?.message || "Failed to update task status");
    }
  };

  // Calculate project stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (project) => project.status === "closed" || project.status === "completed"
  ).length;
  const inProgressProjects = projects.filter(
    (project) => project.status === "in_progress" || project.status === "active"
  ).length;
  const activeTeamMembers = new Set(
    projects.flatMap((p) => [
      ...(p.reporter ? [p.reporter] : []),
      ...(p.assignee?.username ? [p.assignee.username] : []),
    ])
  ).size;

  // Calculate task stats
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const notStartedProjects = Math.max(0, totalProjects - completedProjects - inProgressProjects);
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const ringPercent = isManager ? completionRate : taskCompletionRate;

  const projectProgressData = [
    { name: "Completed", value: completedProjects, color: "#1F845A" },
    { name: "In progress", value: inProgressProjects, color: "#0C66E4" },
    { name: "Not started", value: notStartedProjects, color: isDark ? "#334155" : "#DCDFE4" },
  ];

  const ringSlices = projectProgressData.filter((item) => item.value > 0);
  const donutData = ringSlices.length
    ? ringSlices
    : [{ name: "Empty", value: 1, color: isDark ? "#1e293b" : "#e2e8f0" }];

  const formatShortDate = (value) => {
    if (!value) return "No date";
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const timeAgo = (value) => {
    if (!value) return "";
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const timelineItems = [...projects]
    .sort((a, b) => {
      const aDate = new Date(a.due_date || a.created_at || 0).getTime();
      const bDate = new Date(b.due_date || b.created_at || 0).getTime();
      return aDate - bDate;
    })
    .map((project) => ({
      id: project.id,
      title: project.summary,
      date: project.due_date || project.created_at,
      status: project.status,
    }));

  const activityItems = [...projects]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
    .slice(0, 4)
    .map((project) => ({
      id: project.id,
      title: project.summary,
      status: project.status,
      at: project.updated_at || project.created_at,
      who: project.reporter || project.creator?.full_name || project.creator?.username || currentUser?.username || "",
    }));

  const cardClass =
    "rounded border border-[#DCDFE4] bg-white dark:border-slate-800 dark:bg-slate-900";

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  const tooltipStyles = {
    contentStyle: {
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      borderColor: isDark ? "#334155" : "#DCDFE4",
      color: isDark ? "#f1f5f9" : "#172B4D",
      borderRadius: "3px",
      fontSize: "12px",
      boxShadow: "0 1px 4px rgba(9, 30, 66, 0.13)",
    },
    itemStyle: {
      color: isDark ? "#f1f5f9" : "#172B4D",
    },
  };

  return (
    <>
      <DashboardHeader user={currentUser} onCreateProject={handleCreateProject} />

      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex gap-3 rounded border border-[#FFD2D2] bg-[#FFEEF0] px-3 py-2.5 dark:border-red-900 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C9372C]" />
          <p className="text-[13px] text-[#C9372C] dark:text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex gap-3 rounded border border-[#BAF3DB] bg-[#DCFFF1] px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1F845A]" />
          <p className="text-[13px] text-[#1F845A] dark:text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards - 4 Column Grid */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isManager ? (
          <>
            <StatCard
              title="Total Projects"
              value={totalProjects}
              icon={LayoutDashboard}
              color="indigo"
              hint="Active workspace portfolio"
              progress={totalProjects > 0 ? 100 : 0}
            />
            <StatCard
              title="Completed"
              value={completedProjects}
              icon={CheckCircle2}
              color="emerald"
              hint={totalProjects > 0 ? `${completionRate}% of all projects` : "No projects yet"}
              progress={completionRate}
            />
            <StatCard
              title="In Progress"
              value={inProgressProjects}
              icon={Clock3}
              color="amber"
              hint={totalProjects > 0 ? `${Math.round((inProgressProjects / totalProjects) * 100)}% currently shipping` : "No projects yet"}
              progress={totalProjects > 0 ? (inProgressProjects / totalProjects) * 100 : 0}
            />
            <StatCard
              title="Team Members"
              value={activeTeamMembers}
              icon={Users}
              color="violet"
              hint="People linked to projects"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned Projects"
              value={totalProjects}
              icon={LayoutDashboard}
              color="indigo"
              hint="In your workspace"
              progress={totalProjects > 0 ? 100 : 0}
            />
            <StatCard
              title="Assigned Tasks"
              value={totalTasks}
              icon={CheckSquare}
              color="violet"
              hint="Total work items"
            />
            <StatCard
              title="In Progress"
              value={inProgressTasks}
              icon={Clock3}
              color="amber"
              hint={totalTasks > 0 ? `${Math.round((inProgressTasks / totalTasks) * 100)}% of your tasks` : "No tasks yet"}
              progress={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}
            />
            <StatCard
              title="Completed"
              value={doneTasks}
              icon={CheckCircle2}
              color="emerald"
              hint={totalTasks > 0 ? `${taskCompletionRate}% of your tasks` : "No tasks yet"}
              progress={taskCompletionRate}
            />
          </>
        )}
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isFormOpen}
        isEditMode={isEditMode}
        editingProject={foundProject}
        isManager={isManager}
        projectRole={isEditMode ? foundProject?.my_role : isManager ? "global_manager" : "member"}
        onClose={() => {
          setIsFormOpen(false);
          setIsEditMode(false);
          setEditingProjectId(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-[13px] font-semibold text-[#172B4D] dark:text-white">
            Pending invitations ({pendingInvitations.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="rounded border border-[#DCDFE4] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[14px] font-medium text-[#172B4D] dark:text-white">
                      {inv.project_summary || "Unknown Project"}
                    </h4>
                    <p className="mt-1 text-[12px] text-[#626F86] dark:text-slate-400">
                      Invited by{" "}
                      <span className="font-medium text-[#44546F] dark:text-slate-300">
                        {inv.inviter_name || "Unknown User"}
                      </span>{" "}
                      as {inv.role}
                    </p>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#E9F2FF] dark:bg-blue-500/15">
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#0C66E4]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptInvitation(inv.token)}
                    className="flex-1 rounded bg-[#0C66E4] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#0055CC]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineInvitation(inv.id)}
                    className="flex-1 rounded border border-[#DCDFE4] bg-white px-3 py-1.5 text-[13px] font-medium text-[#44546F] hover:bg-[#F1F2F4] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content - Table and Performance */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Projects Table */}
        <div>
          <ProjectTable
            projects={projects}
            onDelete={deleteProject}
            onEdit={handleEditProject}
            isLoading={loading}
            user={user}
            onViewAll={() => onNavigate?.("Projects")}
          />
        </div>

        {/* Performance Overview Sidebar */}
        <div className={`${cardClass} p-4`}>
          <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Team performance</h3>
          <p className="mt-0.5 text-[12px] text-[#626F86] dark:text-slate-400">Completion across the workspace</p>

          {totalProjects > 0 || totalTasks > 0 ? (
            <>
              <div className="relative mx-auto mt-2 h-[190px] w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`perf-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyles} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold tracking-tight text-[#172B4D] dark:text-white">
                    {ringPercent}%
                  </span>
                  <span className="text-[11px] font-medium text-[#626F86]">Done</span>
                </div>
              </div>
              <div className="mt-1 space-y-2">
                {projectProgressData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[#44546F] dark:text-slate-400">{item.name}</span>
                    </div>
                    <span className="font-medium text-[#172B4D] dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-[13px] text-[#626F86]">No project or task activity yet</p>
          )}
        </div>
      </div>

      {!isManager && (
        <div className={`${cardClass} mb-6 p-4`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#0C66E4]" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Assigned to me</h3>
                <p className="mt-0.5 text-[12px] text-[#626F86] dark:text-slate-400">
                  Work items assigned to you
                </p>
              </div>
            </div>
            <span className="rounded bg-[#E9F2FF] px-2 py-0.5 text-[12px] font-medium text-[#0C66E4] dark:bg-blue-950/40 dark:text-blue-300">
              {tasks.length} {tasks.length === 1 ? "issue" : "issues"}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded border border-dashed border-[#DCDFE4] py-10 text-center dark:border-slate-800">
              <CheckSquare className="mx-auto mb-2 h-5 w-5 text-[#8993A4]" />
              <p className="text-[13px] font-medium text-[#172B4D] dark:text-slate-300">No issues assigned</p>
              <p className="mt-0.5 text-[12px] text-[#626F86]">
                Issues your project manager assigns to you will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => {
                const statusMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
                const priorityMeta = TASK_PRIORITY_META[task.priority] || TASK_PRIORITY_META.medium;
                const isDone = task.status === "done";
                const isInProgress = task.status === "in_progress";
                const isTodo = task.status === "todo";

                return (
                  <div
                    key={task.id}
                    className="flex flex-col justify-between rounded border border-[#DCDFE4] bg-white p-3 hover:bg-[#F7F8F9] dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityMeta}`}>
                          {task.priority || "medium"}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="mb-1 font-mono text-[11px] text-[#626F86]">AERO-{task.id}</p>
                      <h4 className="mb-1.5 text-[13px] font-medium leading-snug text-[#172B4D] dark:text-white">
                        {task.summary}
                      </h4>
                      {task.description && (
                        <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-[#626F86] dark:text-slate-400">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#626F86] dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                      </div>
                      {task.creator && (
                        <p className="mt-1 text-[12px] text-[#8993A4] dark:text-slate-500">
                          Reporter{" "}
                          <span className="font-medium text-[#44546F] dark:text-slate-300">
                            {task.creator.full_name || task.creator.username}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1 border-t border-[#F1F2F4] pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "todo")}
                        disabled={isTodo}
                        className={`rounded px-2 py-1 text-[11px] font-medium disabled:cursor-default ${isTodo
                            ? "bg-[#F1F2F4] text-[#172B4D] dark:bg-slate-800 dark:text-white"
                            : "text-[#44546F] hover:bg-[#F1F2F4] dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                      >
                        To do
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "in_progress")}
                        disabled={isInProgress}
                        className={`rounded px-2 py-1 text-[11px] font-medium disabled:cursor-default ${isInProgress
                            ? "bg-[#FFF7D6] text-[#946F00] dark:bg-amber-950/50 dark:text-amber-300"
                            : "text-[#946F00] hover:bg-[#FFF7D6] dark:text-amber-400 dark:hover:bg-amber-950/40"
                          }`}
                      >
                        In progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "done")}
                        disabled={isDone}
                        className={`rounded px-2 py-1 text-[11px] font-medium disabled:cursor-default ${isDone
                            ? "bg-[#DCFFF1] text-[#1F845A] dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "text-[#1F845A] hover:bg-[#DCFFF1] dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          }`}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={`${cardClass} p-4`}>
          <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Project progress</h3>
          <p className="mt-0.5 text-[12px] text-[#626F86]">Overall mix across all projects</p>
          {ringSlices.length > 0 ? (
            <div className="relative mx-auto mt-2 h-[170px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`prog-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-[13px] text-[#8993A4]">No data available</p>
            </div>
          )}
          <div className="space-y-2 pt-1">
            {projectProgressData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[#44546F]">{item.name}</span>
                </div>
                <span className="font-medium text-[#172B4D] dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Project timeline</h3>
          <p className="mt-0.5 text-[12px] text-[#626F86]">Projects ordered by due date</p>
          {timelineItems.length ? (
            <div className="relative mt-4 space-y-4 pl-3">
              <div className="absolute bottom-1 left-[7px] top-1 w-px bg-[#DCDFE4] dark:bg-slate-800" />
              {timelineItems.map((item) => {
                const meta = PROJECT_STATUS_META[item.status] || {
                  label: item.status || "Unknown",
                  done: false,
                  upcoming: false,
                };
                return (
                  <div key={item.id} className="relative pl-5">
                    <span
                      className={`absolute left-0 top-1.5 h-2 w-2 rounded-sm ring-4 ring-white dark:ring-slate-900 ${meta.done
                          ? "bg-[#1F845A]"
                          : item.status === "in_progress" || item.status === "active"
                            ? "bg-[#0C66E4]"
                            : "bg-[#E2B203]"
                        }`}
                    />
                    <p className="text-[13px] font-medium text-[#172B4D] dark:text-white">{item.title}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="text-[12px] text-[#8993A4]">{formatShortDate(item.date)}</p>
                      <span
                        className={`text-[10px] font-bold uppercase ${meta.done
                            ? "text-[#1F845A]"
                            : item.status === "in_progress" || item.status === "active"
                              ? "text-[#0C66E4]"
                              : "text-[#946F00]"
                          }`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-[#8993A4]">No projects yet</p>
          )}
        </div>

        <div className={`${cardClass} p-4`}>
          <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Shortcuts</h3>
          <p className="mt-0.5 text-[12px] text-[#626F86]">Jump to everyday workflows</p>
          <div className="mt-3 space-y-1">
            {[
              { label: "Create project", icon: Plus, action: handleCreateProject },
              { label: "Manage team", icon: Users, action: () => onNavigate?.("Team") },
              { label: "Open calendar", icon: CalendarDays, action: () => onNavigate?.("Calendar") },
              { label: "View reports", icon: BarChart3, action: () => onNavigate?.("Reports") },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[13px] font-medium text-[#44546F] hover:bg-[#F1F2F4] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Icon className="h-4 w-4 text-[#0C66E4]" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#172B4D] dark:text-white">Activity</h3>
              <p className="mt-0.5 text-[12px] text-[#626F86]">Latest updates from your projects</p>
            </div>
            <Activity className="h-4 w-4 text-[#8993A4]" />
          </div>
          {activityItems.length ? (
            <div className="space-y-3">
              {activityItems.map((item) => {
                const meta = PROJECT_STATUS_META[item.status] || { label: item.status || "Unknown" };
                return (
                  <div key={item.id} className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E9F2FF] text-[11px] font-semibold text-[#0C66E4] dark:bg-blue-500/15 dark:text-blue-300">
                      {item.who ? String(item.who).charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] leading-5 text-[#172B4D] dark:text-slate-200">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8993A4]">
                        {meta.label}
                        {item.at ? ` · ${timeAgo(item.at)}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-[#8993A4]">No activity yet</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
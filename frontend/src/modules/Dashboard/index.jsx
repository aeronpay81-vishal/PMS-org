import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  AlertCircle,
  CheckSquare,
  Calendar,
  Circle,
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

const TASK_STATUS_META = {
  todo: { label: "To do", badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  in_progress: { label: "In progress", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
  done: { label: "Done", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
};

const TASK_PRIORITY_META = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
};

const Dashboard = ({ user }) => {
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
      } catch {}
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

  // Chart data for Project Progress
  const projectProgressData = [
    { name: "Completed", value: completedProjects, color: "#4f46e5" },
    { name: "In progress", value: inProgressProjects, color: "#60a5fa" },
    {
      name: "Not started",
      value: totalProjects - completedProjects - inProgressProjects,
      color: isDark ? "#334155" : "#e2e8f0",
    },
  ].filter((item) => item.value > 0);

  // Chart data for Task Overview
  const taskOverviewData = [
    { name: "To do", value: todoTasks || Math.ceil(totalProjects * 0.5), color: isDark ? "#475569" : "#cbd5e1" },
    { name: "In progress", value: inProgressTasks || Math.ceil(totalProjects * 0.25), color: "#f59e0b" },
    { name: "Done", value: doneTasks || Math.ceil(totalProjects * 0.25), color: "#10b981" },
  ].filter((item) => item.value > 0);

  const foundProject = isEditMode
    ? projects.find((p) => p.id === editingProjectId)
    : undefined;

  const tooltipStyles = {
    contentStyle: {
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      borderColor: isDark ? "#334155" : "#e2e8f0",
      color: isDark ? "#f1f5f9" : "#0f172a",
      borderRadius: "8px",
      fontSize: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
    itemStyle: {
      color: isDark ? "#f1f5f9" : "#0f172a",
    },
  };

  return (
    <>
      <DashboardHeader user={currentUser} onCreateProject={handleCreateProject} />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex gap-3 rounded-md bg-red-50 dark:bg-red-950/30 px-4 py-3 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 flex gap-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards - 4 Column Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isManager ? (
          <>
            <StatCard
              title="Total projects"
              value={totalProjects}
              description="Created portfolio"
              icon={LayoutDashboard}
              color="indigo"
            />
            <StatCard
              title="Completed"
              value={completedProjects}
              description="Finished projects"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              title="In progress"
              value={inProgressProjects}
              description="Active delivery"
              icon={Clock3}
              color="amber"
            />
            <StatCard
              title="Team members"
              value={activeTeamMembers}
              description="Database assignees"
              icon={Users}
              color="violet"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned projects"
              value={totalProjects}
              description="Assigned by manager"
              icon={LayoutDashboard}
              color="indigo"
            />
            <StatCard
              title="Assigned tasks"
              value={totalTasks}
              description="Total tasks for you"
              icon={CheckSquare}
              color="violet"
            />
            <StatCard
              title="In progress"
              value={inProgressTasks}
              description="Currently working on"
              icon={Clock3}
              color="amber"
            />
            <StatCard
              title="Completed"
              value={doneTasks}
              description="Successfully finished"
              icon={CheckCircle2}
              color="emerald"
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
        <div className="mb-8 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pending Invitations ({pendingInvitations.length})</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="relative overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 shadow-sm transition hover:shadow-md">
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-2xl" />
                
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{inv.project_summary || 'Unknown Project'}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Invited by <span className="font-medium text-slate-700 dark:text-slate-300">{inv.inviter_name || 'Unknown User'}</span> as {inv.role}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                      <LayoutDashboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      onClick={() => handleAcceptInvitation(inv.token)}
                      className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvitation(inv.id)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content - Table and Performance */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Projects Table */}
        <div>
          <ProjectTable
            projects={projects}
            onDelete={deleteProject}
            onEdit={handleEditProject}
            isLoading={loading}
            user={user}
          />
        </div>

        {/* Performance Overview Sidebar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Performance overview</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isManager ? "Project completion rate" : "Task completion rate"}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/40">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          {totalProjects > 0 || totalTasks > 0 ? (
            <>
              <div className="mb-5">
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">
                  {isManager
                    ? `${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%`
                    : `${totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%`}
                </p>
                <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {isManager
                    ? `${totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0}% completed`
                    : `${totalTasks > 0 ? ((doneTasks / totalTasks) * 100).toFixed(1) : 0}% tasks done`}
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isManager ? "Completed projects" : "Completed tasks"}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {isManager ? completedProjects : doneTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isManager ? "In progress projects" : "In progress tasks"}
                  </span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {isManager ? inProgressProjects : inProgressTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {isManager ? "Total projects" : "To do tasks"}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {isManager ? totalProjects : todoTasks}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No project or task activity yet</p>
          )}
        </div>
      </div>

      {/* Tasks Section for Normal User (or overview for Manager) */}
      {!isManager && (
        <div className="mb-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My assigned tasks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tasks assigned to you by your project manager
                </p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <CheckSquare className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No tasks assigned yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Tasks your project manager assigns to you will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((task) => {
                const statusMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
                const priorityMeta = TASK_PRIORITY_META[task.priority] || TASK_PRIORITY_META.medium;
                const isDone = task.status === "done";
                const isInProgress = task.status === "in_progress";
                const isTodo = task.status === "todo";

                return (
                  <div
                    key={task.id}
                    className="flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${priorityMeta}`}
                        >
                          {task.priority || "medium"}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1.5 leading-snug">
                        {task.summary}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}</span>
                      </div>

                      {task.creator && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Assigned by{" "}
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {task.creator.full_name || task.creator.username}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Quick status changers */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "todo")}
                        disabled={isTodo}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:cursor-default ${
                          isTodo
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        To do
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "in_progress")}
                        disabled={isInProgress}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:cursor-default ${
                          isInProgress
                            ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40"
                        }`}
                      >
                        In progress
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickTaskStatus(task.id, "done")}
                        disabled={isDone}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors disabled:cursor-default ${
                          isDone
                            ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                            : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
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

      {/* Bottom Charts Section - 3 Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Project Progress Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project progress</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Overall progress across all projects</p>
          </div>

          {projectProgressData.length > 0 ? (
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={projectProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No data available</p>
            </div>
          )}

          <div className="mt-5 space-y-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
            {projectProgressData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Overview Chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Task overview</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Task distribution by status</p>
          </div>

          {taskOverviewData.length > 0 ? (
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={taskOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No data available</p>
            </div>
          )}

          <div className="mt-5 space-y-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
            {taskOverviewData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent activity</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Latest updates from your projects</p>
            </div>
            <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3.5">
              {projects.slice(0, 4).map((project) => {
                const dotColor =
                  project.status === "in_progress"
                    ? "text-indigo-500"
                    : project.status === "closed" || project.status === "completed"
                    ? "text-emerald-500"
                    : "text-amber-500";
                return (
                  <div
                    key={project.id}
                    className="flex gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                  >
                    <Circle className={`h-2 w-2 mt-1.5 flex-shrink-0 fill-current ${dotColor}`} strokeWidth={0} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {project.summary}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
          )}

          <button
            type="button"
            className="mt-5 w-full rounded-md border border-slate-200 dark:border-slate-800 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            View all activity
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
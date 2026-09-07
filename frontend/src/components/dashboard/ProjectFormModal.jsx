import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Loader2,
  Briefcase,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Users,
  Plus,
  Trash2,
  Copy,
  Mail,
} from "lucide-react";
import { authAPI } from "../../api/admin";

// One blank assignment row's shape — each row is one person's own
// priority / status / timeline for this project.
// NOTE: `assigned_to` (user id select) has been replaced with
// `assigned_email` (free-text email). This lets a manager assign a task
// to someone by email even if they aren't an existing user yet — those
// emails get merged into the invite list automatically on submit.
const emptyAssignment = () => ({
  _key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  assigned_email: "",
  role: "member",
  priority: "medium",
  status: "open",
  due_date: "",
  start_date: "",
  task_detail: "",
});

const PRIORITIES = [
  { value: "low", label: "Low", dot: "bg-slate-400", ring: "ring-slate-300", text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-300" },
  { value: "medium", label: "Medium", dot: "bg-blue-500", ring: "ring-blue-300", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
  { value: "high", label: "High", dot: "bg-amber-500", ring: "ring-amber-300", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  { value: "critical", label: "Critical", dot: "bg-red-500", ring: "ring-red-300", text: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
];

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "In review" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "closed", label: "Closed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const priorityMeta = (value) => PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];

// Global managers and project owners/managers can edit project fields.
// Project members only get the limited task update view.
const ProjectFormModal = ({ isOpen, isEditMode, editingProject, isManager = true, projectRole, onClose, onSubmit }) => {
  const role = projectRole || editingProject?.my_role || (isManager ? "global_manager" : "member");
  const canManageProject = ["global_manager", "admin", "owner", "manager"].includes(role);
  const canManageMembers = ["global_manager", "admin", "owner"].includes(role);
  const canEditProject = canManageProject;
  // Fields shared across the whole project (same for every assignee)
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    labels: [],
    reporter: "",
    status: "active",
    due_date: "",
    attachment: null,
    invites: "",
  });

  // Per-user rows: each has its own assigned_email + priority + status + dates
  const [assignments, setAssignments] = useState([emptyAssignment()]);
  const [managerEmail, setManagerEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState([""]);

  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [showSummaryLimitPopup, setShowSummaryLimitPopup] = useState(false);

  const popupTimeoutRef = useRef(null);

  const MAX_SUMMARY_LENGTH = 255;

  // Fetch available users — still used to show a "known user" badge and to
  // power the email autocomplete datalist, even though assignment is now
  // done by typing an email instead of picking from a dropdown.
  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await authAPI.getUsers();
          const users = res.data || res || [];
          setUsersList(Array.isArray(users) ? users : []);
        } catch (err) {
          console.error("Failed to load users for assignment:", err);
          setUsersList([]);
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isOpen]);

  // Helper function to safely parse dates
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date parsing error:", error);
      return "";
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editingProject) {
      let labelsList = [];
      if (editingProject.labels) {
        if (typeof editingProject.labels === "string") {
          labelsList = editingProject.labels.split(",").map((l) => l.trim()).filter((l) => l);
        } else if (Array.isArray(editingProject.labels)) {
          labelsList = editingProject.labels;
        }
      }

      setExistingAttachment(editingProject.attachment || null);

      setFormData({
        summary: editingProject.summary || "",
        description: editingProject.description || "",
        labels: labelsList,
        reporter: editingProject.reporter || "",
        status: editingProject.status || "active",
        due_date: formatDateForInput(editingProject.due_date),
        attachment: null,
        invites: "",
      });
      setManagerEmail(editingProject.manager?.email || "");
      setMemberEmails([""]);

      const projectTasks =
        (Array.isArray(editingProject.assignments) && editingProject.assignments.length > 0 && editingProject.assignments) ||
        (Array.isArray(editingProject.tasks) && editingProject.tasks.length > 0 && editingProject.tasks) ||
        null;

      // Resolve an email for a legacy row that only has a numeric assigned_to
      // (old data saved before this field became email-based).
      const resolveEmail = (a) => {
        if (a.assigned_email) return a.assigned_email;
        if (a.assigned_to && !isNaN(a.assigned_to)) {
          const match = usersList.find((u) => String(u.id) === String(a.assigned_to));
          if (match) return match.email || "";
        }
        // Fallback: assigned_to might already be an email string from an
        // even newer backend response shape.
        if (a.assigned_to && typeof a.assigned_to === "string" && a.assigned_to.includes("@")) {
          return a.assigned_to;
        }
        return "";
      };

      if (projectTasks) {
        setAssignments(
          projectTasks.map((a) => ({
            _key: emptyAssignment()._key,
            assigned_email: resolveEmail(a),
            role: a.role || "member",
            priority: (a.priority || "medium").toLowerCase(),
            status: (a.status || "open").toLowerCase(),
            due_date: formatDateForInput(a.due_date),
            start_date: formatDateForInput(a.start_date),
            task_detail: a.task_detail || a.description || a.summary || "",
          }))
        );
      } else {
        setAssignments([
          {
            _key: emptyAssignment()._key,
            assigned_email: resolveEmail(editingProject),
            role: editingProject.role || "member",
            priority: (editingProject.priority || "medium").toLowerCase(),
            status: (editingProject.status || "open").toLowerCase(),
            due_date: formatDateForInput(editingProject.due_date),
            start_date: formatDateForInput(editingProject.start_date),
            task_detail: editingProject.task_detail || "",
          },
        ]);
      }
    } else {
      setExistingAttachment(null);
      setFormData({
        summary: "",
        description: "",
        labels: [],
        reporter: "",
        status: "active",
        due_date: "",
        attachment: null,
        invites: "",
      });
      setAssignments([emptyAssignment()]);
      setManagerEmail("");
      setMemberEmails([""]);
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editingProject, isOpen]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  const triggerSummaryLimitPopup = () => {
    setShowSummaryLimitPopup(true);
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
    }
    popupTimeoutRef.current = setTimeout(() => {
      setShowSummaryLimitPopup(false);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "summary" && value.length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      setFormData((prev) => ({
        ...prev,
        summary: value.slice(0, MAX_SUMMARY_LENGTH),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---- Assignment row helpers ----

  const updateAssignment = (key, field, value) => {
    // Extra safety net: even if a disabled input somehow fires onChange,
    // normal users can only ever mutate status / task_detail.
    if (!canManageProject && field !== "status" && field !== "task_detail") return;
    setAssignments((prev) => prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)));
  };

  const addAssignmentRow = () => {
    if (!canManageProject) return;
    setAssignments((prev) => [...prev, emptyAssignment()]);
  };

  // Duplicate a row's priority/status/dates but clear the assignee email, so
  // the manager can quickly reuse the same timeline for a different person
  const duplicateAssignmentRow = (key) => {
    if (!canManageProject) return;
    setAssignments((prev) => {
      const source = prev.find((a) => a._key === key);
      if (!source) return prev;
      const copy = { ...source, _key: emptyAssignment()._key, assigned_email: "" };
      const index = prev.findIndex((a) => a._key === key);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const removeAssignmentRow = (key) => {
    if (!canManageProject) return;
    setAssignments((prev) => (prev.length === 1 ? prev : prev.filter((a) => a._key !== key)));
  };

  const normalizeEmail = (email) => (email || "").trim().toLowerCase();

  // Find a known user by email (for showing name / "existing user" badge)
  const getUserByEmail = (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    return usersList.find((u) => normalizeEmail(u.email) === normalized) || null;
  };

  const getRowLabel = (email) => {
    const u = getUserByEmail(email);
    if (u) return u.full_name || u.username;
    return email;
  };

  const assignedCounts = assignments.reduce((acc, a) => {
    const email = normalizeEmail(a.assigned_email);
    if (email) acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {});

  const handleAddLabel = () => {
    if (!canManageProject) return;
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()],
      }));
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (label) => {
    if (!canManageProject) return;
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.filter((l) => l !== label),
    }));
  };

  // ---- File ----

  const handleFileChange = (e) => {
    if (!canManageProject) return;
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setError("Only PDF files are allowed");
        return;
      }

      const maxSizeInMB = 10;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        setError(`File size must be less than ${maxSizeInMB}MB`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachment: file,
      }));
      setError("");
    }
  };

  const handleRemoveFile = () => {
    if (!canManageProject) return;
    setFormData((prev) => ({
      ...prev,
      attachment: null,
    }));
  };

  // ---- Validation ----

  const validate = () => {
    if (!canEditProject && isEditMode) return "";
    const normalizedManager = normalizeEmail(managerEmail);
    if (normalizedManager && !EMAIL_RE.test(normalizedManager)) return "Enter a valid manager email";
    const normalizedMembers = memberEmails.map(normalizeEmail).filter(Boolean);
    if (normalizedMembers.some((email) => !EMAIL_RE.test(email))) return "Enter valid member email addresses";
    if (normalizedManager && normalizedMembers.includes(normalizedManager)) return "Manager cannot also be added as a member";
    if (!formData.summary.trim()) {
      return "Project name is required";
    }
    if (formData.summary.trim().length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      return `Project name cannot exceed ${MAX_SUMMARY_LENGTH} characters`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Each row becomes its own assignment object — different priority,
      // status and dates per person, all tied to the same project summary.
      // `assigned_email` replaces the old `assigned_to` user-id field so the
      // backend can look up an existing user by email, or, if none exists,
      // create/invite one and attach the assignment once they sign up.
      const normalizedManager = normalizeEmail(managerEmail);
      const normalizedMembers = memberEmails.map(normalizeEmail).filter(Boolean);
      const inviteRoles = {};
      if (normalizedManager) inviteRoles[normalizedManager] = "manager";
      normalizedMembers.forEach((email) => { inviteRoles[email] = "member"; });

      // Any assignee email that isn't a known existing user gets folded
      // into the invite list automatically, so they actually receive an
      // invite/notification email instead of silently failing to resolve.
      const existingInvites = formData.invites
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const mergedInvites = Array.from(new Set([
        ...existingInvites,
        ...Object.keys(inviteRoles),
      ])).join(", ");

      let submitData;
      let useFormData = false;

        if (!canEditProject && isEditMode) {
        await onSubmit({
          description: formData.description.trim(),
          status: formData.status,
        }, false);
        return;
      }

      if (formData.attachment) {
        useFormData = true;
        submitData = new FormData();
        submitData.append("summary", formData.summary.trim());
        submitData.append("description", formData.description.trim());
        submitData.append("labels", JSON.stringify(formData.labels.length > 0 ? formData.labels : []));
        submitData.append("reporter", formData.reporter.trim() || null);
        submitData.append("status", formData.status);
        submitData.append("due_date", formData.due_date || "");
        submitData.append("invite_roles", JSON.stringify(inviteRoles));
        submitData.append("invites", mergedInvites);
        // Backend should read this JSON array and create one assignment per entry
        submitData.append("attachment", formData.attachment);
      } else {
        submitData = {
          summary: formData.summary.trim(),
          description: formData.description.trim(),
          labels: formData.labels.length > 0 ? formData.labels : [],
          reporter: formData.reporter.trim() || null,
          status: formData.status,
          due_date: formData.due_date || null,
          invites: mergedInvites,
          invite_roles: inviteRoles,
          attachment: null,
        };
      }

      await onSubmit(submitData, useFormData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : err?.message || "Failed to save project";
      setError(errorMessage);
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const distinctUserCount = new Set(
    assignments.map((a) => normalizeEmail(a.assigned_email)).filter(Boolean)
  ).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {isEditMode ? "Edit project" : "New project"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {role === "owner"
                  ? "Full control: edit the project, manage members, and assign work"
                  : role === "manager" || role === "global_manager"
                    ? "Coordinate assignments, timelines, and project delivery"
                    : "Update your task status and details only"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 rounded-md bg-red-50 dark:bg-red-950/30 px-4 py-3 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Basic Information (shared across all assignees) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Project details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project name
              </label>

              <div className="relative">
                {showSummaryLimitPopup && (
                  <div
                    role="alert"
                    className="absolute bottom-full left-0 mb-2 z-10 flex items-center gap-2 rounded-md bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-white shadow-md"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Project name can't be more than {MAX_SUMMARY_LENGTH} characters
                  </div>
                )}

                <input
                  type="text"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  disabled={!canEditProject}
                  placeholder="Website redesign, Mobile app v2..."
                  className={`w-full px-3 py-2 rounded-md border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-500 ${showSummaryLimitPopup
                    ? "border-red-400 focus:ring-red-200 dark:border-red-800"
                    : "border-slate-300 dark:border-slate-700 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500"
                    }`}
                />
              </div>

              <p className="text-xs mt-1.5 text-slate-400 dark:text-slate-500">
                {formData.summary.length}/{MAX_SUMMARY_LENGTH}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">Optional</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!canEditProject}
                placeholder="Goals, scope, and key requirements..."
                rows="3"
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow resize-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!canEditProject}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="active">Active</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="on_hold">On hold</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reporter
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">
                  Defaults to your account
                </span>
              </label>
              <input
                type="text"
                name="reporter"
                value={formData.reporter}
                onChange={handleChange}
                disabled={!canManageProject}
                placeholder="Project manager name"
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Project deadline
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={!canManageProject}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </section>

          {/* Project team: one manager and multiple members */}
          {!isEditMode && canManageMembers && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Project team
              </h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project manager (one only)
                </label>
                <input
                  type="email"
                  list="known-user-emails"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project members
                </label>
                <div className="space-y-2">
                  {memberEmails.map((email, index) => (
                    <div key={`member-${index}`} className="flex gap-2">
                      <input
                        type="email"
                        list="known-user-emails"
                        value={email}
                        onChange={(e) => setMemberEmails((previous) => previous.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}
                        placeholder="member@example.com"
                        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      />
                      {memberEmails.length > 1 && (
                        <button type="button" onClick={() => setMemberEmails((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove member" className="rounded-md px-3 text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setMemberEmails((previous) => [...previous, ""])} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  <Plus className="h-3.5 w-3.5" /> Add another member
                </button>
              </div>
            </section>
          )}

          {/* Legacy task rows are kept for editing old records only. New tasks are created in Tasks. */}
          {false ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tasks
              </h3>
              {loadingUsers && (
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading users
                </span>
              )}
            </div>

            {/* Datalist powers email autocomplete for known users */}
            <datalist id="known-user-emails">
              {usersList
                .filter((u) => u.email)
                .map((u) => (
                  <option key={u.id} value={u.email} />
                ))}
            </datalist>

            <div className="space-y-3">
              {assignments.map((row, index) => {
                const normalizedEmail = normalizeEmail(row.assigned_email);
                const duplicateWarning = normalizedEmail && assignedCounts[normalizedEmail] > 1;
                const meta = priorityMeta(row.priority);
                const matchedUser = getUserByEmail(row.assigned_email);
                const emailLooksValid = !row.assigned_email || EMAIL_RE.test(normalizedEmail);

                return (
                  <div
                    key={row._key}
                    className={`rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 border-l-4 ${meta.border.replace(
                      "border-",
                      "border-l-"
                    )}`}
                    style={{ borderRadius: "8px" }}
                  >
                    <div className="p-4">
                      {/* Row header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {row.assigned_email ? getRowLabel(row.assigned_email) : `Task ${index + 1}`}
                          </p>
                        </div>
                        {canManageProject && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateAssignmentRow(row._key)}
                              title="Duplicate for another user"
                              aria-label="Duplicate task"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {assignments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAssignmentRow(row._key)}
                                title="Remove task"
                                aria-label="Remove task"
                                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {duplicateWarning && (
                        <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 px-3 py-2 border border-amber-200 dark:border-amber-900/40">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            {row.assigned_email} already has another task in this project.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Assign to — now an email field instead of a user-id select */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Assign to (email)
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="email"
                              list="known-user-emails"
                              value={row.assigned_email}
                              onChange={(e) => updateAssignment(row._key, "assigned_email", e.target.value)}
                              disabled={!canManageProject}
                              placeholder="teammate@example.com"
                              className={`w-full pl-9 pr-3 py-2 rounded-md border text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800 dark:disabled:text-slate-500 ${emailLooksValid
                                ? "border-slate-300 dark:border-slate-700 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500"
                                : "border-red-400 focus:ring-red-200 dark:border-red-800"
                                }`}
                            />
                          </div>
                          {row.assigned_email && !emailLooksValid && (
                            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                              Enter a valid email address
                            </p>
                          )}
                          {row.assigned_email && emailLooksValid && (
                            <div className="mt-2 flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {row.assigned_email.charAt(0).toUpperCase()}
                              </div>
                              {matchedUser ? (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {matchedUser.full_name || matchedUser.username}
                                  {matchedUser.role === "manager" && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-400">
                                      Manager
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                                  Not a user yet — will be invited by email
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                                    New invite
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Project role */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Project role (one manager maximum)
                          </label>
                          <select
                            value={row.role}
                            onChange={(e) => updateAssignment(row._key, "role", e.target.value)}
                            disabled={!canManageProject}
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          >
                            <option value="member">Member</option>
                            <option
                              value="manager"
                              disabled={assignments.some(
                                (assignment) => assignment._key !== row._key && assignment.role === "manager"
                              )}
                            >
                              Manager
                            </option>
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Priority
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {PRIORITIES.map((p) => {
                              const active = row.priority === p.value;
                              return (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => updateAssignment(row._key, "priority", p.value)}
                                  disabled={!canManageProject}
                                  className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${active
                                    ? `${p.bg} ${p.border} ${p.text} dark:bg-slate-800 dark:border-slate-600`
                                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status — always editable, even for normal users */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Status
                          </label>
                          <select
                            value={row.status}
                            onChange={(e) => updateAssignment(row._key, "status", e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Start date */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Start date
                          </label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="date"
                              value={row.start_date}
                              onChange={(e) => updateAssignment(row._key, "start_date", e.target.value)}
                              disabled={!canManageProject}
                              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Due date */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Due date
                          </label>
                          <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="date"
                              value={row.due_date}
                              onChange={(e) => updateAssignment(row._key, "due_date", e.target.value)}
                              disabled={!canManageProject}
                              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                            />
                          </div>
                        </div>

                        {/* Task detail — always editable, even for normal users */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                            Task detail
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">Optional</span>
                          </label>
                          <textarea
                            value={row.task_detail}
                            onChange={(e) => updateAssignment(row._key, "task_detail", e.target.value)}
                            rows="2"
                            placeholder="What this person needs to do..."
                            className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow resize-none"
                          />
                        </div>
                      </div>

                      {row.start_date && row.due_date && (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {Math.max(
                            0,
                            Math.ceil((new Date(row.due_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24))
                          )}{" "}
                          day duration
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add another assignment — managers only */}
            {canManageProject && (
              <button
                type="button"
                onClick={addAssignmentRow}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add another task
              </button>
            )}

            {/* Summary strip */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" />
              {assignments.length} task{assignments.length !== 1 ? "s" : ""} · {distinctUserCount} user
              {distinctUserCount !== 1 ? "s" : ""}
            </div>
          </section>
          ) : null}

          {/* File Attachment (shared) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Attachment
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                PDF file
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1.5">Max 10MB</span>
              </label>

              {formData.attachment ? (
                <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{formData.attachment.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(formData.attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  {canManageProject && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Remove file"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : existingAttachment && isEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{existingAttachment}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded file</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <a
                        href={`/uploads/projects/${existingAttachment}`}
                        download
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {canManageProject && (
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                        Replace with new file
                      </summary>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full px-4 py-5 rounded-md border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                          <Upload className="h-4 w-4 text-slate-400 mb-1.5" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Drop a new PDF or click to browse
                          </p>
                          <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </details>
                  )}
                </div>
                    ) : canManageProject ? (
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-md border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">PDF files up to 10MB</p>
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No attachment</p>
              )}
            </div>
          </section>

          {/* Labels (shared) */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Labels
            </h3>

            <div>
              {canManageProject && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    placeholder="frontend, urgent, Q1-2024..."
                    className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/50 focus:border-indigo-500 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}

              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {label}
                      {canManageProject && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(label)}
                          aria-label={`Remove ${label}`}
                          className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-5 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? "Saving..."
                : canManageProject
                  ? isEditMode
                    ? "Update project"
                    : `Create project (${assignments.length})`
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
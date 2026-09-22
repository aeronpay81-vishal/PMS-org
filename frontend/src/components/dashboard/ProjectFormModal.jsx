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
  Sparkles,
  RefreshCw,
  Wand2,
  Lightbulb,
  ArrowUpRight,
  CircleDot,
  Clock3,
  ShieldCheck,
  Layers3,
  Paperclip,
} from "lucide-react";
import { authAPI } from "../../api/admin";
import { suggestProjectDescription } from "../../api/groqApi";

// One blank assignment row's shape
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
  { value: "low", label: "Low", dot: "bg-slate-400" },
  { value: "medium", label: "Medium", dot: "bg-blue-500" },
  { value: "high", label: "High", dot: "bg-amber-500" },
  { value: "critical", label: "Critical", dot: "bg-red-500" },
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

const ProjectFormModal = ({ isOpen, isEditMode, editingProject, isManager = true, projectRole, onClose, onSubmit }) => {
  const role = projectRole || editingProject?.my_role || (isManager ? "global_manager" : "member");
  const canManageProject = ["global_manager", "admin", "owner", "manager"].includes(role);
  const canManageMembers = ["global_manager", "admin", "owner"].includes(role);
  const canEditProject = canManageProject;

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

  // ✨ AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiUsed, setAiUsed] = useState(false);
  const [aiMode, setAiMode] = useState("");

  const popupTimeoutRef = useRef(null);
  const descriptionRef = useRef(null);

  const MAX_SUMMARY_LENGTH = 255;

  // ✅ Auto-grow description textarea
  const autoGrowDescription = () => {
    const el = descriptionRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(140, el.scrollHeight)}px`;
  };

  useEffect(() => {
    if (isOpen) autoGrowDescription();
  }, [isOpen, formData.description]);

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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

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

      const resolveEmail = (a) => {
        if (a.assigned_email) return a.assigned_email;
        if (a.assigned_to && !isNaN(a.assigned_to)) {
          const match = usersList.find((u) => String(u.id) === String(a.assigned_to));
          if (match) return match.email || "";
        }
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
    setAiError("");
    setAiUsed(false);
    setAiMode("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editingProject, isOpen]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, []);

  const triggerSummaryLimitPopup = () => {
    setShowSummaryLimitPopup(true);
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = setTimeout(() => setShowSummaryLimitPopup(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "summary" && value.length > MAX_SUMMARY_LENGTH) {
      triggerSummaryLimitPopup();
      setFormData((prev) => ({ ...prev, summary: value.slice(0, MAX_SUMMARY_LENGTH) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "description") setTimeout(autoGrowDescription, 0);

    if (name === "description" && aiUsed) {
      setAiUsed(false);
      setAiMode("");
    }
  };

  const handleAISuggestDescription = async () => {
    const projectName = formData.summary.trim();
    const existingDesc = formData.description.trim();

    if (!projectName) {
      setAiError("Please enter a project name first");
      setTimeout(() => setAiError(""), 3000);
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const result = await suggestProjectDescription(projectName, existingDesc);
      if (result?.description) {
        setFormData((prev) => ({ ...prev, description: result.description }));
        setAiUsed(true);
        setAiMode(result.mode || "generated");
        setTimeout(autoGrowDescription, 50);
      } else {
        setAiError("AI returned an empty response. Try again.");
      }
    } catch (err) {
      console.error("AI suggest error:", err);
      setAiError(err?.message || "Failed to generate description. Check your API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const updateAssignment = (key, field, value) => {
    if (!canManageProject && field !== "status" && field !== "task_detail") return;
    setAssignments((prev) => prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)));
  };

  const addAssignmentRow = () => {
    if (!canManageProject) return;
    setAssignments((prev) => [...prev, emptyAssignment()]);
  };

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

  const handleAddLabel = () => {
    if (!canManageProject) return;
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData((prev) => ({ ...prev, labels: [...prev.labels, labelInput.trim()] }));
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (label) => {
    if (!canManageProject) return;
    setFormData((prev) => ({ ...prev, labels: prev.labels.filter((l) => l !== label) }));
  };

  const handleFileChange = (e) => {
    if (!canManageProject) return;
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setError("Only PDF files are allowed");
        return;
      }
      const maxSizeInMB = 10;
      if (file.size / (1024 * 1024) > maxSizeInMB) {
        setError(`File size must be less than ${maxSizeInMB}MB`);
        return;
      }
      setFormData((prev) => ({ ...prev, attachment: file }));
      setError("");
    }
  };

  const handleRemoveFile = () => {
    if (!canManageProject) return;
    setFormData((prev) => ({ ...prev, attachment: null }));
  };

  const validate = () => {
    if (!canEditProject && isEditMode) return "";
    const normalizedManager = normalizeEmail(managerEmail);
    if (normalizedManager && !EMAIL_RE.test(normalizedManager)) return "Enter a valid manager email";
    const normalizedMembers = memberEmails.map(normalizeEmail).filter(Boolean);
    if (normalizedMembers.some((email) => !EMAIL_RE.test(email))) return "Enter valid member email addresses";
    if (normalizedManager && normalizedMembers.includes(normalizedManager)) return "Manager cannot also be added as a member";
    if (!formData.summary.trim()) return "Project name is required";
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
      const normalizedManager = normalizeEmail(managerEmail);
      const normalizedMembers = memberEmails.map(normalizeEmail).filter(Boolean);
      const inviteRoles = {};
      if (normalizedManager) inviteRoles[normalizedManager] = "manager";
      normalizedMembers.forEach((email) => { inviteRoles[email] = "member"; });

      const existingInvites = formData.invites.split(",").map((e) => e.trim()).filter(Boolean);
      const mergedInvites = Array.from(new Set([...existingInvites, ...Object.keys(inviteRoles)])).join(", ");

      let submitData;
      let useFormData = false;

      if (!canEditProject && isEditMode) {
        await onSubmit({ description: formData.description.trim(), status: formData.status }, false);
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const memberCount = memberEmails.filter(Boolean).length;
  const hasDescription = formData.description.trim().length > 0;
  const buttonLabel = hasDescription
    ? aiUsed ? "Regenerate" : "Enhance with AI"
    : "Generate with AI";
  const descriptionCharCount = formData.description.length;
  const projectName = formData.summary.trim() || "Untitled project";

  const progressItems = [
    { label: "Identity", complete: Boolean(formData.summary.trim()) },
    { label: "Description", complete: Boolean(formData.description.trim()) },
    { label: "Team", complete: Boolean(managerEmail || memberCount) },
    { label: "Timeline", complete: Boolean(formData.due_date) },
  ];
  const completedSteps = progressItems.filter((i) => i.complete).length;
  const completion = Math.round((completedSteps / progressItems.length) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/75 p-3 backdrop-blur-md sm:p-5">
      <div className="relative flex h-[94vh] w-full max-w-[1220px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-[#080d18]">

        {/* LEFT PROJECT RAIL */}
        <aside className="relative hidden w-[330px] shrink-0 overflow-hidden bg-[#0a1020] text-white lg:flex lg:flex-col">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
                  <Layers3 className="h-4 w-4 text-indigo-300" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300/80">Workspace</p>
                  <p className="text-sm font-semibold text-white">Project Studio</p>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-400">
                {isEditMode ? "EDIT" : "NEW"}
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Project identity
              </p>
              <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.045] p-5">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-900/30">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/10 px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-semibold text-emerald-300">
                        {formData.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <h3 className="break-words text-[12px] font-semibold leading-[1.1] tracking-[-0.035em] text-white">
                    {projectName}
                  </h3>
                  <p className="mt-3 line-clamp-4 text-xs leading-5 text-slate-400">
                    {formData.description.trim() || "Your project story will appear here as you build it."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Project pulse</p>
                <span className="text-[11px] font-semibold text-indigo-300">{completion}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <div className="mt-4 space-y-2.5">
                {progressItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        item.complete
                          ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-300"
                          : "border-white/10 bg-white/[0.03] text-slate-600"
                      }`}
                    >
                      {item.complete ? <CheckCircle2 className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}
                    </div>
                    <span className={`text-xs ${item.complete ? "text-slate-200" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-white">{memberCount}</p>
                <p className="text-[10px] text-slate-500">Team members</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-lg font-semibold text-white">{formData.labels.length}</p>
                <p className="text-[10px] text-slate-500">Labels</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN EDITOR */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#080d18]/90 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {isEditMode ? "Project workspace" : "Create workspace"}
                </p>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isEditMode ? "Shape your project" : "Build something meaningful"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <form
              id="project-form"
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-[900px] px-5 py-8 pb-32 sm:px-8 lg:px-10"
            >
              {error && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-900/60 dark:bg-red-950/20">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      Something needs your attention
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* PROJECT NAME */}
              <section className="mb-10">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                    Project identity
                  </span>
                </div>
                <div className="relative">
                  {showSummaryLimitPopup && (
                    <div
                      role="alert"
                      className="absolute bottom-full left-0 z-20 mb-3 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-medium text-white shadow-xl dark:bg-slate-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                      Project name can't be more than {MAX_SUMMARY_LENGTH} characters
                    </div>
                  )}
                  <input
                    type="text"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    disabled={!canEditProject}
                    placeholder="Give your project a name..."
                    className={`w-full border-0 bg-transparent p-0 text-[18px] font-semibold tracking-[-0.045em] text-slate-950 outline-none placeholder:text-slate-300 focus:ring-0 dark:text-white dark:placeholder:text-slate-700 sm:text-[32px] ${
                      showSummaryLimitPopup ? "text-red-600 dark:text-red-400" : ""
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                  <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                    <p className="text-xs text-slate-400">
                      Keep it clear, memorable and easy for the team to recognize.
                    </p>
                    <span
                      className={`text-[10px] font-medium tabular-nums ${
                        formData.summary.length >= MAX_SUMMARY_LENGTH ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      {formData.summary.length}/{MAX_SUMMARY_LENGTH}
                    </span>
                  </div>
                </div>
              </section>

              {/* PROJECT DESCRIPTION + AI */}
              <section className="mb-10">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project story</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Optional
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Explain what this project is trying to achieve.
                    </p>
                  </div>

                  {canEditProject && (
                    <button
                      type="button"
                      onClick={handleAISuggestDescription}
                      disabled={aiLoading || !formData.summary.trim()}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-900/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/15"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      {aiLoading ? (
                        <Loader2 className="relative h-3.5 w-3.5 animate-spin" />
                      ) : aiUsed ? (
                        <RefreshCw className="relative h-3.5 w-3.5" />
                      ) : hasDescription ? (
                        <Wand2 className="relative h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="relative h-3.5 w-3.5" />
                      )}
                      <span className="relative">{aiLoading ? "Working..." : buttonLabel}</span>
                    </button>
                  )}
                </div>

                <div
                  className={`relative overflow-hidden rounded-[22px] border transition-all ${
                    aiLoading
                      ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-700 dark:bg-indigo-950/20"
                      : aiUsed
                      ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/10"
                      : "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40"
                  }`}
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
                  <div className="relative p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                          AI Copilot
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {hasDescription
                            ? "Improve your existing project story"
                            : "Turn your project idea into a clear brief"}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        ref={descriptionRef}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={!canEditProject || aiLoading}
                        placeholder={
                          formData.summary.trim()
                            ? hasDescription
                              ? ""
                              : "Describe the goal, scope and expected outcome..."
                            : "Start with a project name..."
                        }
                        rows={5}
                        className="w-full resize-none overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ minHeight: "150px" }}
                      />
                      {aiLoading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm dark:bg-slate-950/70">
                          <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 shadow-lg dark:border-indigo-800 dark:bg-slate-900">
                            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                              AI is {hasDescription ? "enhancing" : "writing"}...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {aiUsed && !aiLoading && !aiError ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {aiMode === "enhanced" ? "Enhanced by AI" : "Generated by AI"}
                            <span className="font-normal text-slate-400">· You can edit it</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Lightbulb className="h-3 w-3" />
                            Clear context helps AI create better project details.
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] tabular-nums text-slate-400">
                        {descriptionCharCount} characters
                      </span>
                    </div>

                    {aiError && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {aiError}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CONTROL STRIP */}
              <section className="mb-10">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project controls</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Set the basic operating context for your team.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                        <CircleDot className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={!canEditProject}
                      className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</span>
                    </div>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      disabled={!canManageProject}
                      className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none focus:ring-0 dark:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reporter</span>
                    </div>
                    <input
                      type="text"
                      name="reporter"
                      value={formData.reporter}
                      onChange={handleChange}
                      disabled={!canManageProject}
                      placeholder="Your name"
                      className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 focus:ring-0 dark:text-white dark:placeholder:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </section>

              {/* TEAM WORKSPACE */}
              {!isEditMode && canManageMembers && (
                <section className="mb-10">
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">People workspace</h3>
                      <p className="mt-1 text-xs text-slate-400">Bring the right people into this project.</p>
                    </div>
                    {loadingUsers && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading users
                      </div>
                    )}
                  </div>

                  <datalist id="known-user-emails">
                    {usersList.map((user) => (
                      <option key={user.id || user.email} value={user.email}>
                        {user.name || user.full_name || ""}
                      </option>
                    ))}
                  </datalist>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/10">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">Project manager</p>
                            <p className="text-[10px] text-indigo-500">One owner</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-500 shadow-sm dark:bg-slate-900">
                          Required
                        </span>
                      </div>
                      <input
                        type="email"
                        list="known-user-emails"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="manager@example.com"
                        className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 dark:border-indigo-900/60 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                      />
                      {managerEmail && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                            {getRowLabel(managerEmail).slice(0, 2).toUpperCase()}
                          </div>
                          <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                            {getRowLabel(managerEmail)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">Project members</p>
                            <p className="text-[10px] text-slate-400">Add collaborators</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-400 shadow-sm dark:bg-slate-900">
                          {memberCount} added
                        </span>
                      </div>

                      <div className="space-y-2">
                        {memberEmails.map((email, index) => (
                          <div key={`member-${index}`} className="group flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[9px] font-bold text-slate-400 shadow-sm dark:bg-slate-800">
                              {index + 1}
                            </div>
                            <input
                              type="email"
                              list="known-user-emails"
                              value={email}
                              onChange={(e) =>
                                setMemberEmails((previous) =>
                                  previous.map((item, itemIndex) => (itemIndex === index ? e.target.value : item))
                                )
                              }
                              placeholder="member@example.com"
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                            />
                            {memberEmails.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setMemberEmails((previous) => previous.filter((_, i) => i !== index))
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-950/30"
                                aria-label="Remove member"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setMemberEmails((previous) => [...previous, ""])}
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <Plus className="h-3 w-3" />
                        Add collaborator
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* DOCUMENT VAULT */}
              <section className="mb-10">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Document vault</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Keep the main project reference close to the work.
                  </p>
                </div>

                {formData.attachment ? (
                  <div className="group flex items-center justify-between rounded-[22px] border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/10">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {formData.attachment.name}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          PDF · {(formData.attachment.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    {canManageProject && (
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-950/30"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : existingAttachment && isEditMode ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                          <FileText className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                            {existingAttachment}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">Existing project document</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/uploads/projects/${existingAttachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={`/uploads/projects/${existingAttachment}`}
                          download
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    {canManageProject && (
                      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-[10px] font-semibold text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400">
                        <Upload className="h-3.5 w-3.5" />
                        Replace document
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                ) : canManageProject ? (
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-slate-50/50 px-5 py-9 transition hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md dark:bg-slate-800">
                      <Upload className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Add a project PDF
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Drop here or click to browse · Maximum 10MB
                    </p>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 px-5 py-8 text-center dark:border-slate-800">
                    <Paperclip className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-700" />
                    <p className="mt-2 text-xs text-slate-400">No project document attached.</p>
                  </div>
                )}
              </section>

              {/* LABELS */}
              <section className="mb-10">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project signals</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Add lightweight tags to make this project easier to discover.
                  </p>
                </div>

                {canManageProject && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
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
                        placeholder="frontend, urgent, Q1..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLabel}
                      className="rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
                    >
                      Add signal
                    </button>
                  </div>
                )}

                {formData.labels.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.labels.map((label, index) => (
                      <span
                        key={label}
                        className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            ["bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"][index % 5]
                          }`}
                        />
                        {label}
                        {canManageProject && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLabel(label)}
                            className="rounded-full text-slate-300 transition hover:text-red-500 dark:text-slate-600"
                            aria-label={`Remove ${label}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center dark:border-slate-800">
                    <p className="text-[10px] text-slate-400">No project signals yet.</p>
                  </div>
                )}
              </section>
            </form>
          </div>

          {/* COMMAND BAR */}
          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-[#080d18]/95 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Workspace state
                  </p>
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {completion}% ready
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="project-form"
                  disabled={loading}
                  className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-indigo-600 hover:shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  )}
                  {loading
                    ? "Saving..."
                    : canManageProject
                    ? isEditMode
                      ? "Update project"
                      : "Create project"
                    : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;
import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, CalendarDays, CheckCircle2, CircleUserRound, FileText, FolderKanban, KeyRound, LockKeyhole, Mail, Save, ShieldCheck, SlidersHorizontal, UsersRound } from 'lucide-react'
import { authAPI } from '../../api/admin'
import { generateAndSendOtp, verifyOtp } from '../../api/otpservice'
import { projectsAPI } from '../../api/project'
import { tasksAPI } from '../../api/task'
import { useTheme } from '../../context/ThemeContext'

const defaultPreferences = {
  date_format: 'DD MMM YYYY',
  start_of_week: 'Monday',
  two_factor_auth: false,
  project_default_visibility: 'private',
  default_task_priority: 'medium',
  default_task_status: 'todo',
  default_member_role: 'member',
  work_notes: '',
  task_assigned: true,
  task_updated: true,
  task_completed: true,
  task_overdue: true,
  deadline_reminder: true,
  project_updates: true,
  mentions: true,
  in_app_notifications: true,
  notification_frequency: 'immediately',
  email_task_assignments: true,
  email_deadlines: true,
  email_project_invitations: true,
  weekly_summary: false,
}

const sections = [
  ['account', 'Account', CircleUserRound],
  ['security', 'Security & 2FA', ShieldCheck],
  ['projects', 'Project Defaults', FolderKanban],
  ['work', 'Task & Work Updates', SlidersHorizontal],
  ['team', 'Team & Members', UsersRound],
  ['notifications', 'Notifications & Automation', Bell],
  ['preferences', 'Preferences', CalendarDays],
]

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white'
const panelClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const readPreferences = () => {
  try {
    return { ...defaultPreferences, ...JSON.parse(localStorage.getItem('pms_settings') || '{}') }
  } catch {
    return defaultPreferences
  }
}

const unwrap = (response) => response?.data?.data || response?.data || []

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
    <span>{label}</span>
    <input aria-label={label} type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-indigo-600" />
  </label>
)

const Heading = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><Icon size={19} /></div>
    <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
  </div>
)

const Settings = ({ user, onUserUpdated }) => {
  const { theme, toggleTheme } = useTheme()
  const [active, setActive] = useState('account')
  const [profile, setProfile] = useState({ username: user?.username || '', full_name: user?.full_name || '' })
  const [preferences, setPreferences] = useState({ ...defaultPreferences, ...user?.preferences, ...readPreferences() })
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [projectUpdates, setProjectUpdates] = useState([])
  const [taskUpdates, setTaskUpdates] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [workText, setWorkText] = useState('')
  const [projectText, setProjectText] = useState('')
  const [progress, setProgress] = useState('')
  const [workStatus, setWorkStatus] = useState('')
  const [verificationOtp, setVerificationOtp] = useState('')
  const [deactivationOtp, setDeactivationOtp] = useState('')
  const [securityOtp, setSecurityOtp] = useState('')
  const [securityPurpose, setSecurityPurpose] = useState('')
  const [otpCooldowns, setOtpCooldowns] = useState({})
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedProject = projects.find((project) => String(project.id) === String(selectedProjectId))
  const selectedTask = tasks.find((task) => String(task.id) === String(selectedTaskId))
  const canManageProject = selectedProject?.my_role === 'owner' || selectedProject?.my_role === 'manager' || user?.role === 'manager'

  useEffect(() => {
    setProfile({ username: user?.username || '', full_name: user?.full_name || '' })
    setPreferences((current) => ({ ...defaultPreferences, ...readPreferences(), ...user?.preferences, ...current }))
  }, [user])

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const [projectResponse, taskResponse, usersResponse] = await Promise.all([projectsAPI.getAll(), tasksAPI.getAll(), authAPI.getUsers()])
        const projectList = unwrap(projectResponse)
        setProjects(Array.isArray(projectList) ? projectList : [])
        setSelectedProjectId((current) => current || (projectList?.[0]?.id ? String(projectList[0].id) : ''))
        const taskList = unwrap(taskResponse)
        setTasks(Array.isArray(taskList) ? taskList : [])
        setSelectedTaskId((current) => current || (taskList?.[0]?.id ? String(taskList[0].id) : ''))
        const userList = unwrap(usersResponse)
        setTeamMembers(Array.isArray(userList) ? userList : [])
      } catch (value) {
        setError(value?.message || 'Unable to load Settings data')
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) return
    projectsAPI.getById(selectedProjectId).then((response) => {
      const project = unwrap(response)
      setProjects((current) => current.map((item) => item.id === project.id ? project : item))
    }).catch(() => {})
    projectsAPI.getUpdates(selectedProjectId).then((response) => setProjectUpdates(unwrap(response))).catch(() => setProjectUpdates([]))
  }, [selectedProjectId])

  useEffect(() => {
    if (!selectedTaskId) return
    tasksAPI.getActivity(selectedTaskId).then((response) => setTaskUpdates(unwrap(response).filter((item) => item.action === 'work_update'))).catch(() => setTaskUpdates([]))
  }, [selectedTaskId])

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpCooldowns((current) => Object.fromEntries(
        Object.entries(current)
          .map(([purpose, seconds]) => [purpose, Math.max(0, seconds - 1)])
          .filter(([, seconds]) => seconds > 0)
      ))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const updatePreference = (key, value) => setPreferences((current) => ({ ...current, [key]: value }))

  const run = async (action, success) => {
    setMessage('')
    setError('')
    try { await action(); setMessage(success) } catch (value) { setError(value?.message || String(value) || 'Unable to update Settings') }
  }

  const savePreferences = () => run(async () => {
    const response = await authAPI.updatePreferences(preferences)
    const saved = unwrap(response)?.preferences || response?.data?.preferences || preferences
    localStorage.setItem('pms_settings', JSON.stringify({ ...preferences, ...saved }))
    onUserUpdated?.({ ...user, preferences: { ...preferences, ...saved }, two_factor_auth: saved.two_factor_auth })
  }, 'Preferences saved successfully.')

  const saveProfile = (event) => {
    event.preventDefault()
    run(async () => {
      const response = await authAPI.updateProfile(profile)
      const updatedUser = response?.data?.user || response?.user
      onUserUpdated?.({ ...user, ...(updatedUser || profile) })
    }, 'Profile saved successfully.')
  }

  const sendOtp = (purpose, success) => run(async () => {
    const email = user?.email || authAPI.getStoredUser()?.email
    if (!email) throw new Error('Signed-in account email is not available.')
    if (otpCooldowns[purpose] > 0) throw new Error(`Please wait ${otpCooldowns[purpose]} seconds before requesting another code.`)
    await generateAndSendOtp(email, purpose)
    setOtpCooldowns((current) => ({ ...current, [purpose]: 60 }))
  }, success)

  const verifyEmail = (event) => {
    event.preventDefault()
    run(async () => {
      const response = await authAPI.verifyEmail(user.email, verificationOtp)
      const updatedUser = response?.data?.user || response?.user || { ...user, email_verified: true }
      onUserUpdated?.({ ...user, ...updatedUser, email_verified: true })
      setVerificationOtp('')
    }, 'Email verified successfully.')
  }

  const deactivate = (event) => {
    event.preventDefault()
    run(async () => {
      await authAPI.deactivateAccount({ email: user.email, otp: deactivationOtp })
      authAPI.logout()
      window.location.href = '/'
    }, 'Account deactivated successfully.')
  }

  const startSecurityChange = (enabled) => {
    const purpose = enabled ? 'enable_2fa' : 'disable_2fa'
    setSecurityPurpose(purpose)
    setSecurityOtp('')
    sendOtp(purpose, `Security OTP sent to ${user.email}.`)
  }

  const confirmSecurityChange = (event) => {
    event.preventDefault()
    run(async () => {
      await verifyOtp(user.email, securityOtp, securityPurpose)
      const next = { ...preferences, two_factor_auth: securityPurpose === 'enable_2fa' }
      setPreferences(next)
      const response = await authAPI.updatePreferences(next)
      const saved = unwrap(response)?.preferences || next
      localStorage.setItem('pms_settings', JSON.stringify(saved))
      onUserUpdated?.({ ...user, preferences: saved, two_factor_auth: saved.two_factor_auth })
      setSecurityPurpose('')
      setSecurityOtp('')
    }, securityPurpose === 'enable_2fa' ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.')
  }

  const saveProject = (event) => {
    event.preventDefault()
    if (!selectedProject || !canManageProject) return
    run(async () => {
      const response = await projectsAPI.update(selectedProject.id, {
        summary: selectedProject.summary,
        description: selectedProject.description,
        visibility: selectedProject.visibility || preferences.project_default_visibility,
        priority: selectedProject.priority,
        status: selectedProject.status,
      })
      const updated = unwrap(response)
      setProjects((current) => current.map((item) => item.id === updated.id ? updated : item))
    }, 'Project settings saved.')
  }

  const addWorkUpdate = (event) => {
    event.preventDefault()
    if (!selectedTask) return
    run(async () => {
      await tasksAPI.addWorkUpdate(selectedTask.id, { update_text: workText, progress: progress === '' ? undefined : Number(progress), status: workStatus || undefined })
      const response = await tasksAPI.getActivity(selectedTask.id)
      setTaskUpdates(unwrap(response).filter((item) => item.action === 'work_update'))
      const refreshed = await tasksAPI.getById(selectedTask.id)
      setTasks((current) => current.map((item) => item.id === selectedTask.id ? unwrap(refreshed) : item))
      setWorkText('')
      setProgress('')
      setWorkStatus('')
    }, 'Work update added.')
  }

  const addProjectUpdate = (event) => {
    event.preventDefault()
    if (!selectedProjectId) {
      setError('Select a project before posting an update.')
      return
    }
    run(async () => {
      const response = await projectsAPI.addUpdate(selectedProjectId, projectText)
      setProjectUpdates((current) => [unwrap(response), ...current])
      setProjectText('')
    }, 'Project update posted.')
  }

  const teamStats = useMemo(() => teamMembers.map((member) => {
    const memberTasks = tasks.filter((task) => task.assigned_to === member.id)
    const activeTask = memberTasks.find((task) => !['done', 'completed'].includes(task.status))
    const completed = memberTasks.filter((task) => ['done', 'completed'].includes(task.status)).length
    const overdue = memberTasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && !['done', 'completed'].includes(task.status)).length
    return { member, tasks: memberTasks, activeTask, completed, overdue }
  }), [teamMembers, tasks])

  const formatDate = (value, withTime = false) => {
    if (!value) return 'Not set'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not set'
    if (preferences.date_format === 'YYYY-MM-DD') return withTime ? `${date.toISOString().slice(0, 10)} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : date.toISOString().slice(0, 10)
    if (preferences.date_format === 'DD/MM/YYYY') return withTime ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    if (preferences.date_format === 'MM/DD/YYYY') return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const selectClass = inputClass
  const renderAccount = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <form className={panelClass} onSubmit={saveProfile}>
        <Heading icon={CircleUserRound} title="Profile" description="Keep your workspace identity up to date." />
        <label className="mt-5 block text-xs font-medium text-slate-500">Full name<input className={inputClass} value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} /></label>
        <label className="mt-4 block text-xs font-medium text-slate-500">Username<input className={inputClass} value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} /></label>
        <label className="mt-4 block text-xs font-medium text-slate-500">Email<input className={`${inputClass} bg-slate-50 dark:bg-slate-900`} value={user?.email || ''} readOnly /></label>
        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><Save size={16} />Save profile</button>
      </form>
      <div className="space-y-5">
        <div className={panelClass}>
          <Heading icon={Mail} title="Email Verification" description="Verified email keeps OTP and invitations reliable." />
          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><div><p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.email}</p><p className="mt-1 text-xs text-slate-500">{user?.email_verified ? 'Email verified' : 'Email not verified'}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user?.email_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{user?.email_verified ? 'Verified' : 'Pending'}</span></div>
          {!user?.email_verified && <><button type="button" disabled={otpCooldowns.email_verification > 0} className="mt-4 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-white" onClick={() => sendOtp('email_verification', 'Verification OTP sent.')}>{otpCooldowns.email_verification > 0 ? `Resend in ${otpCooldowns.email_verification}s` : 'Send verification OTP'}</button><form onSubmit={verifyEmail}><input className={inputClass} placeholder="Enter verification OTP" value={verificationOtp} onChange={(event) => setVerificationOtp(event.target.value)} maxLength={6} required /><button className="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Verify email</button></form></>}
        </div>
        <form className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-slate-900" onSubmit={deactivate}><Heading icon={AlertTriangle} title="Deactivate Account" description="Temporarily deactivate your account with a one-time email code. Your data is preserved." /><button type="button" disabled={otpCooldowns.account_deactivation > 0} className="mt-5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => sendOtp('account_deactivation', 'Deactivation OTP sent.')}>{otpCooldowns.account_deactivation > 0 ? `Resend in ${otpCooldowns.account_deactivation}s` : 'Send deactivation OTP'}</button><input className={inputClass} placeholder="Enter deactivation OTP" value={deactivationOtp} onChange={(event) => setDeactivationOtp(event.target.value)} maxLength={6} required /><button className="mt-3 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">Deactivate account</button></form>
      </div>
    </div>
  )

  const renderSecurity = () =>
     <div className="grid gap-5 lg:grid-cols-2">
      <form className={panelClass} onSubmit={(event) => { event.preventDefault(); run(async () => { await authAPI.changePassword(currentPassword, newPassword); setCurrentPassword(''); setNewPassword('') }, 'Password changed successfully.') }}><Heading icon={KeyRound} title="Login security" description="Manage your password and account security." /><input className={inputClass} type="password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /><input className={inputClass} type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><LockKeyhole size={16} />Change password</button></form><div className={panelClass}><Heading icon={ShieldCheck} title="Two-Factor Authentication" description="Add an extra layer of security using your registered email." /><p className="mt-5 text-sm text-slate-600 dark:text-slate-300">Status: <strong>{preferences.two_factor_auth ? 'Enabled' : 'Disabled'}</strong></p>{!securityPurpose ? <button type="button" disabled={otpCooldowns[preferences.two_factor_auth ? 'disable_2fa' : 'enable_2fa'] > 0} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => startSecurityChange(!preferences.two_factor_auth)}>{otpCooldowns[preferences.two_factor_auth ? 'disable_2fa' : 'enable_2fa'] > 0 ? `Resend in ${otpCooldowns[preferences.two_factor_auth ? 'disable_2fa' : 'enable_2fa']}s` : preferences.two_factor_auth ? 'Disable 2FA' : 'Enable 2FA'}</button> : <form onSubmit={confirmSecurityChange}><input className={inputClass} placeholder="Enter security OTP" value={securityOtp} onChange={(event) => setSecurityOtp(event.target.value)} maxLength={6} required /><button className="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Confirm security change</button></form>}</div></div>

  const renderProjects = () => <div className={panelClass}><Heading icon={FolderKanban} title="Project Defaults" description="Select a real project to review and update its current settings." />{loading ? <p className="mt-6 text-sm text-slate-500">Loading projects...</p> : <><select className={selectClass} value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)}><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.summary}</option>)}</select>{selectedProject && <form onSubmit={saveProject} className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-medium text-slate-500">Project name<input className={inputClass} value={selectedProject.summary || ''} disabled={!canManageProject} onChange={(event) => setProjects((current) => current.map((item) => item.id === selectedProject.id ? { ...item, summary: event.target.value } : item))} /></label><label className="text-xs font-medium text-slate-500">Description<textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={selectedProject.description || ''} disabled={!canManageProject} onChange={(event) => setProjects((current) => current.map((item) => item.id === selectedProject.id ? { ...item, description: event.target.value } : item))} /></label><label className="text-xs font-medium text-slate-500">Visibility<select className={inputClass} value={selectedProject.visibility || 'private'} disabled={!canManageProject} onChange={(event) => setProjects((current) => current.map((item) => item.id === selectedProject.id ? { ...item, visibility: event.target.value } : item))}><option value="private">Private</option><option value="team">Team</option><option value="public">Public</option></select></label><label className="text-xs font-medium text-slate-500">Project priority<input className={inputClass} value={selectedProject.priority || 'medium'} disabled={!canManageProject} readOnly /></label><label className="text-xs font-medium text-slate-500">Project status<input className={inputClass} value={selectedProject.status || 'active'} disabled={!canManageProject} readOnly /></label><div className="md:col-span-2 flex items-center justify-between"><p className="text-xs text-slate-500">Your project role: {selectedProject.my_role || user?.role || 'member'}</p>{canManageProject && <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><Save size={16} />Save project settings</button>}</div></form>}</>}</div>

  const renderWork = () => <div className="grid gap-5 xl:grid-cols-[1fr_360px]"><div className={panelClass}><Heading icon={SlidersHorizontal} title="Task & Work Updates" description="Record actual work without inventing progress. Status and progress update only from your input." /><select className={selectClass} value={selectedTaskId} onChange={(event) => setSelectedTaskId(event.target.value)}><option value="">Select task</option>{tasks.map((task) => <option key={task.id} value={task.id}>{task.summary}</option>)}</select>{tasks.length === 0 && <p className="mt-3 text-sm text-slate-500">No tasks are available for your account yet.</p>}{selectedTask && <><div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950"><p><strong>Assigned to:</strong> {selectedTask.assignee?.full_name || selectedTask.assignee?.username || 'Unassigned'}</p><p><strong>Status:</strong> {selectedTask.status} <span className="ml-3"><strong>Progress:</strong> {selectedTask.progress || 0}%</span></p><p><strong>Deadline:</strong> {formatDate(selectedTask.due_date)}</p></div><form onSubmit={addWorkUpdate} className="mt-5"><textarea className="min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Enter what you are currently working on..." value={workText} onChange={(event) => setWorkText(event.target.value)} required /><div className="mt-3 grid gap-3 sm:grid-cols-2"><input className={inputClass} type="number" min="0" max="100" placeholder="Progress % (optional)" value={progress} onChange={(event) => setProgress(event.target.value)} /><select className={selectClass} value={workStatus} onChange={(event) => setWorkStatus(event.target.value)}><option value="">Keep status</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Completed</option></select></div><button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"><FileText size={16} />Add update</button></form></>}</div><div className={panelClass}><Heading icon={FileText} title="Task Notes & Activity" description="Latest work updates from the database." /><div className="mt-5 space-y-3">{taskUpdates.length === 0 ? <p className="text-sm text-slate-500">No work updates yet.</p> : taskUpdates.map((item) => <article key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><p className="text-sm text-slate-700 dark:text-slate-200">{item.details}</p><p className="mt-2 text-xs text-slate-500">{item.user?.full_name || item.user?.username} · {formatDate(item.created_at, true)}{item.progress !== null && ` · ${item.progress}%`}</p></article>)}</div></div><div className={`${panelClass} xl:col-span-2`}><Heading icon={FileText} title="Project Updates" description="Post a project-level note for the team." />{projects.length === 0 ? <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No project is available for this account. Create or join a project first, then return here to post an update.</p> : <><form onSubmit={addProjectUpdate} className="mt-4 flex flex-col gap-3 sm:flex-row"><textarea className="min-h-20 flex-1 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Write a project update..." value={projectText} onChange={(event) => setProjectText(event.target.value)} required /><button disabled={!selectedProjectId} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Post update</button></form><div className="mt-5 grid gap-3 md:grid-cols-2">{projectUpdates.map((item) => <article key={item.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><p className="text-sm text-slate-700 dark:text-slate-200">{item.content}</p><p className="mt-2 text-xs text-slate-500">{item.user?.full_name || item.user?.username} · {formatDate(item.created_at, true)}</p></article>)}</div></>}</div></div>

  const renderTeam = () => <div className={panelClass}><Heading icon={UsersRound} title="Team & Members" description="Live people, roles, assignments, workload and current work from the database." /><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{teamStats.map(({ member, tasks: memberTasks, activeTask, completed, overdue }) => <article key={member.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{(member.full_name || member.username || 'U').slice(0, 1).toUpperCase()}</div><div><p className="font-semibold text-slate-900 dark:text-white">{member.full_name || member.username}</p><p className="text-xs text-slate-500">{member.role}</p></div></div><p className="mt-4 text-sm text-slate-700 dark:text-slate-300">{activeTask ? `Working on ${activeTask.summary}` : 'No active task'}</p><div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><span><strong className="block text-base text-slate-900 dark:text-white">{memberTasks.length}</strong>Tasks</span><span><strong className="block text-base text-emerald-600">{completed}</strong>Done</span><span><strong className="block text-base text-red-600">{overdue}</strong>Overdue</span></div></article>)}</div></div>

  const renderNotifications = () => <div className={panelClass}><Heading icon={Bell} title="Notifications & Automation" description="Control notifications generated from real task and project events." /><div className="mt-5 grid gap-3 md:grid-cols-2">{[['task_assigned', 'Task assigned'], ['task_updated', 'Task updated'], ['task_completed', 'Task completed'], ['task_overdue', 'Overdue task'], ['deadline_reminder', 'Deadline reminder'], ['project_updates', 'Project updates'], ['mentions', 'Mentions'], ['in_app_notifications', 'In-app delivery'], ['email_task_assignments', 'Assignment emails'], ['email_deadlines', 'Deadline emails'], ['email_project_invitations', 'Invitation emails'], ['weekly_summary', 'Weekly summary']].map(([key, label]) => <Toggle key={key} label={label} checked={preferences[key]} onChange={(value) => updatePreference(key, value)} />)}</div><div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800"><p className="text-sm font-semibold text-slate-900 dark:text-white">Smart Preferences</p><p className="mt-1 text-sm text-slate-500">Updates are individual by default. Switch to a daily or weekly summary when your activity feed becomes noisy.</p><div className="mt-3 flex gap-3"><select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={preferences.notification_frequency} onChange={(event) => updatePreference('notification_frequency', event.target.value)}><option value="immediately">Individual updates</option><option value="daily">Daily summary</option><option value="weekly">Weekly summary</option></select><button type="button" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" onClick={savePreferences}><Save size={16} />Save notifications</button></div></div></div>

  const renderPreferences = () => <div className={panelClass}><Heading icon={CalendarDays} title="Preferences" description="These settings change how dates and calendar weeks are presented." /><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-medium text-slate-500">Theme<select className={selectClass} value={theme} onChange={(event) => toggleTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label><label className="text-xs font-medium text-slate-500">Date format<select className={selectClass} value={preferences.date_format} onChange={(event) => updatePreference('date_format', event.target.value)}><option value="DD MMM YYYY">DD MMM YYYY · 08 Sep 2026</option><option value="DD/MM/YYYY">DD/MM/YYYY · 08/09/2026</option><option value="MM/DD/YYYY">MM/DD/YYYY · 09/08/2026</option><option value="YYYY-MM-DD">YYYY-MM-DD · 2026-09-08</option></select></label><label className="text-xs font-medium text-slate-500">Start of week<select className={selectClass} value={preferences.start_of_week} onChange={(event) => updatePreference('start_of_week', event.target.value)}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}</select></label></div><button type="button" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" onClick={savePreferences}><Save size={16} />Save preferences</button><div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300"><CheckCircle2 className="mb-2 text-emerald-600" size={18} /><p>Saved dates remain unchanged in the database; only their presentation changes across Settings and Calendar.</p></div></div>

  const content = { account: renderAccount, security: renderSecurity, projects: renderProjects, work: renderWork, team: renderTeam, notifications: renderNotifications, preferences: renderPreferences }[active]
  const ActiveIcon = sections.find(([id]) => id === active)?.[2] || CircleUserRound

  return <section className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">Workspace control center</p><h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage real account, project, work, team, notification and calendar behavior.</p></div>{(message || error) && <p className={`rounded-xl px-4 py-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error || message}</p>}<div className="grid gap-6 lg:grid-cols-[250px_1fr]"><nav className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">{sections.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => { setActive(id); setMessage(''); setError('') }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${active === id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon size={18} />{label}</button>)}</nav><main><div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><ActiveIcon size={17} />{sections.find(([id]) => id === active)?.[1]}</div>{content()}</main></div></section>
}

export default Settings ;

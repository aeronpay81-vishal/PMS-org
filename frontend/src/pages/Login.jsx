import { useState } from 'react'
import {
  LayoutDashboard,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Menu,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom'
import { authAPI } from '../api/admin'
import EmailVerificationOtp from '../components/dashboard/EmailVerificationOtp'

// ================= Entrance / ambient animation styles =================
const AeroStyles = () => (
  <style>{`
    @keyframes aero-fade-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes aero-fade-in-right {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes aero-pop {
      0%   { opacity: 0; transform: scale(0.85) translateY(8px); }
      70%  { opacity: 1; transform: scale(1.03) translateY(0); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes aero-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-7px); }
    }
    @keyframes aero-pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.35); }
      70%  { box-shadow: 0 0 0 9px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    @keyframes aero-glow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
      50%      { box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.12); }
    }

    .aero-in {
      opacity: 0;
      animation: aero-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .aero-in-right {
      opacity: 0;
      animation: aero-fade-in-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .aero-pop {
      opacity: 0;
      animation: aero-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .aero-float {
      animation: aero-float 5s ease-in-out infinite;
    }
    .aero-pulse-icon {
      animation: aero-pulse-ring 2.4s ease-in-out infinite;
    }
    .aero-glow-card {
      animation: aero-glow 2.6s ease-in-out infinite;
    }
    .aero-otp-in {
      animation: aero-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      .aero-in, .aero-in-right, .aero-pop, .aero-otp-in {
        animation: none !important;
        opacity: 1 !important;
      }
      .aero-float, .aero-pulse-icon, .aero-glow-card {
        animation: none !important;
      }
    }
  `}</style>
)

const Login = ({ onLogin, showFooter = true }) => {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('manager') // Backend roles: 'manager' (organization) or 'user'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [isChoosingRole, setIsChoosingRole] = useState(false)
  const [tempCredentials, setTempCredentials] = useState(null)
  const [navOpen, setNavOpen] = useState(false)

  const isLogin = mode === 'login'

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (pwd.toLowerCase().includes('password')) {
      return 'Password cannot contain the word "password"'
    }
    return ''
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordError(validatePassword(newPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setErrorMessage('Email and password are required')
      return
    }

    if (!isLogin && !name) {
      setErrorMessage('Full name is required for signup')
      return
    }

    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      return
    }

    setErrorMessage('')
    setTempCredentials({
      email,
      password,
      name,
      role,
      isLogin,
    })
    setIsOtpVerifying(true)
  }

  const handleOtpVerified = async (otp) => {
    if (!tempCredentials.isLogin) {
      setIsOtpVerifying(false)
      setIsChoosingRole(true)
      return
    }

    await completeAuthentication(tempCredentials.role)
  }

  const completeAuthentication = async (selectedRole) => {
    setIsLoading(true)
    try {
      const response = tempCredentials.isLogin
        ? await authAPI.login(tempCredentials.email, tempCredentials.password)
        : await authAPI.register(
          tempCredentials.name.trim().toLowerCase().replace(/\s+/g, '_'),
          tempCredentials.email,
          tempCredentials.password,
          tempCredentials.name,
          selectedRole,
        )

      if (!response || response.success === false) {
        setErrorMessage(response?.message || 'Unable to process authentication')
        setIsOtpVerifying(false)
        setTempCredentials(null)
        return
      }

      const authData = response.data || response

      if (!authData?.access_token) {
        setErrorMessage('Signup or login failed: no valid token returned')
        setIsOtpVerifying(false)
        setTempCredentials(null)
        return
      }

      if (!tempCredentials.isLogin && authData.user?.role !== selectedRole) {
        authAPI.logout()
        setErrorMessage(
          selectedRole === 'manager'
            ? 'This account is not an organization account.'
            : 'This account is not a normal user account.',
        )
        setIsOtpVerifying(false)
        setTempCredentials(null)
        return
      }

      onLogin(authData)
      setEmail('')
      setPassword('')
      setName('')
      setShowPassword(false)
      setPasswordError('')
      setTempCredentials(null)
      setIsOtpVerifying(false)
      setIsChoosingRole(false)
    } catch (error) {
      const msg = typeof error === 'string'
        ? error
        : error?.message || 'Network error. Please try again.'
      setErrorMessage(msg)
      setIsOtpVerifying(false)
      if (tempCredentials.isLogin) setTempCredentials(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelected = async (selectedRole) => {
    setTempCredentials((current) => ({ ...current, role: selectedRole }))
    await completeAuthentication(selectedRole)
  }

  const handleOtpBack = () => {
    setIsOtpVerifying(false)
    setTempCredentials(null)
    setErrorMessage('')
  }

  const switchMode = () => {
    setMode(isLogin ? 'signup' : 'login')
    setEmail('')
    setPassword('')
    setName('')
    setShowPassword(false)
    setPasswordError('')
    setErrorMessage('')
    setIsOtpVerifying(false)
    setIsChoosingRole(false)
    setTempCredentials(null)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AeroStyles />

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-900">
              AeroPilot
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/features" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Features</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">How it works</Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Pricing</Link>
            <Link to="/faq" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">FAQ</Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={switchMode}
              className="flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.97]"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 md:hidden"
            aria-label="Toggle menu"
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {navOpen && (
          <div className="aero-in border-t border-slate-200 px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link to="/features" className="text-sm font-medium text-slate-600">Features</Link>
              <Link to="/how-it-works" className="text-sm font-medium text-slate-600">How it works</Link>
              <Link to="/pricing" className="text-sm font-medium text-slate-600">Pricing</Link>
              <Link to="/faq" className="text-sm font-medium text-slate-600">FAQ</Link>
              <button
                type="button"
                onClick={switchMode}
                className="mt-2 flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO (angled band, Jira-style split) ================= */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[680px] bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 sm:h-[720px]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)' }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-14 sm:px-8 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:pb-32">

          {/* ==================================================
              LEFT CONTENT — staggered entrance sequence
          ================================================== */}
          <div className="lg:pt-10">

            {/* Badge */}
            <div
              className="aero-in inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 shadow-sm shadow-indigo-100/60"
              style={{ animationDelay: '0ms' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-700">
                Built for project teams
              </span>
            </div>

            {/* Heading */}
            <h1
              className="aero-in mt-6 max-w-[540px] text-[38px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[46px]"
              style={{ animationDelay: '90ms' }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Project management for a smoother workflow.
              </span>
            </h1>

            {/* Description */}
            <p
              className="aero-in mt-5 max-w-[460px] text-sm leading-6 text-slate-600"
              style={{ animationDelay: '180ms' }}
            >
              Log in to pick up right where you left off — boards, deadlines,
              and reports, all in one focused workspace.
            </p>

            {/* Product preview mock */}
            <div
              className="aero-in relative mt-10 max-w-[440px]"
              style={{ animationDelay: '280ms' }}
            >
              <div className="aero-float overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_35px_80px_-40px_rgba(79,70,229,0.35)]">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[9px] text-slate-400">
                    app.aeropilot.io
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 p-4">
                  {[
                    { name: 'To do', items: ['Design review', 'Fix export bug'] },
                    { name: 'In progress', items: ['API rate limits'], glow: true },
                    { name: 'Done', items: ['Client deck', 'QA pass'] },
                  ].map((col) => (
                    <div key={col.name} className="rounded-lg bg-slate-50 p-2">
                      <p className="mb-1.5 text-[9px] font-medium text-slate-500">{col.name}</p>
                      <div className="space-y-1.5">
                        {col.items.map((item) => (
                          <div
                            key={item}
                            className={`rounded-md border border-slate-200 bg-white px-2 py-1.5 ${col.glow ? 'aero-glow-card' : ''}`}
                          >
                            <p className="text-[9px] leading-tight text-slate-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Single accent callout */}
              <div
                className="aero-pop absolute -bottom-5 -right-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_15px_35px_-15px_rgba(15,23,42,0.35)]"
                style={{ animationDelay: '650ms' }}
              >
                <span className="aero-pulse-icon flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-none text-slate-900">92%</p>
                  <p className="mt-0.5 text-[9px] text-slate-500">deadlines met on time</p>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div
              className="aero-in mt-12 flex items-center gap-3"
              style={{ animationDelay: '420ms' }}
            >
              <div className="flex -space-x-2">
                {['bg-indigo-300', 'bg-violet-300', 'bg-slate-300', 'bg-indigo-200'].map((c, i) => (
                  <span key={i} className={`h-7 w-7 rounded-full border-2 border-white ${c}`} />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Trusted by <span className="font-medium text-slate-700">11,000+ teams</span> to manage their work
              </p>
            </div>

            {/* Security note — inline, not boxed */}
            <div
              className="aero-in mt-4 flex items-center gap-2 text-xs text-slate-400"
              style={{ animationDelay: '500ms' }}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              Protected with modern encryption and secure authentication
            </div>

          </div>

          {/* ==================================================
              RIGHT LOGIN CARD
          ================================================== */}
          <div
            className="aero-in-right rounded-[28px] border border-slate-200 bg-white/95 p-7 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-9"
            style={{ animationDelay: '150ms' }}
          >

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-indigo-600">
                  Secure access
                </p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
                  {isLogin ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {isLogin
                    ? 'Sign in to manage your projects and stay on track.'
                    : 'Create your account and start organizing your work.'}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                <LayoutDashboard className="h-5 w-5" />
              </div>
            </div>

            {isChoosingRole && tempCredentials ? (
              <div key="role" className="aero-otp-in mt-8">
                <p className="text-sm font-medium text-slate-700">How will you use AeroPilot?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose your account type to finish creating your workspace.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRoleSelected('manager')}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Briefcase className="h-5 w-5" />
                    Organization
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRoleSelected('user')}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Users className="h-5 w-5" />
                    User
                  </button>
                </div>
                {errorMessage && (
                  <p className="aero-in mt-4 text-center text-xs text-red-500" role="alert">
                    {errorMessage}
                  </p>
                )}
                {isLoading && (
                  <p className="mt-4 text-center text-xs text-slate-500">Creating your account...</p>
                )}
              </div>
            ) : isOtpVerifying && tempCredentials ? (
              <div key="otp" className="aero-otp-in">
                <EmailVerificationOtp
                  email={tempCredentials.email}
                  purpose={tempCredentials.isLogin ? 'login' : 'signup'}
                  onVerified={handleOtpVerified}
                  onBack={handleOtpBack}
                />
              </div>
            ) : (
              <div key="form" className="aero-otp-in">
                <form onSubmit={handleSubmit} className="mt-8">

                  {!isLogin && (
                    <div className="aero-in mb-5" style={{ animationDelay: '40ms' }}>
                      <label className="mb-2 block text-[11px] font-medium text-slate-600">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          autoComplete="name"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.10]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <label className="mb-2 block text-[11px] font-medium text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.10]"
                    />
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-600">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        required
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className={`h-11 w-full rounded-xl border bg-white px-4 pr-11 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/[0.10] ${passwordError
                          ? 'border-red-400 focus:border-red-500'
                          : password.length > 0
                            ? 'border-green-400 focus:border-green-500'
                            : 'border-slate-200'
                          }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {passwordError && (
                      <p className="aero-in text-xs text-red-500 mt-1.5" style={{ animationDelay: '0ms' }}>
                        {passwordError}
                      </p>
                    )}

                    {errorMessage && (
                      <p className="aero-in text-xs text-red-500 mt-1.5" style={{ animationDelay: '0ms' }}>
                        {errorMessage}
                      </p>
                    )}

                    {!errorMessage && password.length > 0 && !passwordError && (
                      <p className="aero-in text-xs text-green-600 mt-1.5" style={{ animationDelay: '0ms' }}>
                        ✓ Password is valid
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-[13px] font-semibold text-white shadow-[0_8px_25px_-8px_rgba(99,102,241,0.5)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.6)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698.1 1.591.1 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    GitHub
                  </button>
                </div>

                <div className="mt-6 text-center text-xs text-slate-500">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  {' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    {isLogin ? 'Create Account' : 'Sign In'}
                  </button>
                </div>

                {!isLogin && (
                  <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">
                    By creating an account, you agree to our{' '}
                    <span className="text-indigo-600/80">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-indigo-600/80">Privacy Policy</span>.
                  </p>
                )}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      {showFooter && (
        <footer className="border-t border-slate-200 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                <LayoutDashboard className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                AeroPilot
              </span>
            </div>
            <p className="text-[9px] text-slate-400">
              © 2026 AeroPilot Project Management. All rights reserved.
            </p>
          </div>
        </footer>
      )}

    </div>
  )
}

export default Login
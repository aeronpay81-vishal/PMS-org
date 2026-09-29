import { useState } from 'react'
import {
  LayoutDashboard,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Users,
  Briefcase,
} from 'lucide-react';
import { authAPI } from '../api/admin'
import EmailVerificationOtp from '../components/dashboard/EmailVerificationOtp'
import Navbar from '../components/navigation/Navbar'
import { GoogleLogin } from '@react-oauth/google'

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true)
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential)
      
      if (!response || response.success === false) {
        setErrorMessage(response?.message || 'Google Login failed')
        return
      }

      const authData = response.data || response
      if (!authData?.access_token) {
        setErrorMessage('Google Login failed: no valid token returned')
        return
      }

      onLogin(authData)
    } catch (error) {
      // Extract the actual message from backend response or fallback
      const msg =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message ||
            error?.message ||
            'Google Login failed. Please try again.'
        
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AeroStyles />

      <Navbar activePage="login" variant="auth" isLogin={isLogin} onSwitchMode={switchMode} />

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
          <div className="lg:pt-4">

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
            <h4
              className="aero-in mt-2 max-w-[540px] text-[20px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-[36px]"
              style={{ animationDelay: '90ms' }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Project management for a smoother workflow.
              </span>
            </h4>

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
              <video
                autoPlay
                loop
                muted
                playsInline
                src="https://dapulse-res.cloudinary.com/video/upload/q_auto:best,f_auto,cs_copy/remote_mondaycom_static/video/video-library/features/communication.mp4"
                alt="Project management board preview"
                className="aero-float block h-auto w-full "
              />
            </div>

            {/* Trust row */}
            <div
              className="aero-in mt-4 flex items-center gap-3"
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

                <div className="flex justify-center mt-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setErrorMessage('Google Login Failed. Please try again.');
                    }}
                  />
                </div>

                {errorMessage && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-600" role="alert">
                    {errorMessage}
                  </div>
                )}

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
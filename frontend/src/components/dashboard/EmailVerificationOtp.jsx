import { useEffect, useRef, useState } from 'react'
import { Mail, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'
import { generateAndSendOtp, verifyOtp as verifyOtpLocal } from '../../api/otpservice'
const OTP_LENGTH = 6
const RESEND_SECONDS = 30

const EmailOtpVerification = ({ email, purpose = 'login', onVerified, onBack }) => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS)

  const inputRefs = useRef([])
  const hasSentInitialOtp = useRef(false)

  // Component mount hote hi pehla OTP auto-send ho jaye
  // (ref guard: React StrictMode dev me useEffect do baar chalta hai,
  // isse OTP do baar send hone se bach jaata hai)
  useEffect(() => {
    if (hasSentInitialOtp.current) return
    hasSentInitialOtp.current = true
    sendOtp(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const sendOtp = async (isInitial = false) => {
    setError('')
    setInfoMessage('')
    setIsSending(true)
    try {
      const response = await generateAndSendOtp(email, purpose)
      if (!response || response.success === false) {
        setError(response?.message || 'Otp We Can Not Send, Please Try Again')
        return
      }
      setInfoMessage(
        isInitial
          ? `We Have Send OTP to ${email} `
          : 'Resend OTP successfully. Please check your inbox.'
      )
      setResendTimer(RESEND_SECONDS)
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      // authAPI string ya Error dono throw kar sakta hai, dono handle karo
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Otp We Can Not Send, Please Try Again'
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    const next = [...digits]
    next[index] = clean[clean.length - 1]
    setDigits(next)

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => (next[i] = d))
    setDigits(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const otpValue = digits.join('')
  const isComplete = otpValue.length === OTP_LENGTH

  const handleVerify = async (e) => {
    e?.preventDefault()
    if (!isComplete) {
      setError('Please 6-digit code pura daalein')
      return
    }

    setError('')
    setIsVerifying(true)
    try {
      const response = await verifyOtpLocal(email, otpValue, purpose)
      if (!response || response.success === false) {
        setError(response?.message || 'Invalid or expired code')
        return
      }
      onVerified(otpValue)
    } catch (err) {
      setError(
        typeof err === 'string'
          ? err
          : err?.message || 'Invalid or expired code'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
        <ShieldCheck className="h-5 w-5" />
      </div>

      <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-slate-900">
        Verify your email
      </h2>

      <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
        <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>
          We sent a {OTP_LENGTH}-digit code to{' '}
          <span className="font-medium text-slate-700">{email}</span>
        </span>
      </p>

      <form onSubmit={handleVerify} className="mt-7">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                h-12
                w-full
                rounded-xl
                border
                bg-white
                text-center
                text-lg
                font-semibold
                text-slate-900
                outline-none
                transition
                hover:border-slate-300
                focus:ring-4
                focus:ring-indigo-500/[0.10]
                ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}
              `}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        {!error && infoMessage && <p className="mt-3 text-xs text-green-600">{infoMessage}</p>}

        <button
          type="submit"
          disabled={isVerifying || !isComplete}
          className="
            mt-6
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-indigo-500
            via-violet-500
            to-purple-500
            text-[13px]
            font-semibold
            text-white
            shadow-[0_8px_25px_-8px_rgba(99,102,241,0.5)]
            transition-all
            duration-200
            hover:-translate-y-[1px]
            hover:shadow-[0_12px_30px_-8px_rgba(99,102,241,0.6)]
            active:translate-y-0
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-500">
        Didn&apos;t get the code?{' '}
        <button
          type="button"
          onClick={() => sendOtp(false)}
          disabled={isSending || resendTimer > 0}
          className="font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : isSending ? 'Sending...' : 'Resend code'}
        </button>
      </div>
    </div>
  )
}

export default EmailOtpVerification
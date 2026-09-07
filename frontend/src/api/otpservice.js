
import emailjs from '@emailjs/browser'

const OTP_LENGTH = 6
const OTP_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes — matches "valid for 15 minutes" in your template
const MAX_ATTEMPTS = 5

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// email -> { otp, purpose, expiresAt, attempts }
const otpStore = new Map()

const generateOtp = () => {
  let otp = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10)
  }
  return otp
}

const storeKey = (email, purpose) => `${email.toLowerCase()}::${purpose}`

const formatExpiryTime = (expiresAt) => {
  return new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Naya OTP generate karke EmailJS ke through real email bhejta hai.
 * Returns: { success: true, message } ya { success: false, message }
 */
export const generateAndSendOtp = async (email, purpose = 'login') => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return {
      success: false,
      message: 'EmailJS is not configured — check your .env file',
    }
  }

  const otp = generateOtp()
  const key = storeKey(email, purpose)
  const expiresAt = Date.now() + OTP_EXPIRY_MS

  otpStore.set(key, {
    otp,
    purpose,
    expiresAt,
    attempts: 0,
  })

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        email,                              // -> {{email}}   (To Email field)
        passcode: otp,                      // -> {{passcode}} in body
        time: formatExpiryTime(expiresAt),  // -> {{time}} in body
      },
      { publicKey: PUBLIC_KEY }
    )
  } catch (err) {
    otpStore.delete(key)
    return {
      success: false,
      message: err?.text || err?.message || 'Failed to send email, please try again',
    }
  }

  return {
    success: true,
    message: `Code sent to ${email}`,
  }
}

/**
 * OTP verify karta hai (browser memory ke against).
 * Returns: { success: true } ya { success: false, message }
 */
export const verifyOtp = async (email, otp, purpose = 'login') => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const key = storeKey(email, purpose)
  const entry = otpStore.get(key)

  if (!entry) {
    return { success: false, message: 'No OTP found, please request a new code' }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key)
    return { success: false, message: 'Code expired, please request a new one' }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key)
    return { success: false, message: 'Too many attempts, please request a new code' }
  }

  entry.attempts += 1

  if (entry.otp !== otp) {
    return { success: false, message: 'Invalid code, please try again' }
  }

  // Verified — entry hata do taaki reuse na ho
  otpStore.delete(key)
  return { success: true, message: 'Verified' }
}

import emailjs from '@emailjs/browser'

const OTP_LENGTH = 6
const OTP_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes — matches "valid for 15 minutes" in your template
const MAX_ATTEMPTS = 5

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// Retain local store for compatibility (will be unused after backend migration)
const otpStore = new Map()

/**
 * Generate OTP locally (now unused; kept for fallback).
 */
const generateOtp = () => {
  let otp = ''
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10)
  }
  return otp
}

/**
 * Send OTP via backend Flask‑Mail endpoint.
 * Returns: { success: true, message } or { success: false, message }
 */
export const generateAndSendOtp = async (email, purpose = 'login') => {
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    })
    return await res.json()
  } catch (err) {
    return { success: false, message: err.message || 'Network error' }
  }
}

/**
 * Verify OTP via backend endpoint.
 */
export const verifyOtp = async (email, otp, purpose = 'login') => {
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose })
    })
    return await res.json()
  } catch (err) {
    return { success: false, message: err.message || 'Network error' }
  }
}
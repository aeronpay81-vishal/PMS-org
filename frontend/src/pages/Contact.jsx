
import { useState } from 'react'
import { contactAPI } from '../api/contact'
import Navbar from '../components/navigation/Navbar'
import Footer from './Footer'
import {
    Mail,
    MessageCircle,
    MapPin,
    Clock,
    CheckCircle2,
    Send,
    Building2,
    LifeBuoy,
    ArrowUpRight,
    Sparkles,
    ShieldCheck,
} from 'lucide-react'

const CHANNELS = [
    {
        icon: Mail,
        label: 'Email us',
        value: 'aeronpay81@gmail.com',
        hint: 'We reply within 4 hours',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'group-hover:border-indigo-200',
    },
    {
        icon: MessageCircle,
        label: 'Live chat',
        value: 'Mon–Fri, 9 am–6 pm',
        hint: 'Average wait: 2 min',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'group-hover:border-violet-200',
    },
    {
        icon: LifeBuoy,
        label: 'Help center',
        value: 'Browse 200+ articles',
        hint: 'Self-serve answers',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'group-hover:border-emerald-200',
    },
]

const TOPICS = [
    'Sales inquiry',
    'Technical support',
    'Billing question',
    'Partnership',
    
    'Something else',
]

const Contact = ({ showChrome = true }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        topic: 'Sales inquiry',
        message: '',
    })

    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [deliveryMessage, setDeliveryMessage] = useState('')

    const handleChange = (field) => (e) => {
        setForm((current) => ({
            ...current,
            [field]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setSubmitting(true)
        setError('')
        setDeliveryMessage('')

        try {
            const response = await contactAPI.submit(form)

            setDeliveryMessage(
                response?.message || 'Your message was received successfully.'
            )

            setSubmitted(true)
        } catch (value) {
            setError(
                value?.message ||
                    String(value) ||
                    'Unable to send your message.'
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased">
            {showChrome && <Navbar activePage="contact" />}

            {/* =====================================================
                HERO
            ===================================================== */}
            <section className="relative overflow-hidden border-b border-slate-100">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-[-220px] h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-indigo-100/50 blur-[100px]" />

                    <div className="absolute left-[8%] top-[35%] h-32 w-32 rounded-full bg-violet-100/40 blur-3xl" />

                    <div className="absolute right-[8%] top-[30%] h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />
                </div>

                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.3]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                        backgroundSize: '72px 72px',
                        maskImage:
                            'linear-gradient(to bottom, black, transparent 75%)',
                    }}
                />

                <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pb-24 sm:pt-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-600 shadow-sm backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" />
                            We're here to help
                        </div>

                        <h1 className="text-[32px] font-semibold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-[58px] lg:text-[48px]">
                            Let's talk.
                            <br />
                            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 bg-clip-text text-transparent">
                                We're listening.
                            </span>
                        </h1>

                       
                        
                    </div>
                </div>
            </section>

            {/* =====================================================
                CHANNEL CARDS
            ===================================================== */}
            <section className="relative mx-auto max-w-6xl px-6">
                <div className="-mt-8 grid gap-4 sm:grid-cols-3">
                    {CHANNELS.map((channel) => {
                        const Icon = channel.icon

                        return (
                            <div
                                key={channel.label}
                                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_-22px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-20px_rgba(15,23,42,0.18)] ${channel.border}`}
                            >
                                <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-slate-50 transition-transform duration-300 group-hover:scale-150" />

                                <div className="relative">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${channel.bg}`}
                                    >
                                        <Icon
                                            className={`h-[17px] w-[17px] ${channel.color}`}
                                        />
                                    </div>

                                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        {channel.label}
                                    </p>

                                    <div className="mt-1.5 flex items-center justify-between gap-3">
                                        <p className="text-[14px] font-semibold text-slate-900">
                                            {channel.value}
                                        </p>

                                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                    </div>

                                    <p className="mt-1 text-[12px] text-slate-400">
                                        {channel.hint}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}
            <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
                <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">

                    {/* =================================================
                        LEFT — PREMIUM FORM
                    ================================================= */}
                    <div>
                        <div className="mb-7">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                                Get in touch
                            </p>

                            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[36px]">
                                Tell us what you need.
                            </h2>

                            <p className="mt-3 max-w-lg text-[14px] leading-6 text-slate-500">
                                Share a few details and our team will get back
                                to you with the right information.
                            </p>
                        </div>

                        {/* FORM BOX */}
                        <div className="relative overflow-hidden rounded-[28px]  border border-slate-200 bg-white shadow-[0_25px_70px_-35px_rgba(15,23,42,0.25)]">

                            {/* Top accent */}
                            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />

                            <div className="p-6 sm:p-8 lg:p-9">

                                {/* Form header */}
                                <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                                    <div>
                                        <p className="text-[15px] font-semibold text-slate-900">
                                            Send us a message
                                        </p>

                                        <p className="mt-1 text-[12px] text-slate-400">
                                            We'll respond as soon as possible.
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                </div>

                                {submitted ? (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <p className="text-[16px] font-semibold text-emerald-950">
                                                    Message sent successfully
                                                </p>

                                                <p className="mt-2 text-[13px] leading-6 text-emerald-800/75">
                                                    Thanks,{' '}
                                                    {form.name || 'friend'}.
                                                    We'll get back to you at{' '}
                                                    <span className="font-semibold text-emerald-900">
                                                        {form.email ||
                                                            'your email'}
                                                    </span>
                                                    .
                                                </p>

                                                <p className="mt-1 text-[12px] text-emerald-700/70">
                                                    {deliveryMessage ||
                                                        'We will get back to you within the next 4 hours.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-3"
                                    >
                                        {error && (
                                            <div
                                                role="alert"
                                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
                                            >
                                                {error}
                                            </div>
                                        )}

                                        {/* Name + Email */}
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                                    Full name
                                                </label>

                                                <input
                                                    type="text"
                                                    required
                                                    value={form.name}
                                                    onChange={handleChange(
                                                        'name'
                                                    )}
                                                    placeholder="Jane Cooper"
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[13.5px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                                    Work email
                                                </label>

                                                <input
                                                    type="email"
                                                    required
                                                    value={form.email}
                                                    onChange={handleChange(
                                                        'email'
                                                    )}
                                                    placeholder="jane@company.com"
                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[13.5px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                />
                                            </div>
                                        </div>

                                        {/* Company */}
                                        <div>
                                            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                                Company{' '}
                                                <span className="font-normal normal-case tracking-normal text-slate-400">
                                                    Optional
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={form.company}
                                                onChange={handleChange(
                                                    'company'
                                                )}
                                                placeholder="Acme Inc."
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[13.5px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>

                                        {/* Topic */}
                                        <div>
                                            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                                What can we help with?
                                            </label>

                                            <div className="flex flex-wrap gap-2">
                                                {TOPICS.map((topic) => {
                                                    const isActive =
                                                        form.topic === topic

                                                    return (
                                                        <button
                                                            key={topic}
                                                            type="button"
                                                            onClick={() =>
                                                                setForm(
                                                                    (current) => ({
                                                                        ...current,
                                                                        topic,
                                                                    })
                                                                )
                                                            }
                                                            className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-medium transition-all ${
                                                                isActive
                                                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                                                            }`}
                                                        >
                                                            {topic}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600">
                                                    Message
                                                </label>

                                                <span className="text-[10px] text-slate-400">
                                                    Required
                                                </span>
                                            </div>

                                            <textarea
                                                required
                                                rows={6}
                                                value={form.message}
                                                onChange={handleChange(
                                                    'message'
                                                )}
                                                placeholder="Tell us a little about what you need..."
                                                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-[13.5px] leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </div>

                                        {/* Bottom */}
                                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />

                                                <p className="text-[11px] text-slate-400">
                                                    Your information stays
                                                    private.
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-950 px-6 text-[13px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {submitting
                                                    ? 'Sending...'
                                                    : 'Send message'}

                                                <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}
                    <aside className="lg:pt-12">
                        {/* Office */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Contact information
                                </p>

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                            </div>

                            <div className="mt-7 space-y-6">
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                                        <Building2 className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-900">
                                            AeroPilot HQ
                                        </p>

                                        <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                            340 Pine Street, Suite 1200
                                            <br />
                                            San Francisco, CA 94104
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                                        <MapPin className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-900">
                                            Remote-first
                                        </p>

                                        <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                            Team across 6 countries
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                                        <Clock className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-semibold text-slate-900">
                                            Support hours
                                        </p>

                                        <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                            Mon–Fri · 9am–6pm PT
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Response */}
                        <div className="relative mt-5 overflow-hidden rounded-3xl p-6 text-white border border-slate-200 ">
                            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" />

                            <div className="relative">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                    Response time
                                </p>

                                <div className="mt-4 flex items-end gap-2">
                                    <span className="text-[42px] font-semibold leading-none text-indigo-400 tracking-[-0.04em]">
                                        4h
                                    </span>

                                    <span className="mb-1 text-[12px] text-slate-500">
                                        average
                                    </span>
                                </div>

                                <p className="mt-4 text-[12px] leading-5 text-slate-400">
                                    We'll route your request to the right team
                                    so you can get a useful response without
                                    unnecessary back-and-forth.
                                </p>

                                <div className="mt-6 flex items-center gap-2 text-[11px] font-medium  text-black">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Support team available
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <LifeBuoy className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-[13px] font-semibold text-slate-900">
                                        Need quick answers?
                                    </p>

                                    <p className="mt-1 text-[12px] leading-5 text-slate-500">
                                        Check our help resources for common
                                        questions and product guidance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {showChrome && <Footer />}
        </div>
    )
}

export default Contact

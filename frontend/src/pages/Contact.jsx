import { useState } from 'react'
import { contactAPI } from '../api/contact'
import Navbar from '../components/navigation/Navbar'
import Footer from './Footer'
import {
    LayoutDashboard,
    Menu,
    X,
    ArrowUpRight,
    Mail,
    MessageCircle,
    MapPin,
    Clock,
    CheckCircle2,
    Send,
    Building2,
    LifeBuoy,
    Sparkles,
    Link as LinkIcon,
    Code2,
    Briefcase,
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────

const CHANNELS = [
    {
        icon: Mail,
        label: 'Email us',
        value: 'aeronpay81@gmail.com',
        hint: 'We reply within 4 hours',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
    },
    {
        icon: MessageCircle,
        label: 'Live chat',
        value: 'Mon–Fri, 9 am–6 pm',
        hint: 'Average wait: 2 min',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
    },
    {
        icon: LifeBuoy,
        label: 'Help center',
        value: 'Browse 200+ articles',
        hint: 'Self-serve answers',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
]

const TOPICS = [
    'Sales inquiry',
    'Technical support',
    'Billing question',
    'Partnership',
    'Press & media',
    'Something else',
]

// ── Main ──────────────────────────────────────────────────────────────

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

    const handleChange = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        setDeliveryMessage('')
        try {
            const response = await contactAPI.submit(form)
            setDeliveryMessage(response.message || 'Your message was received.')
            setSubmitted(true)
        } catch (value) {
            setError(value?.message || String(value) || 'Unable to send your message.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased">
            {showChrome && <Navbar activePage="contact" />}

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-100">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full">
                    <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-50/60 via-violet-50/30 to-transparent blur-3xl" />
                </div>

                <div className="mx-auto max-w-6xl px-6 pb-10 pt-2 sm:pt-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-[46px]">
                            Let's talk.
                            <br />
                            <span className="text-indigo-400">We're listening.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-slate-500">
                            Questions about pricing, features, or getting your team set up?
                            Send us a message and a real human will get back to you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Channels */}
            <section className="mx-auto max-w-6xl px-6 pt-16">
                <div className="grid gap-4 sm:grid-cols-3">
                    {CHANNELS.map((ch) => {
                        const Icon = ch.icon
                        return (
                            <div
                                key={ch.label}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]"
                            >
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${ch.bg}`}
                                >
                                    <Icon className={`h-4 w-4 ${ch.color}`} />
                                </div>
                                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    {ch.label}
                                </p>
                                <p className="mt-1.5 text-[15px] font-medium text-slate-900">
                                    {ch.value}
                                </p>
                                <p className="mt-1 text-[12px] text-slate-400">{ch.hint}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Form + side */}
            <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                    {/* Form */}
                    <div>
                        <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                            Send us a message
                        </h2>
                        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-slate-500">
                            Fill in the form below and we'll route your message to the right
                            person on our team.
                        </p>

                        {submitted ? (
                            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-semibold text-emerald-900">
                                        Message sent successfully
                                    </p>
                                    <p className="mt-1 text-[13px] leading-6 text-emerald-800/80">
                                        Thanks, {form.name || 'friend'}. We'll get back to you at{' '}
                                        <span className="font-medium">
                                            {form.email || 'your email'}
                                        </span>{' '}
                                        {deliveryMessage || 'We will get back to you within the next 4 hours.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                {error && (
                                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                                        {error}
                                    </p>
                                )}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-[12px] font-medium text-slate-700">
                                            Full name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={handleChange('name')}
                                            placeholder="Jane Cooper"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[12px] font-medium text-slate-700">
                                            Work email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange('email')}
                                            placeholder="jane@company.com"
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[12px] font-medium text-slate-700">
                                        Company{' '}
                                        <span className="font-normal text-slate-400">
                                            (optional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={handleChange('company')}
                                        placeholder="Acme Inc."
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13.5px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-[12px] font-medium text-slate-700">
                                        What's this about?
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TOPICS.map((topic) => {
                                            const isActive = form.topic === topic
                                            return (
                                                <button
                                                    key={topic}
                                                    type="button"
                                                    onClick={() =>
                                                        setForm((f) => ({ ...f, topic }))
                                                    }
                                                    className={`h-8 rounded-full px-3.5 text-[12.5px] font-medium transition-all ${isActive
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {topic}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[12px] font-medium text-slate-700">
                                        Message
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={handleChange('message')}
                                        placeholder="Tell us a little about what you need…"
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[13.5px] leading-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:shadow-[0_0_0_4px_rgba(15,23,42,0.06)]"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] text-slate-400">
                                        We'll never share your info.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="group flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? 'Sending...' : 'Send message'}
                                        <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Side info */}
                    <div className="lg:pt-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Office
                            </p>
                            <div className="mt-4 flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                    <Building2 className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-900">
                                        AeroPilot HQ
                                    </p>
                                    <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                                        340 Pine Street, Suite 1200
                                        <br />
                                        San Francisco, CA 94104
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                    <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-900">
                                        Remote-first
                                    </p>
                                    <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                                        Team across 6 countries
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                    <Clock className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-900">
                                        Support hours
                                    </p>
                                    <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                                        Mon–Fri · 9am–6pm PT
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                Response time
                            </p>
                            <div className="mt-3 flex items-end gap-2">
                                <span className="text-[32px] font-semibold leading-none tracking-tight text-slate-900">
                                    4h
                                </span>
                                <span className="mb-0.5 text-[12px] text-slate-400">
                                    average
                                </span>
                            </div>
                            <p className="mt-3 text-[12px] leading-5 text-slate-500">
                                Enterprise customers get priority routing and a dedicated
                                Slack channel.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            {showChrome && <Footer />}
        </div>
    )
}

export default Contact
import { useState } from 'react'
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

// ── Navbar ────────────────────────────────────────────────────────────

const Navbar = () => {
    const [navOpen, setNavOpen] = useState(false)
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                        <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                        AeroPilot
                    </span>
                </div>
                <nav className="hidden items-center gap-1 md:flex">
                    {['Features', 'How it works', 'Pricing', 'FAQ', 'Contact'].map(
                        (item) => (
                            <a
                                key={item}
                                href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${item === 'Contact'
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {item}
                            </a>
                        )
                    )}
                </nav>
                <div className="hidden items-center gap-4 md:flex">
                    <a
                        href="/login"
                        className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                        Sign in
                    </a>
                    <a
                        href="/signup"
                        className="group flex h-8 items-center gap-1 rounded-full bg-slate-900 px-4 text-[13px] font-medium text-white transition-all hover:bg-slate-800 active:scale-95"
                    >
                        Get started
                        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                </div>
                <button
                    type="button"
                    onClick={() => setNavOpen((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
                >
                    {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
            </div>
            {navOpen && (
                <div className="border-t border-slate-200 bg-white px-5 py-3 md:hidden">
                    <div className="flex flex-col gap-1">
                        {['Features', 'How it works', 'Pricing', 'FAQ', 'Contact'].map(
                            (item) => (
                                <a
                                    key={item}
                                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    {item}
                                </a>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

// ── Footer ────────────────────────────────────────────────────────────

const FOOTER_COLUMNS = [
    {
        title: 'Product',
        links: ['Features', 'How it works', 'Pricing', 'Changelog', 'Roadmap'],
    },
    {
        title: 'Company',
        links: ['About', 'Blog', 'Careers', 'Customers', 'Contact'],
    },
    {
        title: 'Resources',
        links: [
            'Documentation',
            'Help center',
            'API reference',
            'Status',
            'Security',
        ],
    },
]

// Using only safe, existing lucide-react icons for socials
const SOCIALS = [
    { label: 'Twitter', icon: Sparkles },
    { label: 'GitHub', icon: Code2 },
    { label: 'LinkedIn', icon: Briefcase },
]

const LEGAL_LINKS = ['Privacy', 'Terms', 'Cookies']

const Footer = () => (
    <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div>
                    <a href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                            <LayoutDashboard className="h-4 w-4" />
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                            AeroPilot
                        </span>
                    </a>
                    <p className="mt-4 max-w-xs text-[13px] leading-6 text-slate-500">
                        Project management that organizes itself, so your team can focus on
                        the work that matters.
                    </p>
                    <div className="mt-6 flex items-center gap-2">
                        {SOCIALS.map((s) => {
                            const Icon = s.icon
                            return (
                                <a
                                    key={s.label}
                                    href="#"
                                    aria-label={s.label}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            )
                        })}
                    </div>
                </div>
                {FOOTER_COLUMNS.map((col) => (
                    <div key={col.title}>
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {col.title}
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {col.links.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="text-[13px] text-slate-600 transition-colors hover:text-slate-900"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
                <p className="text-[12px] text-slate-400">
                    © 2026 AeroPilot Project Management. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    {LEGAL_LINKS.map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-[12px] text-slate-400 transition-colors hover:text-slate-700"
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </footer>
)

// ── Data ──────────────────────────────────────────────────────────────

const CHANNELS = [
    {
        icon: Mail,
        label: 'Email us',
        value: 'hello@aeropilot.com',
        hint: 'We reply within 4 hours',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
    },
    {
        icon: MessageCircle,
        label: 'Live chat',
        value: 'Mon–Fri, 9am–6pm',
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

    const handleChange = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased">
            {showChrome && <Navbar />}

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-100">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full">
                    <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-50/60 via-violet-50/30 to-transparent blur-3xl" />
                </div>

                <div className="mx-auto max-w-6xl px-6 pb-10 pt-2 sm:pt-4">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                            {/* <span className="text-[11px] font-medium tracking-wide text-slate-600">
                                All systems operational
                            </span> */}
                        

                        <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-[46px]">
                            Let's talk.
                            <br />
                            <span className="text-slate-400">We're listening.</span>
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
                                        within the next 4 hours.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                                                        ? 'bg-slate-900 text-white shadow-sm'
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
                                        className="group flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
                                    >
                                        Send message
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
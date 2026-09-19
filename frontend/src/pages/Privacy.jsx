
import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  Database,
  Share2,
  Lock,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  Clock,
  ListChecks,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowDown,
} from 'lucide-react'
import Navbar from '../components/navigation/Navbar.jsx'
import Footer from './Footer.jsx'
const COMPANY_NAME = 'AeroPilot'
const SUPPORT_EMAIL = 'support@aeropilot.com'
const LAST_UPDATED = 'September 17, 2026'

const SECTIONS = [
  {
    id: 'collect',
    icon: Database,
    title: 'Information We Collect',
    body: (
      <>
        <p className="mb-5">We collect information in the following ways:</p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-slate-900">
              Account information
            </span>{' '}
            — your name, email address, password (stored in encrypted/hashed
            form), and role (organization or user) when you sign up.
          </li>

          <li>
            <span className="font-semibold text-slate-900">
              Google sign-in data
            </span>{' '}
            — if you sign in with Google, we receive your name, email address,
            and profile information as permitted by your Google account
            settings. We never receive your Google password.
          </li>

          <li>
            <span className="font-semibold text-slate-900">
              Usage data
            </span>{' '}
            — boards, tasks, deadlines, comments, and reports you create while
            using the platform.
          </li>

          <li>
            <span className="font-semibold text-slate-900">
              Device &amp; log data
            </span>{' '}
            — IP address, browser type, device information, and timestamps
            collected automatically for security and analytics.
          </li>

          <li>
            <span className="font-semibold text-slate-900">Cookies</span> —
            small files used to keep you signed in and remember your
            preferences.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: 'use',
    icon: ListChecks,
    title: 'How We Use Your Information',
    body: (
      <ul className="list-disc space-y-3 pl-5">
        <li>To create and manage your account.</li>
        <li>
          To operate core features such as boards, tasks, and reports.
        </li>
        <li>
          To send account-related emails, including OTP verification codes.
        </li>
        <li>
          To detect, prevent, and address fraud, abuse, or security issues.
        </li>
        <li>To improve and personalize our product experience.</li>
        <li>To comply with legal obligations.</li>
      </ul>
    ),
  },

  {
    id: 'sharing',
    icon: Share2,
    title: 'Sharing of Information',
    body: (
      <>
        <p className="mb-5">
          We do not sell your personal information. We may share it only:
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            With service providers who help us operate the platform (e.g.
            hosting, email delivery), under confidentiality obligations.
          </li>

          <li>
            With Google, when you choose to sign in with Google, solely to
            authenticate your account.
          </li>

          <li>
            When required by law, regulation, or valid legal process.
          </li>

          <li>
            In connection with a merger, acquisition, or sale of assets, with
            continued protection of your data.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: 'retention',
    icon: Clock,
    title: 'Data Retention',
    body: (
      <p>
        We retain your information for as long as your account is active or as
        needed to provide our services. You may request deletion of your
        account and associated data at any time by contacting us, subject to
        any legal retention requirements.
      </p>
    ),
  },

  {
    id: 'security',
    icon: Lock,
    title: 'Data Security',
    body: (
      <p>
        We use industry-standard measures, including encryption in transit and
        secure password hashing, to protect your information. No method of
        transmission or storage is completely secure, and we cannot guarantee
        absolute security.
      </p>
    ),
  },

  {
    id: 'rights',
    icon: UserCheck,
    title: 'Your Rights and Choices',
    body: (
      <ul className="list-disc space-y-3 pl-5">
        <li>
          Access, update, or correct your account information at any time.
        </li>
        <li>Request deletion of your account and personal data.</li>
        <li>
          Withdraw consent for optional data uses, such as marketing
          communications.
        </li>
        <li>
          Depending on your location, you may have additional rights under laws
          such as the GDPR or CCPA.
        </li>
      </ul>
    ),
  },

  {
    id: 'children',
    icon: Baby,
    title: "Children's Privacy",
    body: (
      <p>
        Our services are not directed to individuals under 16, and we do not
        knowingly collect personal information from children.
      </p>
    ),
  },

  {
    id: 'changes',
    icon: RefreshCw,
    title: 'Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. We will notify
        you of material changes by posting the updated policy on this page and
        updating the "Last updated" date above.
      </p>
    ),
  },

  {
    id: 'contact',
    icon: Mail,
    title: 'Contact Us',
    body: (
      <p>
        If you have questions about this Privacy Policy or how we handle your
        data, contact us at{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
]

const PrivacyPolicy = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-15% 0px -65% 0px',
      }
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)

      if (el) {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const activeIndex = Math.max(
    0,
    SECTIONS.findIndex((section) => section.id === activeId)
  )

  const progress = ((activeIndex + 1) / SECTIONS.length) * 100

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* =========================
          NAVBAR
      ========================= */}
      <Navbar activePage="privacy" variant="auth" />

      {/* =========================
          HERO
      ========================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-100/70 blur-[120px]" />
          <div className="absolute right-[-180px] top-[-100px] h-[500px] w-[500px] rounded-full bg-violet-100/60 blur-[130px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:pb-20 lg:pt-14">
          {/* Breadcrumb */}
          <div className="mb-12 flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span>Legal</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-700">
              Privacy Policy
            </span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-end">
            {/* Hero copy */}
            <div className="center justify-center center:items-center ml-12">
                <h1 className="max-w-4xl text-[28px] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-4xl lg:text-[56px]">
                Your privacy.
                <br />
                <span className="text-indigo-600">Our responsibility.</span>
              </h1>
            </div>
             {/* <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Privacy &amp; Security
              </div>

              <h1 className="max-w-4xl text-[48px] font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[76px]">
                Your privacy.
                <br />
                <span className="text-indigo-600">Our responsibility.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-lg">
                A clear overview of how {COMPANY_NAME} collects, uses,
                protects, and manages your information.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Policy active
                </div>

                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-medium text-slate-500 shadow-sm">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {LAST_UPDATED}
                </div>
              </div>
            </div>  */}

          
          </div>

          <div className="mt-12 flex justify-center lg:mt-16">
            <button
              onClick={() => scrollTo(SECTIONS[0].id)}
              className="group flex flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-indigo-600"
            >
              Explore policy
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition group-hover:border-indigo-200 group-hover:bg-indigo-50">
                <ArrowDown className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          MAIN
      ========================= */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,850px)] lg:justify-center">
          {/* =========================
              SIDEBAR
          ========================= */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_15px_50px_-30px_rgba(15,23,42,0.35)]">
                <div className="mb-4 flex items-center justify-between px-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Navigation
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-900">
                      On this page
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-400">
                    {SECTIONS.length}
                  </div>
                </div>

                <div className="space-y-1">
                  {SECTIONS.map(({ id, title }, index) => {
                    const active = activeId === id

                    return (
                      <button
                        key={id}
                        onClick={() => scrollTo(id)}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 ${
                          active
                            ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold ${
                            active
                              ? 'bg-white/10 text-white'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span
                          className={`truncate text-[11px] ${
                            active ? 'font-semibold' : 'font-medium'
                          }`}
                        >
                          {title}
                        </span>

                        {active && (
                          <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-white/60" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Support card */}
              <div className="relative mt-4 overflow-hidden rounded-[24px] bg-slate-950 p-5 text-white">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Mail className="h-4 w-4 text-indigo-300" />
                  </div>

                  <p className="mt-5 text-xs font-bold">Need help?</p>

                  <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                    Have a question about privacy or your information?
                  </p>

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-white transition hover:text-indigo-300"
                  >
                    Contact support
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* =========================
              DOCUMENT
          ========================= */}
          <main>
            <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.3)]">
              {/* Document top bar */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-[#fcfcfd] px-6 py-5 sm:px-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Lock className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Official document
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">
                      Privacy Policy
                    </p>
                  </div>
                </div>

                <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-400 sm:block">
                  Version 1.0
                </span>
              </div>

              {/* Introduction */}
              <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/70 px-6 py-9 sm:px-10 sm:py-12">
                <div className="max-w-3xl">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Before you continue
                  </p>

                  <p className="text-[15px] leading-8 text-slate-500">
                    {COMPANY_NAME} ("we", "us", or "our") provides a project
                    management platform that helps teams organize boards,
                    deadlines, and reports. This Privacy Policy explains what
                    information we collect, how we use it, and the choices you
                    have. By creating an account or using our services, you
                    agree to the practices described here.
                  </p>
                </div>
              </div>

              {/* Sections */}
              <div className="px-6 sm:px-10">
                {SECTIONS.map(
                  ({ id, title, icon: Icon, body }, index) => (
                    <section
                      key={id}
                      id={id}
                      className="group scroll-mt-8 border-b border-slate-100 py-10 last:border-b-0 sm:py-12"
                    >
                      <div className="flex gap-5 sm:gap-7">
                        {/* Number */}
                        <div className="hidden shrink-0 pt-1 sm:block">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-[9px] font-bold text-slate-400 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Heading */}
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:shadow-indigo-100">
                              <Icon className="h-[18px] w-[18px]" />
                            </div>

                            <div className="pt-0.5">
                              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                                Section {index + 1}
                              </p>

                              <h2 className="text-[19px] font-bold tracking-[-0.03em] text-slate-950 sm:text-[22px]">
                                {title}
                              </h2>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="mt-7 text-[14px] leading-7 text-slate-500 sm:ml-[60px] sm:text-[15px]">
                            {body}
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                )}
              </div>

              {/* CTA */}
              <div className="mx-5 mb-5 overflow-hidden rounded-[24px] bg-slate-950 sm:mx-8 sm:mb-8">
                <div className="relative p-6 sm:p-8">
                  <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
                  <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                        <ShieldCheck className="h-3 w-3" />
                        We're here to help
                      </div>

                      <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                        Have a privacy question?
                      </h3>

                      <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
                        Contact our team for questions about your information
                        or this policy.
                      </p>
                    </div>

                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-50"
                    >
                      Contact support
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </main>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <Footer />
      {/* <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-9 sm:flex-row sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <LayoutDashboard className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">
                {COMPANY_NAME}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-400">
                Project Management Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <Lock className="h-3 w-3" />
            © 2026 {COMPANY_NAME}. All rights reserved.
          </div>
        </div>
      </footer> */}
    </div>
  )
}

export default PrivacyPolicy

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Users,
  ListChecks,
  Activity,
  LineChart,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ShieldCheck,
  Play,
  MessageCircle,
  Check,
  BarChart3,
  Bell,
  MousePointer2,
  GitBranch,
} from 'lucide-react'

import Footer from './Footer'
import Navbar from '../components/navigation/Navbar'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   MEDIA
============================================================ */

const COMMUNICATION_VIDEO =
  'https://dapulse-res.cloudinary.com/video/upload/q_auto:best,f_auto,cs_copy/remote_mondaycom_static/video/video-library/features/communication.mp4'

const COMMUNICATION_IMAGE =
  'https://dapulse-res.cloudinary.com/video/upload/so_0p/remote_mondaycom_static/video/video-library/features/communication.jpg'

/* ============================================================
   DATA
============================================================ */

const STEPS = [
  {
    step: 1,
    icon: Users,
    title: 'Create a workspace',
    body: 'Spin up your org, invite the team, and choose your project templates. Ready in under two minutes.',
    preview: 'workspace',
    color: '#4F46E5',
    colorSoft: '#EEF2FF',
  },
  {
    step: 2,
    icon: ListChecks,
    title: 'Lay out the work',
    body: 'Break projects into tasks, assign owners, and set milestones. Import existing spreadsheets in one click.',
    preview: 'tasks',
    color: '#5B54F0',
    colorSoft: '#EEF2FF',
  },
  {
    step: 3,
    icon: Activity,
    title: 'Track it to done',
    body: 'Boards and reports update live as work moves forward. Reminders handle all the follow-ups automatically.',
    preview: 'tracking',
    color: '#4338CA',
    colorSoft: '#EDE9FE',
  },
  {
    step: 4,
    icon: LineChart,
    title: 'Review and improve',
    body: 'Burndown charts and workload views show what is working, so you can adjust before the next sprint.',
    preview: 'review',
    color: '#7C3AED',
    colorSoft: '#F3E8FF',
  },
]

/* ============================================================
   PREVIEW CARD
============================================================ */

const PreviewCard = ({ kind, color, colorSoft }) => {
  const content = () => {
    if (kind === 'workspace') {
      return (
        <div className="space-y-3.5 p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${color}, #6366F1)`,
                boxShadow: `0 8px 18px -8px ${color}`,
              }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-indigo-950">
                Acme Product Team
              </p>
              <p className="text-[11px] text-slate-400">Workspace</p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
            style={{ background: colorSoft, borderColor: `${color}22` }}
          >
            <div className="flex -space-x-1.5">
              {['#4F46E5', '#7C3AED', '#DB2777', '#0891B2'].map((c) => (
                <span
                  key={c}
                  className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-indigo-700">
              +8 invited
            </span>
          </div>

          <div className="flex gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-indigo-200" />
            <div className="h-1.5 w-10 rounded-full bg-slate-100" />
          </div>
        </div>
      )
    }

    if (kind === 'tasks') {
      return (
        <div className="space-y-2 p-4">
          {[
            { t: 'Set up billing', done: true },
            { t: 'Design landing page', done: false },
            { t: 'QA checkout flow', done: false },
          ].map((row) => (
            <div
              key={row.t}
              className="flex items-center gap-2.5 rounded-xl border border-indigo-50 bg-white px-3 py-2.5 shadow-[0_3px_15px_-10px_rgba(79,70,229,0.25)]"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                  row.done ? 'border-transparent bg-indigo-600' : 'border-indigo-200'
                }`}
              >
                {row.done && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              <span
                className={`flex-1 truncate text-xs font-medium ${
                  row.done ? 'text-slate-400 line-through' : 'text-indigo-950'
                }`}
              >
                {row.t}
              </span>
              <ChevronRight className="h-3 w-3 text-indigo-200" />
            </div>
          ))}
        </div>
      )
    }

    if (kind === 'tracking') {
      return (
        <div className="grid grid-cols-3 gap-2 p-4">
          {[
            { label: 'To do', dot: '#94A3B8' },
            { label: 'Doing', dot: color },
            { label: 'Done', dot: '#10B981' },
          ].map((col) => (
            <div
              key={col.label}
              className="rounded-xl border border-indigo-50 bg-indigo-50/40 p-2"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: col.dot }}
                />
                <p className="text-[11px] font-semibold text-indigo-700">
                  {col.label}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="h-7 rounded-md border border-indigo-100 bg-white shadow-sm" />
                <div className="h-7 rounded-md border border-indigo-100 bg-white shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-950">Sprint burndown</p>
            <p className="text-[11px] text-slate-400">Remaining work</p>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <LineChart className="h-3.5 w-3.5 text-indigo-600" />
          </div>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {[90, 78, 66, 52, 38, 22].map((h, i) => (
            <div
              key={i}
              className="preview-bar flex-1 origin-bottom rounded-t-md"
              style={{
                height: `${h}%`,
                background: 'linear-gradient(to top, #4338CA, #818CF8)',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-[0_25px_60px_-35px_rgba(79,70,229,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-30px_rgba(79,70,229,0.55)] lg:max-w-[300px]"
    >
      <div className="flex items-center gap-1.5 border-b border-indigo-50 bg-indigo-50/50 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-rose-300" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        <div className="ml-2 h-4 flex-1 rounded-full border border-indigo-100 bg-white" />
      </div>
      {content()}
    </div>
  )
}

/* ============================================================
   STEP ITEM (timeline)
============================================================ */

const StepItem = ({ step, icon: Icon, title, body, preview, color, colorSoft }) => (
  <article
    id={`step-${step}`}
    data-step
    className="relative scroll-mt-28 pl-16 sm:pl-20"
  >
    {/* Node on the rail */}
    <div
      data-node
      className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 ring-1 ring-indigo-100 shadow-[0_10px_30px_-12px_rgba(79,70,229,0.5)] sm:h-14 sm:w-14"
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
    </div>

    <div className="grid items-center gap-6 lg:grid-cols-[1fr_300px] lg:gap-14">
      <div data-copy>
        <p className="text-xs font-semibold text-indigo-500">Step {step} of 4</p>

        <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-indigo-950 sm:text-[28px]">
          {title}
        </h3>

        <p className="mt-3 max-w-md text-[15px] leading-7 text-[#5E6C84]">{body}</p>

        <Link
          to="/features"
          className="group mt-4 inline-flex items-center gap-1 rounded-md text-sm font-semibold text-indigo-600 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Learn more
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div data-preview className="flex lg:justify-end">
        <PreviewCard kind={preview} color={color} colorSoft={colorSoft} />
      </div>
    </div>
  </article>
)

/* ============================================================
   COMMUNICATION SECTION
============================================================ */

const Eyebrow = ({ icon: Icon, children }) => (
  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600">
    <Icon className="h-3.5 w-3.5" />
    {children}
  </div>
)

const CommunicationSection = () => (
  <section className="relative overflow-hidden border-y border-indigo-100/70 bg-white py-20 sm:py-28">
    <div className="pointer-events-none absolute -left-48 top-10 h-[420px] w-[420px] rounded-full bg-indigo-100/40 blur-3xl" />
    <div className="pointer-events-none absolute -right-48 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-100/50 blur-3xl" />

    <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
      {/* ---------- Block 1: video ---------- */}
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div data-reveal>
          <Eyebrow icon={MessageCircle}>Better team communication</Eyebrow>

          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] text-indigo-950 sm:text-5xl sm:leading-[1.08]">
            Boost team collaboration and{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              get more done
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#44546F]">
            Keep conversations, tasks, updates and project decisions together.
            AeroPilot gives your team one clear place to communicate and move
            work forward.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              'Keep project conversations in one place',
              'Connect discussions directly to tasks',
              'See updates and activity in real time',
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm font-medium text-[#44546F]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/features"
              className="flex h-12 items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white px-6 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Explore features
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div data-reveal className="relative">
          <div className="absolute -inset-6 rounded-[32px] bg-indigo-200/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_35px_90px_-38px_rgba(49,46,129,0.42)]">
            <div className="flex h-10 items-center gap-1.5 border-b border-indigo-50 bg-indigo-50/60 px-4">
              <span className="h-2 w-2 rounded-full bg-rose-300" />
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <div className="mx-3 h-5 flex-1 rounded-md border border-indigo-100 bg-white" />
            </div>

            <div className="relative aspect-[16/10] bg-indigo-50">
              <video
                className="h-full w-full object-cover"
                src={COMMUNICATION_VIDEO}
                poster={COMMUNICATION_IMAGE}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-950/10 via-transparent to-white/15" />

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-lg backdrop-blur-md sm:left-5 sm:top-5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
                </span>
                Live collaboration
              </div>

              <div className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <MousePointer2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-950">Team synced</p>
                  <p className="text-[11px] text-indigo-500">Everything up to date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating cards: desktop only so they never overflow small screens */}
          <div className="float-one absolute -left-6 bottom-10 hidden w-52 rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.4)] lg:block">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-950">Task completed</p>
                <p className="text-[11px] text-[#7A869A]">Landing page review</p>
              </div>
            </div>
          </div>

          <div className="float-two absolute -bottom-6 -right-4 hidden w-56 rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.4)] lg:block">
            <p className="mb-2.5 text-xs font-semibold text-indigo-950">Team activity</p>
            <div className="space-y-2">
              {[
                ['A', 'Alex updated a task', 'bg-indigo-100 text-indigo-600'],
                ['S', 'Sarah left a comment', 'bg-violet-100 text-violet-600'],
                ['M', 'Mike completed a task', 'bg-emerald-100 text-emerald-600'],
              ].map(([i, t, s]) => (
                <div key={t} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s}`}
                  >
                    {i}
                  </span>
                  <p className="truncate text-[11px] text-[#5E6C84]">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Block 2: automation mock ---------- */}
      <div className="mt-24 grid items-center gap-12 sm:mt-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div data-reveal className="relative order-2 lg:order-1">
          <div className="absolute -inset-6 rounded-[32px] bg-violet-100/60 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_35px_90px_-38px_rgba(49,46,129,0.35)]">
            <div className="flex items-center justify-between border-b border-indigo-50 bg-indigo-50/50 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <GitBranch className="h-4 w-4 text-indigo-600" />
                Release automation
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                Active
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              {[
                { k: 'When', t: 'A task moves to Done', i: CheckCircle2 },
                { k: 'Then', t: 'Notify the task owner and reviewer', i: Bell },
                { k: 'Then', t: 'Move the task to the Review column', i: ListChecks },
                { k: 'Then', t: 'Update the sprint burndown', i: BarChart3 },
              ].map((row, idx) => {
                const I = row.i
                return (
                  <div key={row.t} className="relative">
                    <div className="flex items-center gap-3 rounded-xl border border-indigo-100/80 bg-white p-3 shadow-sm sm:p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <I className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-indigo-400">{row.k}</p>
                        <p className="text-sm font-medium text-indigo-950">{row.t}</p>
                      </div>
                    </div>
                    {idx < 3 && (
                      <div className="ml-[26px] h-3 w-px bg-indigo-200" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div data-reveal className="order-1 lg:order-2">
          <Eyebrow icon={Zap}>One connected workspace</Eyebrow>

          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-indigo-950 sm:text-5xl sm:leading-[1.08]">
            Build your ideal workflow and{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              save more time
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#44546F]">
            Create customizable workflows, organize projects, manage subtasks
            and connect your team&apos;s work in one simple workspace.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { icon: BarChart3, title: 'Live reporting', text: 'Know what is happening.' },
              { icon: Bell, title: 'Smart reminders', text: 'Never miss a follow-up.' },
              { icon: ListChecks, title: 'Subtasks', text: 'Break work into smaller steps.' },
              { icon: ShieldCheck, title: 'Secure workspace', text: 'Keep your work protected.' },
            ].map(({ icon: I, title, text }) => (
              <div
                key={title}
                className="group flex items-start gap-3 rounded-2xl border border-indigo-100/70 bg-indigo-50/40 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-[0_15px_35px_-18px_rgba(79,70,229,0.45)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-50 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <I className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-950">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-[#6B778C]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)

/* ============================================================
   PAGE
============================================================ */

const HowItWorks = ({ showChrome = true }) => {
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* Hero: one orchestrated entrance */
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-hero]', {
            opacity: 0,
            y: 22,
            duration: 0.6,
            stagger: 0.09,
            clearProps: 'all',
          })

        gsap.to('.hero-orb-one', { x: 40, y: 25, duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true })
        gsap.to('.hero-orb-two', { x: -35, y: 30, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true })

        /* Signature moment: timeline rail fills as you scroll */
        gsap.fromTo(
          '.rail-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.steps-wrap',
              start: 'top 60%',
              end: 'bottom 60%',
              scrub: 0.4,
            },
          }
        )

        /* Steps: each reveals once */
        gsap.utils.toArray('[data-step]').forEach((el) => {
          gsap
            .timeline({
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
              defaults: { ease: 'power3.out' },
            })
            .from(el.querySelector('[data-node]'), { scale: 0.7, opacity: 0, duration: 0.4, ease: 'back.out(1.6)' })
            .from(el.querySelector('[data-copy]'), { opacity: 0, y: 16, duration: 0.45 }, '-=0.2')
            .from(el.querySelector('[data-preview]'), { opacity: 0, y: 16, duration: 0.45 }, '-=0.3')
        })

        gsap.utils.toArray('.preview-bar').forEach((bar, i) => {
          gsap.from(bar, {
            scaleY: 0.15,
            duration: 0.5,
            delay: i * 0.04,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: bar, start: 'top 92%', once: true },
          })
        })

        /* Generic section reveals */
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        /* Floating cards (desktop only elements) */
        gsap.to('.float-one', { y: -8, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
        gsap.to('.float-two', { y: 8, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })

        gsap.to('.cta-glow', { scale: 1.12, opacity: 0.7, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      })

      return () => mm.revert()
    }, pageRef)

    const t = setTimeout(() => ScrollTrigger.refresh(), 150)

    return () => {
      clearTimeout(t)
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={pageRef}
      className={`overflow-x-hidden ${
        showChrome ? 'marketing-page' : 'bg-[#F8F9FF] text-indigo-950'
      }`}
    >
      {showChrome && <Navbar activePage="how-it-works" />}

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-indigo-100/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-orb-one absolute -left-40 -top-44 h-[380px] w-[380px] rounded-full bg-indigo-100/70 blur-3xl sm:h-[460px] sm:w-[460px]" />
          <div className="hero-orb-two absolute -right-40 top-0 h-[380px] w-[380px] rounded-full bg-violet-100/70 blur-3xl sm:h-[480px] sm:w-[480px]" />
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(79,70,229,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,.08) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 pb-12 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-24">
          <div
            data-hero
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-600 shadow-[0_8px_30px_-15px_rgba(79,70,229,0.4)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
            </span>
            Simple setup. Powerful workflow.
          </div>

          <h3
            data-hero
            className="mt-4 text-[20px] font-semibold leading-[1.05] tracking-[-0.05em] text-indigo-950 sm:text-4xl lg:text-5xl"
          >
            From sign-up to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              shipped
            </span>
          </h3>

          <p
            data-hero
            className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5E6C84] sm:text-lg sm:leading-8"
          >
            No lengthy onboarding. Most teams have their first board running the
            same day they sign up.
          </p>

          <div
            data-hero
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/signup"
              className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              Start building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#step-1"
              className="flex h-12 items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white/80 px-7 text-sm font-semibold text-indigo-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              See how it works
            </a>
          </div>

          <div
            data-hero
            className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {[
              { icon: Clock, label: '2 min setup' },
              { icon: Zap, label: 'Real-time sync' },
              { icon: Shield, label: 'SOC 2 ready' },
            ].map(({ icon: I, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] font-medium text-[#505F79]">
                <I className="h-4 w-4 text-indigo-600" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STEPS ================= */}
      <section className="relative mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
        <div className="relative mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-indigo-950 sm:text-4xl sm:leading-[1.08]">
            A workflow that <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">stays simple</div> 
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#5E6C84]">
            From planning to delivery, AeroPilot keeps every part of your
            workflow connected.
          </p>
        </div>

        <div className="steps-wrap relative">
          {/* Rail */}
          <div className="absolute bottom-6 left-6 top-6 w-px -translate-x-1/2 bg-indigo-100 sm:left-7">
            <div className="rail-fill h-full w-full origin-top bg-gradient-to-b from-indigo-500 to-violet-500" />
          </div>

          <div className="relative space-y-16 sm:space-y-20">
            {STEPS.map((s) => (
              <StepItem key={s.step} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= COMMUNICATION ================= */}
      <CommunicationSection />

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-20 sm:px-6">
        <div
          data-reveal
          className="relative overflow-hidden rounded-[28px] border border-indigo-100 bg-white px-6 py-14 text-center shadow-[0_25px_80px_-35px_rgba(79,70,229,0.3)] sm:rounded-[32px] sm:px-12 sm:py-20"
        >
          <div className="cta-glow pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="relative z-10">
            <h3 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.045em] text-indigo-950 sm:text-5xl sm:leading-[1.06]">
              Ready to ship faster?
            </h3>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5E6C84]">
              Bring your tasks, subtasks, projects and team into one organized
              workspace with AeroPilot.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 text-sm font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:w-auto"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="flex h-12 w-full items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white px-7 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:w-auto"
              >
                Talk to us
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#6B778C]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Secure &amp; reliable
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {showChrome && <Footer />}
    </div>
  )
}

export default HowItWorks
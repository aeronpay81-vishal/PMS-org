import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  ShieldCheck
} from 'lucide-react'
import Footer from './Footer'
import MarketingNavbar from '../components/MarketingNavbar'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   Steps
───────────────────────────────────────────────────────────── */

const STEPS = [
  {
    step: '01',
    icon: Users,
    title: 'Create a workspace',
    body: 'Spin up your org, invite the team, and choose your project templates. Ready in under two minutes.',
    preview: 'workspace',
    color: '#0C66E4',
    colorSoft: '#E9F2FF',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Lay out the work',
    body: 'Break projects into tasks, assign owners, and set milestones. Import existing spreadsheets in one click.',
    preview: 'tasks',
    color: '#E2B203',
    colorSoft: '#FFF7D6',
  },
  {
    step: '03',
    icon: Activity,
    title: 'Track it to done',
    body: 'Boards and reports update live as work moves forward. Reminders handle all the follow-ups automatically.',
    preview: 'tracking',
    color: '#1F845A',
    colorSoft: '#DCFFF1',
  },
  {
    step: '04',
    icon: LineChart,
    title: 'Review and improve',
    body: 'Burndown charts and workload views show what is working, so you can adjust before the next sprint.',
    preview: 'review',
    color: '#6E5DC6',
    colorSoft: '#F3F0FF',
  },
]

/* ─────────────────────────────────────────────────────────────
   Preview card
───────────────────────────────────────────────────────────── */

const PreviewCard = ({
  kind,
  color,
  colorSoft,
}) => {
  const renderContent = () => {
    if (kind === 'workspace') {
      return (
        <div className="space-y-2.5 p-3.5">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ background: color }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1">
              <div className="h-2 w-20 rounded-full bg-slate-200" />
              <div className="mt-1 h-1.5 w-12 rounded-full bg-slate-100" />
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
            style={{
              background: colorSoft,
              borderColor: `${color}18`,
            }}
          >
            <div className="flex -space-x-1.5">
              {[
                '#6366f1',
                '#8b5cf6',
                '#ec4899',
                '#f59e0b',
              ].map((avatarColor, index) => (
                <span
                  key={index}
                  className="h-5 w-5 rounded-full border-2 border-white"
                  style={{ background: avatarColor }}
                />
              ))}
            </div>

            <span className="text-[10px] font-medium text-slate-500">
              +8 invited
            </span>
          </div>
        </div>
      )
    }

    if (kind === 'tasks') {
      return (
        <div className="space-y-1.5 p-3.5">
          {[
            { t: 'Set up billing', done: true },
            { t: 'Design landing page', done: false },
            { t: 'QA — checkout flow', done: false },
          ].map((row) => (
            <div
              key={row.t}
              className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2 transition-all hover:border-slate-200 hover:shadow-sm"
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border transition-all ${row.done
                    ? 'border-transparent'
                    : 'border-slate-300'
                  }`}
                style={row.done ? { background: color } : undefined}
              >
                {row.done && (
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                )}
              </span>

              <span
                className={`flex-1 text-[10px] font-medium ${row.done
                    ? 'text-slate-400 line-through'
                    : 'text-slate-700'
                  }`}
              >
                {row.t}
              </span>
            </div>
          ))}
        </div>
      )
    }

    if (kind === 'tracking') {
      return (
        <div className="grid grid-cols-3 gap-1.5 p-3.5">
          {[
            { label: 'To do', dot: '#94a3b8' },
            { label: 'Doing', dot: color },
            { label: 'Done', dot: '#10b981' },
          ].map((column) => (
            <div
              key={column.label}
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-1.5"
            >
              <div className="mb-1.5 flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: column.dot }}
                />

                <p className="text-[8px] font-semibold text-slate-500">
                  {column.label}
                </p>
              </div>

              <div className="space-y-1">
                <div className="h-5 rounded border border-slate-200 bg-white" />
                <div className="h-5 rounded border border-slate-200 bg-white" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="p-3.5">
        <div className="flex h-16 items-end gap-1">
          {[45, 65, 55, 80, 60, 90].map((height, index) => (
            <div
              key={index}
              className="preview-bar flex-1 rounded-t"
              style={{
                height: `${height}%`,
                minHeight: '6px',
                background: color,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      data-preview
      className="w-full max-w-[245px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

        <div className="ml-1.5 h-3 flex-1 rounded-full bg-white" />
      </div>

      {renderContent()}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Step item
───────────────────────────────────────────────────────────── */

const StepItem = ({
  step,
  icon: Icon,
  title,
  body,
  preview,
  color,
  colorSoft,
  index,
}) => {
  return (
    <article
      className="step-item relative"
      data-step-item
      data-index={index}
    >
      <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        {/* Icon */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
          <div
            className="step-icon relative flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
            style={{
              background: color,
              boxShadow: `0 8px 20px -8px ${color}80`,
            }}
          >
            <Icon className="h-5 w-5" />

            {/* ping ring */}
            <span
              className="absolute inset-0 rounded-xl"
              style={{
                boxShadow: `0 0 0 0 ${color}30`,
              }}
            />
          </div>

          <div>
            <p
              className="font-mono text-[10px] font-bold tracking-widest"
              style={{ color }}
            >
              STEP {step}
            </p>
          </div>
        </div>

        {/* Text */}
        <div className="step-copy">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h3>

          <p className="mt-1.5 max-w-md text-[13px] leading-6 text-slate-500">
            {body}
          </p>

          <div
            className="step-link mt-3 flex items-center gap-1 text-[11px] font-medium"
            style={{ color }}
          >
            <span>Learn more</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-start sm:col-start-2 lg:col-start-3 lg:justify-end">
          <PreviewCard
            kind={preview}
            color={color}
            colorSoft={colorSoft}
          />
        </div>
      </div>

      {/* Connector */}
      {index < STEPS.length - 1 && (
        <div className="hidden sm:block">
          <div
            className="step-line ml-[21px] mt-4 h-10 w-px origin-top"
            style={{
              background: `linear-gradient(to bottom, ${color}70, transparent)`,
            }}
          />
        </div>
      )}
    </article>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────── */

const HowItWorks = ({ showChrome = true }) => {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ───────────────────────────────
         Initial states
      ─────────────────────────────── */

      gsap.set('.hero-badge', {
        opacity: 0,
        y: 18,
        scale: 0.96,
      })

      gsap.set('.hero-title-line', {
        opacity: 0,
        y: 45,
      })

      gsap.set('.hero-description', {
        opacity: 0,
        y: 18,
      })

      gsap.set('.hero-feature', {
        opacity: 0,
        y: 15,
      })

      gsap.set('.step-item', {
        opacity: 0,
        y: 45,
      })

      gsap.set('.step-icon', {
        opacity: 0,
        scale: 0.65,
        rotation: -8,
      })

      gsap.set('.step-copy', {
        opacity: 0,
        x: -25,
      })

      gsap.set('[data-preview]', {
        opacity: 0,
        x: 35,
        scale: 0.92,
        rotation: 1.5,
      })

      gsap.set('.step-line', {
        scaleY: 0,
      })

      gsap.set('.step-link', {
        opacity: 0,
        x: -8,
      })

      gsap.set('.cta-section', {
        opacity: 0,
        y: 50,
      })

      gsap.set('.cta-glow-one', {
        opacity: 0,
        scale: 0.7,
      })

      gsap.set('.cta-glow-two', {
        opacity: 0,
        scale: 0.7,
      })

      /* ───────────────────────────────
         Hero entrance
      ─────────────────────────────── */

      const heroTimeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      heroTimeline
        .to('.hero-badge', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
        })
        .to(
          '.hero-title-line',
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
          },
          '-=0.35'
        )
        .to(
          '.hero-description',
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
          },
          '-=0.42'
        )
        .to(
          '.hero-feature',
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.28'
        )

      /* ───────────────────────────────
         Floating hero background
      ─────────────────────────────── */

      gsap.to('.hero-orb-one', {
        x: 45,
        y: 25,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      gsap.to('.hero-orb-two', {
        x: -35,
        y: 30,
        duration: 7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      /* ───────────────────────────────
         Steps reveal
      ─────────────────────────────── */

      const stepItems = gsap.utils.toArray('.step-item')

      stepItems.forEach((step) => {
        const icon = step.querySelector('.step-icon')
        const copy = step.querySelector('.step-copy')
        const preview = step.querySelector('[data-preview]')
        const link = step.querySelector('.step-link')
        const line = step.querySelector('.step-line')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        })

        tl.to(step, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
        })
          .to(
            icon,
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.55,
              ease: 'back.out(1.7)',
            },
            '-=0.4'
          )
          .to(
            copy,
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              ease: 'power3.out',
            },
            '-=0.35'
          )
          .to(
            preview,
            {
              opacity: 1,
              x: 0,
              scale: 1,
              rotation: 0,
              duration: 0.7,
              ease: 'power3.out',
            },
            '-=0.45'
          )
          .to(
            link,
            {
              opacity: 1,
              x: 0,
              duration: 0.35,
              ease: 'power2.out',
            },
            '-=0.28'
          )

        if (line) {
          tl.to(
            line,
            {
              scaleY: 1,
              duration: 0.65,
              ease: 'power2.out',
            },
            '-=0.18'
          )
        }
      })

      /* ───────────────────────────────
         Preview bar animation
      ─────────────────────────────── */

      gsap.utils.toArray('.preview-bar').forEach((bar, index) => {
        gsap.fromTo(
          bar,
          {
            scaleY: 0.25,
            transformOrigin: 'bottom center',
          },
          {
            scaleY: 1,
            duration: 0.7,
            delay: index * 0.07,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: bar,
              start: 'top 86%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      /* ───────────────────────────────
         Step icon subtle pulse
      ─────────────────────────────── */

      gsap.utils.toArray('.step-icon').forEach((icon) => {
        const ring = icon.querySelector('span')

        if (!ring) return

        gsap.to(ring, {
          boxShadow: '0 0 0 7px transparent',
          duration: 1.8,
          ease: 'power2.out',
          repeat: -1,
          repeatDelay: 2,
        })
      })

      /* ───────────────────────────────
         CTA reveal
      ─────────────────────────────── */

      const ctaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      ctaTimeline
        .to('.cta-section', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        })
        .to(
          '.cta-glow-one',
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.55'
        )
        .to(
          '.cta-glow-two',
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.7'
        )

      /* ───────────────────────────────
         CTA glow movement
      ─────────────────────────────── */

      gsap.to('.cta-glow-one', {
        x: 30,
        y: 20,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      gsap.to('.cta-glow-two', {
        x: -25,
        y: -15,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      /* ───────────────────────────────
         CTA button hover
      ─────────────────────────────── */

      gsap.utils.toArray('.magnetic-btn').forEach((button) => {
        const arrow = button.querySelector('.cta-arrow')

        const moveIn = () => {
          gsap.to(button, {
            y: -2,
            scale: 1.02,
            duration: 0.25,
            ease: 'power2.out',
          })

          if (arrow) {
            gsap.to(arrow, {
              x: 4,
              duration: 0.25,
              ease: 'power2.out',
            })
          }
        }

        const moveOut = () => {
          gsap.to(button, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          })

          if (arrow) {
            gsap.to(arrow, {
              x: 0,
              duration: 0.3,
              ease: 'power2.out',
            })
          }
        }

        button.addEventListener('mouseenter', moveIn)
        button.addEventListener('mouseleave', moveOut)

        button._gsapMoveIn = moveIn
        button._gsapMoveOut = moveOut
      })

      /* ───────────────────────────────
         Preview card hover
      ─────────────────────────────── */

      gsap.utils.toArray('[data-preview]').forEach((card) => {
        const moveIn = () => {
          gsap.to(card, {
            y: -5,
            rotation: 0,
            scale: 1.025,
            duration: 0.35,
            ease: 'power2.out',
          })
        }

        const moveOut = () => {
          gsap.to(card, {
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          })
        }

        card.addEventListener('mouseenter', moveIn)
        card.addEventListener('mouseleave', moveOut)

        card._gsapMoveIn = moveIn
        card._gsapMoveOut = moveOut
      })

      /* Refresh ScrollTrigger after layout settles */
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 300)

      /* Cleanup custom listeners */
      return () => {
        clearTimeout(refreshTimeout)

        gsap.utils.toArray('.magnetic-btn').forEach((button) => {
          if (button._gsapMoveIn) {
            button.removeEventListener(
              'mouseenter',
              button._gsapMoveIn
            )
          }

          if (button._gsapMoveOut) {
            button.removeEventListener(
              'mouseleave',
              button._gsapMoveOut
            )
          }
        })

        gsap.utils.toArray('[data-preview]').forEach((card) => {
          if (card._gsapMoveIn) {
            card.removeEventListener(
              'mouseenter',
              card._gsapMoveIn
            )
          }

          if (card._gsapMoveOut) {
            card.removeEventListener(
              'mouseleave',
              card._gsapMoveOut
            )
          }
        })
      }
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={pageRef}
      className={`overflow-x-hidden ${showChrome ? 'marketing-page' : 'bg-[#F7F8F9] text-[#172B4D]'}`}
    >
      {showChrome && <MarketingNavbar activePage="how-it-works" />}

      {/* ═════════════════════════════════════════════════════════
          HERO
      ═════════════════════════════════════════════════════════ */}

      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="hero-orb-one absolute -left-40 -top-44 h-[460px] w-[460px] rounded-full bg-indigo-100/70 blur-3xl"
          />

          <div
            className="hero-orb-two absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-violet-100/70 blur-3xl"
          />

          <div className="absolute bottom-[-250px] left-1/3 h-[430px] w-[430px] rounded-full bg-purple-50/80 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(148,163,184,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.12) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 pb-12 pt-16 text-center sm:px-6 sm:pt-20">
          {/* Badge */}
          <div className="hero-badge marketing-badge">
            <Sparkles className="h-3 w-3" />
            Simple setup. Powerful workflow.
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#172B4D] sm:text-5xl">
            <span className="hero-title-line inline-block">From sign-up to </span>
            <span className="hero-title-line inline-block text-[#0C66E4]">shipped</span>
          </h1>

          <p className="hero-description mx-auto mt-4 max-w-lg text-[14px] leading-7 text-[#44546F]">
            No lengthy onboarding. Most teams have their first board running
            the same day they sign up.
          </p>

          {/* Feature badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {[
              { icon: Clock, label: '2 min setup' },
              { icon: Zap, label: 'Real-time sync' },
              { icon: Shield, label: 'SOC 2 ready' },
            ].map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.label}
                  className="hero-feature flex items-center gap-1.5 text-[11px] font-medium text-[#626F86]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#0C66E4]" />
                  {feature.label}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          STEPS
      ═════════════════════════════════════════════════════════ */}

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="space-y-10 sm:space-y-8">
          {STEPS.map((step, index) => (
            <StepItem
              key={step.step}
              {...step}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          CTA
      ═════════════════════════════════════════════════════════ */}
<section className="mx-auto max-w-4xl px-5 pb-24 sm:px-6">
  <div className="cta-section marketing-card group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_20px_70px_-30px_rgba(79,70,229,0.25)] sm:px-12 sm:py-14">
    
    {/* Background glow */}
    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl transition-all duration-700 group-hover:bg-indigo-300/40" />

    <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl transition-all duration-700 group-hover:bg-violet-300/35" />

    {/* Subtle grid */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* Top decorative line */}
    <div className="absolute left-1/2 top-0 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

    <div className="relative z-10">
      
      {/* Premium badge */}
      <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-indigo-600 shadow-sm">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
          <Sparkles className="h-3 w-3" />
        </span>

        START TODAY
      </div>

      {/* Heading */}
      <h3 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.035em] text-[#172B4D] sm:text-4xl lg:text-[42px] lg:leading-[1.08]">
        Ready to ship faster?
      </h3>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#626F86] sm:text-[15px]">
        Bring your tasks, subtasks, projects and team into one beautifully
        organized workspace with AeroPilot.
      </p>

      {/* CTA buttons */}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        
        <a
          href="/signup"
          className="group/btn relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#4F46E5] px-6 text-[13px] font-semibold text-white shadow-[0_10px_25px_-10px_rgba(79,70,229,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-[0_15px_30px_-10px_rgba(79,70,229,0.8)] sm:w-auto"
        >
          {/* Button shine */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

          <span className="relative">
            Start for free
          </span>

          <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </a>

        <a
          href="/contact"
          className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 text-[13px] font-semibold text-[#344563] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:w-auto"
        >
          Talk to us
        </a>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-medium text-slate-400 sm:text-[11px]">
        
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          No credit card required
        </div>

        <span className="hidden h-3 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
          Secure & reliable
        </div>

        <span className="hidden h-3 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Cancel anytime
        </div>
      </div>

      {/* Mini product preview */}
      <div className="mx-auto mt-10 flex max-w-lg items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 shadow-[0_8px_30px_-15px_rgba(15,23,42,0.25)] backdrop-blur-md">
          
          <div className="flex -space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[9px] font-bold text-indigo-600">
              AK
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[9px] font-bold text-violet-600">
              JS
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-[9px] font-bold text-sky-600">
              RM
            </div>

            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-500">
              +9
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <span className="text-[10px] font-medium text-slate-500">
            Teams are shipping faster with AeroPilot
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

      {showChrome && <Footer />}
    </div>
  )
}

export default HowItWorks
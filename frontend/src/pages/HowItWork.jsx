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
  ShieldCheck,
  Play,
  MessageCircle,
  Check,
  BarChart3,
  Layers3,
  Bell,
  MousePointer2,
} from 'lucide-react'

import Footer from './Footer'
import Navbar from '../components/navigation/Navbar'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   CLOUDINARY MEDIA
============================================================ */

const COMMUNICATION_VIDEO =
  'https://dapulse-res.cloudinary.com/video/upload/q_auto:best,f_auto,cs_copy/remote_mondaycom_static/video/video-library/features/communication.mp4'

const COMMUNICATION_IMAGE =
  'https://dapulse-res.cloudinary.com/video/upload/so_0p/remote_mondaycom_static/video/video-library/features/communication.jpg'

/* ============================================================
   STEPS
============================================================ */

const STEPS = [
  {
    step: '01',
    icon: Users,
    title: 'Create a workspace',
    body: 'Spin up your org, invite the team, and choose your project templates. Ready in under two minutes.',
    preview: 'workspace',
    color: '#4F46E5',
    colorSoft: '#EEF2FF',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Lay out the work',
    body: 'Break projects into tasks, assign owners, and set milestones. Import existing spreadsheets in one click.',
    preview: 'tasks',
    color: '#6366F1',
    colorSoft: '#EEF2FF',
  },
  {
    step: '03',
    icon: Activity,
    title: 'Track it to done',
    body: 'Boards and reports update live as work moves forward. Reminders handle all the follow-ups automatically.',
    preview: 'tracking',
    color: '#4338CA',
    colorSoft: '#EDE9FE',
  },
  {
    step: '04',
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

const PreviewCard = ({
  kind,
  color,
  colorSoft,
}) => {
  const renderContent = () => {
    if (kind === 'workspace') {
      return (
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${color}, #6366F1)`,
                boxShadow: `0 8px 18px -8px ${color}`,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1">
              <div className="h-2 w-24 rounded-full bg-indigo-100" />
              <div className="mt-1.5 h-1.5 w-14 rounded-full bg-slate-100" />
            </div>

            <div className="h-5 w-5 rounded-md bg-indigo-50" />
          </div>

          <div
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
            style={{
              background: colorSoft,
              borderColor: `${color}22`,
            }}
          >
            <div className="flex -space-x-1.5">
              {[
                '#4F46E5',
                '#7C3AED',
                '#DB2777',
                '#0891B2',
              ].map((avatarColor, index) => (
                <span
                  key={index}
                  className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                  style={{ background: avatarColor }}
                />
              ))}
            </div>

            <span className="text-[10px] font-semibold text-indigo-700">
              +8 invited
            </span>
          </div>

          <div className="flex gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-indigo-100" />
            <div className="h-1.5 w-8 rounded-full bg-slate-100" />
          </div>
        </div>
      )
    }

    if (kind === 'tasks') {
      return (
        <div className="space-y-1.5 p-4">
          {[
            { t: 'Set up billing', done: true },
            { t: 'Design landing page', done: false },
            { t: 'QA — checkout flow', done: false },
          ].map((row) => (
            <div
              key={row.t}
              className="group flex items-center gap-2.5 rounded-xl border border-indigo-50 bg-white px-3 py-2.5 shadow-[0_3px_15px_-10px_rgba(79,70,229,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                  row.done
                    ? 'border-transparent'
                    : 'border-indigo-200'
                }`}
                style={
                  row.done
                    ? {
                        background:
                          'linear-gradient(135deg,#4F46E5,#6366F1)',
                      }
                    : undefined
                }
              >
                {row.done && (
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                )}
              </span>

              <span
                className={`flex-1 text-[10px] font-medium ${
                  row.done
                    ? 'text-slate-400 line-through'
                    : 'text-indigo-950'
                }`}
              >
                {row.t}
              </span>

              <ChevronRight className="h-3 w-3 text-indigo-200 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
            </div>
          ))}
        </div>
      )
    }

    if (kind === 'tracking') {
      return (
        <div className="grid grid-cols-3 gap-1.5 p-4">
          {[
            { label: 'To do', dot: '#94A3B8' },
            { label: 'Doing', dot: color },
            { label: 'Done', dot: '#10B981' },
          ].map((column) => (
            <div
              key={column.label}
              className="rounded-xl border border-indigo-50 bg-indigo-50/40 p-2"
            >
              <div className="mb-2 flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full shadow-sm"
                  style={{
                    background: column.dot,
                  }}
                />

                <p className="text-[8px] font-bold text-indigo-700">
                  {column.label}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="h-6 rounded-md border border-indigo-100 bg-white shadow-sm" />
                <div className="h-6 rounded-md border border-indigo-100 bg-white shadow-sm" />
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
            <div className="h-2 w-20 rounded-full bg-indigo-100" />
            <div className="mt-1 h-1.5 w-12 rounded-full bg-slate-100" />
          </div>

          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
            <LineChart className="h-3 w-3 text-indigo-600" />
          </div>
        </div>

        <div className="flex h-16 items-end gap-1.5">
          {[45, 65, 55, 80, 60, 90].map(
            (height, index) => (
              <div
                key={index}
                className="preview-bar flex-1 origin-bottom rounded-t-md"
                style={{
                  height: `${height}%`,
                  minHeight: '6px',
                  background:
                    'linear-gradient(to top, #4338CA, #818CF8)',
                  opacity: 0.92,
                }}
              />
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      data-preview
      className="group w-full max-w-[270px] overflow-hidden rounded-2xl border border-indigo-100/80 bg-white shadow-[0_25px_60px_-35px_rgba(79,70,229,0.45)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-30px_rgba(79,70,229,0.5)]"
    >
      <div className="flex items-center gap-1.5 border-b border-indigo-50 bg-indigo-50/50 px-3 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

        <div className="ml-2 flex h-4 flex-1 items-center rounded-full border border-indigo-100 bg-white px-2">
          <div className="h-1 w-12 rounded-full bg-indigo-100" />
        </div>

        <div className="h-4 w-4 rounded bg-indigo-100/70" />
      </div>

      {renderContent()}
    </div>
  )
}

/* ============================================================
   STEP ITEM
============================================================ */

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
      className="step-item group relative"
      data-step-item
      data-index={index}
    >
      <div className="grid items-center gap-7 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:gap-12">
        {/* ICON */}

        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
          <div
            className="step-icon relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-xl transition-transform duration-500 group-hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg,#4F46E5,#6366F1)',
              boxShadow: `0 14px 30px -12px ${color}`,
            }}
          >
            <Icon className="h-5 w-5" />

            <span
              className="absolute inset-[-5px] rounded-[20px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                boxShadow: `0 0 0 1px ${color}25, 0 0 30px ${color}20`,
              }}
            />
          </div>

          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-500">
              STEP {step}
            </p>
          </div>
        </div>

        {/* TEXT */}

        <div className="step-copy">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color }}
            />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              Workflow
            </span>
          </div>

          <h3 className="text-xl font-semibold tracking-[-0.025em] text-indigo-950 sm:text-[22px]">
            {title}
          </h3>

          <p className="mt-2 max-w-md text-[13px] leading-6 text-[#5E6C84]">
            {body}
          </p>

          <div
            className="step-link mt-4 flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-[10px] font-semibold text-indigo-600 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-100"
            style={{ color }}
          >
            <span>Learn more</span>
            <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* PREVIEW */}

        <div className="flex justify-start sm:col-start-2 lg:col-start-3 lg:justify-end">
          <PreviewCard
            kind={preview}
            color={color}
            colorSoft={colorSoft}
          />
        </div>
      </div>

      {/* CONNECTOR */}

      {index < STEPS.length - 1 && (
        <div className="hidden sm:block">
          <div className="relative ml-[23px] mt-5 h-12 w-px overflow-hidden rounded-full bg-indigo-100">
            <div
              className="step-line absolute left-0 top-0 h-full w-full origin-top"
              style={{
                background:
                  'linear-gradient(to bottom,#6366F1,transparent)',
              }}
            />
          </div>
        </div>
      )}
    </article>
  )
}

/* ============================================================
   COMMUNICATION MEDIA SECTION
============================================================ */

const CommunicationSection = () => {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.media-copy', {
        opacity: 0,
        x: -45,
      })

      gsap.set('.media-visual', {
        opacity: 0,
        x: 55,
        scale: 0.94,
      })

      gsap.set('.media-float-card', {
        opacity: 0,
        y: 25,
        scale: 0.9,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      })

      tl.to('.media-copy', {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
        .to(
          '.media-visual',
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.55'
        )
        .to(
          '.media-float-card',
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: 'back.out(1.5)',
          },
          '-=0.5'
        )

      gsap.to('.float-one', {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.float-two', {
        y: 9,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      const visual =
        sectionRef.current?.querySelector(
          '.media-visual'
        )

      if (visual) {
        const handleMove = (event) => {
          const rect = visual.getBoundingClientRect()

          const x =
            (event.clientX - rect.left) /
              rect.width -
            0.5

          const y =
            (event.clientY - rect.top) /
              rect.height -
            0.5

          gsap.to(visual, {
            rotationY: x * 4,
            rotationX: -y * 3,
            transformPerspective: 1200,
            duration: 0.45,
            ease: 'power2.out',
          })
        }

        const handleLeave = () => {
          gsap.to(visual, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.6,
            ease: 'power3.out',
          })
        }

        visual.addEventListener(
          'mousemove',
          handleMove
        )

        visual.addEventListener(
          'mouseleave',
          handleLeave
        )

        return () => {
          visual.removeEventListener(
            'mousemove',
            handleMove
          )

          visual.removeEventListener(
            'mouseleave',
            handleLeave
          )
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-indigo-100/70 bg-white py-24 sm:py-32"
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -left-48 top-10 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-48 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-100/50 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(79,70,229,.18) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage:
            'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          {/* COPY */}

          <div className="media-copy">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-sm">
              <MessageCircle className="h-3.5 w-3.5" />
              Better team communication
            </div>

            <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.045em] text-indigo-950 sm:text-5xl sm:leading-[1.06]">
              Boost team collaboration
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                and get more done
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#44546F]">
              Keep conversations, tasks, updates and project
              decisions together. AeroPilot gives your team one
              clear place to communicate and move work forward.
            </p>

            <div className="mt-7 space-y-3.5">
              {[
                'Keep project conversations in one place',
                'Connect discussions directly to tasks',
                'See updates and activity in real time',
              ].map((item) => (
                <div
                  key={item}
                  className="group flex items-center gap-3 text-[13px] font-medium text-[#44546F]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                    <Check className="h-3 w-3" />
                  </span>

                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/signup"
                className="group flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-[13px] font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-[0_18px_40px_-12px_rgba(79,70,229,0.8)]"
              >
                Get Started

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="/features"
                className="group flex h-11 items-center gap-2 rounded-xl border border-indigo-100 bg-white px-5 text-[13px] font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50/60 hover:shadow-md"
              >
                Explore features

                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* VIDEO */}

          <div
            className="media-visual relative"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative overflow-visible">
              <div className="absolute -inset-8 rounded-[35px] bg-indigo-200/40 blur-3xl" />

              <div className="relative overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-[0_35px_90px_-38px_rgba(49,46,129,0.42)]">
                <div className="flex h-11 items-center gap-1.5 border-b border-indigo-50 bg-indigo-50/60 px-4">
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />

                  <div className="mx-3 flex h-6 flex-1 items-center rounded-lg border border-indigo-100 bg-white px-3">
                    <div className="h-1.5 w-24 rounded-full bg-indigo-100" />
                  </div>

                  <div className="h-5 w-5 rounded-md bg-indigo-100" />
                </div>

                <div className="relative aspect-[16/10] overflow-hidden bg-indigo-50">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    src={COMMUNICATION_VIDEO}
                    poster={COMMUNICATION_IMAGE}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-indigo-950/10 via-transparent to-white/15" />

                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-[10px] font-semibold text-indigo-900 shadow-xl backdrop-blur-md">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                      <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
                    </span>

                    Live collaboration
                  </div>

                  <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-xl border border-white/60 bg-white/85 px-3 py-2 shadow-xl backdrop-blur-md sm:flex">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <MousePointer2 className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-indigo-950">
                        Team synced
                      </p>

                      <p className="text-[8px] text-indigo-500">
                        Everything up to date
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TASK FLOAT */}

              <div className="media-float-card float-one absolute -left-5 bottom-8 hidden w-[195px] rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.4)] sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-indigo-950">
                      Task completed
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#7A869A]">
                      Landing page review
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-50">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                </div>
              </div>

              {/* ACTIVITY */}

              <div className="media-float-card float-two absolute -bottom-5 -right-5 hidden w-[205px] rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.4)] sm:block">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-950">
                    Team activity
                  </span>

                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50">
                    <Activity className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'Alex',
                      text: 'updated task',
                      bg: 'bg-indigo-100',
                      color: 'text-indigo-600',
                    },
                    {
                      name: 'Sarah',
                      text: 'left a comment',
                      bg: 'bg-violet-100',
                      color: 'text-violet-600',
                    },
                    {
                      name: 'Mike',
                      text: 'completed task',
                      bg: 'bg-emerald-100',
                      color: 'text-emerald-600',
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold ${item.bg} ${item.color}`}
                      >
                        {item.name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] text-[#7A869A]">
                          <span className="font-semibold text-indigo-900">
                            {item.name}
                          </span>{' '}
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECOND SECTION */}

        <div className="mt-28 grid items-center gap-14 lg:grid-cols-[1.18fr_0.82fr] lg:gap-20">
          {/* IMAGE */}

          <div className="order-2 relative lg:order-1">
            <div className="absolute -inset-7 rounded-[35px] bg-indigo-100/50 blur-3xl" />

            <div className="group relative overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-[0_35px_90px_-38px_rgba(49,46,129,0.35)]">
              <img
                src={COMMUNICATION_IMAGE}
                alt="AeroPilot team collaboration"
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.025]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-indigo-950/10 via-transparent to-white/10" />
            </div>

            {/* PROJECT CARD */}

            <div className="absolute -right-4 -top-5 hidden items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 shadow-xl sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers3 className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-[9px] font-semibold text-indigo-950">
                  Project updated
                </p>

                <p className="text-[8px] text-indigo-400">
                  Just now
                </p>
              </div>
            </div>

            {/* REMINDER CARD */}

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 shadow-xl sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Bell className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-[9px] font-semibold text-indigo-950">
                  Smart reminder
                </p>

                <p className="text-[8px] text-indigo-400">
                  Follow-up scheduled
                </p>
              </div>
            </div>
          </div>

          {/* COPY */}

          <div className="order-1 lg:order-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              One connected workspace
            </div>

            <h2 className="text-4xl font-semibold tracking-[-0.045em] text-indigo-950 sm:text-5xl sm:leading-[1.06]">
              Build your ideal workflow
              <br />

              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                and save more time
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#44546F]">
              Create customizable workflows, organize projects,
              manage subtasks and connect your team's work in one
              beautifully simple workspace.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: BarChart3,
                  title: 'Live reporting',
                  text: 'Know what is happening.',
                },
                {
                  icon: Bell,
                  title: 'Smart reminders',
                  text: 'Never miss a follow-up.',
                },
                {
                  icon: ListChecks,
                  title: 'Subtasks',
                  text: 'Break work into smaller steps.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure workspace',
                  text: 'Keep your work protected.',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-indigo-100/70 bg-indigo-50/40 p-3.5 transition-all duration-400 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-[0_15px_35px_-18px_rgba(79,70,229,0.45)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-50 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-indigo-950">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[9px] leading-4 text-[#7A869A]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   MAIN HOW IT WORKS
============================================================ */

const HowItWorks = ({ showChrome = true }) => {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ========================================================
         INITIAL STATES
      ======================================================== */

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

      gsap.set('.hero-cta', {
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
        scale: 0.98,
      })

      /* ========================================================
         HERO
      ======================================================== */

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
        .to(
          '.hero-cta',
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
          },
          '-=0.25'
        )

      /* ========================================================
         HERO ORBS
      ======================================================== */

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

      gsap.to('.hero-orb-three', {
        x: 20,
        y: -25,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      /* ========================================================
         HERO BADGE SHIMMER
      ======================================================== */

      gsap.to('.hero-badge-dot', {
        scale: 1.35,
        opacity: 0.45,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* ========================================================
         STEPS
      ======================================================== */

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

      /* ========================================================
         PREVIEW BARS
      ======================================================== */

      gsap.utils
        .toArray('.preview-bar')
        .forEach((bar, index) => {
          gsap.fromTo(
            bar,
            {
              scaleY: 0.2,
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

      /* ========================================================
         STEP ICON PULSE
      ======================================================== */

      gsap.utils
        .toArray('.step-icon')
        .forEach((icon) => {
          const ring = icon.querySelector('span')

          if (!ring) return

          gsap.to(ring, {
            boxShadow:
              '0 0 0 7px rgba(99,102,241,0)',
            duration: 1.8,
            ease: 'power2.out',
            repeat: -1,
            repeatDelay: 2,
          })
        })

      /* ========================================================
         COMMUNICATION SECTION
      ======================================================== */

      gsap.utils
        .toArray('.communication-reveal')
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 35,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 82%',
                toggleActions:
                  'play none none none',
              },
            }
          )
        })

      /* ========================================================
         CTA
      ======================================================== */

      const ctaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      ctaTimeline.to('.cta-section', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
      })

      /* ========================================================
         CTA GLOW
      ======================================================== */

      gsap.to('.cta-glow', {
        scale: 1.12,
        opacity: 0.75,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* ========================================================
         BUTTON HOVER
      ======================================================== */

      gsap.utils
        .toArray('.magnetic-btn')
        .forEach((button) => {
          const arrow =
            button.querySelector('.cta-arrow')

          const moveIn = () => {
            gsap.to(button, {
              y: -3,
              scale: 1.025,
              duration: 0.25,
              ease: 'power2.out',
            })

            if (arrow) {
              gsap.to(arrow, {
                x: 5,
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

          button.addEventListener(
            'mouseenter',
            moveIn
          )

          button.addEventListener(
            'mouseleave',
            moveOut
          )

          button._gsapMoveIn = moveIn
          button._gsapMoveOut = moveOut
        })

      /* ========================================================
         PREVIEW HOVER
      ======================================================== */

      gsap.utils
        .toArray('[data-preview]')
        .forEach((card) => {
          const moveIn = () => {
            gsap.to(card, {
              y: -6,
              scale: 1.025,
              duration: 0.35,
              ease: 'power2.out',
            })
          }

          const moveOut = () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
            })
          }

          card.addEventListener(
            'mouseenter',
            moveIn
          )

          card.addEventListener(
            'mouseleave',
            moveOut
          )

          card._gsapMoveIn = moveIn
          card._gsapMoveOut = moveOut
        })

      /* ========================================================
         REDUCED MOTION
      ======================================================== */

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReducedMotion) {
        gsap.globalTimeline.timeScale(4)
      }

      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 600)

      return () => {
        clearTimeout(refreshTimeout)

        gsap.utils
          .toArray('.magnetic-btn')
          .forEach((button) => {
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

        gsap.utils
          .toArray('[data-preview]')
          .forEach((card) => {
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
      className={`overflow-x-hidden ${
        showChrome
          ? 'marketing-page'
          : 'bg-[#F8F9FF] text-indigo-950'
      }`}
    >
      {showChrome && (
        <Navbar activePage="how-it-works" />
      )}

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative overflow-hidden border-b border-indigo-100/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-orb-one absolute -left-40 -top-44 h-[460px] w-[460px] rounded-full bg-indigo-100/70 blur-3xl" />

          <div className="hero-orb-two absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-violet-100/70 blur-3xl" />

          <div className="hero-orb-three absolute bottom-[-250px] left-1/3 h-[430px] w-[430px] rounded-full bg-indigo-50/80 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(79,70,229,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,.08) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              maskImage:
                'linear-gradient(to bottom, black, transparent 85%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-20">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-[0_8px_30px_-15px_rgba(79,70,229,0.4)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="hero-badge-dot absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
            </span>

            Simple setup. Powerful workflow.
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.055em] text-indigo-950 sm:text-6xl">
            <span className="hero-title-line inline-block">
              From sign-up to
            </span>{' '}

            <span className="hero-title-line inline-block bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
              shipped
            </span>
          </h1>

          <p className="hero-description mx-auto mt-5 max-w-lg text-[14px] leading-7 text-[#5E6C84]">
            No lengthy onboarding. Most teams have their first
            board running the same day they sign up.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {[
              {
                icon: Clock,
                label: '2 min setup',
              },
              {
                icon: Zap,
                label: 'Real-time sync',
              },
              {
                icon: Shield,
                label: 'SOC 2 ready',
              },
            ].map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.label}
                  className="hero-feature flex items-center gap-1.5 text-[11px] font-medium text-[#626F86]"
                >
                  <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  {feature.label}
                </div>
              )
            })}
          </div>

          <div className="hero-cta mt-9 flex items-center justify-center">
            <a
              href="/signup"
              className="magnetic-btn group flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-[13px] font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition-colors duration-300 hover:bg-indigo-700"
            >
              Start building

              <ArrowRight className="cta-arrow h-4 w-4 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          STEPS
      ======================================================== */}

      <section className="relative mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[90%] w-[500px] -translate-x-1/2 rounded-full bg-indigo-50/50 blur-3xl" />

        <div className="relative mb-14 text-center">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
            HOW IT WORKS
          </div>

          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-indigo-950 sm:text-4xl">
            A workflow that stays simple
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-[#697586]">
            From planning to delivery, AeroPilot keeps every part
            of your workflow connected.
          </p>
        </div>

        <div className="relative space-y-12 sm:space-y-10">
          {STEPS.map((step, index) => (
            <StepItem
              key={step.step}
              {...step}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ========================================================
          COMMUNICATION
      ======================================================== */}

      <CommunicationSection />

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="mx-auto max-w-5xl px-5 pb-24 pt-20 sm:px-6">
        <div className="cta-section marketing-card group relative overflow-hidden rounded-[32px] border border-indigo-100 bg-white px-6 py-14 text-center shadow-[0_25px_80px_-35px_rgba(79,70,229,0.3)] sm:px-12 sm:py-16">
          {/* GLOWS */}

          <div className="cta-glow pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />

          {/* GRID */}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              maskImage:
                'linear-gradient(to bottom, black, transparent)',
            }}
          />

          <div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="relative z-10">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-indigo-600 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                <Sparkles className="h-3 w-3" />
              </span>

              START TODAY
            </div>

            <h3 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.045em] text-indigo-950 sm:text-4xl lg:text-[44px] lg:leading-[1.05]">
              Ready to ship faster?
            </h3>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#626F86] sm:text-[15px]">
              Bring your tasks, subtasks, projects and team into
              one beautifully organized workspace with AeroPilot.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="magnetic-btn group/btn relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-6 text-[13px] font-semibold text-white shadow-[0_15px_35px_-14px_rgba(79,70,229,0.75)] transition-all duration-300 hover:bg-indigo-700 sm:w-auto"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />

                <span className="relative">
                  Start for free
                </span>

                <ArrowRight className="cta-arrow relative h-4 w-4" />
              </a>

              <a
                href="/contact"
                className="group flex h-11 w-full items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white px-6 text-[13px] font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md sm:w-auto"
              >
                Talk to us

                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* TRUST */}

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-medium text-[#8993A4] sm:text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No credit card required
              </div>

              <span className="hidden h-3 w-px bg-indigo-100 sm:block" />

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                Secure & reliable
              </div>

              <span className="hidden h-3 w-px bg-indigo-100 sm:block" />

              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Cancel anytime
              </div>
            </div>

            {/* TEAM PREVIEW */}

            <div className="mx-auto mt-10 flex max-w-lg items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 px-3 py-2.5 shadow-[0_10px_35px_-18px_rgba(79,70,229,0.35)] backdrop-blur-md">
                <div className="flex -space-x-2">
                  {[
                    [
                      'AK',
                      'bg-indigo-100 text-indigo-600',
                    ],
                    [
                      'JS',
                      'bg-violet-100 text-violet-600',
                    ],
                    [
                      'RM',
                      'bg-sky-100 text-sky-600',
                    ],
                    [
                      '+9',
                      'bg-indigo-50 text-indigo-500',
                    ],
                  ].map(([initial, style]) => (
                    <div
                      key={initial}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold shadow-sm ${style}`}
                    >
                      {initial}
                    </div>
                  ))}
                </div>

                <div className="h-5 w-px bg-indigo-100" />

                <span className="text-[10px] font-medium text-indigo-700">
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
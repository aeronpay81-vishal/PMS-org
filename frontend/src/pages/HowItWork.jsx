import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Menu,
  X,
  ArrowRight,
  Users,
  ListChecks,
  Activity,
  LineChart,
} from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Users,
    title: 'Create a workspace',
    body: 'Set up your organization, invite teammates, and pick the project types you need. Takes about two minutes.',
    preview: 'workspace',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Lay out the work',
    body: 'Break projects into tasks, assign owners, and set the milestones that matter. Import from a spreadsheet if you already have one.',
    preview: 'tasks',
  },
  {
    step: '03',
    icon: Activity,
    title: 'Track it to done',
    body: 'Watch boards and reports update in real time as your team moves work forward, with reminders handling the follow-up.',
    preview: 'tracking',
  },
  {
    step: '04',
    icon: LineChart,
    title: 'Review and improve',
    body: 'Use burndown charts and workload views to see what is working, then adjust before the next sprint starts.',
    preview: 'review',
  },
]

// Scroll animation hook
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? 'border-slate-200 bg-white/95 shadow-md backdrop-blur-xl'
          : 'border-slate-200/80 bg-white/90 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30 transition-transform group-hover:scale-110">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 transition-colors">AeroPilot</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          {['Features', 'How it works', 'Pricing', 'FAQ'].map((item, idx) => (
            <a
              key={item}
              href={`/${item.toLowerCase().replace(' ', '-')}`}
              className={`text-sm font-medium transition-colors duration-200 ${
                item === 'How it works'
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            Sign in
          </a>
          <a
            href="/signup"
            className="flex h-9 items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-medium text-white transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            Get started
          </a>
        </div>
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {navOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-slate-200 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {['Features', 'How it works', 'Pricing', 'FAQ'].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

const Footer = () => (
  <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 py-10 transition-colors">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold text-slate-900">AeroPilot</span>
      </div>
      <p className="text-[9px] text-slate-400">© 2026 AeroPilot Project Management. All rights reserved.</p>
    </div>
  </footer>
)

// Enhanced preview with animations
const StepPreview = ({ kind, isVisible }) => {
  const body = () => {
    if (kind === 'workspace') {
      return (
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: isVisible ? '200ms' : '0ms', animationFillMode: 'both' }}>
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 transition-transform hover:scale-110" />
            <div className="h-2 w-24 rounded-full bg-slate-200 transition-all hover:w-32" />
          </div>
          <div className="flex -space-x-1.5 pt-1 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: isVisible ? '400ms' : '0ms', animationFillMode: 'both' }}>
            {['bg-indigo-300', 'bg-violet-300', 'bg-slate-300', 'bg-indigo-200'].map((c, i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full border-2 border-white ${c} transition-transform hover:scale-125 hover:-translate-y-1`}
                style={{ transitionDelay: `${i * 50}ms` }}
              />
            ))}
            <span className="ml-2 flex h-6 items-center text-[10px] text-slate-400 transition-colors hover:text-slate-600">+ Invite</span>
          </div>
        </div>
      )
    }
    if (kind === 'tasks') {
      return (
        <div className="space-y-1.5 p-4">
          {['Set up billing', 'Design landing page', 'QA — checkout flow'].map((t, idx) => (
            <div
              key={t}
              className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-2 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: isVisible ? `${300 + idx * 100}ms` : '0ms', animationFillMode: 'both' }}
            >
              <span className="h-3 w-3 shrink-0 rounded-[4px] border border-slate-300 transition-colors group-hover:border-indigo-400" />
              <span className="text-[10px] text-slate-700">{t}</span>
            </div>
          ))}
        </div>
      )
    }
    if (kind === 'tracking') {
      return (
        <div className="grid grid-cols-3 gap-2 p-4">
          {['To do', 'Doing', 'Done'].map((c, i) => (
            <div
              key={c}
              className="rounded-md bg-slate-50 p-1.5 transition-all hover:bg-slate-100 hover:shadow-md animate-in fade-in scale-in-50"
              style={{ animationDelay: isVisible ? `${200 + i * 100}ms` : '0ms', animationFillMode: 'both' }}
            >
              <p className="mb-1.5 text-[9px] text-slate-500">{c}</p>
              <div
                className={`h-8 rounded border border-slate-200 bg-white transition-all ${
                  i === 1 ? 'ring-2 ring-indigo-300 shadow-md' : 'hover:border-slate-300'
                }`}
              />
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="p-4">
        <div className="flex h-16 items-end gap-1.5">
          {[40, 65, 50, 80, 60, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500 to-violet-400 transition-all hover:from-indigo-600 hover:to-violet-500 animate-in fade-in fill-mode-both"
              style={{
                height: `${h}%`,
                animationDelay: isVisible ? `${200 + i * 80}ms` : '0ms',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 transition-all duration-700 sm:w-56 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '100ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" style={{ animationDelay: '200ms' }} />
      </div>
      {body()}
    </div>
  )
}

// Enhanced step item with scroll animation
const StepItem = ({ step, icon: Icon, title, body, preview, index }) => {
  const [ref, isVisible] = useScrollAnimation(0.2)

  return (
    <div
      ref={ref}
      className={`flex gap-6 sm:gap-8 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col items-center">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600 transition-all duration-500 ${
            isVisible ? 'scale-100 shadow-lg shadow-indigo-200' : 'scale-0'
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        {index < STEPS.length - 1 && (
          <span className={`mt-2 w-px flex-1 bg-gradient-to-b from-slate-200 to-transparent transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 pb-12 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="sm:max-w-sm">
          <p
            className={`text-xs font-medium text-indigo-500 transition-all duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Step {step}
          </p>
          <h3
            className={`mt-1 text-lg font-semibold text-slate-900 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {title}
          </h3>
          <p
            className={`mt-2 text-sm leading-6 text-slate-600 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {body}
          </p>
        </div>
        <StepPreview kind={preview} isVisible={isVisible} />
      </div>
    </div>
  )
}

const HowItWorks = ({ showChrome = true }) => {
  const [titleRef, titleVisible] = useScrollAnimation(0.3)
  const [descRef, descVisible] = useScrollAnimation(0.3)
  const [ctaRef, ctaVisible] = useScrollAnimation(0.2)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {showChrome && <Navbar />}

      <section className="mx-auto max-w-3xl px-5 pb-6 pt-16 text-center sm:px-8 sm:pt-20">
        <h1
          ref={titleRef}
          className={`text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl transition-all duration-700 ${
            titleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          From sign-up to shipped
        </h1>
        <p
          ref={descRef}
          className={`mx-auto mt-4 max-w-md text-base leading-7 text-slate-600 transition-all duration-700 ${
            descVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: descVisible ? '200ms' : '0ms' }}
        >
          No lengthy onboarding. Most teams have their first board running
          the same day they sign up.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
        <div>
          {STEPS.map((step, i) => (
            <StepItem key={step.step} {...step} index={i} />
          ))}
        </div>

        <div
          ref={ctaRef}
          className={`mt-2 flex flex-col items-center gap-3 border-t border-slate-100 pt-10 text-center transition-all duration-700 ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <a
            href="/signup"
            className="group flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-6 text-sm font-semibold text-white shadow-[0_8px_25px_-8px_rgba(99,102,241,0.5)] transition-all hover:shadow-[0_12px_35px_-8px_rgba(99,102,241,0.7)] hover:-translate-y-1 active:scale-95"
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <p className="text-xs text-slate-400">No credit card required</p>
        </div>
      </section>

      {showChrome && <Footer />}

      {/* Global animation styles */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .slide-in-from-left-2 {
          animation: slideInFromLeft 0.6s ease-out forwards;
        }

        .slide-in-from-bottom-2 {
          animation: slideInFromBottom 0.6s ease-out forwards;
        }

        .slide-in-from-bottom-3 {
          animation: slideInFromBottom 0.7s ease-out forwards;
        }

        .scale-in-50 {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .fill-mode-both {
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}

export default HowItWorks
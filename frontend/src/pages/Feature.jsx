import { useState } from 'react'
import {
  LayoutDashboard,
  Menu,
  X,
  KanbanSquare,
  BellRing,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'

const TABS = [
  {
    id: 'boards',
    label: 'Smart boards',
    icon: KanbanSquare,
    title: 'Boards that organize themselves',
    body: 'Drag tasks across custom columns, group by owner or sprint, and let AeroPilot auto-sort overdue work to the top so nothing gets buried.',
    points: [
      'Custom columns per project',
      'Auto-sort by due date or priority',
      'Switch between board, list, and timeline',
    ],
  },
  {
    id: 'reminders',
    label: 'Automated reminders',
    icon: BellRing,
    title: 'Deadlines nobody has to chase',
    body: 'Every task carries its own owner and due date. AeroPilot nudges the right person automatically, so status updates stop living in chat.',
    points: [
      'Owner-aware notifications',
      'Escalation for tasks left untouched',
      'Digest emails instead of noise',
    ],
  },
  {
    id: 'reporting',
    label: 'Live reporting',
    icon: BarChart3,
    title: 'Progress you can see at a glance',
    body: 'Burndown charts and workload views update in real time, turning status meetings into decisions instead of updates.',
    points: [
      'Real-time burndown charts',
      'Per-teammate workload view',
      'One-click shareable reports',
    ],
  },
]

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/30">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">AeroPilot</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="/features" className="text-sm font-medium text-slate-900">Features</a>
          <a href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it works</a>
          <a href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
          <a href="/faq" className="text-sm font-medium text-slate-600 hover:text-slate-900">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign in</a>
          <a href="/signup" className="flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">Get started</a>
        </div>
        <button type="button" onClick={() => setNavOpen((v) => !v)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 md:hidden">
          {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {navOpen && (
        <div className="border-t border-slate-200 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="/features" className="text-sm font-medium text-slate-900">Features</a>
            <a href="/how-it-works" className="text-sm font-medium text-slate-600">How it works</a>
            <a href="/pricing" className="text-sm font-medium text-slate-600">Pricing</a>
            <a href="/faq" className="text-sm font-medium text-slate-600">FAQ</a>
          </div>
        </div>
      )}
    </header>
  )
}

const Footer = () => (
  <footer className="border-t border-slate-200 py-10">
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

// Small mock "app window" illustration standing in for a product screenshot
const FeatureMock = ({ active }) => {
  if (active === 'boards') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['To do', 'In progress', 'Done'].map((col) => (
            <div key={col} className="rounded-lg bg-slate-50 p-2">
              <p className="mb-2 text-[10px] font-semibold text-slate-500">{col}</p>
              <div className="space-y-1.5">
                <div className="h-10 rounded-md border border-slate-200 bg-white" />
                <div className="h-10 rounded-md border border-slate-200 bg-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (active === 'reminders') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Notifications</p>
        <div className="space-y-2.5">
          {['Due today: Update client deck', 'Overdue: Review API spec', 'Assigned to you: QA pass'].map((row) => (
            <div key={row} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              <span className="text-[11px] text-slate-700">{row}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sprint burndown</p>
      <div className="flex h-28 items-end gap-2">
        {[80, 65, 60, 45, 38, 22, 10].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

const Features = ({ showChrome = true }) => {
  const [active, setActive] = useState('boards')
  const current = TABS.find((t) => t.id === active)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {showChrome && <Navbar />}

      <section className="mx-auto max-w-5xl px-5 pb-4 pt-16 text-center sm:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Do more with less busywork
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          AeroPilot handles the tracking and nudging, so your team spends
          time on the work itself.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FeatureMock active={active} />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {current.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {current.body}
            </p>
            <ul className="mt-6 space-y-3">
              {current.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {showChrome && <Footer />}
    </div>
  )
}

export default Features
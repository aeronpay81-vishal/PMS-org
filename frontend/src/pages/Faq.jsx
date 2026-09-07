import { useState } from 'react'
import { LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'Can I switch between the Organization and User account types?',
    a: 'Yes. An Organization account manages the workspace and billing, while a User account joins an existing workspace. You can be invited into other workspaces with a User account even if you also run your own as an Organization.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes, the Starter plan is free for up to 5 teammates and 3 active projects, with no credit card required.',
  },
  {
    q: 'Can I import data from another tool?',
    a: 'You can import tasks from a spreadsheet during setup. Direct importers for common tools are on our roadmap.',
  },
  {
    q: 'How is my data secured?',
    a: 'All data is encrypted in transit and at rest. Enterprise plans add SSO and audit logs for additional control.',
  },
  {
    q: 'Can I cancel or downgrade at any time?',
    a: 'Yes, plans are month to month with no lock-in. You can downgrade or cancel from your billing settings at any time.',
  },
  {
    q: 'Do you offer support during onboarding?',
    a: 'Team and Enterprise plans include priority support, and Enterprise plans include dedicated onboarding assistance.',
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
          <a href="/features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
          <a href="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it works</a>
          <a href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
          <a href="/faq" className="text-sm font-medium text-slate-900">FAQ</a>
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
            <a href="/features" className="text-sm font-medium text-slate-600">Features</a>
            <a href="/how-it-works" className="text-sm font-medium text-slate-600">How it works</a>
            <a href="/pricing" className="text-sm font-medium text-slate-600">Pricing</a>
            <a href="/faq" className="text-sm font-medium text-slate-900">FAQ</a>
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

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-[15px] font-medium text-slate-900">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{a}</p>}
    </div>
  )
}

const FAQ = ({ showChrome = true }) => (
  <div className="min-h-screen bg-white text-slate-900">
    {showChrome && <Navbar />}

    <section className="mx-auto max-w-3xl px-5 pb-4 pt-16 text-center sm:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Can't find what you're looking for? Reach out and we'll get back to you.
      </p>
    </section>

    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      {QUESTIONS.map((item) => (
        <FaqItem key={item.q} q={item.q} a={item.a} />
      ))}
    </section>

    {showChrome && <Footer />}
  </div>
)

export default FAQ
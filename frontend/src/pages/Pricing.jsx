import { useState } from 'react'
import { LayoutDashboard, Menu, X, Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    tagline: 'For small teams getting organized',
    features: ['Up to 5 teammates', '3 active projects', 'Basic boards & lists', 'Community support'],
    highlight: false,
  },
  {
    name: 'Team',
    price: '$9',
    period: '/user/mo',
    tagline: 'For teams that need reporting and automation',
    features: ['Unlimited projects', 'Automated reminders', 'Live reporting & burndown', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    tagline: 'For organizations with security & scale needs',
    features: ['SSO & audit logs', 'Dedicated onboarding', 'Custom integrations', 'SLA-backed support'],
    highlight: false,
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
          <a href="/pricing" className="text-sm font-medium text-slate-900">Pricing</a>
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
            <a href="/features" className="text-sm font-medium text-slate-600">Features</a>
            <a href="/how-it-works" className="text-sm font-medium text-slate-600">How it works</a>
            <a href="/pricing" className="text-sm font-medium text-slate-900">Pricing</a>
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

const Pricing = ({ showChrome = true }) => (
  <div className="min-h-screen bg-white text-slate-900">
    {showChrome && <Navbar />}

    <section className="mx-auto max-w-3xl px-5 pb-4 pt-16 text-center sm:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Simple pricing, no surprises
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        Start free. Upgrade only when your team actually needs more.
      </p>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-7 ${
              plan.highlight
                ? 'border-indigo-500 bg-indigo-50/40 shadow-[0_30px_80px_-40px_rgba(99,102,241,0.45)]'
                : 'border-slate-200 bg-white'
            }`}
          >
            {plan.highlight && (
              <span className="mb-3 w-fit rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold text-white">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-3xl font-semibold tracking-tight text-slate-900">{plan.price}</span>
              {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className={`mt-7 flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                plan.highlight
                  ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-[0_8px_25px_-8px_rgba(99,102,241,0.5)] hover:-translate-y-[1px]'
                  : 'border border-slate-200 text-slate-900 hover:border-slate-300'
              }`}
            >
              {plan.price === 'Custom' ? 'Contact sales' : 'Get started'}
            </a>
          </div>
        ))}
      </div>
    </section>

    {showChrome && <Footer />}
  </div>
)

export default Pricing
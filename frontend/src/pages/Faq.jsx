import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Navbar from '../components/navigation/Navbar'
import Footer from './Footer'

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
    {showChrome && <Navbar activePage="faq" />}

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
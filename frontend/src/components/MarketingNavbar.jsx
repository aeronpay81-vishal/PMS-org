import { LayoutDashboard, ArrowUpRight } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Features', href: '/features', key: 'features' },
  { label: 'How it works', href: '/how-it-works', key: 'how-it-works' },
  { label: 'Pricing', href: '/pricing', key: 'pricing' },
  { label: 'FAQ', href: '/faq', key: 'faq' },
  { label: 'Contact', href: '/contact', key: 'contact' },
]

const MarketingNavbar = ({ activePage, variant = 'default', isLogin, onSwitchMode }) => {
  const authLabel = variant === 'auth'
    ? isLogin ? 'Create account' : 'Sign in'
    : 'Get started'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C66E4] text-white shadow-sm shadow-blue-500/25">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#172B4D]">AeroPilot</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition ${activePage === item.key ? 'bg-[#E9F2FF] text-[#0C66E4]' : 'text-[#626F86] hover:bg-[#F7F8F9] hover:text-[#172B4D]'}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {variant === 'auth' ? (
            <span className="hidden text-[12px] text-[#626F86] sm:block">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
          ) : (
            <a href="/login" className="hidden text-[13px] font-medium text-[#626F86] transition hover:text-[#172B4D] sm:block">Sign in</a>
          )}
          <button
            type={variant === 'auth' ? 'button' : undefined}
            onClick={variant === 'auth' ? onSwitchMode : undefined}
            className="group flex h-9 items-center gap-1.5 rounded-lg bg-[#172B4D] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#0C66E4]"
          >
            {variant === 'auth' ? authLabel : authLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default MarketingNavbar

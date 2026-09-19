import { useState } from 'react'
import { ArrowUpRight, LayoutDashboard, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Features', href: '/features', key: 'features' },
  { label: 'How it works', href: '/how-it-works', key: 'how-it-works' },
  { label: 'Pricing', href: '/pricing', key: 'pricing' },
  { label: 'FAQ', href: '/faq', key: 'faq' },
  { label: 'Contact', href: '/contact', key: 'contact' },
  { label: 'Blog', href: '/blog', key: 'blog' },
]

const Navbar = ({ activePage, variant = 'default', isLogin = true, onSwitchMode }) => {
  const [navOpen, setNavOpen] = useState(false)
  const authLabel = variant === 'auth' ? (isLogin ? 'Create account' : 'Sign in') : 'Get started'
  const authHref = variant === 'auth' ? undefined : '/login'

  const handleAuthAction = () => {
    if (variant === 'auth') onSwitchMode?.()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="AeroPilot home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C66E4] text-white shadow-sm shadow-blue-500/25"><LayoutDashboard className="h-4 w-4" /></span>
          <span className="text-[15px] font-semibold tracking-tight text-[#172B4D]">AeroPilot</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => <a key={item.key} href={item.href} className={`rounded-lg px-3 py-2 text-[13px] font-medium transition ${activePage === item.key ? 'bg-[#E9F2FF] text-[#0C66E4]' : 'text-[#626F86] hover:bg-[#F7F8F9] hover:text-[#172B4D]'}`}>{item.label}</a>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {variant === 'auth' ? <span className="text-[12px] text-[#626F86]">{isLogin ? "Don't have an account?" : 'Already have an account?'}</span> : <a href="/login" className="text-[13px] font-medium text-[#626F86] transition hover:text-[#172B4D]">Sign in</a>}
          {authHref ? <a href={authHref} className="group flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-medium text-white transition hover:bg-indigo-700">{authLabel}<ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a> : <button type="button" onClick={handleAuthAction} className="group flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-medium text-white transition hover:bg-indigo-700">{authLabel}<ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button>}
        </div>

        <button type="button" aria-label={navOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setNavOpen((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#626F86] hover:bg-[#F7F8F9] md:hidden">
          {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {navOpen && <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden"><nav className="flex flex-col gap-1" aria-label="Mobile navigation">{NAV_ITEMS.map((item) => <a key={item.key} href={item.href} onClick={() => setNavOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${activePage === item.key ? 'bg-[#E9F2FF] text-[#0C66E4]' : 'text-[#626F86] hover:bg-[#F7F8F9]'}`}>{item.label}</a>)}<a href={variant === 'auth' ? '/login' : '/login'} className="mt-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-center text-sm font-semibold text-white">{variant === 'auth' ? (isLogin ? 'Create account' : 'Sign in') : 'Sign in'}</a></nav></div>}
    </header>
  )
}

export default Navbar

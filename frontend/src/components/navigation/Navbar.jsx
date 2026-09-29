import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Logo from "../../../public/logo.png";
import { Link } from "react-router-dom";
const NAV_ITEMS = [
  { label: "Features", href: "/features", key: "features" },
  { label: "How it works", href: "/how-it-works", key: "how-it-works" },
  { label: "Pricing", href: "/pricing", key: "pricing" },
  { label: "FAQ", href: "/faq", key: "faq" },
  { label: "Contact", href: "/contact", key: "contact" },
  { label: "Blog", href: "/blog", key: "blog" },
];

const Navbar = ({
  activePage,
  variant = "default",
  isLogin = true,
  onSwitchMode,
}) => {
  const [navOpen, setNavOpen] = useState(false);

  const authLabel =
    variant === "auth"
      ? isLogin
        ? "Create account"
        : "Sign in"
      : "Get started";

  const authHref = variant === "auth" ? undefined : "/login";

  const handleAuthAction = () => {
    if (variant === "auth") {
      onSwitchMode?.();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          aria-label="AeroPilot home"
          className="group flex items-center"
        >
          <img
            src={Logo}
            alt="AeroPilot"
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/70 p-1 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                to={item.href}
                className={`relative rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/70"
                    : "text-slate-500 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                {item.label}

                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {variant === "auth" ? (
            <span className="text-[12px] text-slate-400">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
          ) : (
            <Link
              to="/login"
              className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Sign in
            </Link>
          )}

          {authHref ? (
            <Link
              to={authHref}
              className="
                group relative flex h-10 items-center gap-2
                overflow-hidden rounded-full
                bg-gradient-to-r from-indigo-600 to-violet-600
                px-5 text-[12.5px] font-semibold text-white
                shadow-md shadow-indigo-500/20
                transition-all duration-200
                hover:-translate-y-0.5
                hover:from-indigo-700
                hover:to-violet-700
                hover:shadow-lg hover:shadow-indigo-500/25
              "
            >
              <span>{authLabel}</span>

              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAuthAction}
              className="
                group relative flex h-10 items-center gap-2
                rounded-full
                bg-gradient-to-r from-indigo-600 to-violet-600
                px-5 text-[12.5px] font-semibold text-white
                shadow-md shadow-indigo-500/20
                transition-all duration-200
                hover:-translate-y-0.5
                hover:from-indigo-700
                hover:to-violet-700
                hover:shadow-lg
              "
            >
              <span>{authLabel}</span>

              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((value) => !value)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full border border-slate-200
            bg-white text-slate-600
            shadow-sm
            transition-all
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
            md:hidden
          "
        >
          {navOpen ? (
            <X className="h-[18px] w-[18px]" />
          ) : (
            <Menu className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden ${
          navOpen
            ? "max-h-[520px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-6"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key;

            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setNavOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{item.label}</span>

                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}

          {/* Mobile Auth */}
          {variant === "auth" ? (
            <button
              type="button"
              onClick={() => {
                setNavOpen(false);
                handleAuthAction();
              }}
              className="
                mt-3 flex h-11 items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-r from-indigo-600 to-violet-600
                text-[13px] font-semibold text-white
                shadow-md shadow-indigo-500/20
              "
            >
              {authLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setNavOpen(false)}
              className="
                mt-3 flex h-11 items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-r from-indigo-600 to-violet-600
                text-[13px] font-semibold text-white
                shadow-md shadow-indigo-500/20
              "
            >
              Get started
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
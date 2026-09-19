import { Link } from "react-router-dom";
import { ArrowUpRight, Send, Code2, Briefcase } from "lucide-react";
import BrandLogo from "../components/layout/BrandLogo";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Help center", to: "/help-center" },
      { label: "API reference", to: "/api-reference" },
      { label: "Security", to: "/privacy" },
    ],
  },
];

const SOCIALS = [
  { label: "Twitter", icon: Send, href: "#" },
  { label: "GitHub", icon: Code2, href: "#" },
  { label: "LinkedIn", icon: Briefcase, href: "#" },
];

const Footer = () => (
  <footer className="border-t border-slate-200/80 bg-[#F7F8F9] text-[#172B4D]">
    <div className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5]">
            Start shipping faster
          </p>
          <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-[#172B4D] sm:text-[26px]">
            Bring your team into one workspace
          </h3>
          <p className="mt-2 max-w-md text-[14px] leading-6 text-[#626F86]">
            Plan, track, and deliver work with boards, timelines, and reports built for modern teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="marketing-btn-primary p-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[0_10px_25px_-10px_rgba(79,70,229,0.7)]"
          >
            Get started free
            {/* <ArrowUpRight className="h-4 w-4" /> */}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-[#344563] hover:bg-slate-50"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-xs text-[13px] leading-6 text-[#626F86]">
            Work management software that helps teams plan, track, and deliver projects with clarity.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-[#626F86] transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F46E5]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5]">
              {column.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center text-[13px] text-[#626F86] transition hover:text-[#4F46E5]"
                  >
                    {link.label}
                    <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-[#8993A4]">
          © 2026 AeroPilot Project Management. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-5">
          {["Privacy", "Terms", "Cookies"].map((item) => (
            <a key={item} href="#" className="text-[12px] text-[#8993A4] hover:text-[#4F46E5]">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
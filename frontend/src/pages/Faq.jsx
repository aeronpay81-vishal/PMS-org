import { useState } from "react";
import {
  ChevronDown,
  Headphones,
  Mail,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  CircleHelp,
} from "lucide-react";
import Navbar from "../components/navigation/Navbar";
import Footer from "./Footer";

const QUESTIONS = [
  {
    q: "Can I switch between the Organization and User account types?",
    a: "Yes. An Organization account manages the workspace and billing, while a User account joins an existing workspace. You can be invited into other workspaces with a User account even if you also run your own as an Organization.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes, the Starter plan is free for up to 5 teammates and 3 active projects, with no credit card required.",
  },
  {
    q: "Can I import data from another tool?",
    a: "You can import tasks from a spreadsheet during setup. Direct importers for common tools are on our roadmap.",
  },
  {
    q: "How is my data secured?",
    a: "All data is encrypted in transit and at rest. Enterprise plans add SSO and audit logs for additional control.",
  },
  {
    q: "Can I cancel or downgrade at any time?",
    a: "Yes, plans are month to month with no lock-in. You can downgrade or cancel from your billing settings at any time.",
  },
  {
    q: "Do you offer support during onboarding?",
    a: "Team and Enterprise plans include priority support, and Enterprise plans include dedicated onboarding assistance.",
  },
];

const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className="faq-item group border-b border-slate-200/80 last:border-b-0"
      style={{
        animationDelay: `${0.15 + index * 0.08}s`,
      }}
    >
      <div className={`py-5 ${open ? "pb-5" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-4 text-left"
        >
          {/* Number */}
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
              open
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-105"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Question */}
          <span
            className={`flex-1 text-[15px] font-semibold leading-6 transition-all duration-300 sm:text-base ${
              open
                ? "translate-x-1 text-slate-950"
                : "text-slate-800 group-hover:translate-x-1 group-hover:text-indigo-600"
            }`}
          >
            {q}
          </span>

          {/* Arrow */}
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
              open
                ? "rotate-180 border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                : "border-slate-200 bg-white text-slate-500 group-hover:border-indigo-200 group-hover:text-indigo-600"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>

        {/* Answer animation */}
        <div
          className={`grid transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            open
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`ml-14 rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/70 px-5 py-4 transition-transform duration-500 ${
                open ? "translate-y-0" : "-translate-y-3"
              } sm:px-6`}
            >
              <p className="text-sm leading-7 text-slate-600">{a}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ = ({ showChrome = true }) => {
  return (
    <div className="faq-page min-h-screen overflow-hidden bg-white text-slate-900">
      {showChrome && <Navbar activePage="faq" />}

      <main className="relative">
        {/* =========================================================
            BACKGROUND ANIMATION
        ========================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Blue blob */}
          <div className="faq-blob faq-blob-blue absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

          {/* Violet blob */}
          <div className="faq-blob faq-blob-violet absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-violet-100/50 blur-3xl" />

          {/* Small floating dots */}
          <span className="faq-dot absolute right-[12%] top-40 h-3 w-3 rounded-full bg-indigo-400/50" />

          <span className="faq-dot-slow absolute right-[16%] top-52 h-2 w-2 rounded-full bg-violet-400/50" />

          <span className="faq-dot absolute left-[12%] top-[430px] h-2 w-2 rounded-full bg-blue-400/40" />

          <span className="faq-dot-slow absolute left-[20%] top-[520px] h-3 w-3 rounded-full bg-indigo-300/30" />
        </div>

        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {/* =====================================================
                LEFT SIDE
            ====================================================== */}

            <div className="faq-left">
              {/* Badge */}
              <div className="faq-fade-up animation-delay-100 mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm backdrop-blur">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50">
                  <CircleHelp className="h-3.5 w-3.5" />
                </span>

                Help & Support
              </div>

              {/* Heading */}
              <h1 className="faq-fade-up animation-delay-200 max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl">
                Frequently

                <span className="faq-gradient-text block">
                  asked questions
                </span>
              </h1>

              {/* Description */}
              <p className="faq-fade-up animation-delay-300 mt-6 max-w-md text-base leading-7 text-slate-500 sm:text-lg">
                Can't find what you're looking for? Browse the answers below
                or reach out to our support team.
              </p>

              {/* =====================================================
                  SUPPORT VISUAL
              ====================================================== */}

              <div className="relative mt-10 h-[250px] max-w-lg">
                {/* Orbit */}
                <div className="faq-orbit absolute left-0 top-10 h-40 w-40 rounded-full border border-indigo-200/70" />

                <div className="faq-orbit-reverse absolute left-8 top-2 h-48 w-48 rounded-full border border-blue-200/60" />

                {/* Main card */}
                <div className="faq-floating-card absolute left-8 top-8 w-[270px] rotate-[-3deg] rounded-3xl border border-white bg-white/90 p-5 shadow-[0_25px_70px_rgba(79,70,229,0.15)] backdrop-blur-xl sm:left-14">
                  <div className="flex items-center gap-3">
                    <div className="faq-icon-pulse flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        AeroPilot Help
                      </p>

                      <p className="text-xs text-slate-400">
                        We're here to help
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="faq-loading-line h-2 w-32 rounded-full bg-slate-100" />
                    <div className="faq-loading-line animation-delay-200 h-2 w-44 rounded-full bg-slate-100" />

                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ShieldCheck className="h-4 w-4" />
                      </div>

                      <div className="h-2 w-28 rounded-full bg-indigo-100" />
                    </div>
                  </div>
                </div>

                {/* AI floating icon */}
                <div className="faq-ai-float absolute right-10 top-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white shadow-xl shadow-indigo-500/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                {/* Analytics card */}
                <div className="faq-chart-float absolute bottom-3 right-5 flex h-16 w-20 items-end gap-1 rounded-2xl border border-white bg-white/90 px-4 pb-3 pt-3 shadow-xl backdrop-blur">
                  <span className="h-4 w-2 rounded-full bg-blue-200" />
                  <span className="h-7 w-2 rounded-full bg-blue-400" />
                  <span className="h-10 w-2 rounded-full bg-indigo-500" />
                  <span className="h-6 w-2 rounded-full bg-violet-400" />
                </div>
              </div>

              {/* =====================================================
                  SUPPORT CARD
              ====================================================== */}

              <div className="faq-support-card mt-2 flex max-w-lg items-center justify-between gap-5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)] sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform duration-500 group-hover:rotate-6">
                    <Headphones className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      AeroPilot Support
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Need more help? Our team is here for you.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="group hidden shrink-0 items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-600 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-500/10 sm:flex"
                >
                  <Mail className="h-4 w-4" />

                  Contact support

                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* =====================================================
                RIGHT FAQ
            ====================================================== */}

            <div className="faq-right relative">
              <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-blue-100/40 via-indigo-100/20 to-violet-100/40 blur-2xl" />

              <div className="faq-card relative overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_90px_rgba(30,41,59,0.10)] backdrop-blur-xl sm:p-6 lg:p-7">
                {/* top shine */}
                <div className="faq-card-shine pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />

                {/* Header */}
                <div className="mb-2 flex items-center justify-between px-2 pb-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                      Help center
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Everything you need to know
                    </h2>
                  </div>

                  <div className="faq-sparkle hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 sm:flex">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>

                {/* Questions */}
                <div className="mt-2">
                  {QUESTIONS.map((item, index) => (
                    <FaqItem
                      key={item.q}
                      q={item.q}
                      a={item.a}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pointer-events-none h-16 bg-gradient-to-b from-transparent to-indigo-50/40" />
      </main>

      {showChrome && <Footer />}

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        /* -----------------------------------------
           Fade / slide entrance
        ----------------------------------------- */

        .faq-fade-up {
          opacity: 0;
          transform: translateY(25px);
          animation: faqFadeUp 0.8s cubic-bezier(.22,1,.36,1) forwards;
        }

        .animation-delay-100 {
          animation-delay: .1s;
        }

        .animation-delay-200 {
          animation-delay: .2s;
        }

        .animation-delay-300 {
          animation-delay: .3s;
        }

        @keyframes faqFadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* -----------------------------------------
           Gradient heading
        ----------------------------------------- */

        .faq-gradient-text {
          background-size: 200% 200%;
          animation: gradientMove 5s ease infinite;
          background-image: linear-gradient(
            90deg,
            #3b82f6,
            #4f46e5,
            #7c3aed,
            #4f46e5,
            #3b82f6
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        /* -----------------------------------------
           Background blobs
        ----------------------------------------- */

        .faq-blob-blue {
          animation: blobFloat 9s ease-in-out infinite;
        }

        .faq-blob-violet {
          animation: blobFloatReverse 11s ease-in-out infinite;
        }

        @keyframes blobFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(35px, 25px, 0) scale(1.08);
          }
        }

        @keyframes blobFloatReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-35px, 30px, 0) scale(1.06);
          }
        }

        /* -----------------------------------------
           Decorative dots
        ----------------------------------------- */

        .faq-dot {
          animation: dotFloat 4s ease-in-out infinite;
        }

        .faq-dot-slow {
          animation: dotFloat 6s ease-in-out infinite reverse;
        }

        @keyframes dotFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-18px);
          }
        }

        /* -----------------------------------------
           Left visual
        ----------------------------------------- */

        .faq-floating-card {
          animation: cardFloat 5s ease-in-out infinite;
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-3deg);
          }

          50% {
            transform: translateY(-10px) rotate(-1deg);
          }
        }

        .faq-ai-float {
          animation: aiFloat 4s ease-in-out infinite;
        }

        @keyframes aiFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-12px) rotate(4deg);
          }
        }

        .faq-chart-float {
          animation: chartFloat 5s ease-in-out infinite;
          animation-delay: .8s;
        }

        @keyframes chartFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(8px);
          }
        }

        /* -----------------------------------------
           Orbit
        ----------------------------------------- */

        .faq-orbit {
          animation: orbitRotate 12s linear infinite;
        }

        .faq-orbit-reverse {
          animation: orbitRotateReverse 15s linear infinite;
        }

        @keyframes orbitRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitRotateReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        /* -----------------------------------------
           Icon pulse
        ----------------------------------------- */

        .faq-icon-pulse {
          animation: iconPulse 3s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 10px 25px rgba(79,70,229,.15);
          }

          50% {
            transform: scale(1.06);
            box-shadow: 0 15px 35px rgba(79,70,229,.25);
          }
        }

        /* -----------------------------------------
           Loading lines
        ----------------------------------------- */

        .faq-loading-line {
          position: relative;
          overflow: hidden;
        }

        .faq-loading-line::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99,102,241,.18),
            transparent
          );
          animation: lineShimmer 2.8s ease-in-out infinite;
        }

        @keyframes lineShimmer {
          0% {
            transform: translateX(-100%);
          }

          60%,
          100% {
            transform: translateX(100%);
          }
        }

        /* -----------------------------------------
           FAQ card entrance
        ----------------------------------------- */

        .faq-right {
          opacity: 0;
          transform: translateX(35px);
          animation: faqRightIn .9s cubic-bezier(.22,1,.36,1) .25s forwards;
        }

        @keyframes faqRightIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .faq-card {
          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease;
        }

        .faq-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 35px 100px rgba(30,41,59,.13);
        }

        /* -----------------------------------------
           FAQ items entrance
        ----------------------------------------- */

        .faq-item {
          opacity: 0;
          transform: translateY(15px);
          animation: faqItemIn .6s cubic-bezier(.22,1,.36,1) forwards;
        }

        @keyframes faqItemIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* -----------------------------------------
           Shine
        ----------------------------------------- */

        .faq-card-shine {
          animation: shineMove 4s ease-in-out infinite;
        }

        @keyframes shineMove {
          0%,
          100% {
            opacity: .25;
            transform: translateX(-20%);
          }

          50% {
            opacity: 1;
            transform: translateX(20%);
          }
        }

        /* -----------------------------------------
           Sparkle
        ----------------------------------------- */

        .faq-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            transform: rotate(0deg) scale(1);
          }

          50% {
            transform: rotate(8deg) scale(1.08);
          }
        }

        /* -----------------------------------------
           Reduced motion
        ----------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;
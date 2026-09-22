import React from "react";
import { ArrowUpRight, Play, Sparkles } from "lucide-react";
import Navbar from "../components/navigation/Navbar";
import Footer from "./Footer";

const CARDS = [
  {
    kind: "image",
    tag: "99",
    category: "ARTICLE IN",
    badges: ["AI AT WORK"],
    title: "Want more confidence in AI? Give it more context.",
    art: "confidence",
    slug: "confidence-in-ai-more-context",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    kind: "image",
    tag: "99",
    category: "ARTICLE IN",
    badges: ["COMPANY NEWS"],
    title:
      "Atlassian's usage-based pricing: AI value with predictability and control",
    art: "pricing",
    slug: "usage-based-pricing-ai-value",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    kind: "video",
    category: "VIDEO IN",
    badges: ["HOW WE BUILD"],
    title:
      "Atlassian's Chief AI Officer on building products for humans and agents",
    art: "toolbox",
    slug: "chief-ai-officer-building-for-humans-agents",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
  },
  {
    kind: "image",
    tag: "99",
    category: "ARTICLE IN",
    badges: ["COMPANY NEWS"],
    title:
      "The Agentic Pivot: Why the work around code matters more than ever",
    art: "hex",
    slug: "agentic-pivot-work-around-code",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
  },
];

function PricingArt() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-100 p-6">
      <div className="w-full max-w-[280px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-indigo-100/40">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-800">
            Monthly limit
          </span>

          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
            AI
          </span>
        </div>

        <div className="relative h-2 rounded-full bg-slate-100">
          <div className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="absolute left-[38%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-indigo-600 shadow-md" />
        </div>

        <div className="mt-3 flex justify-between text-[11px] text-slate-400">
          <span>0</span>
          <span>No limit</span>
        </div>
      </div>
    </div>
  );
}

function ToolboxArt() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-white">
      <div className="relative h-[150px] w-[190px]">
        <div className="absolute bottom-3 left-4 right-4 h-[78px] rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-300/40" />

        <div className="absolute bottom-[67px] left-4 right-4 h-6 rounded-t-2xl bg-indigo-700" />

        <div className="absolute left-1/2 top-8 h-8 w-14 -translate-x-1/2 rounded-lg border-[6px] border-indigo-700" />

        <div className="absolute left-10 top-2 h-12 w-4 rotate-[-18deg] rounded-lg bg-amber-400 shadow-lg" />

        <div className="absolute right-10 top-2 h-12 w-4 rotate-[18deg] rounded-lg bg-violet-500 shadow-lg" />

        <div className="absolute bottom-8 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-rose-500 ring-4 ring-white/20" />
      </div>
    </div>
  );
}

function HexArt() {
  return (
    <div className="relative h-full overflow-hidden bg-[#090B12]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(#252A3A 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <svg
        className="relative h-full w-full"
        viewBox="0 0 300 220"
        fill="none"
      >
        <defs>
          <linearGradient id="blogHexGradient" x1="80" y1="40" x2="220" y2="190">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        <polygon
          points="150,60 205,95 205,155 150,190 95,155 95,95"
          fill="rgba(99,102,241,0.04)"
          stroke="url(#blogHexGradient)"
          strokeWidth="3"
        />

        <circle cx="150" cy="60" r="4" fill="#818CF8" />
        <circle cx="205" cy="95" r="4" fill="#A78BFA" />
        <circle cx="205" cy="155" r="4" fill="#F59E0B" />
        <circle cx="95" cy="95" r="4" fill="#818CF8" />
      </svg>
    </div>
  );
}

function ConfidenceArt() {
  return (
    <div className="relative h-full overflow-hidden bg-[#111A32]">
      <svg
        className="h-full w-full"
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>

        <polygon
          points="0,0 260,0 130,220 0,220"
          fill="url(#confidenceGradient)"
          opacity="0.7"
        />

        <polygon
          points="130,220 260,0 400,0 400,220"
          fill="#6366F1"
          opacity="0.22"
        />

        <circle cx="150" cy="150" r="42" fill="#090F24" opacity="0.9" />
        <circle cx="270" cy="90" r="34" fill="#090F24" opacity="0.9" />

        <circle
          cx="150"
          cy="150"
          r="50"
          fill="none"
          stroke="#A5B4FC"
          strokeOpacity="0.25"
        />

        <circle
          cx="270"
          cy="90"
          r="42"
          fill="none"
          stroke="#C4B5FD"
          strokeOpacity="0.25"
        />
      </svg>
    </div>
  );
}

function HeroArt() {
  const rows = [
    {
      name: "Jira Coding Agent",
      sub: "by Atlassian",
      triggers: "Workflows (8)",
      icon: "bg-blue-500",
    },
    {
      name: "Cursor",
      sub: "by Cursor",
      triggers: "Automations (19)",
      icon: "bg-white",
    },
    {
      name: "Claude Agent for Jira",
      sub: "by Atlassian",
      triggers: "Workflows (22)",
      icon: "bg-orange-400",
    },
  ];

  return (
    <div className="relative h-full overflow-hidden bg-[#090B12] p-5 sm:p-7">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(#272C3B 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="relative mx-auto max-w-[620px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
              <Sparkles className="h-4 w-4 text-indigo-300" />
            </div>

            <span className="text-sm font-semibold text-white">
              AI Agents
            </span>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-400">
            Connected
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11141D]/95 shadow-2xl">
          <div className="grid grid-cols-[1fr_130px] border-b border-white/10 px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <span>Agent</span>
            <span className="text-right">Triggers</span>
          </div>

          {rows.map((row, index) => (
            <div
              key={row.name}
              className={`grid grid-cols-[1fr_130px] items-center px-4 py-4 ${
                index !== rows.length - 1 ? "border-b border-white/5" : ""
              } ${
                index === 1
                  ? "bg-indigo-500/[0.07]"
                  : "bg-transparent"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`h-9 w-9 shrink-0 rounded-xl ${row.icon} shadow-sm`}
                />

                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-white sm:text-[13px]">
                    {row.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    {row.sub}
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400">
                {row.triggers}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute -right-1 top-[104px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg shadow-indigo-500/30">
          AI Ready
        </div>
      </div>
    </div>
  );
}

const ART_MAP = {
  confidence: ConfidenceArt,
  pricing: PricingArt,
  toolbox: ToolboxArt,
  hex: HexArt,
};

function Badge({ children, accent = false }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
        accent
          ? "border-indigo-200 bg-indigo-50 text-indigo-600"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}

function ThumbTag({ children }) {
  return (
    <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
      {children}
    </div>
  );
}

function VideoIcon() {
  return (
    <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md">
      <Play size={14} fill="currentColor" />
    </div>
  );
}

function ArticleCard({ card }) {
  const Art = ART_MAP[card.art];

  return (
    <a
      href={`/blog/${card.slug}`}
      className="group block"
    >
      <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/70">
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        {Art && (
          <div className="absolute inset-0 opacity-25 transition duration-500 group-hover:opacity-10">
            <Art />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />

        {card.kind === "video" ? (
          <VideoIcon />
        ) : (
          <ThumbTag>{card.tag}</ThumbTag>
        )}

        <div className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
          {card.category}
        </span>

        {card.badges.map((badge, index) => (
          <Badge key={badge} accent={index === 0}>
            {badge}
          </Badge>
        ))}
      </div>

      <h3 className="max-w-xl text-[18px] font-bold leading-[1.35] tracking-[-0.02em] text-slate-800 transition-colors duration-200 group-hover:text-indigo-600 sm:text-[19px]">
        {card.title}
      </h3>
    </a>
  );
}

export default function BlogUI() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar activePage="blog" />

      {/* HERO */}
      

      {/* FEATURED */}
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">
              Featured
            </p>

            <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-3xl">
              What we're thinking about
            </h2>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-3">
          {/* FEATURED ARTICLE */}
          <article className="group lg:col-span-2">
            <a
              href="/blog/governed-agent-loops-ai-native-sdlc"
              className="block"
            >
              <div className="relative aspect-[16/8.5] overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200/70">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85"
                  alt="Team collaborating around an AI workflow"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <div className="absolute inset-0 opacity-35 transition duration-500 group-hover:opacity-20">
                  <HeroArt />
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

                <div className="absolute bottom-5 left-5 flex items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    COMPANY NEWS
                  </span>

                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    JIRA
                  </span>
                </div>
              </div>
            </a>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.14em] text-slate-400">
                  ARTICLE IN
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />

                <span className="text-[10px] font-semibold text-indigo-500">
                  AI AT WORK
                </span>
              </div>

              <a
                href="/blog/governed-agent-loops-ai-native-sdlc"
                className="group/title"
              >
                <h2 className="max-w-3xl text-3xl font-extrabold leading-[1.15] tracking-[-0.035em] text-slate-900 transition-colors group-hover/title:text-indigo-600 sm:text-4xl">
                  We're bringing governed agent loops to the AI-Native SDLC
                </h2>
              </a>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-base">
                Almost everyone is playing with agents, yet almost no one can
                let agents run at scale without things breaking. The gap
                between “cool demo” and “I trust this across hundreds of
                engineers” is exactly what we're trying to close.
              </p>

              <a
                href="/blog/governed-agent-loops-ai-native-sdlc"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:gap-3"
              >
                Read article
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>

          {/* SIDE ARTICLES */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            {CARDS.slice(0, 2).map((card) => (
              <ArticleCard key={card.title} card={card} />
            ))}
          </div>
        </div>

        {/* ALL STORIES */}
        <section className="mt-20 border-t border-slate-100 pt-14">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">
                Latest
              </p>

              <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-900 sm:text-3xl">
                More from AeroPilot
              </h2>
            </div>

            <span className="hidden text-sm text-slate-400 sm:block">
              Stories · Ideas · AI · Product
            </span>
          </div>

          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.slice(2).map((card) => (
              <ArticleCard key={card.title} card={card} />
            ))}

            <article className="group">
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 shadow-sm transition duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-indigo-200/40">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fuchsia-300/10 blur-2xl" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-100">
                      AeroPilot
                    </p>

                    <h3 className="max-w-xs text-xl font-bold leading-tight text-white">
                      Building a smarter way for teams to work.
                    </h3>
                  </div>
                </div>
              </div>

              <div className="mb-2.5">
                <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                  PRODUCT
                </span>
              </div>

              <h3 className="text-[18px] font-bold leading-[1.35] tracking-[-0.02em] text-slate-800">
                Where project management meets intelligent workflows.
              </h3>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
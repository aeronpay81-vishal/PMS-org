import React from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Footer from './Footer'
import Navbar from '../components/navigation/Navbar'

const POSTS = {
  'governed-agent-loops-ai-native-sdlc': {
    category: 'COMPANY NEWS',
    tag: 'AI AT WORK',
    title: "We're bringing governed agent loops to the AI-Native SDLC",
    excerpt:
      'Almost everyone is playing with agents, yet almost no one can let agents run at scale without things breaking. Here is how governed workflows help teams move from demos to dependable delivery.',
    date: 'September 16, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=90',
    sections: [
      [
        'The gap between demos and delivery',
        'AI agents are already useful in isolated moments. The harder problem is giving them enough context, boundaries, and visibility to work safely inside a real delivery process.',
      ],
      [
        'Context makes automation dependable',
        'When an agent can see the project goal, current status, ownership, and approval rules, its output becomes easier to review and act on. Teams spend less time rebuilding context and more time making decisions.',
      ],
      [
        'Governance belongs in the workflow',
        'The best systems make governance part of the work itself. Clear permissions, human checkpoints, and an activity trail let teams scale automation without losing accountability.',
      ],
    ],
  },

  'confidence-in-ai-more-context': {
    category: 'AI AT WORK',
    tag: 'ARTIFICIAL INTELLIGENCE',
    title: 'Want more confidence in AI? Give it more context.',
    excerpt:
      'Better context turns scattered AI suggestions into useful, reviewable work for project teams.',
    date: 'September 12, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=90',
    sections: [
      [
        'Context is the missing layer',
        'An AI assistant can only be as useful as the information it can understand. Project history, priorities, deadlines, and ownership give every suggestion a stronger foundation.',
      ],
      [
        'Make the next action obvious',
        "The goal is not more generated text. It is a clear next action that fits the team's process and can be checked by the people responsible for the outcome.",
      ],
    ],
  },

  'usage-based-pricing-ai-value': {
    category: 'COMPANY NEWS',
    tag: 'AI',
    title:
      "Atlassian's usage-based pricing: AI value with predictability and control",
    excerpt:
      'A practical look at making AI adoption measurable while keeping teams in control of their spend.',
    date: 'September 8, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1800&q=90',
    sections: [
      [
        'Value should be visible',
        'Usage-based systems work best when teams can see what they are getting and why it matters. Clear reporting helps leaders make informed decisions without slowing the people doing the work.',
      ],
      [
        'Control is part of the experience',
        'Limits, roles, and transparent usage signals help organizations adopt AI at a pace that matches their goals and operating model.',
      ],
    ],
  },

  'chief-ai-officer-building-for-humans-agents': {
    category: 'HOW WE BUILD',
    tag: 'PRODUCT DESIGN',
    title: 'Building products for humans and agents',
    excerpt:
      'The product decisions that make intelligent systems feel useful, understandable, and grounded in real work.',
    date: 'September 4, 2026',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=90',
    sections: [
      [
        'Humans stay in the loop',
        'Automation should create room for better judgment, not hide important decisions. The interface has to show what happened and why.',
      ],
      [
        'Design for collaboration',
        'The strongest AI products give people and agents clear responsibilities, shared context, and a simple path to review the work together.',
      ],
    ],
  },
}

const RELATED_POSTS = [
  {
    title: 'Want more confidence in AI? Give it more context.',
    category: 'AI AT WORK',
    slug: 'confidence-in-ai-more-context',
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85',
  },
  {
    title:
      "Atlassian's usage-based pricing: AI value with predictability and control",
    category: 'COMPANY NEWS',
    slug: 'usage-based-pricing-ai-value',
    image:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=85',
  },
  {
    title: 'Building products for humans and agents',
    category: 'HOW WE BUILD',
    slug: 'chief-ai-officer-building-for-humans-agents',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85',
  },
]

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#D6DCE8] bg-white px-3 py-1 text-[11px] font-bold tracking-wide text-[#44546F]">
      {children}
    </span>
  )
}

function BlogPost() {
  const { slug } = useParams()

  const post =
    POSTS[slug] || POSTS['governed-agent-loops-ai-native-sdlc']

  return (
    <div className="min-h-screen bg-white text-[#172B4D]">
      <Navbar activePage="blog" />

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative overflow-hidden bg-[#F1F2FF]">
          <div className="mx-auto grid max-w-[1500px] lg:min-h-[560px] lg:grid-cols-2">
            {/* LEFT CONTENT */}
            <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
              <div className="w-full max-w-[650px]">
                <Link
                  to="/blog"
                  className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#44546F] transition hover:text-[#0C66E4]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to blog
                </Link>

                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6554C0]">
                    {post.category}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#97A0AF]" />

                  <Badge>{post.tag}</Badge>
                </div>

                <h1 className="max-w-[680px] text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[#172B4D] sm:text-5xl lg:text-[58px]">
                  {post.title}
                </h1>

                <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#44546F] sm:text-xl">
                  {post.excerpt}
                </p>

                {/* META */}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#626F86]">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#6554C0]" />
                    {post.date}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[#6554C0]" />
                    {post.readTime}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    to="/"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#172B4D] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0C66E4]"
                  >
                    Get Started
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-[#6554C0] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#5445A5]"
                  >
                    Contact sales
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative min-h-[360px] overflow-hidden lg:min-h-full">
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />

              {/* Image overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#F1F2FF] via-transparent to-transparent lg:w-[35%]" />
              <div className="absolute inset-0 bg-[#172B4D]/10" />

              {/* Floating decoration */}
              <div className="absolute right-8 top-8 hidden rounded-2xl border border-white/30 bg-white/20 p-4 shadow-xl backdrop-blur-md sm:block">
                <Sparkles className="h-6 w-6 text-white" />
              </div>

              <div className="absolute bottom-8 right-8 hidden max-w-[230px] rounded-2xl border border-white/20 bg-[#172B4D]/75 p-5 text-white shadow-2xl backdrop-blur-md md:block">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                  Featured article
                </p>

                <p className="mt-2 text-sm font-semibold leading-5">
                  Ideas, context and practical ways to make AI work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            ARTICLE AREA
        ========================================================= */}
        <section className="border-b border-[#DFE1E6] bg-white">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[280px_minmax(0,760px)] lg:gap-20 lg:px-12 lg:py-20">
            {/* TABLE OF CONTENTS */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="mb-5 text-sm font-semibold text-[#44546F]">
                  In this article
                </p>

                <nav className="border-l border-[#DFE1E6]">
                  {post.sections.map(([heading], index) => (
                    <a
                      key={heading}
                      href={`#section-${index}`}
                      className="group flex items-start gap-3 border-l-2 border-transparent px-5 py-3 text-sm leading-5 text-[#626F86] transition hover:border-[#6554C0] hover:bg-[#F7F7FF] hover:text-[#172B4D]"
                    >
                      <span className="text-xs font-bold text-[#97A0AF]">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span>{heading}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-10 rounded-2xl bg-[#F1F2FF] p-5">
                  <p className="text-sm font-bold text-[#172B4D]">
                    Building better workflows?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#626F86]">
                    See how your team can bring projects, people and AI
                    together.
                  </p>

                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#6554C0] hover:underline"
                  >
                    Explore platform
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* ARTICLE */}
            <article className="min-w-0">
              {/* Mobile TOC */}
              <div className="mb-12 rounded-2xl border border-[#DFE1E6] bg-[#F7F8FA] p-5 lg:hidden">
                <p className="mb-4 text-sm font-bold text-[#172B4D]">
                  In this article
                </p>

                <div className="space-y-2">
                  {post.sections.map(([heading], index) => (
                    <a
                      key={heading}
                      href={`#section-${index}`}
                      className="flex gap-3 py-1 text-sm text-[#44546F]"
                    >
                      <span className="font-bold text-[#6554C0]">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span>{heading}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* INTRO */}
              <div className="mb-14">
                <p className="text-xl leading-9 text-[#172B4D] sm:text-[22px]">
                  {post.excerpt}
                </p>

                <div className="mt-8 h-px w-full bg-[#DFE1E6]" />
              </div>

              {/* SECTIONS */}
              {post.sections.map(([heading, body], index) => (
                <section
                  id={`section-${index}`}
                  key={heading}
                  className="scroll-mt-28 border-b border-[#DFE1E6] pb-12 pt-2 first:pt-0 last:border-b-0"
                >
                  <div className="flex gap-4">
                    <span className="hidden pt-1 text-sm font-bold text-[#6554C0] sm:block">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#6554C0]">
                        Section {index + 1}
                      </p>

                      <h2 className="text-2xl font-bold leading-tight tracking-[-0.025em] text-[#172B4D] sm:text-3xl">
                        {heading}
                      </h2>

                      <p className="mt-5 text-lg leading-8 text-[#44546F]">
                        {body}
                      </p>

                      {/* Additional visual block */}
                      <div className="mt-7 rounded-2xl bg-[#F7F8FA] p-6 sm:p-7">
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9E7FF]">
                            <Sparkles className="h-5 w-5 text-[#6554C0]" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#172B4D]">
                              Make the workflow visible
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#626F86]">
                              Keep context, decisions and next actions close
                              to the work so teams can move forward with
                              clarity.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ))}

              {/* END ARTICLE CTA */}
              <div className="mt-12 overflow-hidden rounded-3xl bg-[#172B4D] p-8 text-white sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B8B4FF]">
                  Keep exploring
                </p>

                <h3 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
                  Turn ideas into organized, visible work.
                </h3>

                <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                  Explore more articles about AI, project management and the
                  future of modern work.
                </p>

                <Link
                  to="/blog"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#172B4D] transition hover:bg-[#F1F2FF]"
                >
                  Explore more articles
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* =========================================================
            RELATED ARTICLES
        ========================================================= */}
        <section className="bg-[#F7F8FA] px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-10 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6554C0]">
                  More from the blog
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#172B4D] sm:text-4xl">
                  Keep reading
                </h2>
              </div>

              <Link
                to="/blog"
                className="hidden items-center gap-2 text-sm font-bold text-[#6554C0] hover:underline sm:inline-flex"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {RELATED_POSTS.map((related) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(9,30,66,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(9,30,66,0.12)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={related.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#172B4D]/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6554C0]">
                      {related.category}
                    </p>

                    <h3 className="mt-3 text-xl font-bold leading-7 tracking-tight text-[#172B4D]">
                      {related.title}
                    </h3>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#6554C0]">
                      Read article
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default BlogPost
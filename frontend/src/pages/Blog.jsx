import React from "react";
import { Play } from "lucide-react";
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
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    kind: "image",
    tag: "99",
    category: "ARTICLE IN",
    badges: ["COMPANY NEWS"],
    title: "Atlassian's usage-based pricing: AI value with predictability and control",
    art: "pricing",
    slug: "usage-based-pricing-ai-value",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    kind: "video",
    category: "VIDEO IN",
    badges: ["HOW WE BUILD"],
    title: "Atlassian's Chief AI Officer on building products for humans and agents",
    art: "toolbox",
    slug: "chief-ai-officer-building-for-humans-agents",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85",
  },
  {
    kind: "image",
    tag: "99",
    category: "ARTICLE IN",
    badges: ["COMPANY NEWS"],
    title: "The Agentic Pivot: Why the work around code matters more than ever",
    art: "hex",
    slug: "agentic-pivot-work-around-code",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85",
  },
];

function PricingArt() {
  return (
    <div style={{ background: "#DEEBFF", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: "18px 20px", width: "100%", maxWidth: 260, boxShadow: "0 1px 3px rgba(9,30,66,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#172B4D" }}>Monthly limit</span>
          <span style={{ background: "#FFAB00", color: "#172B4D", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>AdaLln</span>
        </div>
        <div style={{ position: "relative", height: 6, background: "#DFE1E6", borderRadius: 3 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: "38%", background: "#0C66E4", borderRadius: 3 }} />
          <div style={{ position: "absolute", left: "38%", top: -6, width: 14, height: 14, background: "#0C66E4", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 0 1px #0C66E4" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#626F86" }}>
          <span>0</span>
          <span>No limit</span>
        </div>
      </div>
    </div>
  );
}

function ToolboxArt() {
  return (
    <div style={{ background: "#DEEBFF", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
        <rect x="14" y="40" width="92" height="52" rx="6" fill="#0C66E4" />
        <rect x="14" y="40" width="92" height="16" rx="6" fill="#0055CC" />
        <rect x="46" y="26" width="28" height="20" rx="4" fill="none" stroke="#0055CC" strokeWidth="6" />
        <rect x="30" y="10" width="12" height="34" rx="3" fill="#FFAB00" transform="rotate(-18 36 27)" />
        <rect x="76" y="10" width="12" height="34" rx="3" fill="#6E5DC6" transform="rotate(18 82 27)" />
        <circle cx="60" cy="70" r="10" fill="#DE350B" />
      </svg>
    </div>
  );
}

function HexArt() {
  return (
    <div style={{ background: "#0B0D14", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(#242938 1px, transparent 1px)",
        backgroundSize: "16px 16px", opacity: 0.6,
      }} />
      <svg width="100%" height="100%" viewBox="0 0 300 220" style={{ position: "relative" }}>
        <polygon
          points="150,60 205,95 205,155 150,190 95,155 95,95"
          fill="none"
          stroke="url(#hexGrad)"
          strokeWidth="3"
        />
        <defs>
          <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6E5DC6" />
            <stop offset="100%" stopColor="#FFAB00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ConfidenceArt() {
  return (
    <div style={{ background: "#182642", height: "100%", position: "relative", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
        <polygon points="0,0 260,0 130,220 0,220" fill="#24406B" />
        <polygon points="130,220 260,0 400,0 400,220" fill="#3B5A8C" opacity="0.5" />
        <circle cx="150" cy="150" r="36" fill="#0B1830" />
        <circle cx="270" cy="90" r="30" fill="#0B1830" />
      </svg>
    </div>
  );
}

function HeroArt() {
  const rows = [
    { name: "Jira Coding Agent", sub: "by Atlassian", triggers: "Workflows (8)  Automations (15)", icon: "#0C66E4" },
    { name: "Cursor", sub: "by Cursor", triggers: "Automations (19)", icon: "#111" },
    { name: "Claude Agent for Jira", sub: "by Atlassian", triggers: "Workflows (22)", icon: "#D97757" },
  ];
  return (
    <div style={{ background: "#0B0D14", position: "relative", padding: "28px 28px 44px", height: "100%", boxSizing: "border-box" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(#1c2030 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Agents</div>
        <div style={{ background: "#12141C", borderRadius: 8, border: "1px solid #262A38", overflow: "hidden" }}>
          <div style={{ display: "flex", padding: "10px 16px", fontSize: 11, color: "#8993A4", borderBottom: "1px solid #262A38" }}>
            <span style={{ flex: 1 }}>Agent</span>
            <span>Triggers</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", padding: "12px 16px",
              borderBottom: i < rows.length - 1 ? "1px solid #1c2030" : "none",
              background: i === 1 ? "#161925" : "transparent",
              position: "relative",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5, background: r.icon,
                marginRight: 10, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                <div style={{ color: "#6B7280", fontSize: 11 }}>{r.sub}</div>
              </div>
              <div style={{ color: "#8993A4", fontSize: 11, textAlign: "right" }}>{r.triggers}</div>
              {i === 1 && (
                <div style={{
                  position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
                  width: 0, height: 0, borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent", borderLeft: "9px solid #0C66E4",
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{
          position: "absolute", right: -12, top: 118,
          background: "#0C66E4", color: "#fff", fontSize: 12, fontWeight: 600,
          padding: "6px 14px", borderRadius: 16,
        }}>Veronica</div>
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

function Badge({ children, outline }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 12,
        border: outline ? "1px solid #6E5DC6" : "1px solid #DFE1E6",
        color: outline ? "#6E5DC6" : "#172B4D",
        background: outline ? "transparent" : "#F7F8F9",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

function ThumbTag({ children }) {
  return (
    <div style={{
      position: "absolute", left: 14, bottom: 14,
      background: "rgba(0,0,0,0.65)", color: "#fff",
      fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 4,
    }}>
      {children}
    </div>
  );
}

function VideoIcon() {
  return (
    <div style={{
      position: "absolute", left: 14, bottom: 14,
      background: "rgba(0,0,0,0.65)", color: "#fff",
      width: 28, height: 28, borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Play size={14} fill="#fff" color="#fff" />
    </div>
  );
}

function ArticleCard({ card }) {
  const Art = ART_MAP[card.art];
  return (
    <a href={`/blog/${card.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "16/10", marginBottom: 14 }}>
        <img src={card.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(event) => { event.currentTarget.style.display = "none" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.22 }}><Art /></div>
        {card.kind === "video" ? <VideoIcon /> : <ThumbTag>{card.tag}</ThumbTag>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#44546F", letterSpacing: 0.2 }}>
          {card.category}
        </span>
        {card.badges.map((b) => (
          <Badge key={b}>{b}</Badge>
        ))}
      </div>
      <h3 style={{
        fontSize: 18, lineHeight: 1.35, fontWeight: 700, color: "#172B4D",
        margin: 0, letterSpacing: "-0.01em",
      }}>
        {card.title}
      </h3>
    </a>
  );
}

export default function BlogUI() {
  return (
    <div style={{
      fontFamily: "'Charlie Text', 'Segoe UI', system-ui, sans-serif",
      background: "#fff",
      color: "#172B4D",
      minHeight: "100vh",
    }}>
      <Navbar activePage="blog" />
      {/* Content grid */}
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px",
        display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
        gap: "40px 28px",
      }}>
        {/* Featured post spans two rows on the left */}
        <div style={{ gridColumn: "1 / span 2", gridRow: "1 / span 2" }}>
          <a href="/blog/governed-agent-loops-ai-native-sdlc" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85" alt="Team collaborating around an AI workflow" style={{ width: "100%", height: "100%", minHeight: 320, objectFit: "cover", display: "block" }} onError={(event) => { event.currentTarget.style.display = "none" }} />
              <div style={{ position: "absolute", inset: 0, opacity: 0.2 }}><HeroArt /></div>
            </div>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#44546F" }}>ARTICLE IN</span>
            <Badge>COMPANY NEWS</Badge>
            <Badge>JIRA</Badge>
          </div>
          <a href="/blog/governed-agent-loops-ai-native-sdlc" style={{ textDecoration: "none", color: "inherit" }}><h2 style={{
            fontSize: 30, lineHeight: 1.25, fontWeight: 800, margin: "0 0 14px",
            letterSpacig: "-0.01em", maxWidth: 560,
          }}>
            We're bringing governed agent loops to the AI-Native SDLC
          </h2></a>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#44546F", maxWidth: 560, margin: 0 }}>
            Almost everyone is playing with agents, yet almost no one can let agents
            run at scale without things breaking. The gap between "cool demo" and "I
            trust this across hundreds of engineers" is exactly what we're trying to
            close with the new features we are shipping today.
          </p>
        </div>

        {/* Right-side + bottom cards */}
        {CARDS.map((card) => (
          <ArticleCard key={card.title} card={card} />
        ))}
      </div>
      <Footer />
    </div>
  );
}
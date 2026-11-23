import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// ── DATA ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["About", "Experience", "Skills", "Projects", "Contact"];

const SKILLS = [
  { name: "C / C++", icon: "devicon-cplusplus-plain colored" },
  { name: "Python", icon: "devicon-python-plain colored" },
  { name: "Go", icon: "devicon-go-original-wordmark colored" },
  { name: "Swift", icon: "devicon-swift-plain colored" },
  { name: "TypeScript", icon: "devicon-typescript-plain colored" },
  { name: "JavaScript", icon: "devicon-javascript-plain colored" },
  { name: "Java", icon: "devicon-java-plain colored" },
  { name: "SQL", icon: "devicon-postgresql-plain colored" },
  { name: "SystemVerilog", icon: "devicon-embeddedc-plain colored" },
  { name: "PyTorch", icon: "devicon-pytorch-original colored" },
  { name: "CUDA", icon: "devicon-nvidia-plain colored" },
  { name: "Kubernetes", icon: "devicon-kubernetes-plain colored" },
  { name: "Docker", icon: "devicon-docker-plain colored" },
  { name: "Google Cloud", icon: "devicon-googlecloud-plain colored" },
  { name: "Next.js", icon: "devicon-nextjs-original colored" },
  { name: "React", icon: "devicon-react-original colored" },
  { name: "Node.js", icon: "devicon-nodejs-plain colored" },
  { name: "Supabase", icon: "devicon-supabase-plain colored" },
  { name: "Spark", icon: "devicon-apachespark-original colored" },
  { name: "Jenkins", icon: "devicon-jenkins-plain colored" },
  { name: "Git", icon: "devicon-git-plain colored" },
  { name: "Linux", icon: "devicon-linux-plain colored" },
];

// Projects and experience follow the résumé (Srihari_SWEV.pdf). Personal
// projects carry a repo or live link; the work done inside a job lives under
// Experience.
const PROJECTS = [
  {
    title: "Kairo",
    blurb: "Co-founded SwiftUI fitness app",
    desc: "Co-founded and built a SwiftUI fitness app on Supabase (PostgreSQL) and Firebase Auth, reaching 400+ active users. Cosine-similarity matching over HealthKit data with real-time sync lifted session length 40%, and a smart-contract settlement engine with biometric triggers cut settlement time 30%.",
    tags: ["SwiftUI", "Supabase", "Firebase", "HealthKit"],
    year: "2026",
    status: "In Progress",
    shot: "/shots/kairo-feed.png",
    repo: "https://github.com/Srihari87/Kairo",
    repoPrivate: true,
  },
  {
    title: "BoilerSwap",
    blurb: "Campus marketplace PWA",
    desc: "Shipped a full-stack PWA marketplace for Purdue students with @purdue.edu OAuth and JWT sessions, scaling to real users. A route-optimization service recommends optimal meet locations, cutting user coordination by 30%.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    year: "2025",
    status: "Live",
    shot: null,
    repo: "https://github.com/Srihari87/boilerswap",
    repoPrivate: true,
    live: "https://boilerswap.xyz",
  },
];

const EXPERIENCE = [
  {
    company: "Intellicent",
    role: "Software Engineer Intern",
    location: "Seattle, WA",
    period: "May 2026 – Aug 2026",
    bullets: [
      "Built a serverless AWS pipeline (Lambda, S3) for GPU-accelerated extraction and parsing of 1M+ records.",
      "Engineered SQL data-engineering workflows on Databricks, transforming raw records at scale.",
      "Built pipeline dashboards, boosting model accuracy by 15% and helping secure a $300K Boston Scientific deal.",
      "Developed concurrent Go microservices and REST APIs for low-latency client lookups, optimizing P99 latency.",
    ],
    tags: ["AWS Lambda", "S3", "Databricks", "SQL", "Go"],
  },
  {
    company: "Signal Found — Stealth Startup",
    role: "Machine Learning Engineering Intern",
    location: "San Francisco, CA",
    period: "Jan 2026 – May 2026",
    bullets: [
      "Built a scalable Python test framework over a vector database, generating 15K+ automated tests and identifying 9 system failures.",
      "Orchestrated 200+ concurrent sandboxed browsers on a Linux VPS with session and network isolation.",
      "Configured TCP/IP networking and IS-IS routing across isolated environments, sustaining 95%+ evasion.",
    ],
    tags: ["Python", "Vector DB", "Linux", "TCP/IP"],
  },
  {
    company: "Caterpillar",
    role: "Undergraduate Software Engineer",
    location: "West Lafayette, IN",
    period: "Aug 2025 – Jan 2026",
    bullets: [
      "Re-architected 7 inventory apps into a unified cloud-native platform, cutting data-retrieval time by 50%.",
      "Built near real-time inventory sync using change data capture (CDC) and REST APIs, with under 2% sync error rate.",
      "Built an LLM-powered assistant over legacy systems, cutting manual inventory-lookup time by 40–60%.",
    ],
    tags: ["Cloud-native", "CDC", "REST APIs", "LLMs"],
  },
  {
    company: "TCLS Security Lab — Prof. Zahra Ghodsi",
    role: "Undergraduate Machine Learning Researcher",
    location: "West Lafayette, IN",
    period: "Aug 2025 – Present",
    bullets: [
      "Built PyTorch/TensorFlow infrastructure for adversarial-robustness benchmarking on CUDA GPUs.",
      "Benchmarked adversarial attacks (FGSM, PGD) and defenses, quantifying accuracy–robustness tradeoffs.",
      "Built distributed CUDA pipelines with Spark, Kubernetes and Slurm; tuned NUMA affinity and block I/O.",
    ],
    tags: ["PyTorch", "TensorFlow", "CUDA", "Spark", "Kubernetes", "Slurm"],
  },
];

// Shown under the headline on the first page. Edit freely.
const HOW_I_WORK = [
  { title: "Start from the problem", text: "I learn how the system really works, down to the OS and the hardware, before picking a tool." },
  { title: "Prove it with numbers", text: "I measure before and after, and back every change with tests and benchmarks." },
  { title: "Own it end to end", text: "Design, build, deploy and monitor. I stay with it until it works in production." },
];

const STATUS_STYLE = {
  Completed:     { bg: "rgba(74,222,128,0.08)",  fg: "#4ade80", bd: "rgba(74,222,128,0.2)" },
  Live:          { bg: "rgba(56,189,248,0.08)",  fg: "#38bdf8", bd: "rgba(56,189,248,0.2)" },
  "In Progress": { bg: "rgba(251,191,36,0.08)",  fg: "#fbbf24", bd: "rgba(251,191,36,0.2)" },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] } },
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/// Reveal-on-scroll, except every section starts at opacity 0 — so if reduced
/// motion is on (or IntersectionObserver never fires) the whole page would read
/// as blank. Show it immediately in that case.
function useReveal(ref, margin = "-80px") {
  const inView = useInView(ref, { once: true, margin });
  return inView || prefersReducedMotion() ? "visible" : "hidden";
}

function GitHubMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// Renders a real screenshot when one exists, otherwise a procedural placeholder
// keyed off the title — so proprietary work still gets a visual without me
// inventing a fake screenshot of it. When a repo exists the whole visual is a
// link, with a GitHub mark badged on it so it reads as pressable.
function ProjectShot({ src, title, org, locked, seed = 0, href }) {
  const frame = {
    position: "relative",
    aspectRatio: "16 / 9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "#0b0c14",
  };

  const inner = renderInner();

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        aria-label={`${title} — open repository on GitHub`}
        style={{ ...frame, display: "block", textDecoration: "none", cursor: "pointer", transition: "border-color 0.22s, transform 0.22s" }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.45)";
          e.currentTarget.style.transform = "translateY(-2px)";
          const b = e.currentTarget.querySelector("[data-gh-badge]");
          if (b) { b.style.background = "#6366f1"; b.style.color = "#fff"; }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "translateY(0)";
          const b = e.currentTarget.querySelector("[data-gh-badge]");
          if (b) { b.style.background = "rgba(9,10,16,0.78)"; b.style.color = "rgba(255,255,255,0.75)"; }
        }}>
        {inner}
        <span data-gh-badge style={{
          position: "absolute", bottom: 10, right: 10,
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "7px 12px", borderRadius: 100,
          background: "rgba(9,10,16,0.78)", color: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
          transition: "background 0.22s, color 0.22s",
        }}>
          <GitHubMark size={14} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}>
            VIEW REPO
          </span>
        </span>
      </a>
    );
  }

  return <div style={frame}>{inner}</div>;

  // Returns only the contents — the frame is supplied by the wrapper above so
  // the same visual works as both a link and a plain div.
  function renderInner() {
    if (src) {
      // The site deploys under base '/Website/', so a bare '/shots/…' path
      // would resolve to the domain root and 404. Phone screenshots are tall,
      // so the crop is biased down off the status bar.
      const resolved = src.startsWith("/")
        ? `${import.meta.env.BASE_URL}${src.slice(1)}`
        : src;
      return (
        <img src={resolved} alt={`${title} screenshot`} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 26%", display: "block" }} />
      );
    }

    const hue = 228 + ((seed * 34) % 96);
    const initials = (org || title).split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();

    return (
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, hsl(${hue} 58% 20%) 0%, hsl(${hue + 26} 52% 9%) 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* faint blueprint grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)",
        }} />
        <span style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 54, fontWeight: 800,
          color: "rgba(255,255,255,0.14)", letterSpacing: "-0.04em", userSelect: "none",
        }}>{initials}</span>

        {locked && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 100,
            background: "rgba(9,10,16,0.72)", border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>
              NO PUBLIC DEMO
            </span>
          </div>
        )}
      </div>
    );
  }
}

function CursorTrail() {
  const canvasRef = useRef(null);
  const trail = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e) => {
      trail.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trail.current.length > 65) trail.current.shift();
    };
    window.addEventListener("mousemove", onMove);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trail.current.forEach(p => p.age++);
      trail.current = trail.current.filter(p => p.age < 65);
      for (let i = 1; i < trail.current.length; i++) {
        const p = trail.current[i], prev = trail.current[i - 1];
        const progress = i / trail.current.length;
        const alpha = progress * (1 - p.age / 65);
        const grad = ctx.createLinearGradient(prev.x, prev.y, p.x, p.y);
        grad.addColorStop(0, `rgba(99,102,241,${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(167,139,250,${alpha})`);
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad; ctx.lineWidth = progress * 7; ctx.lineCap = "round"; ctx.stroke();
      }
      if (trail.current.length > 0) {
        const tip = trail.current[trail.current.length - 1];
        const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 22);
        glow.addColorStop(0, "rgba(167,139,250,0.85)");
        glow.addColorStop(0.4, "rgba(99,102,241,0.3)");
        glow.addColorStop(1, "rgba(99,102,241,0)");
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 22, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }} />;
}

// ── EXPLODING SHARDS ─────────────────────────────────────────────────────────
function ExplodingShards() {
  const canvasRef = useRef(null);
  const phase = useRef("assembling");
  const shardT = useRef(0);
  const explodeT = useRef(0);
  const holdT = useRef(0);
  const shards = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const SW = 460, SH = 460, CX = SW / 2, CY = SH / 2;
    const SHARD_COUNT = 38;

    shards.current = Array.from({ length: SHARD_COUNT }, (_, i) => {
      const angle = (i / SHARD_COUNT) * Math.PI * 2;
      const nextAngle = ((i + 1) / SHARD_COUNT) * Math.PI * 2;
      const r1 = 60 + Math.random() * 70, r2 = 60 + Math.random() * 70;
      const explodeDist = 180 + Math.random() * 140;
      const midAngle = (angle + nextAngle) / 2;
      const layer = Math.floor(i / (SHARD_COUNT / 3));
      return {
        p: [[0, 0], [Math.cos(angle) * r1, Math.sin(angle) * r1], [Math.cos(nextAngle) * r2, Math.sin(nextAngle) * r2]],
        cx: CX, cy: CY,
        ex: Math.cos(midAngle) * explodeDist,
        ey: Math.sin(midAngle) * explodeDist,
        erot: (Math.random() - 0.5) * Math.PI * 3,
        hue: 230 + layer * 20 + Math.random() * 20,
        alpha: 0.5 + Math.random() * 0.4,
        delay: Math.random() * 0.3,
      };
    });

    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, SW, SH);
      const p = phase.current;

      if (p === "assembling" || p === "reassembling") {
        shardT.current = Math.min(shardT.current + 0.012, 1);
        if (shardT.current >= 1) { phase.current = "assembled"; holdT.current = 0; }
      } else if (p === "assembled") {
        holdT.current += 0.01;
        if (holdT.current > 2.5) { phase.current = "exploding"; explodeT.current = 0; }
      } else if (p === "exploding") {
        explodeT.current = Math.min(explodeT.current + 0.018, 1);
        if (explodeT.current >= 1) { phase.current = "reassembling"; shardT.current = 0; }
      }

      shards.current.forEach((s, i) => {
        const delayedT = Math.max(0, Math.min((shardT.current - s.delay) / (1 - s.delay * 0.5), 1));
        let ox, oy, orot, opacity;

        if (p === "assembling" || p === "reassembling") {
          const t = easeOut(delayedT);
          ox = s.ex * (1 - t); oy = s.ey * (1 - t); orot = s.erot * (1 - t); opacity = 0.3 + t * 0.7;
        } else if (p === "assembled") {
          const ft = Date.now() / 1000;
          ox = Math.sin(ft * 0.8 + i * 0.3) * 1.5;
          oy = Math.cos(ft * 0.6 + i * 0.4) * 1.5;
          orot = 0; opacity = 1;
        } else {
          const delayedExp = Math.max(0, Math.min((explodeT.current - s.delay * 0.5) / (1 - s.delay * 0.3), 1));
          const te = easeInOut(delayedExp);
          ox = s.ex * te; oy = s.ey * te; orot = s.erot * te; opacity = 1 - te * 0.3;
        }

        ctx.save();
        ctx.translate(s.cx + ox, s.cy + oy);
        ctx.rotate(orot);
        ctx.beginPath();
        ctx.moveTo(s.p[0][0], s.p[0][1]);
        ctx.lineTo(s.p[1][0], s.p[1][1]);
        ctx.lineTo(s.p[2][0], s.p[2][1]);
        ctx.closePath();
        const depth = (Math.sin(i * 0.7 + Date.now() / 3000) + 1) / 2;
        ctx.fillStyle = `hsla(${s.hue},75%,${45+depth*25}%,${opacity*s.alpha*0.25})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${s.hue},85%,${65+depth*20}%,${opacity*(0.5+depth*0.5)})`;
        ctx.lineWidth = 0.8 + depth * 0.7;
        ctx.stroke();
        ctx.restore();
      });

      // Center glow
      const prog = p === "exploding" ? 1 - easeInOut(explodeT.current) : easeOut(shardT.current);
      const cGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 55 * prog);
      cGlow.addColorStop(0, `rgba(167,139,250,${0.25*prog})`);
      cGlow.addColorStop(0.5, `rgba(99,102,241,${0.1*prog})`);
      cGlow.addColorStop(1, "rgba(99,102,241,0)");
      ctx.beginPath(); ctx.arc(CX, CY, 55 * prog, 0, Math.PI * 2); ctx.fillStyle = cGlow; ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.canvas ref={canvasRef} width={460} height={460}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      // drawn at 460x460, scaled down by CSS on narrow screens
      style={{ width: "min(460px, 100%)", height: "auto", display: "block", filter: "drop-shadow(0 0 40px rgba(99,102,241,0.25))" }}
    />
  );
}

// ── BACKGROUND ────────────────────────────────────────────────────────────────
function Background() {
  const glowRef = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cur = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    let raf;
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const loop = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.06;
      cur.current.y += (pos.current.y - cur.current.y) * 0.06;
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(650px circle at ${cur.current.x}px ${cur.current.y}px, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 45%, transparent 70%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div ref={glowRef} style={{ position: "absolute", inset: 0 }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6vw", height: 68, background: scrolled ? "rgba(9,10,16,0.85)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", transition: "all 0.4s ease" }}>
      <a href="#hero" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", textDecoration: "none" }}>Srihari Srikanth</a>
      <div className="nav-links" style={{ display: "flex", gap: 40 }}>
        {NAV_LINKS.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
          >{link}</a>
        ))}
      </div>
    </motion.nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const op = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 6vw 0", position: "relative" }}>
      <motion.div style={{ y, opacity: op, display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1200, gap: 40, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 460px" }}>
          <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Open to internship opportunities</span>
          </motion.div>

          <motion.p variants={fadeUp(0.15)} initial="hidden" animate="visible"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.01em" }}>
            Hi, I'm
          </motion.p>

          <motion.h1 variants={fadeUp(0.22)} initial="hidden" animate="visible"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(40px, 5.5vw, 80px)", fontWeight: 800, lineHeight: 1.0, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.035em" }}>
            Srihari Srikanth
          </motion.h1>

          <motion.div variants={fadeUp(0.32)} initial="hidden" animate="visible"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(20px, 2.6vw, 36px)", fontWeight: 700, color: "#818cf8", marginBottom: 22, letterSpacing: "-0.02em" }}>
            The software engineer you need.
          </motion.div>

          <motion.p variants={fadeUp(0.42)} initial="hidden" animate="visible"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 26, maxWidth: 520 }}>
            Computer Engineering at Purdue. I build systems end to end, from low-level code and data pipelines to cloud services and ML infrastructure, and I've shipped them at Intellicent, a stealth ML startup and Caterpillar.
          </motion.p>

          <motion.div variants={fadeUp(0.47)} initial="hidden" animate="visible" style={{ marginBottom: 34, maxWidth: 520 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>How I work</p>
            {HOW_I_WORK.map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <span style={{ color: "#6366f1", fontSize: 7, marginTop: 8, flexShrink: 0 }}>◆</span>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{item.title}.</span> {item.text}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp(0.52)} initial="hidden" animate="visible" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#projects" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, padding: "13px 28px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "#4f46e5"; e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(99,102,241,0.35)"; }}
              onMouseLeave={e => { e.target.style.background = "#6366f1"; e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>
              View My Work
            </a>
            <a href="#contact" style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, padding: "13px 28px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.transform = "translateY(0)"; }}>
              Get In Touch
            </a>
          </motion.div>
        </div>

        <div style={{ flex: "0 1 460px", maxWidth: "100%", margin: "0 auto" }}>
          <ExplodingShards />
        </div>
      </motion.div>

      <motion.div variants={fadeUp(0.9)} initial="hidden" animate="visible"
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ width: 20, height: 32, border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", justifyContent: "center", paddingTop: 5 }}>
          <div style={{ width: 2, height: 6, background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function About() {
  const ref = useRef(null);
  const reveal = useReveal(ref, "-100px");
  return (
    <section id="about" ref={ref} style={{ padding: "130px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={reveal} style={{ marginBottom: 56 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>About Me</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.15, letterSpacing: "-0.025em" }}>Building from the ground up</h2>
      </motion.div>
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "start" }}>
        <motion.div variants={fadeUp(0.15)} initial="hidden" animate={reveal}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.52)", lineHeight: 1.85, marginBottom: 22 }}>
            I'm a Computer Engineering student who loves understanding how systems work at every layer — from circuits and operating systems to scalable web architecture. That foundation shapes how I think about software.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.52)", lineHeight: 1.85 }}>
            Outside of coursework, I'm always building: personal projects, open source contributions, and exploring new tools. My goal is a software engineering role where I can work on products that are both technically challenging and genuinely useful.
          </p>
        </motion.div>
        <motion.div variants={fadeUp(0.28)} initial="hidden" animate={reveal}
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "28px 32px" }}>
          {[
            { label: "University", value: "Purdue University" },
            { label: "Degree", value: "B.S. Computer Engineering, Minor in Mathematics" },
            { label: "Graduating", value: "December 2027" },
            { label: "Focus", value: "Distributed Systems, Cloud & ML" },
            { label: "Status", value: "Open to opportunities 🚀" },
          ].map((item, i) => (
            <div key={item.label} style={{ display: "flex", gap: 20, padding: "13px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.28)", minWidth: 90, fontWeight: 500, paddingTop: 2 }}>{item.label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.72)" }}>{item.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── SKILLS ────────────────────────────────────────────────────────────────────
function Skills() {
  const ref = useRef(null);
  const reveal = useReveal(ref);

  return (
    <section id="skills" ref={ref} style={{ padding: "130px 6vw", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div variants={fadeUp()} initial="hidden" animate={reveal} style={{ marginBottom: 56 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Skills</p>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>My toolkit</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16 }}>
          {SKILLS.map((skill, i) => (
            <motion.div key={skill.name}
              variants={fadeUp(i * 0.04)} initial="hidden" animate={reveal}
              whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.4)" }}
              style={{
                padding: "24px 16px", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, background: "rgba(255,255,255,0.025)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <i className={skill.icon} style={{ fontSize: 38 }}></i>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 1.3,
              }}>{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


function Experience() {
  const ref = useRef(null);
  const reveal = useReveal(ref);

  return (
    <section id="experience" ref={ref} style={{ padding: "130px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={reveal} style={{ marginBottom: 56 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Experience</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>Where I've worked</h2>
      </motion.div>

      {/* Every role as its own block, one below another, so all of it can be
          read without clicking through tabs. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {EXPERIENCE.map((exp, i) => {
          const [company, note] = exp.company.split("—").map((part) => part.trim());
          return (
            <motion.article key={exp.company} variants={fadeUp(0.1 + i * 0.06)} initial="hidden" animate={reveal}
              style={{ padding: "30px 34px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid #6366f1", borderRadius: 12, background: "rgba(255,255,255,0.025)", transition: "border-color 0.25s, box-shadow 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: 6 }}>
                    {exp.role}
                  </h3>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#818cf8" }}>
                    {company}{note && <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}> · {note}</span>}
                  </div>
                </div>
                <div className="exp-when" style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>{exp.period}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{exp.location}</div>
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginBottom: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {exp.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: "#6366f1", marginTop: 8, flexShrink: 0, fontSize: 6 }}>◆</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.68)", lineHeight: 1.7 }}>{b}</span>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {exp.tags.map(tag => (
                  <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(165,130,250,0.85)", padding: "3px 10px", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 5 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function Projects() {
  const ref = useRef(null);
  const reveal = useReveal(ref);
  return (
    <section id="projects" ref={ref} style={{ padding: "130px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={reveal} style={{ marginBottom: 56 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Projects</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>Things I've built</h2>
      </motion.div>
      {/* 460px min never fit two columns inside the 1100px container, so six
          cards stacked into one very long column. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(400px, 100%), 1fr))", gap: 16 }}>
        {PROJECTS.map((proj, i) => (
          <motion.div key={proj.title} variants={fadeUp(i * 0.08)} initial="hidden" animate={reveal}
            whileHover={{ y: -4 }}
            style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, background: "rgba(255,255,255,0.025)", transition: "border-color 0.25s, box-shadow 0.25s", display: "flex", flexDirection: "column" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
            <ProjectShot src={proj.shot} title={proj.title} org={proj.org}
              locked={proj.proprietary} seed={i}
              href={proj.proprietary ? undefined : proj.repo} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                {proj.org ? `${proj.org} · ${proj.year}` : proj.year}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: STATUS_STYLE[proj.status].bg, color: STATUS_STYLE[proj.status].fg, border: `1px solid ${STATUS_STYLE[proj.status].bd}` }}>{proj.status}</span>
            </div>

            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.01em" }}>{proj.title}</h3>
            {proj.blurb && (
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#818cf8", fontWeight: 500, marginBottom: 10 }}>{proj.blurb}</p>
            )}
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.43)", lineHeight: 1.75, marginBottom: 22, flex: 1 }}>{proj.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
              {proj.tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(165,130,250,0.8)", padding: "3px 10px", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 5 }}>{tag}</span>
              ))}
            </div>

            {proj.proprietary ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.32)", width: "fit-content" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                Proprietary — source not public
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <a href={proj.repo} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                  <GitHubMark size={16} />
                  {proj.repoPrivate ? "Repo (private)" : "View on GitHub"}
                </a>
                {proj.live && (
                  <a href={proj.live} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#818cf8", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
                    onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <path d="M15 3h6v6" /><path d="M10 14 21 3" />
                    </svg>
                    Live site
                  </a>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function Contact() {
  const ref = useRef(null);
  const reveal = useReveal(ref);
  return (
    <section id="contact" ref={ref} style={{ padding: "130px 6vw 160px", textAlign: "center" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={reveal} style={{ maxWidth: 580, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Contact</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.025em", lineHeight: 1.15 }}>Let's connect</h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.43)", lineHeight: 1.8, marginBottom: 44 }}>
          I'm actively looking for internship and co-op opportunities. Whether you have a role, a project, or just want to chat — reach out.
        </p>
        <motion.a href="mailto:srihari.cs@outlook.com" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, padding: "14px 40px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => e.target.style.background = "#4f46e5"}
          onMouseLeave={e => e.target.style.background = "#6366f1"}>
          Send me an email
        </motion.a>
        <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 56 }}>
          {[{ label: "GitHub", href: "https://github.com/Srihari87" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/srihari-srikanth/" }].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.28)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.28)"}>
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = performance.now(), duration = 1400;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) { raf = requestAnimationFrame(tick); } else { setTimeout(onDone, 300); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div key="loader" exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "#090a10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 52, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>SS</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Portfolio</div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: "100%", height: 1.5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", borderRadius: 99, width: `${progress}%`, transition: "width 0.05s linear" }} />
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.06em" }}>{progress}%</span>
      </motion.div>
    </motion.div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  // Skip the intro for anyone who's asked for reduced motion — a 1.4s gate in
  // front of the content is exactly what that preference is about.
  const [loading, setLoading] = useState(() =>
    !(typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  );
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #090a10; color: #fff; overflow-x: hidden; cursor: none; }
        ::selection { background: rgba(99,102,241,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #090a10; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
        /* phones: the five nav links don't fit beside the name, and the About
           columns are too narrow side by side */
        @media (max-width: 860px) { .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
        @media (max-width: 640px) { .nav-links { display: none !important; } .exp-when { text-align: left !important; } }
      `}</style>

      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div key="site" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <CursorTrail />
          <Background />
          <Navbar />
          <main style={{ position: "relative", zIndex: 1 }}>
            <Hero />
            <About />
            <Experience />
            <Skills />
            <Projects />
            <Contact />
          </main>
          <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>Built with React & Framer Motion</span>
          </footer>
        </motion.div>
      )}
    </>
  );
}
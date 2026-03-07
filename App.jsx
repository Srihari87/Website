import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// ── DATA ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["About", "Skills", "Projects", "Contact"];

const SKILLS = [
  { name: "C / C++", level: 85, cat: "Languages" },
  { name: "Python", level: 80, cat: "Languages" },
  { name: "JavaScript", level: 75, cat: "Languages" },
  { name: "React", level: 70, cat: "Frontend" },
  { name: "HTML & CSS", level: 85, cat: "Frontend" },
  { name: "Node.js", level: 60, cat: "Backend" },
  { name: "Git & GitHub", level: 80, cat: "Tools" },
  { name: "Linux / Bash", level: 70, cat: "Tools" },
  { name: "Data Structures", level: 85, cat: "CS Core" },
  { name: "Algorithms", level: 80, cat: "CS Core" },
];

const PROJECTS = [
  {
    title: "Smart Campus Navigator",
    desc: "IoT-powered indoor navigation system using Raspberry Pi and BLE beacons. Real-time pathfinding with Dijkstra's algorithm.",
    tags: ["Python", "IoT", "Raspberry Pi", "Algorithms"],
    year: "2024",
    status: "In Progress",
  },
  {
    title: "CPU Scheduler Simulator",
    desc: "Visual simulation of OS scheduling algorithms — FCFS, SJF, Round Robin — with live Gantt charts and performance metrics.",
    tags: ["C++", "React", "Algorithms", "OS"],
    year: "2024",
    status: "Completed",
  },
  {
    title: "Distributed Chat App",
    desc: "Real-time peer-to-peer messaging using WebSockets with end-to-end encryption and offline message queuing.",
    tags: ["Node.js", "WebSockets", "Cryptography"],
    year: "2023",
    status: "Completed",
  },
  {
    title: "Neural Network from Scratch",
    desc: "Fully connected neural net built with NumPy only — backprop, gradient descent, and MNIST digit classification.",
    tags: ["Python", "NumPy", "ML", "Math"],
    year: "2023",
    status: "Completed",
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

function useTypewriter(words, speed = 75, pause = 2000) {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");
  useEffect(() => {
    const word = words[idx];
    let t;
    if (!deleting && char < word.length) {
      t = setTimeout(() => { setText(word.slice(0, char + 1)); setChar(c => c + 1); }, speed);
    } else if (!deleting && char === word.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && char > 0) {
      t = setTimeout(() => { setText(word.slice(0, char - 1)); setChar(c => c - 1); }, speed / 2);
    } else {
      setDeleting(false);
      setIdx(i => (i + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [char, deleting, idx, words, speed, pause]);
  return text;
}

// ── AMBIENT CURSOR GLOW ───────────────────────────────────────────────────────
function AmbientCursor() {
  const glowRef = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const current = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    let raf;
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.07;
      current.current.y += (pos.current.y - current.current.y) * 0.07;
      if (glowRef.current) {
        glowRef.current.style.background = `
          radial-gradient(
            600px circle at ${current.current.x}px ${current.current.y}px,
            rgba(99, 102, 241, 0.13) 0%,
            rgba(99, 102, 241, 0.04) 40%,
            transparent 70%
          )
        `;
      }
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", willChange: "background",
      }}
    />
  );
}

// ── BACKGROUND ────────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 50% at 50% -10%, rgba(99,102,241,0.07) 0%, transparent 60%)" }} />
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
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 6vw", height: 68,
        background: scrolled ? "rgba(9,10,16,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
        YourName
      </span>
      <div style={{ display: "flex", gap: 40 }}>
        {NAV_LINKS.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s", fontWeight: 400 }}
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
  const typed = useTypewriter(["Software Engineer.", "Problem Solver.", "System Builder.", "CS Explorer."]);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const op = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6vw", position: "relative" }}>
      <motion.div style={{ y, opacity: op, textAlign: "center", maxWidth: 820 }}>

        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Open to internship opportunities</span>
        </motion.div>

        <motion.h1 variants={fadeUp(0.2)} initial="hidden" animate="visible"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(44px, 7.5vw, 88px)", fontWeight: 800, lineHeight: 1.08, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.03em" }}>
          Computer Engineering<br />
          <span style={{ color: "rgba(255,255,255,0.28)" }}>Student &amp; Aspiring</span>
        </motion.h1>

        <motion.div variants={fadeUp(0.32)} initial="hidden" animate="visible"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(26px, 3.8vw, 50px)", fontWeight: 700, color: "#818cf8", marginBottom: 40, letterSpacing: "-0.02em", minHeight: 58 }}>
          {typed}<span style={{ borderRight: "2px solid #818cf8", marginLeft: 2 }}>&nbsp;</span>
        </motion.div>

        <motion.p variants={fadeUp(0.42)} initial="hidden" animate="visible"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(255,255,255,0.42)", lineHeight: 1.8, marginBottom: 48, maxWidth: 540, margin: "0 auto 48px" }}>
          I build things with code — from low-level systems to modern web apps. Passionate about clean architecture, performance, and shipping products that matter.
        </motion.p>

        <motion.div variants={fadeUp(0.52)} initial="hidden" animate="visible"
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#projects" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, padding: "13px 28px",
            background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "#4f46e5"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "#6366f1"; e.target.style.transform = "translateY(0)"; }}>
            View My Work
          </a>
          <a href="#contact" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, padding: "13px 28px",
            background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", borderRadius: 8, textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.transform = "translateY(0)"; }}>
            Get In Touch
          </a>
        </motion.div>

        <motion.div variants={fadeUp(0.75)} initial="hidden" animate="visible"
          style={{ marginTop: 88, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{ width: 20, height: 32, border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", justifyContent: "center", paddingTop: 5 }}>
            <div style={{ width: 2, height: 6, background: "rgba(255,255,255,0.35)", borderRadius: 1 }} />
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} style={{ padding: "130px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ marginBottom: 56 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>About Me</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.15, letterSpacing: "-0.025em" }}>
          Building from the ground up
        </h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "start" }}>
        <motion.div variants={fadeUp(0.15)} initial="hidden" animate={inView ? "visible" : "hidden"}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.52)", lineHeight: 1.85, marginBottom: 22 }}>
            I'm a Computer Engineering student who loves understanding how systems work at every layer — from circuits and operating systems to scalable web architecture. That foundation shapes how I think about software.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.52)", lineHeight: 1.85 }}>
            Outside of coursework, I'm always building: personal projects, open source contributions, and exploring new tools. My goal is a software engineering role where I can work on products that are both technically challenging and genuinely useful.
          </p>
        </motion.div>

        <motion.div variants={fadeUp(0.28)} initial="hidden" animate={inView ? "visible" : "hidden"}
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "28px 32px" }}>
          {[
            { label: "University", value: "Your University" },
            { label: "Degree", value: "B.S. Computer Engineering" },
            { label: "Year", value: "Junior — Class of 2026" },
            { label: "Focus", value: "Software Engineering & Systems" },
            { label: "Status", value: "Seeking internships 🚀" },
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
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="skills" ref={ref} style={{ padding: "130px 6vw", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <motion.div variants={fadeUp()} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ marginBottom: 56 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Skills</p>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
            My toolkit
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 10 }}>
          {SKILLS.map((skill, i) => (
            <motion.div key={skill.name}
              variants={fadeUp(i * 0.04)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ padding: "18px 22px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, background: "rgba(255,255,255,0.025)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{skill.name}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(129,140,248,0.85)", fontWeight: 500 }}>{skill.level}%</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", borderRadius: 99 }}
                />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 7, display: "block", fontWeight: 500, letterSpacing: "0.04em" }}>{skill.cat}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────
function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" ref={ref} style={{ padding: "130px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ marginBottom: 56 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Projects</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Things I've built
        </h2>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: 16 }}>
        {PROJECTS.map((proj, i) => (
          <motion.div key={proj.title}
            variants={fadeUp(i * 0.08)} initial="hidden" animate={inView ? "visible" : "hidden"}
            whileHover={{ y: -4 }}
            style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, background: "rgba(255,255,255,0.025)", transition: "border-color 0.25s, box-shadow 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>{proj.year}</span>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 6,
                background: proj.status === "Completed" ? "rgba(74,222,128,0.08)" : "rgba(251,191,36,0.08)",
                color: proj.status === "Completed" ? "#4ade80" : "#fbbf24",
                border: `1px solid ${proj.status === "Completed" ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`,
              }}>{proj.status}</span>
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{proj.title}</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.43)", lineHeight: 1.75, marginBottom: 22 }}>{proj.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {proj.tags.map(tag => (
                <span key={tag} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(165,130,250,0.8)", padding: "3px 10px", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 5 }}>{tag}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" ref={ref} style={{ padding: "130px 6vw 160px", textAlign: "center" }}>
      <motion.div variants={fadeUp()} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ maxWidth: 580, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>Contact</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 800, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Let's connect
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.43)", lineHeight: 1.8, marginBottom: 44 }}>
          I'm actively looking for internship and co-op opportunities. Whether you have a role, a project, or just want to chat — reach out.
        </p>
        <motion.a href="mailto:your@email.com" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: "inline-block", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, padding: "14px 40px", background: "#6366f1", color: "#fff", borderRadius: 8, textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => e.target.style.background = "#4f46e5"}
          onMouseLeave={e => e.target.style.background = "#6366f1"}>
          Send me an email
        </motion.a>

        <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 56 }}>
          {[{ label: "GitHub", href: "https://github.com" }, { label: "LinkedIn", href: "https://linkedin.com" }, { label: "Resume", href: "#" }].map(link => (
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
    // Animate progress from 0 → 100 over ~1.4s
    const start = performance.now();
    const duration = 1400;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Small pause at 100% before exiting
        setTimeout(onDone, 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      key="loader"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "#090a10",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 32,
      }}
    >
      {/* Name / logo mark */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center" }}
      >
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 48, fontWeight: 800,
          color: "#fff", letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 8,
        }}>
          YN
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 500,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}>
          Portfolio
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
      >
        <div style={{
          width: "100%", height: 1.5,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 99, overflow: "hidden",
        }}>
          <motion.div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #a78bfa)",
              borderRadius: 99,
              width: `${progress}%`,
            }}
          />
        </div>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11, color: "rgba(255,255,255,0.2)",
          fontWeight: 500, letterSpacing: "0.06em",
        }}>
          {progress}%
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #090a10; color: #fff; overflow-x: hidden; }
        ::selection { background: rgba(99,102,241,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #090a10; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
      `}</style>

      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.div
          key="site"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <AmbientCursor />
          <Background />
          <Navbar />

          <main style={{ position: "relative", zIndex: 1 }}>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Contact />
          </main>

          <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
              Built with React & Framer Motion
            </span>
          </footer>
        </motion.div>
      )}
    </>
  );
}

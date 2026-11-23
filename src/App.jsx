import { useEffect, useState } from "react";
import Background from "./Background.jsx";
import Terminal from "./Terminal.jsx";
import { PROFILE, EXPERIENCE, PROJECTS, SKILLS } from "./data.js";

const NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const ext = { target: "_blank", rel: "noopener noreferrer" };

// Public files live under the deploy base: "/" on Vercel, "/Website/" on GitHub Pages.
const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, "");

function Icon({ name }) {
  const paths = {
    github:
      "M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z",
    linkedin:
      "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
    mail:
      "M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2 .9v.3l8 5.2 8-5.2v-.3H4Zm16 2.6-7.46 4.85a1 1 0 0 1-1.08 0L4 9v9h16V9Z",
    terminal:
      "M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2v12h16V6H4Zm2.3 2.3L10 12l-3.7 3.7-1.4-1.4L7.17 12 4.9 9.7l1.4-1.4ZM11 15h6v2h-6v-2Z",
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d={paths[name]} />
    </svg>
  );
}

// Fades each section in the first time it scrolls into view. Sections are
// only hidden once this runs (the "js" class on <html>), so if scripts fail
// everything is simply shown. Uses plain scroll/resize checks.
function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const items = [...document.querySelectorAll(".reveal")];
    root.classList.add("js");
    // five elements, so checking on every scroll event is cheap
    const check = () => {
      const limit = window.innerHeight * 0.92;
      for (const el of items) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < limit) el.classList.add("in");
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
}

// The section currently at the top of the screen, for the nav highlight.
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = ["top", ...NAV.map((n) => n.id)];
    const onScroll = () => {
      let current = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

function Nav({ active, onShell }) {
  return (
    <header className={`nav ${active !== "top" ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="Back to top">SS</a>
        <nav aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className={active === n.id ? "active" : ""}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-icons">
          <button className="icon-btn" onClick={onShell} aria-label="Open the in-browser shell" title="Open the shell">
            <Icon name="terminal" />
          </button>
          <a className="icon-btn" href={PROFILE.github} {...ext} aria-label="GitHub" data-umami-event="github"><Icon name="github" /></a>
          <a className="icon-btn" href={PROFILE.linkedin} {...ext} aria-label="LinkedIn" data-umami-event="linkedin"><Icon name="linkedin" /></a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="photo-ring">
        <img src={asset("/me.jpg")} alt="Srihari Srikanth" width="168" height="168" />
      </div>
      <p className="hello">Hi, my name is</p>
      <h1 className="name">{PROFILE.name}</h1>
      <p className="title">Computer Engineering @ Purdue University</p>
      <p className="focus">Systems <span>·</span> Infrastructure <span>·</span> Machine Learning</p>
      <p className="intro">{PROFILE.summary}</p>
      <div className="cta">
        <a className="btn primary" href="#projects">View my work</a>
        <a className="btn" href="#contact">Get in touch</a>
      </div>
      <div className="socials">
        <a href={PROFILE.github} {...ext} aria-label="GitHub" data-umami-event="github"><Icon name="github" /></a>
        <a href={PROFILE.linkedin} {...ext} aria-label="LinkedIn" data-umami-event="linkedin"><Icon name="linkedin" /></a>
        <a href={`mailto:${PROFILE.email}`} aria-label="Email" data-umami-event="email"><Icon name="mail" /></a>
      </div>
    </section>
  );
}

function SectionTitle({ index, children }) {
  return (
    <h2 className="section-title">
      <span className="num">{String(index).padStart(2, "0")}.</span> {children}
    </h2>
  );
}

function Tags({ items }) {
  return <ul className="tags">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}

function About() {
  return (
    <section id="about" className="section reveal">
      <SectionTitle index={1}>About</SectionTitle>
      <div className="card">
        <dl className="facts">
          <div>
            <dt>Education</dt>
            <dd>{PROFILE.school}<br /><span className="muted">{PROFILE.degree} · {PROFILE.graduation}</span></dd>
          </div>
          <div><dt>Based in</dt><dd>{PROFILE.location}</dd></div>
          <div><dt>Coursework</dt><dd><Tags items={PROFILE.coursework} /></dd></div>
          <div><dt>Honors</dt><dd>{PROFILE.honors.map((h) => <p key={h} className="honor">{h}</p>)}</dd></div>
        </dl>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="section reveal">
      <SectionTitle index={2}>Experience</SectionTitle>
      <ol className="timeline">
        {EXPERIENCE.map((e) => (
          <li key={e.id} className="card job">
            <div className="job-head">
              <div>
                <h3>{e.role}</h3>
                <p className="company">{e.company}{e.note && <span className="muted"> · {e.note}</span>}</p>
              </div>
              <div className="when">
                <span className="period">{e.period}</span>
                <span className="muted">{e.location}</span>
              </div>
            </div>
            <ul className="bullets">{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            <Tags items={e.tags} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function Projects({ onShell }) {
  return (
    <section id="projects" className="section reveal">
      <SectionTitle index={3}>Projects</SectionTitle>
      <ul className="projects">
        {PROJECTS.map((p) => (
          <li key={p.id} className="card project">
            {p.shot && <img className="shot" src={asset(p.shot)} alt={`${p.title} screenshot`} loading="lazy" />}
            <div className="project-body">
              <h3>{p.title}</h3>
              {p.org && <p className="muted small">{p.org}</p>}
              <p className="desc">{p.desc}</p>
              <Tags items={p.stack} />
              <div className="links">
                {p.live && <a href={p.live} {...ext} data-umami-event="project-live" data-umami-event-project={p.id}>Live ↗</a>}
                {p.repo && <a href={p.repo} {...ext} data-umami-event="project-code" data-umami-event-project={p.id}>Code ↗</a>}
                <button className="linkish" onClick={() => onShell(`cat projects/${p.id}.md`)}>$ cat in shell</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="section reveal">
      <SectionTitle index={4}>Skills</SectionTitle>
      <div className="skills">
        {SKILLS.map((s) => (
          <div key={s.group} className="card skill">
            <h3>{s.group}</h3>
            <Tags items={s.items} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section reveal">
      <SectionTitle index={5}>Contact</SectionTitle>
      <div className="card contact">
        <h3>Let's talk</h3>
        <p>Open to software, systems and ML engineering internships and new-grad roles. Email is the fastest way to reach me.</p>
        <a className="btn primary" href={`mailto:${PROFILE.email}`} data-umami-event="email">{PROFILE.email}</a>
      </div>
    </section>
  );
}

function ShellModal({ command, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="In-browser shell" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close the shell">×</button>
        <Terminal intro={command ? [command] : undefined} />
        <p className="caption">
          A POSIX-style shell in your browser, a nod to the one I wrote in C. Try <code>help</code> · Esc to close
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const active = useActiveSection();
  // null: shell closed; "": open with its intro; "cmd": open and run cmd
  const [shell, setShell] = useState(null);
  useReveal();

  return (
    <>
      <Background />
      <Nav active={active} onShell={() => setShell("")} />
      <main className="page">
        <Hero />
        <About />
        <Experience />
        <Projects onShell={(cmd) => setShell(cmd)} />
        <Skills />
        <Contact />
      </main>
      <footer className="foot">© {new Date().getFullYear()} {PROFILE.name} · Built with React + Vite</footer>
      {shell !== null && <ShellModal command={shell} onClose={() => setShell(null)} />}
    </>
  );
}

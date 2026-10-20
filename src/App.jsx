import { useState } from "react";
import Terminal from "./Terminal.jsx";
import { runInShell } from "./shell.js";
import { PROFILE, EXPERIENCE, PROJECTS, SKILLS } from "./data.js";

function Chevron({ open }) {
  return (
    <svg className={`chev ${open ? "open" : ""}`} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ id, title, open, onToggle, children }) {
  return (
    <section className="row" id={id}>
      <h2>
        <button className="row-head" aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}>
          <span>{title}</span>
          <Chevron open={open} />
        </button>
      </h2>
      <div className={`row-panel ${open ? "open" : ""}`} id={`${id}-panel`} role="region" aria-label={title}>
        <div className="row-inner">{children}</div>
      </div>
    </section>
  );
}

function Tags({ items }) {
  return (
    <ul className="tags">
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

function About() {
  return (
    <div className="about">
      <p className="lede">{PROFILE.summary}</p>
      <dl className="facts">
        <div><dt>Education</dt><dd>{PROFILE.school}, {PROFILE.degree}, {PROFILE.graduation}</dd></div>
        <div><dt>Coursework</dt><dd>{PROFILE.coursework.join(" · ")}</dd></div>
        <div><dt>Honors</dt><dd>{PROFILE.honors.join(" · ")}</dd></div>
      </dl>
    </div>
  );
}

function Experience() {
  return (
    <ol className="timeline">
      {EXPERIENCE.map((e) => (
        <li key={e.id} className="job">
          <div className="job-head">
            <h3>{e.company}{e.note && <span className="note"> · {e.note}</span>}</h3>
            <span className="period">{e.period}</span>
          </div>
          <p className="role">{e.role} · {e.location}</p>
          <ul className="bullets">
            {e.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <Tags items={e.tags} />
        </li>
      ))}
    </ol>
  );
}

function Projects() {
  return (
    <ul className="projects">
      {PROJECTS.map((p) => (
        <li key={p.id} className="project">
          {p.shot && (
            <img className="shot" src={p.shot} alt={`${p.title} screenshot`} loading="lazy" />
          )}
          <div className="project-head">
            <h3>{p.title}{p.org && <span className="note"> · {p.org}</span>}</h3>
            <div className="links">
              {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" data-umami-event="project-live" data-umami-event-project={p.id}>Live ↗</a>}
              {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" data-umami-event="project-code" data-umami-event-project={p.id}>Code ↗</a>}
              <button className="linkish" onClick={() => runInShell(`cat projects/${p.id}.md`)} title="Print it in the shell">
                $ cat
              </button>
            </div>
          </div>
          <p className="desc">{p.desc}</p>
          <Tags items={p.stack} />
        </li>
      ))}
    </ul>
  );
}

function Skills() {
  return (
    <dl className="skills">
      {SKILLS.map((s) => (
        <div key={s.group}>
          <dt>{s.group}</dt>
          <dd><Tags items={s.items} /></dd>
        </div>
      ))}
    </dl>
  );
}

function Contact() {
  return (
    <div className="contact">
      <p className="lede">
        Open to software, systems and ML engineering internships and new-grad roles. Email is the fastest way to reach me.
      </p>
      <a className="email" href={`mailto:${PROFILE.email}`} data-umami-event="email">{PROFILE.email}</a>
      <ul className="contact-links">
        <li><a href={PROFILE.github} target="_blank" rel="noopener noreferrer" data-umami-event="github">GitHub ↗</a></li>
        <li><a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" data-umami-event="linkedin">LinkedIn ↗</a></li>
      </ul>
    </div>
  );
}

const SECTIONS = [
  { id: "about", title: "About.", body: <About /> },
  { id: "experience", title: "Experience.", body: <Experience /> },
  { id: "work", title: "Selected work.", body: <Projects /> },
  { id: "skills", title: "Skills.", body: <Skills /> },
  { id: "contact", title: "Let's talk.", body: <Contact /> },
];

export default function App() {
  const [open, setOpen] = useState(() => new Set(["experience"]));
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="layout">
      <main className="left">
        <header className="hero">
          <p className="name">{PROFILE.name}</p>
          <h1>
            I build <em>low-level</em> systems that hold up at scale.
          </h1>
          <p className="sub">
            Computer Engineering + Math at Purdue, graduating {PROFILE.graduation}.
          </p>
        </header>
        {SECTIONS.map(({ id, title, body }) => (
          <Section key={id} id={id} title={title} open={open.has(id)} onToggle={() => toggle(id)}>
            {body}
          </Section>
        ))}
        <footer className="foot">
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <span>Built with React + Vite</span>
        </footer>
      </main>
      <aside className="right" aria-label="Interactive shell">
        <Terminal />
        <p className="caption">
          Background: a POSIX-style shell, running in your browser. Try <code>help</code>.
        </p>
      </aside>
    </div>
  );
}

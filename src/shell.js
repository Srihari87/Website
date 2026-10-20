// A tiny POSIX-flavoured shell over a read-only virtual filesystem built from
// the site's content. Supports pipelines (|), sequencing (;), quoting, ~, . and ..

import { PROFILE, EXPERIENCE, PROJECTS, SKILLS } from "./data.js";

// Other parts of the page type a command into the on-page terminal with this.
export function runInShell(command) {
  window.dispatchEvent(new CustomEvent("shell:run", { detail: command }));
}

export const HOME = `/home/${PROFILE.handle}`;

const dir = (children) => ({ type: "dir", children });
const file = (content) => ({ type: "file", content });
const link = (href, label) => ({ type: "link", href, label });

function wrap(text, width = 72) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      if (line && (line + " " + word).length > width) { out.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    out.push(line);
  }
  return out.join("\n");
}

function experienceFile(e) {
  return [
    `${e.company}${e.note ? ` (${e.note})` : ""}`,
    `${e.role} · ${e.location}`,
    e.period,
    "",
    ...e.bullets.map((b) => wrap(`- ${b}`).replace(/\n/g, "\n  ")),
    "",
    `stack: ${e.tags.join(", ")}`,
  ].join("\n");
}

function projectFile(p) {
  const lines = [p.title + (p.org ? ` (${p.org})` : ""), `stack: ${p.stack.join(", ")}`, "", wrap(p.desc)];
  if (p.repo) lines.push("", `code: ${p.repo}`);
  if (p.live) lines.push(`live: ${p.live}`);
  return lines.join("\n");
}

export function buildFs() {
  const experience = {};
  for (const e of EXPERIENCE) experience[`${e.id}.md`] = file(experienceFile(e));
  const projects = {};
  for (const p of PROJECTS) projects[`${p.id}.md`] = file(projectFile(p));

  const about = [
    `${PROFILE.name}`,
    `${PROFILE.degree}, ${PROFILE.school}, ${PROFILE.graduation}`,
    "",
    wrap(PROFILE.summary),
    "",
    "coursework:",
    ...PROFILE.coursework.map((c) => `  ${c}`),
    "",
    "honors:",
    ...PROFILE.honors.map((h) => `  ${h}`),
  ].join("\n");

  const skills = SKILLS.map((s) => `${s.group}:\n  ${s.items.join(", ")}`).join("\n\n");
  const contact = [
    `email     ${PROFILE.email}`,
    `github    ${PROFILE.github}`,
    `linkedin  ${PROFILE.linkedin}`,
    "",
    "try: open resume.pdf   or   open github",
  ].join("\n");

  return dir({
    home: dir({
      [PROFILE.handle]: dir({
        "about.txt": file(about),
        "skills.txt": file(skills),
        "contact.txt": file(contact),
        "resume.pdf": link(PROFILE.resume, "resume"),
        experience: dir(experience),
        projects: dir(projects),
      }),
    }),
    etc: dir({ motd: file("Welcome. Type `help` to see what this shell can do.") }),
  });
}

// ── path helpers ─────────────────────────────────────────────────────────────
export function resolvePath(cwd, arg = "") {
  let p = arg || HOME;
  if (p === "~" || p.startsWith("~/")) p = HOME + p.slice(1);
  const parts = (p.startsWith("/") ? p : `${cwd}/${p}`).split("/");
  const stack = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

export function lookup(fs, path) {
  let node = fs;
  for (const part of path.split("/").filter(Boolean)) {
    if (node.type !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

export const prettyPath = (path) => (path === HOME ? "~" : path.startsWith(HOME + "/") ? "~" + path.slice(HOME.length) : path);

// ── parsing ──────────────────────────────────────────────────────────────────
export function tokenize(line) {
  const tokens = [];
  let cur = "", quote = null, started = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch; started = true;
    } else if (ch === "|" || ch === ";") {
      if (started || cur) tokens.push(cur);
      tokens.push({ op: ch });
      cur = ""; started = false;
    } else if (/\s/.test(ch)) {
      if (started || cur) tokens.push(cur);
      cur = ""; started = false;
    } else {
      cur += ch; started = true;
    }
  }
  if (quote) throw new Error("unterminated quote");
  if (started || cur) tokens.push(cur);
  return tokens;
}

// [[cmd, ...args] | [cmd, ...args]] ; [...]
function parse(line) {
  const sequences = [[[]]];
  for (const t of tokenize(line)) {
    const seq = sequences[sequences.length - 1];
    if (typeof t === "object" && t.op === ";") sequences.push([[]]);
    else if (typeof t === "object" && t.op === "|") seq.push([]);
    else seq[seq.length - 1].push(t);
  }
  return sequences.filter((s) => s.some((c) => c.length));
}

// ── commands ─────────────────────────────────────────────────────────────────
// Each command gets (args, stdin lines, ctx) and returns { out: string[], err?: string[] }.
const HELP = [
  "commands:",
  "  ls [dir]          list a directory          cat <file>     print a file",
  "  cd [dir]          change directory          pwd            where am I",
  "  open <file|site>  open resume.pdf, github, linkedin, email",
  "  grep <text>       filter lines (use in a pipe)",
  "  head [-n N]  wc -l  sort  echo  whoami  date  uname  history  clear",
  "",
  "try:  ls projects    cat experience/intellicent.md    ls -R | grep md",
];

export function createShell() {
  const fs = buildFs();
  const state = { cwd: HOME, history: [] };

  const commands = {
    help: () => ({ out: HELP }),
    whoami: () => ({ out: [PROFILE.handle] }),
    pwd: () => ({ out: [state.cwd] }),
    date: () => ({ out: [new Date().toString()] }),
    uname: (args) => ({ out: [args.includes("-a") ? "srihari-os 1.0 portfolio wasm-ish javascript" : "srihari-os"] }),
    echo: (args) => ({ out: [args.join(" ")] }),
    history: () => ({ out: state.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`) }),
    clear: () => ({ out: [], clear: true }),
    exit: () => ({ out: ["there is no escape. (try `open github` instead)"] }),
    sudo: () => ({ err: ["srihari is not in the sudoers file. This incident will be reported."] }),
    rm: () => ({ err: ["rm: read-only file system"] }),
    vim: () => ({ err: ["vim: you'd never get out. try `cat`"] }),
    cd: (args) => {
      const target = resolvePath(state.cwd, args[0]);
      const node = lookup(fs, target);
      if (!node) return { err: [`cd: ${args[0]}: No such file or directory`] };
      if (node.type !== "dir") return { err: [`cd: ${args[0]}: Not a directory`] };
      state.cwd = target;
      return { out: [] };
    },
    ls: (args) => {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const paths = args.filter((a) => !a.startsWith("-"));
      const recursive = flags.includes("R");
      const out = [], err = [];
      const list = (path, label) => {
        const node = lookup(fs, path);
        if (!node) { err.push(`ls: ${label}: No such file or directory`); return; }
        if (node.type !== "dir") { out.push(label); return; }
        const names = Object.keys(node.children).sort().map((n) => (node.children[n].type === "dir" ? `${n}/` : n));
        if (recursive) {
          out.push(`${prettyPath(path)}:`, ...names, "");
          for (const n of Object.keys(node.children).sort())
            if (node.children[n].type === "dir") list(`${path}/${n}`, n);
        } else out.push(...names);
      };
      (paths.length ? paths : ["."]).forEach((p) => list(resolvePath(state.cwd, p), p));
      return { out, err };
    },
    cat: (args, stdin) => {
      if (!args.length) return { out: stdin };
      const out = [], err = [];
      for (const a of args) {
        const node = lookup(fs, resolvePath(state.cwd, a));
        if (!node) err.push(`cat: ${a}: No such file or directory`);
        else if (node.type === "dir") err.push(`cat: ${a}: Is a directory`);
        else if (node.type === "link") out.push(`${a}: binary file. try \`open ${a}\``);
        else out.push(...node.content.split("\n"));
      }
      return { out, err };
    },
    open: (args) => {
      const targets = {
        github: PROFILE.github,
        linkedin: PROFILE.linkedin,
        email: `mailto:${PROFILE.email}`,
        resume: PROFILE.resume,
      };
      const a = args[0];
      if (!a) return { err: ["usage: open <resume.pdf|github|linkedin|email>"] };
      const node = lookup(fs, resolvePath(state.cwd, a));
      const href = targets[a.replace(/\.pdf$/, "")] || (node?.type === "link" ? node.href : null);
      if (!href) return { err: [`open: ${a}: nothing to open`] };
      return { out: [`opening ${href} …`], open: href };
    },
    grep: (args, stdin) => {
      const invert = args.includes("-v"), nocase = args.includes("-i");
      const pat = args.filter((a) => !a.startsWith("-"))[0];
      if (pat === undefined) return { err: ["usage: grep [-iv] <text>"] };
      const p = nocase ? pat.toLowerCase() : pat;
      return { out: stdin.filter((l) => (nocase ? l.toLowerCase() : l).includes(p) !== invert) };
    },
    head: (args, stdin) => {
      const i = args.indexOf("-n");
      const n = i >= 0 ? parseInt(args[i + 1], 10) : parseInt((args[0] || "-10").replace("-", ""), 10);
      return { out: stdin.slice(0, Number.isFinite(n) ? n : 10) };
    },
    wc: (args, stdin) => ({ out: [String(args.includes("-l") || !args.length ? stdin.length : stdin.join(" ").split(/\s+/).filter(Boolean).length)] }),
    sort: (args, stdin) => ({ out: [...stdin].sort() }),
  };

  function run(line) {
    const trimmed = line.trim();
    if (!trimmed) return { lines: [] };
    state.history.push(trimmed);
    let sequences;
    try { sequences = parse(trimmed); }
    catch (e) { return { lines: [{ text: `sh: ${e.message}`, kind: "err" }] }; }

    const lines = [];
    let clear = false, open = null;
    for (const pipeline of sequences) {
      let stdin = [];
      for (let i = 0; i < pipeline.length; i++) {
        const [name, ...args] = pipeline[i];
        const cmd = commands[name];
        if (!cmd) {
          lines.push({ text: `sh: ${name}: command not found`, kind: "err" });
          stdin = [];
          break;
        }
        const res = cmd(args, stdin);
        (res.err || []).forEach((t) => lines.push({ text: t, kind: "err" }));
        if (res.clear) { clear = true; lines.length = 0; }
        if (res.open) open = res.open;
        stdin = res.out || [];
      }
      stdin.forEach((t) => lines.push({ text: t }));
    }
    return { lines, clear, open };
  }

  function complete(input) {
    const tokens = input.split(/\s+/);
    const last = tokens[tokens.length - 1];
    let candidates;
    if (tokens.length === 1) {
      candidates = Object.keys(commands).filter((c) => c.startsWith(last));
    } else {
      const slash = last.lastIndexOf("/");
      const base = slash >= 0 ? last.slice(0, slash + 1) : "";
      const node = lookup(fs, resolvePath(state.cwd, base || "."));
      if (!node || node.type !== "dir") return { input, options: [] };
      candidates = Object.keys(node.children)
        .filter((n) => n.startsWith(last.slice(base.length)))
        .map((n) => base + n + (node.children[n].type === "dir" ? "/" : ""));
    }
    if (candidates.length === 1) {
      tokens[tokens.length - 1] = candidates[0];
      const done = tokens.join(" ");
      return { input: candidates[0].endsWith("/") ? done : done + " ", options: [] };
    }
    // extend to the common prefix
    let prefix = candidates[0] || last;
    for (const c of candidates) while (!c.startsWith(prefix)) prefix = prefix.slice(0, -1);
    tokens[tokens.length - 1] = prefix.length > last.length ? prefix : last;
    return { input: tokens.join(" "), options: candidates.length > 1 ? candidates : [] };
  }

  return { run, complete, state, cwd: () => state.cwd };
}

import { useEffect, useRef, useState } from "react";
import { createShell, prettyPath } from "./shell.js";
import { PROFILE } from "./data.js";

const INTRO = ["whoami", "cat about.txt | head -n 9", "ls projects"];
const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Terminal() {
  const shell = useRef(null);
  if (!shell.current) shell.current = createShell();
  const [lines, setLines] = useState([
    { text: `srihari-os 1.0 · type \`help\` to look around`, kind: "dim" },
    { text: "" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(true);
  const [cwd, setCwd] = useState(shell.current.cwd());
  const histIdx = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const queue = useRef(Promise.resolve());

  const prompt = (dir) => `${PROFILE.handle}@portfolio:${prettyPath(dir)}$`;

  function execute(command) {
    const before = shell.current.cwd();
    const res = shell.current.run(command);
    setCwd(shell.current.cwd());
    setLines((prev) => {
      const echo = { text: command, kind: "cmd", prompt: prompt(before) };
      return res.clear ? [] : [...prev, echo, ...res.lines];
    });
    if (res.open) window.open(res.open, res.open.startsWith("mailto:") ? "_self" : "_blank", "noopener");
  }

  // Types a command out character by character, then runs it.
  function typeAndRun(command, { fast = false } = {}) {
    queue.current = queue.current.then(
      () =>
        new Promise((resolve) => {
          setBusy(true);
          if (reducedMotion() || fast) {
            execute(command);
            setInput("");
            setBusy(false);
            resolve();
            return;
          }
          let i = 0;
          const tick = () => {
            i++;
            setInput(command.slice(0, i));
            if (i < command.length) setTimeout(tick, 28 + Math.random() * 40);
            else
              setTimeout(() => {
                execute(command);
                setInput("");
                setBusy(false);
                resolve();
              }, 220);
          };
          setTimeout(tick, 250);
        })
    );
  }

  const started = useRef(false);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      INTRO.forEach((c) => typeAndRun(c));
    }
    const onRun = (e) => typeAndRun(e.detail);
    window.addEventListener("shell:run", onRun);
    return () => window.removeEventListener("shell:run", onRun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, input]);

  function onKeyDown(e) {
    if (busy) { e.preventDefault(); return; }
    const hist = shell.current.state.history;
    if (e.key === "Enter") {
      e.preventDefault();
      execute(input);
      setInput("");
      histIdx.current = null;
    } else if (e.key === "Tab") {
      e.preventDefault();
      const { input: next, options } = shell.current.complete(input);
      setInput(next);
      if (options.length)
        setLines((prev) => [...prev, { text: input, kind: "cmd", prompt: prompt(cwd) }, { text: options.join("   "), kind: "dim" }]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      histIdx.current = histIdx.current === null ? hist.length - 1 : Math.max(0, histIdx.current - 1);
      setInput(hist[histIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current === null) return;
      histIdx.current = histIdx.current + 1;
      if (histIdx.current >= hist.length) { histIdx.current = null; setInput(""); }
      else setInput(hist[histIdx.current]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setLines((prev) => [...prev, { text: input + "^C", kind: "cmd", prompt: prompt(cwd) }]);
      setInput("");
    }
  }

  return (
    <div className="term" onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus({ preventScroll: true })}>
      <div className="term-bar" aria-hidden="true">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="term-title">{prompt(cwd).replace(/\$$/, "")} — sh</span>
      </div>
      <div className="term-body" ref={scrollRef} role="log" aria-live="polite" aria-label="Interactive shell">
        {lines.map((l, i) => (
          <div key={i} className={`term-line ${l.kind || ""}`}>
            {l.kind === "cmd" && <span className="term-prompt">{l.prompt} </span>}
            {l.text || " "}
          </div>
        ))}
        <label className="term-line term-input-line">
          <span className="term-prompt">{prompt(cwd)} </span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={(e) => { if (!busy) setInput(e.target.value); }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Shell command"
          />
        </label>
      </div>
    </div>
  );
}

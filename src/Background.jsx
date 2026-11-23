import { useEffect, useRef } from "react";

// A quiet, slowly drifting constellation behind the page. Points that come
// close are joined by a faint line. Static (drawn once) when the visitor
// prefers reduced motion; paused while the tab is hidden.
const COLORS = ["#22d3ee", "#818cf8", "#34d399", "#f472b6"];

export default function Background() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, frame = 0;
    let points = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 22000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.6,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.14 * (1 - d / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of points) {
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function step() {
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
      draw();
      frame = requestAnimationFrame(step);
    }

    resize();
    if (still) draw();
    else frame = requestAnimationFrame(step);

    const onResize = () => { resize(); if (still) draw(); };
    const onVisibility = () => {
      if (still) return;
      cancelAnimationFrame(frame);
      if (!document.hidden) frame = requestAnimationFrame(step);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <canvas ref={ref} />
      <span className="glow g1" />
      <span className="glow g2" />
      <span className="glow g3" />
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef } from "react";
import { MAILTO, track } from "./engagement.js";

// Fixed at the very top; reports its height so the navbar can sit below it.
export default function HostBanner({ onDismiss, onHeight }) {
  const ref = useRef(null);

  // Watch the banner itself, not just the window: its text re-wraps when the
  // web fonts finish loading, which changes its height without a resize event
  // (the nav then overlapped the banner at laptop widths).
  useLayoutEffect(() => {
    const el = ref.current;
    const report = () => onHeight(el ? el.offsetHeight : 0);
    report();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(report) : null;
    if (observer && el) observer.observe(el);
    else window.addEventListener("resize", report);
    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener("resize", report);
      onHeight(0);
    };
  }, [onHeight]);

  useEffect(() => { track("banner-view"); }, []);

  return (
    <div ref={ref} className="host-banner" role="region" aria-label="Note for Google team-matching hosts"
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "8px 44px", background: "linear-gradient(90deg, #4f46e5, #6366f1 55%, #7c3aed)", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.4, textAlign: "center", boxShadow: "0 2px 18px rgba(79,70,229,0.35)" }}>
      {/* narrower screens: text and button side by side so the banner stays
          slim; below 900px the shorter wording */}
      <style>{`@media (max-width: 1180px) {
        .host-banner { flex-wrap: nowrap !important; justify-content: space-between !important; gap: 12px !important;
          padding: 7px 40px 7px 16px !important; text-align: left !important; }
      }
      @media (max-width: 900px) { .host-banner .wide-only { display: none; } }
      @media (max-width: 640px) {
        .host-banner { gap: 10px !important; padding: 7px 36px 7px 14px !important; font-size: 12px !important; }
        .host-banner a { font-size: 11.5px !important; padding: 4px 10px !important; }
      }`}</style>
      <span>
        <strong style={{ fontWeight: 700 }}>I'm in Google team matching</strong><span className="wide-only"> and interested in infrastructure and performance engineering</span>. I'd love to hear what your team is <span style={{ whiteSpace: "nowrap" }}>building <span aria-hidden="true">🙂</span></span>
      </span>
      <a href={MAILTO} data-umami-event="banner-call"
        style={{ fontWeight: 600, fontSize: 12.5, color: "#4f46e5", background: "#fff", padding: "4px 12px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap" }}>
        Let's talk →
      </a>
      <button onClick={onDismiss} aria-label="Dismiss this note" data-umami-event="banner-dismiss"
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, color: "rgba(255,255,255,0.8)", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: 4 }}>
        ×
      </button>
    </div>
  );
}

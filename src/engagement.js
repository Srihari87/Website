import { useEffect, useState } from "react";

// ── Umami engagement tracking ────────────────────────────────────────────────
// Umami's own dashboard counts visits and pages. These custom events add how
// long someone actually spent here and where:
//
//   time-on-page   at 10 s, 30 s, 1, 2, 3, 5 and 10 min of time the tab was
//                  visible (a backgrounded tab doesn't count)
//   section-view   the first time each section comes on screen
//   scroll-depth   25 / 50 / 75 / 100 % of the page
//   visit-summary  when they leave or switch tabs: total visible seconds,
//                  seconds per section, furthest scroll
//
// A link like ?for=google-maps tags every event with host: "google-maps", so
// visits from different people can be told apart. Nothing else about the
// visitor is collected. To leave your own visits out, run
// localStorage.setItem("umami.disabled", "1") once in your browser's console.

const SECTIONS = ["hero", "about", "experience", "skills", "projects", "contact"];
const MILESTONES = [10, 30, 60, 120, 180, 300, 600];
const DEPTHS = [25, 50, 75, 100];

function hostTag() {
  try {
    const value = new URLSearchParams(window.location.search).get("for");
    return value ? value.slice(0, 40) : undefined;
  } catch {
    return undefined;
  }
}

const HOST = typeof window !== "undefined" ? hostTag() : undefined;

export function track(name, data = {}) {
  try {
    // the Umami script loads with defer and may be blocked; never let that break the page
    window.umami?.track(name, HOST ? { ...data, host: HOST } : data);
  } catch {
    /* ignore */
  }
}

function sectionAt(y) {
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) return id;
  }
  return undefined;
}

export function useEngagementTracking() {
  useEffect(() => {
    let seconds = 0;
    let summarizedAt = -1;
    let maxDepth = 0;
    const perSection = {};
    const seen = new Set();
    const depthsSent = new Set();

    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 1;
      const current = sectionAt(window.innerHeight * 0.4);
      if (current) perSection[current] = (perSection[current] || 0) + 1;
      if (MILESTONES.includes(seconds)) track("time-on-page", { seconds });
    }, 1000);

    const onScroll = () => {
      for (const id of SECTIONS) {
        if (seen.has(id)) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.7 && r.bottom > 0) {
          seen.add(id);
          track("section-view", { section: id });
        }
      }
      const doc = document.documentElement;
      const depth = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100));
      maxDepth = Math.max(maxDepth, depth);
      for (const d of DEPTHS) {
        if (depth >= d && !depthsSent.has(d)) {
          depthsSent.add(d);
          track("scroll-depth", { percent: d });
        }
      }
    };

    const summarize = () => {
      if (seconds < 3 || seconds === summarizedAt) return;
      summarizedAt = seconds;
      const data = { seconds, maxScroll: maxDepth };
      for (const [id, s] of Object.entries(perSection)) data[`s_${id}`] = s;
      track("visit-summary", data);
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") summarize(); };

    // sections render after the intro screen, so check again shortly after load
    const first = setTimeout(onScroll, 2500);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", summarize);
    return () => {
      clearInterval(tick);
      clearTimeout(first);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", summarize);
    };
  }, []);
}

// ── slim banner for team-matching hosts ──────────────────────────────────────

const DISMISS_KEY = "hostBannerDismissed";
export const MAILTO =
  "mailto:cs.srihari875@gmail.com?subject=" + encodeURIComponent("Google team matching: let's talk");

export function useHostBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode: just hide */ }
  };
  return [visible, dismiss];
}

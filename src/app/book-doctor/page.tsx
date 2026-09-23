"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { BookAppointment } from "@/components/dashboard/BookAppointmentList";

/* ============================================================================
   STYLES — injected via dangerouslySetInnerHTML so SSR & CSR match byte-for-byte
   ============================================================================ */
const PAGE_CSS = `
  /* ── Keyframes ─────────────────────────────────────────── */
  @keyframes bd-fade-up {
    from { opacity: 0; transform: translate3d(0, 22px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes bd-fade-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes bd-word-rise {
    from { opacity: 0; transform: translate3d(0, 26px, 0) rotate(1.5deg); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
  }
  @keyframes bd-orb {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(0, -22px, 0) scale(1.06); }
  }
  @keyframes bd-pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.4); }
  }
  @keyframes bd-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes bd-skeleton {
    0%, 100% { opacity: 1;   }
    50%      { opacity: 0.5; }
  }
  @keyframes bd-float-card {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50%      { transform: translate3d(0, -10px, 0); }
  }
  @keyframes bd-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes bd-draw {
    from { stroke-dashoffset: 1; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes bd-heart {
    0%, 100% { transform: scale(0.92); opacity: 0.85; }
    50%      { transform: scale(1.14); opacity: 1; }
  }
  @keyframes bd-pill-in {
    from { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.94); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes bd-badge-pop {
    0%   { opacity: 0; transform: scale(0.6); }
    60%  { opacity: 1; transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes bd-slide-in-right {
    from { opacity: 0; transform: translate3d(28px, 0, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes bd-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.55; }
    100% { transform: scale(2.4); opacity: 0;    }
  }
  @keyframes bd-step-draw {
    from { stroke-dashoffset: 200; }
    to   { stroke-dashoffset: 0; }
  }

  /* ── Animation utility classes ─────────────────────────── */
  .bd-fade      { animation: bd-fade-in   0.55s ease-out both; }
  .bd-fade-up   { animation: bd-fade-up   0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .bd-word      { animation: bd-word-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .bd-slide     { animation: bd-slide-in-right 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .bd-pill      { animation: bd-pill-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .bd-pop       { animation: bd-badge-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }

  .bd-delay-1 { animation-delay: 90ms;  }
  .bd-delay-2 { animation-delay: 180ms; }
  .bd-delay-3 { animation-delay: 270ms; }
  .bd-delay-4 { animation-delay: 360ms; }
  .bd-delay-5 { animation-delay: 450ms; }
  .bd-delay-6 { animation-delay: 540ms; }
  .bd-delay-7 { animation-delay: 630ms; }
  .bd-delay-8 { animation-delay: 720ms; }

  .bd-orb        { animation: bd-orb 9s ease-in-out infinite; }
  .bd-dot        { animation: bd-pulse-dot 2s ease-in-out infinite; }
  .bd-skeleton   { animation: bd-skeleton 1.4s ease-in-out infinite; }
  .bd-float-card { animation: bd-float-card 5s ease-in-out infinite; }
  .bd-spin-slow  { animation: bd-spin-slow 26s linear infinite; }
  .bd-heart      { animation: bd-heart 2.4s ease-in-out infinite; }

  .bd-draw {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: bd-draw 1.6s ease-out both;
  }
  .bd-step-draw {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: bd-step-draw 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Shimmering text (eyebrow) ─────────────────────────── */
  .bd-shimmer-text {
    background-image: linear-gradient(
      90deg,
      currentColor 0%,
      currentColor 40%,
      rgba(255, 255, 255, 0.95) 50%,
      currentColor 60%,
      currentColor 100%
    );
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: bd-shimmer 3.4s linear infinite;
  }

  /* ── Page shell with cursor-reactive ambient glow ──────── */
  .bd-shell {
    position: relative;
    isolation: isolate;
  }
  .bd-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      640px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(56, 189, 248, 0.10),
      transparent 55%
    );
    transition: background 0.12s linear;
  }
  .bd-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      360px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(249, 115, 22, 0.08),
      transparent 60%
    );
    transition: background 0.16s linear;
  }

  /* Dot-grid texture overlay */
  .bd-dot-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image: radial-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  /* ── Parallax orbs ─────────────────────────────────────── */
  .bd-orb-1 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * 22px),
      calc((var(--cy-n, 0)) * 22px),
      0
    );
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .bd-orb-2 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * -32px),
      calc((var(--cy-n, 0)) * -26px),
      0
    );
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Hover lift helpers ────────────────────────────────── */
  .bd-float-card {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.4s ease;
  }
  .bd-float-card:hover {
    transform: translate3d(0, -8px, 0);
    box-shadow: 0 26px 52px -22px rgba(15, 23, 42, 0.22);
  }

  .bd-chip {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                background-color 0.25s ease,
                color 0.25s ease,
                box-shadow 0.25s ease;
  }
  .bd-chip:hover {
    transform: translateY(-2px);
    border-color: rgba(56, 189, 248, 0.5);
    background-color: #ffffff;
    color: #0f172a;
    box-shadow: 0 10px 24px -14px rgba(56, 189, 248, 0.35);
  }

  .bd-stat {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                background-color 0.25s ease,
                box-shadow 0.25s ease;
  }
  .bd-stat:hover {
    transform: translateY(-3px);
    border-color: rgba(249, 115, 22, 0.35);
    background-color: #ffffff;
    box-shadow: 0 16px 34px -18px rgba(249, 115, 22, 0.25);
  }

  .bd-spec {
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.22s ease,
                background-color 0.22s ease,
                color 0.22s ease,
                box-shadow 0.22s ease;
  }
  .bd-spec:hover {
    transform: translateY(-3px);
    border-color: rgba(56, 189, 248, 0.5);
    background-color: #ffffff;
    color: #0f172a;
    box-shadow: 0 14px 30px -16px rgba(56, 189, 248, 0.35);
  }
  .bd-spec:hover .bd-spec-icon {
    background-color: rgb(224, 242, 254);
    color: rgb(2, 132, 199);
    transform: scale(1.08) rotate(-4deg);
  }
  .bd-spec-icon {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.25s ease,
                color 0.25s ease;
  }

  .bd-feature {
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                box-shadow 0.3s ease;
  }
  .bd-feature:hover {
    transform: translateY(-4px);
    border-color: rgba(56, 189, 248, 0.35);
    box-shadow: 0 24px 48px -22px rgba(15, 23, 42, 0.18);
  }
  .bd-feature:hover .bd-feature-icon {
    transform: scale(1.1) rotate(-6deg);
  }
  .bd-feature-icon {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Reduced motion ────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .bd-fade, .bd-fade-up, .bd-word, .bd-slide, .bd-pill, .bd-pop,
    .bd-orb, .bd-dot, .bd-skeleton, .bd-float-card, .bd-spin-slow,
    .bd-heart, .bd-shimmer-text, .bd-draw, .bd-step-draw {
      animation: none !important;
    }
    .bd-shell::before, .bd-shell::after { display: none; }
    .bd-orb-1, .bd-orb-2, .bd-chip, .bd-stat, .bd-spec, .bd-feature,
    .bd-spec-icon, .bd-feature-icon, .bd-float-card {
      transition: none !important;
      transform: none !important;
    }
  }
`;

/* ============================================================================
   HOOKS
   ============================================================================ */

/**
 * Tracks the cursor across a container and stores normalized values
 * as CSS custom properties. rAF-throttled so rapid pointer moves
 * coalesce into a single paint per frame.
 */
function useCursorTrack<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const handleMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--cx", `${px * 100}%`);
        el.style.setProperty("--cy", `${py * 100}%`);
        el.style.setProperty("--cx-n", `${px - 0.5}`);
        el.style.setProperty("--cy-n", `${py - 0.5}`);
      });
    };

    const handleLeave = () => {
      el.style.setProperty("--cx", "50%");
      el.style.setProperty("--cy", "30%");
      el.style.setProperty("--cx-n", "0");
      el.style.setProperty("--cy-n", "0");
    };

    el.addEventListener("pointermove", handleMove, { passive: true });
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return ref;
}

/**
 * Counts a numeric string ("300+") from 0 to its target when the
 * element scrolls into view. Non-numeric strings render as-is.
 */
function useCountUp(target: string, duration = 1300) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = target.match(/^(\d+)(.*)$/);
    if (!match) {
      setDisplay(target);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }

    const end = Number(match[1]);
    const suffix = match[2];

    let raf = 0;
    let started = false;

    const run = () => {
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${Math.round(end * eased)}${suffix}`);
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setDisplay(target);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, display };
}

/* ============================================================================
   ICONS — small reusable SVG paths
   ============================================================================ */

const ICONS = {
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    />
  ),
  bolt: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  ),
  lock: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  ),
  clock: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
    />
  ),
  building: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  ),
  pin: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </>
  ),
  check: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M20 6L9 17l-5-5"
    />
  ),
  star: (
    <path d="M10 15.27l-5.18 3.05 1.4-5.93L1.6 8.4l6.06-.5L10 2.3l2.34 5.6 6.06.5-4.62 3.99 1.4 5.93z" />
  ),
  video: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  ),
  heart: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 21s-7.5-4.9-10.2-9.6C.2 8.1 1.7 4.5 5 3.6c2-.5 4 .3 5 2 1-1.7 3-2.5 5-2 3.3.9 4.8 4.5 3.2 7.8C19.5 16.1 12 21 12 21z"
    />
  ),
  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  ),
};

/* ============================================================================
   SPECIALTIES — static informational categories (not mock data)
   ============================================================================ */

type Specialty = {
  label: string;
  iconPath: string;
};

const SPECIALTIES: Specialty[] = [
  {
    label: "Cardiology",
    iconPath:
      "M12 21s-7.5-4.9-10.2-9.6C.2 8.1 1.7 4.5 5 3.6c2-.5 4 .3 5 2 1-1.7 3-2.5 5-2 3.3.9 4.8 4.5 3.2 7.8C19.5 16.1 12 21 12 21z",
  },
  {
    label: "Dermatology",
    iconPath:
      "M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0l-2.121-2.121M8.757 8.757L6.636 6.636",
  },
  {
    label: "Pediatrics",
    iconPath:
      "M12 14a4 4 0 100-8 4 4 0 000 8zm0 0v5m-3-3h6",
  },
  {
    label: "Orthopedics",
    iconPath:
      "M6 18a3 3 0 100-6 3 3 0 000 6zm12-6a3 3 0 100-6 3 3 0 000 6zM6.5 11.5L17.5 6.5",
  },
  {
    label: "Neurology",
    iconPath:
      "M9 3a4 4 0 00-4 4v2a4 4 0 000 8v1a3 3 0 003 3h2V3H9zm6 0a4 4 0 014 4v2a4 4 0 010 8v1a3 3 0 01-3 3h-2V3h1z",
  },
  {
    label: "General Medicine",
    iconPath:
      "M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122z",
  },
  {
    label: "ENT",
    iconPath:
      "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  },
  {
    label: "Ophthalmology",
    iconPath:
      "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z",
  },
  {
    label: "Gynecology",
    iconPath:
      "M12 14a5 5 0 100-10 5 5 0 000 10zm0 0v7m-4 0h8",
  },
  {
    label: "Dentistry",
    iconPath:
      "M12 4c-2.5 0-4 1.5-4 4 0 1.5.5 2.5.5 4s-.5 2.5-.5 4c0 2 .5 3 1.5 3s1.5-2 2.5-2 1.5 2 2.5 2 1.5-1 1.5-3c0-1.5-.5-2.5-.5-4s.5-2.5.5-4c0-2.5-1.5-4-4-4z",
  },
];

/* ============================================================================
   ILLUSTRATIONS
   ============================================================================ */

/**
 * Hero illustration — layered SVG rings + heartbeat line, with
 * floating HTML cards on top for crisp typography and hover effects.
 * Purely decorative; no live data.
 */
function HeroIllustration() {
  return (
    <div
      className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full"
      aria-hidden="true"
    >
      {/* Soft gradient blob behind the scene */}
      <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl" />

      {/* Background rings + heartbeat */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 520 560"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="bd-heartline" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Slow-rotating dashed ring */}
        <g
          className="bd-spin-slow"
          style={{ transformOrigin: "260px 280px" }}
        >
          <circle
            cx="260"
            cy="280"
            r="225"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="2 10"
          />
        </g>

        {/* Static inner ring */}
        <circle
          cx="260"
          cy="280"
          r="175"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="1.5"
        />

        {/* Heartbeat line — draws itself on load */}
        <path
          className="bd-draw"
          d="M30 280h50l16-36 22 72 20-56 14 20h90"
          fill="none"
          stroke="url(#bd-heartline)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ animationDelay: "1100ms" }}
        />

        {/* Small pulsing heart bottom-right */}
        <g className="bd-heart" style={{ transformOrigin: "450px 400px" }}>
          <path
            d="M450 400c-7-7-17-5-17 5 0 9 17 19 17 19s17-10 17-19c0-10-10-12-17-5z"
            fill="#f97316"
            fillOpacity="0.9"
          />
        </g>
      </svg>

      {/* ── Center: doctor profile card ──────────────────── */}
      <div className="bd-float-card absolute left-1/2 top-1/2 w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-400 text-lg font-extrabold text-white shadow-lg">
              ZD
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
              <svg
                className="h-2.5 w-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {ICONS.check}
              </svg>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">
              Your Doctor
            </p>
            <p className="truncate text-xs text-slate-500">Specialist</p>
            <div className="mt-0.5 flex items-center gap-1">
              <svg
                className="h-3 w-3 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {ICONS.star}
              </svg>
              <span className="text-[11px] font-bold text-slate-700">4.9</span>
              <span className="text-[10px] text-slate-400">(120+)</span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-dashed border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg
              className="h-3.5 w-3.5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {ICONS.clock}
            </svg>
            <span>Available today</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg
              className="h-3.5 w-3.5 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {ICONS.video}
            </svg>
            <span>Video · Clinic</span>
          </div>
        </div>

        <div className="mt-3 w-full rounded-lg bg-primary py-2 text-center text-xs font-bold text-white shadow-md shadow-primary/30">
          Book appointment
        </div>
      </div>

      {/* ── Top-right: verified badge ────────────────────── */}
      <div
        className="bd-float-card absolute right-2 top-6 rounded-2xl border border-slate-100 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {ICONS.shield}
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-bold text-slate-800">
              Verified
            </p>
            <p className="text-[10px] text-slate-500">Every provider</p>
          </div>
        </div>
      </div>

      {/* ── Top-left: calendar mini ──────────────────────── */}
      <div
        className="bd-float-card absolute -left-2 top-16 w-[136px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl"
        style={{ animationDelay: "1.3s" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Next slot
          </p>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <p className="mt-1 text-lg font-extrabold leading-none text-slate-800">
          2:00 PM
        </p>
        <p className="text-[10px] text-slate-500">Tomorrow</p>
        <div className="mt-2 grid grid-cols-7 gap-[3px]">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`h-2 w-full rounded-sm ${
                i === 3 ? "bg-primary" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom-left: booking confirmed ───────────────── */}
      <div
        className="bd-float-card absolute bottom-10 -left-2 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl"
        style={{ animationDelay: "1.9s" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {ICONS.check}
            </svg>
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Booking confirmed
            </p>
            <p className="text-[10px] text-slate-500">Ref #ZNV-2048</p>
          </div>
        </div>
      </div>

      {/* ── Bottom-right: 24/7 badge ─────────────────────── */}
      <div
        className="bd-float-card absolute bottom-16 right-2 flex items-center gap-2 rounded-full border border-slate-100 bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-sm"
        style={{ animationDelay: "2.4s" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="bd-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-[11px] font-bold text-slate-700">
          24/7 support
        </span>
      </div>

      {/* Decorative dots floating in the scene */}
      <span
        className="bd-float-card absolute left-6 top-32 h-2.5 w-2.5 rounded-full bg-primary/70"
        style={{ animationDelay: "0.9s" }}
      />
      <span
        className="bd-float-card absolute right-10 top-40 h-2 w-2 rounded-full bg-secondary/80"
        style={{ animationDelay: "1.6s" }}
      />
      <span
        className="bd-float-card absolute bottom-32 right-20 h-1.5 w-1.5 rounded-full bg-emerald-400/80"
        style={{ animationDelay: "2.2s" }}
      />
    </div>
  );
}

/**
 * Care journey illustration — three connected steps drawn as an
 * inline SVG with a self-drawing progress line.
 */
function CareJourneyIllustration() {
  return (
    <svg
      viewBox="0 0 600 120"
      className="h-24 w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="bd-journey" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* Progress line */}
      <path
        d="M60 60 H 540"
        stroke="#e2e8f0"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M60 60 H 540"
        stroke="url(#bd-journey)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="bd-step-draw"
        style={{ animationDelay: "400ms" }}
      />

      {/* Step 1 — Search */}
      <g>
        <circle cx="60" cy="60" r="22" fill="white" stroke="#f97316" strokeWidth="2" />
        <circle cx="60" cy="60" r="10" fill="#f97316" fillOpacity="0.15" />
        <path
          d="M55 60l4 4 8-8"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Step 2 — Book */}
      <g>
        <circle cx="300" cy="60" r="22" fill="white" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="300" cy="60" r="10" fill="#38bdf8" fillOpacity="0.15" />
        <rect x="292" y="54" width="16" height="14" rx="2" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <line x1="292" y1="60" x2="308" y2="60" stroke="#38bdf8" strokeWidth="2" />
      </g>

      {/* Step 3 — Confirm */}
      <g>
        <circle cx="540" cy="60" r="22" fill="white" stroke="#10b981" strokeWidth="2" />
        <circle cx="540" cy="60" r="10" fill="#10b981" fillOpacity="0.15" />
        <path
          d="M533 60l5 5 10-11"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ============================================================================
   SMALL COMPONENTS
   ============================================================================ */

/** Headline that reveals word-by-word. */
function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="bd-word inline-block"
          style={{ animationDelay: `${120 + i * 80}ms` }}
        >
          {word}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}

/** Small chip with icon + label. */
const TrustChip = React.memo(function TrustChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="bd-chip inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <span className="flex h-4 w-4 items-center justify-center text-primary">
        {icon}
      </span>
      {label}
    </span>
  );
});

/** Stat with animated count-up. */
function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary" | "emerald" | "amber";
}) {
  const { ref, display } = useCountUp(value, 1300);

  const themeMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
  } as const;

  const iconMap = {
    primary: ICONS.shield,
    secondary: ICONS.building,
    emerald: ICONS.clock,
    amber: ICONS.pin,
  } as const;

  return (
    <div className="bd-stat rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeMap[tone]}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {iconMap[tone]}
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-lg font-extrabold leading-none tabular-nums text-slate-800">
            <span ref={ref}>{display}</span>
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Specialty pill — icon + label. */
const SpecialtyPill = React.memo(function SpecialtyPill({
  label,
  iconPath,
  index,
}: {
  label: string;
  iconPath: string;
  index: number;
}) {
  return (
    <span
      className="bd-pill bd-spec inline-flex cursor-default items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-600"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span className="bd-spec-icon flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d={iconPath}
          />
        </svg>
      </span>
      {label}
    </span>
  );
});

/** Feature card for "why book through Zeniva". */
const FeatureCard = React.memo(function FeatureCard({
  icon,
  title,
  description,
  tone,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: "primary" | "secondary" | "emerald" | "amber";
  delay: number;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;

  return (
    <div
      className="bd-feature bd-fade-up relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`bd-feature-icon flex h-11 w-11 items-center justify-center rounded-xl ${toneMap[tone]}`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
});

/* ============================================================================
   SUSPENSE FALLBACK
   ============================================================================ */

function BookAppointmentFallback() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="h-12 w-full rounded-lg bg-slate-100 bd-skeleton" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 bg-white overflow-hidden"
          >
            <div className="h-44 bg-slate-100 bd-skeleton" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-2/3 rounded-full bg-slate-100 bd-skeleton" />
              <div className="h-3 w-1/2 rounded-full bg-slate-100 bd-skeleton" />
              <div className="h-3 w-3/4 rounded-full bg-slate-100 bd-skeleton" />
              <div className="h-10 w-full rounded-lg bg-slate-100 bd-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   PAGE
   ============================================================================ */

export default function BookDoctorPage() {
  const shellRef = useCursorTrack<HTMLDivElement>();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-white">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

        <div
          ref={shellRef}
          className="bd-shell relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        >
          {/* Decorative dot-grid texture */}
          <div aria-hidden="true" className="bd-dot-grid" />

          {/* Parallax floating orbs */}
          <div
            aria-hidden="true"
            className="bd-orb bd-orb-1 pointer-events-none absolute -top-10 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bd-orb bd-orb-2 pointer-events-none absolute top-[520px] -left-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
            style={{ animationDelay: "1.6s" }}
          />

          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center mb-12">
            {/* Copy column */}
            <div className="bd-fade-up">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="bd-dot absolute inline-flex h-full w-full rounded-full bg-secondary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                <span className="bd-shimmer-text">Book a Doctor</span>
              </span>

              <AnimatedHeadline text="Find & Book a Doctor" />

              <p className="bd-fade-up bd-delay-3 mt-4 text-slate-500 max-w-xl leading-relaxed">
                Search by name, hospital, or speciality, and book directly from
                available slots. Verified providers, instant confirmation, no phone
                calls needed.
              </p>

              {/* Trust chips */}
              <div className="bd-fade-up bd-delay-4 mt-6 flex flex-wrap gap-2">
                <TrustChip
                  label="Verified providers"
                  icon={
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {ICONS.check}
                    </svg>
                  }
                />
                <TrustChip
                  label="Instant confirmation"
                  icon={
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {ICONS.bolt}
                    </svg>
                  }
                />
                <TrustChip
                  label="Secure records"
                  icon={
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {ICONS.lock}
                    </svg>
                  }
                />
              </div>

              {/* Stats */}
              <div className="bd-fade-up bd-delay-5 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Verified doctors" value="300+" tone="primary" />
                <StatChip label="Partner hospitals" value="50+" tone="secondary" />
                <StatChip label="Avg. wait time" value="8min" tone="emerald" />
                <StatChip label="Districts covered" value="77" tone="amber" />
              </div>
            </div>

            {/* Illustration column — desktop only */}
            <div className="bd-fade-up bd-delay-2 hidden lg:block relative">
              <HeroIllustration />
            </div>
          </section>

          {/* ── SPECIALTIES STRIP ─────────────────────────────── */}
          <section className="bd-fade-up bd-delay-5 relative mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular specialities
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tap a speciality in the search below to filter doctors.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="bd-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                All live
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((spec, i) => (
                <SpecialtyPill
                  key={spec.label}
                  label={spec.label}
                  iconPath={spec.iconPath}
                  index={i}
                />
              ))}
            </div>
          </section>

          {/* ── BOOKING WIDGET ────────────────────────────────── */}
          <section className="bd-fade-up bd-delay-6 relative mb-14">
            <Suspense fallback={<BookAppointmentFallback />}>
              <BookAppointment />
            </Suspense>
          </section>

          {/* ── HOW IT WORKS STRIP ────────────────────────────── */}
          <section className="bd-fade-up bd-delay-6 relative mb-14 rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  How it works
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Three steps from search to visit.
                </h2>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  Pick a speciality, browse verified doctors with real-time slot
                  availability, and confirm your appointment in seconds. Confirmation
                  is delivered instantly by SMS and email.
                </p>

                <ul className="mt-5 space-y-3 text-sm">
                  {[
                    {
                      n: "01",
                      t: "Search by speciality or hospital",
                      tone: "text-primary bg-primary/10",
                    },
                    {
                      n: "02",
                      t: "Pick an open slot that suits you",
                      tone: "text-secondary bg-secondary/10",
                    },
                    {
                      n: "03",
                      t: "Confirm — get instant notification",
                      tone: "text-emerald-600 bg-emerald-50",
                    },
                  ].map((step) => (
                    <li
                      key={step.n}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${step.tone}`}
                      >
                        {step.n}
                      </span>
                      {step.t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <CareJourneyIllustration />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Search
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">
                      Seconds
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pick slot
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">
                      Minutes
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Confirmed
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">
                      Instant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── WHY BOOK HERE — FEATURE GRID ─────────────────── */}
          <section className="relative mb-14">
            <div className="mb-6 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Why Zeniva
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Built for trust, made for speed
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 leading-relaxed">
                The essentials you expect when booking healthcare for yourself or
                your family.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <FeatureCard
                icon={ICONS.shield}
                title="Verified Providers"
                description="Every doctor and hospital is vetted before they can accept bookings."
                tone="primary"
                delay={0}
              />
              <FeatureCard
                icon={ICONS.bolt}
                title="Instant Confirmation"
                description="No phone calls, no waiting — confirm your slot with a single tap."
                tone="secondary"
                delay={100}
              />
              <FeatureCard
                icon={ICONS.lock}
                title="Private & Secure"
                description="Health records and bookings live on a secure, encrypted portal."
                tone="emerald"
                delay={200}
              />
              <FeatureCard
                icon={ICONS.heart}
                title="24/7 Support"
                description="Our team is reachable around the clock for urgent questions."
                tone="amber"
                delay={300}
              />
            </div>
          </section>

          {/* ── HELP CARD ─────────────────────────────────────── */}
          <section className="bd-fade-up relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-md ring-1 ring-slate-100">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {ICONS.phone}
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Need help choosing a doctor?
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-md">
                    Our care team can recommend the right specialist based on your
                    symptoms and location.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:+97715927435"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {ICONS.phone}
                  </svg>
                  Call support
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Send a message
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
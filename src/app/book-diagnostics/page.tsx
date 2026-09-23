"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useApi } from "@/hooks/useApi";
import { testApi, authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Test } from "@/types";

/* ============================================================================
   STYLES — injected via dangerouslySetInnerHTML so SSR & CSR match byte-for-byte
   ============================================================================ */
const PAGE_CSS = `
  /* ── Keyframes ─────────────────────────────────────────── */
  @keyframes dx-fade-up {
    from { opacity: 0; transform: translate3d(0, 22px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes dx-fade-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes dx-word-rise {
    from { opacity: 0; transform: translate3d(0, 26px, 0) rotate(1.5deg); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
  }
  @keyframes dx-orb {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(0, -22px, 0) scale(1.06); }
  }
  @keyframes dx-pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.4); }
  }
  @keyframes dx-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes dx-skeleton {
    0%, 100% { opacity: 1;   }
    50%      { opacity: 0.5; }
  }
  @keyframes dx-float-card {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50%      { transform: translate3d(0, -10px, 0); }
  }
  @keyframes dx-spin-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes dx-draw {
    from { stroke-dashoffset: 1; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes dx-heart {
    0%, 100% { transform: scale(0.92); opacity: 0.85; }
    50%      { transform: scale(1.14); opacity: 1; }
  }
  @keyframes dx-pill-in {
    from { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.94); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes dx-check-draw {
    from { stroke-dashoffset: 44; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes dx-confetti {
    0%   { transform: translate3d(0, 0, 0) rotate(0deg) scale(0.6); opacity: 1; }
    100% { transform: translate3d(var(--tx), var(--ty), 0) rotate(260deg) scale(1); opacity: 0; }
  }
  @keyframes dx-modal-in {
    from { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.97); }
    to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  }
  @keyframes dx-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dx-arrow-slide {
    0%   { transform: translateX(0); }
    50%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
  }
  @keyframes dx-scan-sweep {
    0%   { transform: translateY(-100%); opacity: 0; }
    20%  { opacity: 0.7; }
    80%  { opacity: 0.7; }
    100% { transform: translateY(120%); opacity: 0; }
  }
  @keyframes dx-step-draw {
    from { stroke-dashoffset: 200; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes dx-pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes dx-rotate-slow {
    to { transform: rotate(360deg); }
  }
  @keyframes dx-wave {
    0%, 100% { transform: translateX(0); }
    50%      { transform: translateX(4px); }
  }
  @keyframes dx-bubble-up {
    0%   { transform: translateY(0); opacity: 0.8; }
    100% { transform: translateY(-22px); opacity: 0; }
  }
  @keyframes dx-flow {
    0%   { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -30; }
  }

  /* ── Utility classes ───────────────────────────────────── */
  .dx-fade      { animation: dx-fade-in   0.55s ease-out both; }
  .dx-fade-up   { animation: dx-fade-up   0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dx-word      { animation: dx-word-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dx-pill      { animation: dx-pill-in   0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dx-modal     { animation: dx-modal-in    0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .dx-backdrop  { animation: dx-backdrop-in 0.2s  ease-out both; }

  .dx-delay-1 { animation-delay: 90ms;  }
  .dx-delay-2 { animation-delay: 180ms; }
  .dx-delay-3 { animation-delay: 270ms; }
  .dx-delay-4 { animation-delay: 360ms; }
  .dx-delay-5 { animation-delay: 450ms; }
  .dx-delay-6 { animation-delay: 540ms; }
  .dx-delay-7 { animation-delay: 630ms; }

  .dx-orb        { animation: dx-orb 9s ease-in-out infinite; }
  .dx-dot        { animation: dx-pulse-dot 2s ease-in-out infinite; }
  .dx-skeleton   { animation: dx-skeleton 1.4s ease-in-out infinite; }
  .dx-float-card { animation: dx-float-card 5s ease-in-out infinite; }
  .dx-spin-slow  { animation: dx-spin-slow 26s linear infinite; }
  .dx-heart      { animation: dx-heart 2.4s ease-in-out infinite; }
  .dx-rotate     { animation: dx-rotate-slow 12s linear infinite; }
  .dx-wave       { animation: dx-wave 1.6s ease-in-out infinite; }
  .dx-flow       { animation: dx-flow 2s linear infinite; }

  .dx-draw {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: dx-draw 1.6s ease-out both;
  }
  .dx-step-draw {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    animation: dx-step-draw 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .dx-check {
    stroke-dasharray: 44;
    stroke-dashoffset: 44;
    animation: dx-check-draw 0.55s ease-out 0.15s forwards;
  }
  .dx-confetti-piece {
    animation: dx-confetti 1.1s ease-out forwards;
  }

  /* ── Shimmering eyebrow text ───────────────────────────── */
  .dx-shimmer-text {
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
    animation: dx-shimmer 3.4s linear infinite;
  }

  /* ── Shell with cursor-reactive ambient glow ───────────── */
  .dx-shell {
    position: relative;
    isolation: isolate;
  }
  .dx-shell::before {
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
  .dx-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
      360px circle at var(--cx, 50%) var(--cy, 30%),
      rgba(16, 185, 129, 0.08),
      transparent 60%
    );
    transition: background 0.16s linear;
  }

  /* Dot grid texture */
  .dx-dot-grid {
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
  .dx-orb-1 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * 22px),
      calc((var(--cy-n, 0)) * 22px),
      0
    );
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .dx-orb-2 {
    transform: translate3d(
      calc((var(--cx-n, 0)) * -32px),
      calc((var(--cy-n, 0)) * -26px),
      0
    );
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Hover lift helpers ────────────────────────────────── */
  .dx-float-card {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.4s ease;
  }
  .dx-float-card:hover {
    transform: translate3d(0, -8px, 0);
    box-shadow: 0 26px 52px -22px rgba(15, 23, 42, 0.22);
  }

  .dx-chip {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                background-color 0.25s ease,
                color 0.25s ease,
                box-shadow 0.25s ease;
  }
  .dx-chip:hover {
    transform: translateY(-2px);
    border-color: rgba(56, 189, 248, 0.5);
    background-color: #ffffff;
    color: #0f172a;
    box-shadow: 0 10px 24px -14px rgba(56, 189, 248, 0.35);
  }

  .dx-stat {
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                background-color 0.25s ease,
                box-shadow 0.25s ease;
  }
  .dx-stat:hover {
    transform: translateY(-3px);
    border-color: rgba(16, 185, 129, 0.35);
    background-color: #ffffff;
    box-shadow: 0 16px 34px -18px rgba(16, 185, 129, 0.25);
  }

  .dx-spec {
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.22s ease,
                background-color 0.22s ease,
                color 0.22s ease,
                box-shadow 0.22s ease;
  }
  .dx-spec:hover {
    transform: translateY(-3px);
    border-color: rgba(56, 189, 248, 0.5);
    background-color: #ffffff;
    color: #0f172a;
    box-shadow: 0 14px 30px -16px rgba(56, 189, 248, 0.35);
  }
  .dx-spec:hover .dx-spec-icon {
    background-color: rgb(224, 242, 254);
    color: rgb(2, 132, 199);
    transform: scale(1.08) rotate(-4deg);
  }
  .dx-spec-icon {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                background-color 0.25s ease,
                color 0.25s ease;
  }

  /* ── Test card ─────────────────────────────────────────── */
  .dx-card {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease,
                border-color 0.25s ease;
    will-change: transform;
    overflow: hidden;
  }
  .dx-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 28px 54px -22px rgba(15, 23, 42, 0.24);
    border-color: rgba(56, 189, 248, 0.45);
  }
  .dx-card-spotlight {
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.25s ease;
    background: radial-gradient(
      300px circle at var(--mx, 50%) var(--my, 50%),
      rgba(56, 189, 248, 0.14),
      transparent 65%
    );
    z-index: 3;
  }
  .dx-card:hover .dx-card-spotlight { opacity: 1; }

  /* Media panel inside card */
  .dx-card-media {
    position: relative;
    height: 160px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .dx-card:hover .dx-card-media .dx-card-art {
    transform: scale(1.06);
  }
  .dx-card-art {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .dx-card:hover .dx-card-media img.dx-card-art {
    transform: scale(1.08);
  }
  .dx-card-scan {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 45%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
    pointer-events: none;
    z-index: 2;
  }
  .dx-card:hover .dx-card-scan {
    animation: dx-scan-sweep 1.6s ease-out;
  }

  .dx-card-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: gap 0.25s ease, color 0.25s ease;
  }
  .dx-card:hover .dx-card-cta {
    gap: 10px;
  }
  .dx-card:hover .dx-card-cta svg {
    animation: dx-arrow-slide 0.6s ease-out;
  }

  /* Feature card */
  .dx-feature {
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
                border-color 0.25s ease,
                box-shadow 0.3s ease;
  }
  .dx-feature:hover {
    transform: translateY(-4px);
    border-color: rgba(56, 189, 248, 0.35);
    box-shadow: 0 24px 48px -22px rgba(15, 23, 42, 0.18);
  }
  .dx-feature:hover .dx-feature-icon {
    transform: scale(1.1) rotate(-6deg);
  }
  .dx-feature-icon {
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Modal input */
  .dx-input {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .dx-input:focus {
    outline: none;
    border-color: rgb(249, 115, 22);
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  }

  /* ── Reduced motion ────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .dx-fade, .dx-fade-up, .dx-word, .dx-pill, .dx-modal, .dx-backdrop,
    .dx-orb, .dx-dot, .dx-skeleton, .dx-float-card, .dx-spin-slow,
    .dx-heart, .dx-shimmer-text, .dx-draw, .dx-step-draw, .dx-check,
    .dx-confetti-piece, .dx-card-scan, .dx-rotate, .dx-wave, .dx-flow {
      animation: none !important;
    }
    .dx-shell::before, .dx-shell::after { display: none; }
    .dx-orb-1, .dx-orb-2, .dx-chip, .dx-stat, .dx-spec, .dx-feature,
    .dx-spec-icon, .dx-feature-icon, .dx-float-card, .dx-card,
    .dx-card-media .dx-card-art, .dx-card-cta {
      transition: none !important;
      transform: none !important;
    }
  }
`;

/* ============================================================================
   HOOKS
   ============================================================================ */

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
   ICONS
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
  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  ),
  mail: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  ),
  x: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  ),
  arrow: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  ),
  microscope: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3h6v6l-3 3-3-3V3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 21h12M5 18h14l-2-4H7l-2 4z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 12v3" />
    </>
  ),
  flask: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3h6v5l5 11a2 2 0 01-1.8 3H5.8A2 2 0 014 19L9 8V3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13h10" />
    </>
  ),
  heartPulse: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 21s-7.5-4.9-10.2-9.6C.2 8.1 1.7 4.5 5 3.6c2-.5 4 .3 5 2 1-1.7 3-2.5 5-2 3.3.9 4.8 4.5 3.2 7.8C19.5 16.1 12 21 12 21z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h3l2-4 3 8 2-4h5" />
    </>
  ),
  scan: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={2} fill="none" />
    </>
  ),
  drop: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z"
    />
  ),
  dna: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4c4 4 12 4 16 0M4 20c4-4 12-4 16 0" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l12 8M6 16l12-8" />
    </>
  ),
  brain: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.5 3a4 4 0 00-4 4v.5a3 3 0 00-1.5 5.5A4 4 0 006 19h.5v1.5A.5.5 0 007 21h3v-7.5A3.5 3.5 0 007.5 10H6V7a3.5 3.5 0 013.5-3.5H10v-.5A.5.5 0 009.5 3zM14.5 3a4 4 0 014 4v.5a3 3 0 011.5 5.5A4 4 0 0118 19h-.5v1.5a.5.5 0 01-.5.5h-3v-7.5a3.5 3.5 0 012.5-3.5H18V7a3.5 3.5 0 00-3.5-3.5H14v-.5a.5.5 0 01.5-.5z"
    />
  ),
};

/* ============================================================================
   STATIC DATA
   ============================================================================ */

const TEST_CATEGORIES = [
  { label: "Imaging & Scans", icon: "scan" as const },
  { label: "Pathology & Blood", icon: "drop" as const },
  { label: "Cardiology", icon: "heartPulse" as const },
  { label: "Genetics", icon: "dna" as const },
  { label: "Neurology", icon: "brain" as const },
  { label: "Lab Analysis", icon: "flask" as const },
  { label: "Microbiology", icon: "microscope" as const },
];

/* ============================================================================
   TEST CATEGORY DETECTION
   ============================================================================ */

type TestKind =
  | "mri"
  | "ct"
  | "xray"
  | "ultrasound"
  | "ecg"
  | "blood"
  | "urine"
  | "pathology"
  | "endoscopy"
  | "general";

function detectTestKind(name: string): TestKind {
  const n = name.toLowerCase();
  if (/\bmri\b|magnetic resonance/.test(n)) return "mri";
  if (/\bct\b|computed tomograph/.test(n)) return "ct";
  if (/x-?ray|radiograph/.test(n)) return "xray";
  if (/ultrasound|sonograph|\becho\b|doppler/.test(n)) return "ultrasound";
  if (/\becg\b|\bekg\b|electrocardio|holter/.test(n)) return "ecg";
  if (/blood|\bcbc\b|hemogram|haematolog|hematolog/.test(n)) return "blood";
  if (/urine|urinalysis/.test(n)) return "urine";
  if (/biopsy|patholog|histopath|cytolog/.test(n)) return "pathology";
  if (/endoscop|colonoscop|gastroscop/.test(n)) return "endoscopy";
  return "general";
}

/* ============================================================================
   TEST ILLUSTRATIONS — one detailed SVG per category
   Each is designed at 320×160 viewBox, sits inside a coloured panel,
   and has a small animated accent so cards feel alive without being noisy.
   ============================================================================ */

function MRIIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-mri-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <radialGradient id="art-mri-bore" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="65%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#334155" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-mri-bg)" />
      {/* Floor line */}
      <line x1="0" y1="132" x2="320" y2="132" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.5" />
      {/* Scanner body */}
      <rect x="62" y="34" width="196" height="96" rx="22" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
      <rect x="62" y="34" width="196" height="96" rx="22" fill="#ffffff" opacity="0.4" />
      {/* Rounded bore */}
      <ellipse cx="160" cy="82" rx="56" ry="44" fill="url(#art-mri-bore)" />
      <ellipse cx="160" cy="82" rx="56" ry="44" fill="none" stroke="#0ea5e9" strokeWidth="2" />
      {/* Pulsing ring inside bore */}
      <circle cx="160" cy="82" r="30" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 4" className="dx-rotate" style={{ transformOrigin: "160px 82px" }} />
      {/* Patient bed */}
      <rect x="22" y="112" width="220" height="6" rx="3" fill="#cbd5e1" />
      <rect x="230" y="106" width="68" height="18" rx="4" fill="#94a3b8" />
      {/* Patient silhouette */}
      <circle cx="244" cy="106" r="5" fill="#475569" />
      <rect x="238" y="109" width="13" height="7" rx="3" fill="#475569" />
      {/* Control panel */}
      <rect x="268" y="62" width="44" height="44" rx="6" fill="#0f172a" />
      <rect x="272" y="66" width="36" height="22" rx="3" fill="#1e40af" />
      <path d="M274 80 L280 76 L286 82 L292 74 L298 80 L304 78" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="dx-wave" />
      <circle cx="278" cy="96" r="3" fill="#ef4444" />
      <circle cx="292" cy="96" r="3" fill="#fbbf24" />
      <circle cx="306" cy="96" r="3" fill="#10b981" />
    </svg>
  );
}

function CTIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-ct-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <radialGradient id="art-ct-bore" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-ct-bg)" />
      <line x1="0" y1="132" x2="320" y2="132" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
      {/* Gantry — circle housing */}
      <circle cx="150" cy="82" r="60" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="150" cy="82" r="60" fill="none" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2 6" />
      {/* Rotating gantry indicator */}
      <g className="dx-rotate" style={{ transformOrigin: "150px 82px" }}>
        <path d="M150 24 A58 58 0 0 1 208 82" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="208" cy="82" r="3.5" fill="#f59e0b" />
      </g>
      {/* Bore */}
      <circle cx="150" cy="82" r="40" fill="url(#art-ct-bore)" />
      <circle cx="150" cy="82" r="40" fill="none" stroke="#334155" strokeWidth="1.5" />
      {/* Patient bed sliding through */}
      <rect x="14" y="112" width="250" height="6" rx="3" fill="#cbd5e1" />
      <rect x="252" y="106" width="64" height="18" rx="4" fill="#94a3b8" />
      <circle cx="264" cy="106" r="5" fill="#475569" />
      <rect x="258" y="109" width="13" height="7" rx="3" fill="#475569" />
      {/* Display panel */}
      <rect x="258" y="34" width="52" height="48" rx="6" fill="#0f172a" />
      <rect x="262" y="38" width="44" height="26" rx="3" fill="#065f46" />
      {/* Slice scan cross-section */}
      <circle cx="284" cy="51" r="10" fill="none" stroke="#34d399" strokeWidth="1.5" />
      <circle cx="284" cy="51" r="4" fill="#34d399" fillOpacity="0.5" />
      <rect x="262" y="70" width="20" height="3" rx="1.5" fill="#f59e0b" />
      <rect x="286" y="70" width="20" height="3" rx="1.5" fill="#38bdf8" />
    </svg>
  );
}

function XRayIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-xray-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="art-xray-glow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-xray-bg)" />
      {/* Soft glow behind skeleton */}
      <ellipse cx="160" cy="80" rx="130" ry="70" fill="url(#art-xray-glow)" />
      {/* Radiograph grid */}
      <g stroke="#38bdf8" strokeOpacity="0.08" strokeWidth="1">
        {[20, 40, 60, 80, 100, 120, 140].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} />
        ))}
        {[40, 80, 120, 160, 200, 240, 280].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="160" />
        ))}
      </g>
      {/* Ribcage — abstract chest x-ray */}
      <g stroke="#e0f2fe" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85">
        {/* Spine */}
        <line x1="160" y1="20" x2="160" y2="140" strokeWidth="3" strokeOpacity="0.7" />
        {/* Vertebrae */}
        {[34, 50, 66, 82, 98, 114, 130].map((y) => (
          <rect key={y} x="154" y={y - 3} width="12" height="4" rx="2" fill="#e0f2fe" fillOpacity="0.7" stroke="none" />
        ))}
        {/* Ribs left */}
        {[36, 52, 68, 84, 100].map((y, i) => (
          <path key={`lr${i}`} d={`M150 ${y} Q120 ${y + 4} 96 ${y + 20}`} />
        ))}
        {/* Ribs right */}
        {[36, 52, 68, 84, 100].map((y, i) => (
          <path key={`rr${i}`} d={`M170 ${y} Q200 ${y + 4} 224 ${y + 20}`} />
        ))}
        {/* Collarbones */}
        <path d="M160 24 Q130 20 100 28" />
        <path d="M160 24 Q190 20 220 28" />
      </g>
      {/* Film frame corners */}
      <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <path d="M14 24 L14 14 L24 14" />
        <path d="M296 24 L296 14 L286 14" />
        <path d="M14 136 L14 146 L24 146" />
        <path d="M296 136 L296 146 L286 146" />
      </g>
      {/* Radiograph beam indicator */}
      <g className="dx-wave">
        <path d="M290 40 L300 50 L290 60" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function UltrasoundIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-us-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-us-bg)" />
      {/* Monitor */}
      <rect x="170" y="22" width="130" height="104" rx="8" fill="#0f172a" />
      <rect x="176" y="28" width="118" height="86" rx="4" fill="#052e2b" />
      {/* Ultrasound waves on screen */}
      <g stroke="#34d399" strokeWidth="1.2" fill="none" opacity="0.9">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M182 ${36 + i * 12} Q${216 + i * 6} ${28 + i * 8} ${240 + i * 4} ${50 + i * 10} T${292} ${44 + i * 12}`} />
        ))}
      </g>
      {/* Scan blob (abstract) */}
      <ellipse cx="230" cy="70" rx="22" ry="14" fill="#34d399" fillOpacity="0.35" />
      <ellipse cx="230" cy="70" rx="10" ry="6" fill="#a7f3d0" fillOpacity="0.7" />
      {/* Distance markers */}
      <g stroke="#fbbf24" strokeWidth="1" opacity="0.8">
        <line x1="176" y1="44" x2="180" y2="44" />
        <line x1="176" y1="72" x2="180" y2="72" />
        <line x1="176" y1="100" x2="180" y2="100" />
      </g>
      {/* Probe */}
      <g>
        <rect x="30" y="66" width="60" height="26" rx="6" fill="#334155" />
        <rect x="90" y="74" width="40" height="10" rx="3" fill="#0ea5e9" />
        <circle cx="60" cy="79" r="3" fill="#38bdf8" />
      </g>
      {/* Emitting waves */}
      <g stroke="#0ea5e9" strokeWidth="1.5" fill="none" opacity="0.6" className="dx-wave">
        <path d="M136 60 Q146 79 136 98" />
        <path d="M144 55 Q158 79 144 103" />
        <path d="M152 50 Q170 79 152 108" />
      </g>
    </svg>
  );
}

function ECGIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-ecg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="100%" stopColor="#fee2e2" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-ecg-bg)" />
      {/* Grid — ECG paper */}
      <g stroke="#fca5a5" strokeOpacity="0.3" strokeWidth="0.7">
        {[20, 40, 60, 80, 100, 120, 140].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} />
        ))}
        {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="160" />
        ))}
      </g>
      {/* Heart */}
      <g className="dx-heart" style={{ transformOrigin: "80px 80px" }}>
        <path
          d="M80 108s-36-23-48-44c-7-13-1-29 13-33 9-3 19 0 24 9 5-9 15-12 24-9 14 4 20 20 13 33-12 21-48 44-48 44z"
          fill="#ef4444"
          fillOpacity="0.15"
          stroke="#ef4444"
          strokeWidth="2.5"
        />
        <path d="M60 74h10l4-10 6 20 5-14 3 6h12" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* ECG trace */}
      <path
        d="M170 84 L186 84 L192 64 L200 112 L208 72 L214 84 L232 84 L238 60 L246 108 L254 68 L260 84 L300 84"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dx-flow"
        style={{ strokeDasharray: "6 4" }}
      />
      {/* Lead dots */}
      <circle cx="20" cy="40" r="4" fill="#dc2626" />
      <circle cx="20" cy="120" r="4" fill="#dc2626" />
      <circle cx="300" cy="40" r="4" fill="#dc2626" />
      <circle cx="300" cy="120" r="4" fill="#dc2626" />
    </svg>
  );
}

function BloodIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-blood-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="100%" stopColor="#fee2e2" />
        </linearGradient>
        <linearGradient id="art-blood-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="art-blood-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="art-blood-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-blood-bg)" />
      {/* Rack */}
      <rect x="70" y="118" width="180" height="10" rx="3" fill="#94a3b8" />
      <rect x="70" y="128" width="180" height="4" rx="2" fill="#64748b" />
      {/* Three tubes */}
      {/* Red top */}
      <g>
        <rect x="92" y="30" width="26" height="88" rx="13" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="95" y="60" width="20" height="55" rx="10" fill="url(#art-blood-red)" />
        <rect x="88" y="22" width="34" height="12" rx="4" fill="#ef4444" />
        <circle cx="105" cy="76" r="2.5" fill="#ffffff" fillOpacity="0.75" />
        <circle cx="108" cy="88" r="1.8" fill="#ffffff" fillOpacity="0.65" />
      </g>
      {/* Purple top */}
      <g>
        <rect x="146" y="30" width="26" height="88" rx="13" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="149" y="60" width="20" height="55" rx="10" fill="url(#art-blood-purple)" />
        <rect x="142" y="22" width="34" height="12" rx="4" fill="#7c3aed" />
        <circle cx="159" cy="76" r="2.5" fill="#ffffff" fillOpacity="0.75" />
      </g>
      {/* Gold top */}
      <g>
        <rect x="200" y="30" width="26" height="88" rx="13" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="203" y="60" width="20" height="55" rx="10" fill="url(#art-blood-gold)" />
        <rect x="196" y="22" width="34" height="12" rx="4" fill="#f59e0b" />
        <circle cx="213" cy="76" r="2.5" fill="#ffffff" fillOpacity="0.75" />
      </g>
      {/* Floating droplet */}
      <g style={{ transformOrigin: "280px 70px" }} className="dx-heart">
        <path d="M280 50s10 12 10 20a10 10 0 11-20 0c0-8 10-20 10-20z" fill="#dc2626" fillOpacity="0.85" />
        <circle cx="277" cy="68" r="2" fill="#ffffff" fillOpacity="0.75" />
      </g>
    </svg>
  );
}

function UrineIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-urine-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="art-urine-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-urine-bg)" />
      {/* Sample cup */}
      <g>
        <path d="M110 40 L118 130 Q120 142 132 142 L172 142 Q184 142 186 130 L194 40 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Liquid */}
        <path d="M120 68 L126 128 Q127 134 134 134 L170 134 Q177 134 178 128 L184 68 Z" fill="url(#art-urine-liquid)" />
        {/* Lid */}
        <rect x="100" y="30" width="104" height="14" rx="4" fill="#38bdf8" />
        {/* Label */}
        <rect x="130" y="88" width="44" height="28" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="136" y1="98" x2="168" y2="98" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="136" y1="106" x2="160" y2="106" stroke="#94a3b8" strokeWidth="1.5" />
      </g>
      {/* Dipstick */}
      <g>
        <rect x="230" y="50" width="12" height="90" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="230" y="50" width="12" height="14" fill="#10b981" />
        <rect x="230" y="64" width="12" height="14" fill="#fbbf24" />
        <rect x="230" y="78" width="12" height="14" fill="#f97316" />
        <rect x="230" y="92" width="12" height="14" fill="#ef4444" />
        <rect x="230" y="106" width="12" height="14" fill="#a855f7" />
      </g>
      {/* Reference chart */}
      <g>
        <rect x="256" y="42" width="50" height="86" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <text x="260" y="56" fontSize="6" fill="#64748b" fontWeight="700">COLOR</text>
        <rect x="260" y="60" width="42" height="6" rx="1" fill="#fef3c7" />
        <rect x="260" y="68" width="42" height="6" rx="1" fill="#fde68a" />
        <rect x="260" y="76" width="42" height="6" rx="1" fill="#fbbf24" />
        <rect x="260" y="84" width="42" height="6" rx="1" fill="#f59e0b" />
        <rect x="260" y="92" width="42" height="6" rx="1" fill="#d97706" />
        <rect x="260" y="100" width="42" height="6" rx="1" fill="#b45309" />
        <rect x="260" y="108" width="42" height="6" rx="1" fill="#92400e" />
        <rect x="260" y="116" width="42" height="6" rx="1" fill="#78350f" />
      </g>
    </svg>
  );
}

function PathologyIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-path-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-path-bg)" />
      {/* Microscope */}
      <g>
        {/* Base */}
        <path d="M60 138 L60 128 L140 128 L140 138 Z" fill="#475569" />
        <ellipse cx="100" cy="140" rx="46" ry="4" fill="#334155" />
        {/* Stand */}
        <rect x="72" y="60" width="12" height="70" fill="#64748b" />
        {/* Stage */}
        <rect x="60" y="96" width="90" height="6" rx="2" fill="#94a3b8" />
        {/* Slide on stage */}
        <rect x="88" y="92" width="46" height="6" rx="1" fill="#c7d2fe" />
        <rect x="104" y="92" width="14" height="6" fill="#a78bfa" />
        {/* Arm */}
        <path d="M78 60 Q78 40 96 34 L142 34 L142 60 Z" fill="#475569" />
        {/* Eyepiece tube */}
        <rect x="128" y="20" width="18" height="60" rx="3" fill="#334155" />
        <rect x="124" y="14" width="26" height="12" rx="3" fill="#1e293b" />
        {/* Objective lens */}
        <rect x="130" y="80" width="14" height="16" rx="2" fill="#1e293b" />
        <circle cx="137" cy="98" r="5" fill="#0ea5e9" fillOpacity="0.6" />
        {/* Focus knob */}
        <circle cx="66" cy="80" r="8" fill="#334155" />
        <circle cx="66" cy="80" r="3" fill="#94a3b8" />
      </g>
      {/* Magnified view panel — "under the microscope" */}
      <g>
        <rect x="196" y="26" width="106" height="106" rx="8" fill="#ffffff" stroke="#a78bfa" strokeWidth="1.5" />
        <rect x="202" y="32" width="94" height="94" rx="6" fill="#faf5ff" />
        {/* Grid */}
        <g stroke="#c4b5fd" strokeOpacity="0.4" strokeWidth="0.5">
          {[14, 28, 42, 56, 70, 84].map((y) => (
            <line key={y} x1="202" y1={32 + y} x2="296" y2={32 + y} />
          ))}
          {[14, 28, 42, 56, 70, 84].map((x) => (
            <line key={x} x1={202 + x} y1="32" x2={202 + x} y2="126" />
          ))}
        </g>
        {/* Cells */}
        <g fill="#8b5cf6" fillOpacity="0.55">
          <circle cx="222" cy="60" r="8" />
          <circle cx="246" cy="48" r="6" />
          <circle cx="264" cy="72" r="10" />
          <circle cx="230" cy="90" r="7" />
          <circle cx="262" cy="102" r="9" />
          <circle cx="280" cy="60" r="5" />
        </g>
        {/* Cell nuclei */}
        <g fill="#7c3aed">
          <circle cx="222" cy="60" r="3" />
          <circle cx="264" cy="72" r="4" />
          <circle cx="230" cy="90" r="2.5" />
          <circle cx="262" cy="102" r="3.5" />
        </g>
        {/* Crosshair */}
        <circle cx="249" cy="79" r="24" fill="none" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      </g>
    </svg>
  );
}

function EndoscopyIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-end-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <radialGradient id="art-end-light" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-end-bg)" />
      {/* Endoscope tube */}
      <path
        d="M20 130 Q60 120 100 90 T180 60 Q220 45 260 55"
        fill="none"
        stroke="#334155"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Segmented rings */}
      <g stroke="#94a3b8" strokeWidth="1.2" fill="none">
        {[20, 34, 48, 62, 76, 90, 104, 118, 132, 146, 160, 174, 188, 202, 216, 230, 244].map((x, i) => {
          const y = 130 - i * 4.2;
          return <line key={x} x1={x - 3} y1={y - 4} x2={x + 3} y2={y + 4} />;
        })}
      </g>
      {/* Light at tip */}
      <circle cx="262" cy="55" r="8" fill="#334155" />
      <circle cx="262" cy="55" r="3.5" fill="#fde68a" />
      <circle cx="262" cy="55" r="14" fill="url(#art-end-light)" />
      {/* Light rays */}
      <g stroke="#fbbf24" strokeWidth="1.2" opacity="0.7">
        <line x1="262" y1="38" x2="262" y2="44" strokeLinecap="round" />
        <line x1="280" y1="48" x2="274" y2="51" strokeLinecap="round" />
        <line x1="244" y1="48" x2="250" y2="51" strokeLinecap="round" />
        <line x1="278" y1="66" x2="272" y2="62" strokeLinecap="round" />
      </g>
      {/* Monitor showing internal view */}
      <g>
        <rect x="180" y="94" width="120" height="52" rx="6" fill="#0f172a" />
        <rect x="186" y="100" width="108" height="40" rx="3" fill="#064e3b" />
        {/* Circular view inside */}
        <circle cx="240" cy="120" r="16" fill="#052e2b" />
        <ellipse cx="240" cy="120" rx="12" ry="10" fill="#10b981" fillOpacity="0.5" />
        <ellipse cx="240" cy="120" rx="6" ry="5" fill="#a7f3d0" fillOpacity="0.75" />
        {/* Crosshair */}
        <line x1="224" y1="120" x2="256" y2="120" stroke="#38bdf8" strokeWidth="0.5" opacity="0.8" />
        <line x1="240" y1="104" x2="240" y2="136" stroke="#38bdf8" strokeWidth="0.5" opacity="0.8" />
      </g>
    </svg>
  );
}

function GeneralLabIllustration() {
  return (
    <svg viewBox="0 0 320 160" className="dx-card-art absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="art-lab-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="art-lab-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="art-lab-pink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="art-lab-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#art-lab-bg)" />
      {/* Bench */}
      <rect x="0" y="128" width="320" height="8" fill="#94a3b8" />
      <rect x="0" y="136" width="320" height="4" fill="#64748b" />
      {/* Erlenmeyer flask */}
      <g>
        <path d="M84 40 L84 60 L62 118 Q60 128 70 128 L118 128 Q128 128 126 118 L104 60 L104 40 Z" fill="#ffffff" fillOpacity="0.85" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M70 96 L70 118 Q70 124 76 124 L112 124 Q118 124 118 118 L118 96 Z" fill="url(#art-lab-blue)" />
        <line x1="80" y1="40" x2="108" y2="40" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Bubbles */}
        <circle cx="88" cy="104" r="2.5" fill="#ffffff" fillOpacity="0.7" className="dx-heart" />
        <circle cx="98" cy="112" r="2" fill="#ffffff" fillOpacity="0.7" className="dx-heart" style={{ animationDelay: "0.4s" }} />
        <circle cx="104" cy="108" r="1.5" fill="#ffffff" fillOpacity="0.7" className="dx-heart" style={{ animationDelay: "0.8s" }} />
      </g>
      {/* Beaker */}
      <g>
        <rect x="150" y="58" width="60" height="70" rx="6" fill="#ffffff" fillOpacity="0.85" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="153" y="86" width="54" height="39" rx="4" fill="url(#art-lab-pink)" />
        <line x1="150" y1="76" x2="172" y2="76" stroke="#94a3b8" strokeWidth="1" />
        <line x1="150" y1="90" x2="176" y2="90" stroke="#94a3b8" strokeWidth="1" />
        <line x1="150" y1="104" x2="172" y2="104" stroke="#94a3b8" strokeWidth="1" />
      </g>
      {/* Test tubes in rack */}
      <g>
        <rect x="228" y="96" width="76" height="6" rx="2" fill="#94a3b8" />
        {[0, 1, 2].map((i) => {
          const x = 232 + i * 24;
          const fills = ["url(#art-lab-blue)", "url(#art-lab-green)", "url(#art-lab-pink)"];
          return (
            <g key={i}>
              <rect x={x} y="52" width="16" height="48" rx="8" fill="#ffffff" fillOpacity="0.85" stroke="#94a3b8" strokeWidth="1.2" />
              <rect x={x + 2} y="74" width="12" height="26" rx="6" fill={fills[i]} />
            </g>
          );
        })}
      </g>
      {/* Small molecule cluster top-right */}
      <g>
        <circle cx="290" cy="34" r="6" fill="#0ea5e9" fillOpacity="0.8" />
        <circle cx="306" cy="48" r="5" fill="#10b981" fillOpacity="0.8" />
        <circle cx="292" cy="58" r="4" fill="#f59e0b" fillOpacity="0.8" />
        <line x1="290" y1="34" x2="306" y2="48" stroke="#94a3b8" strokeWidth="1" />
        <line x1="306" y1="48" x2="292" y2="58" stroke="#94a3b8" strokeWidth="1" />
      </g>
    </svg>
  );
}

/** Router — returns the correct illustration for a kind. */
function TestIllustration({ kind }: { kind: TestKind }) {
  switch (kind) {
    case "mri":
      return <MRIIllustration />;
    case "ct":
      return <CTIllustration />;
    case "xray":
      return <XRayIllustration />;
    case "ultrasound":
      return <UltrasoundIllustration />;
    case "ecg":
      return <ECGIllustration />;
    case "blood":
      return <BloodIllustration />;
    case "urine":
      return <UrineIllustration />;
    case "pathology":
      return <PathologyIllustration />;
    case "endoscopy":
      return <EndoscopyIllustration />;
    case "general":
    default:
      return <GeneralLabIllustration />;
  }
}

/* ============================================================================
   HERO ILLUSTRATION (decorative)
   ============================================================================ */

function HeroIllustration() {
  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full" aria-hidden="true">
      <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-secondary/20 via-transparent to-emerald-200/30 blur-3xl" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 560" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="dx-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <g className="dx-spin-slow" style={{ transformOrigin: "260px 280px" }}>
          <circle cx="260" cy="280" r="225" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 10" />
        </g>
        <circle cx="260" cy="280" r="175" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />

        <path
          className="dx-draw"
          d="M30 280h50l16-36 22 72 20-56 14 20h90"
          fill="none"
          stroke="url(#dx-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ animationDelay: "1100ms" }}
        />

        <g className="dx-heart" style={{ transformOrigin: "450px 400px" }}>
          <path
            d="M450 400c-7-7-17-5-17 5 0 9 17 19 17 19s17-10 17-19c0-10-10-12-17-5z"
            fill="#10b981"
            fillOpacity="0.9"
          />
        </g>
      </svg>

      {/* Center card */}
      <div className="dx-float-card absolute left-1/2 top-1/2 w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
        <svg viewBox="0 0 120 120" className="mx-auto h-24 w-24" aria-hidden="true">
          <defs>
            <linearGradient id="dx-tube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fee2e2" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <rect x="45" y="18" width="30" height="80" rx="15" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="48" y="60" width="24" height="35" rx="12" fill="url(#dx-tube)" />
          <rect x="40" y="10" width="40" height="12" rx="6" fill="#38bdf8" />
          <circle cx="55" cy="72" r="2.5" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="63" cy="80" r="1.8" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="58" cy="88" r="2" fill="#ffffff" fillOpacity="0.7" />
          <line x1="45" y1="40" x2="55" y2="40" stroke="#94a3b8" strokeWidth="1" />
          <line x1="45" y1="55" x2="55" y2="55" stroke="#94a3b8" strokeWidth="1" />
          <line x1="45" y1="70" x2="55" y2="70" stroke="#94a3b8" strokeWidth="1" />
        </svg>
        <p className="mt-2 text-center text-sm font-bold text-slate-800">Sample Collection</p>
        <p className="text-center text-xs text-slate-500">Home &amp; lab visits</p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <span className="rounded-md bg-slate-50 py-1 text-center text-[10px] font-bold text-slate-600">24h</span>
          <span className="rounded-md bg-slate-50 py-1 text-center text-[10px] font-bold text-slate-600">NABL</span>
          <span className="rounded-md bg-slate-50 py-1 text-center text-[10px] font-bold text-slate-600">Digital</span>
        </div>
      </div>

      {/* Top-right verified */}
      <div className="dx-float-card absolute right-2 top-6 rounded-2xl border border-slate-100 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm" style={{ animationDelay: "0.6s" }}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.shield}</svg>
          </span>
          <div>
            <p className="text-[11px] font-bold text-slate-800">Verified labs</p>
            <p className="text-[10px] text-slate-500">Partner network</p>
          </div>
        </div>
      </div>

      {/* Top-left report */}
      <div className="dx-float-card absolute -left-2 top-16 w-[146px] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl" style={{ animationDelay: "1.3s" }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report</p>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <svg viewBox="0 0 100 40" className="mt-1.5 h-9 w-full">
          <path
            d="M0 30 L15 30 L20 12 L25 34 L30 20 L40 20 L45 8 L50 28 L60 28 L65 18 L80 18 L85 26 L100 26"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-1 text-[10px] font-semibold text-emerald-600">Ready in 24h</p>
      </div>

      {/* Bottom-left home collection */}
      <div className="dx-float-card absolute bottom-12 -left-2 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl" style={{ animationDelay: "1.9s" }}>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.pin}</svg>
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">Home collection</p>
            <p className="text-[10px] text-slate-500">Available in your area</p>
          </div>
        </div>
      </div>

      {/* Bottom-right instant */}
      <div className="dx-float-card absolute bottom-16 right-2 flex items-center gap-2 rounded-full border border-slate-100 bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-sm" style={{ animationDelay: "2.4s" }}>
        <span className="relative flex h-2 w-2">
          <span className="dx-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-[11px] font-bold text-slate-700">Instant request</span>
      </div>

      <span className="dx-float-card absolute left-6 top-32 h-2.5 w-2.5 rounded-full bg-secondary/70" style={{ animationDelay: "0.9s" }} />
      <span className="dx-float-card absolute right-10 top-40 h-2 w-2 rounded-full bg-primary/70" style={{ animationDelay: "1.6s" }} />
      <span className="dx-float-card absolute bottom-32 right-20 h-1.5 w-1.5 rounded-full bg-emerald-400/80" style={{ animationDelay: "2.2s" }} />
    </div>
  );
}

function JourneyIllustration() {
  return (
    <svg viewBox="0 0 600 120" className="h-24 w-full" aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="dx-journey" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path d="M60 60 H 540" stroke="#e2e8f0" strokeWidth="2" fill="none" />
      <path
        d="M60 60 H 540"
        stroke="url(#dx-journey)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="dx-step-draw"
        style={{ animationDelay: "400ms" }}
      />
      <g>
        <circle cx="60" cy="60" r="22" fill="white" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="60" cy="60" r="10" fill="#38bdf8" fillOpacity="0.15" />
        <path d="M54 60l4 4 8-8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      <g>
        <circle cx="300" cy="60" r="22" fill="white" stroke="#0ea5e9" strokeWidth="2" />
        <circle cx="300" cy="60" r="10" fill="#0ea5e9" fillOpacity="0.15" />
        <rect x="292" y="54" width="16" height="14" rx="2" fill="none" stroke="#0ea5e9" strokeWidth="2" />
        <line x1="292" y1="60" x2="308" y2="60" stroke="#0ea5e9" strokeWidth="2" />
      </g>
      <g>
        <circle cx="540" cy="60" r="22" fill="white" stroke="#10b981" strokeWidth="2" />
        <circle cx="540" cy="60" r="10" fill="#10b981" fillOpacity="0.15" />
        <path d="M533 60l5 5 10-11" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

/* ============================================================================
   SMALL COMPONENTS
   ============================================================================ */

function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="dx-word inline-block" style={{ animationDelay: `${120 + i * 80}ms` }}>
          {word}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}

const TrustChip = React.memo(function TrustChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="dx-chip inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <span className="flex h-4 w-4 items-center justify-center text-secondary">{icon}</span>
      {label}
    </span>
  );
});

function StatChip({ label, value, tone }: { label: string; value: string; tone: "primary" | "secondary" | "emerald" | "amber" }) {
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
    <div className="dx-stat rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeMap[tone]}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {iconMap[tone]}
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-lg font-extrabold leading-none tabular-nums text-slate-800">
            <span ref={ref}>{display}</span>
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

const CategoryPill = React.memo(function CategoryPill({
  label,
  iconName,
  index,
}: {
  label: string;
  iconName: keyof typeof ICONS;
  index: number;
}) {
  return (
    <span
      className="dx-pill dx-spec inline-flex cursor-default items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-600"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span className="dx-spec-icon flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          {ICONS[iconName]}
        </svg>
      </span>
      {label}
    </span>
  );
});

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
      className="dx-feature dx-fade-up relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`dx-feature-icon flex h-11 w-11 items-center justify-center rounded-xl ${toneMap[tone]}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
});

function TestSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-[160px] bg-slate-100 dx-skeleton" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded-full bg-slate-100 dx-skeleton" />
        <div className="h-3 w-full rounded-full bg-slate-100 dx-skeleton" />
        <div className="h-3 w-3/4 rounded-full bg-slate-100 dx-skeleton" />
        <div className="h-6 w-1/2 rounded-full bg-slate-100 dx-skeleton" />
      </div>
    </div>
  );
}

/* ============================================================================
   TEST CARD
   ============================================================================ */

const TestCard = React.memo(function TestCard({
  test,
  index,
  onSelect,
}: {
  test: Test;
  index: number;
  onSelect: (test: Test) => void;
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  const handleClick = useCallback(() => onSelect(test), [onSelect, test]);

  /* Detect category and optionally honour a backend-provided image */
  const kind = detectTestKind(test.name);
  const rawImageUrl =
    (test as Test & { imageUrl?: string | null; image?: string | null }).imageUrl ??
    (test as Test & { image?: string | null }).image ??
    null;

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="dx-card dx-fade-up group rounded-2xl border border-slate-100 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
    >
      {/* Cursor-tracking spotlight */}
      <div className="dx-card-spotlight" aria-hidden="true" />

      {/* Media panel */}
      <div className="dx-card-media">
        <div className="dx-card-scan" aria-hidden="true" />

        {rawImageUrl ? (
          /* Backend-provided image takes priority if present */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rawImageUrl}
            alt={test.name}
            loading="lazy"
            decoding="async"
            className="dx-card-art absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          /* Otherwise render the category-specific illustration */
          <TestIllustration kind={kind} />
        )}

        {/* Category label chip */}
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {KIND_LABELS[kind]}
        </span>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-800 transition-colors group-hover:text-secondary">
          {test.name}
        </h3>

        {test.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {test.description}
          </p>
        )}

        <span className="dx-card-cta mt-4 inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary">
          Request this test
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {ICONS.arrow}
          </svg>
        </span>
      </div>
    </button>
  );
});

/* Friendly label per detected kind */
const KIND_LABELS: Record<TestKind, string> = {
  mri: "MRI",
  ct: "CT Scan",
  xray: "X-Ray",
  ultrasound: "Ultrasound",
  ecg: "ECG",
  blood: "Blood",
  urine: "Urine",
  pathology: "Pathology",
  endoscopy: "Endoscopy",
  general: "Lab",
};

/* ============================================================================
   SUCCESS CONFETTI
   ============================================================================ */

const CONFETTI = [
  { tx: -54, ty: -40, c: "#f97316", d: 0 },
  { tx: -30, ty: -60, c: "#38bdf8", d: 40 },
  { tx: 0, ty: -68, c: "#10b981", d: 80 },
  { tx: 30, ty: -64, c: "#fbbf24", d: 20 },
  { tx: 54, ty: -44, c: "#ef4444", d: 60 },
  { tx: -60, ty: -10, c: "#a78bfa", d: 30 },
  { tx: 62, ty: -10, c: "#06b6d4", d: 70 },
];

function SuccessConfetti() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2">
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className="dx-confetti-piece absolute h-2 w-2 rounded-sm"
          style={
            {
              background: p.c,
              animationDelay: `${p.d}ms`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

/* ============================================================================
   MAIN PAGE
   ============================================================================ */

export default function BookDiagnosticsPage() {
  const { data: tests, isLoading, error, execute: fetchTests } = useApi(testApi.getAll);
  const { token } = useAuth();
  const shellRef = useCursorTrack<HTMLDivElement>();

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((profile) => {
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || "");
      })
      .catch(() => {
        /* not fatal */
      });
  }, [token]);

  const handleOpenModal = useCallback((test: Test) => {
    setSelectedTest(test);
    setSubmitted(false);
    setSubmitError(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTest(null);
  }, []);

  useEffect(() => {
    if (!selectedTest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedTest, handleCloseModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedTest) return;
    if (!fullName.trim() || !phone.trim()) {
      setSubmitError("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      await testApi.request(selectedTest.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-white">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

        <div
          ref={shellRef}
          className="dx-shell relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        >
          <div aria-hidden="true" className="dx-dot-grid" />

          <div
            aria-hidden="true"
            className="dx-orb dx-orb-1 pointer-events-none absolute -top-10 -right-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dx-orb dx-orb-2 pointer-events-none absolute top-[520px] -left-24 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
            style={{ animationDelay: "1.6s" }}
          />

          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center mb-12">
            <div className="dx-fade-up">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="dx-dot absolute inline-flex h-full w-full rounded-full bg-secondary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                <span className="dx-shimmer-text">Book Diagnostics</span>
              </span>

              <AnimatedHeadline text="Find a Diagnostic Service" />

              <p className="dx-fade-up dx-delay-3 mt-4 text-slate-500 max-w-xl leading-relaxed">
                Select the test or scan you need, and our team will connect you with a lab or
                hospital near you. Reports delivered digitally — most ready within 24 hours.
              </p>

              <div className="dx-fade-up dx-delay-4 mt-6 flex flex-wrap gap-2">
                <TrustChip
                  label="Verified partner labs"
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.check}</svg>}
                />
                <TrustChip
                  label="Fast turnaround"
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.bolt}</svg>}
                />
                <TrustChip
                  label="Digital reports"
                  icon={<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.lock}</svg>}
                />
              </div>

              <div className="dx-fade-up dx-delay-5 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip label="Partner labs" value="80+" tone="primary" />
                <StatChip label="Tests available" value="500+" tone="secondary" />
                <StatChip label="Avg. turnaround" value="24h" tone="emerald" />
                <StatChip label="Home collection" value="Yes" tone="amber" />
              </div>
            </div>

            <div className="dx-fade-up dx-delay-2 hidden lg:block relative">
              <HeroIllustration />
            </div>
          </section>

          {/* ── CATEGORIES STRIP ─────────────────────────────── */}
          <section className="dx-fade-up dx-delay-5 relative mb-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Common test categories
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Browse by area below, or request any specific test from the list.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="dx-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Labs online
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEST_CATEGORIES.map((cat, i) => (
                <CategoryPill key={cat.label} label={cat.label} iconName={cat.icon} index={i} />
              ))}
            </div>
          </section>

          {/* ── TESTS GRID ───────────────────────────────────── */}
          <section className="relative mb-14">
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <TestSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="dx-fade mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-600">Error loading services: {error}</p>
              </div>
            )}

            {!isLoading && !error && (!tests || tests.length === 0) && (
              <div className="dx-fade mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    {ICONS.flask}
                  </svg>
                </span>
                <p className="mt-4 text-sm font-medium text-slate-500">
                  No diagnostic services listed yet. Check back soon.
                </p>
              </div>
            )}

            {!isLoading && !error && tests && tests.length > 0 && (
              <>
                <p className="dx-fade mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Showing {tests.length} {tests.length === 1 ? "test" : "tests"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tests.map((test, index) => (
                    <TestCard key={test.id} test={test} index={index} onSelect={handleOpenModal} />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── HOW IT WORKS ─────────────────────────────────── */}
          <section className="dx-fade-up relative mb-14 rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">How it works</span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Three steps to your report.
                </h2>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  Choose the test you need, submit your request with contact details, and our team
                  reaches out to coordinate with the closest partner lab or hospital.
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  {[
                    { n: "01", t: "Choose the test or scan you need", tone: "text-secondary bg-secondary/10" },
                    { n: "02", t: "Submit your contact details", tone: "text-primary bg-primary/10" },
                    { n: "03", t: "We connect you with a nearby lab", tone: "text-emerald-600 bg-emerald-50" },
                  ].map((step) => (
                    <li key={step.n} className="flex items-center gap-3 text-slate-600">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${step.tone}`}>
                        {step.n}
                      </span>
                      {step.t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <JourneyIllustration />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Choose</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">Seconds</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Request</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">Minutes</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-700">Same day</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── WHY ZENIVA ───────────────────────────────────── */}
          <section className="relative mb-14">
            <div className="mb-6 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Why Zeniva</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Diagnostics without the runaround
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 leading-relaxed">
                We partner with accredited labs and hospitals across Nepal so you get quality
                testing without the phone calls.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <FeatureCard icon={ICONS.shield} title="Accredited Partners" description="Every lab and hospital we connect you with is vetted and verified." tone="primary" delay={0} />
              <FeatureCard icon={ICONS.bolt} title="Fast Results" description="Most reports are ready within 24 hours and delivered digitally." tone="secondary" delay={100} />
              <FeatureCard icon={ICONS.lock} title="Private & Secure" description="Your personal and medical information stays on a secure portal." tone="emerald" delay={200} />
              <FeatureCard icon={ICONS.pin} title="Home Collection" description="Sample collection at home is available across major cities." tone="amber" delay={300} />
            </div>
          </section>

          {/* ── HELP CARD ────────────────────────────────────── */}
          <section className="dx-fade-up relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-secondary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-md ring-1 ring-slate-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.phone}</svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Not sure which test you need?</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-md">
                    Talk to our care team — we can recommend a test based on your symptoms or your
                    doctor&apos;s advice.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:+97715927435"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.phone}</svg>
                  Call support
                </a>
                <a
                  href="mailto:reception.zenivahealthcare@gmail.com"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.mail}</svg>
                  Email us
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── MODAL ──────────────────────────────────────────── */}
      {selectedTest && (
        <div
          className="dx-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dx-modal-title"
        >
          <div
            className="dx-modal relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Request test</p>
                <h3 id="dx-modal-title" className="mt-0.5 truncate text-base font-bold text-slate-800">
                  {selectedTest.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{ICONS.x}</svg>
              </button>
            </div>

            {submitted ? (
              <div className="relative p-6 text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <SuccessConfetti />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path className="dx-check" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <h4 className="mt-4 text-base font-bold text-slate-800">Request received</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Our team will contact you shortly to connect you with a lab or hospital that offers{" "}
                  <strong className="font-semibold text-slate-700">{selectedTest.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-6 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  Leave your contact details and we&apos;ll reach out to connect you with a lab or
                  hospital that offers this test.
                </p>

                {submitError && (
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                    {submitError}
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="dx-fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <input
                    id="dx-fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="dx-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="dx-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </label>
                  <input
                    id="dx-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="dx-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="+977-98XXXXXXXX"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="dx-email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email (optional)
                  </label>
                  <input
                    id="dx-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="dx-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>

                <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Prefer to talk to someone directly?
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      {ICONS.phone}
                    </svg>
                    <span className="font-semibold text-slate-800">Call:</span>
                    <a href="tel:+97715927435" className="text-primary transition-colors hover:underline">
                      +977-1-5927435
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      {ICONS.mail}
                    </svg>
                    <span className="font-semibold text-slate-800">Email:</span>
                    <a
                      href="mailto:reception.zenivahealthcare@gmail.com"
                      className="break-all text-primary transition-colors hover:underline"
                    >
                      reception.zenivahealthcare@gmail.com
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}
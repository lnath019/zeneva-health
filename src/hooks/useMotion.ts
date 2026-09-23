'use client';

import { useEffect, useRef } from 'react';

/*
  Pointer-driven motion helpers.

  Both hooks are desktop-only (fine pointer + hover) and are skipped entirely
  when the visitor prefers reduced motion. They write straight to the DOM inside
  requestAnimationFrame, so moving the mouse never triggers a React re-render.
*/

function motionAllowed() {
  if (typeof window === 'undefined') return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return !reduce && finePointer;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Magnetic hover: the element drifts a few pixels toward the cursor and eases
 * back when the cursor leaves. Do not put Tailwind translate/transform classes
 * on the same element, since this hook owns its inline `transform`.
 *
 * strength: how much of the cursor offset is applied (0-1)
 * max: hard cap in pixels
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.3, max = 10) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;

      const settled = Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05;
      if (settled) {
        currentX = targetX;
        currentY = targetY;
      }

      el.style.transform =
        currentX === 0 && currentY === 0
          ? ''
          : `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      targetX = clamp(dx * strength, -max, max);
      targetY = clamp(dy * strength, -max, max);
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength, max]);

  return ref;
}

/**
 * Pointer parallax: publishes the smoothed cursor position over `ref` as the CSS
 * variables --mx and --my, each between -0.5 and 0.5. Children read them, e.g.
 *   transform: translate3d(calc(var(--mx, 0) * 18px), calc(var(--my, 0) * 10px), 0)
 * so every layer can move at its own depth without any React state.
 */
export function usePointerParallax<T extends HTMLElement>(ref: { current: T | null }) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      el.style.setProperty('--mx', currentX.toFixed(4));
      el.style.setProperty('--my', currentY.toFixed(4));

      const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      targetX = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
      targetY = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    };
  }, [ref]);
}
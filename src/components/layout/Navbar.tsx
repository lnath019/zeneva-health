'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { CartDrawer } from '@/components/shop/CartDrawer';

interface NavbarProps {
  activeTabLabel: string;
  /** Width of the fixed sidebar this navbar sits beside, in pixels. Defaults to 256 (Tailwind w-64). */
  sidebarWidthPx?: number;
}

const REVEAL_ZONE_PX = 64; // cursor within this many px of the top reveals the bar
const HIDE_DELAY_MS = 350; // grace period before hiding, so it doesn't flicker

function useCursorReveal(revealZonePx: number, hideDelayMs: number, hoveringBar: boolean) {
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };

    const scheduleHide = () => {
      clearHideTimer();
      hideTimer.current = setTimeout(() => setVisible(false), hideDelayMs);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY <= revealZonePx) {
        clearHideTimer();
        setVisible(true);
      } else if (!hoveringBar) {
        scheduleHide();
      }
    };

    const onMouseLeave = () => {
      if (!hoveringBar) scheduleHide();
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearHideTimer();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [revealZonePx, hideDelayMs, hoveringBar]);

  useEffect(() => {
    if (hoveringBar) setVisible(true);
  }, [hoveringBar]);

  return visible;
}

export function Navbar({ activeTabLabel, sidebarWidthPx = 256 }: NavbarProps) {
  const { signOut, role } = useAuth();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hoveringBar, setHoveringBar] = useState(false);
  const showCart = role === 'patient' || role === 'doctor';

  const visible = useCursorReveal(REVEAL_ZONE_PX, HIDE_DELAY_MS, hoveringBar);

  return (
    <>
      <header
        onMouseEnter={() => setHoveringBar(true)}
        onMouseLeave={() => setHoveringBar(false)}
        className="fixed top-0 right-0 z-30 h-14 border-b transition-all duration-300 ease-out"
        style={{
          left: sidebarWidthPx,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          pointerEvents: visible ? 'auto' : 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderColor: 'rgba(226, 232, 240, 0.6)',
        }}
      >
        {/* Slim gradient accent line along the top edge */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary opacity-60" />

        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gradient-to-br from-primary to-secondary" />
            </span>
            <h1 className="text-sm font-semibold text-slate-800">{activeTabLabel}</h1>
          </div>

          <div className="flex items-center gap-3">
            {showCart && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 bg-white/40 text-slate-500 transition-colors duration-150 hover:border-primary/40 hover:text-primary"
                aria-label="Open cart"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-sky-400 text-[9px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-slate-200/70 bg-white/40 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Spacer so page content doesn't sit under the fixed header */}
      <div className="h-14" aria-hidden="true" />

      {showCart && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
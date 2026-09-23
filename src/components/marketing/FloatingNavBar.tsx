'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMagnetic } from '@/hooks/useMotion';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────────────────── */

const TONES = {
  primary: 'bg-primary-light text-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  secondary: 'bg-secondary/10 text-secondary',
  red: 'bg-red-50 text-red-500',
} as const;

type Tone = keyof typeof TONES;

const SERVICE_LINKS: { title: string; description: string; href: string; tone: Tone; icon: string }[] = [
  {
    title: 'Doctor Consultation',
    description: 'Find specialists and book a slot in minutes',
    href: '/book-doctor',
    tone: 'primary',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    title: 'Diagnostics & Lab Tests',
    description: 'MRI, CT scans, ultrasound and lab work',
    href: '/book-diagnostics',
    tone: 'emerald',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'e-Pharmacy',
    description: 'Prescription and OTC medicines, delivered',
    href: '/buy-medicines',
    tone: 'secondary',
    icon: 'M9 2a1 1 0 00-1 1v2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9zm1 7a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H8a1 1 0 110-2h2V9z',
  },
  {
    title: 'Ambulance Service',
    description: 'Locate and call verified ambulances',
    href: '/health-directory',
    tone: 'red',
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z',
  },
];

const NAV_LINKS = [
  { label: 'Directory', href: '/health-directory' },
  { label: 'Health tips', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const NAVBAR_CSS = `
  @keyframes nav-drop {
    from { opacity: 0; transform: translateY(-18px); }
  }
  @keyframes nav-pop {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  }
  @keyframes nav-item {
    from { opacity: 0; transform: translateY(8px); }
  }
  .nav-anim { animation: nav-drop 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
  .nav-pop { transform-origin: top center; animation: nav-pop 0.22s ease-out both; }
  .nav-item { animation: nav-item 0.35s ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .nav-anim, .nav-pop, .nav-item { animation: none !important; }
  }
`;

/* ────────────────────────────────────────────────────────────────────────
   Small icon helpers
   ──────────────────────────────────────────────────────────────────────── */

function Icon({ d, className = 'h-4 w-4', strokeWidth = 2 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={d} />
    </svg>
  );
}

const ARROW = 'M17 8l4 4m0 0l-4 4m4-4H3';
const CHEVRON = 'M19 9l-7 7-7-7';
const PLUS = 'M12 5v14M5 12h14';

/* ────────────────────────────────────────────────────────────────────────
   Floating navbar
   ──────────────────────────────────────────────────────────────────────── */

export function FloatingNavbar() {
  const pathname = usePathname() ?? '';
  const headerRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<string>('mouse');

  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ctaRef = useMagnetic<HTMLAnchorElement>(0.3, 8);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openServices = () => {
    clearCloseTimer();
    setServicesOpen(true);
  };

  // A short grace period lets the pointer cross the gap between the pill and the panel
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setServicesOpen(false), 140);
  };

  // Compact and solid once the visitor scrolls away from the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything after navigating
  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Click outside or Escape closes any open menu
  useEffect(() => {
    if (!servicesOpen && !mobileOpen) return undefined;

    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [servicesOpen, mobileOpen]);

  useEffect(() => clearCloseTimer, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkBase =
    'relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ' +
    "after:absolute after:inset-x-3.5 after:bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100";

  const linkTone = scrolled
    ? 'text-slate-600 hover:text-slate-900'
    : 'text-white/85 hover:text-white';

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <style>{NAVBAR_CSS}</style>

      <div
        className={cn(
          'nav-anim mx-auto w-full transition-[max-width] duration-500 ease-out',
          scrolled ? 'max-w-[980px]' : 'max-w-[1080px]'
        )}
      >
        <nav
          aria-label="Main"
          className={cn(
            'relative flex items-center justify-between rounded-full border px-3 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out lg:grid lg:grid-cols-[1fr_auto_1fr]',
            scrolled
              ? 'border-slate-200/80 bg-white/85 py-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-xl'
              : 'border-white/20 bg-white/10 py-2 shadow-none backdrop-blur-md'
          )}
        >
          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link
            href="/"
            aria-label="Zeniva Health Care home"
            className="group flex items-center gap-2 justify-self-start rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/30 transition-transform duration-300 group-hover:rotate-90">
              <Icon d={PLUS} className="h-4 w-4" strokeWidth={3} />
            </span>
            <span
              className={cn(
                'text-base font-extrabold tracking-tight transition-colors duration-300',
                scrolled ? 'text-slate-800' : 'text-white'
              )}
            >
              Zeniva
            </span>
          </Link>

          {/* ── Desktop links ────────────────────────────────────── */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            <li
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') openServices();
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') scheduleClose();
              }}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                aria-controls="nav-services-menu"
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onKeyDown={() => {
                  lastPointer.current = 'keyboard';
                }}
                onClick={() => setServicesOpen((open) => (lastPointer.current === 'mouse' ? true : !open))}
                className={cn(linkBase, linkTone, servicesOpen && 'after:scale-x-100')}
              >
                Services
                <Icon
                  d={CHEVRON}
                  className={cn('h-3.5 w-3.5 transition-transform duration-300', servicesOpen && 'rotate-180')}
                  strokeWidth={2.5}
                />
              </button>

              {servicesOpen && (
                <div className="absolute left-1/2 top-full w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 pt-3">
                  <div
                    id="nav-services-menu"
                    className="nav-pop overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5"
                  >
                    <div className="grid grid-cols-[1.5fr_1fr] gap-2">
                      <ul className="space-y-1">
                        {SERVICE_LINKS.map((item, i) => (
                          <li key={item.title} className="nav-item" style={{ animationDelay: `${60 + i * 50}ms` }}>
                            <Link
                              href={item.href}
                              onClick={() => setServicesOpen(false)}
                              className="group flex items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                              <span
                                className={cn(
                                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
                                  TONES[item.tone]
                                )}
                              >
                                <Icon d={item.icon} className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 transition-colors group-hover:text-primary">
                                  {item.title}
                                  <Icon
                                    d={ARROW}
                                    className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                                    strokeWidth={2.5}
                                  />
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <aside className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#06222e] p-5 text-white">
                        <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/30 blur-2xl" />
                        <span className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-secondary/30 blur-2xl" />
                        <div className="relative">
                          <h3 className="text-base font-bold leading-snug">Need care right now?</h3>
                          <p className="mt-2 text-xs leading-relaxed text-white/70">
                            Find the nearest verified ambulance and call for emergency dispatch.
                          </p>
                        </div>
                        <Link
                          href="/health-directory"
                          onClick={() => setServicesOpen(false)}
                          className="group relative mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          Open directory
                          <Icon
                            d={ARROW}
                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            strokeWidth={2.5}
                          />
                        </Link>
                      </aside>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(linkBase, linkTone, isActive(link.href) && 'after:scale-x-100')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Actions ──────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-1.5">
            <Link
              href="/login"
              className={cn(linkBase, linkTone, 'hidden lg:inline-flex')}
            >
              Sign in
            </Link>

            <Link
              ref={ctaRef}
              href="/book-doctor"
              className="group hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 lg:inline-flex"
            >
              Book a doctor
              <Icon
                d={ARROW}
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="nav-mobile-menu"
              onClick={() => setMobileOpen((open) => !open)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 lg:hidden',
                scrolled ? 'text-slate-700 hover:bg-slate-900/5' : 'text-white hover:bg-white/10'
              )}
            >
              <span className="relative block h-[14px] w-5">
                <span
                  className={cn(
                    'absolute left-0 block h-[2px] w-5 rounded-full bg-current transition-all duration-300',
                    mobileOpen ? 'top-[6px] rotate-45' : 'top-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-[6px] block h-[2px] w-5 rounded-full bg-current transition-opacity duration-200',
                    mobileOpen && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 block h-[2px] w-5 rounded-full bg-current transition-all duration-300',
                    mobileOpen ? 'top-[6px] -rotate-45' : 'top-[12px]'
                  )}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* ── Mobile panel ───────────────────────────────────────── */}
        {mobileOpen && (
          <div
            id="nav-mobile-menu"
            className="nav-pop mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-900/15 lg:hidden"
          >
            <p className="px-3 pb-1 pt-2 text-xs font-semibold text-slate-400">Services</p>
            <ul>
              {SERVICE_LINKS.map((item, i) => (
                <li key={item.title} className="nav-item" style={{ animationDelay: `${i * 45}ms` }}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONES[item.tone])}>
                      <Icon d={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800">{item.title}</span>
                      <span className="block truncate text-xs text-slate-500">{item.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-2 h-px bg-slate-100" />

            <ul>
              {NAV_LINKS.map((link, i) => (
                <li key={link.href} className="nav-item" style={{ animationDelay: `${(SERVICE_LINKS.length + i) * 45}ms` }}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      isActive(link.href) ? 'text-primary' : 'text-slate-700'
                    )}
                  >
                    {link.label}
                    <Icon d={ARROW} className="h-3.5 w-3.5 text-slate-300" strokeWidth={2.5} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Sign in
              </Link>
              <Link
                href="/book-doctor"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Book a doctor
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
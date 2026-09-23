'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { LOGO_SRC, LOGO_ALT } from '@/config/brand';
import { useMagnetic } from '@/hooks/useMotion';

/*
  MarketingHeader — floating navbar used on every marketing page.

  Same export, same links, same booking dropdown, cart drawer, login/dashboard button
  and mobile menu as before; only the presentation changed.

  • Pages listed in HERO_PATHS (the home page) start with a transparent pill over the
    hero photo, which turns solid and compact once you scroll.
  • Every other page gets the solid pill from the start, plus a spacer so content
    does not slide underneath the fixed header.
*/

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Buy Medicines', href: '/buy-medicines' },
  { label: 'Health Directory', href: '/health-directory' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

// "Book a Doctor" and "Book Diagnostics" used to be two nav links; they now
// live behind one Book Appointment action so the header carries a single
// booking entry point.
const BOOKING_OPTIONS = [
  {
    label: 'Doctor',
    description: 'Consult a specialist',
    href: '/book-doctor',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    label: 'Diagnostic',
    description: 'Lab tests & scans',
    href: '/book-diagnostics',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
  },
];

const BOOKING_HREFS = BOOKING_OPTIONS.map((o) => o.href);

// Pages that open with a dark full-bleed hero, where the navbar can be transparent at the top
const HERO_PATHS = ['/'];

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
  @keyframes nav-badge {
    0% { transform: scale(0.4); }
    60% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  .nav-anim { animation: nav-drop 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
  .nav-pop { transform-origin: top right; animation: nav-pop 0.22s ease-out both; }
  .nav-item { animation: nav-item 0.35s ease-out both; }
  .nav-badge { animation: nav-badge 0.35s ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .nav-anim, .nav-pop, .nav-item, .nav-badge { animation: none !important; }
  }
`;

// The drop-in entrance should play once per visit, not on every page change,
// because each page mounts its own copy of the header.
let navEntered = false;

function CartButton({
  count,
  solid,
  onClick,
  className,
}: {
  count: number;
  solid: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        solid
          ? 'border-slate-200 bg-white text-slate-500 hover:border-primary/40 hover:text-primary'
          : 'border-white/30 text-white hover:bg-white/10',
        className
      )}
      aria-label="Open cart"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className="nav-badge absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function MarketingHeader() {
  const { token, isLoading } = useAuth();
  const pathname = usePathname() ?? '';
  const { totalItems } = useCart();

  const headerRef = useRef<HTMLElement | null>(null);
  const bookingRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const hoverRef = useRef<HTMLLIElement | null>(null);

  const [animateIn] = useState(() => !navEntered);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const bookingButtonRef = useMagnetic<HTMLButtonElement>(0.25, 6);

  const loginHref = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
  const isBookingActive = BOOKING_HREFS.includes(pathname);
  const isAuthed = !isLoading && !!token;
  const authHref = isAuthed ? '/dashboard' : loginHref;
  const authLabel = isAuthed ? 'Go to Dashboard' : 'Login / Sign Up';

  // Transparent only at the very top of a hero page; solid everywhere else
  const overHero = HERO_PATHS.includes(pathname);
  const solid = scrolled || !overHero;

  const openCart = () => {
    setIsMenuOpen(false);
    setIsBookingOpen(false);
    setIsCartOpen(true);
  };

  // Sliding hover highlight behind the desktop links. It writes to the DOM directly,
  // so moving between links never triggers a React re-render.
  const moveHover = (el: HTMLElement) => {
    const pill = hoverRef.current;
    const list = listRef.current;
    if (!pill || !list) return;

    const listRect = list.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const wasHidden = pill.style.opacity !== '1';

    // First hover: jump into place instead of sliding in from the left edge
    if (wasHidden) pill.style.transition = 'none';
    pill.style.width = `${rect.width}px`;
    pill.style.height = `${rect.height}px`;
    pill.style.transform = `translate3d(${rect.left - listRect.left}px, ${rect.top - listRect.top}px, 0)`;
    if (wasHidden) {
      pill.getBoundingClientRect();
      pill.style.transition = '';
    }
    pill.style.opacity = '1';
  };

  const hideHover = () => {
    if (hoverRef.current) hoverRef.current.style.opacity = '0';
  };

  useEffect(() => {
    navEntered = true;
  }, []);

  // Compact once the visitor scrolls away from the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus after navigating
  useEffect(() => {
    setIsMenuOpen(false);
    setIsBookingOpen(false);
  }, [pathname]);

  // A dropdown that only closed on its own trigger would stay pinned open
  // while the reader clicks elsewhere on the page.
  useEffect(() => {
    if (!isBookingOpen && !isMenuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isBookingOpen && bookingRef.current && !bookingRef.current.contains(target)) {
        setIsBookingOpen(false);
      }
      if (isMenuOpen && headerRef.current && !headerRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBookingOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBookingOpen, isMenuOpen]);

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4">
        <style>{NAVBAR_CSS}</style>

        <div
          className={cn(
            'mx-auto w-full transition-[max-width] duration-500 ease-out',
            animateIn && 'nav-anim',
            scrolled ? 'max-w-[1080px]' : 'max-w-[1180px]'
          )}
        >
          <div
            className={cn(
              'relative flex items-center justify-between gap-3 rounded-full border px-3 transition-[padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out',
              solid
                ? cn(
                    'border-slate-200/80 bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-xl',
                    scrolled ? 'py-1' : 'py-1.5'
                  )
                : 'border-white/20 bg-white/10 py-1.5 shadow-none backdrop-blur-md'
            )}
          >
            {/* ── Logo (sits on a white chip while the bar is transparent) ── */}
            <Link
              href="/"
              className={cn(
                'flex shrink-0 select-none items-center rounded-full px-2 py-0.5 transition-[background-color,box-shadow] duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                solid ? 'bg-transparent' : 'bg-white/95 shadow-sm ring-1 ring-white/40'
              )}
            >
              <img src={LOGO_SRC} alt={LOGO_ALT} className="h-9 w-auto" />
            </Link>

            {/* ── Desktop links ────────────────────────────────────── */}
            <nav aria-label="Main" className="hidden xl:block">
              <ul ref={listRef} onPointerLeave={hideHover} className="relative flex items-center">
                <li
                  ref={hoverRef}
                  aria-hidden="true"
                  role="presentation"
                  className={cn(
                    'pointer-events-none absolute left-0 top-0 rounded-lg opacity-0 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none',
                    solid ? 'bg-slate-900/[0.06]' : 'bg-white/15'
                  )}
                />
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href} className="relative z-10">
                      <Link
                        href={link.href}
                        aria-current={isActive ? 'page' : undefined}
                        onPointerEnter={(e) => {
                          if (e.pointerType === 'mouse') moveHover(e.currentTarget);
                        }}
                        className={cn(
                          'block whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                          solid
                            ? isActive
                              ? 'bg-primary-light text-primary'
                              : 'text-neutralBrand hover:text-primary'
                            : isActive
                              ? 'bg-white/20 text-white'
                              : 'text-white/90 hover:text-white'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── Desktop actions ──────────────────────────────────── */}
            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <CartButton count={totalItems} solid={solid} onClick={openCart} />

              {/* Booking sits left of Login and carries the secondary brand colour,
                  so the two actions read as distinct rather than competing. */}
              <div className="relative" ref={bookingRef}>
                <button
                  ref={bookingButtonRef}
                  onClick={() => setIsBookingOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={isBookingOpen}
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors',
                    'bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2',
                    isBookingActive && 'ring-2 ring-secondary/40'
                  )}
                >
                  Book Appointment
                  <svg
                    className={cn('h-3.5 w-3.5 transition-transform duration-300', isBookingOpen && 'rotate-180')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isBookingOpen && (
                  <div
                    role="menu"
                    className="nav-pop absolute right-0 top-full z-40 mt-3 w-64 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/5"
                  >
                    {BOOKING_OPTIONS.map((option, i) => (
                      <Link
                        key={option.href}
                        href={option.href}
                        role="menuitem"
                        onClick={() => setIsBookingOpen(false)}
                        className="nav-item group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                        style={{ animationDelay: `${60 + i * 60}ms` }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            {option.icon}
                          </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-800 transition-colors group-hover:text-secondary">
                            {option.label}
                          </span>
                          <span className="block text-xs text-slate-400">{option.description}</span>
                        </span>
                        <svg
                          className="h-3.5 w-3.5 -translate-x-1 text-secondary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href={authHref}>
                <Button size="sm">{authLabel}</Button>
              </Link>
            </div>

            {/* ── Mobile / tablet: cart + menu button ──────────────── */}
            <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
              <CartButton count={totalItems} solid={solid} onClick={openCart} />
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  solid ? 'text-slate-600 hover:bg-slate-50' : 'text-white hover:bg-white/10'
                )}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="nav-mobile-menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* ── Mobile panel ───────────────────────────────────────── */}
          {isMenuOpen && (
            <div
              id="nav-mobile-menu"
              className="nav-pop mt-2 max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto rounded-3xl border border-slate-100 bg-white px-4 py-4 shadow-2xl shadow-slate-900/15 xl:hidden"
            >
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={cn(
                    'nav-item block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    pathname === link.href ? 'bg-primary-light text-primary' : 'text-neutralBrand hover:bg-slate-50'
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {link.label}
                </Link>
              ))}

              {/* No dropdown on mobile — both destinations are laid out inline
                  rather than hidden behind an extra tap. */}
              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-bold text-slate-400">Book Appointment</p>
                {BOOKING_OPTIONS.map((option, i) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50',
                      pathname === option.href
                        ? 'bg-secondary/10 text-secondary'
                        : 'text-neutralBrand hover:bg-slate-50'
                    )}
                    style={{ animationDelay: `${(NAV_LINKS.length + i) * 40}ms` }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        {option.icon}
                      </svg>
                    </span>
                    {option.label}
                  </Link>
                ))}
              </div>

              <div className="pt-1">
                <Link href={authHref} onClick={() => setIsMenuOpen(false)} className="block">
                  <Button size="sm" className="w-full">
                    {authLabel}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* The header is fixed, so on pages without a hero this spacer keeps content from sliding underneath it */}
      {!overHero && <div aria-hidden="true" className="h-[76px]" />}

      {/* Rendered outside the header so the blurred bar can never trap the drawer's fixed positioning */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default MarketingHeader;
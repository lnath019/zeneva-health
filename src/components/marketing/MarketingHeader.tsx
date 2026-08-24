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

export function MarketingHeader() {
  const { token, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const bookingRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  const loginHref = `/login?redirect=${encodeURIComponent(pathname || '/')}`;
  const isBookingActive = BOOKING_HREFS.includes(pathname || '');

  // A dropdown that only closed on its own trigger would stay pinned open
  // while the reader clicks elsewhere on the page.
  useEffect(() => {
    if (!isBookingOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (bookingRef.current && !bookingRef.current.contains(event.target as Node)) {
        setIsBookingOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsBookingOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBookingOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="w-[95%] max-w-none mx-auto h-20 flex items-center justify-between">
       <Link href="/" className="flex items-center select-none shrink-0">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            className="h-16 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                  isActive ? 'text-primary bg-primary-light' : 'text-neutralBrand hover:text-primary hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Open cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-white text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Booking sits left of Login and carries the secondary brand colour,
              so the two actions read as distinct rather than competing. */}
          <div className="relative" ref={bookingRef}>
            <button
              onClick={() => setIsBookingOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isBookingOpen}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium text-white transition-colors',
                'bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2',
                isBookingActive && 'ring-2 ring-secondary/40'
              )}
            >
              Book Appointment
              <svg
                className={cn('w-3.5 h-3.5 transition-transform', isBookingOpen && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isBookingOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 p-1.5 z-40"
              >
                {BOOKING_OPTIONS.map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    role="menuitem"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/10 transition-colors group"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {option.icon}
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-secondary transition-colors">
                        {option.label}
                      </span>
                      <span className="block text-xs text-slate-400">{option.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {!isLoading && token ? (
            <Link href="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href={loginHref}>
              <Button size="sm">Login / Sign Up</Button>
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen((open) => !open)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                pathname === link.href ? 'text-primary bg-primary-light' : 'text-neutralBrand hover:bg-slate-50'
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* No dropdown on mobile — both destinations are laid out inline
              rather than hidden behind an extra tap. */}
          <div className="pt-2">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Book Appointment
            </p>
            {BOOKING_OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  pathname === option.href
                    ? 'text-secondary bg-secondary/10'
                    : 'text-neutralBrand hover:bg-slate-50'
                )}
              >
                <span className="w-8 h-8 shrink-0 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {option.icon}
                  </svg>
                </span>
                {option.label}
              </Link>
            ))}
          </div>

          <div className="pt-1">
            {!isLoading && token ? (
              <Link href="/dashboard" className="block">
                <Button size="sm" className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href={loginHref} className="block">
                <Button size="sm" className="w-full">Login / Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      )}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

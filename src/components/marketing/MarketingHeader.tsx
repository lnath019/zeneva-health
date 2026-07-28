'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/shop/CartDrawer';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Book a Doctor', href: '/book-doctor' },
  { label: 'Book Diagnostics', href: '/book-diagnostics' },
  { label: 'Buy Medicines', href: '/buy-medicines' },
  { label: 'Health Directory', href: '/health-directory' },
  { label: 'Contact', href: '/contact' },
];

export function MarketingHeader() {
  const { token, isLoading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 select-none shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/20">
            Z
          </div>
          <span className="text-xl font-bold text-primary tracking-wide">ZENIVA</span>
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
          <ThemeSwitcher />
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
          {!isLoading && token ? (
            <Link href="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
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
          <div className="pt-3 flex items-center gap-3">
            <ThemeSwitcher />
          </div>
          <div className="pt-1">
            {!isLoading && token ? (
              <Link href="/dashboard" className="block">
                <Button size="sm" className="w-full">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login" className="block">
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

import React from 'react';
import Link from 'next/link';
import { LOGO_SRC, LOGO_ALT } from '@/config/brand';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Book a Doctor', href: '/book-doctor' },
  { label: 'Book Diagnostics', href: '/book-diagnostics' },
  { label: 'Buy Medicines', href: '/buy-medicines' },
  { label: 'Health Directory', href: '/health-directory' },
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Refund Policy', href: '#' },
];

const SOCIAL_LINKS = [
  {
    label: 'WhatsApp',
    href: 'https://api.whatsapp.com/send?phone=9779851132452',
    external: true,
    icon: (
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.86L2 22l5.36-1.36a9.9 9.9 0 004.68 1.19h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 1.8a8.1 8.1 0 018.11 8.11c0 4.48-3.63 8.11-8.11 8.11a8 8 0 01-4.14-1.14l-.3-.18-3.18.81.85-3.1-.2-.32a8.07 8.07 0 01-1.24-4.28 8.1 8.1 0 018.11-8.11zm-4.3 4.4c-.18 0-.47.07-.71.34-.24.27-.93.9-.93 2.2s.95 2.55 1.08 2.73c.13.18 1.85 2.92 4.55 4 .64.26 1.13.42 1.52.53.64.18 1.22.16 1.68.1.51-.08 1.57-.64 1.79-1.26.22-.62.22-1.14.15-1.26-.07-.11-.24-.18-.5-.32-.27-.13-1.57-.78-1.82-.87-.24-.09-.42-.13-.6.14-.18.27-.68.87-.84 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.35-1.6-1.5-1.87-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.15.18-.27.27-.44.09-.18.04-.34-.02-.48-.07-.14-.6-1.45-.83-1.98-.22-.52-.44-.45-.6-.46-.16-.01-.34-.01-.52-.01z" />
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0022 12z" />
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <path d="M12 2c2.71 0 3.05.01 4.12.06 1.07.05 1.79.22 2.43.46.66.26 1.21.6 1.76 1.15.55.55.89 1.1 1.15 1.76.24.64.41 1.36.46 2.43.05 1.07.06 1.41.06 4.12s-.01 3.05-.06 4.12c-.05 1.07-.22 1.79-.46 2.43a4.9 4.9 0 01-1.15 1.76 4.9 4.9 0 01-1.76 1.15c-.64.24-1.36.41-2.43.46-1.07.05-1.41.06-4.12.06s-3.05-.01-4.12-.06c-1.07-.05-1.79-.22-2.43-.46a4.9 4.9 0 01-1.76-1.15 4.9 4.9 0 01-1.15-1.76c-.24-.64-.41-1.36-.46-2.43C2.01 15.05 2 14.71 2 12s.01-3.05.06-4.12c.05-1.07.22-1.79.46-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 015.43 2.54c.64-.24 1.36-.41 2.43-.46C8.93 2.01 9.27 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.66.3-.42.16-.71.36-1.02.67-.31.31-.5.6-.67 1.02-.12.32-.26.79-.3 1.66-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.87.18 1.34.3 1.66.16.42.36.71.67 1.02.31.31.6.5 1.02.67.32.12.79.26 1.66.3 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.66-.3.42-.16.71-.36 1.02-.67.31-.31.5-.6.67-1.02.12-.32.26-.79.3-1.66.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.87-.18-1.34-.3-1.66a2.8 2.8 0 00-.67-1.02 2.8 2.8 0 00-1.02-.67c-.32-.12-.79-.26-1.66-.3-1.05-.05-1.37-.06-4.04-.06zm0 3.06a5.14 5.14 0 110 10.28 5.14 5.14 0 010-10.28zm0 1.8a3.34 3.34 0 100 6.68 3.34 3.34 0 000-6.68zm5.34-1.99a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
    ),
  },
  {
    label: 'X (Twitter)',
    href: '#',
    icon: (
      <path d="M18.24 3H21l-6.55 7.49L22.2 21h-6.16l-4.83-6.32L5.6 21H2.83l7.01-8.02L1.8 3h6.32l4.37 5.78L18.24 3zm-1.08 16.17h1.71L7.92 4.74H6.08l11.08 14.43z" />
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.56 9.38.56 9.38.56s7.5 0 9.38-.56a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z" />
    ),
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="w-[95%] max-w-none mx-auto py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
         <div className="flex items-center mb-4">
            <img
              src={LOGO_SRC}
              alt={LOGO_ALT}
              className="h-20 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nepal&apos;s complete health facilitator &mdash; doctors, diagnostics, medicines, and emergency
            services, all in one place.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                {...(social.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Policies</h4>
          <ul className="space-y-2.5 text-sm">
            {POLICY_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Get in Touch</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="tel:+97714440000" className="hover:text-white transition-colors">
                +977-1-4440000
              </a>
            </li>
            <li>
              <a href="mailto:support@ZENIVA.com" className="hover:text-white transition-colors">
                support@ZENIVA.com
              </a>
            </li>
            <li className="text-slate-400">Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="w-[95%] max-w-none mx-auto py-5 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Zeniva Health Care. All rights reserved.</span>
          <span>Made for a healthier Nepal.</span>
        </div>
      </div>
    </footer>
  );
}

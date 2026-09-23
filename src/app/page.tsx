'use client';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useApi } from '@/hooks/useApi';
import { useMagnetic, usePointerParallax } from '@/hooks/useMotion';
import { blogApi, hospitalApi, mediaUrl, packageApi } from '@/lib/api';
import { Blog, HealthPackage, Hospital } from '@/types';
import { BlogCard } from '@/components/marketing/BlogCard';
import { RichTextContent } from '@/components/ui/RichTextEditor';
import { cn } from '@/lib/utils';

type SearchCategory = 'doctor' | 'test' | 'medicine';

const SEARCH_ROUTES: Record<SearchCategory, string> = {
  doctor: '/book-doctor',
  test: '/book-diagnostics',
  medicine: '/buy-medicines',
};

const FEATURED_SERVICES = [
  {
    title: 'Doctor Consultation',
    description: 'Find specialists by name, specialty, or location and book a slot in minutes.',
    href: '/book-doctor',
    color: 'text-primary bg-gradient-to-br from-primary-light to-primary/5',
    accent: 'border-l-primary',
    glow: 'hover:shadow-primary/15',
    icon: (
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" stroke="none" d="M5 3C3.89543 3 3 3.89543 3 5V10C3 12.3637 4.74893 14.2266 7 14.8094V16C7 16.3701 7.2011 16.6933 7.5 16.8662V17.1413C7.5 19.2724 9.2276 21 11.3587 21C13.4898 21 15.2174 19.2724 15.2174 17.1413V16.1413C15.2174 15.2348 15.9522 14.5 16.8587 14.5C17.4651 14.5 17.9947 14.8289 18.2789 15.318C17.5157 15.746 17 16.5628 17 17.5C17 18.8807 18.1193 20 19.5 20C20.8807 20 22 18.8807 22 17.5C22 16.4231 21.3191 15.5053 20.3644 15.1535C19.9339 13.6224 18.5274 12.5 16.8587 12.5C14.8477 12.5 13.2174 14.1303 13.2174 16.1413V17.1413C13.2174 18.1678 12.3852 19 11.3587 19C10.3322 19 9.5 18.1678 9.5 17.1413V16.8662C9.7989 16.6933 10 16.3701 10 16V14.8094C12.2511 14.2266 14 12.3637 14 10V5C14 3.89543 13.1046 3 12 3H11C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H12V10C12 11.5494 10.547 13 8.5 13C6.45302 13 5 11.5494 5 10V5H6C6.55228 5 7 4.55228 7 4C7 3.44772 6.55228 3 6 3H5ZM19.5 18C19.7761 18 20 17.7761 20 17.5C20 17.2239 19.7761 17 19.5 17C19.2239 17 19 17.2239 19 17.5C19 17.7761 19.2239 18 19.5 18Z" />
    ),
  },
  {
    title: 'Diagnostics & Lab Tests',
    description: 'Book MRI, CT scans, ultrasounds, and lab work with prescription upload support.',
    href: '/book-diagnostics',
    color: 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-500/5',
    accent: 'border-l-emerald-500',
    glow: 'hover:shadow-emerald-500/15',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
  },
  {
    title: 'e-Pharmacy',
    description: 'Order prescription drugs, OTC products, and supplements with home delivery.',
    href: '/buy-medicines',
    color: 'text-primary bg-gradient-to-br from-primary-light to-primary/5',
    accent: 'border-l-primary',
    glow: 'hover:shadow-primary/15',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2a1 1 0 00-1 1v2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9zm1 7a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H8a1 1 0 110-2h2V9z" />
    ),
  },
  {
    title: 'Ambulance Service',
    description: 'Locate the nearest verified ambulance and call for emergency dispatch instantly.',
    href: '/health-directory',
    color: 'text-red-500 bg-gradient-to-br from-red-50 to-red-500/5',
    accent: 'border-l-red-500',
    glow: 'hover:shadow-red-500/15',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    title: 'Hospital Directory',
    description: 'Browse our network of partner hospitals and clinics across every district.',
    href: '/health-directory',
    color: 'text-secondary bg-gradient-to-br from-secondary/10 to-secondary/5',
    accent: 'border-l-secondary',
    glow: 'hover:shadow-secondary/15',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    title: 'Health Records',
    description: 'Keep your medical history in one place and share it securely with your doctor.',
    href: '/login',
    color: 'text-primary bg-gradient-to-br from-primary-light to-primary/5',
    accent: 'border-l-primary',
    glow: 'hover:shadow-primary/15',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Choose',
    description: 'Find the right doctor, diagnostic test, or medicine from our verified network.',
  },
  {
    step: '02',
    title: 'Book & Confirm',
    description: 'Pick a convenient slot or place your order, and get instant confirmation.',
  },
  {
    step: '03',
    title: 'Get Care',
    description: 'Visit your appointment, receive your results, or get your delivery — all tracked in one place.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'I booked my father’s cardiology appointment in under two minutes. No more standing in line at the hospital counter.',
    name: 'Aarati Shrestha',
    location: 'Kathmandu',
  },
  {
    quote: 'The ambulance directory helped us reach emergency help fast when every second counted.',
    name: 'Bikash Tamang',
    location: 'Pokhara',
  },
  {
    quote: 'As a doctor, managing my slots and patient bookings from one dashboard has saved me hours every week.',
    name: 'Dr. Sunita Rai',
    location: 'Lalitpur',
  },
];



function SectionGlow({ flip = false }: { flip?: boolean }) {
  return (
    <>
      <div
        className={cn(
          'absolute -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-70',
          flip ? '-right-20 bg-secondary/10' : '-left-20 bg-primary/10'
        )}
      />
      <div
        className={cn(
          'absolute -bottom-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-70',
          flip ? '-left-20 bg-primary/10' : '-right-20 bg-secondary/10'
        )}
      />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HERO BLOCK — REPLACE in app/page.tsx (the home page file)

   Replace everything from `const SEARCH_PLACEHOLDERS` down to the closing
   brace of `function HeroSection() { ... }` (the line just before
   `const WHY_CHOOSE_US = [`) with the code below.

   It contains, in order: search data, HeroSearchBar, hero icons, HERO_STATS,
   HERO_TRUST_POINTS, useInView (other sections use it, so it stays here),
   helpers, HeroStatValue, HeroDoctor, HeroFloatingCard, HeroSection.

   Needs the two imports listed in the instructions (FloatingNavbar and
   useMagnetic / usePointerParallax). Everything else already imported is reused.
   ════════════════════════════════════════════════════════════════════════ */

const SEARCH_PLACEHOLDERS: Record<SearchCategory, string> = {
  doctor: 'Search by doctor, specialty or hospital',
  test: 'Search MRI, CT scan, blood test...',
  medicine: 'Search medicines and supplements...',
};

const SEARCH_SUGGESTIONS: Record<SearchCategory, string[]> = {
  doctor: ['Cardiologist', 'Dermatologist', 'Pediatrician'],
  test: ['MRI scan', 'Blood test', 'Ultrasound'],
  medicine: ['Paracetamol', 'Vitamin D', 'Multivitamin'],
};

// CSS-variable helpers. Delays and pointer parallax are set through inline styles,
// while the keyframes themselves live in the <style> block inside HeroSection.
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

// Reads --mx / --my (set by usePointerParallax on the hero) so every layer moves at its own depth
const parallax = (x: number, y: number): React.CSSProperties => ({
  transform: `translate3d(calc(var(--mx, 0) * ${x}px), calc(var(--my, 0) * ${y}px), 0)`,
});

function HeroSearchBar() {
  const router = useRouter();
  const [category, setCategory] = useState<SearchCategory>('doctor');
  const [query, setQuery] = useState('');

  const goTo = (term: string) => {
    const q = term.trim();
    router.push(`${SEARCH_ROUTES[category]}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    goTo(query);
  };

  const categories: { id: SearchCategory; label: string }[] = [
    { id: 'doctor', label: 'Doctor' },
    { id: 'test', label: 'Test' },
    { id: 'medicine', label: 'Medicine' },
  ];

  const activeIndex = categories.findIndex((c) => c.id === category);

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSearch}
        className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/25 ring-1 ring-white/40 transition-[transform,box-shadow] duration-300 ease-out focus-within:scale-[1.015] focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.25),0_25px_50px_-12px_rgba(0,0,0,0.4)] motion-reduce:transition-none motion-reduce:focus-within:scale-100"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div role="tablist" aria-label="Search category" className="relative grid shrink-0 grid-cols-3 rounded-xl bg-slate-100 p-1">
            {/* Sliding highlight behind the active tab */}
            <span
              aria-hidden="true"
              className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  'relative z-10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  category === c.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[category]}
              aria-label={SEARCH_PLACEHOLDERS[category]}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <Button type="submit" size="md">
            Search
          </Button>
        </div>
      </form>

      {/* Re-keyed per category so the suggestions re-enter each time the tab changes */}
      <div key={category} className="mt-3 flex flex-wrap items-center gap-2">
        <span className="hero-reveal text-xs font-medium text-white/60" style={delay(0)}>
          Popular searches
        </span>
        {SEARCH_SUGGESTIONS[category].map((term, i) => (
          <button
            key={term}
            type="button"
            onClick={() => goTo(term)}
            className="hero-reveal rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={delay(60 + i * 70)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Hero — icons, data, hooks
   ──────────────────────────────────────────────────────────────────────── */

const HERO_ICONS: Record<string, React.ReactNode> = {
  shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  building: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
  mapPin: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2C20 17.5 12 22 12 22zM12 13a3 3 0 100-6 3 3 0 000 6z"
    />
  ),
  check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 6L9 17l-5-5" />,
  clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />,
  truck: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
    />
  ),
};

function HeroIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      {HERO_ICONS[name]}
    </svg>
  );
}

const HERO_STATS = [
  { label: 'Partner hospitals', value: '50+', icon: 'building' },
  { label: 'Verified doctors', value: '300+', icon: 'shield' },
  { label: 'Districts covered', value: '77', icon: 'mapPin' },
  { label: 'Emergency response', value: '24/7', icon: 'heart' },
];

const HERO_TRUST_POINTS = ['Verified providers', 'Instant confirmation', 'Secure records'];

// Drop a transparent-background PNG of a doctor at public/images/hero-doctor.png and it appears
// on the right of the hero automatically. If the file is missing, nothing renders and nothing breaks.
const HERO_DOCTOR_SRC = '/images/hero-doctor.png';

const HERO_KEYFRAMES = `
  @keyframes hero-fade-up { from { opacity: 0; transform: translateY(18px); } }
  @keyframes hero-line-up { from { transform: translateY(105%); } }
  @keyframes hero-draw { from { stroke-dashoffset: 1; } }
  @keyframes hero-fill { from { transform: scaleX(0); } }
  @keyframes hero-card-in { from { opacity: 0; transform: translateY(26px) scale(0.95); } }
  @keyframes hero-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

  .hero-reveal { animation: hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) both; }
  .hero-line { animation: hero-line-up 0.95s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) both; }
  .hero-draw { stroke-dasharray: 1; stroke-dashoffset: 0; animation: hero-draw var(--dur, 1s) ease-out var(--d, 0ms) both; }
  .hero-fill { animation: hero-fill 1.2s ease-out var(--d, 0ms) both; }
  .hero-card-in { animation: hero-card-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) both; }
  .hero-float { animation: hero-float 7s ease-in-out var(--fd, 0s) infinite; }

  /* Every element rests in its finished state, so switching animation off just shows the final layout */
  @media (prefers-reduced-motion: reduce) {
    .hero-reveal, .hero-line, .hero-draw, .hero-fill, .hero-card-in, .hero-float { animation: none !important; }
  }
`;

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// Counts up to the number in `value` (e.g. "300+") once `active`. Writes to the DOM directly,
// so the count never causes a React re-render. Non-numeric values such as "24/7" stay as they are.
function HeroStatValue({ value, active, startDelay = 800 }: { value: string; active: boolean; startDelay?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^(\d+)(.*)$/);
    if (!el || !match || !active) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const end = Number(match[1]);
    const suffix = match[2];
    const duration = 1400;
    const start = performance.now() + startDelay;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(end * eased)}${suffix}`;
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, active, startDelay]);

  return <span ref={ref}>{value}</span>;
}

function HeroDoctor() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  // The image may finish loading before React attaches onLoad, so check it once after mount
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'ready' : 'missing');
  }, []);

  if (status === 'missing') return null;

  const ready = status === 'ready';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-end will-change-transform" style={parallax(18, 10)}>
      {/* Warm and cool glows behind the person so the photo feels lit by the site's palette */}
      <span className="absolute bottom-0 right-10 h-3/4 w-3/4 rounded-full bg-primary/20 blur-3xl" />
      <span className="absolute right-0 top-10 h-1/2 w-1/2 rounded-full bg-secondary/20 blur-3xl" />

      <div
        className="relative h-[98%] transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateX(0)' : 'translateX(40px)',
          transitionDelay: '500ms',
          WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
        }}
      >
        <img
          ref={imgRef}
          src={HERO_DOCTOR_SRC}
          alt="A verified Zeniva doctor"
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('missing')}
          className="h-full w-auto max-w-none object-contain object-bottom"
        />
      </div>
    </div>
  );
}

// Three nested layers so the transforms never fight: parallax (outer) -> entrance (middle) -> idle float (inner)
function HeroFloatingCard({
  className,
  depth,
  enterDelay,
  floatDelay,
  children,
}: {
  className: string;
  depth: number;
  enterDelay: number;
  floatDelay: number;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('absolute will-change-transform', className)} style={parallax(depth, depth * 0.75)}>
      <div className="hero-card-in" style={delay(enterDelay)}>
        <div className="hero-float" style={{ '--fd': `${floatDelay}s` } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  );
}

const HERO_GLASS_CARD = 'rounded-2xl border border-white/40 bg-white/85 shadow-xl shadow-black/15 backdrop-blur-xl';

/* ────────────────────────────────────────────────────────────────────────
   Hero section
   ──────────────────────────────────────────────────────────────────────── */

function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>(0.3);
  const primaryCta = useMagnetic<HTMLAnchorElement>(0.3, 8);
  const secondaryCta = useMagnetic<HTMLAnchorElement>(0.3, 8);

  // Publishes --mx / --my so the background, doctor and floating cards drift at different depths
  usePointerParallax<HTMLElement>(heroRef);

  return (
    // z-10 lifts the hero above the next section, so the stats bar can overlap the seam between them
    <section ref={heroRef} className="relative isolate z-10">
      <style>{HERO_KEYFRAMES}</style>

      {/* ── Backdrop: photo, overlays, atmosphere ─────────────────── */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#06222e]">
        <div className="absolute -inset-6 will-change-transform" style={parallax(-24, -16)}>
          <img
            src="/images/Online.jpeg"
            alt="Zeniva Health Care — connecting patients and doctors through telemedicine"
            className="h-full w-full object-cover animate-kenburns motion-reduce:animate-none"
          />
        </div>

        {/* Legibility: heavy on the copy side, open on the photo side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06222e]/95 via-[#06222e]/70 to-[#06222e]/25" />
        {/* Keeps the floating navbar readable over any photo */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#06222e]/70 to-transparent" />

        {/* Brand-coloured atmosphere */}
        <div className="animate-glow-pulse absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl motion-reduce:animate-none" />
        <div
          className="animate-glow-pulse absolute -top-10 right-0 h-96 w-96 rounded-full bg-secondary/25 blur-3xl motion-reduce:animate-none"
          style={{ animationDelay: '2s' }}
        />

        {/* Heartbeat line that draws itself once on load */}
        <svg
          aria-hidden="true"
          className="absolute bottom-40 right-0 hidden h-24 w-[62%] text-white/25 lg:block"
          viewBox="0 0 600 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 60H150L175 60L195 20L220 100L245 35L262 60H340L360 60L378 42L396 78L414 60H600"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            className="hero-draw"
            style={{ '--d': '1200ms', '--dur': '2.4s' } as React.CSSProperties}
          />
        </svg>

        {/* Fades the photo into the next section's background colour */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-tertiary to-transparent" />
      </div>

      {/* ── Content grid: copy | doctor + cards, stats bar below ──── */}
      <div className="relative mx-auto grid min-h-[680px] w-[95%] max-w-none grid-cols-1 grid-rows-[1fr_auto] lg:min-h-[780px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-8">
        {/* Left: copy + search */}
        <div className="flex max-w-2xl flex-col justify-center pb-16 pt-28 lg:pb-20 lg:pt-32">
          <span
            className="hero-reveal inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md"
            style={delay(0)}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Nepal&apos;s complete health facilitator
          </span>

          <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl 2xl:text-[5rem]">
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
              <span className="hero-line block" style={delay(140)}>
                Your health,
              </span>
            </span>
            <span className="relative block w-fit">
              <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <span className="hero-line block text-primary" style={delay(260)}>
                  one platform away.
                </span>
              </span>
              {/* Underline that draws itself after the headline lands */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 left-0 h-[0.28em] w-full text-primary/90"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 8C60 2 140 12 298 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                  className="hero-draw"
                  style={delay(1000)}
                />
              </svg>
            </span>
          </h1>

          <p className="hero-reveal mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg" style={delay(420)}>
            Book trusted doctors, schedule diagnostics, order medicines, and reach emergency services
            &mdash; all from a single, secure portal built for Nepal.
          </p>

          <div className="hero-reveal mt-8" style={delay(540)}>
            <HeroSearchBar />
          </div>

          <div className="hero-reveal mt-6 flex flex-wrap gap-3" style={delay(660)}>
            <Link
              ref={primaryCta}
              href="/book-doctor"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Book a doctor
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              ref={secondaryCta}
              href="/book-diagnostics"
              className="group inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-[background-color,border-color] duration-200 hover:border-white/60 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Book diagnostics
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {HERO_TRUST_POINTS.map((point, i) => (
              <li
                key={point}
                className="hero-reveal flex items-center gap-2 text-sm font-medium text-white/80"
                style={delay(780 + i * 90)}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  <HeroIcon name="check" className="h-2.5 w-2.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right (desktop only): doctor + floating status cards */}
        <div className="relative hidden lg:block">
          <HeroDoctor />

          <div aria-hidden="true">
            {/* Appointment status */}
            <HeroFloatingCard className="left-0 top-[26%]" depth={34} enterDelay={900} floatDelay={0}>
              <div className={cn(HERO_GLASS_CARD, 'w-64 p-4')}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-extrabold text-white shadow-sm">
                    AS
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">Dr. Aarav Sharma</p>
                    <p className="text-xs text-slate-500">Cardiologist · Today, 2:00 PM</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <HeroIcon name="check" className="h-3 w-3" />
                    Booking confirmed
                  </span>
                  <span className="text-slate-400">ZNV-2048</span>
                </div>

                <div className="mt-3">
                  <div className="relative h-[3px] rounded-full bg-slate-200">
                    <span
                      className="hero-fill absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ ...delay(1900), transform: 'scaleX(0.5)' }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span className="text-primary">Booked</span>
                    <span>Visit</span>
                    <span>Results</span>
                  </div>
                </div>
              </div>
            </HeroFloatingCard>

            {/* Verified doctors */}
            <HeroFloatingCard className="right-0 top-[8%]" depth={-28} enterDelay={1100} floatDelay={1.2}>
              <div className={cn(HERO_GLASS_CARD, 'flex items-center gap-3 px-4 py-3')}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <HeroIcon name="shield" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">300+ verified doctors</p>
                  <p className="text-xs text-slate-500">Across 77 districts</p>
                </div>
              </div>
            </HeroFloatingCard>

            {/* Emergency */}
            <HeroFloatingCard className="bottom-[14%] right-[6%]" depth={22} enterDelay={1300} floatDelay={2.4}>
              <div className={cn(HERO_GLASS_CARD, 'flex items-center gap-2.5 px-3.5 py-2.5')}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-xs font-bold text-slate-700">24/7 ambulance directory</span>
              </div>
            </HeroFloatingCard>
          </div>
        </div>

        {/* Stats bar: straddles the bottom edge of the hero */}
        <div className="col-span-full translate-y-1/2">
          <div ref={statsRef} className="hero-reveal" style={delay(720)}>
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-slate-100 lg:grid-cols-4">
              {HERO_STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={cn(
                    'group flex items-center gap-3 border-slate-100 px-4 py-4 transition-colors duration-200 hover:bg-slate-50 sm:px-6',
                    index % 2 === 0 && 'border-r',
                    index < 2 && 'border-b lg:border-b-0',
                    index < 3 && 'lg:border-r'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                      index % 2 === 0 ? 'bg-primary-light text-primary' : 'bg-secondary/10 text-secondary'
                    )}
                  >
                    <HeroIcon name={stat.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold leading-none tabular-nums text-slate-800 sm:text-2xl">
                      <HeroStatValue value={stat.value} active={statsInView} />
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
const WHY_CHOOSE_US = [
  {
    title: 'Verified Providers Only',
    description: 'Every doctor, hospital, and lab on Zeniva is vetted before they can accept bookings.',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Book in Minutes',
    description: 'Skip the phone queue — search, pick a slot, and get instant confirmation.',
    icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
  },
  {
    title: 'Your Data, Protected',
    description: 'Health records and bookings are kept on a secure, encrypted portal.',
    icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  },
  {
    title: 'Support When It Matters',
    description: 'Our team and ambulance directory are reachable around the clock.',
    icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-3.5a1.5 1.5 0 00-1.24-1.475l-4-.727a1.5 1.5 0 00-1.517.727l-.855 1.518a11.25 11.25 0 01-5.176-5.176l1.518-.855a1.5 1.5 0 00.727-1.517l-.727-4A1.5 1.5 0 007.75 2.25h-3.5a1.5 1.5 0 00-1.5 1.5v3z',
  },
];

function useTypewriter(text: string, active: boolean, speed = 26) {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!active) return;
    setOutput('');
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [active, text, speed]);

  return output;
}

function WhyCard({ item, index }: { item: (typeof WHY_CHOOSE_US)[number]; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const isPrimary = index % 2 === 0;
  const accent = isPrimary
    ? { chip: 'bg-primary-light text-primary', bar: 'bg-primary', glow: 'rgba(249,115,22,0.22)' }
    : { chip: 'bg-secondary/10 text-secondary', bar: 'bg-secondary', glow: 'rgba(56,189,248,0.22)' };

  // Each column enters from a slightly different direction
  const entranceX = [-32, -14, 14, 32][index % 4];
  const entranceRotate = index % 2 === 0 ? -5 : 5;

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), index * 110 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTilt({ rx: y * -10, ry: x * 10, ix: x * 14, iy: y * 14 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          : `translate(${entranceX}px, 40px) scale(0.88) rotate(${entranceRotate}deg)`,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }, box-shadow 0.2s ease-out`,
        transitionDelay: !settled && inView ? `${index * 110}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(180px circle at ${spot.x}% ${spot.y}%, ${accent.glow}, transparent 70%)`,
        }}
      />

      <div
        className={cn(
          'relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-150 ease-out',
          accent.chip
        )}
        style={{ transform: `translate(${tilt.ix}px, ${tilt.iy}px) scale(${spot.active ? 1.12 : 1})` }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
        </svg>
      </div>

      <h3 className="relative text-base font-bold text-slate-800">{item.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>

      {/* Accent bar that grows in on hover */}
      <span
        className={cn(
          'absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
          accent.bar
        )}
      />
    </div>
  );
}

function WhyChooseUsSection() {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);

  const title = 'Built for trust, made for speed';
  const typedTitle = useTypewriter(title, headerInView, 26);
  const doneTyping = typedTitle.length === title.length;

  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            Why Zeniva
          </span>

          <h2 className="mt-2 min-h-[2.4em] text-3xl font-bold text-slate-800 tracking-tight sm:min-h-[1.2em]">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 text-slate-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            The essentials you&apos;d expect from a platform handling your family&apos;s health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US.map((item, index) => (
            <WhyCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

// Spotlight and accent-bar colours, derived from each service's existing accent class
function getServiceTheme(accent: string) {
  if (accent.includes('emerald')) return { glow: 'rgba(16,185,129,0.20)', bar: 'bg-emerald-500' };
  if (accent.includes('red')) return { glow: 'rgba(239,68,68,0.20)', bar: 'bg-red-500' };
  if (accent.includes('secondary')) return { glow: 'rgba(56,189,248,0.22)', bar: 'bg-secondary' };
  return { glow: 'rgba(249,115,22,0.22)', bar: 'bg-primary' };
}

function ServiceCard({
  service,
  index,
  reduceMotion,
}: {
  service: (typeof FEATURED_SERVICES)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const { ref, inView } = useInView<HTMLAnchorElement>(0.2);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const theme = getServiceTheme(service.accent);
  const isEmergency = service.accent.includes('red');

  // 3-column layout: left card slides from the left, right from the right, middle rises
  const col = index % 3;
  const entranceX = [-36, 0, 36][col];
  const entranceY = col === 1 ? 48 : 34;
  const entranceRotate = [-5, 0, 5][col];

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), index * 100 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTilt({ rx: y * -8, ry: x * 8, ix: x * 12, iy: y * 12 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  const enteredTransform = reduceMotion
    ? 'none'
    : `perspective(800px) translateY(${spot.active ? -4 : 0}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
  const hiddenTransform = reduceMotion
    ? 'none'
    : `translate(${entranceX}px, ${entranceY}px) scale(0.9) rotate(${entranceRotate}deg)`;

  return (
    <Link
      ref={ref}
      href={service.href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex items-start gap-4 overflow-hidden rounded-xl border border-slate-100 border-l-4 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-xl',
        service.accent,
        service.glow
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? enteredTransform : hiddenTransform,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }, box-shadow 0.2s ease-out`,
        transitionDelay: !settled && inView ? `${index * 100}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(220px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
        }}
      />

      {/* Diagonal shine sweep on hover */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />

      {/* Faint index number */}
      <span className="pointer-events-none absolute right-4 top-3 text-xs font-bold tabular-nums text-slate-200 transition-colors duration-300 group-hover:text-slate-300">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Icon chip with a soft ring that expands on hover */}
      <div
        className={cn(
          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 ease-out',
          service.color
        )}
        style={{ transform: `translate(${tilt.ix}px, ${tilt.iy}px) scale(${spot.active ? 1.12 : 1})` }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-current opacity-0 transition-all duration-500 ease-out group-hover:scale-125 group-hover:opacity-20" />
        <svg className="relative h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {service.icon}
        </svg>
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-6">
          <h3 className="text-base font-bold text-slate-800 transition-colors group-hover:text-primary">
            {service.title}
          </h3>
          {isEmergency && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              Emergency
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">{service.description}</p>

        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
          Explore
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </span>
      </div>

      {/* Accent bar that grows in along the bottom on hover */}
      <span
        className={cn(
          'absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
          theme.bar
        )}
      />
    </Link>
  );
}

function FeaturedServicesSection() {
  const reduceMotion = usePrefersReducedMotion();
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);

  const title = 'Featured Services';
  const typedTitle = useTypewriter(title, headerInView, 30);
  const doneTyping = typedTitle.length === title.length;

  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            What we offer
          </span>

          <h2 className="mt-2 min-h-[1.2em] text-3xl font-bold text-slate-800 tracking-tight">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 text-slate-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            Everything you need for your family&apos;s health, organized in one place.
          </p>

          {/* Underline that draws in once the title finishes typing */}
          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVICES.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   How It Works — data
   ──────────────────────────────────────────────────────────────────────── */

const HOW_STEP_DURATION = 4500;

const HOW_DOCTORS = [
  { name: 'Dr. Aarav Sharma', spec: 'Cardiologist', rating: '4.9', when: 'Today', initials: 'AS', tone: 'from-primary to-secondary' },
  { name: 'Dr. Meera Joshi', spec: 'Cardiologist', rating: '4.8', when: 'Tomorrow', initials: 'MJ', tone: 'from-secondary to-primary' },
  { name: 'Dr. Prakash Thapa', spec: 'Cardiologist', rating: '4.8', when: 'Today', initials: 'PT', tone: 'from-primary to-secondary' },
];

const HOW_NAV = [
  { label: 'Home', d: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { label: 'Doctors', d: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z' },
  { label: 'Bookings', d: 'M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
  { label: 'Records', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

// Floating notification shown next to the phone for each step
const HOW_TOASTS = [
  {
    title: 'Doctors found',
    body: '12 verified cardiologists nearby',
    icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
  },
  {
    title: 'Slot reserved',
    body: 'Your time is held for you',
    icon: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
  },
  {
    title: 'Confirmation sent',
    body: 'SMS and email delivered instantly',
    icon: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
];

const HOW_CONFETTI = [
  { tx: -78, ty: -58, c: 'bg-primary', delay: 0 },
  { tx: -52, ty: -84, c: 'bg-secondary', delay: 40 },
  { tx: -18, ty: -96, c: 'bg-amber-400', delay: 80 },
  { tx: 22, ty: -92, c: 'bg-emerald-400', delay: 20 },
  { tx: 56, ty: -80, c: 'bg-primary', delay: 60 },
  { tx: 84, ty: -50, c: 'bg-secondary', delay: 100 },
  { tx: -88, ty: -14, c: 'bg-emerald-400', delay: 30 },
  { tx: 90, ty: -10, c: 'bg-amber-400', delay: 70 },
  { tx: -66, ty: 30, c: 'bg-secondary', delay: 50 },
  { tx: 68, ty: 34, c: 'bg-primary', delay: 90 },
  { tx: -30, ty: 52, c: 'bg-amber-400', delay: 10 },
  { tx: 34, ty: 50, c: 'bg-emerald-400', delay: 110 },
];

// 5x5 decorative code pattern for the appointment ticket
const HOW_QR = [1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1];

/* ────────────────────────────────────────────────────────────────────────
   How It Works — helpers
   ──────────────────────────────────────────────────────────────────────── */

// Turns true `delay` ms after `flag` becomes true, and false immediately when `flag` goes false
function useDelayedFlag(flag: boolean, delay: number) {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delay);
    return () => clearTimeout(timer);
  }, [flag, delay]);

  return delayed;
}

// Finger-tap ripple. The parent element must be `relative`.
function HowTap({ show, className = 'bg-primary/30' }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <span
        className={cn('hiw-decor h-10 w-10 rounded-full', className)}
        style={{ animation: 'hiw-tap 0.9s ease-out forwards' }}
      />
    </span>
  );
}

function HowAvatar({ initials, tone, size = 'h-9 w-9' }: { initials: string; tone: string; size?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-extrabold text-white shadow-sm',
        size,
        tone
      )}
    >
      {initials}
    </span>
  );
}

function HowVerifiedTick({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg className={cn('text-emerald-500', className)} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HowScreenShell({
  index,
  activeStep,
  reduceMotion,
  children,
}: {
  index: number;
  activeStep: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const isActive = index === activeStep;
  const direction = index < activeStep ? -1 : 1;

  return (
    <div
      aria-hidden={!isActive}
      className="absolute inset-x-0 bottom-14 top-[68px] overflow-hidden px-3.5 pt-2"
      style={{
        opacity: isActive ? 1 : 0,
        transform: reduceMotion || isActive ? 'none' : `translateX(${direction * 32}px) scale(0.96)`,
        filter: reduceMotion || isActive ? 'none' : 'blur(3px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease',
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   How It Works — phone screens
   ──────────────────────────────────────────────────────────────────────── */

function HowSearchScreen({ active }: { active: boolean }) {
  const typed = useTypewriter('Cardiologist', active, 70);
  const typing = active && typed.length < 'Cardiologist'.length;
  const showResults = useDelayedFlag(active, 1100);
  const pick = useDelayedFlag(active, 2500);

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Find care</p>
      <p className="mt-0.5 text-[15px] font-extrabold text-slate-800">Find a specialist</p>

      <div className="mt-2.5 flex gap-1.5">
        {['Doctor', 'Test', 'Medicine'].map((label, i) => (
          <span
            key={label}
            className={cn(
              'rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider',
              i === 0 ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-slate-100 text-slate-400'
            )}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className={cn(
          'mt-2.5 flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm transition-all duration-300',
          typing ? 'border-primary/40 ring-4 ring-primary/10' : 'border-slate-200'
        )}
      >
        <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <span className="min-h-[1.25em] text-xs font-medium text-slate-700">
          {typed}
          <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-primary" />
        </span>
      </div>

      <p
        className="mt-2.5 text-[10px] font-semibold text-slate-400 transition-opacity duration-500"
        style={{ opacity: showResults ? 1 : 0 }}
      >
        12 verified doctors nearby
      </p>

      <div className="mt-1.5 space-y-2">
        {HOW_DOCTORS.map((doc, i) => {
          const picked = pick && i === 0;
          return (
            <div
              key={doc.name}
              className={cn(
                'relative flex items-center gap-2.5 rounded-xl border bg-white p-2 shadow-sm',
                picked ? 'border-primary/50 ring-2 ring-primary/15' : 'border-slate-100'
              )}
              style={{
                opacity: showResults ? 1 : 0,
                transform: showResults ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.3s, border-color 0.3s',
                transitionDelay: showResults ? `${i * 120}ms` : '0ms',
              }}
            >
              <HowAvatar initials={doc.initials} tone={doc.tone} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-[11px] font-bold text-slate-800">{doc.name}</span>
                  <HowVerifiedTick className="h-3 w-3 shrink-0" />
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                  <span>{doc.spec}</span>
                  <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 15.27l-5.18 3.05 1.4-5.93L1.6 8.4l6.06-.5L10 2.3l2.34 5.6 6.06.5-4.62 3.99 1.4 5.93z" />
                    </svg>
                    {doc.rating}
                  </span>
                  <span>· {doc.when}</span>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-[9px] font-bold transition-colors duration-300',
                  picked ? 'bg-primary text-white' : 'bg-primary-light text-primary'
                )}
              >
                Book
              </span>
              <HowTap show={picked} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HowBookScreen({ active }: { active: boolean }) {
  const pickDay = useDelayedFlag(active, 700);
  const pickSlot = useDelayedFlag(active, 1400);
  const ready = useDelayedFlag(active, 1900);
  const press = useDelayedFlag(active, 2500);
  const confirmed = useDelayedFlag(active, 3000);

  const days = [
    { d: 'Sun', n: '14' },
    { d: 'Mon', n: '15' },
    { d: 'Tue', n: '16' },
    { d: 'Wed', n: '17' },
    { d: 'Thu', n: '18' },
  ];
  const slots = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Book &amp; confirm</p>
      <p className="mt-0.5 text-[15px] font-extrabold text-slate-800">Pick a slot</p>

      <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
        <HowAvatar initials="AS" tone="from-primary to-secondary" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-bold text-slate-800">Dr. Aarav Sharma</div>
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            Cardiologist
            <HowVerifiedTick className="h-2.5 w-2.5" />
            Verified
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
      <div className="mt-1.5 grid grid-cols-5 gap-1.5">
        {days.map((day, i) => {
          const selected = pickDay && i === 2;
          return (
            <span
              key={day.d}
              className={cn(
                'relative rounded-lg py-1.5 text-center transition-all duration-300',
                selected ? 'scale-105 bg-primary text-white shadow-md shadow-primary/30' : 'bg-white text-slate-500 shadow-sm'
              )}
            >
              <span className="block text-[8px] font-semibold uppercase opacity-80">{day.d}</span>
              <span className="block text-[12px] font-extrabold leading-tight">{day.n}</span>
              <HowTap show={selected} className="bg-white/40" />
            </span>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {slots.map((slot, i) => {
          const selected = pickSlot && i === 3;
          return (
            <span
              key={slot}
              className={cn(
                'relative rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-all duration-300',
                selected
                  ? 'border-secondary bg-secondary/10 text-secondary shadow-sm'
                  : 'border-slate-100 bg-white text-slate-500'
              )}
            >
              {slot}
              <HowTap show={selected} className="bg-secondary/30" />
            </span>
          );
        })}
      </div>

      <div
        className={cn(
          'relative mt-3.5 w-full rounded-xl py-2.5 text-center text-[11px] font-bold transition-all duration-300',
          confirmed
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
            : ready
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-slate-200 text-slate-400'
        )}
        style={{ transform: press && !confirmed ? 'scale(0.96)' : 'scale(1)' }}
      >
        {confirmed ? '\u2713 Booking confirmed' : 'Confirm booking'}
        <HowTap show={press && !confirmed} className="bg-white/40" />
      </div>
    </div>
  );
}

function HowCareScreen({ active }: { active: boolean }) {
  const drawn = useDelayedFlag(active, 300);
  const burst = useDelayedFlag(active, 600);
  const ticket = useDelayedFlag(active, 900);
  const track = useDelayedFlag(active, 1900);
  const trackSteps = ['Booked', 'Visit', 'Results'];

  return (
    <div className="flex h-full flex-col items-center text-center">
      <div className="relative h-14 w-14">
        {burst &&
          HOW_CONFETTI.map((p, i) => (
            <span
              key={i}
              className={cn('hiw-decor absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-sm', p.c)}
              style={
                {
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  animation: 'hiw-confetti 1.1s ease-out forwards',
                  animationDelay: `${p.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        <svg className="relative h-14 w-14 text-emerald-500" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" className="text-emerald-100" stroke="currentColor" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset={drawn ? 0 : 176}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out', transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
          />
          <path
            d="M20 33l8 8 16-17"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset={drawn ? 0 : 40}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out 0.6s' }}
          />
        </svg>
      </div>

      <p className="mt-2 text-[15px] font-extrabold text-slate-800">Booking confirmed</p>
      <p className="mt-0.5 text-[10px] text-slate-400">Your confirmation is sent instantly.</p>

      {/* Appointment ticket */}
      <div
        className="mt-3 w-full rounded-xl border border-slate-100 bg-white text-left shadow-md"
        style={{
          opacity: ticket ? 1 : 0,
          transform: ticket ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.96)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      >
        <div className="flex items-center gap-2.5 p-2.5">
          <HowAvatar initials="AS" tone="from-primary to-secondary" size="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold text-slate-800">Dr. Aarav Sharma</div>
            <div className="text-[9px] text-slate-400">Cardiologist · Tue, 2:00 PM</div>
          </div>
        </div>
        <div className="border-t border-dashed border-slate-200" />
        <div className="flex items-center justify-between p-2.5">
          <div>
            <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Reference</div>
            <div className="text-[11px] font-extrabold tracking-wider text-slate-700">ZNV-2048</div>
          </div>
          <div className="grid grid-cols-5 gap-[2px] rounded-md bg-slate-50 p-1">
            {HOW_QR.map((on, i) => (
              <span key={i} className={cn('h-[5px] w-[5px] rounded-[1px]', on ? 'bg-slate-700' : 'bg-transparent')} />
            ))}
          </div>
        </div>
      </div>

      {/* Care tracker */}
      <div className="mt-3 w-full rounded-xl border border-slate-100 bg-white p-2.5 text-left shadow-sm">
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Track your care</p>
        <div className="relative mt-2.5 flex justify-between">
          <span className="absolute left-3 right-3 top-[7px] h-[2px] bg-slate-100" />
          <span
            className="absolute left-3 right-3 top-[7px] h-[2px] origin-left bg-gradient-to-r from-primary to-secondary"
            style={{ transform: track ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 1s ease-out' }}
          />
          {trackSteps.map((label, i) => (
            <div key={label} className="relative flex flex-col items-center gap-1">
              <span
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2 border-white shadow transition-colors duration-500',
                  track || i === 0 ? 'bg-primary' : 'bg-slate-200'
                )}
                style={{ transitionDelay: track ? `${i * 350}ms` : '0ms' }}
              />
              <span className="text-[9px] font-semibold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   How It Works — section
   ──────────────────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const reduceMotion = usePrefersReducedMotion();
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);
  const { ref: gridRef, inView: gridInView } = useInView<HTMLDivElement>(0.2);

  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const total = HOW_IT_WORKS.length;
  const autoPlaying = gridInView && !reduceMotion && !paused;
  const toast = HOW_TOASTS[activeStep] ?? HOW_TOASTS[0];
  const navActive = activeStep + 1;

  const title = 'How It Works';
  const typedTitle = useTypewriter(title, headerInView, 30);
  const doneTyping = typedTitle.length === title.length;

  // Walk through the steps automatically until the visitor hovers the steps or clicks one
  useEffect(() => {
    if (!autoPlaying || total === 0) return;
    const timer = setTimeout(() => setActiveStep((s) => (s + 1) % total), HOW_STEP_DURATION);
    return () => clearTimeout(timer);
  }, [autoPlaying, activeStep, total]);

  const reveal = (delay: number, x = 0, y = 24): React.CSSProperties => ({
    opacity: gridInView ? 1 : 0,
    transform: gridInView ? 'translate(0, 0)' : `translate(${x}px, ${y}px)`,
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
    transitionDelay: `${delay}ms`,
  });

  const handlePhoneMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: y * -8, ry: x * 10 });
  };

  const handlePhoneLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <style>{`
        @keyframes hiw-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hiw-spin { to { transform: rotate(360deg); } }
        @keyframes hiw-tap {
          0% { transform: scale(0.2); opacity: 0.9; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes hiw-confetti {
          0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(260deg); opacity: 0; }
        }
        @keyframes hiw-toast {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hiw-shine {
          0%, 55% { transform: translateX(-160%) skewX(-20deg); }
          100% { transform: translateX(420%) skewX(-20deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hiw-anim { animation: none !important; }
          .hiw-decor { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      <SectionGlow />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            Simple by design
          </span>

          <h2 className="mt-2 min-h-[1.2em] text-3xl font-bold text-slate-800 tracking-tight">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 text-slate-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            Three simple steps from searching to getting the care you need.
          </p>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />
        </div>

        <div ref={gridRef} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ── Left: step timeline (hovering here pauses autoplay) ─── */}
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <ol className="space-y-3">
              {HOW_IT_WORKS.map((item, index) => {
                const isActive = activeStep === index;
                const isDone = index < activeStep;
                const isPrimary = index % 2 === 0;
                const theme = isPrimary
                  ? { badge: 'bg-primary shadow-primary/30', ring: 'ring-primary/20', ringSoft: 'ring-primary/10', bar: 'bg-primary' }
                  : { badge: 'bg-secondary shadow-secondary/30', ring: 'ring-secondary/20', ringSoft: 'ring-secondary/10', bar: 'bg-secondary' };

                return (
                  <li key={item.step} className="relative" style={reveal(index * 120, -32, 0)}>
                    {/* Connector to the next step */}
                    {index < total - 1 && (
                      <span className="pointer-events-none absolute -bottom-7 left-10 top-16 z-0 w-[2px] -translate-x-1/2 overflow-hidden rounded-full bg-slate-200">
                        <span
                          className="block h-full w-full origin-top bg-gradient-to-b from-primary to-secondary transition-transform duration-700 ease-out"
                          style={{ transform: isDone ? 'scaleY(1)' : 'scaleY(0)' }}
                        />
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={cn(
                        'relative z-10 flex w-full items-start gap-4 rounded-2xl px-4 pb-6 pt-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        isActive ? 'bg-white shadow-lg ring-1 ring-slate-100' : 'hover:bg-white/60'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ring-4 transition-all duration-300',
                          isActive || isDone
                            ? cn('text-white shadow-md', theme.badge, isActive ? theme.ring : theme.ringSoft)
                            : 'border border-slate-200 bg-white text-slate-400 ring-slate-100'
                        )}
                        style={{ transform: isActive && !reduceMotion ? 'scale(1.08)' : 'scale(1)' }}
                      >
                        {isDone ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-lg font-bold transition-colors duration-300',
                            isActive ? 'text-slate-800' : 'text-slate-500'
                          )}
                        >
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            'mt-1 block text-sm leading-relaxed transition-colors duration-300',
                            isActive ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          {item.description}
                        </span>
                      </span>

                      {/* Progress bar for the active step */}
                      <span
                        className="absolute inset-x-4 bottom-2 h-[3px] overflow-hidden rounded-full bg-slate-100 transition-opacity duration-300"
                        style={{ opacity: isActive ? 1 : 0 }}
                      >
                        <span
                          key={`${index}-${activeStep}-${autoPlaying}`}
                          className={cn('block h-full w-full origin-left rounded-full', theme.bar)}
                          style={
                            isActive
                              ? autoPlaying
                                ? { animation: `hiw-fill ${HOW_STEP_DURATION}ms linear forwards` }
                                : { transform: 'scaleX(1)' }
                              : { transform: 'scaleX(0)' }
                          }
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3" style={reveal(500, 0, 16)}>
              <Link href="/book-doctor" className="transition-transform duration-200 hover:-translate-y-0.5">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/health-directory" className="transition-transform duration-200 hover:-translate-y-0.5">
                <Button size="lg" variant="outline">Browse Directory</Button>
              </Link>
            </div>
          </div>

          {/* ── Right: animated phone demo ──────────────────────── */}
          <div className="relative flex flex-col items-center py-6" style={reveal(200, 40, 0)}>
            <div className="relative flex items-center justify-center">
              {/* Ambient glows */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-6 bottom-6 h-56 w-56 rounded-full bg-secondary/15 blur-3xl" />

              {/* Orbiting rings */}
              <div
                className="hiw-anim pointer-events-none absolute inset-0 m-auto hidden h-[440px] w-[440px] rounded-full border-2 border-dashed border-primary/20 sm:block"
                style={reduceMotion ? undefined : { animation: 'hiw-spin 45s linear infinite' }}
              >
                <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lg shadow-primary/40" />
              </div>
              <div
                className="hiw-anim pointer-events-none absolute inset-0 m-auto hidden h-[350px] w-[350px] rounded-full border border-secondary/25 sm:block"
                style={reduceMotion ? undefined : { animation: 'hiw-spin 32s linear infinite reverse' }}
              >
                <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary shadow-lg shadow-secondary/40" />
              </div>

              {/* Contextual notification — changes with each step */}
              <div className="animate-float-slow absolute left-0 top-14 z-20 hidden sm:block lg:-left-10">
                <div
                  key={activeStep}
                  className="hiw-anim flex items-center gap-2.5 rounded-xl bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md ring-1 ring-slate-100"
                  style={reduceMotion ? undefined : { animation: 'hiw-toast 0.6s ease-out both' }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={toast.icon} />
                    </svg>
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">{toast.title}</div>
                    <div className="text-[10px] text-slate-500">{toast.body}</div>
                  </div>
                </div>
              </div>

              {/* Static trust badge */}
              <div
                className="animate-float-slow absolute bottom-20 right-0 z-20 hidden items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-xl backdrop-blur-md ring-1 ring-slate-100 sm:flex lg:-right-8"
                style={{ animationDelay: '1.5s' }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span className="text-xs font-bold text-slate-700">Verified providers</span>
              </div>

              {/* Phone */}
              <div className={cn('relative z-10', !reduceMotion && 'animate-float-slow')}>
                <div
                  onMouseMove={handlePhoneMove}
                  onMouseLeave={handlePhoneLeave}
                  className="relative h-[540px] w-[270px] rounded-[2.6rem] border-[8px] border-slate-800 bg-slate-800 shadow-2xl shadow-primary/25 ring-1 ring-slate-600/40"
                  style={{
                    transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                >
                  {/* Side buttons */}
                  <span className="absolute -left-[11px] top-20 h-7 w-[3px] rounded-l bg-slate-700" />
                  <span className="absolute -left-[11px] top-32 h-12 w-[3px] rounded-l bg-slate-700" />
                  <span className="absolute -right-[11px] top-28 h-16 w-[3px] rounded-r bg-slate-700" />

                  {/* Screen */}
                  <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-white to-slate-50">
                    {/* Notch */}
                    <div className="absolute left-1/2 top-0 z-30 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-800" />

                    {/* Status bar */}
                    <div className="absolute inset-x-0 top-0 z-20 flex h-8 items-end justify-between px-5 pb-1 text-[10px] font-bold text-slate-700">
                      <span>9:41</span>
                      <span className="flex items-center gap-1.5">
                        <span className="flex items-end gap-[1.5px]">
                          {[4, 6, 8, 10].map((h) => (
                            <span key={h} className="w-[2px] rounded-sm bg-slate-700" style={{ height: h }} />
                          ))}
                        </span>
                        <span className="relative h-2.5 w-5 rounded-[3px] border border-slate-700">
                          <span className="absolute bottom-[1px] left-[1px] top-[1px] w-3 rounded-[1px] bg-slate-700" />
                        </span>
                      </span>
                    </div>

                    {/* App header */}
                    <div className="absolute inset-x-0 top-8 z-10 flex h-9 items-center justify-between px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white shadow-sm shadow-primary/30">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                        <span className="text-xs font-extrabold tracking-tight text-slate-800">Zeniva</span>
                      </div>
                      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
                      </span>
                    </div>

                    {/* Screens */}
                    <HowScreenShell index={0} activeStep={activeStep} reduceMotion={reduceMotion}>
                      <HowSearchScreen active={activeStep === 0} />
                    </HowScreenShell>
                    <HowScreenShell index={1} activeStep={activeStep} reduceMotion={reduceMotion}>
                      <HowBookScreen active={activeStep === 1} />
                    </HowScreenShell>
                    <HowScreenShell index={2} activeStep={activeStep} reduceMotion={reduceMotion}>
                      <HowCareScreen active={activeStep === 2} />
                    </HowScreenShell>

                    {/* Bottom navigation */}
                    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/90 px-3 pb-1.5 pt-2 backdrop-blur">
                      <div className="grid grid-cols-4">
                        {HOW_NAV.map((tab, i) => (
                          <span
                            key={tab.label}
                            className={cn(
                              'relative flex flex-col items-center gap-0.5 transition-colors duration-300',
                              navActive === i ? 'text-primary' : 'text-slate-300'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute -top-2 h-[2px] w-5 rounded-full bg-primary transition-opacity duration-300',
                                navActive === i ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.d} />
                            </svg>
                            <span className="text-[8px] font-bold">{tab.label}</span>
                          </span>
                        ))}
                      </div>
                      <div className="mx-auto mt-1.5 h-[3px] w-16 rounded-full bg-slate-300" />
                    </div>

                    {/* Glass reflection + periodic shine */}
                    <div className="pointer-events-none absolute inset-0 z-40 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
                    <span
                      className="hiw-decor pointer-events-none absolute inset-y-0 left-0 z-40 w-1/4 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{ animation: 'hiw-shine 7s ease-in-out infinite' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step caption */}
            <div
              key={activeStep}
              className="hiw-anim mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-md ring-1 ring-slate-100"
              style={reduceMotion ? undefined : { animation: 'hiw-toast 0.5s ease-out both' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Step {activeStep + 1} of {total} · {HOW_IT_WORKS[activeStep]?.title}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
const PARTNER_THEMES = [
  {
    grad: 'from-primary to-orange-400',
    chip: 'bg-primary-light text-primary',
    text: 'text-primary',
    bar: 'bg-primary',
    border: 'hover:border-primary/40',
    glow: 'rgba(249,115,22,0.20)',
  },
  {
    grad: 'from-secondary to-sky-400',
    chip: 'bg-secondary/10 text-secondary',
    text: 'text-secondary',
    bar: 'bg-secondary',
    border: 'hover:border-secondary/40',
    glow: 'rgba(56,189,248,0.22)',
  },
  {
    grad: 'from-emerald-500 to-teal-400',
    chip: 'bg-emerald-50 text-emerald-600',
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    border: 'hover:border-emerald-400/50',
    glow: 'rgba(16,185,129,0.20)',
  },
  {
    grad: 'from-violet-500 to-fuchsia-400',
    chip: 'bg-violet-50 text-violet-600',
    text: 'text-violet-600',
    bar: 'bg-violet-500',
    border: 'hover:border-violet-400/50',
    glow: 'rgba(139,92,246,0.20)',
  },
  {
    grad: 'from-amber-500 to-yellow-400',
    chip: 'bg-amber-50 text-amber-600',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    border: 'hover:border-amber-400/50',
    glow: 'rgba(245,158,11,0.22)',
  },
  {
    grad: 'from-rose-500 to-pink-400',
    chip: 'bg-rose-50 text-rose-600',
    text: 'text-rose-600',
    bar: 'bg-rose-500',
    border: 'hover:border-rose-400/50',
    glow: 'rgba(244,63,94,0.20)',
  },
];

function getInitials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return letters || 'H';
}

function PartnerSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-20 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-6 pt-10">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

function PartnerCard({
  hospital,
  index,
  reduceMotion,
}: {
  hospital: Hospital;
  index: number;
  reduceMotion: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const theme = PARTNER_THEMES[index % PARTNER_THEMES.length];
  const city = hospital.municipality?.name ?? 'City not listed';
  const phone = hospital.phone ?? null;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;

  // 3-column layout: left card slides from the left, right from the right, middle rises
  const col = index % 3;
  const entranceX = [-36, 0, 36][col];
  const entranceY = col === 1 ? 48 : 34;
  const entranceRotate = [-5, 0, 5][col];

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), (index % 6) * 100 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTilt({ rx: y * -7, ry: x * 7, ix: x * 10, iy: y * 10 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  const enteredTransform = reduceMotion
    ? 'none'
    : `perspective(800px) translateY(${spot.active ? -4 : 0}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
  const hiddenTransform = reduceMotion
    ? 'none'
    : `translate(${entranceX}px, ${entranceY}px) scale(0.9) rotate(${entranceRotate}deg)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:shadow-xl',
        theme.border
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? enteredTransform : hiddenTransform,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }, box-shadow 0.2s ease-out, border-color 0.2s ease-out`,
        transitionDelay: !settled && inView ? `${(index % 6) * 100}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(220px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
        }}
      />

      {/* Coloured header band */}
      <div className={cn('relative h-20 overflow-hidden bg-gradient-to-br', theme.grad)}>
        <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
        <span className="pointer-events-none absolute -bottom-10 left-1/3 h-20 w-20 rounded-full bg-white/10" />
        {/* Shine sweep on hover */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />

        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Verified Partner
        </span>
      </div>

      {/* Monogram overlapping the band */}
      <div
        className={cn(
          'relative z-20 -mt-7 ml-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-extrabold shadow-lg ring-4 ring-white transition-transform duration-150 ease-out',
          theme.text
        )}
        style={{ transform: `translate(${tilt.ix}px, ${tilt.iy}px) scale(${spot.active ? 1.08 : 1})` }}
      >
        {getInitials(hospital.name)}
      </div>

      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-3">
        <h3 className={cn('text-base font-bold text-slate-800 transition-colors duration-200 group-hover:' + theme.text.replace('text-', 'text-'), '')}>
          {hospital.name}
        </h3>

        <div className="mt-3 space-y-2">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', theme.chip)}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2C20 17.5 12 22 12 22zM12 13a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </span>
            <span className="min-w-0 truncate">{city}</span>
          </p>

          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', theme.chip)}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h2.28a1 1 0 01.99.86l.46 3.22a1 1 0 01-.44 1L7 9.5a11 11 0 007.5 7.5l1.42-1.29a1 1 0 011-.44l3.22.46a1 1 0 01.86.99V19a2 2 0 01-2 2h-1C10.5 21 3 13.5 3 6V5z"
                />
              </svg>
            </span>
            {telHref ? (
              <a href={telHref} className={cn('min-w-0 truncate transition-opacity hover:opacity-80', theme.text)}>
                {phone}
              </a>
            ) : (
              <span className="text-slate-400">Phone not listed</span>
            )}
          </p>
        </div>

        <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
          <Link
            href={`/hospitals/${hospital.id}`}
            className={cn('inline-flex items-center gap-2 text-sm font-semibold', theme.text)}
          >
            View details
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1 group-hover:text-white',
                theme.chip,
                'group-hover:bg-gradient-to-br',
                theme.grad
              )}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Accent bar that grows in along the bottom on hover */}
      <span
        className={cn(
          'absolute bottom-0 left-0 z-20 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
          theme.bar
        )}
      />
    </div>
  );
}

function PartnerHospitalsSection() {
  const { data: hospitals, isLoading, error, execute: fetchHospitals } = useApi(hospitalApi.getAll);
  const reduceMotion = usePrefersReducedMotion();
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);
  const { ref: footerRef, inView: footerInView } = useInView<HTMLDivElement>(0.4);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const visible = hospitals?.slice(0, 6) ?? [];
  const totalCount = hospitals?.length ?? 0;

  const title = 'Partner Hospitals & Labs';
  const typedTitle = useTypewriter(title, headerInView, 28);
  const doneTyping = typedTitle.length === title.length;

  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            Trusted network
          </span>

          <h2 className="mt-2 min-h-[2.4em] text-3xl font-bold text-slate-800 tracking-tight sm:min-h-[1.2em]">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 text-slate-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            We work with verified healthcare providers across Nepal.
          </p>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />
        </div>

        {isLoading ? (
          <div>
            <div className="mb-6 flex items-center justify-center gap-3 text-sm font-medium text-slate-400">
              <Spinner size="sm" />
              Loading partner hospitals...
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <PartnerSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </span>
            <p className="mt-4 text-sm font-medium text-red-600">Could not load partner hospitals right now.</p>
            <button
              type="button"
              onClick={() => fetchHospitals()}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-white px-5 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-red-200 transition-colors hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-100 bg-slate-50 p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <p className="mt-4 font-medium text-slate-500">
              New partner hospitals are being onboarded. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((hospital: Hospital, index: number) => (
              <PartnerCard key={hospital.id} hospital={hospital} index={index} reduceMotion={reduceMotion} />
            ))}
          </div>
        )}

        <div
          ref={footerRef}
          className="mt-12 text-center transition-all duration-700 ease-out"
          style={{
            opacity: footerInView ? 1 : 0,
            transform: footerInView ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          {totalCount > visible.length && (
            <p className="mb-4 text-sm font-medium text-slate-400">
              Showing {visible.length} of {totalCount} partners
            </p>
          )}
          <Link
            href="/health-directory"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
            <span className="relative">View all hospitals</span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
const PACKAGE_THEMES = [
  {
    grad: 'from-primary to-orange-400',
    chip: 'bg-primary-light text-primary',
    text: 'text-primary',
    bar: 'bg-primary',
    border: 'hover:border-primary/40',
    glow: 'rgba(249,115,22,0.20)',
  },
  {
    grad: 'from-secondary to-sky-400',
    chip: 'bg-secondary/10 text-secondary',
    text: 'text-secondary',
    bar: 'bg-secondary',
    border: 'hover:border-secondary/40',
    glow: 'rgba(56,189,248,0.22)',
  },
  {
    grad: 'from-emerald-500 to-teal-400',
    chip: 'bg-emerald-50 text-emerald-600',
    text: 'text-emerald-600',
    bar: 'bg-emerald-500',
    border: 'hover:border-emerald-400/50',
    glow: 'rgba(16,185,129,0.20)',
  },
  {
    grad: 'from-violet-500 to-fuchsia-400',
    chip: 'bg-violet-50 text-violet-600',
    text: 'text-violet-600',
    bar: 'bg-violet-500',
    border: 'hover:border-violet-400/50',
    glow: 'rgba(139,92,246,0.20)',
  },
];

// Starts as null so server and client render the same markup, then ticks once mounted
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

function getTimeLeft(activeTo: string | number | Date, now: number | null) {
  if (now === null) return null;
  const end = new Date(activeTo).getTime();
  if (Number.isNaN(end)) return null;

  const diff = end - now;
  if (diff <= 0) {
    return { ended: true, urgent: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const total = Math.floor(diff / 1000);
  return {
    ended: false,
    urgent: diff < 48 * 60 * 60 * 1000,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function PackageCountdown({
  time,
  reduceMotion,
}: {
  time: ReturnType<typeof getTimeLeft>;
  reduceMotion: boolean;
}) {
  if (!time) return null;

  if (time.ended) {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        This offer window has closed
      </p>
    );
  }

  const segments = [
    { label: 'Days', value: time.days },
    { label: 'Hrs', value: time.hours },
    { label: 'Min', value: time.minutes },
    { label: 'Sec', value: time.seconds },
  ];

  return (
    <div className="mt-3">
      <p
        className={cn(
          'mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider',
          time.urgent ? 'text-red-500' : 'text-slate-400'
        )}
      >
        {time.urgent && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
        )}
        {time.urgent ? 'Ending soon' : 'Offer ends in'}
      </p>
      <div className="flex gap-1.5">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn(
              'min-w-[46px] overflow-hidden rounded-lg px-2 py-1.5 text-center ring-1',
              time.urgent ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-slate-50 text-slate-700 ring-slate-100'
            )}
          >
            <span
              key={seg.value}
              className="pkg-anim block text-sm font-extrabold tabular-nums leading-none"
              style={reduceMotion ? undefined : { animation: 'pkg-tick 0.35s ease-out' }}
            >
              {String(seg.value).padStart(2, '0')}
            </span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-wider opacity-60">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  index,
  isSingle,
  isBest,
  now,
  reduceMotion,
}: {
  pkg: HealthPackage;
  index: number;
  isSingle: boolean;
  isBest: boolean;
  now: number | null;
  reduceMotion: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const image = mediaUrl(pkg.imageUrl);
  const theme = PACKAGE_THEMES[index % PACKAGE_THEMES.length];
  const timeLeft = getTimeLeft(pkg.activeTo, now);

  // Two-column layout: left card slides from the left, right card from the right
  const isLeft = index % 2 === 0;
  const entranceX = isSingle ? 0 : isLeft ? -36 : 36;
  const entranceRotate = isSingle ? 0 : isLeft ? -4 : 4;

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), index * 120 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTilt({ rx: y * -5, ry: x * 5 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  const enteredTransform = reduceMotion
    ? 'none'
    : `perspective(1000px) translateY(${spot.active ? -4 : 0}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
  const hiddenTransform = reduceMotion
    ? 'none'
    : `translate(${entranceX}px, 40px) scale(0.92) rotate(${entranceRotate}deg)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 hover:shadow-xl',
        theme.border
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? enteredTransform : hiddenTransform,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }, box-shadow 0.2s ease-out, border-color 0.2s ease-out`,
        transitionDelay: !settled && inView ? `${index * 120}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(260px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
        }}
      />

      {/* ── Media panel: large, full medicine image visible ─────── */}
      <div className="relative h-64 shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 sm:h-80">
        {/* Very soft theme tint so the neutral backdrop still carries brand colour */}
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.06]', theme.grad)} />

        {/* Gentle radial halo behind the product so object-contain whitespace feels intentional */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9),transparent_72%)]" />

        {image ? (
          <img
            src={image}
            alt={pkg.topic}
            className="absolute inset-0 h-full w-full object-contain p-6 drop-shadow-sm transition-transform duration-700 ease-out group-hover:scale-105 sm:p-8"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-20', theme.bar)} />
            <span className={cn('absolute -bottom-12 -left-6 h-28 w-28 rounded-full opacity-10', theme.bar)} />
            <svg className={cn('relative h-12 w-12', theme.text)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        {isBest && (
          <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 15.27l-5.18 3.05 1.4-5.93L1.6 8.4l6.06-.5L10 2.3l2.34 5.6 6.06.5-4.62 3.99 1.4 5.93z" />
            </svg>
            Best value
          </span>
        )}

        {pkg.savingsPercent > 0 && (
          <span className="absolute right-3 top-3 z-20 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 shadow-lg ring-1 ring-emerald-100">
            Save {pkg.savingsPercent}%
          </span>
        )}
      </div>

      {/* ── Content: compact, secondary to the image ────────────── */}
      <div className="relative flex min-w-0 flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-slate-800">{pkg.topic}</h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
            />
          </svg>
          Available until {new Date(pkg.activeTo).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>

        <PackageCountdown time={timeLeft} reduceMotion={reduceMotion} />

        {pkg.description && (
          <RichTextContent
            html={pkg.description}
            className="mt-3 text-sm line-clamp-3"
          />
        )}

        <div className="mt-auto pt-5">
          <div className="border-t border-dashed border-slate-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div>
                <span className="flex items-baseline gap-3">
                  <span className={cn('text-2xl font-extrabold', theme.text)}>Rs. {pkg.packagePrice}</span>
                  {pkg.savings > 0 && (
                    <span className="text-sm text-slate-400 line-through">Rs. {pkg.regularPrice}</span>
                  )}
                </span>
                {pkg.savings > 0 && (
                  <span
                    className={cn(
                      'mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      theme.chip
                    )}
                  >
                    You save Rs. {pkg.savings}
                  </span>
                )}
              </div>

              <Link
                href={`/contact?about=${encodeURIComponent(pkg.topic)}`}
                className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-secondary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary-hover hover:shadow-lg"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
                <span className="relative">Contact Us to Book</span>
                <svg
                  className="relative h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Accent bar that grows in along the bottom on hover */}
      <span
        className={cn(
          'absolute bottom-0 left-0 z-20 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
          theme.bar
        )}
      />
    </div>
  );
}

// Presentation only: receives packages that were already fetched and is only
// mounted when there is at least one, so its scroll-reveal hooks always see real DOM nodes
function PackagesShowcase({ packages }: { packages: HealthPackage[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const now = useNow(1000);
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);

  const isSingle = packages.length === 1;

  const title = isSingle ? 'Currently Active Package' : 'Packages';
  const typedTitle = useTypewriter(title, headerInView, 30);
  const doneTyping = typedTitle.length === title.length;

  // Flag one "Best value" package, only when it is the clear leader on savings
  const percents = packages.map((p) => Number(p.savingsPercent) || 0);
  const maxPercent = Math.max(...percents);
  const bestIndex =
    packages.length > 1 && maxPercent > 0 && percents.filter((p) => p === maxPercent).length === 1
      ? percents.indexOf(maxPercent)
      : -1;

  return (
    <section className="relative overflow-hidden py-20 bg-white border-t border-slate-100">
      <style>{`
        @keyframes pkg-tick {
          from { opacity: 0.25; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pkg-anim { animation: none !important; }
        }
      `}</style>

      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Limited time
          </span>

          <h2 className="mt-3 min-h-[2.4em] text-3xl font-bold text-slate-800 tracking-tight sm:min-h-[1.2em]">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 text-slate-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            Bundled care at a better price, available for a limited window.
          </p>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />
        </div>

        <div
          className={cn(
            'grid gap-6',
            isSingle ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'
          )}
        >
          {packages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              isSingle={isSingle}
              isBest={index === bestIndex}
              now={now}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActivePackagesSection() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);

  useEffect(() => {
    let cancelled = false;
    packageApi
      .getActive()
      .then((res) => {
        if (!cancelled) setPackages(res.packages);
      })
      // a failed fetch is treated the same as "nothing active": the section
      // simply stays off the page rather than showing an error to a visitor
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  if (packages.length === 0) return null;

  return <PackagesShowcase packages={packages} />;
}

const HEALTH_TIP_THEMES = [
  { dot: 'bg-primary', text: 'text-primary', bar: 'bg-primary', glow: 'rgba(249,115,22,0.18)' },
  { dot: 'bg-secondary', text: 'text-secondary', bar: 'bg-secondary', glow: 'rgba(56,189,248,0.22)' },
  { dot: 'bg-emerald-500', text: 'text-emerald-600', bar: 'bg-emerald-500', glow: 'rgba(16,185,129,0.18)' },
];

// General wellness lines shown in the typing bubble. Edit freely; keep each under ~90 characters.
const HEALTH_TIP_LINES = [
  'Aim for 7–8 hours of sleep. Your body repairs itself while you rest.',
  'A 30-minute walk a day supports your heart, your mood and your energy.',
  'Book regular check-ups. Catching things early makes care simpler.',
  'Keep prescriptions and reports in one place so your doctor sees the full picture.',
  'Wash your hands often. It is still one of the simplest ways to stay well.',
];

const HEART_PATH =
  'M12 21s-7.5-4.9-10.2-9.6C.2 8.1 1.7 4.5 5 3.6c2-.5 4 .3 5 2 1-1.7 3-2.5 5-2 3.3.9 4.8 4.5 3.2 7.8C19.5 16.1 12 21 12 21z';

const TIPS_FLOATERS = [
  { d: HEART_PATH, x: '5%', y: '12%', size: 34, delay: 0, dur: 9, color: 'text-primary/20' },
  { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', x: '90%', y: '9%', size: 40, delay: 1.2, dur: 11, color: 'text-secondary/25' },
  { d: 'M12 5v14M5 12h14', x: '13%', y: '68%', size: 30, delay: 2.4, dur: 10, color: 'text-emerald-500/20' },
  { d: 'M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z', x: '85%', y: '60%', size: 34, delay: 0.6, dur: 12, color: 'text-primary/20' },
  { d: 'M3 12h4l3-8 4 16 3-8h4', x: '46%', y: '90%', size: 46, delay: 1.8, dur: 13, color: 'text-secondary/20' },
  { d: HEART_PATH, x: '73%', y: '30%', size: 22, delay: 3, dur: 8, color: 'text-emerald-500/20' },
];

// Types each tip out, holds it, then moves to the next: thinking dots -> typing -> holding.
// With reduced motion it still types the first tip, then stays on it instead of cycling.
function useTipLoop(tips: string[], active: boolean, reduceMotion: boolean, paused: boolean) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'thinking' | 'typing' | 'holding'>('thinking');

  const tip = tips[index] ?? '';

  useEffect(() => {
    if (!active || paused || tips.length === 0) return undefined;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'thinking') {
      timer = setTimeout(() => {
        setCount(0);
        setPhase('typing');
      }, 1100);
    } else if (phase === 'typing') {
      if (count >= tip.length) {
        setPhase('holding');
      } else {
        timer = setTimeout(() => setCount((c) => c + 1), 28);
      }
    } else if (!reduceMotion) {
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % tips.length);
        setCount(0);
        setPhase('thinking');
      }, 3600);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, paused, reduceMotion, phase, count, tip, tips.length]);

  const jump = (target: number) => {
    setIndex(target);
    setCount(0);
    setPhase('thinking');
  };

  return { index, phase, tip, text: tip.slice(0, count), jump };
}

function TipBubble({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const [paused, setPaused] = useState(false);
  const { index, phase, tip, text, jump } = useTipLoop(HEALTH_TIP_LINES, active, reduceMotion, paused);

  const typing = phase === 'typing';
  const showDots = phase === 'thinking';

  return (
    <div
      className="mx-auto mt-8 flex max-w-xl items-start gap-3 text-left"
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setPaused(false);
      }}
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.96)',
        transition: 'opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Avatar */}
      <span className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
        {typing && <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-25" />}
        <svg className="relative h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={HEART_PATH} />
        </svg>
      </span>

      {/* Bubble */}
      <div className="relative min-w-0 flex-1">
        <span className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l border-slate-100 bg-white" />

        <div className="relative rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-lg ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              Zeniva Health Tip
              <svg className="h-3 w-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            </span>

            {/* Dots double as tip selectors */}
            <span className="flex items-center">
              {HEALTH_TIP_LINES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => jump(i)}
                  aria-label={`Show tip ${i + 1} of ${HEALTH_TIP_LINES.length}`}
                  className="flex h-4 items-center px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    className={cn(
                      'block h-1.5 rounded-full transition-all duration-300',
                      i === index ? 'w-4 bg-primary' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    )}
                  />
                </button>
              ))}
            </span>
          </div>

          {/* The full tip is rendered invisibly to reserve its height, so the bubble never jumps while typing */}
          <div className="relative mt-1.5 text-sm leading-relaxed text-slate-600">
            <span className="invisible block" aria-hidden="true">
              {tip}
            </span>
            <span className="sr-only">{tip}</span>

            <span className="absolute inset-0" aria-hidden="true">
              {showDots ? (
                <span className="flex h-full items-center gap-1.5 pl-1">
                  {[0, 0.15, 0.3].map((delay) => (
                    <span
                      key={delay}
                      className="tips-dot h-2 w-2 rounded-full bg-slate-300"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  {text}
                  {typing && (
                    <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary" />
                  )}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Little hearts float up once a tip has finished typing */}
        {phase === 'holding' && !reduceMotion && (
          <>
            <span key={`h1-${index}`} className="tips-rise pointer-events-none absolute -top-1 right-6 text-primary">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d={HEART_PATH} />
              </svg>
            </span>
            <span
              key={`h2-${index}`}
              className="tips-rise pointer-events-none absolute -top-1 right-12 text-secondary"
              style={{ animationDelay: '0.25s' }}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d={HEART_PATH} />
              </svg>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function HealthTipCard({
  blog,
  index,
  reduceMotion,
}: {
  blog: Blog;
  index: number;
  reduceMotion: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const theme = HEALTH_TIP_THEMES[index % HEALTH_TIP_THEMES.length];

  // The small label above each card writes itself when the card scrolls into view
  const label = useTypewriter('Featured', inView, 70);

  // 3-column layout: left card slides from the left, right from the right, middle rises
  const col = index % 3;
  const entranceX = [-36, 0, 36][col];
  const entranceY = col === 1 ? 48 : 34;
  const entranceRotate = [-5, 0, 5][col];

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), index * 120 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    // The spotlight is a colour change only, so it stays on for everyone; the tilt is movement
    if (!reduceMotion) setTilt({ rx: y * -5, ry: x * 5 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  const enteredTransform = reduceMotion
    ? 'none'
    : `perspective(900px) translateY(${spot.active ? -6 : 0}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
  const hiddenTransform = reduceMotion
    ? 'none'
    : `translate(${entranceX}px, ${entranceY}px) scale(0.92) rotate(${entranceRotate}deg)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? enteredTransform : hiddenTransform,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }`,
        transitionDelay: !settled && inView ? `${index * 120}ms` : '0ms',
      }}
    >
      {/* Idle bob: each card floats gently out of phase, and pauses on hover */}
      <div className="tips-bob flex h-full flex-col" style={{ animationDelay: `${index * 0.9}s` }}>
        {/* Label row above the card */}
        <div className="mb-3 flex items-center justify-between px-1">
          <span className={cn('flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider', theme.text)}>
            <span className="relative flex h-2 w-2">
              <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', theme.dot)} />
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', theme.dot)} />
            </span>
            <span className="relative">
              <span className="invisible">Featured</span>
              <span className="absolute left-0 top-0 whitespace-nowrap">{label}</span>
            </span>
          </span>
          <span className="text-xs font-extrabold tabular-nums text-slate-300 transition-colors duration-300 group-hover:text-slate-400">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Your existing card, unchanged */}
        <div className="relative flex-1 [&>*]:h-full">
          <BlogCard blog={blog} />

          {/* Cursor-tracking spotlight */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200"
            style={{
              opacity: spot.active ? 1 : 0,
              background: `radial-gradient(240px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
            }}
          />
        </div>

        {/* Accent bar that grows in beneath the card on hover */}
        <span
          className={cn(
            'mt-3 block h-[3px] w-full origin-left scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100',
            theme.bar
          )}
        />
      </div>
    </div>
  );
}

// Presentation only: receives blogs that were already fetched and is only
// mounted when there is at least one, so its scroll-reveal hooks always see real DOM nodes
function HealthTipsShowcase({ blogs }: { blogs: Blog[] }) {
  const reduceMotion = usePrefersReducedMotion();
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);
  const { ref: footerRef, inView: footerInView } = useInView<HTMLDivElement>(0.4);

  const title = 'Health Tips & Highlights';
  const typedTitle = useTypewriter(title, headerInView, 28);
  const doneTyping = typedTitle.length === title.length;

  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <style>{`
        @keyframes tips-drift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -18px, 0) rotate(8deg); }
        }
        @keyframes tips-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes tips-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes tips-rise {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-46px) scale(1.15); }
        }
        .tips-drift { animation: tips-drift 10s ease-in-out infinite; }
        .tips-bob { animation: tips-bob 6s ease-in-out infinite; }
        .group:hover .tips-bob { animation-play-state: paused; }
        .tips-dot { animation: tips-dot 1.2s ease-in-out infinite; }
        .tips-rise { animation: tips-rise 1.8s ease-out forwards; }
        /* Only large movement is switched off; typing, fades and the small typing dots stay */
        @media (prefers-reduced-motion: reduce) {
          .tips-drift, .tips-bob, .tips-rise { animation: none !important; }
          .tips-rise { opacity: 0; }
        }
      `}</style>

      <SectionGlow />

      {/* Floating health icons drifting in the background */}
      {TIPS_FLOATERS.map((f, i) => (
        <svg
          key={i}
          className={cn('tips-drift pointer-events-none absolute', f.color)}
          style={{
            left: f.x,
            top: f.y,
            width: f.size,
            height: f.size,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.d} />
        </svg>
      ))}

      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm ring-1 ring-primary/10 transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 18h6m-5 3h4m-2-18a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z"
              />
            </svg>
            Stay informed
          </span>

          <h2 className="mt-3 min-h-[2.4em] text-3xl font-bold text-slate-800 tracking-tight sm:min-h-[1.2em]">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />

          {/* Chat-style tip that floats in once the title has finished typing */}
          <TipBubble active={headerInView && doneTyping} reduceMotion={reduceMotion} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <HealthTipCard key={blog.id} blog={blog} index={index} reduceMotion={reduceMotion} />
          ))}
        </div>

        <div
          ref={footerRef}
          className="mt-12 text-center transition-all duration-700 ease-out"
          style={{
            opacity: footerInView ? 1 : 0,
            transform: footerInView ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          <Link
            href="/blog"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
            <span className="relative">Read all articles</span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HealthTipsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    let cancelled = false;
    blogApi
      .getFeatured(3)
      .then((res) => {
        if (!cancelled) setBlogs(res.blogs);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  // nothing published under Health Tips yet — leave the homepage alone
  // rather than showing an empty strip
  if (blogs.length === 0) return null;

  return <HealthTipsShowcase blogs={blogs} />;
}
const TESTIMONIAL_THEMES = [
  {
    grad: 'from-primary to-orange-400',
    text: 'text-primary',
    chip: 'bg-primary-light text-primary',
    bar: 'bg-primary',
    border: 'hover:border-primary/40',
    glow: 'rgba(249,115,22,0.18)',
    shadow: 'shadow-primary/30',
  },
  {
    grad: 'from-secondary to-sky-400',
    text: 'text-secondary',
    chip: 'bg-secondary/10 text-secondary',
    bar: 'bg-secondary',
    border: 'hover:border-secondary/40',
    glow: 'rgba(56,189,248,0.22)',
    shadow: 'shadow-secondary/30',
  },
  {
    grad: 'from-emerald-500 to-teal-400',
    text: 'text-emerald-600',
    chip: 'bg-emerald-50 text-emerald-600',
    bar: 'bg-emerald-500',
    border: 'hover:border-emerald-400/50',
    glow: 'rgba(16,185,129,0.18)',
    shadow: 'shadow-emerald-500/30',
  },
];

const QUOTE_PATH =
  'M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H5.5a2.83 2.83 0 012.83-2.83V6zm10 0A5.17 5.17 0 0012 11.17V18h6.83v-6.83H15.5a2.83 2.83 0 012.83-2.83V6z';

function getTestimonialInitials(name: string) {
  const letters = name
    .replace(/^dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return letters || 'Z';
}

function TestimonialCard({
  t,
  index,
  reduceMotion,
}: {
  t: (typeof TESTIMONIALS)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });
  const [settled, setSettled] = useState(false);

  const theme = TESTIMONIAL_THEMES[index % TESTIMONIAL_THEMES.length];
  const role = /^dr\.?\s/i.test(t.name) ? 'Doctor' : 'Patient';

  // The quote writes itself once the card has entered
  const startTyping = useDelayedFlag(inView, 500 + index * 250);
  const typed = useTypewriter(t.quote, startTyping, 16);
  const done = typed.length === t.quote.length;

  // 3-column layout: left card slides from the left, right from the right, middle rises
  const col = index % 3;
  const entranceX = [-36, 0, 36][col];
  const entranceY = col === 1 ? 48 : 34;
  const entranceRotate = [-5, 0, 5][col];

  // After the entrance finishes, switch to a snappier transition for the hover tilt
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setSettled(true), index * 130 + 750);
    return () => clearTimeout(timer);
  }, [inView, index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    // The spotlight is a colour change, so it stays on for everyone; tilt is movement
    if (!reduceMotion) setTilt({ rx: y * -6, ry: x * 6, ix: x * 10, iy: y * 10 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  const enteredTransform = reduceMotion
    ? 'none'
    : `perspective(900px) translateY(${spot.active ? -6 : 0}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`;
  const hiddenTransform = reduceMotion
    ? 'none'
    : `translate(${entranceX}px, ${entranceY}px) scale(0.92) rotate(${entranceRotate}deg)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-[box-shadow,border-color,background-color] duration-200 hover:bg-white hover:shadow-xl',
        theme.border
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? enteredTransform : hiddenTransform,
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform ${
          settled ? '0.15s ease-out' : '0.65s cubic-bezier(0.22, 1, 0.36, 1)'
        }, box-shadow 0.2s ease-out, border-color 0.2s ease-out, background-color 0.2s ease-out`,
        transitionDelay: !settled && inView ? `${index * 130}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(240px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
        }}
      />

      {/* Large watermark quote mark */}
      <svg
        className={cn('tst-float pointer-events-none absolute -right-2 -top-2 h-24 w-24 opacity-[0.07]', theme.text)}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ animationDelay: `${index * 0.8}s` }}
      >
        <path d={QUOTE_PATH} />
      </svg>

      {/* Quote badge that pops in and follows the cursor */}
      <span
        className={cn(
          'relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-150 ease-out',
          theme.grad,
          theme.shadow
        )}
        style={{
          transform: `translate(${tilt.ix}px, ${tilt.iy}px) scale(${spot.active ? 1.1 : 1})`,
        }}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d={QUOTE_PATH} />
        </svg>
      </span>

      {/* The full quote is rendered invisibly to reserve its height, so the card never jumps while typing */}
      <div className="relative flex-1 text-sm italic leading-relaxed text-slate-600">
        <p className="invisible" aria-hidden="true">
          &ldquo;{t.quote}&rdquo;
        </p>
        <p className="sr-only">&ldquo;{t.quote}&rdquo;</p>
        <p className="absolute inset-0" aria-hidden="true">
          {typed.length > 0 && <>&ldquo;{typed}</>}
          {done && <>&rdquo;</>}
          {!done && startTyping && (
            <span className={cn('ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse', theme.bar)} />
          )}
        </p>
      </div>

      {/* Author row fades in once the quote has finished writing */}
      <div
        className="relative mt-5 flex items-center gap-3 border-t border-dashed border-slate-200 pt-4"
        style={{
          opacity: done ? 1 : 0,
          transform: done ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          {done && !reduceMotion && (
            <span
              className={cn('absolute inset-0 animate-ping rounded-full bg-gradient-to-br opacity-25', theme.grad)}
              style={{ animationIterationCount: 2 }}
            />
          )}
          <span
            className={cn(
              'relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-xs font-extrabold text-white shadow-md ring-2 ring-white',
              theme.grad
            )}
          >
            {getTestimonialInitials(t.name)}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{t.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2C20 17.5 12 22 12 22zM12 13a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
            <span className="truncate">{t.location}</span>
          </p>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
            theme.chip
          )}
        >
          {role}
        </span>
      </div>

      {/* Accent bar that grows in along the bottom on hover */}
      <span
        className={cn(
          'absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
          theme.bar
        )}
      />
    </div>
  );
}

function TestimonialsSection() {
  const reduceMotion = usePrefersReducedMotion();
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);
  const { ref: footerRef, inView: footerInView } = useInView<HTMLDivElement>(0.4);

  const title = 'Testimonials';
  const typedTitle = useTypewriter(title, headerInView, 30);
  const doneTyping = typedTitle.length === title.length;

  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <style>{`
        @keyframes tst-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(6deg); }
        }
        .tst-float { animation: tst-float 7s ease-in-out infinite; }
        /* Only large movement is switched off; typing, fades and colour changes stay */
        @media (prefers-reduced-motion: reduce) {
          .tst-float { animation: none !important; }
        }
      `}</style>

      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            What patients say
          </span>

          <h2 className="mt-3 min-h-[1.2em] text-3xl font-bold text-slate-800 tracking-tight">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, index) => (
            <TestimonialCard key={t.name} t={t} index={index} reduceMotion={reduceMotion} />
          ))}
        </div>

        <div
          ref={footerRef}
          className="mt-12 text-center transition-all duration-700 ease-out"
          style={{
            opacity: footerInView ? 1 : 0,
            transform: footerInView ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          <Link
            href="/book-doctor"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
            <span className="relative">Book your appointment</span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    question: 'How do I book a doctor appointment on Zeniva?',
    answer:
      'Search by doctor name, specialty, or hospital, pick an open slot, and confirm — you\'ll get instant confirmation, no phone calls needed.',
    category: 'Booking',
  },
  {
    question: 'Can I upload a prescription for tests or medicines?',
    answer:
      'Yes. Both the diagnostics and e-Pharmacy flows let you attach a prescription photo or PDF when placing your order.',
    category: 'Prescriptions',
  },
  {
    question: 'Is my health data kept private?',
    answer:
      'Your records and bookings live on a secure, encrypted portal and are only shared with providers you choose to see.',
    category: 'Privacy',
  },
  {
    question: 'What if I need emergency care right now?',
    answer:
      'Use the Ambulance Service on our Hospital Directory to locate and call the nearest verified dispatch immediately.',
    category: 'Emergency',
  },
  {
    question: 'Which parts of Nepal does Zeniva cover?',
    answer:
      'We work with partner hospitals and clinics across all 77 districts, with the deepest coverage in major cities.',
    category: 'Coverage',
  },
];

const FAQ_CATEGORIES = ['All', 'Booking', 'Prescriptions', 'Privacy', 'Emergency', 'Coverage'];

function FaqCategoryPills({
  active,
  onChange,
}: {
  active: string;
  onChange: (category: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const activeIndex = FAQ_CATEGORIES.indexOf(active);
      const btn = btnRefs.current[activeIndex];
      if (!container || !btn) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width, ready: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex flex-wrap justify-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100"
    >
      <span
        className="absolute top-1 bottom-1 rounded-full bg-primary shadow-sm shadow-primary/30 transition-all duration-300 ease-out"
        style={{
          left: indicator.left,
          width: indicator.width,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
      {FAQ_CATEGORIES.map((cat, i) => (
        <button
          key={cat}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            'relative z-10 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200',
            active === cat ? 'text-white' : 'text-slate-400 hover:text-slate-600'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function FaqAccordionItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof FAQS)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const theme = HEALTH_TIP_THEMES[index % HEALTH_TIP_THEMES.length];
  const typed = useTypewriter(faq.answer, isOpen, 14);

  const col = index % 2;
  const entranceX = col === 0 ? -28 : 28;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-[box-shadow,border-color] duration-200',
        isOpen ? 'border-transparent shadow-lg' : 'border-slate-100 hover:shadow-md'
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate(0, 0)' : `translate(${entranceX}px, 24px)`,
        transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: inView ? `${(index % 6) * 90}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(200px circle at ${spot.x}% ${spot.y}%, ${theme.glow}, transparent 70%)`,
        }}
      />

      {/* Accent bar, lit while open */}
      <span
        className={cn(
          'absolute left-0 top-0 h-full w-1 origin-top scale-y-0 transition-transform duration-300 ease-out',
          theme.bar,
          isOpen && 'scale-y-100'
        )}
      />

      <button
        type="button"
        onClick={onToggle}
        className="relative flex w-full items-center gap-4 px-6 py-5 text-left focus:outline-none"
      >
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-300',
            isOpen ? cn(theme.bar, 'text-white shadow-sm') : 'bg-slate-100 text-slate-400'
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className={cn('flex-1 font-bold transition-colors duration-200', isOpen ? theme.text : 'text-slate-800')}>
          {faq.question}
        </span>

        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300',
            isOpen ? cn(theme.bar, 'rotate-180') : 'bg-slate-50 text-slate-400'
          )}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Smooth height animation via the grid-rows trick — no JS measuring needed */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 pl-[3.75rem] text-sm leading-relaxed text-slate-500">
            {typed}
            {isOpen && typed.length < faq.answer.length && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const { ref: headerRef, inView: headerInView } = useInView<HTMLDivElement>(0.4);
  const { ref: footerRef, inView: footerInView } = useInView<HTMLDivElement>(0.4);
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const title = 'Frequently Asked Questions';
  const typedTitle = useTypewriter(title, headerInView, 26);
  const doneTyping = typedTitle.length === title.length;

  const filtered = activeCategory === 'All' ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setOpenIndex(0);
  };

  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[92%] max-w-6xl mx-auto">
        <div ref={headerRef} className="mx-auto mb-10 max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm ring-1 ring-primary/10 transition-opacity duration-500 ease-out"
            style={{ opacity: headerInView ? 1 : 0 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Questions?
          </span>

          <h2 className="mt-3 min-h-[2.4em] text-3xl font-bold text-slate-800 tracking-tight sm:min-h-[1.2em]">
            {typedTitle}
            <span
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <span
            className="mx-auto mt-4 block h-[3px] w-16 origin-center rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-700 ease-out"
            style={{ transform: doneTyping ? 'scaleX(1)' : 'scaleX(0)' }}
          />

          <div
            className="mt-6 flex justify-center transition-all duration-500 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <FaqCategoryPills active={activeCategory} onChange={handleCategoryChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[380px_1fr] lg:items-start">
          {/* Image panel */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 shadow-xl shadow-primary/15">
              <img
                src="/images/FAQ.jpg"
                alt="Doctor answering frequently asked questions"
                className="h-[420px] w-full object-cover animate-kenburns"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06222e]/45 via-transparent to-primary/10" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(56,189,248,0.22),transparent_45%)]" />

              <div className="animate-float-slow absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.99.86l.46 3.22a1 1 0 01-.44 1L7 9.5a11 11 0 007.5 7.5l1.42-1.29a1 1 0 011-.44l3.22.46a1 1 0 01.86.99V19a2 2 0 01-2 2h-1C10.5 21 3 13.5 3 6V5z"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Still have a question?</div>
                  <a href="tel:+97715927435" className="truncate text-xs font-semibold text-primary hover:underline">
                    Call +977-1-5927435
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion list — keyed by category so switching tabs re-triggers the entrance animation */}
          <div key={activeCategory} className="space-y-3">
            {filtered.map((faq, index) => (
              <FaqAccordionItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((cur) => (cur === index ? null : index))}
              />
            ))}

            <div
              ref={footerRef}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-4 transition-all duration-700 ease-out"
              style={{
                opacity: footerInView ? 1 : 0,
                transform: footerInView ? 'translateY(0)' : 'translateY(14px)',
              }}
            >
              <p className="text-sm font-medium text-slate-500">Didn&apos;t find what you were looking for?</p>
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
                <span className="relative">Ask us directly</span>
                <svg className="relative h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function ContactCtaSection() {
  return (
    <section className="relative py-16 bg-secondary overflow-hidden">
      {/* Corner glow accents */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Faint pill/vial texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: 'url(/images/pills-pattern.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'radial-gradient(ellipse 90% 90% at center, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at center, black 30%, transparent 100%)',
        }}
      />

      <div className="relative w-[95%] max-w-none mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-2xl items-center justify-center bg-white/10 backdrop-blur-md border border-white/25 shadow-lg p-3">
            <img
              src="/images/first-aid-kit.png"
              alt="First aid kit"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Need help or have a question?
            </h2>
            <p className="mt-2 text-secondary-light/90">
              Our support team is available around the clock for emergencies and general inquiries.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
<a
            href="tel:+97715927435"
            className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium bg-white text-secondary hover:bg-slate-100 transition-colors"
          >
            Call +977-1-5927435
            </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium border-2 border-white text-white hover:bg-white/10 transition-colors"
          >
            Send a Message
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <WhyChooseUsSection />
        <FeaturedServicesSection />
        <HowItWorksSection />
        <PartnerHospitalsSection />
        <ActivePackagesSection />
        <HealthTipsSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
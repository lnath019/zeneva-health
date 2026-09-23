'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────
   Content
   ──────────────────────────────────────────────────────────────────────── */

const SUPPORT_TEL = 'tel:+97715927435';

const STATS = [
  { label: 'Partner Hospitals', value: '50+', icon: 'building' },
  { label: 'Verified Doctors', value: '300+', icon: 'shield' },
  { label: 'Districts Covered', value: '77', icon: 'mapPin' },
  { label: 'Emergency Response', value: '24/7', icon: 'heart' },
];

const VERIFICATION_STEPS = [
  {
    step: '01',
    title: 'Credential Check',
    description: 'Every doctor\u2019s registration and every lab or hospital\u2019s license is checked before they can appear on Zeniva.',
    icon: 'shield',
  },
  {
    step: '02',
    title: 'Facility Review',
    description: 'We review each partner\u2019s facility, equipment, and service standards against our own listing criteria.',
    icon: 'building',
  },
  {
    step: '03',
    title: 'Ongoing Monitoring',
    description: 'Listings are re-checked periodically and patient feedback is monitored, so standards don\u2019t slip after launch day.',
    icon: 'trending',
  },
];

const VALUES = [
  {
    title: 'Patient First',
    description: 'Every feature we ship is judged by one question: does this make getting care easier for the person on the other end?',
    icon: 'heart',
  },
  {
    title: 'Verified Trust',
    description: 'Every doctor, hospital, and lab on our platform is vetted before they can accept a booking — no exceptions.',
    icon: 'shield',
  },
  {
    title: 'Accessible Everywhere',
    description: 'From the biggest hospitals in Kathmandu to clinics in remote municipalities, we map care down to where you live.',
    icon: 'mapPin',
  },
  {
    title: 'Always Improving',
    description: 'Our hospital and doctor network grows every week, and we keep refining the product based on real patient feedback.',
    icon: 'trending',
  },
];

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1516841273335-e39b37888115?w=800&h=600&fit=crop&auto=format', alt: 'Hospital corridor at a Zeniva partner facility' },
  { src: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=800&h=600&fit=crop&auto=format', alt: 'Diagnostic lab equipment used for blood testing' },
  { src: 'https://images.unsplash.com/photo-1580281657529-557a6abb6387?w=800&h=600&fit=crop&auto=format', alt: 'Pharmacist preparing a prescription order' },
  { src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop&auto=format', alt: 'Exterior of a partner hospital building' },
];

/* ────────────────────────────────────────────────────────────────────────
   Icons — small inline set, no external icon dependency
   ──────────────────────────────────────────────────────────────────────── */

const ICONS: Record<string, ReactNode> = {
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
  trending: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 6L9 17l-5-5" />,
  phone: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.99.86l.46 3.22a1 1 0 01-.44 1L7 9.5a11 11 0 007.5 7.5l1.42-1.29a1 1 0 011-.44l3.22.46a1 1 0 01.86.99V19a2 2 0 01-2 2h-1C10.5 21 3 13.5 3 6V5z"
    />
  ),
};

function StepCard({ item, index }: { item: (typeof VERIFICATION_STEPS)[number]; index: number }) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.3);
  const cardRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const [transform, setTransform] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const isPrimary = index % 2 === 0;
  const accent = isPrimary
    ? { badge: 'bg-primary ring-primary/10', glow: 'rgba(249,115,22,0.22)' }
    : { badge: 'bg-secondary ring-secondary/10', glow: 'rgba(56,189,248,0.22)' };

  // 3-column layout: left card slides from left, right from right, middle rises
  const entranceX = index === 0 ? -40 : index === 2 ? 40 : 0;
  const entranceY = index === 1 ? 44 : 30;
  const entranceRotate = index === 0 ? -5 : index === 2 ? 5 : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTransform({ rx: y * -10, ry: x * 10, ix: x * 14, iy: y * 14 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTransform({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  return (
    <div
      ref={(node) => {
        viewRef.current = node;
        cardRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `translate(0, 0) scale(1) rotate(0deg) perspective(700px) rotateX(${transform.rx}deg) rotateY(${transform.ry}deg)`
          : `translate(${entranceX}px, ${entranceY}px) scale(0.9) rotate(${entranceRotate}deg)`,
        transition:
          'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease-out',
        transitionDelay: inView ? `${index * 150}ms` : '0ms',
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

      <span
        className={`relative inline-flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-md ring-4 ${accent.badge}`}
        style={{
          transform: `translate(${transform.ix}px, ${transform.iy}px) scale(${spot.active ? 1.1 : 1})`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {item.step}
      </span>
      <div className="relative mt-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
        <Icon name={item.icon} className="w-4 h-4" />
      </div>
      <h3 className="relative mt-3 text-lg font-bold text-slate-800">{item.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
    </div>
  );
}

function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {ICONS[name]}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Shared bits
   ──────────────────────────────────────────────────────────────────────── */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
      <span className={`text-xs font-bold uppercase tracking-wider ${light ? 'text-white/80' : 'text-secondary'}`}>
        {eyebrow}
      </span>
      <h2 className={`mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${light ? 'text-white' : 'text-slate-800'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${light ? 'text-white/80' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Hooks
   ──────────────────────────────────────────────────────────────────────── */

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null) as React.MutableRefObject<T | null>;
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

function useParallax<T extends HTMLElement>(strength = 0.12) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(distanceFromCenter * -strength);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [strength]);

  return { ref, offset };
}

function useTypewriter(text: string, active: boolean, speed = 28) {
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

/* ────────────────────────────────────────────────────────────────────────
   Sections
   ──────────────────────────────────────────────────────────────────────── */

function StatCard({ stat, index }: { stat: (typeof STATS)[number]; index: number }) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.25);
  const cardRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const [transform, setTransform] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const isPrimary = index % 2 === 0;
  const accent = isPrimary
    ? { chip: 'bg-primary-light text-primary', glow: 'rgba(249,115,22,0.22)' }
    : { chip: 'bg-secondary/10 text-secondary', glow: 'rgba(56,189,248,0.22)' };

  // Alternate entrance direction per column (assumes up to 4-wide grid)
  const col = index % 4;
  const entranceX = col === 0 ? -32 : col === 3 ? 32 : col === 1 ? -14 : 14;
  const entranceRotate = col % 2 === 0 ? -5 : 5;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTransform({ rx: y * -12, ry: x * 12, ix: x * 14, iy: y * 14 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTransform({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  return (
    <div
      ref={(node) => {
        viewRef.current = node;
        cardRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-lg sm:text-left"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `translate(0, 0) scale(1) rotate(0deg) perspective(700px) rotateX(${transform.rx}deg) rotateY(${transform.ry}deg)`
          : `translate(${entranceX}px, 36px) scale(0.88) rotate(${entranceRotate}deg)`,
        transition:
          'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease-out',
        transitionDelay: inView ? `${index * 110}ms` : '0ms',
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

      <div className="relative flex flex-col items-center gap-3 sm:items-start">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-150 ease-out',
            accent.chip
          )}
          style={{
            transform: `translate(${transform.ix}px, ${transform.iy}px) scale(${spot.active ? 1.12 : 1})`,
          }}
        >
          <Icon name={stat.icon} className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-extrabold text-primary sm:text-3xl">{stat.value}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
        </div>
      </div>
    </div>
  );
}

function OurStorySection() {
  const { ref: textRef, inView: textInView } = useInView<HTMLDivElement>(0.35);
  const { ref: imgWrapRef, inView: imgInView } = useInView<HTMLDivElement>(0.25);
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>(0.08);

  const heading = "Healthcare shouldn't depend on who you know";
  const words = heading.split(' ');

  return (
    <section className="relative overflow-hidden bg-tertiary py-20">
      <div className="animate-glow-pulse absolute -top-16 -left-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div
        className="animate-glow-pulse absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
        style={{ animationDelay: '2s' }}
      />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none" />

      <div className="relative mx-auto grid w-[95%] max-w-none grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div
          ref={textRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: textInView ? 1 : 0,
            transform: textInView ? 'translateX(0)' : 'translateX(-32px)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Why We Started</span>

          <h2 className="mt-2 flex flex-wrap text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="mr-[0.3em] inline-block transition-all duration-500 ease-out"
                style={{
                  opacity: textInView ? 1 : 0,
                  transform: textInView ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: `${150 + i * 55}ms`,
                }}
              >
                {word}
              </span>
            ))}
          </h2>

          <p
            className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-500 transition-all duration-700 ease-out"
            style={{
              opacity: textInView ? 1 : 0,
              transform: textInView ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: '450ms',
            }}
          >
            In much of Nepal, finding the right doctor or the nearest verified lab still means
            phone calls, word of mouth, and a lot of guesswork — especially outside the biggest
            cities.
          </p>

          <p
            className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600 transition-all duration-700 ease-out"
            style={{
              opacity: textInView ? 1 : 0,
              transform: textInView ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: '600ms',
            }}
          >
            Zeniva exists to close that gap. We built a single, searchable directory of
            verified doctors, diagnostic centers, pharmacies, and hospitals — with real
            booking, not just a phone number to try your luck with — so that quality of care
            depends on the platform doing its job, not on personal connections.
          </p>
        </div>

        <div
          ref={imgWrapRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: imgInView ? 1 : 0,
            transform: imgInView ? 'translateX(0)' : 'translateX(32px)',
          }}
        >
          <div
            ref={parallaxRef}
            className="relative overflow-hidden rounded-2xl shadow-xl shadow-primary/20 ring-1 ring-primary/10"
          >
            <img
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=900&h=700&fit=crop&auto=format"
              alt="Doctor reviewing a patient's medical history on a tablet"
              className="h-[340px] w-full object-cover animate-kenburns sm:h-[420px]"
              style={{ transform: `translateY(${offset}px) scale(1.1)` }}
            />

            {/* Two-tone color wash tying primary + secondary together */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06222e]/45 via-transparent to-primary/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.25),transparent_45%)]" />

            {/* Floating credential badge */}
            <div className="animate-float-slow absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon name="shield" className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-700">Every record, verified</span>
            </div>
          </div>

          {/* Secondary accent chip beneath the image */}
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary transition-all duration-700 ease-out"
            style={{
              opacity: imgInView ? 1 : 0,
              transform: imgInView ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: '350ms',
            }}
          >
            <Icon name="trending" className="h-3.5 w-3.5" />
            Growing every week
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  const { ref: sectionRef, inView } = useInView<HTMLDivElement>(0.4);

  const text =
    "To make quality healthcare in Nepal as easy to reach as a search bar — verified providers, transparent information, and care that's never more than a few taps away.";
  const typedText = useTypewriter(text, inView, 14);
  const doneTyping = typedText.length === text.length;

  return (
    <section className="bg-white py-16">
      <div ref={sectionRef} className="mx-auto w-[90%] max-w-4xl text-center">
        <span
          className="text-xs font-bold uppercase tracking-wider text-primary transition-opacity duration-500 ease-out"
          style={{ opacity: inView ? 1 : 0 }}
        >
          Our Mission
        </span>

        <p className="mt-4 min-h-[6em] text-xl sm:text-2xl font-semibold leading-snug text-slate-800 sm:min-h-[3.6em]">
          {typedText}
          <span
            className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
            style={{ opacity: doneTyping ? 0 : 1 }}
          />
        </p>
      </div>
    </section>
  );
}

function BuiltForNepalSection() {
  const { ref: imgWrapRef, inView: imgInView } = useInView<HTMLDivElement>(0.3);
  const { ref: textRef, inView: textInView } = useInView<HTMLDivElement>(0.35);
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>(0.08);

  const heading = 'Care mapped down to your municipality';
  const typedHeading = useTypewriter(heading, textInView, 26);
  const doneTyping = typedHeading.length === heading.length;

  const points = [
    'Coverage across all 7 provinces and 77 districts',
    'Hospital and doctor network growing every week',
    'Local phone support for booking assistance',
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto grid w-[95%] max-w-none grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div
          ref={imgWrapRef}
          className="transition-all duration-700 ease-out lg:order-1"
          style={{
            opacity: imgInView ? 1 : 0,
            transform: imgInView ? 'translateX(0)' : 'translateX(-32px)',
          }}
        >
          <div
            ref={parallaxRef}
            className="relative overflow-hidden rounded-2xl shadow-xl shadow-primary/20 ring-1 ring-secondary/10"
          >
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&h=700&fit=crop&auto=format"
              alt="A partner hospital building in Nepal"
              className="h-[320px] w-full object-cover animate-kenburns sm:h-[400px]"
              style={{ transform: `translateY(${offset}px) scale(1.1)` }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06222e]/40 via-transparent to-secondary/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.22),transparent_45%)]" />

            {/* Floating coverage badge */}
            <div className="animate-float-slow absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <Icon name="mapPin" className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-700">77 districts, live</span>
            </div>
          </div>
        </div>

        <div
          ref={textRef}
          className="transition-all duration-700 ease-out lg:order-2"
          style={{
            opacity: textInView ? 1 : 0,
            transform: textInView ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">Built for Nepal</span>

          <h2 className="mt-2 min-h-[2.4em] text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 sm:min-h-[1.2em]">
            {typedHeading}
            <span
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-primary transition-opacity"
              style={{ opacity: doneTyping ? 0 : 1 }}
            />
          </h2>

          <p
            className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-500 transition-all duration-700 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            We work with hospitals and clinics across all seven provinces, with location data
            down to the municipality level — so wherever you are, you can find care nearby.
          </p>

          <ul className="mt-6 space-y-4">
            {points.map((line, i) => (
              <li
                key={line}
                className="flex items-start gap-3 transition-all duration-500 ease-out"
                style={{
                  opacity: doneTyping ? 1 : 0,
                  transform: doneTyping ? 'translateX(0)' : 'translateX(-16px)',
                  transitionDelay: `${150 + i * 130}ms`,
                }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="check" className="w-3 h-3" />
                </span>
                <span className="text-sm text-slate-600">{line}</span>
              </li>
            ))}
          </ul>

          <div
            className="mt-8 transition-all duration-500 ease-out"
            style={{
              opacity: doneTyping ? 1 : 0,
              transform: doneTyping ? 'translateY(0)' : 'translateY(10px)',
              transitionDelay: `${150 + points.length * 130 + 100}ms`,
            }}
          >
            <a
              href={SUPPORT_TEL}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Icon name="phone" className="w-4 h-4" />
              Speak with our team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function GalleryCard({ img, index }: { img: (typeof GALLERY)[number]; index: number }) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.2);
  const cardRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const [transform, setTransform] = useState({ rx: 0, ry: 0 });
  const [active, setActive] = useState(false);

  // Alternate entrance direction per column (4-wide grid on desktop, 2-wide on mobile)
  const col4 = index % 4;
  const entranceX = col4 === 0 ? -30 : col4 === 3 ? 30 : col4 === 1 ? -14 : 14;
  const entranceRotate = col4 % 2 === 0 ? -4 : 4;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform({ rx: y * -8, ry: x * 8 });
  };

  const handleMouseLeave = () => {
    setTransform({ rx: 0, ry: 0 });
    setActive(false);
  };

  return (
    <div
      ref={(node) => {
        viewRef.current = node;
        cardRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-xl"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `translate(0, 0) scale(1) rotate(0deg) perspective(800px) rotateX(${transform.rx}deg) rotateY(${transform.ry}deg)`
          : `translate(${entranceX}px, 32px) scale(0.9) rotate(${entranceRotate}deg)`,
        transition:
          'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease-out',
        transitionDelay: inView ? `${index * 90}ms` : '0ms',
      }}
    >
      <img
        src={img.src}
        alt={img.alt}
        className="h-full w-full object-cover transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${active ? 1.08 : 1})`,
        }}
      />

      {/* Subtle gradient wash that appears on hover, ties into your brand colors */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06222e]/50 via-transparent to-transparent transition-opacity duration-300"
        style={{ opacity: active ? 1 : 0 }}
      />
    </div>
  );
}

function MagneticButton({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: 'solid' | 'outline';
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: x * 0.25, y: y * 0.35 });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  const styles =
    variant === 'solid'
      ? 'bg-white text-secondary hover:bg-slate-100 hover:shadow-lg hover:shadow-white/20'
      : 'border-2 border-white text-white hover:bg-white/15';

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors',
        styles
      )}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.15s ease-out, background-color 0.2s, box-shadow 0.2s',
      }}
    >
      {children}
    </Link>
  );
}

function CtaSection() {
  const { ref: contentRef, inView } = useInView<HTMLDivElement>(0.35);

  return (
    <section className="relative flex min-h-[360px] items-center overflow-hidden sm:min-h-[420px]">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1516841273335-e39b37888115?w=1600&h=800&fit=crop&auto=format"
          alt="Hospital corridor representing Zeniva's partner network"
          className="h-full w-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/75 to-primary/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(56,189,248,0.2),transparent_45%)]" />
      </div>

      <div ref={contentRef} className="relative mx-auto flex w-[90%] max-w-4xl flex-col items-center gap-6 text-center">
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider text-white/80 transition-all duration-500 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            Get Started
          </span>

          <h2
            className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white transition-all duration-600 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '120ms',
            }}
          >
            Ready to get the care you need?
          </h2>

          <p
            className="mt-3 text-sm sm:text-base leading-relaxed text-white/80 transition-all duration-600 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(14px)',
              transitionDelay: '240ms',
            }}
          >
            Book a doctor, schedule a test, or reach us directly — our team is here to help.
          </p>
        </div>

        <div
          className="flex flex-wrap justify-center gap-3 transition-all duration-600 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.94)',
            transitionDelay: '360ms',
          }}
        >
          <MagneticButton href="/book-doctor" variant="solid">
            Book Appointment
          </MagneticButton>
          <MagneticButton href="/contact" variant="outline">
            Contact Us
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

function ValueCard({ item, index }: { item: (typeof VALUES)[number]; index: number }) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>(0.25);
  const cardRef = useRef<HTMLDivElement | null>(null) as React.MutableRefObject<HTMLDivElement | null>;
  const [transform, setTransform] = useState({ rx: 0, ry: 0, ix: 0, iy: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false });

  const isPrimary = index % 2 === 0;
  const accent = isPrimary
    ? { ring: 'ring-primary/30', glow: 'rgba(249,115,22,0.25)' }
    : { ring: 'ring-secondary/30', glow: 'rgba(56,189,248,0.25)' };

  // Alternate the entrance direction per card so the grid doesn't feel flat
  const col = index % 4;
  const entranceX = col === 0 ? -36 : col === 3 ? 36 : col === 1 ? -18 : 18;
  const entranceRotate = col % 2 === 0 ? -6 : 6;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const x = px - 0.5;
    const y = py - 0.5;

    setTransform({ rx: y * -10, ry: x * 10, ix: x * 16, iy: y * 16 });
    setSpot({ x: px * 100, y: py * 100, active: true });
  };

  const handleMouseLeave = () => {
    setTransform({ rx: 0, ry: 0, ix: 0, iy: 0 });
    setSpot((s) => ({ ...s, active: false }));
  };

  return (
    <div
      ref={(node) => {
        viewRef.current = node;
        cardRef.current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-100 bg-tertiary p-6 text-center transition-shadow duration-200 hover:shadow-lg',
        `ring-0 hover:${accent.ring}`
      )}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `translate(0, 0) scale(1) rotate(0deg) perspective(700px) rotateX(${transform.rx}deg) rotateY(${transform.ry}deg)`
          : `translate(${entranceX}px, 40px) scale(0.88) rotate(${entranceRotate}deg)`,
        transition:
          'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease-out',
        transitionDelay: inView ? `${index * 110}ms` : '0ms',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(160px circle at ${spot.x}% ${spot.y}%, ${accent.glow}, transparent 70%)`,
        }}
      />

      <div
        className="relative mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${transform.ix}px, ${transform.iy}px) scale(${spot.active ? 1.15 : 1})`,
        }}
      >
        <Icon name={item.icon} />
      </div>

      <h3 className="relative text-base font-bold text-slate-800">{item.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
    </div>
  );
}


/* ────────────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">
        {/* ══ HERO — full-bleed image ═══════════════════════════════ */}
        <section className="relative flex min-h-[520px] items-end overflow-hidden sm:min-h-[600px]">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="/images/Online.jpeg"
              alt="Doctor consulting a patient through Zeniva Health"
              className="h-full w-full object-cover object-center animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f3d]/90 via-[#0e3b4a]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06222e]/85 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(56,189,248,0.22),transparent_42%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(20,184,166,0.15),transparent_38%)]" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
          </div>

          <div
            className="animate-fade-up absolute right-8 top-24 hidden lg:block"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="animate-float-slow flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-md ring-1 ring-white/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div className="text-left">
                <div className="text-sm font-bold text-white">300+ Verified Doctors</div>
                <div className="text-xs text-white/70">Across 77 districts</div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-[95%] max-w-none pb-16 pt-24 sm:pb-20">
            <span
              className="animate-fade-up inline-block text-xs font-bold uppercase tracking-wider text-sky-300/90 mb-3"
              style={{ animationDelay: '0.1s' }}
            >
              About Zeniva
            </span>

            <h1
              className="animate-fade-up max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white"
              style={{ animationDelay: '0.25s' }}
            >
              Nepal&apos;s Complete Health Facilitator
            </h1>

            <p
              className="animate-fade-up mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/85"
              style={{ animationDelay: '0.4s' }}
            >
              We connect patients with doctors, diagnostic labs, hospitals, and emergency
              services across Nepal — all from one platform, so getting care never depends on
              who you happen to know.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: '0.55s' }}
            >
              <Link
                href="/book-doctor"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg hover:shadow-white/20"
              >
                Book Appointment
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/15"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </section>

        {/* ══ STATS STRIP — animated background image + staggered stat cards ══ */}
        <section className="relative overflow-hidden border-b border-slate-100 py-16">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1516841273335-e39b37888115?w=1600&h=500&fit=crop&auto=format"
              alt=""
              className="h-full w-full object-cover animate-kenburns"
            />
            <div className="absolute inset-0 bg-white/90" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/85 to-white/90" />
          </div>

          <div className="relative mx-auto grid w-[95%] max-w-none grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {STATS.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </section>

       {/* ══ MISSION ═══════════════════════════════════════════════ */}
<MissionSection />
        {/* ══ OUR STORY — image right, scroll-reactive ═══════════════ */}
        <OurStorySection />

        {/* ══ FULL-WIDTH IMAGE BANNER ═══════════════════════════════ */}
        <section className="relative flex min-h-[360px] items-center overflow-hidden sm:min-h-[420px]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1600&h=800&fit=crop&auto=format"
              alt="Exterior view of a Zeniva partner hospital"
              className="h-full w-full object-cover animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a2f3d]/88 via-[#0e3b4a]/70 to-primary/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(56,189,248,0.2),transparent_45%)]" />
          </div>

          <div className="animate-fade-up relative mx-auto w-[90%] max-w-3xl text-center" style={{ animationDelay: '0.15s' }}>
            <svg className="mx-auto mb-4 h-9 w-9 text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H5.5a2.83 2.83 0 012.83-2.83V6zm10 0A5.17 5.17 0 0012 11.17V18h6.83v-6.83H15.5a2.83 2.83 0 012.83-2.83V6z" />
            </svg>
            <p className="text-xl sm:text-2xl font-semibold leading-snug text-white">
              &ldquo;We don&apos;t just list hospitals — every listing on Zeniva has been checked, so
              the badge means something.&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-white/75">
              Zeniva Verification Standard
            </p>
          </div>
        </section>

        {/* ══ BUILT FOR NEPAL — image left, scroll-reactive ══════════ */}
        <BuiltForNepalSection />

       {/* ══ HOW WE VERIFY ═════════════════════════════════════════ */}
<div className="relative mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
  <div className="absolute left-[calc(16.5%+2rem)] right-[calc(16.5%+2rem)] top-8 hidden h-px bg-gradient-to-r from-primary via-secondary to-primary opacity-25 md:block" />
  {VERIFICATION_STEPS.map((item, index) => (
    <StepCard key={item.step} item={item} index={index} />
  ))}
</div>

        {/* ══ OUR VALUES ════════════════════════════════════════════ */}
       <section className="bg-white py-20">
  <div className="mx-auto w-[95%] max-w-none">
    <SectionHeader eyebrow="What Drives Us" title="Our Values" align="center" />
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map((item, index) => (
        <ValueCard key={item.title} item={item} index={index} />
      ))}
    </div>
  </div>
</section>

      {/* ══ GALLERY — image grid ══════════════════════════════════ */}
<section className="bg-tertiary py-20">
  <div className="mx-auto w-[95%] max-w-none">
    <SectionHeader
      eyebrow="Inside Our Network"
      title="Partner hospitals, labs, and pharmacies"
      subtitle="A look at the kind of facilities behind every Zeniva listing."
      align="center"
    />
    <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {GALLERY.map((img, index) => (
        <GalleryCard key={img.src} img={img} index={index} />
      ))}
    </div>
  </div>
</section>
        {/* ══ CTA — full-bleed image ════════════════════════════════ */}
        {/* ══ CTA — full-bleed image ════════════════════════════════ */}
<CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
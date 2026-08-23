'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useApi } from '@/hooks/useApi';
import { hospitalApi } from '@/lib/api';
import { Hospital } from '@/types';
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

const HEALTH_TIPS = [
  {
    title: 'Staying Hydrated in the Monsoon',
    excerpt: 'Simple habits to keep your fluid intake balanced during Nepal’s humid months.',
  },
  {
    title: 'Understanding Your Annual Checkup',
    excerpt: 'What a routine physical actually screens for, and why it matters every year.',
  },
  {
    title: 'When to Choose Telehealth vs. In-Person',
    excerpt: 'A quick guide to picking the right kind of consultation for your symptoms.',
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

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</span>
      <h2 className="mt-2 text-3xl font-bold text-slate-800 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

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

function HeroSearchBar() {
  const router = useRouter();
  const [category, setCategory] = useState<SearchCategory>('doctor');
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
    router.push(`${SEARCH_ROUTES[category]}${params}`);
  };

  const categories: { id: SearchCategory; label: string }[] = [
    { id: 'doctor', label: 'Doctor' },
    { id: 'test', label: 'Test' },
    { id: 'medicine', label: 'Medicine' },
  ];

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-xl bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-primary/10 p-2 flex flex-col sm:flex-row gap-2"
    >
      <div className="flex shrink-0 rounded-xl bg-white/60 p-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
              category === c.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search for a ${category}...`}
        className="flex-1 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      <Button type="submit" size="md">
        Search
      </Button>
    </form>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-white to-secondary/10">
      {/* Corner glow accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

      {/* Ambient background texture */}
      <div
        className="absolute top-0 inset-x-0 h-64 w-full pointer-events-none opacity-[0.27]"
        style={{
          backgroundImage: 'url(/images/pattern-randomized-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      />

      <div className="relative w-[95%] max-w-none mx-auto py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            Nepal&apos;s Complete Health Facilitator
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Your health, <span className="text-primary">one platform</span> away.
          </h1>
          <p className="mt-5 text-base text-slate-500 leading-relaxed max-w-lg">
            Book trusted doctors, schedule diagnostics, order medicines, and reach emergency services
            &mdash; all from a single, secure portal built for Nepal.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book-doctor">
              <Button size="lg">Book a Doctor</Button>
            </Link>
            <Link href="/book-diagnostics">
              <Button size="lg" variant="outline">Book Diagnostics</Button>
            </Link>
            <Link href="/buy-medicines">
              <Button size="lg" variant="outline">Buy Medicines</Button>
            </Link>
          </div>

          <div className="mt-10">
            <HeroSearchBar />
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-5">
          <div className="rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-white/60">
            <img
              src="/images/Online.jpeg"
              alt="Zeniva Health Care — connecting patients and doctors through telemedicine"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Partner Hospitals', value: '50+', color: 'bg-primary text-white' },
              { label: 'Verified Doctors', value: '300+', color: 'bg-white text-slate-800 border border-slate-100' },
              { label: 'Districts Covered', value: '77', color: 'bg-white text-slate-800 border border-slate-100' },
              { label: 'Emergency Response', value: '24/7', color: 'bg-secondary text-white' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn('rounded-xl p-3 shadow-sm flex flex-col gap-0.5', stat.color)}
              >
                <span className="text-lg font-extrabold">{stat.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 leading-tight">{stat.label}</span>
              </div>
            ))}
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

function WhyChooseUsSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader
          eyebrow="Why Zeniva"
          title="Built for trust, made for speed"
          subtitle="The essentials you'd expect from a platform handling your family's health."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-primary-light text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedServicesSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader
          eyebrow="What we offer"
          title="Featured Services"
          subtitle="Everything you need for your family's health, organized in one place."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVICES.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className={cn(
                'group bg-white p-6 rounded-xl border border-slate-100 border-l-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200',
                service.accent,
                service.glow
              )}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', service.color)}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {service.icon}
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{service.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Explore
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader eyebrow="Simple by design" title="How It Works" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div
            className="hidden md:block absolute top-10 left-0 right-0 border-t-2 border-dashed border-primary/40"
            style={{ marginLeft: '16.6%', marginRight: '16.6%' }}
          />
          {HOW_IT_WORKS.map((item, index) => (
            <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
              <span
                className={cn(
                  'relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-3xl font-extrabold mb-6 shadow-md ring-8',
                  index % 2 === 0 ? 'bg-primary shadow-primary/20 ring-primary/10' : 'bg-secondary shadow-secondary/20 ring-secondary/10'
                )}
              >
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function PartnerHospitalsSection() {
  const { data: hospitals, isLoading, error, execute: fetchHospitals } = useApi(hospitalApi.getAll);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const visible = hospitals?.slice(0, 6) ?? [];

  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader
          eyebrow="Trusted network"
          title="Partner Hospitals & Labs"
          subtitle="We work with verified healthcare providers across Nepal."
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium text-center">
            Could not load partner hospitals right now.
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
            New partner hospitals are being onboarded. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((hospital: Hospital) => (
              <div
                key={hospital.id}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Verified Partner
                </span>
                <h3 className="text-base font-bold text-slate-800">{hospital.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {hospital.municipality?.name ?? "City not listed"}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {hospital.phone ?? "Phone not listed"}
                </p>
                <Link
                  href={`/hospitals/${hospital.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  View details &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/health-directory"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white text-base font-bold shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg transition-all"
          >
            View all hospitals &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function HealthTipsSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader eyebrow="Stay informed" title="Health Tips & Highlights" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HEALTH_TIPS.map((tip) => (
            <div key={tip.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                Health Tip
              </span>
              <h3 className="text-base font-bold text-slate-800">{tip.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{tip.excerpt}</p>
              <span className="inline-block mt-4 text-xs font-semibold text-slate-400">Full articles coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-white">
      <SectionGlow flip />
      <div className="relative w-[95%] max-w-none mx-auto">
        <SectionHeader eyebrow="What patients say" title="Testimonials" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <svg className="w-8 h-8 text-primary/30 mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.17 6A5.17 5.17 0 002 11.17V18h6.83v-6.83H5.5a2.83 2.83 0 012.83-2.83V6zm10 0A5.17 5.17 0 0012 11.17V18h6.83v-6.83H15.5a2.83 2.83 0 012.83-2.83V6z" />
              </svg>
              <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    question: 'How do I book a doctor appointment on Zeniva?',
    answer: 'Search by doctor name, specialty, or hospital, pick an open slot, and confirm — you\'ll get instant confirmation, no phone calls needed.',
  },
  {
    question: 'Can I upload a prescription for tests or medicines?',
    answer: 'Yes. Both the diagnostics and e-Pharmacy flows let you attach a prescription photo or PDF when placing your order.',
  },
  {
    question: 'Is my health data kept private?',
    answer: 'Your records and bookings live on a secure, encrypted portal and are only shared with providers you choose to see.',
  },
  {
    question: 'What if I need emergency care right now?',
    answer: 'Use the Ambulance Service on our Hospital Directory to locate and call the nearest verified dispatch immediately.',
  },
  {
    question: 'Which parts of Nepal does Zeniva cover?',
    answer: 'We work with partner hospitals and clinics across all 77 districts, with the deepest coverage in major cities.',
  },
];

function FaqSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-tertiary">
      <SectionGlow />
      <div className="relative w-[80%] max-w-none mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 lg:gap-14 items-center">
        <div className="hidden lg:block rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-white/60 bg-white">
          <img
            src="/images/FAQ.jpg"
            alt="Doctor answering frequently asked questions"
            className="w-full h-auto object-cover"
          />
        </div>

        <div>
          <SectionHeader eyebrow="Questions?" title="Frequently Asked Questions" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white rounded-xl border border-slate-100 shadow-sm p-6 [&::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-slate-800">
                  {faq.question}
                  <svg
                    className="w-5 h-5 shrink-0 text-primary transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
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
            href="tel:+97714440000"
            className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium bg-white text-secondary hover:bg-slate-100 transition-colors"
          >
            Call +977-1-4440000
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
        <HealthTipsSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
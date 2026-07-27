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
    color: 'text-primary bg-primary-light',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Diagnostics & Lab Tests',
    description: 'Book MRI, CT scans, ultrasounds, and lab work with prescription upload support.',
    href: '/book-diagnostics',
    color: 'text-secondary bg-secondary/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    ),
  },
  {
    title: 'e-Pharmacy',
    description: 'Order prescription drugs, OTC products, and supplements with home delivery.',
    href: '/buy-medicines',
    color: 'text-primary bg-primary-light',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2a1 1 0 00-1 1v2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9zm1 7a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2H8a1 1 0 110-2h2V9z" />
    ),
  },
  {
    title: 'Ambulance Service',
    description: 'Locate the nearest verified ambulance and call for emergency dispatch instantly.',
    href: '/health-directory',
    color: 'text-secondary bg-secondary/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    title: 'Hospital Directory',
    description: 'Browse our network of partner hospitals and clinics across every district.',
    href: '/health-directory',
    color: 'text-primary bg-primary-light',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    title: 'Health Records',
    description: 'Keep your medical history in one place and share it securely with your doctor.',
    href: '/login',
    color: 'text-secondary bg-secondary/10',
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
      className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-2 flex flex-col sm:flex-row gap-2"
    >
      <div className="flex shrink-0 rounded-xl bg-slate-50 p-1">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
              <Button size="lg" variant="ghost">Buy Medicines</Button>
            </Link>
          </div>

          <div className="mt-10">
            <HeroSearchBar />
          </div>
        </div>

        <div className="hidden lg:flex justify-center">
          <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
            {[
              { label: 'Partner Hospitals', value: '50+', color: 'bg-primary text-white' },
              { label: 'Verified Doctors', value: '300+', color: 'bg-white text-slate-800 border border-slate-100' },
              { label: 'Districts Covered', value: '77', color: 'bg-white text-slate-800 border border-slate-100' },
              { label: 'Emergency Response', value: '24/7', color: 'bg-secondary text-white' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn('rounded-2xl p-6 shadow-md flex flex-col gap-1', stat.color)}
              >
                <span className="text-3xl font-extrabold">{stat.value}</span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="group bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/25 transition-all duration-200"
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
    <section className="py-20 bg-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Simple by design" title="How It Works" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-slate-200" style={{ marginLeft: '16.6%', marginRight: '16.6%' }} />
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
              <span className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-3xl font-extrabold mb-6 shadow-md shadow-primary/20">
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-base font-bold text-slate-800">{hospital.name}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{hospital.address}</p>
                <p className="mt-3 text-xs font-semibold text-primary">{hospital.phone}</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/health-directory" className="text-sm font-semibold text-primary hover:text-primary-hover">
            View all hospitals &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function HealthTipsSection() {
  return (
    <section className="py-20 bg-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

function ContactCtaSection() {
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Need help or have a question?
          </h2>
          <p className="mt-2 text-primary-light/90">
            Our support team is available around the clock for emergencies and general inquiries.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="tel:+97714440000"
            className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-lg font-medium bg-white text-primary hover:bg-slate-100 transition-colors"
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
        <FeaturedServicesSection />
        <HowItWorksSection />
        <PartnerHospitalsSection />
        <HealthTipsSection />
        <TestimonialsSection />
        <ContactCtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}

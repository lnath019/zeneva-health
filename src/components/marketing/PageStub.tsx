import React from 'react';
import Link from 'next/link';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

interface PageStubProps {
  title: string;
  description: string;
}

export function PageStub({ title, description }: PageStubProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-lg text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Coming Soon
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
          <p className="mt-3 text-slate-500 leading-relaxed">{description}</p>
          <Link
            href="/"
            className="inline-block mt-8 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

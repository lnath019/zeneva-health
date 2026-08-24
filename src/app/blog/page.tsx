'use client';

import React, { useEffect, useState } from 'react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { BlogCard } from '@/components/marketing/BlogCard';
import { Spinner } from '@/components/ui/Spinner';
import { blogApi } from '@/lib/api';
import { Blog, BlogType } from '@/types';
import { cn } from '@/lib/utils';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [types, setTypes] = useState<BlogType[]>([]);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [blogRes, typeRes] = await Promise.all([
          blogApi.getAll(activeType ? { type: activeType } : undefined),
          blogApi.getTypes(),
        ]);
        if (cancelled) return;
        setBlogs(blogRes.blogs);
        setTypes(typeRes.blogTypes);
        setError(null);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load articles');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeType]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              Blog
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Health Tips &amp; Highlights</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Practical guidance from our clinical network — on staying well, understanding your
              care, and getting the most out of Zeniva.
            </p>
          </div>

          {types.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveType(null)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  activeType === null
                    ? 'bg-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
                )}
              >
                All
              </button>
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.slug)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    activeType === t.slug
                      ? 'bg-primary text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
              No articles published yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

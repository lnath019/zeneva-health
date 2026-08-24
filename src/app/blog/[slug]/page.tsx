'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { RichTextContent } from '@/components/ui/RichTextEditor';
import { Spinner } from '@/components/ui/Spinner';
import { blogApi, mediaUrl } from '@/lib/api';
import { Blog } from '@/types';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export default function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    blogApi
      .getBySlug(String(slug))
      .then((res) => {
        if (!cancelled) setBlog(res.blog);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this article');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const image = mediaUrl(blog?.imageUrl);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : error || !blog ? (
            <div className="text-center py-16">
              <h1 className="text-2xl font-extrabold text-slate-900">Article not found</h1>
              <p className="mt-2 text-slate-500">{error ?? 'This article may have been removed.'}</p>
              <Link href="/blog" className="mt-6 inline-block text-primary font-semibold hover:underline">
                ← Back to all articles
              </Link>
            </div>
          ) : (
            <article>
              <Link href="/blog" className="text-sm text-primary font-semibold hover:underline">
                ← All articles
              </Link>

              <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-secondary">
                {blog.blogType?.name ?? 'Article'}
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {blog.topic}
              </h1>
              <p className="mt-3 text-sm text-slate-400">
                {blog.author?.fullName ? `By ${blog.author.fullName} · ` : ''}
                {formatDate(blog.createdAt)}
              </p>

              {blog.summary && (
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">{blog.summary}</p>
              )}

              {image && (
                <img
                  src={image}
                  alt={blog.topic}
                  className="mt-8 w-full rounded-2xl border border-slate-100 object-cover"
                />
              )}

              <div className="mt-8 border-t border-slate-100 pt-8">
                <RichTextContent html={blog.description} />
              </div>
            </article>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

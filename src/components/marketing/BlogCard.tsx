'use client';

import React from 'react';
import Link from 'next/link';
import { Blog } from '@/types';
import { mediaUrl } from '@/lib/api';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Blog teaser used on the homepage feature strip and the blog index.
 * Thumbnail and copy sit side by side rather than stacked, matching the
 * row layout used across the marketing cards.
 */
export function BlogCard({ blog }: { blog: Blog }) {
  const image = mediaUrl(blog.imageUrl);

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex items-start gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 hover:border-primary/25 transition-all duration-200"
    >
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary/10 flex items-center justify-center">
        {image ? (
          <img src={image} alt={blog.topic} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        )}
      </div>

      <div className="min-w-0">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary">
          {blog.blogType?.name ?? 'Article'}
        </span>
        <h3 className="mt-1 text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
          {blog.topic}
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-3">{blog.excerpt}</p>
        <p className="mt-3 text-xs text-slate-400">
          {blog.author?.fullName ? `${blog.author.fullName} · ` : ''}
          {formatDate(blog.createdAt)}
        </p>
      </div>
    </Link>
  );
}

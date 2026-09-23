"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toCartProduct, Product } from "@/data/products";
import { productApi } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS. Injected via dangerouslySetInnerHTML so
   server & client render the same bytes (no HTML escaping).
   All animations use transform / opacity for GPU acceleration.
   ───────────────────────────────────────────────────────────── */
const LISTING_CSS = `
  @keyframes bp-fade-up {
    from { opacity: 0; transform: translate3d(0, 24px, 0) scale(0.98); }
    to   { opacity: 1; transform: translate3d(0, 0, 0)    scale(1); }
  }
  @keyframes bp-fade-in {
    from { opacity: 0; transform: translate3d(0, 10px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes bp-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes bp-pulse-dot {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.4); }
  }

  .bp-hero   { animation: bp-fade-in 0.55s ease-out both; }
  .bp-filter { animation: bp-fade-in 0.55s ease-out both; animation-delay: 90ms; }
  .bp-count  { animation: bp-fade-in 0.5s  ease-out both; animation-delay: 150ms; }

  .bp-cell {
    animation: bp-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i, 0) * 55ms);
  }

  .bp-skeleton {
    background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
    background-size: 800px 100%;
    animation: bp-shimmer 1.4s linear infinite;
  }

  .bp-dot { animation: bp-pulse-dot 2s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .bp-hero, .bp-filter, .bp-count, .bp-cell, .bp-skeleton, .bp-dot {
      animation: none !important;
    }
  }

  /* ── Equal-height grid cells + bottom-anchored CTA ──────────
     Works with any ProductCard internals. */
  .bp-grid { grid-auto-rows: 1fr; }
  .bp-grid > .bp-cell { display: flex; height: 100%; }
  .bp-grid > .bp-cell > * {
    display: flex; flex-direction: column;
    width: 100%; height: 100%;
  }
  .bp-grid > .bp-cell > * > *:last-child,
  .bp-grid > .bp-cell > * > *:last-child > button:last-of-type,
  .bp-grid > .bp-cell > * > button:last-of-type {
    margin-top: auto;
  }

  /* ── Image hover zoom (applies to any img inside a product cell) ── */
  .bp-cell img {
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                filter    0.35s ease;
    will-change: transform;
    transform-origin: center;
  }
  .bp-cell:hover img {
    transform: scale(1.08);
    filter: brightness(1.02);
  }
  /* Whole-card lift on hover for extra polish */
  .bp-cell > * {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease;
    will-change: transform;
  }
  .bp-cell:hover > * {
    transform: translateY(-4px);
    box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.18);
  }
  @media (prefers-reduced-motion: reduce) {
    .bp-cell img,
    .bp-cell > * { transition: none !important; }
    .bp-cell:hover img { transform: none !important; filter: none !important; }
    .bp-cell:hover > * { transform: none !important; }
  }
`;

export default function BuyMedicinesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  /* Fetch once, guard against unmount + stale closures */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productApi.getAll();
        if (!cancelled) setProducts(res.products.map(toCartProduct));
      } catch (err: unknown) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Derived lists — memoized so they only recompute when inputs change */
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory),
    [products, activeCategory]
  );

  /* Stable handler so memoized CategoryPill doesn't re-render on every parent render */
  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  const hasProducts = !loading && !error && visibleProducts.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <MarketingHeader />
      <main className="flex-1">
        {/* dangerouslySetInnerHTML bypasses React's text escaping → SSR/CSR match */}
        <style dangerouslySetInnerHTML={{ __html: LISTING_CSS }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* ── Hero ──────────────────────────────────────────── */}
          <header className="bp-hero relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 mb-8 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="bp-dot absolute inline-flex h-full w-full rounded-full bg-secondary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
                e-Pharmacy
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Buy Medicines &amp; Essentials
              </h1>
              <p className="mt-3 text-slate-500 max-w-2xl leading-relaxed">
                Everyday health, first aid, and personal care products delivered to your
                door — verified suppliers, secure checkout, fast delivery.
              </p>
            </div>
          </header>

          {/* ── Category filters ──────────────────────────────── */}
          {!loading && !error && categories.length > 0 && (
            <div className="bp-filter flex flex-wrap gap-2 mb-6">
              <CategoryPill
                category="All"
                active={activeCategory === "All"}
                onSelect={handleSelectCategory}
              >
                All Products
              </CategoryPill>
              {categories.map((category) => (
                <CategoryPill
                  key={category}
                  category={category}
                  active={activeCategory === category}
                  onSelect={handleSelectCategory}
                >
                  {category}
                </CategoryPill>
              ))}
            </div>
          )}

          {/* ── Loading skeleton ─────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 bp-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────── */}
          {!loading && error && (
            <div className="bp-filter mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* ── Empty ─────────────────────────────────────────── */}
          {!loading && !error && visibleProducts.length === 0 && (
            <div className="bp-filter mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 2a1 1 0 00-1 1v2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9z"
                  />
                </svg>
              </span>
              <p className="mt-4 text-sm font-medium text-slate-500">
                No products available yet. Check back soon.
              </p>
            </div>
          )}

          {/* ── Product grid ──────────────────────────────────── */}
          {hasProducts && (
            <>
              <p className="bp-count mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Showing {visibleProducts.length}{" "}
                {visibleProducts.length === 1 ? "product" : "products"}
                {activeCategory !== "All" && ` in ${activeCategory}`}
              </p>

              <div
                key={activeCategory}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 bp-grid items-stretch"
              >
                {visibleProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="bp-cell"
                    style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Memoized sub-components (kept outside the parent so their
   identity is stable across renders).
   ───────────────────────────────────────────────────────────── */

const CategoryPill = React.memo(function CategoryPill({
  category,
  active,
  onSelect,
  children,
}: {
  category: string;
  active: boolean;
  onSelect: (category: string) => void;
  children: React.ReactNode;
}) {
  const handleClick = useCallback(() => onSelect(category), [category, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={cn(
        "relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "bg-primary text-white shadow-sm shadow-primary/30 scale-[1.02]"
          : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary hover:-translate-y-0.5"
      )}
    >
      {children}
    </button>
  );
});

const ProductSkeleton = React.memo(function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="bp-skeleton aspect-square rounded-xl" />
      <div className="bp-skeleton mt-4 h-3 w-1/3 rounded-full" />
      <div className="bp-skeleton mt-3 h-4 w-full rounded-full" />
      <div className="bp-skeleton mt-2 h-4 w-3/4 rounded-full" />
      <div className="bp-skeleton mt-5 h-10 w-full rounded-lg" />
    </div>
  );
});
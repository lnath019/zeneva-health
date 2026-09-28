"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toCartProduct, Product } from "@/data/products";
import { productApi } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/shop/ProductCard";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

const DETAIL_CSS = `
  @keyframes pd-fade-up {
    from { opacity: 0; transform: translate3d(0, 18px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes pd-fade-in {
    from { opacity: 0; transform: translate3d(0, 10px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes pd-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }
  @keyframes pd-check {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }

  .pd-fade  { animation: pd-fade-in 0.5s ease-out both; }
  .pd-up    { animation: pd-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .pd-pulse { animation: pd-pulse 1.6s ease-in-out infinite; }
  .pd-check { animation: pd-check 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }

  .pd-delay-1 { animation-delay: 80ms; }
  .pd-delay-2 { animation-delay: 160ms; }

  .pd-cv {
    content-visibility: auto;
    contain-intrinsic-size: 0 640px;
  }

  .pd-grid { grid-auto-rows: 1fr; }
  .pd-grid > .pd-cell { display: flex; height: 100%; }
  .pd-grid > .pd-cell > * {
    display: flex; flex-direction: column;
    width: 100%; height: 100%;
  }
  .pd-grid > .pd-cell > * > *:last-child,
  .pd-grid > .pd-cell > * > *:last-child > button:last-of-type,
  .pd-grid > .pd-cell > * > button:last-of-type {
    margin-top: auto;
  }

  .pd-hero-image img {
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .pd-hero-image:hover img {
    transform: scale(1.06);
  }

  .pd-cell img {
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .pd-cell:hover img { transform: scale(1.08); }
  .pd-cell > * {
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.35s ease;
  }
  .pd-cell:hover > * {
    transform: translateY(-4px);
    box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.18);
  }

  @media (prefers-reduced-motion: reduce) {
    .pd-fade, .pd-up, .pd-pulse, .pd-check { animation: none !important; }
    .pd-hero-image img, .pd-cell img, .pd-cell > * { transition: none !important; }
    .pd-hero-image:hover img,
    .pd-cell:hover img,
    .pd-cell:hover > * { transform: none !important; }
  }
`;

export default function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch product + related ──────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [detailRes, allRes] = await Promise.all([
          productApi.getBySlug(params.id),
          productApi.getAll(),
        ]);
        if (cancelled) return;
        const mapped = toCartProduct(detailRes.product);
        setProduct(mapped);
        setRelatedProducts(
          allRes.products
            .map(toCartProduct)
            .filter((p) => p.category === mapped.category && p.id !== mapped.id)
            .slice(0, 4)
        );
      } catch {
        if (!cancelled) setNotFoundFlag(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  /* Cleanup added-timer on unmount */
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handleAdd = useCallback(() => {
    if (!product) return;
    addToCart(product);
    setJustAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => {
      setJustAdded(false);
      addedTimerRef.current = null;
    }, 1400);
  }, [addToCart, product]);

  if (notFoundFlag) notFound();

  /* ── Loading skeleton ─────────────────────────────────── */
  if (loading || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FCF9F2]">
        <MarketingHeader />
        <main className="flex-1">
          <style dangerouslySetInnerHTML={{ __html: DETAIL_CSS }} />
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="pd-pulse mb-8 h-4 w-40 rounded-full bg-slate-200" />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="pd-pulse aspect-square rounded-2xl bg-slate-200" />
              <div className="space-y-5">
                <div className="pd-pulse h-3 w-24 rounded-full bg-slate-200" />
                <div className="pd-pulse h-8 w-3/4 rounded-full bg-slate-200" />
                <div className="pd-pulse h-4 w-1/3 rounded-full bg-slate-200" />
                <div className="pd-pulse h-6 w-40 rounded-full bg-slate-200" />
                <div className="pd-pulse h-24 w-full rounded-xl bg-slate-200" />
                <div className="pd-pulse h-12 w-full rounded-lg bg-slate-200 sm:w-48" />
              </div>
            </div>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  /* ── Derived display values ───────────────────────────── */
  const inStock = product.stock == null || product.stock > 0;
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? product.reviews?.length ?? 0;
  const hasSavings =
    product.originalPrice != null && product.originalPrice > product.price;
  const savingsAmount = hasSavings
    ? (product.originalPrice ?? 0) - product.price
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2]">
      <MarketingHeader />

      <main className="flex-1">
        <style dangerouslySetInnerHTML={{ __html: DETAIL_CSS }} />

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* ── Breadcrumb ───────────────────────────────── */}
          <nav
            className="pd-fade mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500"
            aria-label="Breadcrumb"
          >
            <Link
              href="/buy-medicines"
              className="font-medium transition-colors hover:text-[#FF6B00]"
            >
              All Products
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/buy-medicines"
              className="transition-colors hover:text-[#FF6B00]"
            >
              {product.category}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="max-w-[220px] truncate font-medium text-slate-700 sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* ── Hero: image | info ──────────────────────── */}
          <div className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
            {/* Image panel */}
            <div className="pd-up pd-delay-1 pd-hero-image relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="relative h-full w-full object-contain p-4"
                />
              ) : (
                <div className="relative flex flex-col items-center justify-center text-slate-300">
                  <svg
                    className="h-16 w-16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="mt-2 text-sm font-medium">
                    Photo coming soon
                  </span>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="pd-up pd-delay-2 flex flex-col">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                {product.category}
              </span>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              {/* Rating + stock */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {product.rating != null ? (
                  <span className="flex items-center gap-2">
                    <StarRating value={rating} size="sm" />
                    <span className="font-semibold text-slate-700">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-slate-400">
                      ({reviewCount}{" "}
                      {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400">No ratings yet</span>
                )}

                {product.stock != null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                      inStock
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        inStock ? "bg-emerald-500" : "bg-red-500"
                      )}
                    />
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#FF6B00]">
                  Rs. {product.price}
                </span>
                {product.originalPrice ? (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {product.originalPrice}
                  </span>
                ) : null}
                {hasSavings && (
                  <span className="rounded bg-[#34A853] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    Save Rs. {savingsAmount}
                  </span>
                )}
                {product.unit && (
                  <span className="text-sm text-slate-400">/ {product.unit}</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="mt-5 leading-relaxed text-slate-600">
                  {product.description}
                </p>
              )}

              {/* CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  aria-live="polite"
                  className={cn(
                    "relative w-full rounded-lg px-8 py-3 text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/40 sm:w-auto",
                    justAdded
                      ? "bg-[#34A853] text-white shadow-[#34A853]/30"
                      : "bg-[#FF6B00] text-white hover:-translate-y-0.5 hover:bg-[#E66000] hover:shadow-md shadow-[#FF6B00]/20",
                    !inStock &&
                      "cursor-not-allowed opacity-50 hover:translate-y-0 hover:bg-[#FF6B00] hover:shadow-sm"
                  )}
                >
                  {justAdded ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="pd-check h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Added to Cart
                    </span>
                  ) : inStock ? (
                    "Add to Cart"
                  ) : (
                    "Out of Stock"
                  )}
                </button>

                {justAdded && (
                  <Link
                    href="/cart"
                    className="pd-fade text-sm font-semibold text-[#FF6B00] hover:underline"
                  >
                    View cart →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ── Reviews ──────────────────────────────────── */}
          <section className="pd-cv mt-16 border-t border-slate-200 pt-10">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Customer Reviews
            </h2>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm text-slate-400">
                No reviews yet. Be the first to review this product.
              </p>
            </div>
          </section>

          {/* ── Related products ─────────────────────────── */}
          {relatedProducts.length > 0 && (
            <section className="pd-cv mt-16 border-t border-slate-200 pt-10">
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  You may also like
                </h2>
                <Link
                  href="/buy-medicines"
                  className="text-sm font-semibold text-[#FF6B00] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="pd-grid grid grid-cols-2 items-stretch gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <div key={p.id} className="pd-cell">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
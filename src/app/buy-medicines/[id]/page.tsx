"use client";

import React, { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toCartProduct, Product } from "@/data/products";
import { productApi } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS. Injected via dangerouslySetInnerHTML so the
   SSR and CSR output byte-for-byte (no escaping mismatch).
   ───────────────────────────────────────────────────────────── */
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

  /* Defer rendering work for off-screen sections */
  .pd-cv {
    content-visibility: auto;
    contain-intrinsic-size: 0 640px;
  }

  /* Equal-height related products + bottom-anchored CTA */
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

  /* Hero image zoom on hover */
  .pd-hero-image img {
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .pd-hero-image:hover img {
    transform: scale(1.06);
  }

  /* Related-products image zoom + card lift */
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

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

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

  /* Reset the "Added!" flag after a delay; timeout is tracked so unmount clears it */
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1400);
    return () => clearTimeout(t);
  }, [justAdded]);

  const handleAdd = useCallback(() => {
    if (!product) return;
    addToCart(product);
    setJustAdded(true);
  }, [addToCart, product]);

  if (notFoundFlag) notFound();

  /* ── Loading skeleton ─────────────────────────────────── */
  if (loading || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MarketingHeader />
        <main className="flex-1">
          <style dangerouslySetInnerHTML={{ __html: DETAIL_CSS }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="h-4 w-40 rounded-full bg-slate-100 pd-pulse mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="aspect-square rounded-2xl bg-slate-100 pd-pulse" />
              <div className="space-y-5">
                <div className="h-3 w-24 rounded-full bg-slate-100 pd-pulse" />
                <div className="h-8 w-3/4 rounded-full bg-slate-100 pd-pulse" />
                <div className="h-4 w-1/3 rounded-full bg-slate-100 pd-pulse" />
                <div className="h-6 w-40 rounded-full bg-slate-100 pd-pulse" />
                <div className="h-24 w-full rounded-xl bg-slate-100 pd-pulse" />
                <div className="h-12 w-full sm:w-48 rounded-lg bg-slate-100 pd-pulse" />
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                  <div className="h-16 rounded-xl bg-slate-100 pd-pulse" />
                  <div className="h-16 rounded-xl bg-slate-100 pd-pulse" />
                  <div className="h-16 rounded-xl bg-slate-100 pd-pulse" />
                </div>
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
  const savingsAmount = hasSavings ? (product.originalPrice ?? 0) - product.price : 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <style dangerouslySetInnerHTML={{ __html: DETAIL_CSS }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ── Breadcrumb ─────────────────────────────────── */}
          <nav
            className="pd-fade text-sm text-slate-500 mb-6 flex items-center gap-1.5 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link
              href="/buy-medicines"
              className="hover:text-primary transition-colors font-medium"
            >
              Buy Medicines
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/buy-medicines" className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium truncate max-w-[220px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* ── Hero: image | info ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image panel */}
            <div className="pd-up pd-delay-1 pd-hero-image relative aspect-square rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden flex items-center justify-center group">
              <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-primary/5 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-secondary/5 blur-3xl" />

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  loading="eager"
                  decoding="async"
                  className="relative h-full w-full object-contain p-8 sm:p-12"
                />
              ) : (
                <div className="relative flex flex-col items-center justify-center text-slate-300">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium mt-2">Photo coming soon</span>
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="pd-up pd-delay-2 flex flex-col">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary">
                {product.category}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating + stock */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {product.rating != null ? (
                  <span className="flex items-center gap-2">
                    <StarRating value={rating} />
                    <span className="font-semibold text-slate-700">{rating.toFixed(1)}</span>
                    <span className="text-slate-400">
                      ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400">No ratings yet</span>
                )}

                {product.stock != null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                      inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
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
                <span className="text-3xl font-extrabold text-slate-900">
                  Rs. {product.price}
                </span>
                {product.originalPrice ? (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {product.originalPrice}
                  </span>
                ) : null}
                {hasSavings && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Save Rs. {savingsAmount}
                  </span>
                )}
                <span className="text-sm text-slate-400">/ {product.unit}</span>
              </div>

              {/* Description */}
              <p className="mt-5 text-slate-600 leading-relaxed">{product.description}</p>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  className={cn(
                    "relative w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    justAdded
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : "bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md shadow-primary/20",
                    !inStock &&
                      "opacity-50 cursor-not-allowed hover:translate-y-0 hover:bg-primary hover:shadow-sm"
                  )}
                >
                  {justAdded ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="h-4 w-4 pd-check"
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
                    className="text-sm font-semibold text-primary hover:underline pd-fade"
                  >
                    View cart →
                  </Link>
                )}
              </div>

              {/* Trust strip */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
                <TrustItem
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  }
                  label="Verified"
                  sub="Genuine products"
                />
                <TrustItem
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  }
                  label="Fast Delivery"
                  sub="Within 24–48 hrs"
                />
                <TrustItem
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  }
                  label="Secure"
                  sub="Safe checkout"
                />
              </div>
            </div>
          </div>

          {/* ── Reviews (below the fold → content-visibility) ── */}
          <section className="pd-cv mt-16 border-t border-slate-100 pt-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Reviews</h2>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <p className="text-slate-400 text-sm">
                No reviews yet. Be the first to review this product.
              </p>
            </div>
          </section>

          {/* ── Related products (below the fold → content-visibility) ── */}
          {relatedProducts.length > 0 && (
            <section className="pd-cv mt-16 border-t border-slate-100 pt-10">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">You may also like</h2>
                <Link
                  href="/buy-medicines"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="pd-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 items-stretch">
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

/* ─────────────────────────────────────────────────────────────
   Memoized sub-components
   ───────────────────────────────────────────────────────────── */

const StarRating = React.memo(function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rounded ? "text-amber-400" : "text-slate-200"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 15.27l-5.18 3.05 1.4-5.93L1.6 8.4l6.06-.5L10 2.3l2.34 5.6 6.06.5-4.62 3.99 1.4 5.93z" />
        </svg>
      ))}
    </span>
  );
});

const TrustItem = React.memo(function TrustItem({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>
      <div>
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  );
});
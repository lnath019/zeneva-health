"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toCartProduct, Product } from "@/data/products";
import { productApi } from "@/lib/api";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ProductCard } from "@/components/shop/ProductCard";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS — safe to inject via dangerouslySetInnerHTML
   so SSR and CSR produce the same bytes.
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
  @keyframes bp-chip-in {
    from { opacity: 0; transform: scale(0.9); }
    to   { opacity: 1; transform: scale(1); }
  }

  .bp-hero   { animation: bp-fade-in 0.5s ease-out both; }
  .bp-filter { animation: bp-fade-in 0.5s ease-out both; animation-delay: 80ms; }
  .bp-cell {
    animation: bp-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i, 0) * 55ms);
  }
  .bp-chip {
    animation: bp-chip-in 0.2s ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .bp-hero, .bp-filter, .bp-cell, .bp-chip { animation: none !important; }
  }

  /* Custom orange checkbox matching the brand */
  .bp-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    border: 1.5px solid #cbd5e1;
    border-radius: 0.25rem;
    background-color: #fff;
    cursor: pointer;
    position: relative;
    transition: border-color 0.15s, background-color 0.15s;
  }
  .bp-checkbox:hover { border-color: #94a3b8; }
  .bp-checkbox:checked {
    background-color: #FF6B00;
    border-color: #FF6B00;
  }
  .bp-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  .bp-checkbox:focus-visible {
    outline: 2px solid #FF6B00;
    outline-offset: 2px;
  }
`;

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */
type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A to Z",
};

interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────── */
export default function BuyMedicinesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Filter state — matches the reference image exactly */
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [stockIn, setStockIn] = useState(false);
  const [stockOut, setStockOut] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Fetch from backend ──────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productApi.getAll();
        if (!cancelled) setProducts(res.products.map(toCartProduct));
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Derived ─────────────────────────────────────────── */
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  /* ── Handlers ────────────────────────────────────────── */
  const toggleCategory = useCallback((cat: string) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setPriceFrom("");
    setPriceTo("");
    setStockIn(false);
    setStockOut(false);
    setCategoryFilters(new Set());
  }, []);

  /* ── Filter + sort pipeline ──────────────────────────── */
  const visibleProducts = useMemo(() => {
    let list = [...products];

    const from = priceFrom === "" ? -Infinity : Number(priceFrom);
    const to = priceTo === "" ? Infinity : Number(priceTo);
    if (!Number.isNaN(from) && !Number.isNaN(to) && (priceFrom !== "" || priceTo !== "")) {
      list = list.filter((p) => p.price >= from && p.price <= to);
    }

    if (stockIn || stockOut) {
      list = list.filter((p) => {
        const inStock = p.stock == null || p.stock > 0;
        if (stockIn && inStock) return true;
        if (stockOut && !inStock) return true;
        return false;
      });
    }

    if (categoryFilters.size > 0) {
      list = list.filter((p) => categoryFilters.has(p.category));
    }

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [products, priceFrom, priceTo, stockIn, stockOut, categoryFilters, sortBy]);

  const activeFilterCount =
    (priceFrom !== "" ? 1 : 0) +
    (priceTo !== "" ? 1 : 0) +
    (stockIn ? 1 : 0) +
    (stockOut ? 1 : 0) +
    categoryFilters.size;

  /* Removable "active filter" chips — each one clears just that facet */
  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = [];

    if (priceFrom !== "" || priceTo !== "") {
      const fromLabel = priceFrom !== "" ? priceFrom : String(priceBounds.min);
      const toLabel = priceTo !== "" ? priceTo : String(priceBounds.max);
      chips.push({
        key: "price",
        label: `Rs. ${fromLabel} – Rs. ${toLabel}`,
        onRemove: () => {
          setPriceFrom("");
          setPriceTo("");
        },
      });
    }

    if (stockIn) {
      chips.push({ key: "stock-in", label: "In Stock", onRemove: () => setStockIn(false) });
    }
    if (stockOut) {
      chips.push({ key: "stock-out", label: "Out Of Stock", onRemove: () => setStockOut(false) });
    }

    categoryFilters.forEach((cat) => {
      chips.push({ key: `cat-${cat}`, label: cat, onRemove: () => toggleCategory(cat) });
    });

    return chips;
  }, [priceFrom, priceTo, stockIn, stockOut, categoryFilters, priceBounds, toggleCategory]);

  /* ── Filter panel markup (shared between desktop + mobile) ── */
  const filterPanel = (
    <div className="space-y-8">
      {/* Price */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900">Price</h3>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label
              htmlFor="price-from"
              className="mb-1 block text-xs text-slate-500"
            >
              From
            </label>
            <input
              id="price-from"
              type="number"
              min={0}
              inputMode="numeric"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder={String(priceBounds.min)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
          <span className="pb-2.5 text-slate-400">—</span>
          <div className="flex-1">
            <label
              htmlFor="price-to"
              className="mb-1 block text-xs text-slate-500"
            >
              To
            </label>
            <input
              id="price-to"
              type="number"
              min={0}
              inputMode="numeric"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder={String(priceBounds.max)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200" />

      {/* Stock status */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900">Stock status</h3>
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              className="bp-checkbox"
              checked={stockIn}
              onChange={(e) => setStockIn(e.target.checked)}
            />
            <span>In Stock</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              className="bp-checkbox"
              checked={stockOut}
              onChange={(e) => setStockOut(e.target.checked)}
            />
            <span>Out Of Stock</span>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200" />

      {/* Category */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900">Category</h3>
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400">No categories available</p>
        ) : (
          <div className="max-h-72 space-y-2.5 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  className="bp-checkbox"
                  checked={categoryFilters.has(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-semibold text-[#FF6B00] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2]">
      <MarketingHeader />

      <main className="flex-1">
        <style dangerouslySetInnerHTML={{ __html: LISTING_CSS }} />

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page title */}
          <h1 className="bp-hero mb-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:mb-12 sm:text-5xl">
            All Products
          </h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
            {/* ── Desktop sidebar ──────────────────────── */}
            <aside className="bp-filter hidden lg:block">
              <div className="sticky top-24">
                <h2 className="mb-6 border-b border-slate-200 pb-3 text-base font-extrabold uppercase tracking-wide text-slate-900">
                  Filter By:
                </h2>
                {filterPanel}
              </div>
            </aside>

            {/* ── Main content ────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* Toolbar */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Mobile filter trigger */}
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 lg:hidden"
                      aria-label="Open filters"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-[#FF6B00] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    <p
                      className="text-sm text-slate-600"
                      role="status"
                      aria-live="polite"
                    >
                      Showing{" "}
                      <span className="font-semibold text-slate-900">
                        {visibleProducts.length}
                      </span>{" "}
                      results
                    </p>
                  </div>

                  <label className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sort by
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
                      aria-label="Sort products"
                    >
                      {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                        <option key={opt} value={opt}>
                          {SORT_LABELS[opt]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Active filter chips */}
                {activeFilterChips.length > 0 && (
                  <ul
                    className="flex flex-wrap items-center gap-2"
                    aria-label="Active filters"
                  >
                    {activeFilterChips.map((chip) => (
                      <li key={chip.key} className="bp-chip">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-slate-700">
                          {chip.label}
                          <button
                            type="button"
                            onClick={chip.onRemove}
                            aria-label={`Remove ${chip.label} filter`}
                            className="grid h-5 w-5 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-semibold text-[#FF6B00] hover:underline"
                      >
                        Clear all
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {/* Loading skeleton */}
              {loading && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
                      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                      <div className="mt-4 h-8 w-1/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-md border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && visibleProducts.length === 0 && (
                <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No products match your filters.
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="mt-4 text-sm font-semibold text-[#FF6B00] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Product grid */}
              {!loading && !error && visibleProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="bp-cell"
                      style={
                        { "--i": Math.min(index, 12) } as React.CSSProperties
                      }
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile filter drawer ──────────────────────── */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                Filter By:
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close filters"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {filterPanel}
            </div>

            <div className="flex gap-3 border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-lg bg-[#FF6B00] py-2.5 text-sm font-semibold text-white transition hover:bg-[#E66000]"
              >
                Show {visibleProducts.length}
              </button>
            </div>
          </div>
        </>
      )}

      <MarketingFooter />
    </div>
  );
}
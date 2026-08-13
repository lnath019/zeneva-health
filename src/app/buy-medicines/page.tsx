"use client";

import React, { useEffect, useState } from "react";
import { toCartProduct, Product } from "@/data/products";
import { productApi } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function BuyMedicinesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getAll();
        setProducts(res.products.map(toCartProduct));
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const visibleProducts =
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              e-Pharmacy
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Buy Medicines &amp; Essentials</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Everyday health, first aid, and personal care products delivered to your door.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeCategory === "All"
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeCategory === category
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="text-slate-400 text-sm">Loading products…</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!loading && !error && visibleProducts.length === 0 && (
            <p className="text-slate-400 text-sm">No products available yet.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
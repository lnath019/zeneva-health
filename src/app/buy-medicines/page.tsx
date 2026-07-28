"use client";

import React, { useState } from "react";
import { PRODUCTS, CATEGORIES, ProductCategory } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function BuyMedicinesPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "All">("All");

  const visibleProducts =
    activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

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
            {CATEGORIES.map((category) => (
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

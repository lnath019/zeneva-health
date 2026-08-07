"use client";

import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/shop/ProductCard";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  if (!product) {
    notFound();
  }

 const gallery = [product.image, ...(product.images ?? [])];
  const [activeImage, setActiveImage] = React.useState(0);
const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAdd = () => {
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
            <Link href="/buy-medicines" className="hover:text-primary">Buy Medicines</Link>
            <span>/</span>
            <span className="text-slate-400">{product.category}</span>
            <span>/</span>
            <span className="text-slate-700 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg border overflow-hidden bg-slate-50 flex items-center justify-center ${
                      activeImage === i ? "border-primary ring-1 ring-primary" : "border-slate-200"
                    }`}
                  >
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="flex-1 aspect-square bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium mt-2">Photo coming soon</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {product.category}
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{product.name}</h1>

              <div className="mt-2 flex items-center gap-2 text-sm">
                {product.rating != null ? (
                  <>
                    <span className="font-semibold text-slate-700">{product.rating.toFixed(1)} / 5</span>
                    <span className="text-slate-400">
                      ({product.reviewCount ?? product.reviews?.length ?? 0} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400">No ratings yet</span>
                )}
                {product.stock != null && (
                  <span className={`ml-2 font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">Rs. {product.price}</span>
                <span className="text-sm text-slate-400">/ {product.unit}</span>
              </div>

              <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>

              {(product.manufacturingDate || product.expiryDate) && (
                <div className="mt-4 text-sm text-slate-500 space-y-1">
                  {product.manufacturingDate && <p>Manufacturing Date: {product.manufacturingDate}</p>}
                  {product.expiryDate && <p>Expiry Date: {product.expiryDate}</p>}
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="mt-6 w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {justAdded ? "Added!" : "Add to Cart"}
              </button>
            </div>
          </div>

          <div className="mt-16 border-t border-slate-100 pt-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Reviews</h2>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6 max-w-2xl">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-50 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">{review.author}</span>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <div className="text-amber-500 text-sm mt-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
                  </div>
                ))}
              </div>
           ) : (
              <p className="text-slate-400 text-sm">No reviews yet. Be the first to review this product.</p>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16 border-t border-slate-100 pt-10">
              <h2 className="text-lg font-bold text-slate-900 mb-6">You may also like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
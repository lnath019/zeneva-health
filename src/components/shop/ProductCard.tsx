"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <Link
      href={`/buy-medicines/${product.id}`}
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative"
    >
      {product.discountPercent ? (
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          -{product.discountPercent}%
        </span>
      ) : null}

      <div className="aspect-square bg-slate-50 flex flex-col items-center justify-center text-slate-300 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium mt-1">Photo coming soon</span>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="mt-1 text-sm font-bold text-slate-800 leading-snug">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.unit}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-lg font-extrabold text-slate-900">Rs. {product.price}</p>
          {product.originalPrice ? (
            <p className="text-xs text-slate-400 line-through">Rs. {product.originalPrice}</p>
          ) : null}
        </div>

        <button
          onClick={handleAdd}
          className="mt-3 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
        >
          {justAdded ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}
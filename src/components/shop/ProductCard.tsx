"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Module-level CSS for the button's "just added" pop + checkmark
   pop-in. Scoped with a pc- prefix so it can't collide with the
   pd- (detail page) or bp- (listing page) animation classes.
   ───────────────────────────────────────────────────────────── */
const PRODUCT_CARD_CSS = `
  @keyframes pc-check {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes pc-pop {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  .pc-check { animation: pc-check 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .pc-pop   { animation: pc-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }

  @media (prefers-reduced-motion: reduce) {
    .pc-check, .pc-pop { animation: none !important; }
  }
`;

let cssInjected = false;
function ensureCss() {
  if (cssInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-product-card-css", "true");
  style.textContent = PRODUCT_CARD_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}

interface ProductCardProps {
  product: Product;
  /** Set false for a bare image + name + price tile with no button
   *  (matches the reference "All Products" grid, which has no CTA on
   *  each card — the whole tile is the link). Defaults to true so
   *  existing call sites (e.g. detail page's related products) keep
   *  their Add to Cart button unless they opt out. */
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Cursor-following magnify: track pointer position (against the image's
  // own rect, not the container's) as a percentage, so the zoom's
  // transform-origin follows the cursor instead of always zooming from
  // dead-center.
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [isZoomed, setIsZoomed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    ensureCss();
  }, []);

  // Holds the pending "revert to Add to Cart" timeout so it can be cleared
  // on unmount — without this, remounting the grid (e.g. a filter change
  // that keys the grid) while the timeout is still pending fires a state
  // update on an unmounted component.
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const hasSavings = product.originalPrice != null && product.originalPrice > product.price;
  const savingsAmount = hasSavings ? (product.originalPrice ?? 0) - product.price : 0;
  const inStock = product.stock == null || product.stock > 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  }, []);

  const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
    setZoomOrigin("50% 50%");
  }, []);

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!inStock || isAdding) return;

      setIsAdding(true);
      setJustAdded(true);
      addToCart(product);

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setJustAdded(false);
        setIsAdding(false);
        resetTimeoutRef.current = null;
      }, 1400);
    },
    [addToCart, product, inStock, isAdding]
  );

  return (
    <Link
      href={`/buy-medicines/${product.id}`}
      className={cn(
        "group relative flex flex-col transition-all duration-300",
        showAddToCart
          ? "rounded-2xl bg-white p-4 shadow-sm hover:shadow-md border border-transparent hover:border-gray-100"
          : "gap-2"
      )}
    >
      {/* Image Container — cursor-following magnify */}
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center",
          showAddToCart ? "rounded-xl bg-gray-50 mb-4" : "rounded-md"
        )}
      >
        {product.image ? (
          <img
            ref={imgRef}
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300 ease-out will-change-transform"
            style={{
              transformOrigin: zoomOrigin,
              transform: isZoomed ? "scale(1.7)" : "scale(1)",
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium mt-1">No Image</span>
          </div>
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 z-10 rounded bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <h3 className={cn("text-sm font-bold text-gray-800 line-clamp-2 leading-tight", showAddToCart ? "mb-2" : "mb-1")}>
          {product.name}
        </h3>

        <div className={showAddToCart ? "mt-auto" : ""}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-extrabold text-primary">Rs. {product.price}</span>
            {product.originalPrice && (
              <span className="text-sm font-medium text-gray-400 line-through">
                Rs. {product.originalPrice}
              </span>
            )}
          </div>

          {hasSavings && (
            <div className={cn("inline-block rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white", showAddToCart && "mb-3")}>
              SAVE RS. {savingsAmount}
            </div>
          )}

          {showAddToCart && (
            <button
              onClick={handleAdd}
              disabled={!inStock || isAdding}
              aria-live="polite"
              className={cn(
                "w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95",
                justAdded && "pc-pop",
                justAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5",
                !inStock && "opacity-50 cursor-not-allowed hover:bg-primary hover:translate-y-0",
                isAdding && !justAdded && "opacity-80 cursor-wait"
              )}
            >
              {justAdded ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <svg className="h-4 w-4 pc-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </span>
              ) : inStock ? (
                "Add to Cart"
              ) : (
                "Out of Stock"
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
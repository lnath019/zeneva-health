"use client";

import React from "react";

interface StarRatingProps {
  value: number;                 // 0–5, fractional values render a partial star
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const SIZES = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

const Star = ({ fill, className }: { fill: number; className: string }) => {
  // unique id per instance so multiple partial stars don't share a clip
  const id = React.useId();
  const pct = Math.max(0, Math.min(1, fill)) * 100;

  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${pct}%`} stopColor="currentColor" />
          <stop offset={`${pct}%`} stopColor="transparent" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.97a1 1 0 00.95.69h4.17c.97 0 1.37 1.24.59 1.81l-3.38 2.45a1 1 0 00-.36 1.12l1.29 3.97c.3.92-.76 1.69-1.54 1.12l-3.37-2.45a1 1 0 00-1.18 0l-3.37 2.45c-.78.57-1.84-.2-1.54-1.12l1.29-3.97a1 1 0 00-.36-1.12L1.05 9.4c-.78-.57-.38-1.81.59-1.81h4.17a1 1 0 00.95-.69L8.05 2.93z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
};

export function StarRating({ value, size = "md", interactive = false, onChange, className = "" }: StarRatingProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div
      className={`inline-flex items-center gap-0.5 text-amber-400 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Choose a rating" : `Rated ${value.toFixed(1)} out of 5`}
      onMouseLeave={() => interactive && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((i) =>
        interactive ? (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={Math.round(value) === i}
            aria-label={`${i} star${i !== 1 ? "s" : ""}`}
            className="p-0.5 hover:scale-110 transition-transform"
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange?.(i)}
          >
            <Star fill={shown >= i ? 1 : 0} className={SIZES[size]} />
          </button>
        ) : (
          <Star key={i} fill={shown - (i - 1)} className={SIZES[size]} />
        ),
      )}
    </div>
  );
}

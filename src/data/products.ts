import type { BackendProduct } from "@/lib/api";

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
}

export interface Product {
  id: string;            // = backend product SLUG (used in URLs and as cart product identity)
  name: string;
  category: string;      // free text now — admin can add any category
  price: number;         // amount actually charged (= discountedPrice from backend)
  originalPrice?: number; // pre-discount price, shown struck-through when a discount applies
  discountPercent?: number;
  unit: string;
  image: string;
  description: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  stock?: number;
  manufacturingDate?: string;
  expiryDate?: string;
}

// Kept for backward compatibility with any old references — the catalog is
// now admin-managed via the API, not hardcoded here.
export const PRODUCTS: Product[] = [];
export const CATEGORIES: string[] = [];

// Maps a backend product (as returned by productApi) onto the shape the
// existing shop UI (ProductCard, CartContext, etc.) already expects.
export function toCartProduct(bp: BackendProduct): Product {
  return {
    id: bp.slug,
    name: bp.name,
    category: bp.category,
    price: bp.discountedPrice,
    originalPrice: bp.discountPercent > 0 ? bp.price : undefined,
    discountPercent: bp.discountPercent > 0 ? bp.discountPercent : undefined,
    unit: bp.unit || "",
    image: bp.imageUrl || "",
    description: bp.description || "",
  };
}
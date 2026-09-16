"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { cartApi, BackendCartItem } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_CART_KEY = "zeneva_guest_cart";

function findProduct(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId);
}

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { productId: string; quantity: number }[];
    return parsed
      .map((entry) => {
        const product = findProduct(entry.productId);
        return product ? { product, quantity: entry.quantity } : null;
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function persistGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      GUEST_CART_KEY,
      JSON.stringify(items.map((i) => ({ productId: i.product.id, quantity: i.quantity })))
    );
  } catch {
    // storage unavailable — the in-memory cart still works
  }
}

function toCartItems(backendItems: BackendCartItem[]): CartItem[] {
  return backendItems
    .map((bi) => {
      const product = findProduct(bi.productId);
      return product ? { product, quantity: bi.quantity } : null;
    })
    .filter((item): item is CartItem => item !== null);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  // A stored token means the user is logged in even on the first render
  // (before AuthContext finishes initializing) — only hydrate the guest
  // cart when there genuinely is no session.
  const [items, setItems] = useState<CartItem[]>(() => (getToken() ? [] : loadGuestCart()));

  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const syncedTokenRef = useRef<string | null>(null);
  const hadTokenRef = useRef<boolean>(!!getToken());

  // Persist anonymous carts across page loads. While logged in this is a
  // no-op — the backend cart is the source of truth.
  useEffect(() => {
    if (token) return;
    persistGuestCart(items);
  }, [items, token]);

  // When a token appears (login, or already logged in on page load):
  // push any local (anonymous) items to the backend, then load the
  // backend cart as the source of truth.
  useEffect(() => {
    if (!token) {
      // Only wipe the guest cart when a logout just happened — on the
      // initial render the token simply hasn't loaded yet.
      if (hadTokenRef.current) {
        hadTokenRef.current = false;
        syncedTokenRef.current = null;
        setItems([]);
        try {
          window.localStorage.removeItem(GUEST_CART_KEY);
        } catch {
          // storage unavailable — nothing to clear
        }
      }
      return;
    }

    hadTokenRef.current = true;
    if (syncedTokenRef.current === token) return;
    syncedTokenRef.current = token;

    (async () => {
      try {
        const localItems = itemsRef.current;
        if (localItems.length > 0) {
          await cartApi.sync(
            localItems.map((i) => ({
              productId: i.product.id,
              productName: i.product.name,
              unitPrice: i.product.price,
              quantity: i.quantity,
            }))
          );
        }
        const { items: backendItems } = await cartApi.getAll();
        setItems(toCartItems(backendItems));
      } catch (error) {
        console.error("Cart sync/load failed:", error);
      }
    })();
  }, [token]);

  const addToCart = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });

      if (token) {
        cartApi
          .add(product.id, product.name, product.price, 1)
          .catch((error) => console.error("Failed to add cart item on server:", error));
      }
    },
    [token]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));

      if (token) {
        cartApi.remove(productId).catch((error) => console.error("Failed to remove cart item on server:", error));
      }
    },
    [token]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );

      if (token) {
        cartApi
          .updateQuantity(productId, quantity)
          .catch((error) => console.error("Failed to update cart item on server:", error));
      }
    },
    [token, removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);

    if (token) {
      cartApi.clear().catch((error) => console.error("Failed to clear cart on server:", error));
    }
  }, [token]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

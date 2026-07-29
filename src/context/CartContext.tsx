"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { cartApi, BackendCartItem } from "@/lib/api";

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

function findProduct(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId);
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
  const [items, setItems] = useState<CartItem[]>([]);

  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const syncedTokenRef = useRef<string | null>(null);

  // When a token appears (login, or already logged in on page load):
  // push any local (anonymous) items to the backend, then load the
  // backend cart as the source of truth.
  useEffect(() => {
    if (!token) {
      syncedTokenRef.current = null;
      setItems([]);
      return;
    }

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

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { CartDrawer } from '@/components/shop/CartDrawer';

interface NavbarProps {
  activeTabLabel: string;
}

export function Navbar({ activeTabLabel }: NavbarProps) {
  const { signOut } = useAuth();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{activeTabLabel}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors"
          aria-label="Open cart"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-white text-[10px] font-bold">
              {totalItems}
            </span>
          )}
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-xs font-medium"
        >
          Sign Out
        </Button>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

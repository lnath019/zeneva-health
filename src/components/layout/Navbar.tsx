'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

interface NavbarProps {
  activeTabLabel: string;
}

export function Navbar({ activeTabLabel }: NavbarProps) {
  const { signOut } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{activeTabLabel}</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-xs font-medium"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  // If loading, show spinner. If no token, redirect is done in middleware,
  // but we add a secondary client guard to prevent flash of content.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!token) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}

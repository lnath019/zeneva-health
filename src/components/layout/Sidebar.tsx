'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  path: string;
}

export function Sidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      roles: ['patient', 'doctor', 'admin'],
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      roles: ['patient'],
      path: '/dashboard/book-appointment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'patient-appointments',
      label: 'My Appointments',
      roles: ['patient'],
      path: '/dashboard/my-appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'manage-slots',
      label: 'Manage Slots',
      roles: ['doctor'],
      path: '/dashboard/manage-slots',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'doctor-appointments',
      label: 'Patient Bookings',
      roles: ['doctor'],
      path: '/dashboard?tab=doctor-appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'manage-users',
      label: 'User Directory',
      roles: ['admin'],
      path: '/dashboard?tab=manage-users',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'all-appointments',
      label: 'All Appointments',
      roles: ['admin'],
      path: '/dashboard?tab=all-appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      roles: ['patient', 'doctor', 'admin'],
      path: '/dashboard/hospitals',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'ambulances',
      label: 'Ambulances',
      roles: ['patient', 'doctor', 'admin'],
      path: '/dashboard/ambulances',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9z" />
        </svg>
      )
    },
    {
      id: 'account-settings',
      label: 'Account Settings',
      roles: ['patient', 'doctor', 'admin', 'lab'],
      path: '/dashboard/account-settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'book-lab-test',
      label: 'Book Lab Test',
      roles: ['patient'],
      path: '/dashboard/book-lab-test',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3v5.379a2 2 0 01-.586 1.414L4.5 14.457A2 2 0 004 15.871V19a2 2 0 002 2h12a2 2 0 002-2v-3.129a2 2 0 00-.5-1.414l-4.664-4.664A2 2 0 0114.25 8.38V3M8.25 3h7.5M9 15h6" />
        </svg>
      )
    },
    {
      id: 'my-lab-appointments',
      label: 'My Lab Appointments',
      roles: ['patient'],
      path: '/dashboard/my-lab-appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 8l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'register-lab',
      label: 'Register as Lab',
      roles: ['patient'],
      path: '/dashboard/register-lab',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m4-14v6m-3-3h6" />
        </svg>
      )
    },
    {
      id: 'manage-lab',
      label: 'Manage Lab',
      roles: ['lab'],
      path: '/dashboard/manage-lab',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'manage-lab-slots',
      label: 'Manage Lab Slots',
      roles: ['lab'],
      path: '/dashboard/manage-lab-slots',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'lab-bookings',
      label: 'Lab Bookings',
      roles: ['lab'],
      path: '/dashboard/lab-bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'manage-tests',
      label: 'Manage Tests',
      roles: ['admin'],
      path: '/dashboard/manage-tests',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3v5.379a2 2 0 01-.586 1.414L4.5 14.457A2 2 0 004 15.871V19a2 2 0 002 2h12a2 2 0 002-2v-3.129a2 2 0 00-.5-1.414l-4.664-4.664A2 2 0 0114.25 8.38V3M8.25 3h7.5" />
        </svg>
      )
    },
    {
      id: 'lab-approvals',
      label: 'Lab Approvals',
      roles: ['admin'],
      path: '/dashboard/lab-approvals',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

  const isLinkActive = (item: NavItem) => {
    if (item.id === 'overview') {
      return pathname === '/dashboard' && !searchParams.get('tab');
    }
    if (item.path.includes('?tab=')) {
      return pathname === '/dashboard' && searchParams.get('tab') === item.path.split('?tab=')[1];
    }
    return pathname.startsWith(item.path);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between shrink-0">
      <div className="flex flex-col gap-6 p-6">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/20">
            Z
          </div>
          <span className="text-xl font-bold text-primary tracking-wide">ZENEVA</span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive = isLinkActive(item);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-neutralBrand hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-2 h-2 rounded-full',
            role === 'admin' && 'bg-red-500',
            role === 'doctor' && 'bg-secondary',
            role === 'patient' && 'bg-primary',
            role === 'lab' && 'bg-amber-500'
          )} />
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
            {role ? `${role} portal` : 'Authenticating...'}
          </span>
        </div>
      </div>
    </aside>
  );
}

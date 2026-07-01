'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { usePathname, useSearchParams } from 'next/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getTabLabel = () => {
    if (pathname.startsWith('/dashboard/hospitals')) {
      return 'Affiliated Hospital Locations';
    }

    if (pathname.startsWith('/dashboard/ambulances')) {
      return 'Emergency Ambulance Services';
    }

    const tab = searchParams.get('tab');
    switch (tab) {
      case 'book-appointment':
        return 'Book New Appointment';
      case 'patient-appointments':
        return 'My Appointment Records';
      case 'manage-slots':
        return 'Manage Doctor Slots';
      case 'doctor-appointments':
        return 'Patient Bookings Manager';
      case 'manage-users':
        return 'User Management';
      case 'all-appointments':
        return 'All System Appointments';
      case 'ambulances':
        return 'Emergency Ambulance Services';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <div className="flex bg-tertiary min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar activeTabLabel={getTabLabel()} />

        {/* Inner Content scrollable */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

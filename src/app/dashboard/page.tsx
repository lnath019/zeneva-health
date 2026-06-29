'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const renderOverviewContent = () => {
    switch (role) {
      case 'patient':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Welcome to your portal</h2>
              <p className="text-slate-500 text-sm mt-1">Manage your appointments and healthcare resources.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Book Appointment</h3>
                <p className="text-slate-500 text-xs mt-1">Schedule a session with certified medical professionals.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Hospital Locations</h3>
                <p className="text-slate-500 text-xs mt-1">Find nearby hospitals and medical clinics.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h4l4-4V8a1 1 0 00-1-1h-7v9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 text-base">Request Ambulance</h3>
                <p className="text-slate-500 text-xs mt-1">Get immediate emergency transportation support.</p>
              </div>
            </div>

            {/* Upcoming Appointments section */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-6">Upcoming Appointments</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-slate-400 text-sm font-medium">You don&apos;t have any scheduled appointments.</p>
                <button className="text-primary hover:text-primary-hover font-semibold text-xs mt-2 transition-colors">
                  Book your first appointment &rarr;
                </button>
              </div>
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Doctor Console</h2>
              <p className="text-slate-500 text-sm mt-1">Set up your availability and review incoming bookings.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
                <p className="text-slate-400 text-xs mt-1">No appointments booked for today</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Slots</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
                <p className="text-slate-400 text-xs mt-1">Create slots to receive bookings</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">0</h3>
                <p className="text-slate-400 text-xs mt-1">Unique patients visited</p>
              </div>
            </div>

            {/* Today's Schedule Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-6">Today&apos;s Active Slots</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-slate-400 text-sm font-medium">You haven&apos;t created any slots for today.</p>
                <button className="text-secondary hover:text-secondary-hover font-semibold text-xs mt-2 transition-colors">
                  Create availability slot &rarr;
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Control Panel</h2>
              <p className="text-slate-500 text-sm mt-1">Manage system configurations, user validation, and logs.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total System Users</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">--</h3>
                <p className="text-slate-400 text-xs mt-1">Registered patients and doctors</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Doctors</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">--</h3>
                <p className="text-slate-400 text-xs mt-1">Granted medical practitioners</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">--</h3>
                <p className="text-slate-400 text-xs mt-1">Appointments booked overall</p>
              </div>
            </div>

            {/* System activity log */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-base mb-6">Recent System Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">New patient registered</span>
                  <span className="text-slate-400 text-xs">Just now</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">Database connection initialized</span>
                  <span className="text-slate-400 text-xs">10m ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-slate-500 font-medium">Loading details...</p>
          </div>
        );
    }
  };

  if (activeTab === 'overview') {
    return renderOverviewContent();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800">Module coming soon</h3>
      <p className="text-slate-500 max-w-sm mx-auto text-sm mt-1">
        We are currently preparing the <span className="font-semibold text-primary capitalize">{activeTab.replace('-', ' ')}</span> interface.
      </p>
    </div>
  );
}

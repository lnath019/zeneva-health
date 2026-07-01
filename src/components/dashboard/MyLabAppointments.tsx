'use client';

import React, { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { labAppointmentApi } from '@/lib/api';
import { Spinner } from '../ui/Spinner';
import { LabAppointment } from '@/types';

export function MyLabAppointments() {
  const { data: appointments, isLoading, error, execute: fetchAppointments } = useApi(labAppointmentApi.getMyAppointments);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">My Lab Appointments</h2>
        <p className="text-slate-500 text-xs mt-1">Track and view all your booked lab tests.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading appointments: {error}
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          You have no booked lab tests.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt: LabAppointment) => (
            <div
              key={appt.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold py-1 rounded-full uppercase tracking-wider">
                    {appt.slot?.slotDate || 'Date N/A'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        appt.status === 'confirmed' || appt.status === 'completed' ? 'bg-emerald-700' : 'bg-amber-700'
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider">{appt.status}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800">{appt.test?.name || 'Lab Test'}</h3>
                  <p className="text-xs text-primary font-medium">{appt.slot?.lab?.name || 'Diagnostic Lab'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700">
                  <p className="flex gap-1.5">Token No: {appt.tokenNumber}</p>
                  <p className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {appt.slot ? `${appt.slot.startTime?.slice(0, 5)} - ${appt.slot.endTime?.slice(0, 5)}` : 'Time N/A'}
                  </p>
                </div>
              </div>

              {appt.notes && (
                <div className="md:text-right border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 max-w-sm">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</span>
                  <p className="text-slate-700 text-sm italic">&ldquo;{appt.notes}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

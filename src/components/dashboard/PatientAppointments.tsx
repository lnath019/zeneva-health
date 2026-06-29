'use client';

import React, { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { appointmentApi, slotApi } from '@/lib/api';
import { Spinner } from '../ui/Spinner';
import { Appointment, Slot } from '@/types';

export function PatientAppointments() {
  const { data: appointments, isLoading: isApptsLoading, error: apptsError, execute: fetchAppointments } = useApi(appointmentApi.getMyAppointments);
  const { data: slots, execute: fetchSlots } = useApi(slotApi.getAll);

  useEffect(() => {
    fetchAppointments();
    fetchSlots();
  }, [fetchAppointments, fetchSlots]);

  const getSlotDetails = (appointment: Appointment): Slot | null | undefined => {
    // If the backend populated the relationship
    if (appointment.doctorSlot) {
      return appointment.doctorSlot;
    }
    if (appointment.slot) {
      return appointment.slot;
    }
    // Defensive fallback: find the slot in the fetched slots list
    if (slots) {
      return slots.find((s: Slot) => s.id === appointment.doctorSlotId);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Appointment Records</h2>
          <p className="text-slate-500 text-xs mt-1">Track and view all your booked consultations.</p>
        </div>
      </div>

      {/* Main content */}
      {isApptsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : apptsError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading appointments: {apptsError}
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          You have no booked appointments.
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt: Appointment) => {
            const slot = getSlotDetails(appt);
            const doctorName = slot?.doctor?.user?.fullName || 'Specialist Doctor';
            const specialisation = slot?.doctor?.specialisation?.name || 'General Practitioner';
            const hospitalName = slot?.hospital?.name || 'Affiliated Hospital';
            const hospitalAddress = slot?.hospital?.address || '';

            return (
              <div
                key={appt.id}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold py-1 rounded-full uppercase tracking-wider">
                      {slot?.slotDate || 'Date N/A'}
                    </span>
                    <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      appt.status === "confirmed"
                        ? "bg-emerald-700"
                        : "bg-amber-700"
                    } `}
                  />

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider `}
                  >
                    {appt.status}
                  </span>
                  </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Dr. {doctorName}
                    </h3>
                    <p className="text-xs text-primary font-medium">{specialisation}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-700">
                    <p className='flex gap-1.5'>
                      Token No: 
                      {appt.tokenNumber}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {slot ? `${slot.startTime?.slice(0, 5)} - ${slot.endTime?.slice(0, 5)}` : 'Time N/A'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <svg className="h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {hospitalName} {hospitalAddress ? `(${hospitalAddress})` : ''}
                    </p>
                    
                  </div>
                </div>

                <div className="md:text-right border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 max-w-sm">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reason for Visit</span>
                  <p className="text-slate-700 text-sm italic">&ldquo;{appt.reason}&rdquo;</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

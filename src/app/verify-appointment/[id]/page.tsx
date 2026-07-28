'use client';

import React, { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { appointmentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  needs_reschedule: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function VerifyAppointmentPage({ params }: { params: { id: string } }) {
  const { data: ticket, isLoading, error, execute: fetchTicket } = useApi(appointmentApi.getTicket);

  useEffect(() => {
    fetchTicket(params.id);
  }, [params.id, fetchTicket]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-primary text-white">
          <h1 className="text-lg font-bold">Zeniva Healthcare</h1>
          <p className="text-xs opacity-80 mt-0.5">Appointment Verification</p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error || !ticket ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm font-medium text-center">
              This ticket could not be found. It may have been cancelled or the link is invalid.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-slate-700">Valid Appointment Ticket</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
                  <span className="text-slate-800 font-semibold">{ticket.patientName}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doctor</span>
                  <span className="text-slate-800 font-semibold">
                    Dr. {ticket.doctorName}
                    {ticket.specialisation && <span className="text-primary font-medium"> ({ticket.specialisation})</span>}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hospital</span>
                  <span className="text-slate-800">
                    {ticket.hospitalName}
                    {ticket.hospitalAddress ? `, ${ticket.hospitalAddress}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                    <span className="text-slate-800">
                      {ticket.slotDate} · {ticket.startTime?.slice(0, 5)} - {ticket.endTime?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Token</span>
                    <span className="text-slate-800 font-bold text-lg">{ticket.tokenNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider ${
                    statusStyles[ticket.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

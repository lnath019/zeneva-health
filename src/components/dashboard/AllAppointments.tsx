'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi, appointmentApi } from '@/lib/api';
import { Spinner } from '../ui/Spinner';
import { Appointment } from '@/types';

const STATUS_OPTIONS: Appointment['status'][] = ['pending', 'confirmed', 'cancelled'];

export function AllAppointments() {
  const { data: appointments, isLoading, error, execute: fetchAppointments, setData: setAppointments } = useApi(adminApi.getAllAppointments);
  const { execute: updateStatus } = useApi(appointmentApi.updateStatus);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (appointmentId: string, status: Appointment['status']) => {
    setUpdatingId(appointmentId);
    setUpdateError(null);
    try {
      await updateStatus(appointmentId, status);
      if (appointments) {
        setAppointments(appointments.map((a) => (a.id === appointmentId ? { ...a, status } : a)));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update appointment status';
      setUpdateError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadgeColor = (status: Appointment['status']) => {
    if (status === 'confirmed') return 'bg-emerald-700';
    if (status === 'cancelled') return 'bg-rose-700';
    return 'bg-amber-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">All System Appointments</h2>
        <p className="text-slate-500 text-xs mt-1">Review and update the status of every appointment in the system.</p>
      </div>

      {updateError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-semibold">
          {updateError}
        </div>
      )}

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
          No appointments have been booked yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Token</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Slot</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt: Appointment) => {
                const slot = appt.doctorSlot || appt.slot;
                return (
                  <tr key={appt.id} className="border-t border-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">#{appt.tokenNumber}</td>
                    <td className="px-6 py-4 text-slate-600 italic max-w-xs">&ldquo;{appt.reason}&rdquo;</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {slot ? (
                        <>
                          {slot.slotDate} @ {slot.startTime?.slice(0, 5)}
                          <br />
                          {slot.hospital?.name}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusBadgeColor(appt.status)}`} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          {appt.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={appt.status}
                        disabled={updatingId === appt.id}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value as Appointment['status'])}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

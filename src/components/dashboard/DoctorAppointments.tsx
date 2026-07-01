'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { slotApi, appointmentApi, medicalHistoryApi } from '@/lib/api';
import { Spinner } from '../ui/Spinner';
import { Slot, Appointment } from '@/types';

export function DoctorAppointments() {
  const { data: slots, isLoading: isSlotsLoading, error: slotsError, execute: fetchSlots } = useApi(slotApi.getMySlots);
  const { data: appointments, isLoading: isApptsLoading, error: apptsError, execute: fetchAppointments, setData: setAppointments } = useApi(appointmentApi.getBySlot);
  const { execute: verifyRecord } = useApi(medicalHistoryApi.verify);

  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = async (recordId: string) => {
    setVerifyingId(recordId);
    try {
      const result = await verifyRecord(recordId);
      if (appointments) {
        setAppointments(
          appointments.map((appt) => ({
            ...appt,
            sharedRecords: appt.sharedRecords?.map((r) => (r.id === recordId ? result.record : r)),
          }))
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to verify record');
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (slots && slots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(slots[0].id);
    }
  }, [slots, selectedSlotId]);

  useEffect(() => {
    if (selectedSlotId) {
      fetchAppointments(selectedSlotId);
    }
  }, [selectedSlotId, fetchAppointments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Patient Bookings</h2>
        <p className="text-slate-500 text-xs mt-1">Review patients booked against your availability slots.</p>
      </div>

      {isSlotsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : slotsError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading slots: {slotsError}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          You have no slots yet. Create one from &quot;Manage Slots&quot; to start receiving bookings.
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select a Slot
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {slots.map((slot: Slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.slotDate} &bull; {slot.startTime?.slice(0, 5)}-{slot.endTime?.slice(0, 5)} &bull; {slot.hospital?.name} ({slot.bookedTokens}/{slot.maxTokens} booked)
                </option>
              ))}
            </select>
          </div>

          {isApptsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : apptsError ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
              Error loading bookings: {apptsError}
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
              No patients have booked this slot yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Token</th>
                    <th className="px-6 py-3">Reason</th>
                    <th className="px-6 py-3">Shared Records</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .slice()
                    .sort((a: Appointment, b: Appointment) => a.tokenNumber - b.tokenNumber)
                    .map((appt: Appointment) => (
                      <tr key={appt.id} className="border-t border-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800">#{appt.tokenNumber}</td>
                        <td className="px-6 py-4 text-slate-600 italic">&ldquo;{appt.reason}&rdquo;</td>
                        <td className="px-6 py-4">
                          {!appt.sharedRecords || appt.sharedRecords.length === 0 ? (
                            <span className="text-xs text-slate-400">None shared</span>
                          ) : (
                            <div className="space-y-1.5">
                              {appt.sharedRecords.map((record) => (
                                <div key={record.id} className="flex items-center gap-2">
                                  <span className="text-xs text-slate-700">{record.title}</span>
                                  {record.status === 'verified' ? (
                                    <span className="text-[10px] font-semibold text-emerald-700">Verified</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleVerify(record.id)}
                                      disabled={verifyingId === record.id}
                                      className="text-[10px] font-semibold text-primary hover:underline disabled:opacity-50"
                                    >
                                      {verifyingId === record.id ? 'Verifying…' : 'Verify'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                appt.status === 'confirmed'
                                  ? 'bg-emerald-700'
                                  : appt.status === 'cancelled'
                                  ? 'bg-rose-700'
                                  : 'bg-amber-700'
                              }`}
                            />
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                              {appt.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(appt.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

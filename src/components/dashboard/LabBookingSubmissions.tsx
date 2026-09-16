'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { AdminLabBooking, LabBookingStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | LabBookingStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'addressed', label: 'Addressed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE: Record<LabBookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  addressed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export function LabBookingSubmissions() {
  const { data, isLoading, error, execute: fetchBookings } = useApi(adminApi.getLabBookings);
  const { isLoading: isSaving, execute: updateLabBooking } = useApi(adminApi.updateLabBooking);

  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<LabBookingStatus>('pending');
  const [draftNote, setDraftNote] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings(filter === 'all' ? undefined : filter);
  }, [filter, fetchBookings]);

  const handleExpand = (booking: AdminLabBooking) => {
    if (expandedId === booking.id) {
      setExpandedId(null);
      setSaveError(null);
      return;
    }
    setExpandedId(booking.id);
    setDraftStatus(booking.status);
    setDraftNote(booking.adminNote ?? '');
    setSaveError(null);
  };

  const handleSave = async (booking: AdminLabBooking) => {
    setSaveError(null);
    setSavingId(booking.id);
    try {
      await updateLabBooking(booking.id, { status: draftStatus, adminNote: draftNote.trim() || undefined });
      setExpandedId(null);
      await fetchBookings(filter === 'all' ? undefined : filter);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSavingId(null);
    }
  };

  const bookings = data?.bookings ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Lab Booking Requests</h2>
        <p className="text-slate-500 text-xs mt-1">Review lab test requests submitted by patients and follow up with them.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              filter === f.id
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading bookings: {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No {filter === 'all' ? '' : filter} booking requests found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Test</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: AdminLabBooking) => (
                <React.Fragment key={booking.id}>
                  <tr className="border-t border-slate-50 align-top">
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{booking.fullName}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{booking.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.test?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => handleExpand(booking)}>
                        {expandedId === booking.id ? 'Close' : 'Manage'}
                      </Button>
                    </td>
                  </tr>
                  {booking.notes && (
                    <tr className="border-t border-slate-50">
                      <td colSpan={7} className="px-6 py-2 text-xs text-slate-500 bg-slate-50/50">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider">Notes: </span>
                        {booking.notes}
                      </td>
                    </tr>
                  )}
                  {expandedId === booking.id && (
                    <tr className="border-t border-slate-50">
                      <td colSpan={7} className="px-6 py-4 bg-slate-50/50">
                        {saveError && (
                          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold mb-4">
                            {saveError}
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row gap-4 md:items-end">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                              value={draftStatus}
                              onChange={(e) => setDraftStatus(e.target.value as LabBookingStatus)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="pending">Pending</option>
                              <option value="addressed">Addressed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Note</label>
                            <textarea
                              value={draftNote}
                              onChange={(e) => setDraftNote(e.target.value)}
                              placeholder="e.g. Called the patient — sample collection scheduled for 8 AM tomorrow."
                              rows={2}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <Button size="sm" isLoading={isSaving && savingId === booking.id} onClick={() => handleSave(booking)}>
                            Save
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

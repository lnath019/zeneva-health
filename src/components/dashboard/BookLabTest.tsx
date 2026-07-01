'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { labApi, labAppointmentApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { LabSlot } from '@/types';

export function BookLabTest() {
  const router = useRouter();
  const { data: slots, isLoading, error, execute: fetchSlots } = useApi(labApi.getSlots);
  const { isLoading: isBooking, execute: bookAppointment } = useApi(labAppointmentApi.book);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [bookingSlot, setBookingSlot] = useState<LabSlot | null>(null);
  const [testId, setTestId] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleOpenBookingModal = (slot: LabSlot) => {
    setBookingSlot(slot);
    setTestId(slot.lab?.labTests?.[0]?.testId ?? '');
    setNotes('');
    setBookingError(null);
  };

  const handleCloseBookingModal = () => setBookingSlot(null);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!bookingSlot) {
      setBookingError('No slot selected.');
      return;
    }
    if (!testId) {
      setBookingError('Please select a test.');
      return;
    }

    try {
      await bookAppointment(bookingSlot.id, testId, notes.trim() || undefined);
      setBookingSlot(null);
      router.push('/dashboard/my-lab-appointments');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book lab test');
    }
  };

  const filteredSlots = slots?.filter((slot: LabSlot) => {
    if (slot.status !== 'active') return false;

    const labName = slot.lab?.name || '';
    const testNames = slot.lab?.labTests?.map((lt) => lt.test.name).join(' ') || '';
    const matchSearch =
      labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testNames.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDate = selectedDate ? slot.slotDate === selectedDate : true;

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Book a Lab Test</h2>
        <p className="text-slate-500 text-xs mt-1">
          Find a lab that offers your test and book an available slot.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Search Lab or Test
          </label>
          <Input
            placeholder="Type lab or test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Date
          </label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading available slots: {error}
        </div>
      ) : !filteredSlots || filteredSlots.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No available slots match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map((slot: LabSlot) => (
            <div
              key={slot.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-neutralBrand py-1 rounded-full uppercase tracking-wider">
                    {slot.slotDate}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-0.5">
                  {slot.lab?.name || 'Diagnostic Lab'}
                </h3>
                <p className="text-primary text-xs font-semibold mb-4">
                  {slot.lab?.labTests?.map((lt) => lt.test.name).join(', ') || 'No tests listed'}
                </p>

                <div className="space-y-2 text-xs text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 font-medium">Max tokens: {slot.maxTokens}</span>
                <Button onClick={() => handleOpenBookingModal(slot)} size="sm">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingSlot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Confirm Lab Test Booking</h3>
              <button
                onClick={handleCloseBookingModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {bookingError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 text-xs text-slate-700">
                <p><strong>Lab:</strong> {bookingSlot.lab?.name}</p>
                <p>
                  <strong>Date &amp; Time:</strong> {bookingSlot.slotDate} (
                  {bookingSlot.startTime?.slice(0, 5)} - {bookingSlot.endTime?.slice(0, 5)})
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Test</label>
                <select
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="" disabled>Select a test</option>
                  {bookingSlot.lab?.labTests?.map((lt) => (
                    <option key={lt.testId} value={lt.testId}>{lt.test.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. fasting since last night"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={handleCloseBookingModal} disabled={isBooking}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isBooking}>
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

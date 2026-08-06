'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { slotApi, hospitalApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Slot, Hospital } from '@/types';
import { useRoleAccent } from '@/hooks/useRoleAccent';
import { cn } from '@/lib/utils';

export function ManageSlots() {
  const accent = useRoleAccent();
  const { data: slots, isLoading: isSlotsLoading, error: slotsError, execute: fetchSlots, setData: setSlots } = useApi(slotApi.getMySlots);
  const { data: hospitals, execute: fetchHospitals } = useApi(hospitalApi.getAll);
  const { isLoading: isCreating, execute: createSlot } = useApi(slotApi.create);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxTokens, setMaxTokens] = useState('10');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
    fetchHospitals();
  }, [fetchSlots, fetchHospitals]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setHospitalId(hospitals && hospitals.length > 0 ? hospitals[0].id : '');
    setSlotDate('');
    setStartTime('');
    setEndTime('');
    setMaxTokens('10');
    setCreateError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!hospitalId || !slotDate || !startTime || !endTime || !maxTokens) {
      setCreateError('Please fill out all required fields.');
      return;
    }

    const tokens = parseInt(maxTokens, 10);
    if (isNaN(tokens) || tokens <= 0) {
      setCreateError('Maximum tokens must be a positive number.');
      return;
    }

    // Validate times
    if (startTime >= endTime) {
      setCreateError('End time must be after start time.');
      return;
    }

    try {
      const newSlot = await createSlot({
        hospitalId,
        slotDate,
        startTime,
        endTime,
        maxTokens: tokens,
      });

      if (slots) {
        setSlots([...slots, newSlot]);
      } else {
        setSlots([newSlot]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create slot';
      setCreateError(msg);
    }
  };

  const getHospitalName = (id: string) => {
    if (!hospitals) return 'Loading hospital...';
    const hospital = hospitals.find((h: Hospital) => h.id === id);
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  return (
    <div className="">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Availability Slots</h2>
          <p className="text-slate-500 text-xs mt-1">Manage and schedule slots for patients to book appointments.</p>
        </div>
        <Button onClick={handleOpenModal} size="sm">
          Add Slot
        </Button>
      </div>

      {/* Main Content */}
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
          No slots created yet. Click &quot;Add Slot&quot; to set up your availability.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot: Slot) => {
            const bookedPercentage = Math.min(100, Math.round((slot.bookedTokens / slot.maxTokens) * 100));
            return (
              <div
                key={slot.id}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-neutralBrand py-1 rounded-full uppercase tracking-wider">
                      {slot.slotDate}
                    </span>
                    <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      slot.status === "active"
                        ? "bg-emerald-700"
                        : "bg-amber-700"
                    } `}
                  />

                  <span
                    className={`text-xs font-semibold px-1 py-1 rounded-full capitalize tracking-wider `}
                  >
                    {slot.status}
                  </span>
                  </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    {slot.startTime} - {slot.endTime}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {getHospitalName(slot.hospitalId)}
                  </p>
                </div>

                <div className="border-t border-slate-50 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500">
                    <span>Booked Tokens</span>
                    <span className="font-semibold text-slate-700">
                      {slot.bookedTokens} / {slot.maxTokens}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                   <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        bookedPercentage >= 100
                          ? 'bg-red-500'
                          : bookedPercentage > 75
                          ? 'bg-amber-500'
                          : accent.bg
                      }`}
                      style={{ width: `${bookedPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Backdrop and Box */}
      {isModalOpen && (
        <div className="fixed h-full inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 ease-out scale-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create Availability Slot</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {createError}
                </div>
              )}

              {/* Hospital Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1',
                    accent.border,
                    accent.ring
                  )}
                >
                  <option value="" disabled>Select a Hospital</option>
                  {hospitals?.map((hospital: Hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <Input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  required
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Max Tokens</label>
                <Input
                  type="number"
                  min="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner size="sm" className="text-white" /> : 'Create Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

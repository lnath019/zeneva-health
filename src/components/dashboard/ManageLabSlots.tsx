'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { labApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { LabSlot } from '@/types';

export function ManageLabSlots() {
  const { data: slots, isLoading, error, execute: fetchSlots, setData: setSlots } = useApi(labApi.getMySlots);
  const { isLoading: isCreating, execute: createSlot } = useApi(labApi.createSlot);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxTokens, setMaxTokens] = useState('10');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSlotDate('');
    setStartTime('');
    setEndTime('');
    setMaxTokens('10');
    setCreateError(null);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!slotDate || !startTime || !endTime || !maxTokens) {
      setCreateError('Please fill out all required fields.');
      return;
    }

    const tokens = parseInt(maxTokens, 10);
    if (isNaN(tokens) || tokens <= 0) {
      setCreateError('Maximum tokens must be a positive number.');
      return;
    }

    if (startTime >= endTime) {
      setCreateError('End time must be after start time.');
      return;
    }

    try {
      const result = await createSlot({ slotDate, startTime, endTime, maxTokens: tokens });
      setSlots(slots ? [...slots, result.slot] : [result.slot]);
      setIsModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create slot');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Test Slots</h2>
          <p className="text-slate-500 text-xs mt-1">Manage and schedule slots for patients to book lab tests.</p>
        </div>
        <Button onClick={handleOpenModal} size="sm">
          Add Slot
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading slots: {error}
        </div>
      ) : !slots || slots.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No slots created yet. Click &quot;Add Slot&quot; to set up your availability.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot: LabSlot) => (
            <div
              key={slot.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-neutralBrand py-1 rounded-full uppercase tracking-wider">
                  {slot.slotDate}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${slot.status === 'active' ? 'bg-emerald-700' : slot.status === 'paused' ? 'bg-amber-700' : 'bg-slate-400'}`}
                  />
                  <span className="text-xs font-semibold capitalize tracking-wider text-slate-600">
                    {slot.status}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1">
                {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
              </h3>
              <p className="text-slate-500 text-xs">Max tokens: {slot.maxTokens}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed h-full inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create Test Slot</h3>
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Max Tokens</label>
                <Input type="number" min="1" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} required />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isCreating}>
                  Create Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

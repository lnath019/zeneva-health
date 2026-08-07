'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { slotApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { HospitalDoctorSchedule, HospitalSlotSummary } from '@/types';
import { useRoleAccent } from '@/hooks/useRoleAccent';
import { cn } from '@/lib/utils';
import { hospitalAdminApi } from '@/lib/api';

export function HospitalSlots() {
  const accent = useRoleAccent();
  const { data: schedule, isLoading, error, execute: fetchSchedule } = useApi(slotApi.getHospitalSchedule);
  const { data: hospitalLinks, execute: fetchHospitalLinks } = useApi(hospitalAdminApi.getMyHospitalDoctors);
  const { isLoading: isCreating, execute: createSlot } = useApi(slotApi.create);
  const { execute: pauseSlot } = useApi(slotApi.pause);
  const { execute: resumeSlot } = useApi(slotApi.resume);
  const { execute: endSlot } = useApi(slotApi.end);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxTokens, setMaxTokens] = useState('10');
  const [createError, setCreateError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

 useEffect(() => {
    fetchSchedule();
    fetchHospitalLinks();
  }, [fetchSchedule, fetchHospitalLinks]);

  const approvedDoctors = hospitalLinks?.filter((l) => l.status === 'approved') ?? [];

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setDoctorId(approvedDoctors.length > 0 ? approvedDoctors[0].doctorId : '');
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

    if (!doctorId || !slotDate || !startTime || !endTime || !maxTokens) {
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

    const hospitalId = hospitalLinks?.find((l) => l.status === 'approved')?.hospitalId;

    try {
      await createSlot({
        doctorId,
        hospitalId: hospitalId ?? '',
        slotDate,
        startTime,
        endTime,
        maxTokens: tokens,
      });
      await fetchSchedule();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create slot';
      setCreateError(msg);
    }
  };

  const handleAction = async (slotId: string, action: 'pause' | 'resume' | 'end') => {
    setActioningId(slotId);
    try {
      if (action === 'pause') await pauseSlot(slotId);
      if (action === 'resume') await resumeSlot(slotId);
      if (action === 'end') await endSlot(slotId);
      await fetchSchedule();
    } catch {
      // no-op, surfaced inline if needed later
    } finally {
      setActioningId(null);
    }
  };

  const statusDot = (status: HospitalSlotSummary['status']) => {
    const styles: Record<HospitalSlotSummary['status'], string> = {
      active: 'bg-emerald-500',
      paused: 'bg-amber-500',
      ended: 'bg-slate-400',
    };
    return styles[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hospital Slot Management</h2>
          <p className="text-slate-500 text-xs mt-1">Create and manage availability slots for your approved doctors.</p>
        </div>
        <Button onClick={handleOpenModal} size="sm" disabled={approvedDoctors.length === 0}>
          Add Slot
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading schedule: {error}
        </div>
      ) : !schedule || schedule.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          {approvedDoctors.length === 0
            ? 'No approved doctors yet. Once a doctor is linked and approved, you can create slots for them here.'
            : 'No slots created yet. Click "Add Slot" to schedule availability for your doctors.'}
        </div>
      ) : (
        <div className="space-y-6">
          {schedule.map((entry: HospitalDoctorSchedule) => (
            <div key={entry.doctor.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">{entry.doctor.user?.fullName ?? 'Unknown Doctor'}</h3>
                <p className="text-xs text-slate-400">{entry.doctor.specialisation?.name ?? '—'}</p>
              </div>

              {entry.slots.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">No slots yet for this doctor.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {entry.slots.map((slot) => (
                    <div key={slot.id} className="border border-slate-100 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-neutralBrand uppercase tracking-wider">
                          {slot.slotDate}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusDot(slot.status)}`} />
                          <span className="text-xs font-semibold capitalize text-slate-500">{slot.status}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {slot.startTime} - {slot.endTime}
                      </h4>
                      <p className="text-xs text-slate-400 mb-3">Max tokens: {slot.maxTokens}</p>

                      <div className="flex gap-2 flex-wrap">
                        {slot.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actioningId === slot.id}
                            onClick={() => handleAction(slot.id, 'pause')}
                          >
                            {actioningId === slot.id ? <Spinner size="sm" /> : 'Pause'}
                          </Button>
                        )}
                        {slot.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actioningId === slot.id}
                            onClick={() => handleAction(slot.id, 'resume')}
                          >
                            {actioningId === slot.id ? <Spinner size="sm" /> : 'Resume'}
                          </Button>
                        )}
                        {slot.status !== 'ended' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actioningId === slot.id}
                            onClick={() => handleAction(slot.id, 'end')}
                          >
                            End
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed h-full inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create Slot for Doctor</h3>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1',
                    accent.border,
                    accent.ring
                  )}
                >
                  <option value="" disabled>Select a Doctor</option>
                  {approvedDoctors.map((link) => (
                    <option key={link.doctorId} value={link.doctorId}>
                      {link.doctor?.user?.fullName ?? 'Unknown Doctor'}
                    </option>
                  ))}
                </select>
              </div>    

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
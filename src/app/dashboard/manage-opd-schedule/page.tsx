'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { opdScheduleApi, hospitalAdminApi, OpdScheduleEntry } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_LABELS: Record<string, string> = {
  sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
};

export default function ManageOpdSchedulePage() {
  const { data: schedule, isLoading, error, execute: fetchSchedule, setData: setSchedule } = useApi(opdScheduleApi.getMy);
  const { data: hospitalLinks, execute: fetchHospitalLinks } = useApi(hospitalAdminApi.getMyHospitalDoctors);
  const { isLoading: isCreating, execute: createEntry } = useApi(opdScheduleApi.create);
  const { execute: removeEntry } = useApi(opdScheduleApi.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('sunday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
    fetchHospitalLinks();
  }, [fetchSchedule, fetchHospitalLinks]);

  const approvedDoctors = hospitalLinks?.filter((l) => l.status === 'approved') ?? [];

  const handleOpenModal = () => {
    setDoctorId(approvedDoctors.length > 0 ? approvedDoctors[0].doctorId : '');
    setDayOfWeek('sunday');
    setStartTime('');
    setEndTime('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!doctorId || !startTime || !endTime) {
      setFormError('Please fill out all fields.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('End time must be after start time.');
      return;
    }

    try {
      const result = await createEntry({ doctorId, dayOfWeek, startTime, endTime });
      setSchedule(schedule ? [...schedule, result.entry] : [result.entry]);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add schedule entry');
    }
  };

  const handleRemove = async (entry: OpdScheduleEntry) => {
    setRemovingId(entry.id);
    try {
      await removeEntry(entry.id);
      setSchedule(schedule ? schedule.filter((e) => e.id !== entry.id) : []);
    } catch {
      // no-op
    } finally {
      setRemovingId(null);
    }
  };

  const sortedSchedule = [...(schedule ?? [])].sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">OPD Schedule</h2>
          <p className="text-slate-500 text-xs mt-1">
            Recurring weekly reference of which doctor is in, and when. Not tied to bookable dates.
          </p>
        </div>
        <Button onClick={handleOpenModal} size="sm" disabled={approvedDoctors.length === 0}>
          + Add Entry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading schedule: {error}
        </div>
      ) : sortedSchedule.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          {approvedDoctors.length === 0
            ? 'No approved doctors yet. Once a doctor is linked and approved, you can add their OPD hours here.'
            : 'No OPD schedule entries yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Day</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Specialisation</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedule.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{DAY_LABELS[entry.dayOfWeek]}</td>
                  <td className="px-6 py-4 text-slate-700">{entry.doctor?.user?.fullName ?? 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500">{entry.doctor?.specialisation?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-700">{entry.startTime} - {entry.endTime}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removingId === entry.id}
                      onClick={() => handleRemove(entry)}
                    >
                      {removingId === entry.id ? <Spinner size="sm" /> : 'Remove'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add OPD Schedule Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Day</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DAY_ORDER.map((d) => (
                    <option key={d} value={d}>{DAY_LABELS[d]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner size="sm" className="text-white" /> : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
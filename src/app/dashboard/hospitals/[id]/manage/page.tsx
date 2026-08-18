'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { hospitalAdminApi, slotApi, opdScheduleApi, hospitalApi, OpdScheduleEntry } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { HospitalImageManager } from '@/components/dashboard/HospitalImageManager';
import { HospitalDoctorSchedule } from '@/types';

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_LABELS: Record<string, string> = {
  sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
};

type Tab = 'doctors' | 'slots' | 'opd' | 'photos';

export default function ManageHospitalPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = String(params.id);
  const [tab, setTab] = useState<Tab>('doctors');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // the cover lives on the hospital row, not the gallery — fetch it once so
  // the Photos tab can mark which image is currently in use
  useEffect(() => {
    hospitalApi.getById(hospitalId).then((h) => setCoverUrl(h.imageUrl ?? null)).catch(() => setCoverUrl(null));
  }, [hospitalId]);

  // ── Doctors tab ──
  const { data: doctorLinks, isLoading: doctorsLoading, execute: fetchDoctors, setData: setDoctorLinks } =
    useApi(() => hospitalAdminApi.getHospitalDoctors(hospitalId));
  const { execute: addDoctor } = useApi(hospitalAdminApi.addDoctor);
  const { execute: removeDoctorLink } = useApi(hospitalAdminApi.removeLink);
  const [nmcNumber, setNmcNumber] = useState('');
  const [addDoctorError, setAddDoctorError] = useState<string | null>(null);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  // ── Slots tab ──
  const { data: schedule, isLoading: slotsLoading, execute: fetchSlots } =
    useApi(() => slotApi.getHospitalSchedule(hospitalId));
  const { isLoading: isCreatingSlot, execute: createSlot } = useApi(slotApi.create);
  const { execute: pauseSlot } = useApi(slotApi.pause);
  const { execute: resumeSlot } = useApi(slotApi.resume);
  const { execute: endSlot } = useApi(slotApi.end);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [slotDoctorId, setSlotDoctorId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [slotMaxTokens, setSlotMaxTokens] = useState('10');
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotActioningId, setSlotActioningId] = useState<string | null>(null);

  // ── OPD tab ──
  const { data: opdSchedule, isLoading: opdLoading, execute: fetchOpd, setData: setOpdSchedule } =
    useApi(() => opdScheduleApi.getByHospital(hospitalId));
  const { isLoading: isCreatingOpd, execute: createOpd } = useApi(opdScheduleApi.create);
  const { execute: removeOpd } = useApi(opdScheduleApi.remove);
  const [showAddOpd, setShowAddOpd] = useState(false);
  const [opdDoctorId, setOpdDoctorId] = useState('');
  const [opdDay, setOpdDay] = useState<string>('sunday');
  const [opdStart, setOpdStart] = useState('');
  const [opdEnd, setOpdEnd] = useState('');
  const [opdError, setOpdError] = useState<string | null>(null);
  const [opdRemovingId, setOpdRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchSlots();
    fetchOpd();
  }, [hospitalId]);

  const approvedDoctors = doctorLinks?.filter((l) => l.status === 'approved') ?? [];

  // ── Doctors handlers ──
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddDoctorError(null);
    if (!nmcNumber.trim()) { setAddDoctorError('NMC number is required.'); return; }
    setIsAddingDoctor(true);
    try {
      await addDoctor(nmcNumber.trim(), hospitalId);
      await fetchDoctors();
      setNmcNumber('');
      setShowAddDoctor(false);
    } catch (err) {
      setAddDoctorError(err instanceof Error ? err.message : 'Failed to add doctor');
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (linkId: string) => {
    if (!confirm('Remove this doctor from the hospital?')) return;
    try {
      await removeDoctorLink(linkId);
      if (doctorLinks) setDoctorLinks(doctorLinks.filter((l) => l.id !== linkId));
    } catch {
      // no-op
    }
  };

  // ── Slots handlers ──
  const handleOpenAddSlot = () => {
    setSlotDoctorId(approvedDoctors.length > 0 ? approvedDoctors[0].doctorId : '');
    setSlotDate(''); setSlotStart(''); setSlotEnd(''); setSlotMaxTokens('10');
    setSlotError(null);
    setShowAddSlot(true);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);
    if (!slotDoctorId || !slotDate || !slotStart || !slotEnd || !slotMaxTokens) {
      setSlotError('Please fill out all fields.'); return;
    }
    const tokens = parseInt(slotMaxTokens, 10);
    if (isNaN(tokens) || tokens <= 0) { setSlotError('Max tokens must be a positive number.'); return; }
    if (slotStart >= slotEnd) { setSlotError('End time must be after start time.'); return; }

    try {
      await createSlot({
        doctorId: slotDoctorId,
        hospitalId,
        slotDate,
        startTime: slotStart,
        endTime: slotEnd,
        maxTokens: tokens,
      });
      await fetchSlots();
      setShowAddSlot(false);
    } catch (err) {
      setSlotError(err instanceof Error ? err.message : 'Failed to create slot');
    }
  };

  const handleSlotAction = async (slotId: string, action: 'pause' | 'resume' | 'end') => {
    setSlotActioningId(slotId);
    try {
      if (action === 'pause') await pauseSlot(slotId);
      if (action === 'resume') await resumeSlot(slotId);
      if (action === 'end') await endSlot(slotId);
      await fetchSlots();
    } catch {
      // no-op
    } finally {
      setSlotActioningId(null);
    }
  };

  // ── OPD handlers ──
  const handleOpenAddOpd = () => {
    setOpdDoctorId(approvedDoctors.length > 0 ? approvedDoctors[0].doctorId : '');
    setOpdDay('sunday'); setOpdStart(''); setOpdEnd('');
    setOpdError(null);
    setShowAddOpd(true);
  };

  const handleCreateOpd = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpdError(null);
    if (!opdDoctorId || !opdStart || !opdEnd) { setOpdError('Please fill out all fields.'); return; }
    if (opdStart >= opdEnd) { setOpdError('End time must be after start time.'); return; }

    try {
      const result = await createOpd({ doctorId: opdDoctorId, dayOfWeek: opdDay, startTime: opdStart, endTime: opdEnd, hospitalId });
      setOpdSchedule(opdSchedule ? [...opdSchedule, result.entry] : [result.entry]);
      setShowAddOpd(false);
    } catch (err) {
      setOpdError(err instanceof Error ? err.message : 'Failed to add schedule entry');
    }
  };

  const handleRemoveOpd = async (entry: OpdScheduleEntry) => {
    setOpdRemovingId(entry.id);
    try {
      await removeOpd(entry.id);
      setOpdSchedule(opdSchedule ? opdSchedule.filter((e) => e.id !== entry.id) : []);
    } catch {
      // no-op
    } finally {
      setOpdRemovingId(null);
    }
  };

  const sortedOpd = [...(opdSchedule ?? [])].sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/dashboard/hospitals')} className="text-sm text-slate-500 hover:text-slate-700 mb-2">
            ← Back to Hospital Directory
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Hospital</h1>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(['doctors', 'slots', 'opd', 'photos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t === 'doctors' ? 'Doctors' : t === 'slots' ? 'Slots' : t === 'opd' ? 'OPD Schedule' : 'Photos'}
          </button>
        ))}
      </div>

      {/* ── DOCTORS TAB ── */}
      {tab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddDoctor(true)}>+ Add Doctor</Button>
          </div>

          {doctorsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : !doctorLinks || doctorLinks.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500">
              No doctors linked yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Doctor</th>
                    <th className="px-6 py-3">NMC Number</th>
                    <th className="px-6 py-3">Specialisation</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorLinks.map((link) => (
                    <tr key={link.id} className="border-t border-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{link.doctor?.user?.fullName ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{link.doctor?.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{link.doctor?.nmcNumber ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-500">{link.doctor?.specialisation?.name ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          link.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          link.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {link.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveDoctor(link.id)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SLOTS TAB ── */}
      {tab === 'slots' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleOpenAddSlot} disabled={approvedDoctors.length === 0}>+ Add Slot</Button>
          </div>

          {slotsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : !schedule || schedule.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500">
              {approvedDoctors.length === 0 ? 'No approved doctors yet.' : 'No slots created yet.'}
            </div>
          ) : (
            <div className="space-y-6">
              {(schedule as HospitalDoctorSchedule[]).map((entry) => (
                <div key={entry.doctor.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">{entry.doctor.user?.fullName ?? 'Unknown Doctor'}</h3>
                    <p className="text-xs text-slate-400">{entry.doctor.specialisation?.name ?? '—'}</p>
                  </div>
                  {entry.slots.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-400 text-sm">No slots yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      {entry.slots.map((slot) => (
                        <div key={slot.id} className="border border-slate-100 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-neutralBrand uppercase tracking-wider">{slot.slotDate}</span>
                            <span className="text-xs font-semibold capitalize text-slate-500">{slot.status}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mb-1">{slot.startTime} - {slot.endTime}</h4>
                          <p className="text-xs text-slate-400 mb-3">Max tokens: {slot.maxTokens}</p>
                          <div className="flex gap-2 flex-wrap">
                            {slot.status === 'active' && (
                              <Button size="sm" variant="outline" disabled={slotActioningId === slot.id} onClick={() => handleSlotAction(slot.id, 'pause')}>
                                {slotActioningId === slot.id ? <Spinner size="sm" /> : 'Pause'}
                              </Button>
                            )}
                            {slot.status === 'paused' && (
                              <Button size="sm" variant="outline" disabled={slotActioningId === slot.id} onClick={() => handleSlotAction(slot.id, 'resume')}>
                                {slotActioningId === slot.id ? <Spinner size="sm" /> : 'Resume'}
                              </Button>
                            )}
                            {slot.status !== 'ended' && (
                              <Button size="sm" variant="ghost" disabled={slotActioningId === slot.id} onClick={() => handleSlotAction(slot.id, 'end')}>
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
        </div>
      )}

      {/* ── OPD TAB ── */}
      {tab === 'photos' && (
        <HospitalImageManager
          hospitalId={hospitalId}
          coverUrl={coverUrl}
          onChange={(_images, cover) => setCoverUrl(cover)}
        />
      )}

      {tab === 'opd' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleOpenAddOpd} disabled={approvedDoctors.length === 0}>+ Add Entry</Button>
          </div>

          {opdLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : sortedOpd.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500">
              {approvedDoctors.length === 0 ? 'No approved doctors yet.' : 'No OPD schedule entries yet.'}
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
                  {sortedOpd.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-800">{DAY_LABELS[entry.dayOfWeek]}</td>
                      <td className="px-6 py-4 text-slate-700">{entry.doctor?.user?.fullName ?? 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-500">{entry.doctor?.specialisation?.name ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-700">{entry.startTime} - {entry.endTime}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="ghost" disabled={opdRemovingId === entry.id} onClick={() => handleRemoveOpd(entry)}>
                          {opdRemovingId === entry.id ? <Spinner size="sm" /> : 'Remove'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add Doctor modal ── */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add Doctor by NMC Number</h3>
              <button onClick={() => setShowAddDoctor(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddDoctor} className="p-6 space-y-4">
              {addDoctorError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">{addDoctorError}</div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">NMC Number</label>
                <input
                  value={nmcNumber}
                  onChange={(e) => setNmcNumber(e.target.value)}
                  placeholder="e.g. NMC-00000"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  disabled={isAddingDoctor}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDoctor(false)} disabled={isAddingDoctor}>Cancel</Button>
                <Button type="submit" disabled={isAddingDoctor}>
                  {isAddingDoctor ? <Spinner size="sm" className="text-white" /> : 'Add (pre-approved)'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Slot modal ── */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create Slot</h3>
              <button onClick={() => setShowAddSlot(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
              {slotError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">{slotError}</div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</label>
                <select value={slotDoctorId} onChange={(e) => setSlotDoctorId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="" disabled>Select a Doctor</option>
                  {approvedDoctors.map((link) => (
                    <option key={link.doctorId} value={link.doctorId}>{link.doctor?.user?.fullName ?? 'Unknown'}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start</label>
                  <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End</label>
                  <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Max Tokens</label>
                <input type="number" min="1" value={slotMaxTokens} onChange={(e) => setSlotMaxTokens(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddSlot(false)} disabled={isCreatingSlot}>Cancel</Button>
                <Button type="submit" disabled={isCreatingSlot}>
                  {isCreatingSlot ? <Spinner size="sm" className="text-white" /> : 'Create Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add OPD modal ── */}
      {showAddOpd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add OPD Schedule Entry</h3>
              <button onClick={() => setShowAddOpd(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateOpd} className="p-6 space-y-4">
              {opdError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">{opdError}</div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</label>
                <select value={opdDoctorId} onChange={(e) => setOpdDoctorId(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="" disabled>Select a Doctor</option>
                  {approvedDoctors.map((link) => (
                    <option key={link.doctorId} value={link.doctorId}>{link.doctor?.user?.fullName ?? 'Unknown'}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Day</label>
                <select value={opdDay} onChange={(e) => setOpdDay(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {DAY_ORDER.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start</label>
                  <input type="time" value={opdStart} onChange={(e) => setOpdStart(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End</label>
                  <input type="time" value={opdEnd} onChange={(e) => setOpdEnd(e.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddOpd(false)} disabled={isCreatingOpd}>Cancel</Button>
                <Button type="submit" disabled={isCreatingOpd}>
                  {isCreatingOpd ? <Spinner size="sm" className="text-white" /> : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { hospitalAdminApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { DoctorHospitalLink } from '@/types';
export function ManageDoctors() {
  const { data: links, isLoading, error, execute: fetchLinks, setData: setLinks } = useApi(hospitalAdminApi.getMyHospitalDoctors);
  const { isLoading: isAdding, execute: addDoctor } = useApi(hospitalAdminApi.addDoctor);
  const { execute: respond } = useApi(hospitalAdminApi.respond);
  const { execute: removeLink } = useApi(hospitalAdminApi.removeLink);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nmcNumber, setNmcNumber] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setNmcNumber('');
    setAddError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!nmcNumber.trim()) {
      setAddError('Please enter an NMC number.');
      return;
    }

    try {
      const result = await addDoctor(nmcNumber.trim());
      if (links) {
        setLinks([...links, result.link]);
      } else {
        setLinks([result.link]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add doctor';
      setAddError(msg);
    }
  };

  const handleRespond = async (linkId: string, action: 'approve' | 'reject') => {
    setRespondingId(linkId);
    try {
      const result = await respond(linkId, action);
      if (links) {
        setLinks(links.map((l) => (l.id === linkId ? result.link : l)));
      }
    } catch {
      // error surfaced inline if needed later
    } finally {
      setRespondingId(null);
    }
  };

  const handleRemove = async (linkId: string) => {
    setRemovingId(linkId);
    try {
      await removeLink(linkId);
      if (links) {
        setLinks(links.filter((l) => l.id !== linkId));
      }
    } catch {
      // no-op
    } finally {
      setRemovingId(null);
    }
  };

  const statusBadge = (status: DoctorHospitalLink['status']) => {
    const styles: Record<DoctorHospitalLink['status'], string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return styles[status];
  };

  // links waiting on the hospital's action are ones the doctor initiated
  const needsMyAction = (link: DoctorHospitalLink) => link.status === 'pending' && link.initiatedBy === 'doctor';

  const pendingCount = links?.filter(needsMyAction).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Doctors</h2>
          <p className="text-slate-500 text-xs mt-1">
            {links && links.length > 0 && links[0].hospital
              ? <>Managing doctors for <span className="font-semibold text-slate-700">{links[0].hospital.name}</span></>
              : 'Add doctors by NMC number and manage their affiliation with your hospital.'}
          </p>
        </div>
        <Button onClick={handleOpenModal} size="sm">
          Add Doctor
        </Button>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {pendingCount} doctor request{pendingCount > 1 ? 's' : ''} waiting on your approval
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading doctors: {error}
        </div>
      ) : !links || links.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No doctors linked yet. Click &quot;Add Doctor&quot; to add one by NMC number.
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
              {links.map((link) => (
                <tr key={link.id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {link.doctor?.user?.fullName ?? 'Unknown'}
                    <div className="text-xs text-slate-400 font-normal">{link.doctor?.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{link.doctor?.nmcNumber}</td>
                  <td className="px-6 py-4 text-slate-500">{link.doctor?.specialisation?.name ?? '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${statusBadge(link.status)}`}>
                        {link.status}
                      </span>
                      {link.status === 'pending' && (
                        <span className="text-[11px] text-slate-400">
                          {link.initiatedBy === 'hospital' ? 'Waiting on doctor' : 'Waiting on you'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {needsMyAction(link) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={respondingId === link.id}
                            onClick={() => handleRespond(link.id, 'approve')}
                          >
                            {respondingId === link.id ? <Spinner size="sm" /> : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={respondingId === link.id}
                            onClick={() => handleRespond(link.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {link.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={removingId === link.id}
                          onClick={() => handleRemove(link.id)}
                        >
                          {removingId === link.id ? <Spinner size="sm" /> : 'Remove'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed h-full inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add Doctor</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {addError}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                The doctor will need to approve this request before they appear as linked.
              </div>

              <Input
                label="NMC Number"
                value={nmcNumber}
                onChange={(e) => setNmcNumber(e.target.value)}
                placeholder="e.g. NMC-00000"
                disabled={isAdding}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isAdding}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Spinner size="sm" className="text-white" /> : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
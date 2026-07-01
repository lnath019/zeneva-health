'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Lab } from '@/types';

export function LabApprovals() {
  const { data: labs, isLoading, error, execute: fetchLabs, setData: setLabs } = useApi(adminApi.getAllLabs);
  const { execute: approveLab } = useApi(adminApi.approveLab);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const handleApprove = async (lab: Lab) => {
    setApprovingId(lab.id);
    try {
      const result = await approveLab(lab.id);
      setLabs((labs ?? []).map((l) => (l.id === lab.id ? result.lab : l)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve lab');
    } finally {
      setApprovingId(null);
    }
  };

  const locationLabel = (lab: Lab) => {
    const m = lab.municipality;
    if (!m) return lab.address || '—';
    return [m.name, m.district?.name, m.district?.province?.name].filter(Boolean).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Lab Approvals</h2>
        <p className="text-slate-500 text-xs mt-1">Approve self-registered labs before they appear in the patient-facing directory.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading labs: {error}
        </div>
      ) : !labs || labs.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No labs have registered yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Lab</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab: Lab) => (
                <tr key={lab.id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{lab.name}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {lab.user?.fullName}
                    <div className="text-xs text-slate-400">{lab.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{locationLabel(lab)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        lab.isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${lab.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {lab.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!lab.isApproved && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approvingId === lab.id}
                        onClick={() => handleApprove(lab)}
                      >
                        {approvingId === lab.id ? <Spinner size="sm" /> : 'Approve'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

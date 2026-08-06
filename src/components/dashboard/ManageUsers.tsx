'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { adminApi, doctorApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { User, Specialisation } from '@/types';
import { useRoleAccent } from '@/hooks/useRoleAccent';
import { cn } from '@/lib/utils';

export function ManageUsers() {
  const accent = useRoleAccent();
  const { data: users, isLoading, error, execute: fetchUsers, setData: setUsers } = useApi(adminApi.getAllUsers);
  const { data: specialisations, execute: fetchSpecialisations } = useApi(doctorApi.getSpecialisations);
  const { isLoading: isGranting, execute: grantDoctor } = useApi(adminApi.grantDoctor);
  const { execute: deactivateUser } = useApi(adminApi.deactivateUser);

  const [grantTarget, setGrantTarget] = useState<User | null>(null);
  const [nmcNumber, setNmcNumber] = useState('');
  const [specialisationId, setSpecialisationId] = useState('');
  const [grantError, setGrantError] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchSpecialisations();
  }, [fetchUsers, fetchSpecialisations]);

  const handleOpenGrantModal = (user: User) => {
    setGrantTarget(user);
    setNmcNumber('');
    setSpecialisationId(specialisations && specialisations.length > 0 ? specialisations[0].id : '');
    setGrantError(null);
  };

  const handleCloseGrantModal = () => {
    setGrantTarget(null);
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError(null);

    if (!grantTarget) return;
    if (!nmcNumber.trim() || !specialisationId) {
      setGrantError('Please fill out all required fields.');
      return;
    }

    try {
      await grantDoctor(grantTarget.id, nmcNumber.trim(), specialisationId);
      if (users) {
        setUsers(users.map((u) => (u.id === grantTarget.id ? { ...u, role: 'doctor' } : u)));
      }
      setGrantTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to grant doctor role';
      setGrantError(msg);
    }
  };

  const handleDeactivate = async (user: User) => {
    setDeactivatingId(user.id);
    try {
      await deactivateUser(user.id);
      if (users) {
        setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: false } : u)));
      }
    } catch {
      // surfaced via row state below
    } finally {
      setDeactivatingId(null);
    }
  };

  const roleBadge = (role: User['role']) => {
    const styles: Record<User['role'], string> = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      doctor: 'bg-secondary/10 text-secondary border-secondary/20',
      patient: 'bg-primary/10 text-primary border-primary/20',
      lab: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return styles[role];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">User Directory</h2>
        <p className="text-slate-500 text-xs mt-1">Manage system users, grant doctor permissions, and deactivate accounts.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading users: {error}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No users found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr key={user.id} className="border-t border-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{user.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${roleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-700' : 'bg-slate-400'}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === 'patient' && (
                        <Button size="sm" variant="outline" onClick={() => handleOpenGrantModal(user)}>
                          Grant Doctor
                        </Button>
                      )}
                      {user.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deactivatingId === user.id}
                          onClick={() => handleDeactivate(user)}
                        >
                          {deactivatingId === user.id ? <Spinner size="sm" /> : 'Deactivate'}
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

      {grantTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Grant Doctor Role</h3>
              <button
                onClick={handleCloseGrantModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="p-6 space-y-4">
              {grantError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                  {grantError}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
                Granting doctor access to <strong>{grantTarget.fullName}</strong> ({grantTarget.email})
              </div>

              <Input
                label="NMC Number"
                value={nmcNumber}
                onChange={(e) => setNmcNumber(e.target.value)}
                placeholder="e.g. NMC-00000"
                disabled={isGranting}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Specialisation</label>
               <select
                  value={specialisationId}
                  onChange={(e) => setSpecialisationId(e.target.value)}
                  className={cn(
                    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-1',
                    accent.border,
                    accent.ring
                  )}
                >
                  <option value="" disabled>Select a specialisation</option>
                  {specialisations?.map((spec: Specialisation) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <Button type="button" variant="outline" onClick={handleCloseGrantModal} disabled={isGranting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isGranting}>
                  {isGranting ? <Spinner size="sm" className="text-white" /> : 'Grant Access'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

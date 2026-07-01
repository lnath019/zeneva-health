'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { labApi, locationApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { District, Municipality, Province } from '@/types';

const SELECT_CLS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

export function RegisterLab() {
  const { role } = useAuth();
  const { data: locationTree, execute: fetchTree } = useApi(locationApi.getTree);
  const { isLoading: isRegistering, execute: register } = useApi(labApi.register);

  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [municipalityId, setMunicipalityId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const districts = useMemo<District[]>(() => {
    if (!locationTree || !provinceId) return [];
    return locationTree.find((p: Province) => p.id === provinceId)?.districts ?? [];
  }, [locationTree, provinceId]);

  const municipalities = useMemo<Municipality[]>(() => {
    if (!districtId) return [];
    return districts.find((d: District) => d.id === districtId)?.municipalities ?? [];
  }, [districts, districtId]);

  const handleProvinceChange = (id: string) => {
    setProvinceId(id);
    setDistrictId('');
    setMunicipalityId('');
  };

  const handleDistrictChange = (id: string) => {
    setDistrictId(id);
    setMunicipalityId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Lab name is required.');
      return;
    }
    if (!provinceId || !districtId || !municipalityId) {
      setError('Please select a province, district, and municipality.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        provinceId,
        districtId,
        municipalityId,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register lab');
    }
  };

  if (role !== 'patient') {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
        Only patient accounts can register a new lab.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm max-w-lg mx-auto text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Registration submitted</h2>
        <p className="text-slate-500 text-sm">
          Your lab is pending admin approval. Once approved, it will appear in the
          public directory and you can start creating test slots.
        </p>
        <p className="text-slate-400 text-xs">
          Log out and log back in to unlock the Lab management tabs in your sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Register as a Lab</h2>
        <p className="text-slate-500 text-xs mt-1">
          Register your diagnostic lab. An admin must approve your lab before it becomes visible to patients.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-lg">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lab Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Everest Diagnostics"
            disabled={isRegistering}
            required
          />

          <div>
            <FieldLabel>Province</FieldLabel>
            <select
              value={provinceId}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className={SELECT_CLS}
              disabled={isRegistering || !locationTree}
              required
            >
              <option value="">{!locationTree ? 'Loading provinces…' : 'Select Province'}</option>
              {locationTree?.map((p: Province) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>District</FieldLabel>
            <select
              value={districtId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className={SELECT_CLS}
              disabled={isRegistering || !provinceId}
              required
            >
              <option value="">{!provinceId ? 'Select a province first' : 'Select District'}</option>
              {districts.map((d: District) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Municipality / Local Body</FieldLabel>
            <select
              value={municipalityId}
              onChange={(e) => setMunicipalityId(e.target.value)}
              className={SELECT_CLS}
              disabled={isRegistering || !districtId}
              required
            >
              <option value="">{!districtId ? 'Select a district first' : 'Select Municipality'}</option>
              {municipalities.map((m: Municipality) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Street / Building Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Putalisadak, Kathmandu"
            disabled={isRegistering}
          />

          <Input
            label="Contact Number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01-4412345"
            disabled={isRegistering}
          />

          <Button type="submit" className="w-full" isLoading={isRegistering}>
            {isRegistering ? <Spinner size="sm" className="text-white" /> : 'Register Lab'}
          </Button>
        </form>
      </div>
    </div>
  );
}

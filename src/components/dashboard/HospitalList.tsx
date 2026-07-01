'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { hospitalApi, locationApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { District, Hospital, Municipality, Province } from '@/types';

const SELECT_CLS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

function locationLabel(hospital: Hospital): string {
  const m = hospital.municipality;
  if (!m) return hospital.address || '—';
  const parts = [m.name, m.district?.name, m.district?.province?.name].filter(Boolean);
  return parts.join(', ');
}

export function HospitalList() {
  const { role } = useAuth();
  const { data: hospitals, isLoading, error, execute: fetchHospitals, setData: setHospitals } = useApi(hospitalApi.getAll);
  const { data: locationTree, execute: fetchTree } = useApi(locationApi.getTree);
  const { isLoading: isCreating, execute: createHospital } = useApi(hospitalApi.create);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // form fields
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [municipalityId, setMunicipalityId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  // cascading options
  const districts = useMemo<District[]>(() => {
    if (!locationTree || !provinceId) return [];
    return locationTree.find((p: Province) => p.id === provinceId)?.districts ?? [];
  }, [locationTree, provinceId]);

  const municipalities = useMemo<Municipality[]>(() => {
    if (!districtId) return [];
    return districts.find((d: District) => d.id === districtId)?.municipalities ?? [];
  }, [districts, districtId]);

  const handleOpenModal = () => {
    fetchTree();
    setName(''); setProvinceId(''); setDistrictId(''); setMunicipalityId('');
    setAddress(''); setPhone(''); setCreateError(null);
    setIsModalOpen(true);
  };

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
    setCreateError(null);

    if (!name.trim()) { setCreateError('Hospital name is required.'); return; }
    if (!provinceId || !districtId || !municipalityId) {
      setCreateError('Please select a province, district, and municipality.'); return;
    }

    try {
      const result = await createHospital({
        name: name.trim(),
        provinceId,
        districtId,
        municipalityId,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      const newHospital = result.hospital;
      setHospitals(hospitals ? [...hospitals, newHospital] : [newHospital]);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create hospital');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hospital Directory</h2>
          <p className="text-slate-500 text-xs mt-1">Browse all available hospitals and clinics in our network.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={handleOpenModal} size="sm">Add Hospital</Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading hospitals: {error}
        </div>
      ) : !hospitals || hospitals.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No hospitals found in the network.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.map((hospital: Hospital) => (
            <div
              key={hospital.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-1 transition-all duration-200"
            >
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{hospital.name}</h3>

              <div className="space-y-3 mt-4 text-sm text-slate-500">
                {/* Location hierarchy */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5 opacity-85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="leading-relaxed">{locationLabel(hospital)}</span>
                    {hospital.address && hospital.municipality && (
                      <p className="text-xs text-slate-400 mt-0.5">{hospital.address}</p>
                    )}
                  </div>
                </div>

                {/* Location breadcrumb chips */}
                {hospital.municipality && (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      hospital.municipality.district?.province?.name,
                      hospital.municipality.district?.name,
                      hospital.municipality.name,
                    ].filter(Boolean).map((label, i) => (
                      <span
                        key={i}
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {hospital.phone && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-secondary shrink-0 opacity-85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold text-slate-700">{hospital.phone}</span>
                  </div>
                )}

                {hospital.latitude !== null && hospital.longitude !== null && (
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {hospital.latitude}, {hospital.longitude}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add New Hospital</h3>
                <p className="text-slate-400 text-xs mt-0.5">Register a new healthcare facility to the portal.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">{createError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Hospital Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kathmandu Medical College"
                disabled={isCreating}
                required
              />

              {/* Province */}
              <div>
                <FieldLabel>Province</FieldLabel>
                <select
                  value={provinceId}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isCreating || !locationTree}
                  required
                >
                  <option value="">
                    {!locationTree ? 'Loading provinces…' : 'Select Province'}
                  </option>
                  {locationTree?.map((p: Province) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <FieldLabel>District</FieldLabel>
                <select
                  value={districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isCreating || !provinceId}
                  required
                >
                  <option value="">{!provinceId ? 'Select a province first' : 'Select District'}</option>
                  {districts.map((d: District) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Municipality */}
              <div>
                <FieldLabel>Municipality / Local Body</FieldLabel>
                <select
                  value={municipalityId}
                  onChange={(e) => setMunicipalityId(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isCreating || !districtId}
                  required
                >
                  <option value="">{!districtId ? 'Select a district first' : 'Select Municipality'}</option>
                  {municipalities.map((m: Municipality) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Optional specific address */}
              <Input
                label="Street / Building Address (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sinamangal, Baneshwor"
                disabled={isCreating}
              />

              <Input
                label="Contact Number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01-4412345"
                disabled={isCreating}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isCreating}>
                  Add Hospital
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { hospitalApi, locationApi, mediaUrl } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { District, Hospital, Municipality, Province } from '@/types';
import { cn } from '@/lib/utils';

const SELECT_CLS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50';

const TEXTAREA_CLS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50';

const HOSPITAL_TYPES: { value: string; label: string }[] = [
  { value: 'general', label: 'General Hospital' },
  { value: 'multi_specialty', label: 'Multi-Specialty Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'nursing_home', label: 'Nursing Home' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
];

const hospitalTypeLabel = (type: string | null | undefined) =>
  HOSPITAL_TYPES.find((t) => t.value === type)?.label ?? null;

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

// Card banner. Falls back to a building mark when a hospital has no photo,
// or when the stored path no longer resolves.
function HospitalCardImage({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="-mx-6 mb-5 h-36 bg-primary-light flex items-center justify-center overflow-hidden">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <svg className="w-10 h-10 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )}
    </div>
  );
}

export function HospitalList({ highlightId }: { highlightId?: string | null }) {
  const { role } = useAuth();
  const router = useRouter();
  const { data: hospitals, isLoading, error, execute: fetchHospitals, setData: setHospitals } = useApi(hospitalApi.getAll);
  const { data: locationTree, execute: fetchTree } = useApi(locationApi.getTree);
  const { isLoading: isCreating, execute: createHospital } = useApi(hospitalApi.create);
  const { data: myHospital, execute: fetchMyHospital, setData: setMyHospital } = useApi(hospitalApi.getMy);
  const { isLoading: isUpdating, execute: updateHospital } = useApi(hospitalApi.update);
  const { execute: removeHospital } = useApi(hospitalApi.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // create form fields
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [municipalityId, setMunicipalityId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // edit form fields
  const [editName, setEditName] = useState('');
  const [editProvinceId, setEditProvinceId] = useState('');
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editMunicipalityId, setEditMunicipalityId] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editHospitalType, setEditHospitalType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
    if (role === 'hospital_admin') {
      fetchMyHospital().catch(() => {}); // no hospital linked yet — fine, edit button just won't show
    }
  }, [fetchHospitals, fetchMyHospital, role]);

  useEffect(() => {
    if (!highlightId || !hospitals) return;
    // ?hospital=<id> now scrolls to and highlights the card; the full details
    // live on their own page, which the card links through to
    const el = document.getElementById(`hospital-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, hospitals]);

  // client-side search across everything visible on the card
  const visibleHospitals = useMemo<Hospital[]>(() => {
    if (!hospitals) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return hospitals;

    return hospitals.filter((h: Hospital) => {
      const m = h.municipality;
      return [
        h.name,
        h.address,
        hospitalTypeLabel(h.hospitalType),
        m?.name,
        m?.district?.name,
        m?.district?.province?.name,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));
    });
  }, [hospitals, searchQuery]);

  // cascading options (create modal)
  const districts = useMemo<District[]>(() => {
    if (!locationTree || !provinceId) return [];
    return locationTree.find((p: Province) => p.id === provinceId)?.districts ?? [];
  }, [locationTree, provinceId]);

  const municipalities = useMemo<Municipality[]>(() => {
    if (!districtId) return [];
    return districts.find((d: District) => d.id === districtId)?.municipalities ?? [];
  }, [districts, districtId]);

  // cascading options (edit modal)
  const editDistricts = useMemo<District[]>(() => {
    if (!locationTree || !editProvinceId) return [];
    return locationTree.find((p: Province) => p.id === editProvinceId)?.districts ?? [];
  }, [locationTree, editProvinceId]);

  const editMunicipalities = useMemo<Municipality[]>(() => {
    if (!editDistrictId) return [];
    return editDistricts.find((d: District) => d.id === editDistrictId)?.municipalities ?? [];
  }, [editDistricts, editDistrictId]);

  const handleOpenModal = () => {
    fetchTree();
    setName(''); setProvinceId(''); setDistrictId(''); setMunicipalityId('');
    setAddress(''); setPhone(''); setEmail(''); setWebsite(''); setHospitalType(''); setDescription('');
    setCreateError(null);
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
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        hospitalType: hospitalType || undefined,
        description: description.trim() || undefined,
      });
      const newHospital = result.hospital;
      setHospitals(hospitals ? [...hospitals, newHospital] : [newHospital]);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create hospital');
    }
  };

  // works for both: hospital_admin editing their own hospital, and admin editing any hospital
  const handleOpenEditModal = async (hospital: Hospital) => {
    await fetchTree();
    setEditingHospitalId(hospital.id);
    setEditName(hospital.name);
    setEditAddress(hospital.address || '');
    setEditPhone(hospital.phone || '');
    setEditEmail(hospital.email || '');
    setEditWebsite(hospital.website || '');
    setEditHospitalType(hospital.hospitalType || '');
    setEditDescription(hospital.description || '');
    const prov = hospital.municipality?.district?.province?.id || '';
    const dist = hospital.municipality?.district?.id || '';
    const muni = hospital.municipality?.id || '';
    setEditProvinceId(prov);
    setEditDistrictId(dist);
    setEditMunicipalityId(muni);
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleEditProvinceChange = (id: string) => {
    setEditProvinceId(id);
    setEditDistrictId('');
    setEditMunicipalityId('');
  };

  const handleEditDistrictChange = (id: string) => {
    setEditDistrictId(id);
    setEditMunicipalityId('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editingHospitalId) return;
    if (!editName.trim()) { setEditError('Hospital name is required.'); return; }
    if (!editProvinceId || !editDistrictId || !editMunicipalityId) {
      setEditError('Please select a province, district, and municipality.'); return;
    }

    try {
      const result = await updateHospital(editingHospitalId, {
        name: editName.trim(),
        provinceId: editProvinceId,
        districtId: editDistrictId,
        municipalityId: editMunicipalityId,
        address: editAddress.trim() || undefined,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        website: editWebsite.trim() || undefined,
        hospitalType: editHospitalType || undefined,
        description: editDescription.trim() || undefined,
      });
      const updated = result.hospital;
      if (myHospital && myHospital.id === updated.id) setMyHospital(updated);
      if (hospitals) {
        setHospitals(hospitals.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)));
      }
      setIsEditModalOpen(false);
      setEditingHospitalId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update hospital');
    }
  };

  const handleDeleteHospital = async (hospital: Hospital) => {
    if (!confirm(`Delete "${hospital.name}"? This also removes its admins, doctor links, and OPD schedule.`)) return;
    setDeletingId(hospital.id);
    try {
      await removeHospital(hospital.id);
      if (hospitals) {
        setHospitals(hospitals.filter((h) => h.id !== hospital.id));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete hospital');
    } finally {
      setDeletingId(null);
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

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <label htmlFor="directory-search" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Search hospitals
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            id="directory-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, address or type..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[38px]"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-slate-500 mt-2">
            {visibleHospitals.length} of {hospitals?.length ?? 0} hospital{(hospitals?.length ?? 0) !== 1 ? 's' : ''} match
            {visibleHospitals.length === 0 && ' — try a different term'}
          </p>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading hospitals: {error}
        </div>
      ) : visibleHospitals.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          {searchQuery ? 'No hospitals match your search.' : 'No hospitals found in the network.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleHospitals.map((hospital: Hospital) => (
            <div
              key={hospital.id}
              id={`hospital-${hospital.id}`}
              onClick={() => router.push(`/hospitals/${hospital.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/hospitals/${hospital.id}`);
              }}
              className={cn(
                "bg-white p-6 pt-0 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden",
                hospital.id === highlightId ? "border-primary ring-2 ring-primary/30" : "border-slate-100"
              )}
            >
              <HospitalCardImage src={mediaUrl(hospital.imageUrl)} alt={hospital.name} />

              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{hospital.name}</h3>
                  {hospitalTypeLabel(hospital.hospitalType) && (
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary-light text-secondary">
                      {hospitalTypeLabel(hospital.hospitalType)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {role === 'hospital_admin' && myHospital && myHospital.id === hospital.id && (
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(hospital); }}>
                      Edit
                    </Button>
                  )}
                  {role === 'admin' && (
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(hospital); }}>
                      Edit
                    </Button>
                  )}
                  {role === 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/hospitals/${hospital.id}/manage`); }}
                    >
                      Manage
                    </Button>
                  )}
                  {role === 'admin' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deletingId === hospital.id}
                      onClick={(e) => { e.stopPropagation(); handleDeleteHospital(hospital); }}
                    >
                      {deletingId === hospital.id ? <Spinner size="sm" /> : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>

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

              <div>
                <FieldLabel>Hospital Type (optional)</FieldLabel>
                <select
                  value={hospitalType}
                  onChange={(e) => setHospitalType(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isCreating}
                >
                  <option value="">Select Type</option>
                  {HOSPITAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

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

              <Input
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. info@hospital.com"
                disabled={isCreating}
              />

              <Input
                label="Website (optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. www.hospital.com"
                disabled={isCreating}
              />

              <div>
                <FieldLabel>About / Description (optional)</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={TEXTAREA_CLS}
                  rows={3}
                  placeholder="Brief description of the hospital's services and facilities"
                  disabled={isCreating}
                />
              </div>

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

      {/* Edit Modal — works for hospital_admin (own hospital) and admin (any hospital) */}
      {isEditModalOpen && editingHospitalId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Hospital Details</h3>
                <p className="text-slate-400 text-xs mt-0.5">Update location, contact, and profile info.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">{editError}</div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Hospital Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isUpdating}
                required
              />

              <div>
                <FieldLabel>Hospital Type (optional)</FieldLabel>
                <select
                  value={editHospitalType}
                  onChange={(e) => setEditHospitalType(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isUpdating}
                >
                  <option value="">Select Type</option>
                  {HOSPITAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Province</FieldLabel>
                <select
                  value={editProvinceId}
                  onChange={(e) => handleEditProvinceChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isUpdating || !locationTree}
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

              <div>
                <FieldLabel>District</FieldLabel>
                <select
                  value={editDistrictId}
                  onChange={(e) => handleEditDistrictChange(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isUpdating || !editProvinceId}
                  required
                >
                  <option value="">{!editProvinceId ? 'Select a province first' : 'Select District'}</option>
                  {editDistricts.map((d: District) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Municipality / Local Body</FieldLabel>
                <select
                  value={editMunicipalityId}
                  onChange={(e) => setEditMunicipalityId(e.target.value)}
                  className={SELECT_CLS}
                  disabled={isUpdating || !editDistrictId}
                  required
                >
                  <option value="">{!editDistrictId ? 'Select a district first' : 'Select Municipality'}</option>
                  {editMunicipalities.map((m: Municipality) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Street / Building Address (optional)"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                disabled={isUpdating}
              />

              <Input
                label="Contact Number (optional)"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                disabled={isUpdating}
              />

              <Input
                label="Email (optional)"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="e.g. info@hospital.com"
                disabled={isUpdating}
              />

              <Input
                label="Website (optional)"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="e.g. www.hospital.com"
                disabled={isUpdating}
              />

              <div>
                <FieldLabel>About / Description (optional)</FieldLabel>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className={TEXTAREA_CLS}
                  rows={3}
                  placeholder="Brief description of the hospital's services and facilities"
                  disabled={isUpdating}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
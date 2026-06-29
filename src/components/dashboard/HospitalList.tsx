'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { hospitalApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Hospital } from '@/types';

export function HospitalList() {
  const { role } = useAuth();
  const { data: hospitals, isLoading, error, execute: fetchHospitals, setData: setHospitals } = useApi(hospitalApi.getAll);
  const { isLoading: isCreating, execute: createHospital } = useApi(hospitalApi.create);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setName('');
    setAddress('');
    setPhone('');
    setCreateError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!name || !address || !phone) {
      setCreateError('Please fill out all required fields.');
      return;
    }

    try {
      const newHospital = await createHospital({ name, address, phone });
      if (hospitals) {
        setHospitals([...hospitals, newHospital]);
      } else {
        setHospitals([newHospital]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create hospital';
      setCreateError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hospital Directory</h2>
          <p className="text-slate-500 text-xs mt-1">Browse all available hospitals and clinics in our network.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={handleOpenModal} size="sm">
            Add Hospital
          </Button>
        )}
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
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
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                  {hospital.name}
                </h3>
                
                <div className="space-y-3 mt-4 text-sm text-slate-500 font-normal">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 opacity-85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="leading-relaxed">{hospital.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-secondary shrink-0 opacity-85" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold text-slate-700">{hospital.phone}</span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {hospital.latitude !== null && hospital.longitude !== null ? (
                      <span>Coordinates: {hospital.latitude}, {hospital.longitude}</span>
                    ) : (
                      <span className="italic text-slate-400">Coordinates not registered</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-xl animate-fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add New Hospital</h3>
                <p className="text-slate-400 text-xs mt-0.5">Register a new healthcare clinic to the portal.</p>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">
                {createError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Hospital Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Test V Hospital"
                disabled={isCreating}
                required
              />

              <Input
                label="Clinic Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Kathmandu"
                disabled={isCreating}
                required
              />

              <Input
                label="Contact Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01-1112233"
                disabled={isCreating}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isCreating}>
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

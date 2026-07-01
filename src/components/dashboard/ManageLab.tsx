'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { labApi, testApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Test } from '@/types';

export function ManageLab() {
  const { data: lab, isLoading, error, execute: fetchLab, setData: setLab } = useApi(labApi.getMy);
  const { data: allTests, execute: fetchTests } = useApi(testApi.getAll);
  const { isLoading: isSaving, execute: saveTests } = useApi(labApi.setMyTests);

  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLab();
    fetchTests();
  }, [fetchLab, fetchTests]);

  useEffect(() => {
    if (lab?.labTests) {
      setSelectedTestIds(lab.labTests.map((lt) => lt.testId));
    }
  }, [lab]);

  const toggleTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const updated = await saveTests(selectedTestIds);
      setLab(updated.lab);
      setSaveSuccess('Offered tests updated.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save offered tests');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
        Error loading your lab profile: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{lab.name}</h2>
            <p className="text-slate-500 text-xs mt-1">{lab.address || 'No address on file'}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              lab.isApproved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${lab.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {lab.isApproved ? 'Approved' : 'Pending Approval'}
          </span>
        </div>
      </div>

      {!lab.isApproved && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          Your lab is awaiting admin approval. It won&apos;t appear in the patient-facing
          directory until it&apos;s approved, but you can still set up your offered tests
          and slots ahead of time.
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Offered Tests</h3>
        <p className="text-slate-500 text-xs mb-4">
          Choose which tests from the master catalog your lab performs. Patients can only
          book a test that appears here.
        </p>

        {saveError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold mb-4">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-lg text-xs font-semibold mb-4">
            {saveSuccess}
          </div>
        )}

        {!allTests || allTests.length === 0 ? (
          <p className="text-slate-500 text-sm">No tests exist in the catalog yet. Ask an admin to add some.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {allTests.map((test: Test) => (
              <label
                key={test.id}
                className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 hover:border-primary/40 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTestIds.includes(test.id)}
                  onChange={() => toggleTest(test.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{test.name}</p>
                  {test.description && <p className="text-xs text-slate-500">{test.description}</p>}
                </div>
              </label>
            ))}
          </div>
        )}

        <Button onClick={handleSave} isLoading={isSaving}>
          Save Offered Tests
        </Button>
      </div>
    </div>
  );
}

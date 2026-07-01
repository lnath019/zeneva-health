'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { medicalHistoryApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { MedicalHistoryRecord, RecordCategory } from '@/types';

const CATEGORY_LABELS: Record<RecordCategory, string> = {
  condition: 'Condition',
  allergy: 'Allergy',
  medication: 'Medication',
  surgery: 'Surgery',
  immunization: 'Immunization',
  lab_result: 'Lab Result',
  other: 'Other',
};

const EMPTY_FORM = { category: 'condition' as RecordCategory, title: '', description: '', recordDate: '' };

export function MedicalHistory() {
  const { data: records, isLoading, error, execute: fetchRecords, setData: setRecords } = useApi(medicalHistoryApi.getMy);
  const { isLoading: isSaving, execute: createRecord } = useApi(medicalHistoryApi.create);
  const { execute: updateRecord } = useApi(medicalHistoryApi.update);
  const { execute: removeRecord } = useApi(medicalHistoryApi.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (record: MedicalHistoryRecord) => {
    setEditingId(record.id);
    setForm({
      category: record.category,
      title: record.title,
      description: record.description ?? '',
      recordDate: record.recordDate ?? '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const payload = {
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      recordDate: form.recordDate || undefined,
    };

    try {
      if (editingId) {
        const result = await updateRecord(editingId, payload);
        setRecords((records ?? []).map((r) => (r.id === editingId ? result.record : r)));
      } else {
        const result = await createRecord(payload);
        setRecords([result.record, ...(records ?? [])]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await removeRecord(id);
      setRecords((records ?? []).filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Medical History</h2>
          <p className="text-slate-500 text-xs mt-1">
            Keep a record of your conditions, allergies, medications and more. A doctor or lab
            can verify entries you choose to share when booking an appointment.
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm">Add Record</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading your records: {error}
        </div>
      ) : !records || records.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No medical history recorded yet. Click &quot;Add Record&quot; to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record: MedicalHistoryRecord) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                  {CATEGORY_LABELS[record.category]}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(record)}
                    disabled={record.status === 'verified'}
                    aria-label={`Edit ${record.title}`}
                    title={record.status === 'verified' ? 'Verified records cannot be edited' : undefined}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(record.id)}
                    disabled={deletingId === record.id}
                    aria-label={`Delete ${record.title}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800">{record.title}</h3>
              {record.recordDate && <p className="text-xs text-slate-400 mt-0.5">{record.recordDate}</p>}
              {record.description && <p className="text-xs text-slate-500 mt-2">{record.description}</p>}

              <div className="mt-4 pt-3 border-t border-slate-50">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    record.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {record.status === 'verified'
                    ? `Verified by ${record.verifiedBy?.fullName ?? 'authorized entity'} (${record.verifiedBy?.role})`
                    : 'Unverified'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Edit Record' : 'Add Medical History Record'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {editingId ? 'Update this record.' : 'This will be added as unverified until a doctor or lab confirms it.'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg mb-4">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RecordCategory }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  disabled={isSaving}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Type 2 Diabetes"
                disabled={isSaving}
                required
              />

              <Input
                label="Date (optional)"
                type="date"
                value={form.recordDate}
                onChange={(e) => setForm((f) => ({ ...f, recordDate: e.target.value }))}
                disabled={isSaving}
              />

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Any extra detail worth noting"
                  rows={3}
                  disabled={isSaving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingId ? 'Save Changes' : 'Add Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

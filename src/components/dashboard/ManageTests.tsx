'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { testApi } from '@/lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { Test } from '@/types';

const EMPTY_FORM = { name: '', description: '' };

export function ManageTests() {
  const { data: tests, isLoading, error, execute: fetchTests, setData: setTests } = useApi(testApi.getAll);
  const { isLoading: isSaving, execute: createTest } = useApi(testApi.create);
  const { execute: updateTest } = useApi(testApi.update);
  const { execute: removeTest } = useApi(testApi.remove);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (test: Test) => {
    setEditingId(test.id);
    setForm({ name: test.name, description: test.description ?? '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Test name is required.');
      return;
    }

    const payload = { name: form.name.trim(), description: form.description.trim() || undefined };

    try {
      if (editingId) {
        const result = await updateTest(editingId, payload);
        setTests((tests ?? []).map((t) => (t.id === editingId ? result.test : t)));
      } else {
        const result = await createTest(payload);
        setTests([...(tests ?? []), result.test]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save test');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test? Labs offering it will no longer be able to accept bookings for it.')) return;
    setDeletingId(id);
    try {
      await removeTest(id);
      setTests((tests ?? []).filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage Tests</h2>
          <p className="text-slate-500 text-xs mt-1">The master catalog of tests labs can offer.</p>
        </div>
        <Button onClick={openCreateModal} size="sm">Add Test</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
          Error loading tests: {error}
        </div>
      ) : !tests || tests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-slate-500 font-medium">
          No tests in the catalog yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test: Test) => (
            <div
              key={test.id}
              className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-bold text-slate-800">{test.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(test)}
                    aria-label={`Edit ${test.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(test.id)}
                    disabled={deletingId === test.id}
                    aria-label={`Delete ${test.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {test.description && <p className="text-xs text-slate-500">{test.description}</p>}
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
                  {editingId ? 'Edit Test' : 'Add New Test'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {editingId ? 'Update this test entry.' : 'Add a new test to the master catalog.'}
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
              <Input
                label="Test Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Complete Blood Count"
                disabled={isSaving}
                required
              />
              <Input
                label="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Standard CBC panel"
                disabled={isSaving}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingId ? 'Save Changes' : 'Add Test'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

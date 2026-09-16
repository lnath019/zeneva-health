'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { authApi, labBookingApi, testApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';

export function BookLabTest() {
  const { token } = useAuth();
  const { data: tests, isLoading, error, execute: fetchTests } = useApi(testApi.getAll);
  const { isLoading: isSubmitting, execute: createBooking } = useApi(labBookingApi.create);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [testId, setTestId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((profile) => {
        setFullName(profile.fullName || '');
        setPhone(profile.phone || '');
        setEmail(profile.email || '');
      })
      .catch(() => {
        // not fatal — user can still fill the form manually
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !phone.trim()) {
      setFormError('Please fill in your full name and phone number.');
      return;
    }

    try {
      await createBooking({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        testId: testId || undefined,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit booking request');
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Book a Lab Test</h2>
          <p className="text-slate-500 text-xs mt-1">Request a lab test — our team handles the scheduling.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Request submitted</h3>
          <p className="text-slate-500 text-sm mt-1">Request submitted — our team will call you to confirm.</p>
          <Button
            className="mt-6"
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setNotes('');
              setTestId('');
            }}
          >
            Book another test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Book a Lab Test</h2>
        <p className="text-slate-500 text-xs mt-1">Request a lab test — our team handles the scheduling.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
            Error loading tests: {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={isSubmitting}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                disabled={isSubmitting}
                required
              />
            </div>

            <Input
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-neutralBrand">Test (optional)</label>
              <select
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-neutralBrand shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Not sure yet — let the team advise me</option>
                {tests?.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-neutralBrand">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. fasting since last night, preferred morning slot"
                rows={3}
                disabled={isSubmitting}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-neutralBrand shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isSubmitting}>
                Submit Request
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Our team will call you to confirm your booking.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

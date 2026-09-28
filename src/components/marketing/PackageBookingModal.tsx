'use client';

import React, { useEffect, useState } from 'react';
import { authApi, packageApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { HealthPackage, ServiceType } from '@/types';
import { ServiceTypePicker } from '@/components/ui/ServiceOptions';
import { resolveServiceChoice, serviceLabel } from '@/lib/serviceTypes';

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
const LABEL_CLASS = 'block text-xs font-bold uppercase tracking-wider text-slate-500';

// Booking form for a package: same lead-capture flow as requesting a test.
// Works with or without login; a logged-in user gets their details prefilled.
export function PackageBookingModal({ pkg, onClose }: { pkg: HealthPackage; onClose: () => void }) {
  const { token } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((profile) => {
        setFullName((current) => current || profile.fullName || '');
        setPhone((current) => current || profile.phone || '');
        setEmail((current) => current || profile.email || '');
      })
      .catch(() => {
        // not fatal — the visitor can fill the form in by hand
      });
  }, [token]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }

    // one option offered -> it's the default; several -> the visitor has to pick
    const service = resolveServiceChoice(pkg, serviceType);
    if (!service) {
      setError('Please choose how you would like this service.');
      return;
    }

    setSubmitting(true);
    try {
      await packageApi.book(pkg.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        serviceType: service,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const bookedService = resolveServiceChoice(pkg, serviceType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pkg-booking-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Book package</p>
            <h3 id="pkg-booking-title" className="mt-0.5 truncate text-base font-bold text-slate-800">
              {pkg.topic}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h4 className="mt-4 text-base font-bold text-slate-800">Booking received</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Our team will contact you shortly to confirm{' '}
              <strong className="font-semibold text-slate-700">{pkg.topic}</strong>
              {bookedService && <> ({serviceLabel(bookedService)})</>}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-extrabold text-primary">Rs. {pkg.packagePrice}</span>
              {pkg.savings > 0 && (
                <span className="text-sm text-slate-400 line-through">Rs. {pkg.regularPrice}</span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              Leave your details and our team will call to confirm your booking.
            </p>

            {error && (
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="pkg-fullName" className={LABEL_CLASS}>Full Name</label>
              <input
                id="pkg-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Your full name"
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pkg-phone" className={LABEL_CLASS}>Phone</label>
              <input
                id="pkg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={INPUT_CLASS}
                placeholder="+977-98XXXXXXXX"
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pkg-email" className={LABEL_CLASS}>Email (optional)</label>
              <input
                id="pkg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                placeholder="you@example.com"
                disabled={submitting}
              />
            </div>

            <ServiceTypePicker flags={pkg} value={serviceType} onChange={setServiceType} disabled={submitting} />

            <div className="space-y-1">
              <label htmlFor="pkg-notes" className={LABEL_CLASS}>Notes (optional)</label>
              <textarea
                id="pkg-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={INPUT_CLASS}
                placeholder="e.g. preferred day or time"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Book Package'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

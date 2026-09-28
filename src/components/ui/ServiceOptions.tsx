'use client';

import React from 'react';
import { ServiceFlags, ServiceType } from '@/types';
import { SERVICE_OPTIONS, availableServices, serviceLabel } from '@/lib/serviceTypes';
import { cn } from '@/lib/utils';

const FLAG_BY_SERVICE: Record<ServiceType, keyof ServiceFlags> = {
  virtual: 'isVirtualAvailable',
  home_service: 'isHomeServiceAvailable',
  site_visit: 'isSiteVisitAvailable',
};

// ─────────────────────────────────────────
// ADMIN: tick which services a test / package supports
// ─────────────────────────────────────────

export function ServiceAvailabilityFields({
  value,
  onChange,
  disabled,
  error,
}: {
  value: ServiceFlags;
  onChange: (next: ServiceFlags) => void;
  disabled?: boolean;
  error?: string | null;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-slate-500">Available as (select at least one)</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SERVICE_OPTIONS.map((option) => {
          const flag = FLAG_BY_SERVICE[option.value];
          return (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
                value[flag] ? 'border-primary bg-primary-light/50' : 'border-slate-200 hover:border-slate-300',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={value[flag]}
                disabled={disabled}
                onChange={(e) => onChange({ ...value, [flag]: e.target.checked })}
              />
              <span>
                <span className="block font-semibold text-slate-700">{option.label}</span>
                <span className="block text-xs text-slate-400">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </fieldset>
  );
}

// ─────────────────────────────────────────
// DISPLAY: small chips listing what an item supports
// ─────────────────────────────────────────

export function ServiceBadges({ flags, className }: { flags: ServiceFlags; className?: string }) {
  const services = availableServices(flags);
  if (services.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {services.map((service) => (
        <span
          key={service}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
        >
          {serviceLabel(service)}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// USER: pick how they want the service delivered
// - several offered -> they choose
// - only one offered -> shown as the default, nothing to choose
// ─────────────────────────────────────────

export function ServiceTypePicker({
  flags,
  value,
  onChange,
  disabled,
}: {
  flags: ServiceFlags;
  value: ServiceType | '';
  onChange: (next: ServiceType) => void;
  disabled?: boolean;
}) {
  const services = availableServices(flags);
  if (services.length === 0) return null;

  if (services.length === 1) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">{serviceLabel(services[0])}</span>{' '}
        <span className="text-slate-500">is the only option available, so it is selected by default.</span>
      </div>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-semibold text-neutralBrand">How would you like this service?</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SERVICE_OPTIONS.filter((o) => services.includes(o.value)).map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-2 rounded-lg border-2 px-3 py-2.5 text-sm cursor-pointer transition-colors',
              value === option.value ? 'border-primary bg-primary-light/50' : 'border-slate-200 hover:border-slate-300',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name="serviceType"
              className="mt-0.5"
              checked={value === option.value}
              disabled={disabled}
              onChange={() => onChange(option.value)}
            />
            <span>
              <span className="block font-semibold text-slate-700">{option.label}</span>
              <span className="block text-xs text-slate-400">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

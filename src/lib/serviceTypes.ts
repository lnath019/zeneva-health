import { ServiceFlags, ServiceType } from '@/types';

export const SERVICE_OPTIONS: { value: ServiceType; label: string; description: string }[] = [
  { value: 'virtual', label: 'Virtual', description: 'Online, no travel needed' },
  { value: 'home_service', label: 'Home service', description: 'Our team comes to you' },
  { value: 'site_visit', label: 'Site visit', description: 'Visit our centre in person' },
];

export const AT_LEAST_ONE_SERVICE_MESSAGE =
  'Select at least one service option: virtual, home service or site visit.';

export const serviceLabel = (type: ServiceType | null | undefined) =>
  SERVICE_OPTIONS.find((o) => o.value === type)?.label ?? '—';

export const hasAnyService = (flags: ServiceFlags) =>
  flags.isVirtualAvailable || flags.isHomeServiceAvailable || flags.isSiteVisitAvailable;

export const availableServices = (flags: ServiceFlags): ServiceType[] => {
  const services: ServiceType[] = [];
  if (flags.isVirtualAvailable) services.push('virtual');
  if (flags.isHomeServiceAvailable) services.push('home_service');
  if (flags.isSiteVisitAvailable) services.push('site_visit');
  return services;
};

// The service to send with a booking:
// - one option offered -> that option is the default, no choice needed
// - several offered    -> whatever the user picked, or null if they haven't yet
export const resolveServiceChoice = (flags: ServiceFlags, chosen: ServiceType | ''): ServiceType | null => {
  const available = availableServices(flags);
  if (available.length === 1) return available[0];
  return chosen && available.includes(chosen) ? chosen : null;
};

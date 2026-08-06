'use client';

import { useAuth } from '@/context/AuthContext';

export interface RoleAccent {
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  shadow: string;
  ring: string;
  ringFocus: string; // full focus:ring-2 focus:ring-{color}/15 combo for inputs
}

const ROLE_ACCENTS: Record<string, RoleAccent> = {
  doctor: {
    bg: 'bg-secondary',
    bgHover: 'hover:bg-secondary-hover',
    text: 'text-secondary',
    border: 'border-secondary',
    shadow: 'shadow-secondary/20',
    ring: 'focus:ring-secondary',
    ringFocus: 'focus:border-secondary focus:ring-2 focus:ring-secondary/15',
  },
  admin: {
    bg: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    text: 'text-red-500',
    border: 'border-red-500',
    shadow: 'shadow-red-500/20',
    ring: 'focus:ring-red-500',
    ringFocus: 'focus:border-red-500 focus:ring-2 focus:ring-red-500/15',
  },
  lab: {
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    text: 'text-amber-500',
    border: 'border-amber-500',
    shadow: 'shadow-amber-500/20',
    ring: 'focus:ring-amber-500',
    ringFocus: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15',
  },
  patient: {
    bg: 'bg-primary',
    bgHover: 'hover:bg-primary-hover',
    text: 'text-primary',
    border: 'border-primary',
    shadow: 'shadow-primary/20',
    ring: 'focus:ring-primary',
    ringFocus: 'focus:border-primary focus:ring-2 focus:ring-primary/15',
  },
};

export function useRoleAccent(): RoleAccent {
  const { role } = useAuth();
  return ROLE_ACCENTS[role ?? 'patient'] ?? ROLE_ACCENTS.patient;
}
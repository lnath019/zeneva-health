export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface DecodedToken {
  userId: string;
  role: UserRole;
  email?: string;
  iat: number;
  exp: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorSlotId: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  hospitalId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxTokens: number;
  bookedTokens: number;
  status: 'active' | 'cancelled';
}

export interface Hospital {
  id: string;
  name: string;
  municipalityId: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
}

export interface Specialisation {
  id: string;
  name: string;
  description?: string;
}

export interface Ambulance {
  id: string;
  name: string;
  phone: string;
  district: string;
  type: string;
  notes?: string;
  createdAt: string;
}

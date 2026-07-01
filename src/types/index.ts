export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isVerified: boolean;
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

export interface Doctor {
  id: string;
  userId: string;
  nmcNumber: string;
  specialisationId: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
    isActive: boolean;
  };
  specialisation?: Specialisation | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorSlotId: string;
  tokenNumber:number;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  doctorSlot?: Slot;
  slot?: Slot;
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
  doctor?: Doctor;
  hospital?: Hospital;
  isAvailable?: boolean;
}

export type MunicipalityType =
  | 'metropolitan_city'
  | 'sub_metropolitan_city'
  | 'municipality'
  | 'rural_municipality';

export interface Municipality {
  id: string;
  name: string;
  type: MunicipalityType;
  districtId: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
  municipalities?: Municipality[];
}

export interface Province {
  id: string;
  name: string;
  districts?: District[];
}

export interface Hospital {
  id: string;
  name: string;
  municipalityId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  createdAt?: string;
  updatedAt?: string;
  municipality?: {
    id: string;
    name: string;
    type: MunicipalityType;
    district: {
      id: string;
      name: string;
      province: { id: string; name: string };
    };
  } | null;
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

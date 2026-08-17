export type UserRole = 'patient' | 'doctor' | 'admin' | 'lab' | 'hospital_admin';

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

export interface UserProfile extends User {
  hasPassword: boolean;
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

export type DoctorHospitalStatus = 'pending' | 'approved' | 'rejected';
export type DoctorHospitalInitiator = 'hospital' | 'doctor';

export interface HospitalSlotSummary {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxTokens: number;
  status: 'active' | 'paused' | 'ended';
  isAvailable: boolean;
}

export interface HospitalDoctorSchedule {
  doctor: Doctor;
  slots: HospitalSlotSummary[];
}

export interface DoctorHospitalLink {
  id: string;
  doctorId: string;
  hospitalId: string;
  status: DoctorHospitalStatus;
  initiatedBy: DoctorHospitalInitiator;
  createdAt: string;
  doctor?: Doctor;
  hospital?: Hospital;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'needs_reschedule';
export interface Appointment {
  id: string;
  patientId: string;
  doctorSlotId: string;
  tokenNumber:number;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  doctorSlot?: Slot;
  slot?: Slot;
  sharedRecords?: MedicalHistoryRecord[];
}

export interface AppointmentTicket {
  id: string;
  tokenNumber: number;
  status: AppointmentStatus;
  bookedAt: string;
  patientName: string;
  doctorName: string;
  specialisation: string | null;
  hospitalName: string | null;
  hospitalAddress: string | null;
  slotDate: string | null;
  startTime: string | null;
  endTime: string | null;
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
  email: string | null;
  website: string | null;
  hospitalType: 'general' | 'multi_specialty' | 'clinic' | 'nursing_home' | 'diagnostic_center' | null;
  description: string | null;
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
  municipalityId: string | null;
  address: string | null;
  type: string;
  notes?: string;
  createdAt: string;
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

export interface Test {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface LabTest {
  id: string;
  labId: string;
  testId: string;
  test: Test;
}

export interface Lab {
  id: string;
  userId: string;
  name: string;
  municipalityId: string | null;
  address: string | null;
  phone: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
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
  labTests?: LabTest[];
}

export interface LabSlot {
  id: string;
  labId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxTokens: number;
  status: 'active' | 'paused' | 'ended';
  isAvailable: boolean;
  lab?: Lab;
}

export interface LabAppointment {
  id: string;
  patientId: string;
  labSlotId: string;
  testId: string;
  tokenNumber: number;
  tokenType: 'online' | 'walk_in';
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'needs_reschedule';
  bookedAt: string;
  updatedAt: string;
  test?: Test;
  slot?: LabSlot;
  patient?: { id: string; fullName: string; email: string; phone: string | null };
  sharedRecords?: MedicalHistoryRecord[];
}

export type RecordCategory =
  | 'condition'
  | 'allergy'
  | 'medication'
  | 'surgery'
  | 'immunization'
  | 'lab_result'
  | 'other';

export interface MedicalHistoryRecord {
  id: string;
  patientId: string;
  category: RecordCategory;
  title: string;
  description: string | null;
  recordDate: string | null;
  status: 'unverified' | 'verified';
  verifiedByUserId: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: { id: string; fullName: string; role: UserRole } | null;
}

import { Hospital, Ambulance, Slot, Appointment, Specialisation, User, Province } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenivahealthcare.com/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zeneva_token') : null;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

export const authApi = {
  requestOtp: async (email: string, purpose: string = 'login') => {
    return apiRequest('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  },
  
  verifyOtp: async (email: string, code: string, purpose: string = 'login') => {
    return apiRequest<{ accessToken: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  },
};

export const hospitalApi = {
  getAll: async (filters?: { provinceId?: string; districtId?: string; municipalityId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.provinceId) params.set('provinceId', filters.provinceId);
    if (filters?.districtId) params.set('districtId', filters.districtId);
    if (filters?.municipalityId) params.set('municipalityId', filters.municipalityId);
    const qs = params.toString();
    return apiRequest<Hospital[]>(`/hospitals${qs ? `?${qs}` : ''}`);
  },
  create: async (data: {
    name: string;
    provinceId: string;
    districtId: string;
    municipalityId: string;
    address?: string;
    phone?: string;
  }) => {
    return apiRequest<{ message: string; hospital: Hospital }>('/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const locationApi = {
  getTree: async () => {
    return apiRequest<Province[]>('/hospitals/locations');
  },
  search: async (name: string) => {
    return apiRequest<{
      municipalities: {
        municipalityId: string;
        municipalityName: string;
        districtId: string;
        districtName: string;
        provinceId: string;
        provinceName: string;
      }[];
    }>(`/hospitals/locations/search?name=${encodeURIComponent(name)}`);
  },
};

export const ambulanceApi = {
  getAll: async () => {
    return apiRequest<Ambulance[]>('/ambulances');
  },
};

export const slotApi = {
  getAll: async () => {
    return apiRequest<Slot[]>('/doctor/slots');
  },
  getMySlots: async () => {
    return apiRequest<Slot[]>('/doctor/slots/my');
  },
  create: async (slotData: {
    hospitalId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    maxTokens: number;
  }) => {
    return apiRequest<Slot>('/doctor/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  },
};

export const doctorApi = {
  getSpecialisations: async () => {
    return apiRequest<Specialisation[]>('/doctor/specialisations');
  },
};

export const appointmentApi = {
  book: async (doctorSlotId: string, reason: string) => {
    return apiRequest<Appointment>('/appointments/book', {
      method: 'POST',
      body: JSON.stringify({ doctorSlotId, reason }),
    });
  },
  getMyAppointments: async () => {
    return apiRequest<Appointment[]>('/appointments/my');
  },
  getBySlot: async (doctorSlotId: string) => {
    return apiRequest<Appointment[]>(`/appointments/slot/${doctorSlotId}`);
  },
  updateStatus: async (appointmentId: string, status: Appointment['status']) => {
    return apiRequest<Appointment>(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const adminApi = {
  getAllUsers: async () => {
    return apiRequest<User[]>('/admin/users');
  },
  grantDoctor: async (userId: string, nmcNumber: string, specialisationId: string) => {
    return apiRequest('/admin/grant-doctor', {
      method: 'POST',
      body: JSON.stringify({ userId, nmcNumber, specialisationId }),
    });
  },
  deactivateUser: async (userId: string) => {
    return apiRequest<User>(`/admin/users/${userId}/deactivate`, {
      method: 'PATCH',
    });
  },
  getAllAppointments: async () => {
    return apiRequest<Appointment[]>('/admin/appointments');
  },
};


import { Hospital, Ambulance } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://110.34.25.249/api';

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
  getAll: async () => {
    return apiRequest<Hospital[]>('/hospitals');
  },
  create: async (hospitalData: { name: string; address: string; phone: string }) => {
    return apiRequest<Hospital>('/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospitalData),
    });
  },
};

export const ambulanceApi = {
  getAll: async () => {
    return apiRequest<Ambulance[]>('/ambulances');
  },
};


import { Hospital, Ambulance, Slot, Appointment, AppointmentTicket, Specialisation, User, UserProfile, Province, Lab, LabSlot, LabAppointment, Test, MedicalHistoryRecord, RecordCategory, DoctorHospitalLink, HospitalDoctorSchedule } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenivahealthcare.com';

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
    return apiRequest<{ accessToken: string; requiresPasswordSetup?: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  setPassword: async (password: string) => {
    return apiRequest<{ message: string }>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  getMe: async () => {
    return apiRequest<UserProfile>('/auth/me');
  },

  updateProfile: async (fullName: string) => {
    return apiRequest<UserProfile>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName }),
    });
  },

  changePassword: async (currentPassword: string | undefined, newPassword: string) => {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
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
  getMy: async () => {
    return apiRequest<Hospital>('/hospitals/my');
  },
  update: async (id: string, data: Partial<{
    name: string;
    provinceId: string;
    districtId: string;
    municipalityId: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
  }>) => {
    return apiRequest<{ message: string; hospital: Hospital }>(`/hospitals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/hospitals/${id}`, {
      method: 'DELETE',
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
  getAll: async (filters?: { provinceId?: string; districtId?: string; municipalityId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.provinceId) params.set('provinceId', filters.provinceId);
    if (filters?.districtId) params.set('districtId', filters.districtId);
    if (filters?.municipalityId) params.set('municipalityId', filters.municipalityId);
    const qs = params.toString();
    return apiRequest<Ambulance[]>(`/ambulances${qs ? `?${qs}` : ''}`);
  },
  create: async (data: {
    name: string;
    phone: string;
    provinceId: string;
    districtId: string;
    municipalityId: string;
    address?: string;
    type: string;
    notes?: string;
  }) => {
    return apiRequest<{ message: string; ambulance: Ambulance }>('/ambulances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<{
    name: string;
    phone: string;
    provinceId: string;
    districtId: string;
    municipalityId: string;
    address: string;
    type: string;
    notes: string;
  }>) => {
    return apiRequest<{ message: string; ambulance: Ambulance }>(`/ambulances/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/ambulances/${id}`, {
      method: 'DELETE',
    });
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
    doctorId?: string; // required when a hospital admin or admin creates the slot
    hospitalId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    maxTokens: number;
  }) => {
    return apiRequest<{ message: string; slot: Slot }>('/doctor/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  },
  update: async (slotId: string, data: Partial<{ startTime: string; endTime: string; maxTokens: number }>) => {
    return apiRequest<{ message: string; slot: Slot }>(`/doctor/slots/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  pause: async (slotId: string) => {
    return apiRequest<{ message: string; slot: Slot }>(`/doctor/slots/${slotId}/pause`, {
      method: 'PATCH',
    });
  },
  resume: async (slotId: string) => {
    return apiRequest<{ message: string; slot: Slot }>(`/doctor/slots/${slotId}/resume`, {
      method: 'PATCH',
    });
  },
  end: async (slotId: string) => {
    return apiRequest<{ message: string; slot: Slot }>(`/doctor/slots/${slotId}/end`, {
      method: 'PATCH',
    });
  },
  getHospitalSchedule: async () => {
    return apiRequest<HospitalDoctorSchedule[]>('/doctor/slots/hospital/schedule');
  },
};
export const doctorApi = {
  getSpecialisations: async () => {
    return apiRequest<Specialisation[]>('/doctor/specialisations');
  },
};

export const appointmentApi = {
  book: async (doctorSlotId: string, reason: string, recordIds?: string[]) => {
    return apiRequest<Appointment>('/appointments/book', {
      method: 'POST',
      body: JSON.stringify({ doctorSlotId, reason, recordIds }),
    });
  },
  getMyAppointments: async () => {
    return apiRequest<Appointment[]>('/appointments/my');
  },
  getBySlot: async (doctorSlotId: string) => {
    return apiRequest<Appointment[]>(`/appointments/slot/${doctorSlotId}`);
  },
  getTicket: async (appointmentId: string) => {
    return apiRequest<AppointmentTicket>(`/appointments/${appointmentId}/ticket`);
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
  grantHospitalAdmin: async (userId: string, hospitalId: string) => {
    return apiRequest('/admin/grant-hospital-admin', {
      method: 'POST',
      body: JSON.stringify({ userId, hospitalId }),
    });
  },
  getAllHospitalAdmins: async () => {
    return apiRequest<{ id: string; userId: string; hospitalId: string; hospital: Hospital }[]>('/admin/hospital-admins');
  },
  deactivateUser: async (userId: string) => {
    return apiRequest<User>(`/admin/users/${userId}/deactivate`, {
      method: 'PATCH',
    });
  },

  reactivateUser: async (userId: string) => {
    return apiRequest<User>(`/admin/users/${userId}/reactivate`, {
      method: 'PATCH',
    });
  },

  getAllAppointments: async () => {
    return apiRequest<Appointment[]>('/admin/appointments');
  },
  getAllLabs: async () => {
    return apiRequest<Lab[]>('/admin/labs');
  },
  approveLab: async (labId: string) => {
    return apiRequest<{ message: string; lab: Lab }>(`/admin/labs/${labId}/approve`, {
      method: 'PATCH',
    });
  },
};

export const hospitalAdminApi = {
  // hospital admin adds a doctor by NMC number -> pending, doctor must approve
  addDoctor: async (nmcNumber: string) => {
    return apiRequest<{ message: string; link: DoctorHospitalLink }>('/hospital-admin/doctors', {
      method: 'POST',
      body: JSON.stringify({ nmcNumber }),
    });
  },
  // doctor requests to join a hospital -> pending, hospital admin must approve
  requestHospital: async (hospitalId: string) => {
    return apiRequest<{ message: string; link: DoctorHospitalLink }>('/hospital-admin/doctors/request', {
      method: 'POST',
      body: JSON.stringify({ hospitalId }),
    });
  },
  // approve or reject a pending link — used by whichever side didn't initiate it
  respond: async (linkId: string, action: 'approve' | 'reject') => {
    return apiRequest<{ message: string; link: DoctorHospitalLink }>(`/hospital-admin/doctors/${linkId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  },
  // hospital admin's view of their hospital's doctors (pending + approved)
  getMyHospitalDoctors: async () => {
    return apiRequest<DoctorHospitalLink[]>('/hospital-admin/doctors');
  },
  // doctor's view of their hospitals (pending + approved)
  getMyDoctorHospitals: async () => {
    return apiRequest<DoctorHospitalLink[]>('/hospital-admin/doctors/my');
  },
  removeLink: async (linkId: string) => {
    return apiRequest<{ message: string }>(`/hospital-admin/doctors/${linkId}`, {
      method: 'DELETE',
    });
  },
};

export const testApi = {
  getAll: async () => {
    return apiRequest<Test[]>('/labs/tests');
  },
  create: async (data: { name: string; description?: string }) => {
    return apiRequest<{ message: string; test: Test }>('/labs/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<{ name: string; description: string }>) => {
    return apiRequest<{ message: string; test: Test }>(`/labs/tests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/labs/tests/${id}`, {
      method: 'DELETE',
    });
  },
  request: async (testId: string, data: { fullName: string; phone: string; email?: string }) => {
    return apiRequest<{ message: string; request: { id: string; testId: string; status: string } }>(
      `/labs/tests/${testId}/request`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

export const labApi = {
  getAll: async () => {
    return apiRequest<Lab[]>('/labs');
  },
  register: async (data: {
    name: string;
    provinceId: string;
    districtId: string;
    municipalityId: string;
    address?: string;
    phone?: string;
  }) => {
    return apiRequest<{ message: string; lab: Lab }>('/labs/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getMy: async () => {
    return apiRequest<Lab>('/labs/my');
  },
  setMyTests: async (testIds: string[]) => {
    return apiRequest<{ message: string; lab: Lab }>('/labs/my/tests', {
      method: 'PATCH',
      body: JSON.stringify({ testIds }),
    });
  },
  getSlots: async (testId?: string) => {
    const qs = testId ? `?testId=${testId}` : '';
    return apiRequest<LabSlot[]>(`/labs/slots${qs}`);
  },
  getMySlots: async () => {
    return apiRequest<LabSlot[]>('/labs/slots/my');
  },
  createSlot: async (slotData: {
    slotDate: string;
    startTime: string;
    endTime: string;
    maxTokens: number;
  }) => {
    return apiRequest<{ message: string; slot: LabSlot }>('/labs/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
  },
  pauseSlot: async (slotId: string) => {
    return apiRequest<{ message: string; slot: LabSlot }>(`/labs/slots/${slotId}/pause`, {
      method: 'PATCH',
    });
  },
  resumeSlot: async (slotId: string) => {
    return apiRequest<{ message: string; slot: LabSlot }>(`/labs/slots/${slotId}/resume`, {
      method: 'PATCH',
    });
  },
  endSlot: async (slotId: string) => {
    return apiRequest<{ message: string; slot: LabSlot }>(`/labs/slots/${slotId}/end`, {
      method: 'PATCH',
    });
  },
};

export const labAppointmentApi = {
  book: async (labSlotId: string, testId: string, notes?: string, recordIds?: string[]) => {
    return apiRequest<{ message: string; appointment: LabAppointment }>('/labs/appointments/book', {
      method: 'POST',
      body: JSON.stringify({ labSlotId, testId, notes, recordIds }),
    });
  },
  getMyAppointments: async () => {
    return apiRequest<LabAppointment[]>('/labs/appointments/my');
  },
  getBySlot: async (labSlotId: string) => {
    return apiRequest<LabAppointment[]>(`/labs/appointments/slot/${labSlotId}`);
  },
  updateStatus: async (appointmentId: string, status: LabAppointment['status']) => {
    return apiRequest<{ message: string; appointment: LabAppointment }>(`/labs/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const medicalHistoryApi = {
  getMy: async () => {
    return apiRequest<MedicalHistoryRecord[]>('/medical-history/my');
  },
  create: async (data: { category: RecordCategory; title: string; description?: string; recordDate?: string }) => {
    return apiRequest<{ message: string; record: MedicalHistoryRecord }>('/medical-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<{ category: RecordCategory; title: string; description: string; recordDate: string }>) => {
    return apiRequest<{ message: string; record: MedicalHistoryRecord }>(`/medical-history/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/medical-history/${id}`, {
      method: 'DELETE',
    });
  },
  verify: async (id: string) => {
    return apiRequest<{ message: string; record: MedicalHistoryRecord }>(`/medical-history/${id}/verify`, {
      method: 'PATCH',
    });
  },
  unverify: async (id: string) => {
    return apiRequest<{ message: string; record: MedicalHistoryRecord }>(`/medical-history/${id}/unverify`, {
      method: 'PATCH',
    });
  },
};


export interface BackendCartItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export const cartApi = {
  getAll: async () => {
    return apiRequest<{ items: BackendCartItem[] }>('/cart');
  },
  add: async (productId: string, productName: string, unitPrice: number, quantity: number = 1) => {
    return apiRequest<{ message: string; item: BackendCartItem }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, productName, unitPrice, quantity }),
    });
  },
  updateQuantity: async (productId: string, quantity: number) => {
    return apiRequest<{ message: string; item: BackendCartItem }>(`/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },
  remove: async (productId: string) => {
    return apiRequest<{ message: string }>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },
  clear: async () => {
    return apiRequest<{ message: string }>('/cart', {
      method: 'DELETE',
    });
  },
  sync: async (items: { productId: string; productName: string; unitPrice: number; quantity: number }[]) => {
    return apiRequest<{ message: string; items: BackendCartItem[] }>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};

export interface BackendAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export const addressApi = {
  getAll: async () => {
    return apiRequest<{ addresses: BackendAddress[] }>('/addresses');
  },
  create: async (data: Omit<BackendAddress, 'id' | 'userId' | 'isDefault'> & { isDefault?: boolean }) => {
    return apiRequest<{ message: string; address: BackendAddress }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export interface BackendOrder {
  id: string;
  userId: string;
  addressId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  grandTotal: number;
  rewardPoints: number;
  items: { productId: string; productName: string; unitPrice: number; quantity: number }[];
  address: BackendAddress;
}

export const orderApi = {
  create: async (addressId: string, paymentMethod: 'cod' | 'esewa' | 'card') => {
    return apiRequest<{ message: string; order: BackendOrder }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ addressId, paymentMethod }),
    });
  },
  getAll: async () => {
    return apiRequest<{ orders: BackendOrder[] }>('/orders');
  },
  getById: async (id: string) => {
    return apiRequest<{ order: BackendOrder }>(`/orders/${id}`);
  },
};
export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  unit?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const productApi = {
  getAll: async () => {
    return apiRequest<{ products: BackendProduct[] }>('/products');
  },
  getBySlug: async (slug: string) => {
    return apiRequest<{ product: BackendProduct }>(`/products/${slug}`);
  },
  getAllAdmin: async () => {
    return apiRequest<{ products: BackendProduct[] }>('/products/admin');
  },
  create: async (data: {
    name: string;
    category: string;
    unit?: string;
    description?: string;
    imageUrl?: string;
    price: number;
    discountPercent?: number;
    isActive?: boolean;
  }) => {
    return apiRequest<{ message: string; product: BackendProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<{
    name: string;
    category: string;
    unit: string;
    description: string;
    imageUrl: string;
    price: number;
    discountPercent: number;
    isActive: boolean;
  }>) => {
    return apiRequest<{ message: string; product: BackendProduct }>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
export interface OpdScheduleEntry {
  id: string;
  hospitalId: string;
  doctorId: string;
  dayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  doctor?: {
    id: string;
    user?: { fullName: string };
    specialisation?: { name: string };
  };
}

export const opdScheduleApi = {
  getByHospital: async (hospitalId: string) => {
    return apiRequest<OpdScheduleEntry[]>(`/opd-schedule/hospital/${hospitalId}`);
  },
  getMy: async () => {
    return apiRequest<OpdScheduleEntry[]>('/opd-schedule/my');
  },
  create: async (data: { doctorId: string; dayOfWeek: string; startTime: string; endTime: string }) => {
    return apiRequest<{ message: string; entry: OpdScheduleEntry }>('/opd-schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: string) => {
    return apiRequest<{ message: string }>(`/opd-schedule/${id}`, {
      method: 'DELETE',
    });
  },
};
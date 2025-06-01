// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Patient types
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory?: string;
  insuranceInfo?: string;
  createdAt: string;
  lastVisit?: string;
}

// Appointment types
export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  dentistId: number;
  dentistName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  notes?: string;
  amount?: number;
  createdAt: string;
}

// Calendar types
export type CalendarViewType = 'month' | 'week' | 'day';

// Report types
export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface ReportFilter {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  period: string;
  createdAt: string;
  data: any;
}

export interface DashboardStats {
  todayAppointments: number;
  totalAppointments: number;
  totalPatients: number;
  upcomingAppointments: Appointment[];
  recentPatients: Patient[];
  appointmentsByType: Array<{ name: string; value: number }>;
  appointmentsByStatus: Array<{ name: string; value: number }>;
}

// Pharmacy types
export interface PharmacyCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface PharmacySale {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  items: PharmacySaleItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface PharmacySaleItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: number;
  prescriptionId?: number;
  patientId?: number;
  patientName?: string;
  appointmentId?: number;
  items: SaleItem[];
  totalAmount: number;
  createdAt: string;
}

export interface SaleItem {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
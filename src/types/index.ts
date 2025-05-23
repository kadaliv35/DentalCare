// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'receptionist';
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Patient types
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
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
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'check-up' | 'cleaning' | 'filling' | 'extraction' | 'root-canal' | 'consultation' | 'other';
  notes?: string;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  todayAppointments: number;
  totalAppointments: number;
  totalPatients: number;
  upcomingAppointments: Appointment[];
  recentPatients: Patient[];
  appointmentsByType: {
    name: string;
    value: number;
  }[];
  appointmentsByStatus: {
    name: string;
    value: number;
  }[];
}

// Report types
export interface Report {
  id: number;
  title: string;
  type: 'patient' | 'appointment' | 'financial' | 'performance';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  data: any;
}

// Calendar view types
export type CalendarViewType = 'day' | 'week' | 'month';

// Form field type
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'time' | 'textarea' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}
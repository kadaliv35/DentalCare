import { useState, useEffect } from 'react';
import api from '../services/api';

interface UseApiOptions<T> {
  initialData?: T;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await apiFunction();
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, error, isLoading, refetch: fetchData };
}

export function useUsers() {
  return useApi(() => api.users.getAll());
}

export function useDentists() {
  return useApi(() => api.users.getDentists());
}

export function useUser(id: number) {
  return useApi(() => api.users.getById(id));
}

export function usePatients() {
  return useApi(() => api.patients.getAll());
}

export function usePatient(id: number) {
  return useApi(() => api.patients.getById(id));
}

export function useAppointments() {
  return useApi(() => api.appointments.getAll());
}

export function useAppointmentsByDate(date: string) {
  return useApi(() => api.appointments.getByDate(date));
}

export function useAppointmentsByMonth(year: number, month: number) {
  return useApi(() => api.appointments.getByMonth(year, month));
}

export function useAppointmentsByWeek(date: string) {
  return useApi(() => api.appointments.getByWeek(date));
}

export function useAppointmentsByPatient(patientId: number) {
  return useApi(() => api.appointments.getByPatientId(patientId));
}

export function useMedicines() {
  return useApi(() => api.medicines.getAll());
}

export function useMedicine(id: number) {
  return useApi(() => api.medicines.getById(id));
}

export function usePrescriptions() {
  return useApi(() => api.prescriptions.getAll());
}

export function usePrescriptionsByPatient(patientId: number) {
  return useApi(() => api.prescriptions.getByPatientId(patientId));
}

export function usePrescription(id: number) {
  return useApi(() => api.prescriptions.getById(id));
}
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    // Add CORS headers to every request
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    config.headers['Access-Control-Allow-Credentials'] = 'true';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const users = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getDentists: async () => {
    const response = await api.get('/users/dentists');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export const patients = {
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  create: async (patient: any) => {
    const response = await api.post('/patients', patient);
    return response.data;
  },
  update: async (id: number, patient: any) => {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/patients/${id}`);
  },
};

export const appointments = {
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  getByDate: async (date: string) => {
    const response = await api.get(`/appointments/date/${date}`);
    return response.data;
  },
  getByMonth: async (year: number, month: number) => {
    const response = await api.get(`/appointments/month/${year}/${month}`);
    return response.data;
  },
  getByWeek: async (date: string) => {
    const response = await api.get(`/appointments/week/${date}`);
    return response.data;
  },
  getByPatientId: async (patientId: number) => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  create: async (appointment: any) => {
    const response = await api.post('/appointments', appointment);
    return response.data;
  },
  update: async (id: number, appointment: any) => {
    const response = await api.put(`/appointments/${id}`, appointment);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/appointments/${id}`);
  },
};

export const medicines = {
  getAll: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  },
  create: async (medicine: any) => {
    const response = await api.post('/medicines', medicine);
    return response.data;
  },
  update: async (id: number, medicine: any) => {
    const response = await api.put(`/medicines/${id}`, medicine);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/medicines/${id}`);
  },
};

export const prescriptions = {
  getAll: async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  },
  getByPatientId: async (patientId: number) => {
    const response = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },
  create: async (prescription: any) => {
    const response = await api.post('/prescriptions', prescription);
    return response.data;
  },
  update: async (id: number, prescription: any) => {
    const response = await api.put(`/prescriptions/${id}`, prescription);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/prescriptions/${id}`);
  },
};

export const pharmacySales = {
  getAll: async () => {
    const response = await api.get('/pharmacy-sales');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/pharmacy-sales/${id}`);
    return response.data;
  },
  create: async (sale: any) => {
    const response = await api.post('/pharmacy-sales', sale);
    return response.data;
  },
};

export const pharmacyCustomers = {
  getByPhone: async (phone: string) => {
    const response = await api.get(`/pharmacy-customers/phone/${phone}`);
    return response.data;
  },
  create: async (customer: any) => {
    const response = await api.post('/pharmacy-customers', customer);
    return response.data;
  },
};

export const reports = {
  getPatientStatistics: async (filter: any) => {
    const response = await api.get('/reports/patients', { params: filter });
    return response.data;
  },
  getAppointmentStatistics: async (filter: any) => {
    const response = await api.get('/reports/appointments', { params: filter });
    return response.data;
  },
  getFinancialStatistics: async (filter: any) => {
    const response = await api.get('/reports/financial', { params: filter });
    return response.data;
  },
  getPharmacyStatistics: async (filter: any) => {
    const response = await api.get('/reports/pharmacy', { params: filter });
    return response.data;
  },
};

const apiService = {
  auth,
  users,
  patients,
  appointments,
  medicines,
  prescriptions,
  pharmacySales,
  pharmacyCustomers,
  reports,
};

export default apiService;
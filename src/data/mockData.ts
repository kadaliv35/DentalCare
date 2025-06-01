// Only keep mockReports since it's needed for ReportsPage
import { Report } from '../types';

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Monthly Patient Statistics',
    type: 'patient',
    date: '2025-05-01',
    period: 'monthly',
    createdAt: '2025-05-01',
    data: {
      totalPatients: 150,
      newPatients: 12,
      returningPatients: 138,
      averageAge: 35,
      totalVisits: 180,
      cancellationRate: 0.05,
      chart: [
        { month: 'Jan', newPatients: 10, returningPatients: 120 },
        { month: 'Feb', newPatients: 15, returningPatients: 125 },
        { month: 'Mar', newPatients: 12, returningPatients: 130 },
        { month: 'Apr', newPatients: 18, returningPatients: 135 },
        { month: 'May', newPatients: 12, returningPatients: 138 }
      ]
    }
  },
  {
    id: '2',
    title: 'Appointment Summary',
    type: 'appointment',
    date: '2025-05-01',
    period: 'monthly',
    createdAt: '2025-05-01',
    data: {
      totalAppointments: 85,
      completedAppointments: 75,
      cancelledAppointments: 5,
      completionRate: 0.88,
      chart: [
        { day: 'Mon', appointments: 20, completed: 18 },
        { day: 'Tue', appointments: 18, completed: 16 },
        { day: 'Wed', appointments: 15, completed: 14 },
        { day: 'Thu', appointments: 17, completed: 15 },
        { day: 'Fri', appointments: 15, completed: 12 }
      ]
    }
  },
  {
    id: '3',
    title: 'Financial Overview',
    type: 'financial',
    date: '2025-05-01',
    period: 'monthly',
    createdAt: '2025-05-01',
    data: {
      totalRevenue: 25000,
      averagePerPatient: 166.67,
      chart: [
        { month: 'Jan', revenue: 20000 },
        { month: 'Feb', revenue: 22000 },
        { month: 'Mar', revenue: 21000 },
        { month: 'Apr', revenue: 23000 },
        { month: 'May', revenue: 25000 }
      ],
      topProcedures: [
        { name: 'Cleaning', revenue: 8000 },
        { name: 'Fillings', revenue: 6000 },
        { name: 'Root Canal', revenue: 5000 },
        { name: 'Crowns', revenue: 4000 },
        { name: 'Other', revenue: 2000 }
      ]
    }
  }
];
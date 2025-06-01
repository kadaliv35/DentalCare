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
      genderDistribution: {
        male: 80,
        female: 65,
        other: 5
      },
      monthlyTrends: [
        { date: '2025-01', newPatients: 10, returningPatients: 120 },
        { date: '2025-02', newPatients: 15, returningPatients: 125 },
        { date: '2025-03', newPatients: 12, returningPatients: 130 },
        { date: '2025-04', newPatients: 18, returningPatients: 135 },
        { date: '2025-05', newPatients: 12, returningPatients: 138 }
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
      noShowAppointments: 5,
      typeDistribution: {
        'check-up': 30,
        'cleaning': 25,
        'filling': 15,
        'root-canal': 10,
        'extraction': 5
      },
      monthlyTrends: [
        { date: '2025-01', total: 80, completed: 70 },
        { date: '2025-02', total: 85, completed: 75 },
        { date: '2025-03', total: 82, completed: 72 },
        { date: '2025-04', total: 88, completed: 78 },
        { date: '2025-05', total: 85, completed: 75 }
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
      appointmentRevenue: 20000,
      pharmacyRevenue: 5000,
      averageAppointmentValue: 166.67,
      monthlyTrends: [
        { date: '2025-01', totalRevenue: 20000, appointmentRevenue: 16000, pharmacyRevenue: 4000 },
        { date: '2025-02', totalRevenue: 22000, appointmentRevenue: 17000, pharmacyRevenue: 5000 },
        { date: '2025-03', totalRevenue: 21000, appointmentRevenue: 16500, pharmacyRevenue: 4500 },
        { date: '2025-04', totalRevenue: 23000, appointmentRevenue: 18000, pharmacyRevenue: 5000 },
        { date: '2025-05', totalRevenue: 25000, appointmentRevenue: 20000, pharmacyRevenue: 5000 }
      ],
      topProcedures: [
        { type: 'Cleaning', revenue: 8000 },
        { type: 'Fillings', revenue: 6000 },
        { type: 'Root Canal', revenue: 5000 },
        { type: 'Crowns', revenue: 4000 },
        { type: 'Other', revenue: 2000 }
      ]
    }
  }
];
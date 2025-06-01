```typescript
// Existing types...

// Report filter types
export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface ReportFilter {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
}

export interface PatientStatistics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  monthlyTrends: Array<{
    date: string;
    newPatients: number;
    returningPatients: number;
  }>;
}

export interface AppointmentStatistics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  typeDistribution: {
    [key: string]: number;
  };
  monthlyTrends: Array<{
    date: string;
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }>;
}

export interface FinancialStatistics {
  totalRevenue: number;
  appointmentRevenue: number;
  pharmacyRevenue: number;
  averageAppointmentValue: number;
  averagePharmacySale: number;
  monthlyTrends: Array<{
    date: string;
    totalRevenue: number;
    appointmentRevenue: number;
    pharmacyRevenue: number;
  }>;
  topProcedures: Array<{
    type: string;
    revenue: number;
    count: number;
  }>;
}

export interface PharmacyStatistics {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  topSellingMedicines: Array<{
    medicineId: number;
    medicineName: string;
    quantity: number;
    revenue: number;
  }>;
  monthlyTrends: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  stockAlerts: Array<{
    medicineId: number;
    medicineName: string;
    currentStock: number;
    reorderPoint: number;
  }>;
}
```
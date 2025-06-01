import { useState, useEffect } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ReportFilter, ReportPeriod } from '../types';
import api from '../services/api';

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<ReportFilter>({
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [patientStats, setPatientStats] = useState<any>(null);
  const [appointmentStats, setAppointmentStats] = useState<any>(null);
  const [financialStats, setFinancialStats] = useState<any>(null);
  const [pharmacyStats, setPharmacyStats] = useState<any>(null);

  const COLORS = ['#0891b2', '#0d9488', '#ffc107', '#f44336', '#9e9e9e'];

  // Fetch data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [patients, appointments, financial, pharmacy] = await Promise.all([
        api.reports.getPatientStatistics(filter),
        api.reports.getAppointmentStatistics(filter),
        api.reports.getFinancialStatistics(filter),
        api.reports.getPharmacyStatistics(filter)
      ]);

      setPatientStats(patients);
      setAppointmentStats(appointments);
      setFinancialStats(financial);
      setPharmacyStats(pharmacy);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: ReportPeriod) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    const newFilter = {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
    
    setFilter(newFilter);
    // Fetch new data with updated filter
    handleRefresh();
  };

  if (isLoading && !patientStats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <div className="flex space-x-3">
          <div className="rounded-md border border-neutral-200 bg-white p-1">
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-3 py-1 text-sm font-medium ${
                filter.period === 'monthly'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handlePeriodChange('quarterly')}
              className={`px-3 py-1 text-sm font-medium ${
                filter.period === 'quarterly'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => handlePeriodChange('yearly')}
              className={`px-3 py-1 text-sm font-medium ${
                filter.period === 'yearly'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Yearly
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="btn-outline flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn-primary flex items-center">
            <Download className="mr-1 h-4 w-4" />
            Export Reports
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Patient Statistics */}
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Patient Statistics</h2>
          {patientStats && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Total Patients</h3>
                  <p className="mt-2 text-3xl font-bold text-primary-600">{patientStats.totalPatients}</p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">New Patients</h3>
                  <p className="mt-2 text-3xl font-bold text-secondary-600">{patientStats.newPatients}</p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Returning Patients</h3>
                  <p className="mt-2 text-3xl font-bold text-accent-600">{patientStats.returningPatients}</p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Average Age</h3>
                  <p className="mt-2 text-3xl font-bold text-neutral-900">
                    {Math.round(patientStats.averageAge)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Gender Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(patientStats.genderDistribution).map(([key, value]) => ({
                            name: key.charAt(0).toUpperCase() + key.slice(1),
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(patientStats.genderDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Patient Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patientStats.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="newPatients"
                          name="New Patients"
                          stroke="#0891b2"
                        />
                        <Line
                          type="monotone"
                          dataKey="returningPatients"
                          name="Returning Patients"
                          stroke="#0d9488"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Appointment Statistics */}
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Appointment Summary</h2>
          {appointmentStats && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Total Appointments</h3>
                  <p className="mt-2 text-3xl font-bold text-primary-600">
                    {appointmentStats.totalAppointments}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Completed</h3>
                  <p className="mt-2 text-3xl font-bold text-success-600">
                    {appointmentStats.completedAppointments}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Cancelled</h3>
                  <p className="mt-2 text-3xl font-bold text-error-600">
                    {appointmentStats.cancelledAppointments}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">No Show</h3>
                  <p className="mt-2 text-3xl font-bold text-warning-600">
                    {appointmentStats.noShowAppointments}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Appointment Types</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(appointmentStats.typeDistribution).map(([key, value]) => ({
                            name: key.replace('-', ' '),
                            value
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(appointmentStats.typeDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Monthly Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={appointmentStats.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total"
                          stroke="#0891b2"
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          name="Completed"
                          stroke="#0d9488"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Financial Overview */}
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Financial Overview</h2>
          {financialStats && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Total Revenue</h3>
                  <p className="mt-2 text-3xl font-bold text-primary-600">
                    ₹{financialStats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Appointment Revenue</h3>
                  <p className="mt-2 text-3xl font-bold text-secondary-600">
                    ₹{financialStats.appointmentRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Pharmacy Revenue</h3>
                  <p className="mt-2 text-3xl font-bold text-accent-600">
                    ₹{financialStats.pharmacyRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Avg. Appointment Value</h3>
                  <p className="mt-2 text-3xl font-bold text-neutral-900">
                    ₹{financialStats.averageAppointmentValue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Revenue Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={financialStats.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalRevenue"
                          name="Total Revenue"
                          stroke="#0891b2"
                        />
                        <Line
                          type="monotone"
                          dataKey="appointmentRevenue"
                          name="Appointment Revenue"
                          stroke="#0d9488"
                        />
                        <Line
                          type="monotone"
                          dataKey="pharmacyRevenue"
                          name="Pharmacy Revenue"
                          stroke="#ffc107"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Top Procedures</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialStats.topProcedures}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="#0891b2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pharmacy Report */}
        <div className="card">
          <h2 className="mb-6 text-xl font-bold text-neutral-900">Pharmacy Report</h2>
          {pharmacyStats && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Total Sales</h3>
                  <p className="mt-2 text-3xl font-bold text-primary-600">
                    {pharmacyStats.totalSales}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Total Revenue</h3>
                  <p className="mt-2 text-3xl font-bold text-secondary-600">
                    ₹{pharmacyStats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="stats-card">
                  <h3 className="text-lg font-semibold text-neutral-900">Average Sale Value</h3>
                  <p className="mt-2 text-3xl font-bold text-accent-600">
                    ₹{pharmacyStats.averageSaleValue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Top Selling Medicines</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pharmacyStats.topSellingMedicines.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="medicineName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" name="Quantity Sold" fill="#0891b2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Sales Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pharmacyStats.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          name="Number of Sales"
                          stroke="#0891b2"
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#0d9488"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {pharmacyStats.stockAlerts.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-900">Stock Alerts</h3>
                  <div className="overflow-hidden rounded-lg border border-neutral-200">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Medicine
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Reorder Point
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {pharmacyStats.stockAlerts.map((alert: any) => (
                          <tr key={alert.medicineId}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                              {alert.medicineName}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-error-600">
                              {alert.currentStock}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                              {alert.reorderPoint}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
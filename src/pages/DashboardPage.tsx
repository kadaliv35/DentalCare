import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppointments, usePatients } from '../hooks/useApi';
import { DashboardStats } from '../types';
import api from '../services/api';

const DashboardPage = () => {
  const { data: appointments = [], isLoading: isLoadingAppointments } = useAppointments();
  const { data: patients = [], isLoading: isLoadingPatients } = usePatients();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const COLORS = ['#0891b2', '#0d9488', '#ffc107', '#f44336', '#9e9e9e'];

  useEffect(() => {
    if (!isLoadingAppointments && !isLoadingPatients) {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate stats from API data
      const todayAppointments = appointments.filter(a => a.date === today).length;
      const upcomingAppointments = appointments
        .filter(a => a.date >= today && (a.status === 'scheduled' || a.status === 'confirmed'))
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5);

      const recentPatients = [...patients]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Calculate appointment type stats
      const appointmentTypes = appointments.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});

      const appointmentsByType = Object.entries(appointmentTypes).map(([name, value]) => ({
        name: name.replace('-', ' '),
        value,
      }));

      // Calculate appointment status stats
      const appointmentStatuses = appointments.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const appointmentsByStatus = Object.entries(appointmentStatuses).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      setStats({
        todayAppointments,
        totalAppointments: appointments.length,
        totalPatients: patients.length,
        upcomingAppointments,
        recentPatients,
        appointmentsByType,
        appointmentsByStatus,
      });
    }
  }, [appointments, patients, isLoadingAppointments, isLoadingPatients]);

  if (isLoadingAppointments || isLoadingPatients) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-error-500">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <div className="text-sm text-neutral-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="stats-card border-l-4 border-primary-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Today's Appointments</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900">{stats.todayAppointments}</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3 text-primary-500">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/appointments" className="text-xs font-medium text-primary-500 hover:text-primary-600">
              View all appointments
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="stats-card border-l-4 border-secondary-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Appointments</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900">{stats.totalAppointments}</p>
            </div>
            <div className="rounded-full bg-secondary-100 p-3 text-secondary-500">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/calendar" className="text-xs font-medium text-secondary-500 hover:text-secondary-600">
              View calendar
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="stats-card border-l-4 border-accent-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Patients</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900">{stats.totalPatients}</p>
            </div>
            <div className="rounded-full bg-accent-100 p-3 text-accent-500">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/patients" className="text-xs font-medium text-accent-500 hover:text-accent-600">
              View all patients
              <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-xs font-medium text-primary-500 hover:text-primary-600">
              View All
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Patient
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Date & Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {stats.upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-neutral-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900">{appointment.patientName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
                      {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-800">
                        {appointment.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          appointment.status === 'confirmed'
                            ? 'bg-success-100 text-success-800'
                            : appointment.status === 'scheduled'
                            ? 'bg-accent-100 text-accent-800'
                            : appointment.status === 'completed'
                            ? 'bg-secondary-100 text-secondary-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Patients</h2>
            <Link to="/patients" className="text-xs font-medium text-primary-500 hover:text-primary-600">
              View All
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Contact
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {stats.recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-neutral-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
                      {patient.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
                      {patient.lastVisit
                        ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appointments by Type */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Appointments by Type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.appointmentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.appointmentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Status */}
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Appointments by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.appointmentsByStatus}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
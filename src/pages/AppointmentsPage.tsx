import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, User } from 'lucide-react';
import { Appointment } from '../types';
import AppointmentForm from '../components/appointments/AppointmentForm';
import Pagination from '../components/common/Pagination';
import { useAppointments } from '../hooks/useApi';
import api from '../services/api';

const ITEMS_PER_PAGE = 10;

const AppointmentsPage = () => {
  const { data: appointments = [], isLoading, error, refetch } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Filter appointments based on search term and status filter
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort appointments by date and time (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = sortedAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddAppointment = async (appointment: Appointment) => {
    try {
      await api.appointments.create(appointment);
      refetch();
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleEditAppointment = async (appointment: Appointment) => {
    try {
      await api.appointments.update(appointment.id, appointment);
      refetch();
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const canEditAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-error-500">Error loading appointments: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
          <p className="text-sm text-neutral-500">
            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedAppointments.length)} of {sortedAppointments.length} appointments
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/calendar" className="btn-outline flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            Calendar View
          </Link>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="mr-1 h-4 w-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="input w-full"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments list */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Dentist
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-neutral-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-neutral-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-neutral-900">
                          {appointment.patientName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {appointment.dentistName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-800">
                      {appointment.type.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        appointment.status === 'confirmed'
                          ? 'bg-success-100 text-success-800'
                          : appointment.status === 'scheduled'
                          ? 'bg-accent-100 text-accent-800'
                          : appointment.status === 'completed'
                          ? 'bg-secondary-100 text-secondary-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-error-100 text-error-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex space-x-3">
                      <Link
                        to={`/patients/${appointment.patientId}`}
                        className="text-primary-500 hover:text-primary-700"
                      >
                        View Patient
                      </Link>
                      {canEditAppointment(appointment) && (
                        <button
                          onClick={() => {
                            setEditingAppointment(appointment);
                            setShowForm(true);
                          }}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredAppointments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h2>
            <AppointmentForm
              appointment={editingAppointment || undefined}
              onSubmit={editingAppointment ? handleEditAppointment : handleAddAppointment}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, Edit, Mail, Phone, User } from 'lucide-react';
import { mockPatients, mockAppointments } from '../data/mockData';
import { Patient, Appointment } from '../types';
import PatientForm from '../components/patients/PatientForm';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      // Find patient by ID (in a real app, this would be an API call)
      const foundPatient = mockPatients.find((p) => p.id === parseInt(id));
      if (foundPatient) {
        setPatient(foundPatient);
      }

      // Find appointments for this patient
      const patientAppointments = mockAppointments.filter(
        (a) => a.patientId === parseInt(id)
      );
      setAppointments(patientAppointments);
    }
  }, [id]);

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatient({ ...patient, ...updatedPatient } as Patient);
    setIsEditing(false);
  };

  if (!patient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="mb-6 flex items-center">
        <Link to="/patients" className="mr-3 flex items-center text-sm text-neutral-500 hover:text-neutral-700">
          <ChevronLeft className="h-4 w-4" />
          Back to Patients
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          {patient.firstName} {patient.lastName}
        </h1>
      </div>

      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="flex flex-wrap items-center text-sm text-neutral-500">
              <div className="mr-4 flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                {patient.email}
              </div>
              <div className="flex items-center">
                <Phone className="mr-1 h-4 w-4" />
                {patient.phone}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="btn-outline flex items-center"
        >
          <Edit className="mr-1 h-4 w-4" />
          Edit Patient
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-neutral-500 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'appointments'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-neutral-500 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('medicalHistory')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'medicalHistory'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-neutral-500 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Medical History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {activeTab === 'overview' && (
          <>
            <div className="card lg:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Patient Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Full Name</p>
                  <p className="text-neutral-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Date of Birth</p>
                  <p className="text-neutral-900">
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Gender</p>
                  <p className="text-neutral-900">
                    {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Email</p>
                  <p className="text-neutral-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Phone</p>
                  <p className="text-neutral-900">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Address</p>
                  <p className="text-neutral-900">{patient.address}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-neutral-500">Insurance Information</p>
                  <p className="text-neutral-900">{patient.insuranceInfo || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 text-lg font-semibold text-neutral-900">Upcoming Appointments</h3>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments
                    .filter((a) => new Date(`${a.date}T${a.startTime}`) >= new Date())
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-start rounded-md border border-neutral-200 p-3"
                      >
                        <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {appointment.type.replace('-', ' ')}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                              }
                            )}
                          </p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              appointment.status === 'confirmed'
                                ? 'bg-success-100 text-success-800'
                                : appointment.status === 'scheduled'
                                ? 'bg-accent-100 text-accent-800'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600"
                    >
                      View All Appointments
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500">No upcoming appointments</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div className="card lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Appointment History</h3>
              <Link to="/appointments" className="text-sm font-medium text-primary-500 hover:text-primary-600">
                Book New Appointment
              </Link>
            </div>
            
            {appointments.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
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
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                          {new Date(`${appointment.date}T${appointment.startTime}`).toLocaleString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                            }
                          )}
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
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {appointment.notes || 'No notes'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-500">No appointment history</p>
            )}
          </div>
        )}

        {activeTab === 'medicalHistory' && (
          <div className="card lg:col-span-3">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900">Medical History</h3>
            <div className="rounded-lg border border-neutral-200 p-4">
              <p className="text-neutral-700">
                {patient.medicalHistory || 'No medical history recorded'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Patient Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Edit Patient</h2>
            <PatientForm
              patient={patient}
              onSubmit={handleUpdatePatient}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, Edit, Mail, Phone, User, Pill, IndianRupee } from 'lucide-react';
import { Patient, Appointment, Prescription } from '../types';
import PatientForm from '../components/patients/PatientForm';
import PrescriptionForm from '../components/pharmacy/PrescriptionForm';
import { usePatient, useAppointmentsByPatient, usePrescriptionsByPatient } from '../hooks/useApi';
import api from '../services/api';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: patient, isLoading: isLoadingPatient, error: patientError, refetch: refetchPatient } = usePatient(parseInt(id!));
  const { data: appointments = [], isLoading: isLoadingAppointments, refetch: refetchAppointments } = useAppointmentsByPatient(parseInt(id!));
  const { data: prescriptions = [], isLoading: isLoadingPrescriptions, refetch: refetchPrescriptions } = usePrescriptionsByPatient(parseInt(id!));

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      await api.patients.update(parseInt(id!), updatedPatient);
      refetchPatient();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };

  const handleAddPrescription = async (prescription: Prescription) => {
    try {
      await api.prescriptions.create(prescription);
      await refetchPrescriptions();
      setShowPrescriptionForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to create prescription:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedAppointment || !paymentAmount || isProcessing) return;

    try {
      setIsProcessing(true);
      await api.appointments.update(selectedAppointment.id, {
        ...selectedAppointment,
        amount: parseFloat(paymentAmount)
      });
      await refetchAppointments();
      setShowPaymentModal(false);
      setSelectedAppointment(null);
      setPaymentAmount('');
    } catch (error) {
      console.error('Failed to update payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPaymentAmount(appointment.amount?.toString() || '');
    setShowPaymentModal(true);
  };

  const canAddPrescription = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  if (isLoadingPatient || isLoadingAppointments || isLoadingPrescriptions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-neutral-500">Loading patient data...</p>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-error-500">Error loading patient: {patientError?.message || 'Patient not found'}</p>
      </div>
    );
  }

  const prescriptionsByAppointment = prescriptions.reduce((acc, prescription) => {
    if (!acc[prescription.appointmentId]) {
      acc[prescription.appointmentId] = [];
    }
    acc[prescription.appointmentId].push(prescription);
    return acc;
  }, {} as Record<number, Prescription[]>);

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
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPrescriptionForm(true)}
            className="btn-primary flex items-center"
          >
            <Pill className="mr-1 h-4 w-4" />
            Add Prescription
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-outline flex items-center"
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit Patient
          </button>
        </div>
      </div>

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
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'prescriptions'
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-neutral-500 hover:border-b-2 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            Prescriptions
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

            <div className="space-y-6">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">Recent Prescriptions</h3>
                {prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.slice(0, 3).map((prescription) => (
                      <div
                        key={prescription.id}
                        className="flex items-start rounded-md border border-neutral-200 p-3"
                      >
                        <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                          <Pill className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {prescription.items.length} medications prescribed
                          </p>
                          <p className="text-sm text-neutral-500">
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-neutral-500">
                            By: {prescription.dentistName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No recent prescriptions</p>
                )}
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
                  </div>
                ) : (
                  <p className="text-neutral-500">No upcoming appointments</p>
                )}
              </div>
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
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Actions
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
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                          {appointment.amount ? (
                            <button
                              onClick={() => handleEditPayment(appointment)}
                              className="text-primary-500 hover:text-primary-700 flex items-center"
                            >
                              <IndianRupee className="h-4 w-4 mr-1" />
                              {appointment.amount.toFixed(2)}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowPaymentModal(true);
                              }}
                              className="text-primary-500 hover:text-primary-700 flex items-center"
                            >
                              <IndianRupee className="h-4 w-4 mr-1" />
                              Add Payment
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {appointment.notes || 'No notes'}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {canAddPrescription(appointment) && (
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowPrescriptionForm(true);
                              }}
                              className="text-primary-500 hover:text-primary-700"
                            >
                              Add Prescription
                            </button>
                          )}
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

        {activeTab === 'prescriptions' && (
          <div className="card lg:col-span-3">
            <h3 className="mb-6 text-lg font-semibold text-neutral-900">Prescription History</h3>
            
            {appointments.length > 0 ? (
              <div className="space-y-6">
                {appointments.map((appointment) => {
                  const appointmentPrescriptions = prescriptionsByAppointment[appointment.id] || [];
                  if (appointmentPrescriptions.length === 0) return null;

                  return (
                    <div key={appointment.id} className="rounded-lg border border-neutral-200 p-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-neutral-900">
                          Appointment on {new Date(appointment.date).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {appointment.type.replace('-', ' ')} with {appointment.dentistName}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {appointmentPrescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="rounded-lg bg-neutral-50 p-4"
                          >
                            <div className="mb-3">
                              <p className="text-sm text-neutral-500">
                                Prescribed on {new Date(prescription.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="space-y-3">
                              {prescription.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="rounded-md bg-white p-3 shadow-sm"
                                >
                                  <p className="font-medium text-neutral-900">
                                    {item.medicineName} ({item.medicineType})
                                  </p>
                                  <p className="text-sm text-neutral-600">
                                    Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.duration}
                                  </p>
                                  {item.instructions && (
                                    <p className="mt-1 text-sm text-neutral-500">
                                      Instructions: {item.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>

                            {prescription.notes && (
                              <div className="mt-3 text-sm text-neutral-500">
                                <p className="font-medium">Notes:</p>
                                <p>{prescription.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-500">No prescription history</p>
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

      {showPrescriptionForm && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Add New Prescription</h2>
            <PrescriptionForm
              onSubmit={handleAddPrescription}
              onCancel={() => {
                setShowPrescriptionForm(false);
                setSelectedAppointment(null);
              }}
              appointment={selectedAppointment}
            />
          </div>
        </div>
      )}

      {showPaymentModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              {selectedAppointment.amount ? 'Edit Payment' : 'Add Payment'}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-neutral-500">
                Appointment on {new Date(selectedAppointment.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-neutral-500">
                Type: {selectedAppointment.type.replace('-', ' ')}
              </p>
            </div>
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700">
                Amount (₹)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input pl-10 block w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedAppointment(null);
                  setPaymentAmount('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentAmount || isProcessing}
                className="btn-primary"
              >
                {isProcessing ? 'Processing...' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;
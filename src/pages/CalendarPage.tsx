import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { generateCalendarData, generateWeekSchedule, generateDaySchedule } from '../data/mockData';
import { Appointment, CalendarViewType } from '../types';
import { mockPatients } from '../data/mockData';
import AppointmentForm from '../components/appointments/AppointmentForm';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const handleAddAppointment = (appointment: Appointment) => {
    // In a real app, this would be an API call
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
      createdAt: new Date().toISOString(),
    };
    
    setAppointments([newAppointment, ...appointments]);
    setShowForm(false);
  };

  const handlePrevious = () => {
    if (viewType === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Calendar header with day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Generate month data
    const calendarData = generateCalendarData(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    );
    
    // Map calendar days to appointments
    const calendarMap = new Map();
    calendarData.forEach((day) => {
      calendarMap.set(day.date, day.appointments);
    });
    
    // Create calendar rows
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(cloneDay, 'yyyy-MM-dd');
        const dayAppointments = calendarMap.get(formattedDate) || [];
        
        days.push(
          <div
            key={day.toString()}
            className={`calendar-day ${
              !isSameMonth(day, monthStart) ? 'bg-neutral-50 text-neutral-400' : ''
            } ${isSameDay(day, new Date()) ? 'bg-primary-50 border-primary-200' : ''}`}
          >
            <div className="font-medium text-right">{format(day, 'd')}</div>
            <div className="mt-1 space-y-1">
              {dayAppointments.slice(0, 3).map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className={`calendar-appointment text-xs truncate ${
                    appointment.type === 'check-up'
                      ? 'bg-primary-500'
                      : appointment.type === 'cleaning'
                      ? 'bg-secondary-500'
                      : appointment.type === 'filling'
                      ? 'bg-accent-500'
                      : appointment.type === 'root-canal'
                      ? 'bg-error-500'
                      : 'bg-neutral-500'
                  }`}
                  title={`${appointment.patientName} - ${appointment.type}`}
                >
                  {appointment.startTime} {appointment.patientName}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-primary-500 font-medium">
                  +{dayAppointments.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return (
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-7">
          {dayNames.map((dayName) => (
            <div key={dayName} className="calendar-day-header">
              {dayName}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const weekSchedule = generateWeekSchedule(format(startDate, 'yyyy-MM-dd'));
    
    return (
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-neutral-200">
          <div className="p-2 text-sm font-medium text-neutral-500 border-r border-neutral-200">
            Time
          </div>
          {weekSchedule.map((day) => (
            <div
              key={day.date}
              className={`p-2 text-center ${
                isSameDay(new Date(day.date), new Date()) ? 'bg-primary-50' : ''
              }`}
            >
              <div className="text-sm font-medium">{day.dayName}</div>
              <div className="text-lg font-bold">{day.dayNumber}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-8">
          {/* Time slots */}
          <div className="border-r border-neutral-200">
            {weekSchedule[0].schedule.map((timeSlot) => (
              <div key={timeSlot.time} className="h-16 p-2 text-xs text-neutral-500 border-b border-neutral-200">
                {timeSlot.time}
              </div>
            ))}
          </div>
          
          {/* Appointment slots for each day */}
          {weekSchedule.map((day) => (
            <div key={day.date} className="min-w-[120px]">
              {day.schedule.map((timeSlot) => (
                <div
                  key={`${day.date}-${timeSlot.time}`}
                  className={`h-16 p-1 border-b border-r border-neutral-200 ${
                    isSameDay(new Date(day.date), new Date()) ? 'bg-primary-50' : ''
                  }`}
                >
                  {timeSlot.appointment && (
                    <div
                      className={`h-full rounded p-1 overflow-hidden text-white text-xs ${
                        timeSlot.appointment.type === 'check-up'
                          ? 'bg-primary-500'
                          : timeSlot.appointment.type === 'cleaning'
                          ? 'bg-secondary-500'
                          : timeSlot.appointment.type === 'filling'
                          ? 'bg-accent-500'
                          : timeSlot.appointment.type === 'root-canal'
                          ? 'bg-error-500'
                          : 'bg-neutral-500'
                      }`}
                    >
                      <div className="font-medium">{timeSlot.appointment.patientName}</div>
                      <div>{timeSlot.appointment.type.replace('-', ' ')}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    const daySchedule = generateDaySchedule(formattedDate);
    
    return (
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-primary-50">
          <h3 className="text-lg font-bold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {daySchedule.map((timeSlot) => (
            <div
              key={timeSlot.time}
              className="flex p-3 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-20 flex-shrink-0 font-medium text-neutral-500">
                {timeSlot.time}
              </div>
              {timeSlot.appointment ? (
                <div
                  className={`flex-1 ml-4 p-3 rounded ${
                    timeSlot.appointment.type === 'check-up'
                      ? 'bg-primary-100 text-primary-800'
                      : timeSlot.appointment.type === 'cleaning'
                      ? 'bg-secondary-100 text-secondary-800'
                      : timeSlot.appointment.type === 'filling'
                      ? 'bg-accent-100 text-accent-800'
                      : timeSlot.appointment.type === 'root-canal'
                      ? 'bg-error-100 text-error-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="font-medium">{timeSlot.appointment.patientName}</div>
                  <div className="text-sm">
                    {timeSlot.appointment.type.replace('-', ' ')} with{' '}
                    {timeSlot.appointment.dentistName}
                  </div>
                  {timeSlot.appointment.notes && (
                    <div className="text-sm mt-1">{timeSlot.appointment.notes}</div>
                  )}
                </div>
              ) : (
                <div className="flex-1 ml-4 p-3 border border-dashed border-neutral-200 rounded text-neutral-400 text-center">
                  Available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="slide-in">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          New Appointment
        </button>
      </div>

      {/* Calendar controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            className="btn-outline p-2"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="btn-outline px-3 py-2 text-sm"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="btn-outline p-2"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-neutral-900">
            {viewType === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : viewType === 'week'
              ? `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(
                  endOfWeek(currentDate),
                  'MMM d, yyyy'
                )}`
              : format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="rounded-md border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1 text-sm font-medium ${
                viewType === 'day'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 text-sm font-medium ${
                viewType === 'week'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 text-sm font-medium ${
                viewType === 'month'
                  ? 'bg-primary-100 text-primary-700 rounded'
                  : 'text-neutral-600 hover:bg-neutral-100 rounded'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar view */}
      <div className="overflow-x-auto pb-6">
        {viewType === 'month' && renderMonthView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Schedule New Appointment</h2>
            <AppointmentForm
              patients={mockPatients}
              onSubmit={handleAddAppointment}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
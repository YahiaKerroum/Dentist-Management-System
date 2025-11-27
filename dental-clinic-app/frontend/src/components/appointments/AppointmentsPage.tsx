import { useState } from 'react';
import { FilterBar } from '../appointments/FilterBar';
import WeeklyCalendar, { AppointmentItem } from '../appointments/WeeklyCalendar';
import AppointmentDetailsPanel from '../appointments/AppointmentDetailsPanel';

interface AppointmentsPageProps {
    token?: string;
}

export function AppointmentsPage({ token }: AppointmentsPageProps) {
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
        const [showHolidays, setShowHolidays] = useState(false);
        const [showReminders, setShowReminders] = useState(false);
        const selectedDate = new Date();

        // token is available if MainLayout passes it; keep reference to avoid unused prop lint.
        if (token) {
            /* token available for future authenticated appointment API calls */
        }

    // Mock appointments (kept local until backend endpoints are wired)
    const appointments: AppointmentItem[] = [
      { id: '1', patientName: 'Sarah Johnson', type: 'Cleaning', date: '2025-10-27', time: '09:00', duration: 60, status: 'confirmed' },
      { id: '2', patientName: 'Michael Chen', type: 'Root Canal', date: '2025-10-27', time: '14:00', duration: 120, status: 'confirmed' },
      { id: '3', patientName: 'Emma Davis', type: 'Consultation', date: '2025-10-28', time: '10:00', duration: 30, status: 'pending' },
      { id: '4', patientName: 'James Wilson', type: 'Filling', date: '2025-10-29', time: '11:00', duration: 60, status: 'confirmed' },
      { id: '5', patientName: 'Olivia Martinez', type: 'Teeth Whitening', date: '2025-10-30', time: '13:00', duration: 90, status: 'confirmed' },
      { id: '6', patientName: 'Robert Brown', type: 'Extraction', date: '2025-10-31', time: '09:30', duration: 45, status: 'pending' },
    ];

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700">Appointments</h2>
                        <p className="text-gray-500">This page is under development</p>
                    </div>
                </div>
            </div>

            <FilterBar
                showHolidays={showHolidays}
                setShowHolidays={setShowHolidays}
                showReminders={showReminders}
                setShowReminders={setShowReminders}
                selectedDate={selectedDate}
            />

            <div className="flex gap-6 mt-6">
                <div className="flex-1">
                    <WeeklyCalendar
                        appointments={appointments}
                        onAppointmentClick={setSelectedAppointment}
                        selectedAppointment={selectedAppointment}
                    />
                </div>

                <AppointmentDetailsPanel
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            </div>
        </div>
    );
}

export default AppointmentsPage;

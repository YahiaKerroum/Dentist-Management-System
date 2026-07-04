import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { getAvatarColor } from '../../utils/avatarColor';

const ITEMS_PER_PAGE = 15;

interface AppointmentsTableProps {
    appointments: Appointment[];
    selectedAppointmentId: string | null;
    onAppointmentClick: (appointment: Appointment) => void;
    userRole: string;
}

const STATUS_BADGE: Record<AppointmentStatus, 'info' | 'success' | 'warning' | 'danger' | 'neutral'> = {
    [AppointmentStatus.SCHEDULED]: 'info',
    [AppointmentStatus.CHECKED_IN]: 'warning',
    [AppointmentStatus.IN_PROGRESS]: 'warning',
    [AppointmentStatus.COMPLETED]: 'success',
    [AppointmentStatus.CANCELLED]: 'danger',
    [AppointmentStatus.NO_SHOW]: 'neutral',
};

const dayKey = (date: Date) => date.toDateString();

const sectionLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dayKey(date) === dayKey(today)) return 'Today';
    if (dayKey(date) === dayKey(tomorrow)) return 'Tomorrow';
    if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

export function AppointmentsTable({
    appointments,
    selectedAppointmentId,
    onAppointmentClick,
    userRole
}: AppointmentsTableProps) {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAppointments = appointments.slice(startIndex, endIndex);

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
                <EmptyState
                    icon={Calendar}
                    title="No appointments found"
                    description={
                        userRole === 'ASSISTANT' || userRole === 'MANAGER'
                            ? 'Create a new appointment to get started.'
                            : 'No appointments scheduled.'
                    }
                />
            </div>
        );
    }

    // Group the current page of appointments into date sections, preserving order.
    const sections: { label: string; items: Appointment[] }[] = [];
    for (const appointment of currentAppointments) {
        const label = sectionLabel(appointment.dateOfTreatment);
        const lastSection = sections[sections.length - 1];
        if (lastSection && lastSection.label === label) {
            lastSection.items.push(appointment);
        } else {
            sections.push({ label, items: [appointment] });
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
            <div className="divide-y divide-surface-100">
                {sections.map((section) => (
                    <div key={section.label}>
                        <div className="sticky top-0 z-10 bg-surface-50/95 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-surface-500 backdrop-blur-sm">
                            {section.label}
                        </div>
                        <div className="divide-y divide-surface-100">
                            {section.items.map((appointment) => {
                                const avatar = getAvatarColor(`${appointment.patient?.firstName}${appointment.patient?.lastName}`);
                                return (
                                    <div
                                        key={appointment.id}
                                        onClick={() => onAppointmentClick(appointment)}
                                        className={`flex cursor-pointer items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface-50 ${
                                            selectedAppointmentId === appointment.id ? 'bg-primary-50/60' : ''
                                        }`}
                                    >
                                        <div className="w-16 shrink-0 text-sm font-semibold text-surface-700 tabular-nums">
                                            {formatTime(appointment.dateOfTreatment)}
                                        </div>
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatar.bg} ${avatar.text}`}>
                                            {getInitials(appointment.patient?.firstName, appointment.patient?.lastName)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-surface-900">
                                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                                            </p>
                                            <p className="truncate text-xs text-surface-500">
                                                Dr. {appointment.doctor?.user.firstName} {appointment.doctor?.user.lastName}
                                            </p>
                                        </div>
                                        <Badge variant={STATUS_BADGE[appointment.status]}>
                                            {appointment.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="bg-white px-6 py-4 border-t border-surface-200 flex items-center justify-between">
                    <div className="text-sm text-surface-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, appointments.length)}</span> of{' '}
                        <span className="font-medium">{appointments.length}</span> appointments
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                        currentPage === page
                                            ? 'bg-primary-600 text-white'
                                            : 'text-surface-700 hover:bg-surface-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

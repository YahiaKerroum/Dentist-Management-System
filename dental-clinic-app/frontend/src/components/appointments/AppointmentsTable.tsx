import { Calendar, Clock } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/appointment';

interface AppointmentsTableProps {
    appointments: Appointment[];
    selectedAppointmentId: string | null;
    onAppointmentClick: (appointment: Appointment) => void;
    userRole: string;
}

export function AppointmentsTable({
    appointments,
    selectedAppointmentId,
    onAppointmentClick,
    userRole
}: AppointmentsTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.SCHEDULED:
                return 'bg-blue-100 text-blue-800';
            case AppointmentStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case AppointmentStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm">
                            {userRole === 'ASSISTANT' || userRole === 'MANAGER'
                                ? 'Create a new appointment to get started.' 
                                : 'No appointments scheduled.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Doctor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.map((appointment) => (
                            <tr 
                                key={appointment.id} 
                                onClick={() => onAppointmentClick(appointment)}
                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                    selectedAppointmentId === appointment.id ? 'bg-blue-50' : ''
                                }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatDate(appointment.dateOfTreatment)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                        {formatTime(appointment.dateOfTreatment)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {getInitials(appointment.patient?.firstName, appointment.patient?.lastName)}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        Dr. {appointment.doctor?.user.firstName} {appointment.doctor?.user.lastName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                        {appointment.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
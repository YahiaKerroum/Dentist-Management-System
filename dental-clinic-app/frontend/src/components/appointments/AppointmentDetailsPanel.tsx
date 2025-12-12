// frontend/src/components/appointments/AppointmentDetailsPanel.tsx

import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/appointment';

interface AppointmentDetailsPanelProps {
    appointment: Appointment | null;
    onClose: () => void;
    userRole: string;
    onStatusUpdate?: (id: string, status: AppointmentStatus) => void;
    onEdit?: (appointment: Appointment) => void;
    onDelete?: (id: string) => void;
}

export function AppointmentDetailsPanel({
    appointment,
    onClose,
    userRole,
    onStatusUpdate,
    onEdit,
    onDelete,
}: AppointmentDetailsPanelProps) {
    const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | ''>('');

    if (!appointment) {
        return (
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500 text-center">Select an appointment to view details</p>
            </div>
        );
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as AppointmentStatus;
        setSelectedStatus(newStatus);
        
        // NOTE: Call updateAppointmentStatus service
        if (onStatusUpdate && newStatus) {
            onStatusUpdate(appointment.id, newStatus);
        }
    };

    const handleDelete = () => {
        // NOTE: Prompt confirmation and call deleteAppointment service
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            if (onDelete) {
                onDelete(appointment.id);
            }
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    };

    const { date, time } = formatDateTime(appointment.dateOfTreatment);

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

    return (
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">Appointment Details</h3>
                <button 
                    onClick={onClose} 
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Date */}
                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Appointment Date</span>
                    </div>
                    <div className="text-gray-900">{date}</div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Time */}
                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Time</span>
                    </div>
                    <div className="text-gray-900">{time}</div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Patient */}
                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Patient</span>
                    </div>
                    <div className="text-gray-900">
                        {appointment.patient ? 
                            `${appointment.patient.firstName} ${appointment.patient.lastName}` : 
                            'N/A'
                        }
                    </div>
                    {appointment.patient?.phone && (
                        <div className="text-sm text-gray-500 mt-1">{appointment.patient.phone}</div>
                    )}
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Doctor */}
                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Doctor</span>
                    </div>
                    <div className="text-gray-900">
                        {appointment.doctor ? 
                            `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}` : 
                            'N/A'
                        }
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Treatment Type */}
                {appointment.typeOfTreatment && (
                    <>
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Treatment Type</span>
                            </div>
                            <div className="text-gray-900">
                                {appointment.typeOfTreatment.replace(/_/g, ' ')}
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                    </>
                )}

                {/* Status - For Doctor: Dropdown to edit, For Assistant: Display only */}
                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Status</span>
                    </div>
            
                        <select
                            value={selectedStatus || appointment.status}
                            onChange={handleStatusChange}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(appointment.status)}`}
                        >
                            {Object.values(AppointmentStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Notes */}
                {appointment.notes && (
                    <>
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Notes</span>
                            </div>
                            <div className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                                {appointment.notes}
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                    </>
                )}

                {/* Teeth Involved */}
                {appointment.teethInvolved && appointment.teethInvolved.length > 0 && (
                    <>
                        <div>
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Teeth Involved</span>
                            </div>
                            <div className="text-gray-900">
                                {appointment.teethInvolved.join(', ')}
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                    </>
                )}

                {/* Action Buttons - Only for Assistants */}
                {userRole === 'ASSISTANT' && (
                    <div className="pt-4 space-y-2">
                        <button 
                            onClick={() => onEdit && onEdit(appointment)}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Appointment
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="w-full py-2 px-4 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Appointment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
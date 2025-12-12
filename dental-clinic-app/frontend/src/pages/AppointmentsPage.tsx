// frontend/src/pages/AppointmentsPageNew.tsx

import { useState, useEffect } from 'react';
import { 
    getAppointments, 
    createAppointment, 
    updateAppointment, 
    updateAppointmentStatus,
    deleteAppointment 
} from '../services/appointment.service';
import { Appointment, CreateAppointmentDTO, AppointmentStatus } from '../types/appointment';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { AppointmentDetailsPanel } from '../components/appointments/AppointmentDetailsPanel';
import {
    Plus,
    Search,
    Calendar,
    Clock,
    User,
    CheckCircle,
} from 'lucide-react';

interface AppointmentsPageProps {
    token: string;
}

export function AppointmentsPage({ token }: AppointmentsPageProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Details panel state
    const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

    // User role (extract from token)
    const [userRole, setUserRole] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        // Extract user role and ID from JWT token
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(payload.role || '');
            setUserId(payload.userId || '');
        } catch (err) {
            console.error('Failed to parse token:', err);
        }
    }, [token]);

    useEffect(() => {
        if (userRole) {
            fetchAppointments();
        }
    }, [token, userRole]);

    const fetchAppointments = async () => {
        try {
            // NOTE: For DOCTOR users, filter by their doctor profile ID
            // For ASSISTANT/MANAGER, fetch all appointments
            
            let doctorIdFilter: string | undefined;
            
            if (userRole === 'DOCTOR') {
                // Need to get the doctor profile ID from user data
                // NOTE: You may need to fetch this from GET /api/users/me
                const userResponse = await fetch('http://localhost:4000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    doctorIdFilter = userData.data?.doctorProfile?.id;
                }
            }

            // NOTE: Call getAppointments service
            const response = await getAppointments(token, doctorIdFilter);
            setAppointments(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = () => {
        setModalMode('add');
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setModalMode('edit');
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleViewDetails = (appointment: Appointment) => {
        setDetailAppointment(appointment);
    };

    const handleFormSubmit = async (data: CreateAppointmentDTO) => {
        try {
            if (modalMode === 'add') {
                // NOTE: Call createAppointment service
                const response = await createAppointment(data, token);
                setAppointments(prev => [...prev, response.data]);
            } else {
                if (!selectedAppointment) {
                    setError('No appointment selected for update');
                    return;
                }
                // NOTE: Call updateAppointment service
                const response = await updateAppointment(selectedAppointment.id, data, token);
                setAppointments(prev =>
                    prev.map(a => a.id === response.data.id ? response.data : a)
                );
                
                // Update detail panel if this appointment is currently displayed
                if (detailAppointment?.id === response.data.id) {
                    setDetailAppointment(response.data);
                }
            }
            setIsModalOpen(false);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to save appointment');
        }
    };

    const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
        try {
            // NOTE: Call updateAppointmentStatus service
            const response = await updateAppointmentStatus(id, status, token);
            setAppointments(prev =>
                prev.map(a => a.id === response.data.id ? response.data : a)
            );
            
            // Update detail panel
            if (detailAppointment?.id === response.data.id) {
                setDetailAppointment(response.data);
            }
            
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
        }
    };

    const handleDeleteAppointment = async (id: string) => {
        try {
            // NOTE: Call deleteAppointment service
            await deleteAppointment(id, token);
            setAppointments(prev => prev.filter(a => a.id !== id));
            setDetailAppointment(null);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to delete appointment');
        }
    };

    // Filter appointments
    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor?.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor?.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
            case AppointmentStatus.NO_SHOW:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 mt-1">
                        {userRole === 'DOCTOR' ? 'Manage your appointments' : 'Manage clinic appointments'}
                    </p>
                </div>
                
                {/* Only Assistants can create appointments */}
                {userRole === 'ASSISTANT' && (
                    <Button onClick={handleAddAppointment} className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Appointment
                    </Button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-sm font-medium hover:text-red-800">Dismiss</button>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by patient or doctor name..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                >
                    <option value="all">All Status</option>
                    {Object.values(AppointmentStatus).map((status) => (
                        <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
            </div>

            {/* Main Content: Table + Details Panel */}
            <div className="flex gap-6">
                {/* Appointments Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                {filteredAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium">No appointments found</p>
                                                <p className="text-sm">
                                                    {userRole === 'ASSISTANT' 
                                                        ? 'Create a new appointment to get started.' 
                                                        : 'No appointments scheduled.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAppointments.map((appointment) => (
                                        <tr 
                                            key={appointment.id} 
                                            onClick={() => handleViewDetails(appointment)}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                                detailAppointment?.id === appointment.id ? 'bg-blue-50' : ''
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
                                                            {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Panel */}
                <AppointmentDetailsPanel
                    appointment={detailAppointment}
                    onClose={() => setDetailAppointment(null)}
                    userRole={userRole}
                    onStatusUpdate={handleStatusUpdate}
                    onEdit={handleEditAppointment}
                    onDelete={handleDeleteAppointment}
                />
            </div>

            {/* Appointment Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Create New Appointment' : 'Edit Appointment'}
            >
                <AppointmentForm
                    mode={modalMode}
                    initialData={selectedAppointment}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    token={token}
                />
            </Modal>
        </div>
    );
}
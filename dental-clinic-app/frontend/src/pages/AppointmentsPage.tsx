import { useState, useEffect } from 'react';
import { 
    getAllAppointments,
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
import { AppointmentsTable } from '../components/appointments/AppointmentsTable';
import {
    Plus,
    Search,
} from 'lucide-react';
import { SuccessDialog, ErrorDialog } from '../components/appointments/Dialogs';

interface AppointmentsPageProps {
    token: string;
}

export function AppointmentsPage({ token }: AppointmentsPageProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    
    const [showSuccess, setShowSuccess] = useState(false);  
    const [successMessage, setSuccessMessage] = useState(''); 
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); 

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
            setLoading(true);
            let filters: any = {};
            
            // If user is DOCTOR, filter by their doctor profile ID
            if (userRole === 'DOCTOR') {
                // Fetch user data to get doctor profile ID
                const userResponse = await fetch('http://localhost:4000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const doctorId = userData.data?.doctorProfile?.id;
                    if (doctorId) {
                        filters.doctorId = doctorId;
                    }
                }
            }

            // Fetch appointments with filters
            const data = await getAllAppointments(filters);
            setAppointments(data.reverse());
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to load appointments');
            console.error('Error fetching appointments:', err);
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
        try{
        if (modalMode === 'add') {
            const newAppointment = await createAppointment(data);
            setAppointments(prev => [...prev, newAppointment]);
            setSuccessMessage('Appointment created successfully!');
        } else {
            if (!selectedAppointment) {
                throw new Error('No appointment selected for update');
            }
            const updatedAppointment = await updateAppointment(selectedAppointment.id, data);
            setAppointments(prev =>
                prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
            );
            
            // Update detail panel if this appointment is currently displayed
            if (detailAppointment?.id === updatedAppointment.id) {
                setDetailAppointment(updatedAppointment);
            }

            setSuccessMessage('Appointment updated successfully!');
        }
        setIsModalOpen(false);
        setError('');
        setShowSuccess(true);} 
        catch(err : any)
        {
            setErrorMessage(err.message || 'Failed to save appointment');
            setIsModalOpen(false);
            setShowError(true); 
        }
    };

    const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
       try {
         const updatedAppointment = await updateAppointmentStatus(id, status);
         setAppointments(prev =>
             prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
         );
         
         // Update detail panel
         if (detailAppointment?.id === updatedAppointment.id) {
             setDetailAppointment(updatedAppointment);
         }
         setSuccessMessage('Appointment status updated successfully!');
         setShowSuccess(true);
         setError('');
       } catch (error: any) {
        setErrorMessage(error.message || 'Failed to update appointment status');
        setShowError(true);
       }
    };

    const handleDeleteAppointment = async (id: string) => {
        try {
            await deleteAppointment(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
            setDetailAppointment(null);
            setError('');
            setSuccessMessage('Appointment Deleted Successfully');
            setShowSuccess(true);
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete appointment');
            setShowError(true);
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
                
                {/* Only Assistants and Managers can create appointments */}
                {(userRole === 'ASSISTANT' || userRole === 'MANAGER') && (
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
            <div className="flex gap-2">
                {/* Appointments Table */}
                <div className="flex-1">
                    <AppointmentsTable
                        appointments={filteredAppointments}
                        selectedAppointmentId={detailAppointment?.id || null}
                        onAppointmentClick={handleViewDetails}
                        userRole={userRole}
                    />
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

             {/*Success Dialog */}
            <SuccessDialog
                isOpen={showSuccess}
                message={successMessage}
                onClose={() => setShowSuccess(false)} 
                autoClose={true}  
            />

            {/* Error Dialog */}
            <ErrorDialog
                isOpen={showError} 
                message={errorMessage}
                onClose={() => setShowError(false)} 
            />
        </div>
    );
}
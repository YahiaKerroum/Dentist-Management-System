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
import { Filter, ChevronDown, X } from 'lucide-react';
import { getPatients } from '../services/patient.service';
import { getAllStaff } from '../services/user.service';
import { Patient } from '../types/patient';
import { User } from '../types/user';

interface AppointmentsPageProps {
    token: string;
}

export function AppointmentsPage({ token }: AppointmentsPageProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [patientFilter, setPatientFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<User[]>([]);
    
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
<<<<<<< HEAD
            let doctorProfileId: string | undefined;

            // If user is DOCTOR, fetch their doctor profile ID for sorting (not filtering)
=======
            let filters: any = {};

            // If user is DOCTOR, filter by their doctor profile ID
>>>>>>> develop
            if (userRole === 'DOCTOR') {
                const userResponse = await fetch('http://localhost:4000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    doctorProfileId = userData.data?.doctorProfile?.id;
                }
            }

<<<<<<< HEAD
            // Fetch all appointments
            const data = await getAllAppointments();

            // Sort: doctor's own appointments first, then others by date (newest first)
            const sortedAppointments = [...data].sort((a, b) => {
                const aOwn = doctorProfileId ? a.doctorId === doctorProfileId : false;
                const bOwn = doctorProfileId ? b.doctorId === doctorProfileId : false;

                if (aOwn && !bOwn) return -1;
                if (!aOwn && bOwn) return 1;

                const aDate = new Date(a.dateOfTreatment).getTime();
                const bDate = new Date(b.dateOfTreatment).getTime();
                return bDate - aDate;
            });

            setAppointments(sortedAppointments);
=======
            // Fetch appointments, patients, and doctors in parallel
            const [appointmentsData, patientsData, doctorsData] = await Promise.all([
                getAllAppointments(filters),
                getPatients(token),
                getAllStaff(token, { role: 'DOCTOR' }),
            ]);

            setAppointments(appointmentsData.reverse());
            setPatients(patientsData.data);
            setDoctors(doctorsData.data);
>>>>>>> develop
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
        // Calculate date 2 months ago
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        // When filters are active, show all matching appointments (not just last 2 months)
        const hasActiveFilters = 
            patientFilter !== 'all' || 
            doctorFilter !== 'all' || 
            statusFilter !== 'all' || 
            dateRange.from || 
            dateRange.to ||
            searchTerm.trim() !== '';

        // Default filtering: last 2 months and exclude NO_SHOW
        if (!hasActiveFilters) {
            const appointmentDate = new Date(appointment.dateOfTreatment);
            if (appointmentDate < twoMonthsAgo) return false;
            if (appointment.status === 'NO_SHOW') return false;
        }

        // Search term filter
        const matchesSearch = () => {
            if (!searchTerm.trim()) return true;
            const search = searchTerm.toLowerCase().trim();
            const patientFullName = `${appointment.patient?.firstName} ${appointment.patient?.lastName}`.toLowerCase();
            const doctorFullName = `${appointment.doctor?.user.firstName} ${appointment.doctor?.user.lastName}`.toLowerCase();
            return patientFullName.includes(search) || doctorFullName.includes(search);
        };

        // Status filter (now includes NO_SHOW as an option)
        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        // Patient filter
        const matchesPatient = patientFilter === 'all' || appointment.patientId === patientFilter;

        // Doctor filter
        const matchesDoctor = doctorFilter === 'all' || appointment.doctorId === doctorFilter;

        // Date range filters
        const matchesDateFrom = !dateRange.from || 
            new Date(appointment.dateOfTreatment) >= new Date(dateRange.from);
        const matchesDateTo = !dateRange.to || 
            new Date(appointment.dateOfTreatment) <= new Date(dateRange.to);

        return matchesSearch() && matchesStatus && matchesPatient && matchesDoctor && 
        matchesDateFrom && matchesDateTo;
    }


);

const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPatientFilter('all');
    setDoctorFilter('all');
    setDateRange({ from: '', to: '' });
};

const hasActiveFilters = 
    patientFilter !== 'all' || 
    doctorFilter !== 'all' || 
    statusFilter !== 'all' || 
    dateRange.from || 
    dateRange.to;


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3DBEA3' }}></div>
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
                
                {/* Create appointment button */}
                <Button onClick={handleAddAppointment} className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Appointment
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-sm font-medium hover:text-red-800">Dismiss</button>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="p-4 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by patient or doctor name..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3] transition duration-150 ease-in-out sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                            showFilters || hasActiveFilters
                                ? 'border-[#3DBEA3] text-[#3DBEA3]'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        style={showFilters || hasActiveFilters ? { backgroundColor: '#E8F5F0' } : {}}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-5 h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: '#3DBEA3' }}>
                                !
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                    
                {showFilters && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select
                                    value={patientFilter}
                                    onChange={(e) => setPatientFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
                                >
                                    <option value="all">All Patients</option>
                                    {patients.map((patient) => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.firstName} {patient.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                                
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
                                >
                                    <option value="all">All Doctors</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.doctorProfile?.id || ''}>
                                            Dr. {doc.firstName} {doc.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                                
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
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
                                
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
                                />
                            </div>
                                
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
                                />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium hover:text-[#2FA88E]"
                                    style={{ color: '#3DBEA3' }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
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
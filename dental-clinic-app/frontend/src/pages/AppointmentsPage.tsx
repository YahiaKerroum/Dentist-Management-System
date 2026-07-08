import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
    getAllAppointments,
    createAppointment, 
    updateAppointment, 
    updateAppointmentStatus,
    deleteAppointment 
} from '../services/appointment.service';
import { Appointment, CreateAppointmentDTO, AppointmentStatus } from '../types/appointment';
import { getAllRooms } from '../services/room.service';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { AppointmentDetailsPanel } from '../components/appointments/AppointmentDetailsPanel';
import { AppointmentsTable } from '../components/appointments/AppointmentsTable';
import { ChairPlanner } from '../components/appointments/ChairPlanner';
import {
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { SuccessDialog, ErrorDialog } from '../components/appointments/Dialogs';
import { Filter, X } from 'lucide-react';
import { getUserProfile } from '../services/user.service';
import { Patient } from '../types/patient';
import { User } from '../types/user';
import { decodeToken } from '../utils/jwt';
import { queryKeys } from '../lib/queryKeys';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';

const isSameDay = (isoDate: string, day: Date) => {
    const d = new Date(isoDate);
    return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
};

interface AppointmentsPageProps {
    token: string;
}

export function AppointmentsPage({ token }: AppointmentsPageProps) {
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
    const [patientFilter, setPatientFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [patients] = useState<Patient[]>([]);
    const [doctors] = useState<User[]>([]);
    const [viewMode, setViewMode] = useState<'chair' | 'table'>('chair');
    const [plannerDate, setPlannerDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

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

    // User role (extract from token) — synchronous so it's ready for the query key
    const userRole = decodeToken(token)?.role || '';

    const appointmentsKey = queryKeys.appointments(userRole);
    const {
        data: appointments = [],
        isLoading: loading,
        error: appointmentsError,
    } = useQuery({
        queryKey: appointmentsKey,
        enabled: !!userRole,
        queryFn: async () => {
            let doctorProfileId: string | undefined;
            // If user is DOCTOR, fetch their doctor profile ID for sorting (not filtering)
            if (userRole === 'DOCTOR') {
                const userData = await getUserProfile(token);
                doctorProfileId = userData.data?.doctorProfile?.id;
            }
            const data = await getAllAppointments();
            // Sort: doctor's own appointments first, then others by date (newest first)
            return [...data].sort((a, b) => {
                const aOwn = doctorProfileId ? a.doctorId === doctorProfileId : false;
                const bOwn = doctorProfileId ? b.doctorId === doctorProfileId : false;
                if (aOwn && !bOwn) return -1;
                if (!aOwn && bOwn) return 1;
                return new Date(b.dateOfTreatment).getTime() - new Date(a.dateOfTreatment).getTime();
            });
        },
    });

    const { data: rooms = [] } = useQuery({
        queryKey: queryKeys.rooms,
        queryFn: getAllRooms,
    });

    useEffect(() => {
        if (appointmentsError) setError((appointmentsError as Error).message || 'Failed to load appointments');
    }, [appointmentsError]);

    const setAppointmentsCache = (updater: (prev: Appointment[]) => Appointment[]) =>
        queryClient.setQueryData<Appointment[]>(appointmentsKey, (prev = []) => updater(prev));

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
            setAppointmentsCache(prev => [...prev, newAppointment]);
            setSuccessMessage('Appointment created successfully!');
        } else {
            if (!selectedAppointment) {
                throw new Error('No appointment selected for update');
            }
            const updatedAppointment = await updateAppointment(selectedAppointment.id, data);
            setAppointmentsCache(prev =>
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

    const handleMoveAppointment = async (id: string, newDateOfTreatment: string, roomId: string | null) => {
        try {
            const updatedAppointment = await updateAppointment(id, { dateOfTreatment: newDateOfTreatment, roomId });
            setAppointmentsCache(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
            if (detailAppointment?.id === updatedAppointment.id) {
                setDetailAppointment(updatedAppointment);
            }
            setSuccessMessage('Appointment rescheduled successfully!');
            setShowSuccess(true);
            setError('');
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to reschedule appointment');
            setShowError(true);
        }
    };

    const handleStatusUpdate = async (id: string, status: AppointmentStatus) => {
       try {
         const updatedAppointment = await updateAppointmentStatus(id, status);
         setAppointmentsCache(prev =>
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
            setAppointmentsCache(prev => prev.filter(a => a.id !== id));
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#26a37e' }}></div>
            </div>
        );
    }

    return (
        <div className="bg-surface-50 min-h-full p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-surface-900">Appointments</h1>
                    <p className="text-surface-500 mt-1">
                        {userRole === 'DOCTOR' ? 'Manage your appointments' : 'Manage clinic appointments'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-md border border-surface-200 bg-surface-100 p-0.5">
                        <button
                            onClick={() => setViewMode('chair')}
                            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'chair' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            Chair View
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'table' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            Table View
                        </button>
                    </div>

                    {/* Create appointment button */}
                    <Button onClick={handleAddAppointment} className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Appointment
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-sm font-medium hover:text-red-800">Dismiss</button>
                </div>
            )}

            {viewMode === 'chair' && (
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPlannerDate((d) => { const next = new Date(d); next.setDate(next.getDate() - 1); return next; })}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-300 text-surface-500 hover:bg-surface-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <p className="min-w-[160px] text-center text-sm font-medium text-surface-800">
                            {plannerDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <button
                            onClick={() => setPlannerDate((d) => { const next = new Date(d); next.setDate(next.getDate() + 1); return next; })}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-300 text-surface-500 hover:bg-surface-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => { const d = new Date(); d.setHours(0, 0, 0, 0); setPlannerDate(d); }}
                            className="ml-1 rounded-md border border-surface-300 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}

            {viewMode === 'chair' && (
                <ChairPlanner
                    date={plannerDate}
                    rooms={rooms}
                    appointments={appointments.filter((a) => isSameDay(a.dateOfTreatment, plannerDate))}
                    selectedAppointmentId={detailAppointment?.id || null}
                    onAppointmentClick={handleViewDetails}
                    onMoveAppointment={handleMoveAppointment}
                />
            )}

            {/* Search and Filter Bar */}
            {viewMode === 'table' && (
            <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-surface-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by patient or doctor name..."
                        className="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-md bg-white placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:shadow-focus transition sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex flex-wrap rounded-md border border-surface-200 bg-surface-100 p-0.5">
                        {(['all', ...Object.values(AppointmentStatus)] as const).map((option) => (
                            <button
                                key={option}
                                onClick={() => setStatusFilter(option as AppointmentStatus | 'all')}
                                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                    statusFilter === option
                                        ? 'bg-white text-surface-900 shadow-xs'
                                        : 'text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {option === 'all' ? 'All' : option.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    hasActiveFilters
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-3">
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Patient</label>
                                    <select
                                        value={patientFilter}
                                        onChange={(e) => setPatientFilter(e.target.value)}
                                        className="w-full rounded-md border border-surface-300 bg-white px-2.5 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
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
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Doctor</label>
                                    <select
                                        value={doctorFilter}
                                        onChange={(e) => setDoctorFilter(e.target.value)}
                                        className="w-full rounded-md border border-surface-300 bg-white px-2.5 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                    >
                                        <option value="all">All Doctors</option>
                                        {doctors.map((doc) => (
                                            <option key={doc.id} value={doc.doctorProfile?.id || ''}>
                                                Dr. {doc.firstName} {doc.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">From</label>
                                        <input
                                            type="date"
                                            value={dateRange.from}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                            className="w-full rounded-md border border-surface-300 bg-white px-2 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">To</label>
                                        <input
                                            type="date"
                                            value={dateRange.to}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                            className="w-full rounded-md border border-surface-300 bg-white px-2 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                        />
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Appointments Table */}
            <AppointmentsTable
                appointments={filteredAppointments}
                selectedAppointmentId={detailAppointment?.id || null}
                onAppointmentClick={handleViewDetails}
                userRole={userRole}
            />
            </>
            )}

            {/* Appointment Details Drawer */}
            <AnimatePresence>
                {detailAppointment && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 bg-surface-950/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setDetailAppointment(null)}
                        />
                        <motion.div
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm shadow-xl"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <AppointmentDetailsPanel
                                appointment={detailAppointment}
                                onClose={() => setDetailAppointment(null)}
                                userRole={userRole}
                                onStatusUpdate={handleStatusUpdate}
                                onEdit={handleEditAppointment}
                                onDelete={handleDeleteAppointment}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
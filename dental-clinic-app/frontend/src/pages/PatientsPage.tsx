import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/patient.service';
import { getUserPermissions } from '../services/user.service';
import { queryKeys } from '../lib/queryKeys';
import { Patient, CreatePatientDTO } from '../types/patient';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { PatientForm } from '../components/patients/PatientForm';
import { PatientDetailPanel } from './PatientDetailPage';
import { downloadCSV, formatPatientsForExport } from '../utils/export.utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { decodeToken } from '../utils/jwt';
import { toast } from '../components/ui/Toaster';
import {
    Plus,
    Search,
    Phone,
    Mail,
    Calendar,
    User as UserIcon,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    X,
    Clock,
    SlidersHorizontal,
    Stethoscope,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { Badge } from '../components/ui/Badge';
import { getAvatarColor } from '../utils/avatarColor';

interface PatientsPageProps {
    token: string;
    initialPatientId?: string;
    onPatientOpened?: () => void;
}

export function PatientsPage({ token, initialPatientId, onPatientOpened }: PatientsPageProps) {
    const queryClient = useQueryClient();
    const {
        data: patients = [],
        isLoading: loading,
        error: patientsError,
    } = useQuery({
        queryKey: queryKeys.patients,
        queryFn: async () => (await getPatients(token)).data,
    });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Detail panel state - now tracks viewing detail page
    const [viewingDetail, setViewingDetail] = useState(false);
    const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

    // Track if we've handled the initial patient
    const [initialPatientHandled, setInitialPatientHandled] = useState(false);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // User permissions (cached per user)
    const currentUserId = decodeToken(token)?.userId ?? '';
    const { data: userPermissions = [] } = useQuery({
        queryKey: queryKeys.userPermissions(currentUserId),
        queryFn: async () => (await getUserPermissions(currentUserId, token)).data || [],
        enabled: !!currentUserId,
    });

    // Search input ref for keyboard shortcuts
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            description: 'Focus search',
            action: () => searchInputRef.current?.focus(),
        },
        {
            key: 'n',
            ctrl: true,
            description: 'Add new patient',
            action: () => handleAddPatient(),
        },
        {
            key: 'e',
            ctrl: true,
            description: 'Export to CSV',
            action: () => handleExportCSV(),
        },
    ]);

    useEffect(() => {
        if (patientsError) setError((patientsError as Error).message || 'Failed to load patients');
    }, [patientsError]);

    // Handle initial patient ID - open detail panel for specific patient
    useEffect(() => {
        if (initialPatientId && patients.length > 0 && !initialPatientHandled) {
            const patient = patients.find(p => p.id === initialPatientId);
            if (patient) {
                setDetailPatient(patient);
                setViewingDetail(true);
                setInitialPatientHandled(true);
                // Delay the callback to avoid triggering a re-render that resets state
                setTimeout(() => {
                    if (onPatientOpened) {
                        onPatientOpened();
                    }
                }, 500);
            }
        }
    }, [initialPatientId, patients, initialPatientHandled]);

    const setPatientsCache = (updater: (prev: Patient[]) => Patient[]) =>
        queryClient.setQueryData<Patient[]>(queryKeys.patients, (prev = []) => updater(prev));

    const handleAddPatient = () => {
        setModalMode('add');
        setSelectedPatient(null);
        setIsModalOpen(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setModalMode('edit');
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleViewPatientDetails = (patient: Patient) => {
        setDetailPatient(patient);
        setViewingDetail(true);
    };

    const handleExportCSV = () => {
        const dataToExport = formatPatientsForExport(filteredPatients);
        downloadCSV(dataToExport, 'patients');
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setAgeFilter('all');
        setDateFilter('all');
        setSortBy('name-asc');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' || 
               statusFilter !== 'all' || 
               ageFilter !== 'all' || 
               dateFilter !== 'all' ||
               sortBy !== 'name-asc';
    };

    const handleFormSubmit = async (data: CreatePatientDTO) => {
        try {
            if (modalMode === 'add') {
                const response = await createPatient(data, token);
                setPatientsCache(prev => [...prev, response.data]);
                toast.success('Patient created successfully');
            } else {
                if (!selectedPatient) {
                    setError('No patient selected for update');
                    return;
                }
                const response = await updatePatient(selectedPatient.id, data, token);
                setPatientsCache(prev =>
                    prev.map(p => p.id === response.data.id ? response.data : p)
                );
                toast.success('Patient updated successfully');
            }
            setIsModalOpen(false);
            setError('');
        } catch (err: any) {
            // Show permission or other errors clearly
            const msg = err.message || 'Failed to save patient';
            setError(msg);
            toast.error(msg);
        }
    };

    const handleDeletePatient = async (id: string) => {
        try {
            await deletePatient(id, token);
            setPatientsCache(prev => prev.filter(p => p.id !== id));
            setDeleteConfirmId(null);
            setError('');
            toast.success('Patient deleted successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to delete patient');
        }
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string | null) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Apply all filters
    let filteredPatients = patients.filter(patient => {
        // Search filter
        const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter (placeholder for future isActive field)
        const matchesStatus = statusFilter === 'all' || statusFilter === 'active';

        // Age filter
        let matchesAge = true;
        if (ageFilter !== 'all' && patient.dateOfBirth) {
            const age = calculateAge(patient.dateOfBirth);
            if (age !== null) {
                switch (ageFilter) {
                    case 'children':
                        matchesAge = age < 13;
                        break;
                    case 'teens':
                        matchesAge = age >= 13 && age < 18;
                        break;
                    case 'adults':
                        matchesAge = age >= 18 && age < 65;
                        break;
                    case 'seniors':
                        matchesAge = age >= 65;
                        break;
                }
            }
        }

        // Date filter (registration date)
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const createdDate = new Date(patient.createdAt);
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

            switch (dateFilter) {
                case 'week':
                    matchesDate = daysDiff <= 7;
                    break;
                case 'month':
                    matchesDate = daysDiff <= 30;
                    break;
                case 'quarter':
                    matchesDate = daysDiff <= 90;
                    break;
            }
        }

        return matchesSearch && matchesStatus && matchesAge && matchesDate;
    });

    // Apply sorting
    filteredPatients = [...filteredPatients].sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            case 'name-desc':
                return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
            case 'date-newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'date-oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            default:
                return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-full bg-surface-50 p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Skeleton className="h-10 w-full sm:w-96" />
                    <Skeleton className="h-9 w-52" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] w-full" />
                    ))}
                </div>
            </div>
        );
    }

    // Show detail page if viewing patient
    if (viewingDetail && detailPatient) {
        return (
            <div className="bg-surface-50 min-h-full p-8">
                <PatientDetailPanel
                    patient={detailPatient}
                    token={token}
                    userRole={decodeToken(token)?.role ?? 'DOCTOR'}
                    currentUserId={currentUserId}
                    userPermissions={userPermissions}
                    onClose={() => setViewingDetail(false)}
                    onEdit={(patient) => {
                        setViewingDetail(false);
                        handleEditPatient(patient);
                    }}
                    onDelete={async (patient) => {
                        try {
                            await deletePatient(patient.id, token);
                            setPatientsCache(prev => prev.filter(p => p.id !== patient.id));
                            setViewingDetail(false);
                            setDetailPatient(null);
                            toast.success('Patient deleted successfully');
                        } catch (err: any) {
                            toast.error(err.message || 'Failed to delete patient');
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className="bg-surface-50 min-h-full p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-surface-900">Patients</h1>
                    <p className="text-surface-500 mt-1">Manage your patient records and history</p>
                </div>
                <Button onClick={handleAddPatient} className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-danger-100 bg-danger-50 p-4 text-danger-700">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-sm font-medium hover:text-danger-800">Dismiss</button>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-surface-400" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search by name or email... (Ctrl+K)"
                        className="block w-full pl-10 pr-3 py-2 border border-surface-300 rounded-md bg-white placeholder-surface-400 focus:outline-none focus:border-primary-500 focus:shadow-focus transition sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Status segmented control */}
                    <div className="inline-flex rounded-md border border-surface-200 bg-surface-100 p-0.5">
                        {(['all', 'active', 'inactive'] as const).map((option) => (
                            <button
                                key={option}
                                onClick={() => setStatusFilter(option)}
                                className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                                    statusFilter === option
                                        ? 'bg-white text-surface-900 shadow-xs'
                                        : 'text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {option === 'all' ? 'All' : option}
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    ageFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'name-asc'
                                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                                        : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                                }`}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-3">
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Age</label>
                                    <select
                                        className="w-full rounded-md border border-surface-300 bg-white px-2.5 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                        value={ageFilter}
                                        onChange={(e) => setAgeFilter(e.target.value)}
                                    >
                                        <option value="all">All Ages</option>
                                        <option value="children">Children (0-12)</option>
                                        <option value="teens">Teens (13-17)</option>
                                        <option value="adults">Adults (18-64)</option>
                                        <option value="seniors">Seniors (65+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Registered</label>
                                    <select
                                        className="w-full rounded-md border border-surface-300 bg-white px-2.5 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    >
                                        <option value="all">All Time</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="quarter">Last 90 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Sort By</label>
                                    <select
                                        className="w-full rounded-md border border-surface-300 bg-white px-2.5 py-1.5 text-sm text-surface-700 focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                        <option value="date-newest">Newest First</option>
                                        <option value="date-oldest">Oldest First</option>
                                    </select>
                                </div>
                                {hasActiveFilters() && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={handleExportCSV} variant="secondary" title="Export to CSV (Ctrl+E)">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Patient list */}
            {paginatedPatients.length === 0 ? (
                <div className="rounded-lg border border-surface-200 bg-white px-6 py-16 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                        <UserIcon className="w-12 h-12 text-surface-300 mb-3" />
                        <p className="text-lg font-medium">No patients found</p>
                        <p className="text-sm">Try adjusting your search terms or add a new patient.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="hidden px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-surface-400 lg:grid lg:grid-cols-[2.1fr_1.7fr_1.2fr_1.1fr_auto_auto] lg:gap-4">
                        <span>Patient</span>
                        <span>Contact</span>
                        <span>Date of birth</span>
                        <span>Last updated</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>

                    <div className="space-y-2">
                        {paginatedPatients.map((patient) => {
                            const avatar = getAvatarColor(`${patient.firstName}${patient.lastName}`);
                            const age = calculateAge(patient.dateOfBirth);
                            return (
                                <div
                                    key={patient.id}
                                    onClick={() => handleViewPatientDetails(patient)}
                                    className="relative grid cursor-pointer grid-cols-1 gap-3 overflow-hidden rounded-lg border border-surface-200 bg-white p-4 pl-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md lg:grid-cols-[2.1fr_1.7fr_1.2fr_1.1fr_auto_auto] lg:items-center lg:gap-4 lg:p-3.5 lg:pl-5"
                                >
                                    <div className={`absolute inset-y-0 left-0 w-1.5 ${avatar.stripe}`} />
                                    {/* Patient identity */}
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white shadow-xs ${avatar.bg} ${avatar.text}`}>
                                            {(patient.firstName?.[0] ?? '')}{(patient.lastName?.[0] ?? '')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-surface-900">{patient.firstName} {patient.lastName}</p>
                                            {patient.primaryDentist ? (
                                                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-info-50 px-2 py-0.5 text-[11px] font-medium text-info-700">
                                                    <Stethoscope className="h-3 w-3" />
                                                    Dr. {patient.primaryDentist.user.firstName} {patient.primaryDentist.user.lastName}
                                                </span>
                                            ) : (
                                                <span className="mt-0.5 inline-flex items-center rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-mono text-surface-500">
                                                    #{patient.id ? patient.id.slice(0, 8) : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="flex flex-col gap-1 pl-14 lg:pl-0">
                                        <div className="flex items-center text-sm text-surface-600">
                                            <Mail className="mr-2 h-3 w-3 shrink-0 text-surface-400" />
                                            <span className="truncate">{patient.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-surface-600">
                                            <Phone className="mr-2 h-3 w-3 shrink-0 text-surface-400" />
                                            {patient.phone || 'N/A'}
                                        </div>
                                    </div>

                                    {/* DOB */}
                                    <div className="pl-14 text-sm text-surface-600 lg:pl-0">
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4 shrink-0 text-surface-400" />
                                            {patient.dateOfBirth ? (
                                                <span>
                                                    {formatDate(patient.dateOfBirth)}
                                                    {age !== null && <span className="text-surface-400"> &middot; {age} yrs</span>}
                                                </span>
                                            ) : (
                                                'N/A'
                                            )}
                                        </div>
                                    </div>

                                    {/* Last updated */}
                                    <div className="pl-14 text-sm text-surface-600 lg:pl-0">
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4 shrink-0 text-surface-400" />
                                            <div className="flex flex-col">
                                                <span>{patient.updatedAt ? formatDate(patient.updatedAt) : 'N/A'}</span>
                                                <span className="text-xs text-surface-400">
                                                    {patient.updatedAt ? new Date(patient.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="pl-14 lg:pl-0">
                                        <Badge variant="success">Active</Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pl-14 text-sm font-medium lg:justify-end lg:pl-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }}
                                            className="text-primary-600 transition-colors hover:text-primary-700"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {deleteConfirmId === patient.id ? (
                                            <div className="flex items-center gap-2 animate-fadeIn">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }}
                                                    className="text-xs px-2 py-1 bg-danger-600 text-white rounded hover:bg-danger-700"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                                                    className="text-surface-500 hover:text-surface-700"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(patient.id); }}
                                                className="text-surface-400 hover:text-danger-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-surface-200 bg-white px-4 py-3 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-surface-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of <span className="font-medium">{filteredPatients.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-surface-300 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:bg-surface-100 disabled:text-surface-300"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                ? 'z-10 border-primary-500 bg-primary-50 text-primary-700'
                                                : 'bg-white border-surface-300 text-surface-500 hover:bg-surface-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-surface-300 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:bg-surface-100 disabled:text-surface-300"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Patient Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Add New Patient' : 'Edit Patient'}
            >
                <PatientForm
                    mode={modalMode}
                    initialData={selectedPatient}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    token={token}
                />
            </Modal>
        </div>
    );
}

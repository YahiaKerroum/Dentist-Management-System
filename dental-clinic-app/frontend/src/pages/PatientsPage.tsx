import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/patient.service';
import { getUserPermissions } from '../services/user.service';
import { getAllAppointments } from '../services/appointment.service';
import { getTreatments } from '../services/treatment.service';
import { getAllPayments } from '../services/payment.service';
import { AppointmentStatus } from '../types/appointment';
import type { Appointment } from '../types/appointment';
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
    User as UserIcon,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Download,
    X,
    SlidersHorizontal,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { getAvatarColor } from '../utils/avatarColor';

interface PatientsPageProps {
    token: string;
    initialPatientId?: string;
    onPatientOpened?: () => void;
}

type SortKey = 'name' | 'dentist' | 'nextAppt' | 'balance' | 'lastVisit' | 'status';

const UPCOMING_STATUSES = [AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS];
// A patient counts as "active" if they have an upcoming visit or were seen within ~18 months.
const ACTIVE_WINDOW_MS = 1000 * 60 * 60 * 24 * 30 * 18;

const currencyShort = (n: number) => `$${Math.round(n).toLocaleString()}`;
const shortDate = (iso: string | number) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const titleCaseType = (t: string | null) =>
    t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Visit';

function SortHeader({
    label,
    k,
    sortKey,
    sortDir,
    onSort,
    align,
    className,
}: {
    label: string;
    k: SortKey;
    sortKey: SortKey;
    sortDir: 'asc' | 'desc';
    onSort: (k: SortKey) => void;
    align?: 'right';
    className?: string;
}) {
    const active = sortKey === k;
    return (
        <th className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-400 ${align === 'right' ? 'text-right' : ''} ${className ?? ''}`}>
            <button
                onClick={() => onSort(k)}
                className={`inline-flex items-center gap-1 transition-colors hover:text-surface-700 ${align === 'right' ? 'flex-row-reverse' : ''} ${active ? 'text-surface-700' : ''}`}
            >
                {label}
                {active ? (
                    sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                )}
            </button>
        </th>
    );
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Per-patient signal (next appt, balance, last visit, derived status) is aggregated
    // client-side from these cached datasets — the same billed-minus-paid method the
    // dashboard uses. Enabled once patients load so the list paints first.
    const { data: appointments = [], isLoading: apptLoading } = useQuery({
        queryKey: queryKeys.appointments(),
        queryFn: () => getAllAppointments(),
    });
    const { data: treatments = [], isLoading: treatmentsLoading } = useQuery({
        queryKey: queryKeys.treatments(),
        queryFn: async () => (await getTreatments(token)).data,
    });
    const { data: payments = [], isLoading: paymentsLoading } = useQuery({
        queryKey: queryKeys.payments,
        queryFn: getAllPayments,
    });
    const signalsLoading = apptLoading || treatmentsLoading || paymentsLoading;

    const signals = useMemo(() => {
        const now = Date.now();
        const nextAppt = new Map<string, Appointment>();
        const lastVisit = new Map<string, number>();
        for (const a of appointments as Appointment[]) {
            const t = new Date(a.dateOfTreatment).getTime();
            if (UPCOMING_STATUSES.includes(a.status) && t >= now) {
                const cur = nextAppt.get(a.patientId);
                if (!cur || t < new Date(cur.dateOfTreatment).getTime()) nextAppt.set(a.patientId, a);
            }
            if (a.status === AppointmentStatus.COMPLETED && t <= now) {
                const cur = lastVisit.get(a.patientId);
                if (cur === undefined || t > cur) lastVisit.set(a.patientId, t);
            }
        }
        const balance = new Map<string, number>();
        for (const tr of treatments) {
            const c = Number(tr.cost ?? 0) || 0;
            if (c) balance.set(tr.patientId, (balance.get(tr.patientId) ?? 0) + c);
        }
        for (const p of payments) {
            const amt = Number(p.amount ?? 0) || 0;
            if (amt) balance.set(p.patientId, (balance.get(p.patientId) ?? 0) - amt);
        }
        return { nextAppt, lastVisit, balance, now };
    }, [appointments, treatments, payments]);

    const isActive = (id: string) => {
        if (signals.nextAppt.has(id)) return true;
        const last = signals.lastVisit.get(id);
        return last !== undefined && signals.now - last <= ACTIVE_WINDOW_MS;
    };
    const patientBalance = (id: string) => signals.balance.get(id) ?? 0;

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
        setSortKey('name');
        setSortDir('asc');
        setCurrentPage(1);
    };

    const hasActiveFilters = () => {
        return searchTerm !== '' ||
               statusFilter !== 'all' ||
               ageFilter !== 'all' ||
               dateFilter !== 'all';
    };

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            // Money/recency columns are most useful high-to-low first.
            setSortDir(key === 'balance' || key === 'lastVisit' || key === 'nextAppt' ? 'desc' : 'asc');
        }
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
    // Everything except the status tab — so the tab counts reflect the current search/age/date scope.
    const scopedPatients = patients.filter(patient => {
        // Search filter
        const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));

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

        return matchesSearch && matchesAge && matchesDate;
    });

    // Status tab counts (over the scoped set, before the status tab is applied)
    const statusCounts = {
        all: scopedPatients.length,
        active: scopedPatients.filter((p) => isActive(p.id)).length,
        inactive: scopedPatients.filter((p) => !isActive(p.id)).length,
    };

    const dentistName = (p: Patient) =>
        p.primaryDentist ? `${p.primaryDentist.user.lastName} ${p.primaryDentist.user.firstName}` : '';

    const statusStatusApplied = scopedPatients.filter((p) =>
        statusFilter === 'all' ? true : statusFilter === 'active' ? isActive(p.id) : !isActive(p.id)
    );

    // Apply sorting via the active column
    const dir = sortDir === 'asc' ? 1 : -1;
    const filteredPatients = [...statusStatusApplied].sort((a, b) => {
        switch (sortKey) {
            case 'name':
                return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            case 'dentist':
                return dir * dentistName(a).localeCompare(dentistName(b));
            case 'balance':
                return dir * (patientBalance(a.id) - patientBalance(b.id));
            case 'nextAppt': {
                const av = signals.nextAppt.get(a.id) ? new Date(signals.nextAppt.get(a.id)!.dateOfTreatment).getTime() : (sortDir === 'asc' ? Infinity : -Infinity);
                const bv = signals.nextAppt.get(b.id) ? new Date(signals.nextAppt.get(b.id)!.dateOfTreatment).getTime() : (sortDir === 'asc' ? Infinity : -Infinity);
                return dir * (av - bv);
            }
            case 'lastVisit':
                return dir * ((signals.lastVisit.get(a.id) ?? 0) - (signals.lastVisit.get(b.id) ?? 0));
            case 'status':
                return dir * (Number(isActive(a.id)) - Number(isActive(b.id)));
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

    if (loading) {
        return (
            <div className="mx-auto min-h-full max-w-7xl p-8">
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
                <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
                    <Skeleton className="h-10 w-full" />
                    <div className="divide-y divide-surface-100">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-40" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
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
        <div className="mx-auto min-h-full max-w-7xl p-8">
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
                    {/* Status tabs with live counts */}
                    <div className="inline-flex rounded-md border border-surface-200 bg-surface-100 p-0.5">
                        {([['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']] as const).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                    statusFilter === value
                                        ? 'bg-white text-surface-900 shadow-xs'
                                        : 'text-surface-500 hover:text-surface-700'
                                }`}
                            >
                                {label}
                                <span className={`tabular-nums ${statusFilter === value ? 'text-surface-400' : 'text-surface-300'}`}>
                                    {statusCounts[value]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                    ageFilter !== 'all' || dateFilter !== 'all'
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
                <div className="rounded-xl border border-surface-200 bg-white px-6 py-16 text-center">
                    <EmptyState
                        icon={UserIcon}
                        title="No patients found"
                        description={hasActiveFilters() ? 'No patients match your current filters.' : 'Add your first patient to get started.'}
                        action={
                            hasActiveFilters() ? (
                                <Button variant="secondary" onClick={handleClearFilters}>Clear filters</Button>
                            ) : (
                                <Button onClick={handleAddPatient}><Plus className="h-4 w-4" /> Add New Patient</Button>
                            )
                        }
                    />
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="sticky top-0 z-10 bg-surface-50/95 backdrop-blur">
                                    <tr className="border-b border-surface-200 text-left">
                                        <SortHeader label="Patient" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="pl-5" />
                                        <SortHeader label="Dentist" k="dentist" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                        <SortHeader label="Next appt" k="nextAppt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                        <SortHeader label="Balance" k="balance" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
                                        <SortHeader label="Last visit" k="lastVisit" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                        <SortHeader label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                        <th className="w-20 px-3 py-2.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {paginatedPatients.map((patient) => {
                                        const dentistSeed = patient.primaryDentist
                                            ? `${patient.primaryDentist.user.firstName} ${patient.primaryDentist.user.lastName}`
                                            : null;
                                        const avatar = dentistSeed
                                            ? getAvatarColor(dentistSeed)
                                            : { bg: 'bg-surface-100', text: 'text-surface-500' };
                                        const age = calculateAge(patient.dateOfBirth);
                                        const initials = `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase();
                                        const next = signals.nextAppt.get(patient.id);
                                        const last = signals.lastVisit.get(patient.id);
                                        const balance = patientBalance(patient.id);
                                        const active = isActive(patient.id);
                                        return (
                                            <tr
                                                key={patient.id}
                                                onClick={() => handleViewPatientDetails(patient)}
                                                className="group cursor-pointer transition-colors hover:bg-surface-50"
                                            >
                                                {/* Patient */}
                                                <td className="py-2.5 pl-5 pr-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-xs font-semibold ring-1 ring-inset ring-black/5 ${avatar.bg} ${avatar.text}`}>
                                                            {initials}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-surface-900">
                                                                {patient.firstName} {patient.lastName}
                                                            </p>
                                                            <p className="text-xs text-surface-400 tabular-nums">
                                                                {age !== null ? `${age} yrs` : '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Dentist */}
                                                <td className="px-3 py-2.5">
                                                    {patient.primaryDentist ? (
                                                        <span className="text-sm text-surface-700">
                                                            Dr. {patient.primaryDentist.user.lastName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-surface-300">Unassigned</span>
                                                    )}
                                                </td>

                                                {/* Next appointment */}
                                                <td className="px-3 py-2.5">
                                                    {signalsLoading ? (
                                                        <Skeleton className="h-4 w-20" />
                                                    ) : next ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-primary-700 tabular-nums">{shortDate(next.dateOfTreatment)}</p>
                                                            <p className="text-xs text-surface-400">{titleCaseType(next.typeOfTreatment)}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-surface-300">None scheduled</span>
                                                    )}
                                                </td>

                                                {/* Balance */}
                                                <td className="px-3 py-2.5 text-right">
                                                    {signalsLoading ? (
                                                        <Skeleton className="ml-auto h-4 w-14" />
                                                    ) : balance > 0.5 ? (
                                                        <span className="font-semibold text-danger-600 tabular-nums">{currencyShort(balance)}</span>
                                                    ) : (
                                                        <span className="text-surface-300 tabular-nums">$0</span>
                                                    )}
                                                </td>

                                                {/* Last visit */}
                                                <td className="px-3 py-2.5">
                                                    {signalsLoading ? (
                                                        <Skeleton className="h-4 w-20" />
                                                    ) : last ? (
                                                        <span className="text-sm text-surface-600 tabular-nums">{shortDate(last)}</span>
                                                    ) : (
                                                        <span className="text-sm text-surface-300">Never</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-2.5">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-success-50 text-success-700' : 'bg-surface-100 text-surface-500'}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success-500' : 'bg-surface-400'}`} />
                                                        {active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center justify-end gap-0.5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                                                        {deleteConfirmId === patient.id ? (
                                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                                <button onClick={() => handleDeletePatient(patient.id)} className="rounded-md bg-danger-600 px-2 py-1 text-xs font-medium text-white hover:bg-danger-700">Delete</button>
                                                                <button onClick={() => setDeleteConfirmId(null)} className="rounded-md px-1.5 py-1 text-xs font-medium text-surface-500 hover:bg-surface-100">Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {patient.phone && (
                                                                    <a
                                                                        href={`tel:${patient.phone}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        title={`Call ${patient.phone}`}
                                                                        className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600"
                                                                    >
                                                                        <Phone className="h-4 w-4" />
                                                                    </a>
                                                                )}
                                                                <button onClick={(e) => { e.stopPropagation(); handleEditPatient(patient); }} title="Edit patient" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600">
                                                                    <Edit className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(patient.id); }} title="Delete patient" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between px-1">
                            <p className="text-sm text-surface-500">
                                Showing <span className="font-medium tabular-nums text-surface-700">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of <span className="font-medium tabular-nums text-surface-700">{filteredPatients.length}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-200 text-surface-500 transition-colors hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="px-1 text-sm text-surface-600 tabular-nums">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-200 text-surface-500 transition-colors hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
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

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Filter,
    Calendar,
    Stethoscope,
    CheckCircle2,
    Clock,
    AlertCircle,
    Edit2,
    Trash2,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
} from 'lucide-react';
import { getTreatments, deleteTreatment, updateTreatmentStatus } from '../services/treatment.service';
import { getPatients } from '../services/patient.service';
import { getAllStaff } from '../services/user.service';
import {
    Treatment,
    TreatmentType,
    TreatmentStatus,
    TREATMENT_TYPE_CONFIG,
    TREATMENT_STATUS_ORDER,
    TREATMENT_STATUS_CONFIG,
} from '../types/treatment';
import { TreatmentForm } from '../components/treatments/TreatmentForm';
import { TreatmentDetailPanel } from '../components/treatments/TreatmentDetailPanel';
import { TreatmentBoard } from '../components/treatments/TreatmentBoard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { toast } from '../components/ui/Toaster';
import { getAvatarColor } from '../utils/avatarColor';
import { queryKeys } from '../lib/queryKeys';

interface TreatmentsPageProps {
    token: string;
    onNavigateToPatient?: (patientId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function TreatmentsPage({ token, onNavigateToPatient }: TreatmentsPageProps) {
    const queryClient = useQueryClient();
    const {
        data: treatments = [],
        isLoading: loading,
        error: treatmentsError,
    } = useQuery({
        queryKey: queryKeys.treatments(),
        queryFn: async () => (await getTreatments(token)).data,
    });
    const { data: patients = [] } = useQuery({
        queryKey: queryKeys.patients,
        queryFn: async () => (await getPatients(token)).data,
    });
    const { data: doctors = [] } = useQuery({
        queryKey: ['staff', 'DOCTOR'],
        queryFn: async () => (await getAllStaff(token, { role: 'DOCTOR' })).data,
    });
    const [error, setError] = useState('');

    const setTreatmentsCache = (updater: (prev: Treatment[]) => Treatment[]) =>
        queryClient.setQueryData<Treatment[]>(queryKeys.treatments(), (prev = []) => updater(prev));

    const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TreatmentType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'all'>('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination (table view only)
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailTreatment, setDetailTreatment] = useState<Treatment | null>(null);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        if (treatmentsError) setError((treatmentsError as Error).message || 'Failed to load data');
    }, [treatmentsError]);

    const filteredTreatments = useMemo(() => {
        let result = [...treatments];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                (t) =>
                    t.patient.firstName.toLowerCase().includes(search) ||
                    t.patient.lastName.toLowerCase().includes(search) ||
                    t.doctor.user.firstName.toLowerCase().includes(search) ||
                    t.doctor.user.lastName.toLowerCase().includes(search) ||
                    t.typeOfTreatment.toLowerCase().includes(search) ||
                    t.notes?.toLowerCase().includes(search) ||
                    t.procedure?.toLowerCase().includes(search)
            );
        }

        if (typeFilter !== 'all') {
            result = result.filter((t) => t.typeOfTreatment === typeFilter);
        }

        if (statusFilter !== 'all') {
            result = result.filter((t) => t.status === statusFilter);
        }

        if (doctorFilter !== 'all') {
            result = result.filter((t) => t.doctorId === doctorFilter);
        }

        result.sort((a, b) => new Date(b.dateOfTreatment).getTime() - new Date(a.dateOfTreatment).getTime());

        return result;
    }, [treatments, searchTerm, typeFilter, statusFilter, doctorFilter]);

    const totalPages = Math.ceil(filteredTreatments.length / ITEMS_PER_PAGE);
    const paginatedTreatments = filteredTreatments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleAddTreatment = () => {
        setSelectedTreatment(null);
        setIsFormModalOpen(true);
    };

    const handleEditTreatment = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setIsFormModalOpen(true);
    };

    const handleViewTreatment = (treatment: Treatment) => {
        setDetailTreatment(treatment);
        setIsDetailOpen(true);
    };

    const handleDeleteTreatment = async (id: string) => {
        try {
            await deleteTreatment(id, token);
            setTreatmentsCache((prev) => prev.filter((t) => t.id !== id));
            setDeleteConfirmId(null);
            toast.success('Treatment deleted successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete treatment');
        }
    };

    const handleDropTreatment = async (treatmentId: string, status: TreatmentStatus) => {
        const current = treatments.find((t) => t.id === treatmentId);
        if (!current || current.status === status) return;

        // Optimistic update
        setTreatmentsCache((prev) => prev.map((t) => (t.id === treatmentId ? { ...t, status } : t)));

        try {
            await updateTreatmentStatus(treatmentId, status, token);
        } catch (err: any) {
            // Revert on failure
            setTreatmentsCache((prev) => prev.map((t) => (t.id === treatmentId ? current : t)));
            toast.error(err.message || 'Failed to update treatment status');
        }
    };

    const handleFormSuccess = (treatment: Treatment) => {
        setTreatmentsCache((prev) => {
            const exists = prev.some((t) => t.id === treatment.id);
            return exists ? prev.map((t) => (t.id === treatment.id ? treatment : t)) : [treatment, ...prev];
        });
        toast.success(selectedTreatment ? 'Treatment updated successfully' : 'Treatment created successfully');
        setIsFormModalOpen(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setDoctorFilter('all');
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || doctorFilter !== 'all' || !!searchTerm;

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const terminal: TreatmentStatus[] = ['COMPLETED', 'BILLED', 'ARCHIVED'];

        return {
            total: treatments.length,
            completed: treatments.filter((t) => terminal.includes(t.status)).length,
            active: treatments.filter((t) => !terminal.includes(t.status)).length,
            thisMonth: treatments.filter((t) => new Date(t.dateOfTreatment) >= thisMonth).length,
            followUp: treatments.filter((t) => t.followUpRequired && !terminal.includes(t.status)).length,
        };
    }, [treatments]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
                    <p className="text-surface-500">Loading treatments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-surface-50 p-8">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-semibold tracking-tight text-surface-900">Treatment Records</h1>
                        <p className="mt-0.5 text-sm text-surface-500">Manage and track all dental procedures</p>
                    </div>
                </div>
                <Button onClick={handleAddTreatment}>
                    <Plus className="h-4 w-4" />
                    New Treatment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-lg border border-surface-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                            <Stethoscope className="h-5 w-5 text-surface-600" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-surface-900 tabular-nums">{stats.total}</p>
                            <p className="text-xs text-surface-500">Total Records</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-success-100 bg-success-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                            <CheckCircle2 className="h-5 w-5 text-success-700" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-success-700 tabular-nums">{stats.completed}</p>
                            <p className="text-xs text-success-700">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-warning-100 bg-warning-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                            <Clock className="h-5 w-5 text-warning-700" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-warning-700 tabular-nums">{stats.active}</p>
                            <p className="text-xs text-warning-700">Active</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-info-100 bg-info-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-100">
                            <Calendar className="h-5 w-5 text-info-700" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-info-700 tabular-nums">{stats.thisMonth}</p>
                            <p className="text-xs text-info-700">This Month</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-danger-100 bg-danger-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100">
                            <AlertCircle className="h-5 w-5 text-danger-700" />
                        </div>
                        <div>
                            <p className="font-display text-2xl font-semibold tracking-tight text-danger-700 tabular-nums">{stats.followUp}</p>
                            <p className="text-xs text-danger-700">Need Follow-up</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 p-4 text-danger-700">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Toolbar */}
            <div className="mb-6 rounded-lg border border-surface-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[240px] flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, doctor, treatment type, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-surface-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'border-primary-300 bg-primary-50 text-primary-700'
                                : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                        }`}
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-primary-600 text-[10px] font-bold leading-4 text-white">!</span>}
                    </button>

                    <div className="inline-flex rounded-md border border-surface-200 bg-surface-100 p-0.5">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'board' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Board
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                                viewMode === 'table' ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            <ListIcon className="h-3.5 w-3.5" />
                            Table
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 border-t border-surface-100 pt-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Treatment Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as TreatmentType | 'all')}
                                    className="w-full rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                >
                                    <option value="all">All Types</option>
                                    {Object.entries(TREATMENT_TYPE_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as TreatmentStatus | 'all')}
                                    className="w-full rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                >
                                    <option value="all">All Status</option>
                                    {TREATMENT_STATUS_ORDER.map((status) => (
                                        <option key={status} value={status}>
                                            {TREATMENT_STATUS_CONFIG[status].label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-400">Doctor</label>
                                <select
                                    value={doctorFilter}
                                    onChange={(e) => setDoctorFilter(e.target.value)}
                                    className="w-full rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
                                >
                                    <option value="all">All Doctors</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.doctorProfile?.id || ''}>
                                            Dr. {doc.firstName} {doc.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-3 flex justify-end">
                                <button onClick={clearFilters} className="text-sm font-medium text-primary-700 hover:text-primary-800">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Board View */}
            {viewMode === 'board' &&
                (filteredTreatments.length === 0 ? (
                    <EmptyState icon={Stethoscope} title="No treatments found" description="Add your first treatment record to get started" />
                ) : (
                    <TreatmentBoard treatments={filteredTreatments} onDropTreatment={handleDropTreatment} onSelectTreatment={handleViewTreatment} />
                ))}

            {/* Table View */}
            {viewMode === 'table' && (
                <>
                    {paginatedTreatments.length === 0 ? (
                        <EmptyState icon={Stethoscope} title="No treatments found" description="Try adjusting your filters" />
                    ) : (
                        <>
                            <div className="hidden px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-surface-400 lg:grid lg:grid-cols-[1.1fr_1.8fr_1.4fr_1fr_1fr_auto] lg:gap-4">
                                <span>Date</span>
                                <span>Patient</span>
                                <span>Doctor</span>
                                <span>Type</span>
                                <span>Status</span>
                                <span className="text-right">Actions</span>
                            </div>

                            <div className="space-y-2">
                                {paginatedTreatments.map((treatment) => {
                                    const avatar = getAvatarColor(`${treatment.patient.firstName}${treatment.patient.lastName}`);
                                    const typeConfig = TREATMENT_TYPE_CONFIG[treatment.typeOfTreatment];
                                    const statusConfig = TREATMENT_STATUS_CONFIG[treatment.status];
                                    return (
                                        <div
                                            key={treatment.id}
                                            onClick={() => handleViewTreatment(treatment)}
                                            className="relative grid cursor-pointer grid-cols-1 gap-3 overflow-hidden rounded-lg border border-surface-200 bg-white p-4 pl-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md lg:grid-cols-[1.1fr_1.8fr_1.4fr_1fr_1fr_auto] lg:items-center lg:gap-4 lg:p-3.5 lg:pl-5"
                                        >
                                            <div className={`absolute inset-y-0 left-0 w-1.5 ${avatar.stripe}`} />

                                            <div className="flex items-center text-sm text-surface-600">
                                                <Calendar className="mr-2 h-3.5 w-3.5 shrink-0 text-surface-400" />
                                                {formatDate(treatment.dateOfTreatment)}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatar.bg} ${avatar.text}`}>
                                                    {treatment.patient.firstName[0]}
                                                    {treatment.patient.lastName[0]}
                                                </div>
                                                <p className="truncate text-sm font-semibold text-surface-900">
                                                    {treatment.patient.firstName} {treatment.patient.lastName}
                                                </p>
                                            </div>

                                            <div className="truncate pl-12 text-sm text-surface-600 lg:pl-0">
                                                Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}
                                            </div>

                                            <div className="pl-12 lg:pl-0">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                    style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                                                >
                                                    {typeConfig.label}
                                                </span>
                                            </div>

                                            <div className="pl-12 lg:pl-0">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                    style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                                                >
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            <div className="flex gap-3 pl-12 text-sm font-medium lg:justify-end lg:pl-0" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleViewTreatment(treatment)} className="text-surface-400 transition-colors hover:text-surface-700" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleEditTreatment(treatment)} className="text-primary-600 transition-colors hover:text-primary-700" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                {deleteConfirmId === treatment.id ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleDeleteTreatment(treatment.id)}
                                                            className="rounded bg-danger-600 px-1.5 py-0.5 text-[11px] text-white hover:bg-danger-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className="text-surface-500 hover:text-surface-700">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(treatment.id)}
                                                        className="text-surface-400 transition-colors hover:text-danger-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-surface-500">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredTreatments.length)} of{' '}
                                        {filteredTreatments.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedTreatment ? 'Edit Treatment' : 'New Treatment Record'}
            >
                <TreatmentForm
                    onCancel={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                    treatment={selectedTreatment}
                    patients={patients}
                    doctors={doctors}
                    token={token}
                />
            </Modal>

            {isDetailOpen && detailTreatment && (
                <TreatmentDetailPanel
                    treatment={detailTreatment}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setDetailTreatment(null);
                    }}
                    onEdit={() => {
                        setSelectedTreatment(detailTreatment);
                        setIsDetailOpen(false);
                        setIsFormModalOpen(true);
                    }}
                    onNavigateToPatient={onNavigateToPatient}
                />
            )}
        </div>
    );
}

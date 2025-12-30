import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Plus,
    Filter,
    Calendar,
    ChevronDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    Stethoscope,
    User,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    X,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getTreatments, deleteTreatment, markTreatmentCompleted } from '../services/treatment.service';
import { getPatients } from '../services/patient.service';
import { getAllStaff } from '../services/user.service';
import { Treatment, TreatmentType, TREATMENT_TYPE_CONFIG } from '../types/treatment';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';
import { TreatmentFormModal } from '../components/treatments/TreatmentFormModal';
import { TreatmentDetailPanel } from '../components/treatments/TreatmentDetailPanel';

// Helper component for treatment type icon
const TreatmentTypeIcon = ({ type, size = 'sm' }: { type: TreatmentType; size?: 'sm' | 'md' | 'lg' }) => {
    const config = TREATMENT_TYPE_CONFIG[type];
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    return (
        <img 
            src={config.iconPath} 
            alt={config.label}
            className={`${sizeClasses[size]} object-contain`}
        />
    );
};

interface TreatmentsPageProps {
    token: string;
    onNavigateToPatient?: (patientId: string) => void;
}

type SortField = 'date' | 'patient' | 'doctor' | 'type' | 'status';
type SortOrder = 'asc' | 'desc';

export function TreatmentsPage({ token, onNavigateToPatient }: TreatmentsPageProps) {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TreatmentType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [showFilters, setShowFilters] = useState(false);

    // Sorting
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailTreatment, setDetailTreatment] = useState<Treatment | null>(null);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Dropdown menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [treatmentsRes, patientsRes, staffRes] = await Promise.all([
                getTreatments(token),
                getPatients(token),
                getAllStaff(token, { role: 'DOCTOR' }),
            ]);
            setTreatments(treatmentsRes.data);
            setPatients(patientsRes.data);
            setDoctors(staffRes.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredTreatments = useMemo(() => {
        let result = [...treatments];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(t =>
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
            result = result.filter(t => t.typeOfTreatment === typeFilter);
        }

        if (statusFilter !== 'all') {
            result = result.filter(t =>
                statusFilter === 'completed' ? t.completed : !t.completed
            );
        }

        if (doctorFilter !== 'all') {
            result = result.filter(t => t.doctorId === doctorFilter);
        }

        if (dateRange.from) {
            result = result.filter(t => new Date(t.dateOfTreatment) >= new Date(dateRange.from));
        }
        if (dateRange.to) {
            result = result.filter(t => new Date(t.dateOfTreatment) <= new Date(dateRange.to));
        }

        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.dateOfTreatment).getTime() - new Date(b.dateOfTreatment).getTime();
                    break;
                case 'patient':
                    comparison = `${a.patient.lastName} ${a.patient.firstName}`.localeCompare(
                        `${b.patient.lastName} ${b.patient.firstName}`
                    );
                    break;
                case 'doctor':
                    comparison = `${a.doctor.user.lastName} ${a.doctor.user.firstName}`.localeCompare(
                        `${b.doctor.user.lastName} ${b.doctor.user.firstName}`
                    );
                    break;
                case 'type':
                    comparison = a.typeOfTreatment.localeCompare(b.typeOfTreatment);
                    break;
                case 'status':
                    comparison = Number(a.completed) - Number(b.completed);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [treatments, searchTerm, typeFilter, statusFilter, doctorFilter, dateRange, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
    const paginatedTreatments = filteredTreatments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleAddTreatment = () => {
        setSelectedTreatment(null);
        setIsFormModalOpen(true);
    };

    const handleEditTreatment = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setIsFormModalOpen(true);
        setOpenMenuId(null);
    };

    const handleViewTreatment = (treatment: Treatment) => {
        setDetailTreatment(treatment);
        setIsDetailOpen(true);
        setOpenMenuId(null);
    };

    const handleDeleteTreatment = async (id: string) => {
        try {
            await deleteTreatment(id, token);
            setTreatments(prev => prev.filter(t => t.id !== id));
            setDeleteConfirmId(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleMarkCompleted = async (treatment: Treatment) => {
        try {
            const response = await markTreatmentCompleted(treatment.id, token);
            setTreatments(prev =>
                prev.map(t => (t.id === treatment.id ? response.data : t))
            );
            setOpenMenuId(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleFormSuccess = (treatment: Treatment) => {
        if (selectedTreatment) {
            setTreatments(prev =>
                prev.map(t => (t.id === treatment.id ? treatment : t))
            );
        } else {
            setTreatments(prev => [treatment, ...prev]);
        }
        setIsFormModalOpen(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setDoctorFilter('all');
        setDateRange({ from: '', to: '' });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || doctorFilter !== 'all' || dateRange.from || dateRange.to;

    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
            total: treatments.length,
            completed: treatments.filter(t => t.completed).length,
            pending: treatments.filter(t => !t.completed).length,
            thisMonth: treatments.filter(t => new Date(t.dateOfTreatment) >= thisMonth).length,
            followUp: treatments.filter(t => t.followUpRequired && !t.completed).length,
        };
    }, [treatments]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: '#D5EDE8', borderTopColor: '#3DBEA3' }} />
                    <p className="text-gray-500">Loading treatments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 via-white to-[#E8F5F0]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #3DBEA3, #2FA88E)' }}>
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Treatment Records</h1>
                            <p className="text-gray-500 text-sm">Manage and track all dental procedures</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddTreatment}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(to right, #3DBEA3, #2FA88E)' }}
                    >
                        <Plus className="w-5 h-5" />
                        New Treatment
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                                <p className="text-xs text-slate-500">Total Records</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
                                <p className="text-xs text-emerald-600">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
                                <p className="text-xs text-amber-600">In Progress</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl p-4 border" style={{ background: 'linear-gradient(to bottom right, #E8F5F0, #D5EDE8)', borderColor: '#D5EDE8' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D5EDE8' }}>
                                <Calendar className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: '#1C6B5A' }}>{stats.thisMonth}</p>
                                <p className="text-xs" style={{ color: '#3DBEA3' }}>This Month</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-200 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-rose-800">{stats.followUp}</p>
                                <p className="text-xs text-rose-600">Need Follow-up</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-4 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by patient, doctor, treatment type, or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3] transition-all"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type</label>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value as TreatmentType | 'all')}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/20 focus:border-[#3DBEA3]"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'pending')}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">In Progress</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                    <select
                                        value={doctorFilter}
                                        onChange={(e) => setDoctorFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.from}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.to}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Treatments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => handleSort('date')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            Date
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => handleSort('patient')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            Patient
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => handleSort('doctor')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            Doctor
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => handleSort('type')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            Treatment
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Teeth
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            Status
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedTreatments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Stethoscope className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No treatments found</p>
                                                <p className="text-gray-400 text-sm">
                                                    {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first treatment record'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTreatments.map((treatment) => {
                                        const typeConfig = TREATMENT_TYPE_CONFIG[treatment.typeOfTreatment];
                                        return (
                                            <tr
                                                key={treatment.id}
                                                className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                                                onClick={() => handleViewTreatment(treatment)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {formatDate(treatment.dateOfTreatment)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                                                            {treatment.patient.firstName[0]}{treatment.patient.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {treatment.patient.firstName} {treatment.patient.lastName}
                                                            </p>
                                                            {treatment.patient.phone && (
                                                                <p className="text-xs text-gray-500">{treatment.patient.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm text-gray-700">
                                                            Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                                                        style={{
                                                            backgroundColor: typeConfig.bgColor,
                                                            color: typeConfig.color,
                                                        }}
                                                    >
                                                        <TreatmentTypeIcon type={treatment.typeOfTreatment} size="sm" />
                                                        {typeConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {treatment.teethInvolved.length > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            {treatment.teethInvolved.slice(0, 3).map((tooth) => (
                                                                <span
                                                                    key={tooth}
                                                                    className="w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-600 flex items-center justify-center"
                                                                >
                                                                    {tooth}
                                                                </span>
                                                            ))}
                                                            {treatment.teethInvolved.length > 3 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{treatment.teethInvolved.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {treatment.completed ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                In Progress
                                                            </span>
                                                        )}
                                                        {treatment.followUpRequired && (
                                                            <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center" title="Follow-up required">
                                                                <AlertCircle className="w-3 h-3" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === treatment.id ? null : treatment.id);
                                                            }}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                        {openMenuId === treatment.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                                                <button
                                                                    onClick={() => handleViewTreatment(treatment)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditTreatment(treatment)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                    Edit Treatment
                                                                </button>
                                                                {!treatment.completed && (
                                                                    <button
                                                                        onClick={() => handleMarkCompleted(treatment)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Mark Completed
                                                                    </button>
                                                                )}
                                                                <hr className="my-1 border-gray-100" />
                                                                <button
                                                                    onClick={() => {
                                                                        setDeleteConfirmId(treatment.id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, filteredTreatments.length)} of{' '}
                                {filteredTreatments.length} treatments
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                page === currentPage
                                                    ? 'bg-teal-500 text-white'
                                                    : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isFormModalOpen && (
                <TreatmentFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSuccess={handleFormSuccess}
                    treatment={selectedTreatment}
                    patients={patients}
                    doctors={doctors}
                    token={token}
                />
            )}

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

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Treatment</h3>
                                <p className="text-gray-500 text-sm">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this treatment record? All associated data will be permanently removed.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteTreatment(deleteConfirmId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete Treatment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


import { useState, useEffect } from 'react';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/patient.service';
import { Patient, CreatePatientDTO } from '../types/patient';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PatientForm } from '../components/patients/PatientForm';
import { PatientDetailPanel } from './PatientDetailPage';
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
    ChevronRight
} from 'lucide-react';

interface PatientsPageProps {
    token: string;
}

export function PatientsPage({ token }: PatientsPageProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Detail panel state - now tracks viewing detail page
    const [viewingDetail, setViewingDetail] = useState(false);
    const [detailPatient, setDetailPatient] = useState<Patient | null>(null);

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        fetchPatients();
    }, [token]);

    const fetchPatients = async () => {
        try {
            const response = await getPatients(token);
            setPatients(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

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

    const handleFormSubmit = async (data: CreatePatientDTO) => {
        try {
            if (modalMode === 'add') {
                const response = await createPatient(data, token);
                setPatients(prev => [...prev, response.data]);
            } else {
                if (!selectedPatient) {
                    setError('No patient selected for update');
                    return;
                }
                const response = await updatePatient(selectedPatient.id, data, token);
                setPatients(prev =>
                    prev.map(p => p.id === response.data.id ? response.data : p)
                );
            }
            setIsModalOpen(false);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to save patient');
        }
    };

    const handleDeletePatient = async (id: string) => {
        try {
            await deletePatient(id, token);
            setPatients(prev => prev.filter(p => p.id !== id));
            setDeleteConfirmId(null);
            setError('');
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
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show detail page if viewing patient
    if (viewingDetail && detailPatient) {
        return (
            <div className="bg-gray-50 min-h-full p-8">
                <PatientDetailPanel
                    patient={detailPatient}
                    token={token}
                    userRole="DOCTOR"
                    currentUserId="current-user-id"
                    onClose={() => setViewingDetail(false)}
                />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-500 mt-1">Manage your patient records and history</p>
                </div>
                <Button onClick={handleAddPatient} className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-sm font-medium hover:text-red-800">Dismiss</button>
                </div>
            )}

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Age Filter */}
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={ageFilter}
                        onChange={(e) => setAgeFilter(e.target.value)}
                    >
                        <option value="all">All Ages</option>
                        <option value="children">Children (0-12)</option>
                        <option value="teens">Teens (13-17)</option>
                        <option value="adults">Adults (18-64)</option>
                        <option value="seniors">Seniors (65+)</option>
                    </select>

                    {/* Date Filter */}
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 90 Days</option>
                    </select>

                    {/* Sort By */}
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="date-newest">Newest First</option>
                        <option value="date-oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date of Birth
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No patients found</p>
                                            <p className="text-sm">Try adjusting your search terms or add a new patient.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewPatientDetails(patient)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                                                {(patient.firstName?.[0] ?? '')}{(patient.lastName?.[0] ?? '')}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                                                    <div className="text-xs text-gray-500">ID: #{patient.id ? patient.id.slice(0, 8) : ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                                    {patient.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                    {patient.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleEditPatient(patient)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {deleteConfirmId === patient.id ? (
                                                    <div className="flex items-center gap-2 animate-fadeIn">
                                                        <button
                                                            onClick={() => handleDeletePatient(patient.id)}
                                                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(patient.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredPatients.length > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of <span className="font-medium">{filteredPatients.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

import { useState, useEffect } from 'react';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Treatment } from '../types/treatment';
import { getDocumentsByPatientId, deleteDocument, Document, uploadDocument } from '../services/document.service';
import { getTreatments } from '../services/treatment.service';
import {
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  Upload,
  ExternalLink,
  Activity,
  Stethoscope,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface PatientDetailPanelProps {
  patient: Patient;
  token: string;
  userRole?: string;
  currentUserId?: string;
  userPermissions?: string[];
  onClose: () => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

export function PatientDetailPanel({
  patient,
  token,
  userRole = '',
  currentUserId = '',
  userPermissions = [],
  onClose,
  onEdit,
  onDelete,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'treatments' | 'appointments' | 'documents'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');
  const [documentsSuccess, setDocumentsSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', type: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);
  
  // State for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  // State for treatments
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [treatmentsError, setTreatmentsError] = useState('');

  // Permission checks
  const canEditPatient = userPermissions.includes('patients.update');
  const canDeletePatient = userPermissions.includes('patients.delete');

  // Fetch documents when patient changes or when documents tab is opened
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [patient.id, activeTab]);

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError('');
    setDocumentsSuccess('');
    try {
      const response = await getDocumentsByPatientId(patient.id, token);
      setDocuments(response.data);
    } catch (err: any) {
      setDocumentsError(err.message || 'Failed to fetch documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.name || !uploadData.type || !uploadFile) {
      setDocumentsError('Please fill in all fields and select a file');
      return;
    }

    setUploading(true);
    try {
      const newDocument = await uploadDocument(
        {
          patientId: patient.id,
          name: uploadData.name,
          type: uploadData.type,
          file: uploadFile,
        },
        token
      );
      setDocuments([newDocument.data, ...documents]);
      setUploadData({ name: '', type: '' });
      setUploadFile(null);
      setShowUploadForm(false);
      setDocumentsError('');
      setDocumentsSuccess(newDocument.message || 'Document uploaded successfully');
    } catch (err: any) {
      setDocumentsError(err.message || 'Failed to upload document');
      setDocumentsSuccess('');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId, token);
      setDocuments(documents.filter(d => d.id !== docId));
      setDeleteConfirmDocId(null);
      setDocumentsError('');
      setDocumentsSuccess('Document deleted successfully');
    } catch (err: any) {
      setDocumentsError(err.message || 'Failed to delete document');
      setDocumentsSuccess('');
    }
  };

  // Mock teeth states for odontogram - REMOVED
  // const mockTeethStates: Record<number, 'healthy' | 'filled' | 'treated' | 'missing' | 'implant'> = { ... };

  // Check if current user is the primary dentist (for medical documents access)
  const isPrimaryDentist = userRole === 'DOCTOR' && patient.primaryDentistId === currentUserId;
  const canViewMedicalDocs = isPrimaryDentist;

  // Fetch appointments and treatments when component loads (for overview tab)
  useEffect(() => {
    fetchAppointments();
    fetchTreatments();
  }, [patient.id]);

  // Fetch appointments when the appointments tab is active
  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab, patient.id]);

  // Fetch treatments when the treatments tab is active
  useEffect(() => {
    if (activeTab === 'treatments') {
      fetchTreatments();
    }
  }, [activeTab, patient.id]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError('');
    
    try {
      const response = await fetch('http://localhost:4000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      const allAppointments = data.data || data;
      
      // Filter appointments for this specific patient
      const patientAppointments = allAppointments.filter(
        (apt: Appointment) => apt.patientId === patient.id
      );

      // Sort appointments by date (upcoming first, then past)
      const sortedAppointments = patientAppointments.sort((a: Appointment, b: Appointment) => {
        return new Date(a.dateOfTreatment).getTime() - new Date(b.dateOfTreatment).getTime();
      });

      setAppointments(sortedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setAppointmentsError(error.message || 'Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchTreatments = async () => {
    setLoadingTreatments(true);
    setTreatmentsError('');
    
    try {
      const response = await getTreatments(token, { patientId: patient.id });
      
      // Sort treatments by date (most recent first)
      const sortedTreatments = response.data.sort((a: Treatment, b: Treatment) => {
        return new Date(b.dateOfTreatment).getTime() - new Date(a.dateOfTreatment).getTime();
      });

      setTreatments(sortedTreatments);
    } catch (error: any) {
      console.error('Error fetching treatments:', error);
      setTreatmentsError(error.message || 'Failed to load treatments');
    } finally {
      setLoadingTreatments(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Back Button Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <button 
              onClick={onClose}
              className="mb-4 font-medium flex items-center gap-2 text-sm"
              style={{ color: '#3DBEA3' }}
            >
              ← Back to Patients
            </button>
            <h2 className="text-3xl font-bold">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Patient ID: {patient.id.slice(0, 8)}</p>
          </div>
          <div className="flex gap-2">
            {canEditPatient && onEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#3DBEA3' }}
              >
                <Edit className="w-4 h-4" />
                Edit Patient
              </button>
            )}
            {canDeletePatient && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDelete(patient)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Patient
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Patient Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Patient Information
            </h2>

            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <p className="text-xs text-gray-600 font-semibold">DATE OF BIRTH</p>
                <p className="text-sm">
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  PHONE
                </p>
                <p className="text-sm">{patient.phone || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  EMAIL
                </p>
                <p className="text-sm">{patient.email || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold">PATIENT SINCE</p>
                <p className="text-sm">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Primary Dentist */}
              <div>
                <p className="text-xs text-gray-600 font-semibold">PRIMARY DENTIST</p>
                {patient.primaryDentist ? (
                  <p className="text-sm font-medium text-blue-600">
                    Dr. {patient.primaryDentist.user.firstName} {patient.primaryDentist.user.lastName}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Not assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Info removed: everyone can view documents for now */}
        </div>

        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-[#3DBEA3] text-[#3DBEA3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'treatments'
                  ? 'border-b-2 border-[#3DBEA3] text-[#3DBEA3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-[#3DBEA3] text-[#3DBEA3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Patient Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Treatments */}
                <div className="bg-gradient-to-br from-[#3DBEA3]/10 to-[#3DBEA3]/5 rounded-xl p-5 border border-[#3DBEA3]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-[#3DBEA3]/20 rounded-lg flex items-center justify-center">
                      <Stethoscope size={20} className="text-[#3DBEA3]" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Total</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {treatments.length}
                  </h3>
                  <p className="text-sm text-gray-600">Treatments Completed</p>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar size={20} className="text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Upcoming</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {appointments.filter(a => a.status === 'SCHEDULED').length}
                  </h3>
                  <p className="text-sm text-gray-600">Appointments Scheduled</p>
                </div>

                {/* Last Visit */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Recent</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {appointments.filter(a => a.status === 'COMPLETED').length > 0
                      ? new Date(
                          Math.max(...appointments.filter(a => a.status === 'COMPLETED').map(a => new Date(a.dateOfTreatment).getTime()))
                        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </h3>
                  <p className="text-sm text-gray-600">Last Visit Date</p>
                </div>
              </div>

              {/* Patient Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <UserIcon size={16} className="text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="space-y-3">
                    {patient.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-700">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-700">{patient.phone}</span>
                      </div>
                    )}
                    {patient.dateOfBirth && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">
                          Born: {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Activity size={16} className="text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {treatments.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#3DBEA3] mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium">Latest Treatment</p>
                          <p className="text-xs text-gray-500">
                            {treatments[0]?.typeOfTreatment || 'N/A'} - {new Date(treatments[0]?.dateOfTreatment || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {appointments.filter(a => a.status === 'COMPLETED').length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium">Last Appointment</p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              appointments.filter(a => a.status === 'COMPLETED')[0]?.dateOfTreatment || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {appointments.filter(a => a.status === 'SCHEDULED').length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium">Next Scheduled</p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              appointments
                                .filter(a => a.status === 'SCHEDULED')
                                .sort((a, b) => new Date(a.dateOfTreatment).getTime() - new Date(b.dateOfTreatment).getTime())[0]?.dateOfTreatment || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {treatments.length === 0 && appointments.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Treatment Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{treatments.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Treatments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                    <p className="text-xs text-gray-600 mt-1">All Appointments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {appointments.filter(a => a.status === 'COMPLETED').length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Completed Visits</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {documents.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Documents</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {loadingTreatments ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-sm text-gray-500">Loading treatments...</p>
                </div>
              ) : treatmentsError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                  {treatmentsError}
                </div>
              ) : treatments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No treatment records found for this patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {treatment.typeOfTreatment.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(treatment.dateOfTreatment).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          treatment.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {treatment.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      {treatment.notes && (
                        <p className="text-sm text-gray-700 mb-2">{treatment.notes}</p>
                      )}
                      {treatment.procedure && (
                        <p className="text-xs text-gray-600 mb-2">
                          <span className="font-semibold">Procedure:</span> {treatment.procedure}
                        </p>
                      )}
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}
                        </span>
                        {treatment.teethInvolved && treatment.teethInvolved.length > 0 && (
                          <span>Teeth: {treatment.teethInvolved.join(', ')}</span>
                        )}
                      </div>
                      {treatment.followUpRequired && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Follow-up required</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {loadingAppointments ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-sm text-gray-500">Loading appointments...</p>
                </div>
              ) : appointmentsError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                  {appointmentsError}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No appointments found for this patient</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => {
                    const isPast = new Date(appt.dateOfTreatment) < new Date();
                    return (
                      <div key={appt.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {appt.typeOfTreatment ? appt.typeOfTreatment.replace(/_/g, ' ') : 'Appointment'}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(appt.dateOfTreatment).toLocaleDateString()} at{' '}
                              {new Date(appt.dateOfTreatment).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {isPast && <span className="ml-2 text-gray-500">(Past)</span>}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(appt.status)}`}>
                            {appt.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-sm text-gray-700 mb-2">{appt.notes}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-600">
                          {appt.doctor && (
                            <span>
                              Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}
                            </span>
                          )}
                          {appt.teethInvolved && appt.teethInvolved.length > 0 && (
                            <span>Teeth: {appt.teethInvolved.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">

              {documentsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{documentsError}</p>
                </div>
              )}
              {documentsSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded flex gap-2">
                  <svg className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="currentColor" strokeWidth="2"/></svg>
                  <p className="text-sm text-green-800">{documentsSuccess}</p>
                </div>
              )}

              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documents</h3>
                {!showUploadForm && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                )}
              </div>

              {showUploadForm && (
                <form onSubmit={handleUploadDocument} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., X-ray report, Prescription"
                        value={uploadData.name}
                        onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Type
                      </label>
                      <select
                        value={uploadData.type}
                        onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a type</option>
                        <option value="X-RAY">X-Ray</option>
                        <option value="PRESCRIPTION">Prescription</option>
                        <option value="REPORT">Medical Report</option>
                        <option value="INVOICE">Invoice</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {documentsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-sm">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents uploaded yet</p>
                  <p className="text-xs mt-2">Upload medical documents, X-rays, prescriptions, and reports here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group"
                              >
                                {doc.name}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                            {doc.type}
                          </span>
                          {doc.uploadedBy.id === currentUserId && (
                            <button
                              onClick={() => setDeleteConfirmDocId(doc.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Uploaded by: {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                      </p>
                      
                      {deleteConfirmDocId === doc.id && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex gap-2 items-center">
                          <p className="text-xs text-red-800 flex-1">Are you sure you want to delete this document?</p>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmDocId(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
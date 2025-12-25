import { useState, useEffect } from 'react';
import { Patient } from '../types/patient';
import { OdontogramDisplay } from '../components/patients/OdontogramDisplay';
import { getDocumentsByPatientId, deleteDocument, Document, uploadDocument } from '../services/document.service';
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

// Mock treatment data (hardcoded - to be replaced with real data)
const mockTreatments = [
  {
    id: '1',
    type: 'FILLING',
    date: '2025-11-20',
    teethInvolved: [14, 15],
    notes: 'Upper right molars filled with composite',
    doctor: 'Dr. Smith',
    status: 'completed',
  },
  {
    id: '2',
    type: 'CLEANING',
    date: '2025-10-15',
    teethInvolved: [],
    notes: 'Professional cleaning and scaling',
    doctor: 'Dr. Smith',
    status: 'completed',
  },
  {
    id: '3',
    type: 'CONSULTATION',
    date: '2025-09-10',
    teethInvolved: [2, 3],
    notes: 'Initial consultation for root canal assessment',
    doctor: 'Dr. Johnson',
    status: 'completed',
  },
];

// Mock appointment data (hardcoded - to be replaced with real data)
const mockAppointments = [
  {
    id: '1',
    type: 'ROOT_CANAL',
    date: '2025-12-15',
    time: '10:00 AM',
    doctor: 'Dr. Smith',
    status: 'SCHEDULED',
    notes: 'Root canal treatment on tooth #2',
  },
  {
    id: '2',
    type: 'CHECKUP',
    date: '2026-01-20',
    time: '2:00 PM',
    doctor: 'Dr. Johnson',
    status: 'SCHEDULED',
    notes: 'Follow-up checkup',
  },
];

export function PatientDetailPanel({
  patient,
  token,
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

  // Mock teeth states for odontogram
  const mockTeethStates: Record<number, 'healthy' | 'filled' | 'treated' | 'missing' | 'implant'> = {
    1: 'healthy',
    2: 'treated',
    3: 'healthy',
    4: 'healthy',
    5: 'filled',
    6: 'filled',
    7: 'healthy',
    8: 'healthy',
    9: 'healthy',
    10: 'healthy',
    11: 'healthy',
    12: 'healthy',
    13: 'healthy',
    14: 'filled',
    15: 'filled',
    16: 'healthy',
    17: 'healthy',
    18: 'missing',
    19: 'healthy',
    20: 'healthy',
    21: 'healthy',
    22: 'healthy',
    23: 'healthy',
    24: 'healthy',
    25: 'healthy',
    26: 'healthy',
    27: 'healthy',
    28: 'implant',
    29: 'healthy',
    30: 'healthy',
    31: 'healthy',
    32: 'healthy',
  };

  return (
    <div>
      {/* Back Button Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <button 
              onClick={onClose}
              className="mb-4 text-blue-600 hover:text-blue-900 font-medium flex items-center gap-2 text-sm"
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'treatments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
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
              <OdontogramDisplay teethStates={mockTeethStates} />
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Under Development</p>
                  <p className="text-xs text-yellow-800">
                    Treatment records are currently hardcoded for demonstration. Real integration coming soon.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mockTreatments.map((treatment) => (
                  <div key={treatment.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{treatment.type}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(treatment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                        {treatment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{treatment.notes}</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Dr: {treatment.doctor}</span>
                      {treatment.teethInvolved.length > 0 && (
                        <span>Teeth: {treatment.teethInvolved.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Under Development</p>
                  <p className="text-xs text-yellow-800">
                    Appointment records are currently hardcoded for demonstration. Real integration coming soon.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mockAppointments.map((appt) => (
                  <div key={appt.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm">{appt.type}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(appt.date).toLocaleDateString()} at {appt.time}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{appt.notes}</p>
                    <p className="text-xs text-gray-600">Dr: {appt.doctor}</p>
                  </div>
                ))}
              </div>
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

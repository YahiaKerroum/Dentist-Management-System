import { useState } from 'react';
import { Patient } from '../types/patient';
import { OdontogramDisplay } from '../components/patients/OdontogramDisplay';
import {
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  Lock,
  FileText,
} from 'lucide-react';

interface PatientDetailPanelProps {
  patient: Patient;
  token: string;
  userRole?: string;
  currentUserId?: string;
  onClose: () => void;
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
  userRole = 'ASSISTANT',
  currentUserId = '',
  onClose,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'treatments' | 'appointments' | 'documents'>('info');

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

  // Check if current user is the primary dentist (for medical documents access)
  const isPrimaryDentist = userRole === 'DOCTOR' && patient.primaryDentistId === currentUserId;
  const canViewMedicalDocs = isPrimaryDentist;

  return (
    <div>
      {/* Back Button Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <button 
          onClick={onClose}
          className="mb-4 text-blue-600 hover:text-blue-900 font-medium flex items-center gap-2 text-sm"
        >
          ← Back to Patients
        </button>
        <div>
          <h2 className="text-3xl font-bold">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Patient ID: {patient.id.slice(0, 8)}</p>
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

          {/* Permissions Info */}
          {canViewMedicalDocs && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-blue-700 font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                AUTHORIZED ACCESS
              </p>
              <p className="text-xs text-blue-700">
                You are the primary dentist for this patient. You have full access to medical documents.
              </p>
            </div>
          )}

          {!canViewMedicalDocs && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-xs text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                LIMITED ACCESS
              </p>
              <p className="text-xs text-gray-700">
                Medical documents are only visible to the primary dentist.
              </p>
            </div>
          )}
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
            {canViewMedicalDocs && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Medical Docs
              </button>
            )}
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

          {activeTab === 'documents' && canViewMedicalDocs && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Medical Documents (Restricted)</p>
                  <p className="text-xs text-blue-800">
                    Only the assigned dentist can view these confidential medical records.
                  </p>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Medical documents section - Coming soon</p>
                <p className="text-xs mt-2">
                  Prescriptions, X-rays, and detailed medical notes will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

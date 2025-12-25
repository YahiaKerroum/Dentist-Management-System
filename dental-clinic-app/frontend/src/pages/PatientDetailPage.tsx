import { useState, useEffect } from 'react';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Treatment } from '../types/treatment';
import { OdontogramDisplay } from '../components/patients/OdontogramDisplay';
import { getTreatments } from '../services/treatment.service';
import {
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  Lock,
  FileText,
  Edit,
  Trash2,
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
  userRole = 'ASSISTANT',
  currentUserId = '',
  userPermissions = [],
  onClose,
  onEdit,
  onDelete,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'treatments' | 'appointments' | 'documents'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
            {canViewMedicalDocs && (
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-b-2 border-[#3DBEA3] text-[#3DBEA3]'
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
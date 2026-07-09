import { useState, useEffect } from 'react';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Treatment, TREATMENT_STATUS_CONFIG } from '../types/treatment';
import { getDocumentsByPatientId, deleteDocument, Document, uploadDocument } from '../services/document.service';
import { getTreatments } from '../services/treatment.service';
import { getAllAppointments } from '../services/appointment.service';
import { getPaymentsByPatient } from '../services/payment.service';
import { Payment } from '../types/payment.types';
import { getPatientOdontogram, upsertToothStatus } from '../services/tooth.service';
import { PatientToothRecord, ToothStatus } from '../types/tooth';
import { Odontogram } from '../components/patients/Odontogram';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader2 } from 'lucide-react';
import {
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  AlertCircle,
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
  Upload,
  ExternalLink,
  Activity,
  Stethoscope,
  Clock,
  Wallet,
  CheckCircle2,
  XCircle,
  CalendarClock,
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
  currentUserId = '',
  userPermissions = [],
  onClose,
  onEdit,
  onDelete,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'treatments' | 'appointments' | 'documents' | 'odontogram'>('info');
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

  const [payments, setPayments] = useState<Payment[]>([]);

  // State for odontogram
  const [odontogram, setOdontogram] = useState<PatientToothRecord[]>([]);
  const [loadingOdontogram, setLoadingOdontogram] = useState(false);
  const [odontogramError, setOdontogramError] = useState('');

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

  // Fetch appointments, treatments and payments when the record opens (for the overview)
  useEffect(() => {
    fetchAppointments();
    fetchTreatments();
    getPaymentsByPatient(patient.id)
      .then(setPayments)
      .catch(() => setPayments([]));
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

  // Fetch odontogram when the odontogram tab is active
  useEffect(() => {
    if (activeTab === 'odontogram') {
      fetchOdontogram();
    }
  }, [activeTab, patient.id]);

  const fetchOdontogram = async () => {
    setLoadingOdontogram(true);
    setOdontogramError('');

    try {
      const response = await getPatientOdontogram(patient.id, token);
      setOdontogram(response.data);
    } catch (error: any) {
      setOdontogramError(error.message || 'Failed to load odontogram');
    } finally {
      setLoadingOdontogram(false);
    }
  };

  const handleToothSave = async (toothNumber: number, status: ToothStatus, notes: string) => {
    const response = await upsertToothStatus(patient.id, toothNumber, status, notes || undefined, token);
    setOdontogram((prev) => {
      const next = prev.filter((t) => t.toothNumber !== toothNumber);
      next.push(response.data);
      return next;
    });
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError('');
    
    try {
      const allAppointments = await getAllAppointments();

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

  const apptStatusPill = (status: string): { chip: string; dot: string } => {
    switch (status) {
      case 'SCHEDULED':
        return { chip: 'bg-info-50 text-info-700', dot: 'bg-info-500' };
      case 'CHECKED_IN':
      case 'IN_PROGRESS':
        return { chip: 'bg-warning-50 text-warning-700', dot: 'bg-warning-500' };
      case 'COMPLETED':
        return { chip: 'bg-success-50 text-success-700', dot: 'bg-success-500' };
      case 'CANCELLED':
        return { chip: 'bg-danger-50 text-danger-700', dot: 'bg-danger-500' };
      default:
        return { chip: 'bg-surface-100 text-surface-500', dot: 'bg-surface-400' };
    }
  };

  // ---- Derived clinical/financial signal (all from real, loaded data) ----
  const currency = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const fullDate = (d: string | number) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const titleType = (t: string | null) => (t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Visit');

  const billed = treatments.reduce((s, t) => s + (Number((t as any).cost) || 0), 0);
  const paidTotal = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const balance = billed - paidTotal;

  const nowMs = Date.now();
  const upcomingStatuses = ['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'];
  const nextAppt = appointments
    .filter((a) => upcomingStatuses.includes(a.status) && new Date(a.dateOfTreatment).getTime() >= nowMs)
    .sort((a, b) => new Date(a.dateOfTreatment).getTime() - new Date(b.dateOfTreatment).getTime())[0];
  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED');
  const lastVisit = completedAppts.length
    ? Math.max(...completedAppts.map((a) => new Date(a.dateOfTreatment).getTime()))
    : null;
  const missedCount = appointments.filter((a) => a.status === 'NO_SHOW' || a.status === 'CANCELLED').length;
  const resolvedAppts = appointments.filter((a) =>
    ['COMPLETED', 'NO_SHOW', 'CANCELLED'].includes(a.status)
  ).length;
  const attendanceRate = resolvedAppts > 0 ? Math.round((completedAppts.length / resolvedAppts) * 100) : null;

  // Reverse-chronological activity feed merged across sources
  type FeedItem = { id: string; date: number; icon: typeof Wallet; tone: string; title: string; detail: string };
  const activity: FeedItem[] = [
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      date: new Date(p.date).getTime(),
      icon: Wallet,
      tone: 'text-success-600 bg-success-50',
      title: `Payment received · ${currency(Number(p.amount))}`,
      detail: p.method ? titleType(p.method) : 'Payment',
    })),
    ...treatments.map((t) => ({
      id: `tr-${t.id}`,
      date: new Date(t.dateOfTreatment).getTime(),
      icon: Stethoscope,
      tone: 'text-primary-600 bg-primary-50',
      title: `${titleType(t.typeOfTreatment)} logged`,
      detail: TREATMENT_STATUS_CONFIG[t.status]?.label ?? t.status,
    })),
    ...appointments.map((a) => {
      const completed = a.status === 'COMPLETED';
      const missed = a.status === 'NO_SHOW' || a.status === 'CANCELLED';
      return {
        id: `apt-${a.id}`,
        date: new Date(a.dateOfTreatment).getTime(),
        icon: missed ? XCircle : completed ? CheckCircle2 : CalendarClock,
        tone: missed ? 'text-danger-600 bg-danger-50' : completed ? 'text-info-600 bg-info-50' : 'text-surface-500 bg-surface-100',
        title: `Appointment ${a.status.replace('_', ' ').toLowerCase()}`,
        detail: titleType(a.typeOfTreatment),
      };
    }),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 8);

  return (
    <div>
      {/* Back Button Header */}
      <div className="mb-6 pb-4 border-b border-surface-200">
        <div className="flex justify-between items-start">
          <div>
            <button 
              onClick={onClose}
              className="mb-4 font-medium flex items-center gap-2 text-sm"
              style={{ color: '#26a37e' }}
            >
              ← Back to Patients
            </button>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-surface-600 text-sm mt-1">Patient ID: {patient.id.slice(0, 8)}</p>
          </div>
          <div className="flex gap-2">
            {canEditPatient && onEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#26a37e' }}
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
                      className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors"
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
        <div className="lg:col-span-1 space-y-4">
          {/* Status + balance + quick action */}
          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                Active
              </span>
              {patient.phone && (
                <a
                  href={`tel:${patient.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-surface-300 px-2.5 py-1 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-100"
                >
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
              )}
            </div>
            <div className="mt-3 border-t border-surface-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">Outstanding balance</p>
              <p className={`mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums ${balance > 0.5 ? 'text-danger-600' : 'text-surface-900'}`}>
                {balance > 0.5 ? currency(balance) : '$0'}
              </p>
              <p className="mt-0.5 text-xs text-surface-400 tabular-nums">
                {currency(paidTotal)} paid of {currency(billed)} billed
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Patient Information
            </h2>

            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <p className="text-xs text-surface-600 font-semibold">DATE OF BIRTH</p>
                <p className="text-sm">
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-xs text-surface-600 font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  PHONE
                </p>
                <p className="text-sm">{patient.phone || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs text-surface-600 font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  EMAIL
                </p>
                <p className="text-sm">{patient.email || 'Not provided'}</p>
              </div>

              <div>
                <p className="text-xs text-surface-600 font-semibold">PATIENT SINCE</p>
                <p className="text-sm">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Primary Dentist */}
              <div>
                <p className="text-xs text-surface-600 font-semibold">PRIMARY DENTIST</p>
                {patient.primaryDentist ? (
                  <p className="text-sm font-medium text-blue-600">
                    Dr. {patient.primaryDentist.user.firstName} {patient.primaryDentist.user.lastName}
                  </p>
                ) : (
                  <p className="text-sm text-surface-500">Not assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions Info removed: everyone can view documents for now */}
        </div>

        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-surface-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-[#26a37e] text-[#26a37e]'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'treatments'
                  ? 'border-b-2 border-[#26a37e] text-[#26a37e]'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-[#26a37e] text-[#26a37e]'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'border-b-2 border-primary-500 text-primary-700'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('odontogram')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'odontogram'
                  ? 'border-b-2 border-[#26a37e] text-[#26a37e]'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Odontogram
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Alerts — surfaced from real signal only */}
              {(balance > 0.5 || missedCount >= 2) && (
                <div className="space-y-2">
                  {balance > 0.5 && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-danger-100 bg-danger-50 px-4 py-2.5 text-sm text-danger-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Outstanding balance of <span className="font-semibold tabular-nums">{currency(balance)}</span></span>
                    </div>
                  )}
                  {missedCount >= 2 && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-warning-100 bg-warning-50 px-4 py-2.5 text-sm text-warning-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span><span className="font-semibold tabular-nums">{missedCount}</span> missed or cancelled appointments — possible no-show risk</span>
                    </div>
                  )}
                </div>
              )}

              {/* Flat metric cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-surface-400"><Wallet className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wide">Balance</span></div>
                  <p className={`mt-1.5 font-display text-2xl font-semibold tracking-tight tabular-nums ${balance > 0.5 ? 'text-danger-600' : 'text-surface-900'}`}>
                    {balance > 0.5 ? currency(balance) : '$0'}
                  </p>
                </div>
                <div className="rounded-xl border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-surface-400"><CalendarClock className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wide">Next appt</span></div>
                  {nextAppt ? (
                    <>
                      <p className="mt-1.5 font-display text-lg font-semibold tracking-tight text-primary-700 tabular-nums">{fullDate(nextAppt.dateOfTreatment)}</p>
                      <p className="text-xs text-surface-400">{titleType(nextAppt.typeOfTreatment)}</p>
                    </>
                  ) : (
                    <p className="mt-1.5 font-display text-lg font-semibold tracking-tight text-surface-300">None</p>
                  )}
                </div>
                <div className="rounded-xl border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-surface-400"><Clock className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wide">Last visit</span></div>
                  <p className="mt-1.5 font-display text-lg font-semibold tracking-tight text-surface-900 tabular-nums">{lastVisit ? fullDate(lastVisit) : 'Never'}</p>
                </div>
                <div className="rounded-xl border border-surface-200 bg-white p-4">
                  <div className="flex items-center gap-1.5 text-surface-400"><CheckCircle2 className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wide">Attendance</span></div>
                  <p className={`mt-1.5 font-display text-2xl font-semibold tracking-tight tabular-nums ${attendanceRate !== null && attendanceRate < 70 ? 'text-warning-600' : 'text-surface-900'}`}>
                    {attendanceRate !== null ? `${attendanceRate}%` : '—'}
                  </p>
                  {missedCount > 0 && <p className="text-xs text-surface-400 tabular-nums">{missedCount} missed</p>}
                </div>
              </div>

              {/* Activity feed */}
              <div className="rounded-xl border border-surface-200 bg-white">
                <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3">
                  <Activity size={16} className="text-surface-500" />
                  <h3 className="font-display font-semibold tracking-tight text-surface-900">Activity</h3>
                </div>
                {activity.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-surface-400">No activity recorded yet.</div>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {activity.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-surface-800">{item.title}</p>
                            <p className="truncate text-xs text-surface-400">{item.detail}</p>
                          </div>
                          <span className="shrink-0 text-xs text-surface-400 tabular-nums">{fullDate(item.date)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs">
              {loadingTreatments ? (
                <div className="flex items-center justify-center gap-3 py-16 text-surface-500">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm">Loading treatments…</span>
                </div>
              ) : treatmentsError ? (
                <div className="m-4 rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
                  {treatmentsError}
                </div>
              ) : treatments.length === 0 ? (
                <EmptyState icon={Stethoscope} title="No treatments yet" description="Logged treatments for this patient will appear here." />
              ) : (
                <div className="divide-y divide-surface-100">
                  {treatments.map((treatment) => {
                    const cfg = TREATMENT_STATUS_CONFIG[treatment.status];
                    return (
                      <div key={treatment.id} className="px-5 py-3.5 transition-colors hover:bg-surface-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-surface-900">{titleType(treatment.typeOfTreatment)}</p>
                              <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                                style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                              {treatment.followUpRequired && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700">
                                  <AlertCircle className="h-3 w-3" /> Follow-up
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-surface-500">
                              Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}
                              {treatment.teeth.length > 0 && <span> · Teeth {treatment.teeth.map((t) => t.toothNumber).join(', ')}</span>}
                            </p>
                            {treatment.notes && <p className="mt-1.5 text-sm text-surface-600">{treatment.notes}</p>}
                          </div>
                          <span className="shrink-0 text-xs text-surface-400 tabular-nums">{fullDate(treatment.dateOfTreatment)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs">
              {loadingAppointments ? (
                <div className="flex items-center justify-center gap-3 py-16 text-surface-500">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm">Loading appointments…</span>
                </div>
              ) : appointmentsError ? (
                <div className="m-4 rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
                  {appointmentsError}
                </div>
              ) : appointments.length === 0 ? (
                <EmptyState icon={Calendar} title="No appointments" description="This patient has no appointment history yet." />
              ) : (
                <div className="divide-y divide-surface-100">
                  {[...appointments].reverse().map((appt) => {
                    const pill = apptStatusPill(appt.status);
                    const isPast = new Date(appt.dateOfTreatment) < new Date();
                    return (
                      <div key={appt.id} className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-50">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-surface-900">
                              {appt.typeOfTreatment ? titleType(appt.typeOfTreatment) : 'Appointment'}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${pill.chip}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                              {titleType(appt.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-surface-500">
                            {appt.doctor && <>Dr. {appt.doctor.user.firstName} {appt.doctor.user.lastName}</>}
                            {appt.teethInvolved && appt.teethInvolved.length > 0 && <span> · Teeth {appt.teethInvolved.join(', ')}</span>}
                          </p>
                          {appt.notes && <p className="mt-1.5 text-sm text-surface-600">{appt.notes}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm text-surface-700 tabular-nums">{fullDate(appt.dateOfTreatment)}</p>
                          <p className="text-xs text-surface-400 tabular-nums">
                            {new Date(appt.dateOfTreatment).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isPast && ' · Past'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-xs">

              {documentsError && (
                <div className="mb-4 flex gap-2 rounded-lg border border-danger-100 bg-danger-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger-600" />
                  <p className="text-sm text-danger-700">{documentsError}</p>
                </div>
              )}
              {documentsSuccess && (
                <div className="mb-4 flex gap-2 rounded-lg border border-success-100 bg-success-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-600" />
                  <p className="text-sm text-success-700">{documentsSuccess}</p>
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold tracking-tight text-surface-900">Documents</h3>
                {!showUploadForm && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center gap-2 rounded-md bg-gradient-to-b from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-primary-600 hover:to-primary-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </button>
                )}
              </div>

              {showUploadForm && (
                <form onSubmit={handleUploadDocument} className="mb-6 p-4 bg-surface-50 rounded-lg border border-surface-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Document Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., X-ray report, Prescription"
                        value={uploadData.name}
                        onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                        className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:shadow-focus focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">
                        Document Type
                      </label>
                      <select
                        value={uploadData.type}
                        onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                        className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:shadow-focus focus:outline-none"
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
                      <label className="block text-sm font-medium text-surface-700 mb-1">
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
                        className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="rounded-lg bg-gradient-to-b from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:from-primary-600 hover:to-primary-700 disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {documentsLoading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-surface-500">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm">Loading documents…</span>
                </div>
              ) : documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents uploaded yet"
                  description="X-rays, prescriptions, reports and invoices for this patient will live here."
                  action={
                    !showUploadForm ? (
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="inline-flex items-center gap-2 rounded-md border border-surface-300 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-100"
                      >
                        <Upload className="h-4 w-4" /> Upload document
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="divide-y divide-surface-100 overflow-hidden rounded-lg border border-surface-200">
                  {documents.map((doc) => (
                    <div key={doc.id} className="px-4 py-3 transition-colors hover:bg-surface-50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-600">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <a
                              href={doc.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-1 truncate font-medium text-surface-900 hover:text-primary-700 hover:underline"
                            >
                              {doc.name}
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                            <p className="truncate text-xs text-surface-400">
                              <span className="tabular-nums">{fullDate(doc.createdAt)}</span> · {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-full bg-info-50 px-2 py-0.5 text-[11px] font-medium text-info-700">{doc.type}</span>
                          {doc.uploadedBy.id === currentUserId && (
                            <button
                              onClick={() => setDeleteConfirmDocId(doc.id)}
                              className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
                              title="Delete document"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {deleteConfirmDocId === doc.id && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 p-2">
                          <p className="flex-1 text-xs text-danger-700">Delete this document?</p>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="rounded-md bg-danger-600 px-2 py-1 text-xs font-medium text-white hover:bg-danger-700">Delete</button>
                          <button onClick={() => setDeleteConfirmDocId(null)} className="rounded-md px-2 py-1 text-xs font-medium text-surface-500 hover:bg-surface-100">Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'odontogram' && (
            <Odontogram
              teeth={odontogram}
              loading={loadingOdontogram}
              error={odontogramError}
              onSave={handleToothSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
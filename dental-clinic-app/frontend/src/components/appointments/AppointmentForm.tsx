import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Appointment, CreateAppointmentDTO, TreatmentType } from '../../types/appointment';
import { getAllRooms } from '../../services/room.service';
import type { Room } from '../../types/room';
import { Button } from '../ui/Button';
import { TeethSelector } from './TeethSelector';
import { ConfirmationDialog } from './Dialogs';
import { CalendarClock, User, Stethoscope, FileText, Armchair, Clock, ClipboardList, BellRing } from 'lucide-react';

const SECTION_TONE: Record<'primary' | 'info' | 'surface' | 'warning', string> = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    info: 'bg-info-50 text-info-700 border-info-100',
    surface: 'bg-surface-100 text-surface-600 border-surface-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-100',
};

function FormSection({
    icon: Icon,
    title,
    tone,
    children,
}: {
    icon: LucideIcon;
    title: string;
    tone: keyof typeof SECTION_TONE;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-surface-200">
            <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${SECTION_TONE[tone]}`}>
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
            </div>
            <div className="space-y-4 p-4">{children}</div>
        </div>
    );
}

interface AppointmentFormProps {
    mode: 'add' | 'edit';
    initialData?: Appointment | null;
    onSubmit: (data: CreateAppointmentDTO) => Promise<void>;
    onCancel: () => void;
    token: string;
}

// Treatment type configurations with colors and descriptions
const TREATMENT_TYPE_INFO: Record<TreatmentType, { label: string; description: string; color: string; bgColor: string }> = {
    CONSULTATION: {
        label: 'Consultation',
        description: 'Initial examination and diagnosis to assess oral health',
        color: '#3b82f6',
        bgColor: '#dbeafe'
    },
    FILLING: {
        label: 'Filling',
        description: 'Restoration of damaged tooth using composite materials',
        color: '#8b5cf6',
        bgColor: '#ede9fe'
    },
    EXTRACTION: {
        label: 'Extraction',
        description: 'Surgical removal of tooth',
        color: '#ef4444',
        bgColor: '#fee2e2'
    },
    ROOT_CANAL: {
        label: 'Root Canal',
        description: 'Endodontic treatment to remove infected pulp',
        color: '#f59e0b',
        bgColor: '#fef3c7'
    },
    CLEANING: {
        label: 'Cleaning',
        description: 'Professional dental cleaning to remove plaque and tartar',
        color: '#10b981',
        bgColor: '#d1fae5'
    },
    IMPLANT: {
        label: 'Implant',
        description: 'Permanent artificial tooth root placement',
        color: '#6366f1',
        bgColor: '#e0e7ff'
    },
    ORTHODONTICS: {
        label: 'Orthodontics',
        description: 'Teeth alignment correction using braces or aligners',
        color: '#ec4899',
        bgColor: '#fce7f3'
    },
    OTHER: {
        label: 'Other',
        description: 'Other dental procedures',
        color: '#6b7280',
        bgColor: '#f3f4f6'
    }
};

export function AppointmentForm({ mode, initialData, onSubmit, onCancel, token }: AppointmentFormProps) {
    const [formData, setFormData] = useState<CreateAppointmentDTO>({
        doctorId: '',
        patientId: '',
        dateOfTreatment: '',
        typeOfTreatment: undefined,
        notes: '',
        procedure: '',
        teethInvolved: [],
        followUpRequired: false,
        roomId: '',
        durationMinutes: 30,
    });
    const [error, setError] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [isFormReady, setIsFormReady] = useState(false);
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/users?role=DOCTOR', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setDoctors(data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            } finally {
                setLoadingDoctors(false);
            }
        };

        const fetchPatients = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/patients', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPatients(data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch patients:', err);
            } finally {
                setLoadingPatients(false);
            }
        };

        fetchDoctors();
        fetchPatients();
        getAllRooms().then(setRooms).catch((err) => console.error('Failed to fetch rooms:', err));
    }, [token]);

    useEffect(() => {
        setIsFormReady(false);

        if (initialData && mode === 'edit') {
            if (!loadingDoctors && !loadingPatients) {
                const dateObj = new Date(initialData.dateOfTreatment);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

                setFormData({
                    doctorId: initialData.doctorId,
                    patientId: initialData.patientId,
                    dateOfTreatment: formattedDate,
                    typeOfTreatment: initialData.typeOfTreatment || undefined,
                    notes: initialData.notes || '',
                    procedure: initialData.procedure || '',
                    teethInvolved: initialData.teethInvolved || [],
                    followUpRequired: initialData.followUpRequired || false,
                    roomId: initialData.roomId || '',
                    durationMinutes: initialData.durationMinutes || 30,
                });

                setTimeout(() => {
                    setIsFormReady(true);
                }, 100);
            }
        } else {
            if (!loadingDoctors && !loadingPatients) {
                setIsFormReady(true);
            }
        }
    }, [initialData, mode, loadingDoctors, loadingPatients]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? undefined : Number(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleTeethChange = (teeth: number[]) => {
        setFormData(prev => ({ ...prev, teethInvolved: teeth }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.doctorId) {
            setError('Please select a doctor');
            return;
        }

        if (!formData.patientId) {
            setError('Please select a patient');
            return;
        }

        if (!formData.dateOfTreatment) {
            setError('Please select a date and time');
            return;
        }

        if (mode === 'add') {
            const appointmentDate = new Date(formData.dateOfTreatment);
            const now = new Date();
            
            if (appointmentDate < now) {
                setError('Appointment date and time cannot be in the past');
                return;
            }
        }

        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        
        try {
            const submitData = {
                ...formData,
                dateOfTreatment: new Date(formData.dateOfTreatment).toISOString()
            };

            await onSubmit(submitData);
            
            setShowConfirm(false);
            
            setTimeout(() => {
                onCancel();
            }, 2100);
        } catch (error: any) {
            setShowConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelSubmit = () => {
        setShowConfirm(false);
    };

    const selectedTreatmentInfo = formData.typeOfTreatment ? TREATMENT_TYPE_INFO[formData.typeOfTreatment] : null;

    const inputClass =
        'w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isFormReady ? (
                    <div className="py-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
                            <p className="text-sm text-surface-500">Loading form data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
                                <span className="font-semibold">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <FormSection icon={CalendarClock} title="Who & When" tone="primary">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                        <User className="h-4 w-4 text-surface-500" />
                                        Patient <span className="text-danger-500">*</span>
                                    </label>
                                    <select
                                        name="patientId"
                                        value={formData.patientId}
                                        onChange={handleChange}
                                        className={inputClass}
                                        disabled={loadingPatients}
                                        required
                                    >
                                        <option value="">Select a patient</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.firstName} {patient.lastName}
                                                {patient.phone && ` - ${patient.phone}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                        <Stethoscope className="h-4 w-4 text-surface-500" />
                                        Doctor <span className="text-danger-500">*</span>
                                    </label>
                                    <select
                                        name="doctorId"
                                        value={formData.doctorId}
                                        onChange={handleChange}
                                        className={inputClass}
                                        disabled={loadingDoctors}
                                        required
                                    >
                                        <option value="">Select a doctor</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.doctorProfile?.id}>
                                                Dr. {doctor.firstName} {doctor.lastName}
                                                {doctor.doctorProfile?.specialization && ` - ${doctor.doctorProfile.specialization}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="md:col-span-1">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                        <CalendarClock className="h-4 w-4 text-surface-500" />
                                        Date & Time <span className="text-danger-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="dateOfTreatment"
                                        value={formData.dateOfTreatment}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                        <Armchair className="h-4 w-4 text-surface-500" />
                                        Chair / Room
                                    </label>
                                    <select name="roomId" value={formData.roomId || ''} onChange={handleChange} className={inputClass}>
                                        <option value="">Unassigned</option>
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                        <Clock className="h-4 w-4 text-surface-500" />
                                        Duration (min)
                                    </label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        min={5}
                                        step={5}
                                        value={formData.durationMinutes ?? 30}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection icon={Stethoscope} title="Treatment" tone="info">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                                    <FileText className="h-4 w-4 text-surface-500" />
                                    Treatment Type
                                </label>
                                <select name="typeOfTreatment" value={formData.typeOfTreatment || ''} onChange={handleChange} className={inputClass}>
                                    <option value="">Select treatment type</option>
                                    {Object.entries(TREATMENT_TYPE_INFO).map(([type, info]) => (
                                        <option key={type} value={type}>
                                            {info.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedTreatmentInfo && (
                                <div
                                    className="rounded-lg border-2 border-dashed p-4"
                                    style={{ borderColor: selectedTreatmentInfo.color, backgroundColor: selectedTreatmentInfo.bgColor }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg p-2" style={{ backgroundColor: 'white' }}>
                                            <FileText className="h-5 w-5" style={{ color: selectedTreatmentInfo.color }} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold" style={{ color: selectedTreatmentInfo.color }}>
                                                {selectedTreatmentInfo.label}
                                            </h3>
                                            <p className="text-sm text-surface-700">{selectedTreatmentInfo.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-surface-700">
                                    🦷 Teeth Involved
                                    {formData.teethInvolved && formData.teethInvolved.length > 0 && (
                                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                                            {formData.teethInvolved.length} selected
                                        </span>
                                    )}
                                </label>
                                <TeethSelector selectedTeeth={formData.teethInvolved || []} onChange={handleTeethChange} />
                            </div>
                        </FormSection>

                        <FormSection icon={ClipboardList} title="Clinical Details" tone="surface">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-surface-700">Procedure Details</label>
                                    <textarea
                                        name="procedure"
                                        value={formData.procedure || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Describe the procedure performed..."
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-surface-700">Clinical Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Add any clinical observations..."
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <label
                            htmlFor="followUpRequired"
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-warning-100 bg-warning-50 p-4"
                        >
                            <BellRing className="h-4 w-4 shrink-0 text-warning-600" />
                            <input
                                type="checkbox"
                                name="followUpRequired"
                                id="followUpRequired"
                                checked={formData.followUpRequired}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-surface-700">Follow-up appointment required</span>
                        </label>

                        {/* Action Buttons */}
                        <div className="flex gap-3 border-t border-surface-100 pt-4">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {mode === 'add' ? 'Create Appointment' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </form>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirm}
                title={mode === 'add' ? 'Confirm Create Appointment' : 'Confirm Update Appointment'}
                message={mode === 'add' 
                    ? 'Are you sure you want to create this appointment?' 
                    : 'Are you sure you want to update this appointment?'}
                confirmText={mode === 'add' ? 'Create' : 'Update'}
                cancelText="Cancel"
                onConfirm={confirmSubmit}
                onCancel={cancelSubmit}
                isLoading={isSubmitting}
            />
        </>
    );
}
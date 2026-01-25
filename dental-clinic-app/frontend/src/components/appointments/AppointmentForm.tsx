import { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentDTO, TreatmentType } from '../../types/appointment';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TeethSelector } from './TeethSelector';
import { ConfirmationDialog } from './Dialogs';
import { Calendar, User, Stethoscope, FileText } from 'lucide-react';

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
    });
    const [error, setError] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
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

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-5">
                {!isFormReady ? (
                    <div className="py-12">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-3"></div>
                            <p className="text-sm text-gray-500">Loading form data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
                                <span className="font-semibold">⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Two Column Layout for Patient and Doctor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Patient Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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

                            {/* Doctor Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Stethoscope className="w-4 h-4 text-gray-500" />
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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

                        {/* Two Column Layout for Date and Treatment Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date & Time */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Appointment Date & Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="dateOfTreatment"
                                    value={formData.dateOfTreatment}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Treatment Type */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    Treatment Type
                                </label>
                                <select
                                    name="typeOfTreatment"
                                    value={formData.typeOfTreatment || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                                >
                                    <option value="">Select treatment type</option>
                                    {Object.entries(TREATMENT_TYPE_INFO).map(([type, info]) => (
                                        <option key={type} value={type}>
                                            {info.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Treatment Type Info Card */}
                        {selectedTreatmentInfo && (
                            <div 
                                className="border-2 border-dashed rounded-lg p-4"
                                style={{ 
                                    borderColor: selectedTreatmentInfo.color,
                                    backgroundColor: selectedTreatmentInfo.bgColor
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: 'white' }}
                                    >
                                        <FileText 
                                            className="w-5 h-5" 
                                            style={{ color: selectedTreatmentInfo.color }}
                                        />
                                    </div>
                                    <div>
                                        <h3 
                                            className="font-semibold text-base"
                                            style={{ color: selectedTreatmentInfo.color }}
                                        >
                                            {selectedTreatmentInfo.label}
                                        </h3>
                                        <p className="text-sm text-gray-700">
                                            {selectedTreatmentInfo.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Teeth Involved */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                🦷 Teeth Involved
                                {formData.teethInvolved && formData.teethInvolved.length > 0 && (
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                                        {formData.teethInvolved.length} selected
                                    </span>
                                )}
                            </label>
                            <TeethSelector
                                selectedTeeth={formData.teethInvolved || []}
                                onChange={handleTeethChange}
                            />
                        </div>

                        {/* Two Column Layout for Procedure and Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Procedure */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedure Details
                                </label>
                                <textarea
                                    name="procedure"
                                    value={formData.procedure || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                    placeholder="Describe the procedure performed..."
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clinical Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes || ''}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                    placeholder="Add any clinical observations..."
                                />
                            </div>
                        </div>

                        {/* Follow-up Required */}
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                name="followUpRequired"
                                id="followUpRequired"
                                checked={formData.followUpRequired}
                                onChange={handleChange}
                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="followUpRequired" className="ml-3 text-sm font-medium text-gray-700">
                                Follow-up appointment required
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {mode === 'add' ? 'Create Appointment' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
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
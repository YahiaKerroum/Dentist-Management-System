import { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentDTO, TreatmentType } from '../../types/appointment';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AppointmentFormProps {
    mode: 'add' | 'edit';
    initialData?: Appointment | null;
    onSubmit: (data: CreateAppointmentDTO) => void;
    onCancel: () => void;
    token: string;
}

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
                } else {
                    console.error('Failed to fetch doctors');
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
                } else {
                    console.error('Failed to fetch patients');
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
        // Reset form ready state when mode changes
        setIsFormReady(false);

        if (initialData && mode === 'edit') {
            // Wait for both doctors and patients to load before populating form
            if (!loadingDoctors && !loadingPatients) {
                // Format the date properly for datetime-local input
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

                // Mark form as ready after a small delay to ensure state updates
                setTimeout(() => {
                    setIsFormReady(true);
                }, 100);
            }
        } else {
            // For add mode, form is ready once data is loaded
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

    const handleTeethChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const teeth = e.target.value.split(',').map(t => parseInt(t.trim())).filter(n => !isNaN(n));
        setFormData(prev => ({ ...prev, teethInvolved: teeth }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
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

        // Check if appointment date is in the future (for new appointments)
        if (mode === 'add') {
            const appointmentDate = new Date(formData.dateOfTreatment);
            const now = new Date();
            
            if (appointmentDate < now) {
                setError('Appointment date and time cannot be in the past');
                return;
            }
        }

        // Convert datetime-local string to ISO string for backend
        const submitData = {
            ...formData,
            dateOfTreatment: new Date(formData.dateOfTreatment).toISOString()
        };

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isFormReady ? (
                <div className="py-12">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-sm text-gray-500">Loading form data...</p>
                    </div>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Doctor <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Date & Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Appointment Date & Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            name="dateOfTreatment"
                            value={formData.dateOfTreatment}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Treatment Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Treatment Type
                        </label>
                        <select
                            name="typeOfTreatment"
                            value={formData.typeOfTreatment || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select treatment type</option>
                            {Object.values(TreatmentType).map((type) => (
                                <option key={type} value={type}>
                                    {type.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Procedure */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Procedure
                        </label>
                        <input
                            type="text"
                            name="procedure"
                            value={formData.procedure || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Root canal treatment"
                        />
                    </div>

                    {/* Teeth Involved */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teeth Involved (comma-separated tooth numbers)
                        </label>
                        <input
                            type="text"
                            value={formData.teethInvolved?.join(', ') || ''}
                            onChange={handleTeethChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1, 2, 3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter tooth numbers separated by commas</p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes or special instructions..."
                        />
                    </div>

                    {/* Follow-up Required */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="followUpRequired"
                            id="followUpRequired"
                            checked={formData.followUpRequired}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="followUpRequired" className="ml-2 text-sm text-gray-700">
                            Follow-up appointment required
                        </label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {mode === 'add' ? 'Create Appointment' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </>
            )}
        </form>
    );
}
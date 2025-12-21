import { useState, useEffect } from 'react';
import {
    X,
    Stethoscope,
    User,
    Calendar,
    FileText,
    AlertCircle,
    Check,
    Search,
} from 'lucide-react';
import { Treatment, TreatmentType, CreateTreatmentDTO, TREATMENT_TYPE_CONFIG, TEETH_QUADRANTS } from '../../types/treatment';
import { Patient } from '../../types/patient';
import { User as UserType } from '../../types/user';
import { createTreatment, updateTreatment } from '../../services/treatment.service';

// Helper component for treatment type icon
const TreatmentTypeIcon = ({ type, size = 'md' }: { type: TreatmentType; size?: 'sm' | 'md' | 'lg' }) => {
    const config = TREATMENT_TYPE_CONFIG[type];
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
    };
    return (
        <img 
            src={config.iconPath} 
            alt={config.label}
            className={`${sizeClasses[size]} object-contain`}
        />
    );
};

interface TreatmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (treatment: Treatment) => void;
    treatment: Treatment | null;
    patients: Patient[];
    doctors: UserType[];
    token: string;
}

export function TreatmentFormModal({
    isOpen,
    onClose,
    onSuccess,
    treatment,
    patients,
    doctors,
    token,
}: TreatmentFormModalProps) {
    const [formData, setFormData] = useState<{
        patientId: string;
        doctorId: string;
        dateOfTreatment: string;
        typeOfTreatment: TreatmentType;
        notes: string;
        procedure: string;
        teethInvolved: number[];
        followUpRequired: boolean;
    }>({
        patientId: '',
        doctorId: '',
        dateOfTreatment: new Date().toISOString().split('T')[0],
        typeOfTreatment: 'CONSULTATION',
        notes: '',
        procedure: '',
        teethInvolved: [],
        followUpRequired: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);

    useEffect(() => {
        if (treatment) {
            setFormData({
                patientId: treatment.patientId,
                doctorId: treatment.doctorId,
                dateOfTreatment: new Date(treatment.dateOfTreatment).toISOString().split('T')[0],
                typeOfTreatment: treatment.typeOfTreatment,
                notes: treatment.notes || '',
                procedure: treatment.procedure || '',
                teethInvolved: treatment.teethInvolved || [],
                followUpRequired: treatment.followUpRequired,
            });
            setPatientSearch(`${treatment.patient.firstName} ${treatment.patient.lastName}`);
        } else {
            setFormData({
                patientId: '',
                doctorId: doctors[0]?.doctorProfile?.id || '',
                dateOfTreatment: new Date().toISOString().split('T')[0],
                typeOfTreatment: 'CONSULTATION',
                notes: '',
                procedure: '',
                teethInvolved: [],
                followUpRequired: false,
            });
            setPatientSearch('');
        }
    }, [treatment, doctors]);

    const filteredPatients = patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone?.includes(patientSearch) ||
        p.email?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const handlePatientSelect = (patient: Patient) => {
        setFormData(prev => ({ ...prev, patientId: patient.id }));
        setPatientSearch(`${patient.firstName} ${patient.lastName}`);
        setShowPatientDropdown(false);
    };

    const toggleTooth = (toothNumber: number) => {
        setFormData(prev => ({
            ...prev,
            teethInvolved: prev.teethInvolved.includes(toothNumber)
                ? prev.teethInvolved.filter(t => t !== toothNumber)
                : [...prev.teethInvolved, toothNumber].sort((a, b) => a - b),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient');
            return;
        }
        if (!formData.doctorId) {
            setError('Please select a doctor');
            return;
        }

        try {
            setLoading(true);
            let result;
            if (treatment) {
                result = await updateTreatment(treatment.id, {
                    notes: formData.notes || undefined,
                    procedure: formData.procedure || undefined,
                    teethInvolved: formData.teethInvolved,
                    followUpRequired: formData.followUpRequired,
                }, token);
            } else {
                const payload: CreateTreatmentDTO = {
                    patientId: formData.patientId,
                    doctorId: formData.doctorId,
                    dateOfTreatment: formData.dateOfTreatment,
                    typeOfTreatment: formData.typeOfTreatment,
                    notes: formData.notes || undefined,
                    procedure: formData.procedure || undefined,
                    teethInvolved: formData.teethInvolved,
                    followUpRequired: formData.followUpRequired,
                };
                result = await createTreatment(payload, token);
            }
            onSuccess(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to save treatment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedTypeConfig = TREATMENT_TYPE_CONFIG[formData.typeOfTreatment];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {treatment ? 'Edit Treatment' : 'New Treatment Record'}
                            </h2>
                            <p className="text-teal-100 text-sm">
                                {treatment ? 'Update treatment details' : 'Create a new dental procedure record'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Patient and Doctor Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Patient Selection */}
                            <div className="relative">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(e) => {
                                            setPatientSearch(e.target.value);
                                            setShowPatientDropdown(true);
                                            if (!e.target.value) {
                                                setFormData(prev => ({ ...prev, patientId: '' }));
                                            }
                                        }}
                                        onFocus={() => setShowPatientDropdown(true)}
                                        placeholder="Search patient by name, phone, or email..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        disabled={!!treatment}
                                    />
                                </div>
                                {showPatientDropdown && !treatment && filteredPatients.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
                                        {filteredPatients.slice(0, 8).map((patient) => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {patient.firstName[0]}{patient.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {patient.firstName} {patient.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{patient.phone || patient.email}</p>
                                                </div>
                                                {formData.patientId === patient.id && (
                                                    <Check className="w-4 h-4 text-teal-500 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Doctor Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Stethoscope className="w-4 h-4 text-gray-400" />
                                    Doctor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.doctorId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    disabled={!!treatment}
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc.id} value={doc.doctorProfile?.id || ''}>
                                            Dr. {doc.firstName} {doc.lastName}
                                            {doc.doctorProfile?.specialization && ` - ${doc.doctorProfile.specialization}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date and Type Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Treatment Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfTreatment}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfTreatment: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    disabled={!!treatment}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Treatment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.typeOfTreatment}
                                    onChange={(e) => setFormData(prev => ({ ...prev, typeOfTreatment: e.target.value as TreatmentType }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    disabled={!!treatment}
                                >
                                    {Object.entries(TREATMENT_TYPE_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Treatment Type Preview */}
                        <div
                            className="p-4 rounded-xl border-2 border-dashed"
                            style={{ borderColor: selectedTypeConfig.color, backgroundColor: selectedTypeConfig.bgColor }}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${selectedTypeConfig.color}20` }}
                                >
                                    <TreatmentTypeIcon type={formData.typeOfTreatment} size="lg" />
                                </div>
                                <div>
                                    <p className="font-semibold" style={{ color: selectedTypeConfig.color }}>
                                        {selectedTypeConfig.label}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedTypeConfig.description}
                            </p>
                        </div>

                        {/* Teeth Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                🦷 Teeth Involved
                                {formData.teethInvolved.length > 0 && (
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs">
                                        {formData.teethInvolved.length} selected
                                    </span>
                                )}
                            </label>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex flex-col gap-3">
                                    {/* Upper teeth */}
                                    <div className="flex justify-center gap-1">
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.upperRight.map((tooth) => (
                                                <button
                                                    key={tooth}
                                                    type="button"
                                                    onClick={() => toggleTooth(tooth)}
                                                    className={`w-7 h-8 rounded text-xs font-medium transition-all ${
                                                        formData.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                                    }`}
                                                >
                                                    {tooth}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="w-px bg-gray-300 mx-1" />
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.upperLeft.map((tooth) => (
                                                <button
                                                    key={tooth}
                                                    type="button"
                                                    onClick={() => toggleTooth(tooth)}
                                                    className={`w-7 h-8 rounded text-xs font-medium transition-all ${
                                                        formData.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                                    }`}
                                                >
                                                    {tooth}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-gray-400">Upper Arch</div>
                                    <div className="border-t border-gray-200 my-1" />
                                    <div className="text-center text-xs text-gray-400">Lower Arch</div>
                                    {/* Lower teeth */}
                                    <div className="flex justify-center gap-1">
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.lowerLeft.map((tooth) => (
                                                <button
                                                    key={tooth}
                                                    type="button"
                                                    onClick={() => toggleTooth(tooth)}
                                                    className={`w-7 h-8 rounded text-xs font-medium transition-all ${
                                                        formData.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                                    }`}
                                                >
                                                    {tooth}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="w-px bg-gray-300 mx-1" />
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.lowerRight.map((tooth) => (
                                                <button
                                                    key={tooth}
                                                    type="button"
                                                    onClick={() => toggleTooth(tooth)}
                                                    className={`w-7 h-8 rounded text-xs font-medium transition-all ${
                                                        formData.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                                    }`}
                                                >
                                                    {tooth}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Procedure and Notes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedure Details
                                </label>
                                <textarea
                                    value={formData.procedure}
                                    onChange={(e) => setFormData(prev => ({ ...prev, procedure: e.target.value }))}
                                    placeholder="Describe the procedure performed..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clinical Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any clinical observations..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Follow-up Required */}
                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <input
                                type="checkbox"
                                id="followUpRequired"
                                checked={formData.followUpRequired}
                                onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                                className="w-5 h-5 text-amber-500 border-amber-300 rounded focus:ring-amber-500"
                            />
                            <label htmlFor="followUpRequired" className="flex-1">
                                <p className="font-medium text-amber-800">Follow-up Required</p>
                                <p className="text-sm text-amber-600">Mark if patient needs a follow-up appointment</p>
                            </label>
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {treatment ? 'Update Treatment' : 'Create Treatment'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

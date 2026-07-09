import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Search,
    Check,
    AlertCircle,
    CalendarClock,
    User,
    Stethoscope,
    FileText,
    ClipboardList,
    BellRing,
} from 'lucide-react';
import {
    Treatment,
    TreatmentType,
    TreatmentStatus,
    CreateTreatmentDTO,
    TREATMENT_TYPE_CONFIG,
    TREATMENT_STATUS_ORDER,
    TREATMENT_STATUS_CONFIG,
    TEETH_QUADRANTS,
} from '../../types/treatment';
import { Patient } from '../../types/patient';
import { User as UserType } from '../../types/user';
import { createTreatment, updateTreatment, updateTreatmentStatus } from '../../services/treatment.service';
import { Button } from '../ui/Button';

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

interface TreatmentFormProps {
    onSuccess: (treatment: Treatment) => void;
    onCancel: () => void;
    treatment: Treatment | null;
    patients: Patient[];
    doctors: UserType[];
    token: string;
}

export function TreatmentForm({ onSuccess, onCancel, treatment, patients, doctors, token }: TreatmentFormProps) {
    const [formData, setFormData] = useState<{
        patientId: string;
        doctorId: string;
        dateOfTreatment: string;
        typeOfTreatment: TreatmentType;
        notes: string;
        procedure: string;
        teeth: number[];
        followUpRequired: boolean;
        status: TreatmentStatus;
    }>({
        patientId: '',
        doctorId: '',
        dateOfTreatment: new Date().toISOString().split('T')[0],
        typeOfTreatment: 'CONSULTATION',
        notes: '',
        procedure: '',
        teeth: [],
        followUpRequired: false,
        status: 'PLANNED',
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
                teeth: treatment.teeth.map((t) => t.toothNumber),
                followUpRequired: treatment.followUpRequired,
                status: treatment.status,
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
                teeth: [],
                followUpRequired: false,
                status: 'PLANNED',
            });
            setPatientSearch('');
        }
    }, [treatment, doctors]);

    const filteredPatients = patients.filter(
        (p) =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
            p.phone?.includes(patientSearch) ||
            p.email?.toLowerCase().includes(patientSearch.toLowerCase())
    );

    const handlePatientSelect = (patient: Patient) => {
        setFormData((prev) => ({ ...prev, patientId: patient.id }));
        setPatientSearch(`${patient.firstName} ${patient.lastName}`);
        setShowPatientDropdown(false);
    };

    const toggleTooth = (toothNumber: number) => {
        setFormData((prev) => ({
            ...prev,
            teeth: prev.teeth.includes(toothNumber)
                ? prev.teeth.filter((t) => t !== toothNumber)
                : [...prev.teeth, toothNumber].sort((a, b) => a - b),
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
                result = await updateTreatment(
                    treatment.id,
                    {
                        notes: formData.notes || undefined,
                        procedure: formData.procedure || undefined,
                        teeth: formData.teeth.map((toothNumber) => ({ toothNumber })),
                        followUpRequired: formData.followUpRequired,
                    },
                    token
                );
                if (formData.status !== treatment.status) {
                    result = await updateTreatmentStatus(treatment.id, formData.status, token);
                }
            } else {
                const payload: CreateTreatmentDTO = {
                    patientId: formData.patientId,
                    doctorId: formData.doctorId,
                    dateOfTreatment: formData.dateOfTreatment,
                    typeOfTreatment: formData.typeOfTreatment,
                    notes: formData.notes || undefined,
                    procedure: formData.procedure || undefined,
                    teeth: formData.teeth.map((toothNumber) => ({ toothNumber })),
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

    const selectedTypeConfig = TREATMENT_TYPE_CONFIG[formData.typeOfTreatment];
    const inputClass =
        'w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

    const toothButtonClass = (tooth: number) =>
        `flex h-8 w-7 items-center justify-center rounded text-xs font-medium transition-all ${
            formData.teeth.includes(tooth)
                ? 'bg-primary-600 text-white shadow-sm'
                : 'border border-surface-200 bg-white text-surface-600 hover:border-primary-300 hover:bg-primary-50'
        }`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <FormSection icon={CalendarClock} title="Who & When" tone="primary">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                            <User className="h-4 w-4 text-surface-500" />
                            Patient <span className="text-danger-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-surface-400" />
                            </div>
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                    setShowPatientDropdown(true);
                                    if (!e.target.value) {
                                        setFormData((prev) => ({ ...prev, patientId: '' }));
                                    }
                                }}
                                onFocus={() => setShowPatientDropdown(true)}
                                placeholder="Search patient by name, phone, or email..."
                                className={`${inputClass} pl-10`}
                                disabled={!!treatment}
                            />
                        </div>
                        {showPatientDropdown && !treatment && filteredPatients.length > 0 && (
                            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-surface-200 bg-white shadow-lg">
                                {filteredPatients.slice(0, 8).map((patient) => (
                                    <button
                                        key={patient.id}
                                        type="button"
                                        onClick={() => handlePatientSelect(patient)}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-50"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700">
                                            {patient.firstName[0]}
                                            {patient.lastName[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-surface-900">
                                                {patient.firstName} {patient.lastName}
                                            </p>
                                            <p className="truncate text-xs text-surface-500">{patient.phone || patient.email}</p>
                                        </div>
                                        {formData.patientId === patient.id && <Check className="ml-auto h-4 w-4 shrink-0 text-primary-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                            <Stethoscope className="h-4 w-4 text-surface-500" />
                            Doctor <span className="text-danger-500">*</span>
                        </label>
                        <select
                            value={formData.doctorId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, doctorId: e.target.value }))}
                            className={inputClass}
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

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-surface-700">
                        <CalendarClock className="h-4 w-4 text-surface-500" />
                        Treatment Date <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={formData.dateOfTreatment}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfTreatment: e.target.value }))}
                        className={inputClass}
                        disabled={!!treatment}
                    />
                </div>
            </FormSection>

            <FormSection icon={Stethoscope} title="Treatment" tone="info">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-700">
                            Treatment Type <span className="text-danger-500">*</span>
                        </label>
                        <select
                            value={formData.typeOfTreatment}
                            onChange={(e) => setFormData((prev) => ({ ...prev, typeOfTreatment: e.target.value as TreatmentType }))}
                            className={inputClass}
                            disabled={!!treatment}
                        >
                            {Object.entries(TREATMENT_TYPE_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {treatment && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as TreatmentStatus }))}
                                className={inputClass}
                            >
                                {TREATMENT_STATUS_ORDER.map((status) => (
                                    <option key={status} value={status}>
                                        {TREATMENT_STATUS_CONFIG[status].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div
                    className="rounded-lg border-2 border-dashed p-4"
                    style={{ borderColor: selectedTypeConfig.color, backgroundColor: selectedTypeConfig.bgColor }}
                >
                    <p className="text-sm font-semibold" style={{ color: selectedTypeConfig.color }}>
                        {selectedTypeConfig.label}
                    </p>
                    <p className="mt-1 text-sm text-surface-600">{selectedTypeConfig.description}</p>
                </div>

                <div>
                    <label className="mb-3 flex items-center gap-2 text-sm font-medium text-surface-700">
                        Teeth Involved
                        {formData.teeth.length > 0 && (
                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                                {formData.teeth.length} selected
                            </span>
                        )}
                    </label>
                    <div className="rounded-lg bg-surface-50 p-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                                {TEETH_QUADRANTS.upperRight.map((tooth) => (
                                    <button key={tooth} type="button" onClick={() => toggleTooth(tooth)} className={toothButtonClass(tooth)}>
                                        {tooth}
                                    </button>
                                ))}
                                <div className="mx-1 w-px bg-surface-300" />
                                {TEETH_QUADRANTS.upperLeft.map((tooth) => (
                                    <button key={tooth} type="button" onClick={() => toggleTooth(tooth)} className={toothButtonClass(tooth)}>
                                        {tooth}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-surface-400">Upper Arch</p>
                            <div className="my-1 w-full border-t border-surface-200" />
                            <p className="text-xs text-surface-400">Lower Arch</p>
                            <div className="flex gap-1">
                                {TEETH_QUADRANTS.lowerLeft.map((tooth) => (
                                    <button key={tooth} type="button" onClick={() => toggleTooth(tooth)} className={toothButtonClass(tooth)}>
                                        {tooth}
                                    </button>
                                ))}
                                <div className="mx-1 w-px bg-surface-300" />
                                {TEETH_QUADRANTS.lowerRight.map((tooth) => (
                                    <button key={tooth} type="button" onClick={() => toggleTooth(tooth)} className={toothButtonClass(tooth)}>
                                        {tooth}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </FormSection>

            <FormSection icon={ClipboardList} title="Clinical Details" tone="surface">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-700">Procedure Details</label>
                        <textarea
                            value={formData.procedure}
                            onChange={(e) => setFormData((prev) => ({ ...prev, procedure: e.target.value }))}
                            placeholder="Describe the procedure performed..."
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-700">
                            <FileText className="mr-1 inline h-4 w-4 text-surface-500" />
                            Clinical Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Add any clinical observations..."
                            rows={3}
                            className={`${inputClass} resize-none`}
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
                    id="followUpRequired"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData((prev) => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-surface-700">Follow-up appointment required</span>
            </label>

            <div className="flex gap-3 border-t border-surface-100 pt-4">
                <Button type="submit" disabled={loading} isLoading={loading} className="flex-1">
                    {treatment ? 'Update Treatment' : 'Create Treatment'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} className="flex-1">
                    Cancel
                </Button>
            </div>
        </form>
    );
}

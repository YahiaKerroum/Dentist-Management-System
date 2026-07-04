export type ToothStatus =
    | 'HEALTHY'
    | 'DECAYED'
    | 'FILLED'
    | 'CROWNED'
    | 'ROOT_CANAL'
    | 'MISSING'
    | 'IMPLANT'
    | 'EXTRACTION_NEEDED'
    | 'SEALANT'
    | 'OTHER';

export interface PatientToothRecord {
    id: string;
    patientId: string;
    toothNumber: number;
    status: ToothStatus;
    notes: string | null;
    updatedAt: string;
    updatedById: string | null;
}

export interface PatientToothResponse {
    success: boolean;
    data: PatientToothRecord[];
    message?: string;
}

export interface SinglePatientToothResponse {
    success: boolean;
    data: PatientToothRecord;
    message?: string;
}

// Legend/coloring for the odontogram chart. Classes reference only shades
// confirmed present in tailwind.config.js (warning/success/danger/info are
// limited to 50/100/500/600/700 — see clinic_pulse_backend_status memory).
export const TOOTH_STATUS_CONFIG: Record<
    ToothStatus,
    { label: string; fill: string; border: string; swatch: string; text: string }
> = {
    HEALTHY: { label: 'Healthy', fill: 'fill-surface-100', border: 'border-surface-300', swatch: 'bg-surface-300', text: 'text-surface-500' },
    DECAYED: { label: 'Decayed', fill: 'fill-danger-100', border: 'border-danger-600', swatch: 'bg-danger-600', text: 'text-danger-700' },
    FILLED: { label: 'Filled', fill: 'fill-info-100', border: 'border-info-600', swatch: 'bg-info-600', text: 'text-info-700' },
    CROWNED: { label: 'Crowned', fill: 'fill-violet-100', border: 'border-violet-500', swatch: 'bg-violet-500', text: 'text-violet-700' },
    ROOT_CANAL: { label: 'Root Canal', fill: 'fill-warning-100', border: 'border-warning-600', swatch: 'bg-warning-600', text: 'text-warning-700' },
    MISSING: { label: 'Missing', fill: 'fill-surface-200', border: 'border-surface-400', swatch: 'bg-surface-400', text: 'text-surface-400' },
    IMPLANT: { label: 'Implant', fill: 'fill-cyan-100', border: 'border-cyan-500', swatch: 'bg-cyan-500', text: 'text-cyan-700' },
    EXTRACTION_NEEDED: { label: 'Extraction Needed', fill: 'fill-danger-50', border: 'border-danger-700', swatch: 'bg-danger-700', text: 'text-danger-700' },
    SEALANT: { label: 'Sealant', fill: 'fill-pink-100', border: 'border-pink-500', swatch: 'bg-pink-500', text: 'text-pink-700' },
    OTHER: { label: 'Other', fill: 'fill-surface-100', border: 'border-surface-500', swatch: 'bg-surface-500', text: 'text-surface-600' },
};

export const TOOTH_STATUS_OPTIONS: ToothStatus[] = [
    'HEALTHY',
    'DECAYED',
    'FILLED',
    'CROWNED',
    'ROOT_CANAL',
    'MISSING',
    'IMPLANT',
    'EXTRACTION_NEEDED',
    'SEALANT',
    'OTHER',
];

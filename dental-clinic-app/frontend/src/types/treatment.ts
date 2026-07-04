export type TreatmentType =
    | 'CONSULTATION'
    | 'FILLING'
    | 'EXTRACTION'
    | 'ROOT_CANAL'
    | 'CLEANING'
    | 'IMPLANT'
    | 'ORTHODONTICS'
    | 'OTHER';

export type TreatmentStatus =
    | 'PLANNED'
    | 'IN_PROGRESS'
    | 'NEEDS_FOLLOW_UP'
    | 'COMPLETED'
    | 'BILLED'
    | 'ARCHIVED';

export interface TreatmentToothRecord {
    id: string;
    treatmentId: string;
    toothNumber: number;
    notes: string | null;
    createdAt: string;
}

export interface Treatment {
    id: string;
    doctorId: string;
    patientId: string;
    dateOfTreatment: string;
    typeOfTreatment: TreatmentType;
    notes: string | null;
    procedure: string | null;
    teeth: TreatmentToothRecord[];
    followUpRequired: boolean;
    status: TreatmentStatus;
    appointmentId: string | null;
    createdAt: string;
    updatedAt: string;
    doctor: {
        id: string;
        userId: string;
        specialization: string | null;
        user: {
            firstName: string;
            lastName: string;
        };
    };
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        email: string | null;
        dateOfBirth: string | null;
    };
    appointment?: {
        id: string;
        date: string;
        status: string;
    } | null;
}

export interface ToothInput {
    toothNumber: number;
    notes?: string;
}

export interface CreateTreatmentDTO {
    doctorId: string;
    patientId: string;
    dateOfTreatment: string;
    typeOfTreatment: TreatmentType;
    notes?: string;
    procedure?: string;
    teeth?: ToothInput[];
    followUpRequired?: boolean;
    appointmentId?: string;
}

export interface UpdateTreatmentDTO {
    notes?: string;
    procedure?: string;
    teeth?: ToothInput[];
    followUpRequired?: boolean;
}

export interface TreatmentResponse {
    success: boolean;
    data: Treatment[];
    message?: string;
}

export interface SingleTreatmentResponse {
    success: boolean;
    data: Treatment;
    message?: string;
}

export interface TreatmentFilters {
    doctorId?: string;
    patientId?: string;
    status?: TreatmentStatus;
    dateFrom?: string;
    dateTo?: string;
}

// Treatment status display configuration — one entry per Kanban board column
export const TREATMENT_STATUS_CONFIG: Record<TreatmentStatus, { label: string; color: string; bgColor: string }> = {
    PLANNED: { label: 'Planned', color: '#64756f', bgColor: '#f0f3f2' },
    IN_PROGRESS: { label: 'In Progress', color: '#2563eb', bgColor: '#dbeafe' },
    NEEDS_FOLLOW_UP: { label: 'Needs Follow-up', color: '#d97706', bgColor: '#fef3c7' },
    COMPLETED: { label: 'Completed', color: '#16a34a', bgColor: '#dcfce7' },
    BILLED: { label: 'Billed', color: '#188467', bgColor: '#d7f6e8' },
    ARCHIVED: { label: 'Archived', color: '#495650', bgColor: '#e2e8e6' },
};

export const TREATMENT_STATUS_ORDER: TreatmentStatus[] = [
    'PLANNED',
    'IN_PROGRESS',
    'NEEDS_FOLLOW_UP',
    'COMPLETED',
    'BILLED',
    'ARCHIVED',
];

// Treatment type display configuration with custom dental icons
export const TREATMENT_TYPE_CONFIG: Record<TreatmentType, { label: string; description: string; color: string; bgColor: string; iconPath: string }> = {
    CONSULTATION: { 
        label: 'Consultation', 
        description: 'Initial examination and diagnosis to assess oral health and discuss treatment options',
        color: '#3b82f6', 
        bgColor: '#dbeafe', 
        iconPath: '/icons/treatments/consultation.png' 
    },
    FILLING: { 
        label: 'Filling', 
        description: 'Restoration of a damaged tooth using composite resin or amalgam materials',
        color: '#8b5cf6', 
        bgColor: '#ede9fe', 
        iconPath: '/icons/treatments/filling.png' 
    },
    EXTRACTION: { 
        label: 'Extraction', 
        description: 'Surgical removal of a tooth that is severely damaged, decayed, or causing problems',
        color: '#ef4444', 
        bgColor: '#fee2e2', 
        iconPath: '/icons/treatments/extraction.png' 
    },
    ROOT_CANAL: { 
        label: 'Root Canal', 
        description: 'Endodontic treatment to remove infected pulp and save the natural tooth',
        color: '#f59e0b', 
        bgColor: '#fef3c7', 
        iconPath: '/icons/treatments/root-canal.png' 
    },
    CLEANING: { 
        label: 'Cleaning', 
        description: 'Professional dental cleaning to remove plaque, tartar, and surface stains',
        color: '#10b981', 
        bgColor: '#d1fae5', 
        iconPath: '/icons/treatments/cleaning.png' 
    },
    IMPLANT: { 
        label: 'Implant', 
        description: 'Permanent artificial tooth root surgically placed to support a crown or bridge',
        color: '#6366f1', 
        bgColor: '#e0e7ff', 
        iconPath: '/icons/treatments/implant.png' 
    },
    ORTHODONTICS: { 
        label: 'Orthodontics', 
        description: 'Correction of teeth alignment and bite issues using braces or aligners',
        color: '#ec4899', 
        bgColor: '#fce7f3', 
        iconPath: '/icons/treatments/orthodontics.png' 
    },
    OTHER: { 
        label: 'Other', 
        description: 'Other dental procedures not listed in the standard treatment categories',
        color: '#6b7280', 
        bgColor: '#f3f4f6', 
        iconPath: '/icons/treatments/other.svg' 
    },
};

// Teeth numbering (Universal Numbering System)
export const TEETH_NUMBERS = Array.from({ length: 32 }, (_, i) => i + 1);

export const TEETH_QUADRANTS = {
    upperRight: [1, 2, 3, 4, 5, 6, 7, 8],
    upperLeft: [9, 10, 11, 12, 13, 14, 15, 16],
    lowerLeft: [17, 18, 19, 20, 21, 22, 23, 24],
    lowerRight: [25, 26, 27, 28, 29, 30, 31, 32],
};

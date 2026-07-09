

export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    dateOfTreatment: string;
    durationMinutes: number;
    status: AppointmentStatus;
    typeOfTreatment: TreatmentType | null;
    notes: string | null;
    procedure: string | null;
    teethInvolved: number[];
    followUpRequired: boolean;
    roomId: string | null;
    createdAt: string;
    updatedAt: string;
    createdByUserId: string | null;

    doctor?: {
        id: string;
        user: {
            firstName: string;
            lastName: string;
        };
    };

    patient?: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        email: string | null;
    };

    room?: {
        id: string;
        name: string;
        type: string;
    } | null;
}


export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CHECKED_IN = 'CHECKED_IN',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}


export enum TreatmentType {
    CONSULTATION = 'CONSULTATION',
    FILLING = 'FILLING',
    EXTRACTION = 'EXTRACTION',
    ROOT_CANAL = 'ROOT_CANAL',
    CLEANING = 'CLEANING',
    IMPLANT = 'IMPLANT',
    ORTHODONTICS = 'ORTHODONTICS',
    OTHER = 'OTHER'
}

export interface CreateAppointmentDTO {
    doctorId: string;
    patientId: string;
    dateOfTreatment: string; // ISO date string
    typeOfTreatment?: TreatmentType;
    notes?: string;
    procedure?: string;
    teethInvolved?: number[];
    followUpRequired?: boolean;
    roomId?: string | null;
    durationMinutes?: number;
}

export interface UpdateAppointmentDTO {
    dateOfTreatment?: string;
    typeOfTreatment?: TreatmentType;
    notes?: string;
    procedure?: string;
    teethInvolved?: number[];
    followUpRequired?: boolean;
    status?: AppointmentStatus;
    roomId?: string | null;
    durationMinutes?: number;
}

export interface AppointmentResponse {
    success: boolean;
    data: Appointment[];
    message?: string;
}

export interface SingleAppointmentResponse {
    success: boolean;
    data: Appointment;
    message?: string;
}
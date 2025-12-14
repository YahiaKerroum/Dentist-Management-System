

export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    dateOfTreatment: string;
    status: AppointmentStatus;
    typeOfTreatment: TreatmentType | null;
    notes: string | null;
    procedure: string | null;
    teethInvolved: number[];
    followUpRequired: boolean;
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
}


export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',

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
}

export interface UpdateAppointmentDTO {
    dateOfTreatment?: string;
    typeOfTreatment?: TreatmentType;
    notes?: string;
    procedure?: string;
    teethInvolved?: number[];
    followUpRequired?: boolean;
    status?: AppointmentStatus;
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
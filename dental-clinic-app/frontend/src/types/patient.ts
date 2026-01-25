export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    phone: string | null;
    email: string | null;
    primaryDentistId: string | null;
    primaryDentist?: {
        user: {
            firstName: string;
            lastName: string;
        };
    } | null;
    createdAt: string;
    updatedAt: string;
    registeredById: string | null;
}

export interface CreatePatientDTO {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    primaryDentistId?: string;
}

export interface UpdatePatientDTO {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    primaryDentistId?: string;
}

export interface PatientResponse {
    success: boolean;
    data: Patient[];
    message?: string;
}

export interface SinglePatientResponse {
    success: boolean;
    data: Patient;
    message?: string;
}

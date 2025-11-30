export interface DoctorProfile {
    id: string;
    specialization?: string;
    workingTime?: any; // JSON field for working hours
    patientCount?: number; // Added by backend for stats
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: 'MANAGER' | 'DOCTOR' | 'ASSISTANT' | 'RECEPTIONIST';
    phone?: string;
    createdAt: string;
    updatedAt: string;
    doctorProfile?: DoctorProfile;
}

export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    workingTime?: any;
}

export interface UserResponse {
    success: boolean;
    data: User;
    message?: string;
}

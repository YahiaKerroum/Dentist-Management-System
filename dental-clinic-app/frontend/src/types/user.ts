export type Role = 'MANAGER' | 'DOCTOR' | 'ASSISTANT';

export interface DoctorProfile {
    id: string;
    specialization?: string;
    workingTime?: any; // JSON field for working hours
    patientCount?: number; // Added by backend for stats
    createdAt: string;
    updatedAt: string;
}

export interface ManagerProfile {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface AssistantProfile {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: Role;
    phone?: string;
    createdAt: string;
    updatedAt: string;
    doctorProfile?: DoctorProfile;
    managerProfile?: ManagerProfile;
    assistantProfile?: AssistantProfile;
    permissions?: string[];
}

export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: Role;
    phone?: string;
    specialization?: string;
    workingTime?: any;
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

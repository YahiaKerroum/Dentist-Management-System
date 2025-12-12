
import {
    Appointment,
    CreateAppointmentDTO,
    UpdateAppointmentDTO,
    AppointmentResponse,
    SingleAppointmentResponse,
    AppointmentStatus
} from "../types/appointment";

const API_URL = "http://localhost:4000/api/appointments";

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// GET ALL APPOINTMENTS
export async function getAllAppointments(filters?: {
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    dateFrom?: string;
    dateTo?: string;
}): Promise<Appointment[]> {
    let url = API_URL;
    
    if (filters) {
        const params = new URLSearchParams();
        if (filters.doctorId) params.append('doctorId', filters.doctorId);
        if (filters.patientId) params.append('patientId', filters.patientId);
        if (filters.status) params.append('status', filters.status);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
    }

    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    const data: AppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
    }

    return data.data;
}

// GET APPOINTMENT BY ID
export async function getAppointmentById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
    });

    const data: SingleAppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch appointment");
    }

    return data.data;
}

// SEARCH APPOINTMENTS
export async function searchAppointments(query: string): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
    });

    const data: AppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Search failed");
    }

    return data.data;
}

// CREATE NEW APPOINTMENT
export async function createAppointment(
    payload: CreateAppointmentDTO
): Promise<Appointment> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const data: SingleAppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create appointment");
    }

    return data.data;
}

// UPDATE APPOINTMENT
export async function updateAppointment(
    id: string,
    payload: UpdateAppointmentDTO
): Promise<Appointment> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const data: SingleAppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update appointment");
    }

    return data.data;
}

// UPDATE APPOINTMENT STATUS
export async function updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
): Promise<Appointment> {
    const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });

    const data: SingleAppointmentResponse = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update appointment status");
    }

    return data.data;
}

// DELETE APPOINTMENT
export async function deleteAppointment(id: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete appointment");
    }

    return true;
}
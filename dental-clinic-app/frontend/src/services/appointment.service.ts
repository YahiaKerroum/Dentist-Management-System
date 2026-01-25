
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

async function handleResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
    const data = await response.json().catch(() => null);
    const message = (data as any)?.message || (data as any)?.error?.message || fallbackMessage;

    if (!response.ok) {
        throw new Error(message);
    }

    return (data as any)?.data as T;
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

    return handleResponse<Appointment[]>(response, "Failed to fetch appointments");
}

// GET APPOINTMENT BY ID
export async function getAppointmentById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
    });

    return handleResponse<Appointment>(response, "Failed to fetch appointment");
}

// SEARCH APPOINTMENTS
export async function searchAppointments(query: string): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
    });

    return handleResponse<Appointment[]>(response, "Search failed");
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

    return handleResponse<Appointment>(response, "Failed to create appointment");
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

    return handleResponse<Appointment>(response, "Failed to update appointment");
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

    return handleResponse<Appointment>(response, "Failed to update appointment status");
}

// DELETE APPOINTMENT
export async function deleteAppointment(id: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    await handleResponse(response, "Failed to delete appointment");
    return true;
}
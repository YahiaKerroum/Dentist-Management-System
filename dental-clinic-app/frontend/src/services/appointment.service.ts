import {
    Appointment,
    CreateAppointmentDTO,
    UpdateAppointmentDTO,
    AppointmentStatus
} from "../types/appointment";
import { apiClient } from "../lib/apiClient";

const RESOURCE = "/appointments";

export async function getAllAppointments(filters?: {
    doctorId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    dateFrom?: string;
    dateTo?: string;
}): Promise<Appointment[]> {
    const { data } = await apiClient.get(RESOURCE, { params: filters });
    return data.data;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
    const { data } = await apiClient.get(`${RESOURCE}/${id}`);
    return data.data;
}

export async function searchAppointments(query: string): Promise<Appointment[]> {
    const { data } = await apiClient.get(`${RESOURCE}/search`, { params: { query } });
    return data.data;
}

export async function createAppointment(payload: CreateAppointmentDTO): Promise<Appointment> {
    const { data } = await apiClient.post(RESOURCE, payload);
    return data.data;
}

export async function updateAppointment(id: string, payload: UpdateAppointmentDTO): Promise<Appointment> {
    const { data } = await apiClient.put(`${RESOURCE}/${id}`, payload);
    return data.data;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const { data } = await apiClient.patch(`${RESOURCE}/${id}/status`, { status });
    return data.data;
}

export async function deleteAppointment(id: string): Promise<boolean> {
    await apiClient.delete(`${RESOURCE}/${id}`);
    return true;
}

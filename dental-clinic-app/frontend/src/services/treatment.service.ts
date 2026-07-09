import {
    TreatmentResponse,
    SingleTreatmentResponse,
    CreateTreatmentDTO,
    UpdateTreatmentDTO,
    TreatmentFilters,
    TreatmentStatus,
} from '../types/treatment';
import { apiClient, ApiError, authHeader } from '../lib/apiClient';

const RESOURCE = '/treatments';

function rethrow(err: unknown, fallback: string, forbiddenMessage: string): never {
    if (err instanceof ApiError) {
        throw new Error(err.status === 403 ? forbiddenMessage : err.message || fallback);
    }
    throw err instanceof Error ? err : new Error(fallback);
}

export const getTreatments = async (
    token: string,
    filters?: TreatmentFilters
): Promise<TreatmentResponse> => {
    const params: Record<string, string> = {};
    if (filters?.doctorId) params.doctorId = filters.doctorId;
    if (filters?.patientId) params.patientId = filters.patientId;
    if (filters?.status) params.status = filters.status;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    try {
        const { data } = await apiClient.get(RESOURCE, { params, headers: authHeader(token) });
        return data;
    } catch (err) {
        return rethrow(err, 'Failed to fetch treatments', 'You do not have permission to view treatments');
    }
};

export const getTreatmentById = async (id: string, token: string): Promise<SingleTreatmentResponse> => {
    try {
        const { data } = await apiClient.get(`${RESOURCE}/${id}`, { headers: authHeader(token) });
        return data;
    } catch (err) {
        return rethrow(err, 'Failed to fetch treatment', 'You do not have permission to view this treatment');
    }
};

export const createTreatment = async (
    data: CreateTreatmentDTO,
    token: string
): Promise<SingleTreatmentResponse> => {
    const payload = {
        ...data,
        dateOfTreatment: new Date(data.dateOfTreatment).toISOString(),
    };

    try {
        const { data: body } = await apiClient.post(RESOURCE, payload, { headers: authHeader(token) });
        return body;
    } catch (err) {
        return rethrow(err, 'Failed to create treatment', 'You do not have permission to create treatments');
    }
};

export const updateTreatment = async (
    id: string,
    data: UpdateTreatmentDTO,
    token: string
): Promise<SingleTreatmentResponse> => {
    try {
        const { data: body } = await apiClient.put(`${RESOURCE}/${id}`, data, { headers: authHeader(token) });
        return body;
    } catch (err) {
        return rethrow(err, 'Failed to update treatment', 'You do not have permission to update treatments');
    }
};

export const updateTreatmentStatus = async (
    id: string,
    status: TreatmentStatus,
    token: string
): Promise<SingleTreatmentResponse> => {
    try {
        const { data } = await apiClient.patch(`${RESOURCE}/${id}/status`, { status }, { headers: authHeader(token) });
        return data;
    } catch (err) {
        return rethrow(err, 'Failed to update treatment status', 'You do not have permission to update treatments');
    }
};

export const deleteTreatment = async (id: string, token: string): Promise<void> => {
    try {
        await apiClient.delete(`${RESOURCE}/${id}`, { headers: authHeader(token) });
    } catch (err) {
        return rethrow(err, 'Failed to delete treatment', 'You do not have permission to delete treatments');
    }
};

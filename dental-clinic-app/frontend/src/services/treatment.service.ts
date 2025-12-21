import {
    TreatmentResponse,
    SingleTreatmentResponse,
    CreateTreatmentDTO,
    UpdateTreatmentDTO,
    TreatmentFilters,
} from '../types/treatment';

const API_URL = 'http://localhost:4000/api/treatments';

export const getTreatments = async (
    token: string,
    filters?: TreatmentFilters
): Promise<TreatmentResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        let message = 'Failed to fetch treatments';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to view treatments';
        }
        throw new Error(message);
    }

    return response.json();
};

export const getTreatmentById = async (
    id: string,
    token: string
): Promise<SingleTreatmentResponse> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        let message = 'Failed to fetch treatment';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to view this treatment';
        }
        throw new Error(message);
    }

    return response.json();
};

export const createTreatment = async (
    data: CreateTreatmentDTO,
    token: string
): Promise<SingleTreatmentResponse> => {
    const payload = {
        ...data,
        dateOfTreatment: new Date(data.dateOfTreatment).toISOString(),
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let message = 'Failed to create treatment';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to create treatments';
        }
        throw new Error(message);
    }

    return response.json();
};

export const updateTreatment = async (
    id: string,
    data: UpdateTreatmentDTO,
    token: string
): Promise<SingleTreatmentResponse> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        let message = 'Failed to update treatment';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to update treatments';
        }
        throw new Error(message);
    }

    return response.json();
};

export const markTreatmentCompleted = async (
    id: string,
    token: string
): Promise<SingleTreatmentResponse> => {
    const response = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        let message = 'Failed to mark treatment as completed';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to complete treatments';
        }
        throw new Error(message);
    }

    return response.json();
};

export const deleteTreatment = async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        let message = 'Failed to delete treatment';
        try {
            const errorData = await response.json();
            message = errorData.message || message;
        } catch (_) {}
        if (response.status === 403) {
            message = 'You do not have permission to delete treatments';
        }
        throw new Error(message);
    }
};

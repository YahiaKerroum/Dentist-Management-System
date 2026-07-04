import { PatientResponse, SinglePatientResponse, CreatePatientDTO, UpdatePatientDTO } from '../types/patient';
import { apiClient, ApiError, authHeader } from '../lib/apiClient';

const RESOURCE = '/patients';

function rethrow(err: unknown, fallback: string, forbiddenMessage: string): never {
  if (err instanceof ApiError) {
    throw new Error(err.status === 403 ? forbiddenMessage : err.message || fallback);
  }
  throw err instanceof Error ? err : new Error(fallback);
}

export const getPatients = async (token: string): Promise<PatientResponse> => {
  try {
    const { data } = await apiClient.get(RESOURCE, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to fetch patients', 'You do not have permission to view patients');
  }
};

export const getPatientById = async (id: string, token: string): Promise<SinglePatientResponse> => {
  try {
    const { data } = await apiClient.get(`${RESOURCE}/${id}`, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to fetch patient', 'You do not have permission to view patients');
  }
};

export const createPatient = async (data: CreatePatientDTO, token: string): Promise<SinglePatientResponse> => {
  const payload: any = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    primaryDentistId: data.primaryDentistId,
  };
  if (data.dateOfBirth) {
    payload.dateOfBirth = new Date(data.dateOfBirth);
  }

  try {
    const { data: body } = await apiClient.post(RESOURCE, payload, { headers: authHeader(token) });
    return body;
  } catch (err) {
    return rethrow(err, 'Failed to create patient', 'You do not have permission to create patients');
  }
};

export const updatePatient = async (
  id: string,
  data: UpdatePatientDTO,
  token: string
): Promise<SinglePatientResponse> => {
  const payload: any = { ...data };
  if (data.dateOfBirth) {
    payload.dateOfBirth = new Date(data.dateOfBirth);
  }

  try {
    const { data: body } = await apiClient.put(`${RESOURCE}/${id}`, payload, { headers: authHeader(token) });
    return body;
  } catch (err) {
    return rethrow(err, 'Failed to update patient', 'You do not have permission to update patients');
  }
};

export const deletePatient = async (id: string, token: string): Promise<void> => {
  try {
    await apiClient.delete(`${RESOURCE}/${id}`, { headers: authHeader(token) });
  } catch (err) {
    return rethrow(err, 'Failed to delete patient', 'You do not have permission to delete patients');
  }
};

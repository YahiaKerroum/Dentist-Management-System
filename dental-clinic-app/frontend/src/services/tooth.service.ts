import { PatientToothResponse, SinglePatientToothResponse, ToothStatus } from '../types/tooth';
import { apiClient, ApiError, authHeader } from '../lib/apiClient';

function rethrow(err: unknown, fallback: string, forbiddenMessage: string): never {
  if (err instanceof ApiError) {
    throw new Error(err.status === 403 ? forbiddenMessage : err.message || fallback);
  }
  throw err instanceof Error ? err : new Error(fallback);
}

export const getPatientOdontogram = async (
  patientId: string,
  token: string
): Promise<PatientToothResponse> => {
  try {
    const { data } = await apiClient.get(`/patients/${patientId}/odontogram`, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to load odontogram', 'You do not have permission to view treatments');
  }
};

export const upsertToothStatus = async (
  patientId: string,
  toothNumber: number,
  status: ToothStatus,
  notes: string | undefined,
  token: string
): Promise<SinglePatientToothResponse> => {
  try {
    const { data } = await apiClient.put(
      `/patients/${patientId}/odontogram/${toothNumber}`,
      { status, notes },
      { headers: authHeader(token) }
    );
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to update tooth', 'You do not have permission to update treatments');
  }
};

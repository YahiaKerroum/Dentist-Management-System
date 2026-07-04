import { apiClient, ApiError, authHeader } from '../lib/apiClient';

const RESOURCE = '/documents';

export interface Document {
  id: string;
  patientId: string;
  name: string;
  type: string;
  filePath: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentResponse {
  success: boolean;
  data: Document[];
  message?: string;
}

export interface SingleDocumentResponse {
  success: boolean;
  data: Document;
  message?: string;
}

export interface CreateDocumentDTO {
  patientId: string;
  name: string;
  type: string;
  filePath: string;
}

export interface UpdateDocumentDTO {
  name?: string;
  type?: string;
}

function rethrow(err: unknown, fallback: string, forbiddenMessage: string): never {
  if (err instanceof ApiError) {
    throw new Error(err.status === 403 ? forbiddenMessage : err.message || fallback);
  }
  throw err instanceof Error ? err : new Error(fallback);
}

export const uploadDocument = async (
  data: { patientId: string; name?: string; type?: string; file: File },
  token: string
): Promise<SingleDocumentResponse> => {
  const formData = new FormData();
  formData.append('patientId', data.patientId);
  if (data.name) formData.append('name', data.name);
  if (data.type) formData.append('type', data.type);
  formData.append('file', data.file);

  try {
    const { data: body } = await apiClient.post(`${RESOURCE}/upload`, formData, { headers: authHeader(token) });
    return body;
  } catch (err) {
    return rethrow(err, 'Failed to upload document', 'You do not have permission to upload documents');
  }
};

export const getDocumentsByPatientId = async (patientId: string, token: string): Promise<DocumentResponse> => {
  try {
    const { data } = await apiClient.get(`${RESOURCE}/patient/${patientId}`, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to fetch documents', 'You do not have permission to view documents');
  }
};

export const getDocumentById = async (id: string, token: string): Promise<SingleDocumentResponse> => {
  try {
    const { data } = await apiClient.get(`${RESOURCE}/${id}`, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to fetch document', 'You do not have permission to view this document');
  }
};

export const createDocument = async (data: CreateDocumentDTO, token: string): Promise<SingleDocumentResponse> => {
  try {
    const { data: body } = await apiClient.post(RESOURCE, data, { headers: authHeader(token) });
    return body;
  } catch (err) {
    return rethrow(err, 'Failed to upload document', 'You do not have permission to upload documents');
  }
};

export const updateDocument = async (
  id: string,
  data: UpdateDocumentDTO,
  token: string
): Promise<SingleDocumentResponse> => {
  try {
    const { data: body } = await apiClient.put(`${RESOURCE}/${id}`, data, { headers: authHeader(token) });
    return body;
  } catch (err) {
    return rethrow(err, 'Failed to update document', 'You can only update documents you uploaded');
  }
};

export const deleteDocument = async (id: string, token: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { data } = await apiClient.delete(`${RESOURCE}/${id}`, { headers: authHeader(token) });
    return data;
  } catch (err) {
    return rethrow(err, 'Failed to delete document', 'You can only delete documents you uploaded');
  }
};

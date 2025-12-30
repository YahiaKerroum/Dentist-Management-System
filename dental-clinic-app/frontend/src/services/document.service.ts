const API_URL = 'http://localhost:4000/api/documents';

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

export const uploadDocument = async (
  data: { patientId: string; name?: string; type?: string; file: File },
  token: string
): Promise<SingleDocumentResponse> => {
  const formData = new FormData();
  formData.append("patientId", data.patientId);
  if (data.name) formData.append("name", data.name);
  if (data.type) formData.append("type", data.type);
  formData.append("file", data.file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    let message = 'Failed to upload document';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch (_) {}
    if (response.status === 403) {
      message = 'You do not have permission to upload documents';
    }
    throw new Error(message);
  }

  return response.json();
};

export interface UpdateDocumentDTO {
  name?: string;
  type?: string;
}

export const getDocumentsByPatientId = async (patientId: string, token: string): Promise<DocumentResponse> => {
  const response = await fetch(`${API_URL}/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch documents';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to view documents';
    }
    throw new Error(message);
  }

  return response.json();
};

export const getDocumentById = async (id: string, token: string): Promise<SingleDocumentResponse> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch document';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to view this document';
    }
    throw new Error(message);
  }

  return response.json();
};

export const createDocument = async (data: CreateDocumentDTO, token: string): Promise<SingleDocumentResponse> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Failed to upload document';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to upload documents';
    }
    throw new Error(message);
  }

  return response.json();
};

export const updateDocument = async (id: string, data: UpdateDocumentDTO, token: string): Promise<SingleDocumentResponse> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Failed to update document';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You can only update documents you uploaded';
    }
    throw new Error(message);
  }

  return response.json();
};

export const deleteDocument = async (id: string, token: string): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to delete document';
    try {
      const errorData = await response.json();
      message = errorData.error?.message || errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You can only delete documents you uploaded';
    }
    throw new Error(message);
  }

  return response.json();
};

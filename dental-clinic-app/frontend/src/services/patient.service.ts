import { PatientResponse, SinglePatientResponse, CreatePatientDTO, UpdatePatientDTO } from '../types/patient';

const API_URL = 'http://localhost:4000/api/patients';

export const getPatients = async (token: string): Promise<PatientResponse> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch patients';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to view patients';
    }
    throw new Error(message);
  }

  return response.json();
};

export const getPatientById = async (id: string, token: string): Promise<SinglePatientResponse> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to fetch patient';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to view patients';
    }
    throw new Error(message);
  }

  return response.json();
};

export const createPatient = async (data: CreatePatientDTO, token: string): Promise<SinglePatientResponse> => {
  // Convert dateOfBirth string to Date object if provided
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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Failed to create patient';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to create patients';
    }
    throw new Error(message);
  }

  return response.json();
};


export const updatePatient = async (
  id: string,
  data: UpdatePatientDTO,
  token: string
): Promise<SinglePatientResponse> => {
  // Convert dateOfBirth string to Date object if provided
  const payload: any = { ...data };
  
  if (data.dateOfBirth) {
    payload.dateOfBirth = new Date(data.dateOfBirth);
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Failed to update patient';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to update patients';
    }
    throw new Error(message);
  }

  return response.json();
};


export const deletePatient = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let message = 'Failed to delete patient';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) {
      // response body may be empty; keep default message
    }
    if (response.status === 403) {
      message = 'You do not have permission to delete patients';
    }
    throw new Error(message);
  }
};

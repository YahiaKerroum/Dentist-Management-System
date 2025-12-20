import { Payment, CreatePaymentData, UpdatePaymentData, PaymentResponse } from '../types/payment.types';

const API_URL = 'http://localhost:4000/api/payments';

// Helper function to get authentication token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers with authentication
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch all payments from backend
 */
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    // Extract the nested payments array from the response
    if (data.data && typeof data.data === 'object' && 'payments' in data.data) {
      return (data.data as any).payments || [];
    }
    
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch payments'
    );
  }
};

/**
 * Fetch single payment by ID
 */
export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    if (!data.data || Array.isArray(data.data)) {
      throw new Error('Payment not found');
    }
    
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch payment'
    );
  }
};

/**
 * Fetch all payments for a specific patient
 */
export const getPaymentsByPatient = async (patientId: string): Promise<Payment[]> => {
  try {
    const response = await fetch(`${API_URL}/patient/${patientId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    // Extract the nested payments array from the response
    if (data.data && typeof data.data === 'object' && 'payments' in data.data) {
      return (data.data as any).payments || [];
    }
    
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch patient payments'
    );
  }
};

/**
 * Create new payment
 */
export const createPayment = async (paymentData: CreatePaymentData): Promise<Payment> => {
  try {
    // Client-side validation
    if (!paymentData.patientId || !paymentData.date || paymentData.amount === undefined) {
      throw new Error('Required fields are missing: patientId, date, and amount are required');
    }

    if (paymentData.amount < 0) {
      throw new Error('Amount must be a positive number');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    if (!data.data || Array.isArray(data.data)) {
      throw new Error('Failed to create payment');
    }
    
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create payment'
    );
  }
};

/**
 * Update existing payment
 */
export const updatePayment = async (
  id: string,
  paymentData: UpdatePaymentData
): Promise<Payment> => {
  try {
    // Client-side validation for amount if provided
    if (paymentData.amount !== undefined && paymentData.amount < 0) {
      throw new Error('Amount must be a positive number');
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    if (!data.data || Array.isArray(data.data)) {
      throw new Error('Failed to update payment');
    }
    
    return data.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update payment'
    );
  }
};

/**
 * Delete payment
 */
export const deletePayment = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    await handleResponse(response);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete payment'
    );
  }
};

/**
 * Search payments by keyword
 */
export const searchPayments = async (query: string): Promise<Payment[]> => {
  try {
    if (!query.trim()) {
      return getAllPayments();
    }

    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data: PaymentResponse = await handleResponse(response);
    
    // Extract the nested payments array from the response
    if (data.data && typeof data.data === 'object' && 'payments' in data.data) {
      return (data.data as any).payments || [];
    }
    
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to search payments'
    );
  }
};
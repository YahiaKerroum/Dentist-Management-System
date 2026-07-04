import { Payment, CreatePaymentData, UpdatePaymentData, PaymentResponse } from '../types/payment.types';
import { apiClient } from '../lib/apiClient';

const RESOURCE = '/payments';

function unwrapList(data: PaymentResponse): Payment[] {
  if (data.data && typeof data.data === 'object' && 'payments' in data.data) {
    return (data.data as any).payments || [];
  }
  return Array.isArray(data.data) ? data.data : [];
}

export const getAllPayments = async (): Promise<Payment[]> => {
  const { data } = await apiClient.get<PaymentResponse>(RESOURCE);
  return unwrapList(data);
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  const { data } = await apiClient.get<PaymentResponse>(`${RESOURCE}/${id}`);
  if (!data.data || Array.isArray(data.data)) {
    throw new Error('Payment not found');
  }
  return data.data;
};

export const getPaymentsByPatient = async (patientId: string): Promise<Payment[]> => {
  const { data } = await apiClient.get<PaymentResponse>(`${RESOURCE}/patient/${patientId}`);
  return unwrapList(data);
};

export const createPayment = async (paymentData: CreatePaymentData): Promise<Payment> => {
  if (!paymentData.patientId || !paymentData.date || paymentData.amount === undefined) {
    throw new Error('Required fields are missing: patientId, date, and amount are required');
  }
  if (paymentData.amount < 0) {
    throw new Error('Amount must be a positive number');
  }

  const { data } = await apiClient.post<PaymentResponse>(RESOURCE, paymentData);
  if (!data.data || Array.isArray(data.data)) {
    throw new Error('Failed to create payment');
  }
  return data.data;
};

export const updatePayment = async (id: string, paymentData: UpdatePaymentData): Promise<Payment> => {
  if (paymentData.amount !== undefined && paymentData.amount < 0) {
    throw new Error('Amount must be a positive number');
  }

  const { data } = await apiClient.put<PaymentResponse>(`${RESOURCE}/${id}`, paymentData);
  if (!data.data || Array.isArray(data.data)) {
    throw new Error('Failed to update payment');
  }
  return data.data;
};

export const deletePayment = async (id: string): Promise<void> => {
  await apiClient.delete(`${RESOURCE}/${id}`);
};

export const searchPayments = async (query: string): Promise<Payment[]> => {
  if (!query.trim()) {
    return getAllPayments();
  }
  const { data } = await apiClient.get<PaymentResponse>(`${RESOURCE}/search`, { params: { q: query } });
  return unwrapList(data);
};

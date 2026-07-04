import { Expense, CreateExpenseData, UpdateExpenseData } from '../types/expense.types';
import { apiClient, authHeader } from '../lib/apiClient';

const RESOURCE = '/expenses';

export const getExpenses = async (token: string): Promise<{ success: boolean; data: Expense[] }> => {
  const { data } = await apiClient.get(RESOURCE, { headers: authHeader(token) });
  return data;
};

export const getExpenseById = async (id: string, token: string): Promise<{ success: boolean; data: Expense }> => {
  const { data } = await apiClient.get(`${RESOURCE}/${id}`, { headers: authHeader(token) });
  return data;
};

export const createExpense = async (
  data: CreateExpenseData,
  token: string
): Promise<{ success: boolean; data: Expense }> => {
  const payload = {
    category: data.category,
    paidTo: data.paidTo,
    amount: Number(data.amount),
    date: new Date(data.date),
    notes: data.notes || '',
  };
  const { data: body } = await apiClient.post(RESOURCE, payload, { headers: authHeader(token) });
  return body;
};

export const updateExpense = async (
  id: string,
  data: UpdateExpenseData,
  token: string
): Promise<{ success: boolean; data: Expense }> => {
  const payload: any = {};
  if (data.category) payload.category = data.category;
  if (data.paidTo) payload.paidTo = data.paidTo;
  if (data.amount !== undefined) payload.amount = Number(data.amount);
  if (data.date) payload.date = new Date(data.date);
  if (data.notes !== undefined) payload.notes = data.notes;

  const { data: body } = await apiClient.put(`${RESOURCE}/${id}`, payload, { headers: authHeader(token) });
  return body;
};

export const deleteExpense = async (id: string, token: string): Promise<void> => {
  await apiClient.delete(`${RESOURCE}/${id}`, { headers: authHeader(token) });
};

export const searchExpenses = async (
  query: string,
  token: string
): Promise<{ success: boolean; data: Expense[] }> => {
  const { data } = await apiClient.get(`${RESOURCE}/search`, { params: { query }, headers: authHeader(token) });
  return data;
};

export const approveExpense = async (
  id: string,
  token: string
): Promise<{ success: boolean; data: Expense }> => {
  const { data } = await apiClient.patch(`${RESOURCE}/${id}/approve`, undefined, { headers: authHeader(token) });
  return data;
};

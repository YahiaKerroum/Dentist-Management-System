import { Expense, CreateExpenseData, UpdateExpenseData } from '../types/expense.types';

const API_URL = 'http://localhost:4000/api/expenses';

const buildHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const handleResponse = async <T>(response: Response, fallback: string): Promise<T> => {
  const data = await response.json().catch(() => null);
  const message = (data as any)?.message || (data as any)?.error?.message || fallback;

  if (!response.ok) {
    throw new Error(message);
  }

  return data as T;
};

// Get all expenses
export const getExpenses = async (token: string): Promise<{ success: boolean; data: Expense[] }> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  return handleResponse(response, 'Failed to fetch expenses');
};

// Get single expense by ID
export const getExpenseById = async (id: string, token: string): Promise<{ success: boolean; data: Expense }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  return handleResponse(response, 'Failed to fetch expense');
};

// Create new expense
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

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response, 'Failed to create expense');
};

// Update expense
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

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response, 'Failed to update expense');
};

// Delete expense
export const deleteExpense = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });

  await handleResponse(response, 'Failed to delete expense');
};

// Search expenses
export const searchExpenses = async (
  query: string,
  token: string
): Promise<{ success: boolean; data: Expense[] }> => {
  const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });

  return handleResponse(response, 'Failed to search expenses');
};

// Approve expense (Manager only)
export const approveExpense = async (
  id: string,
  token: string
): Promise<{ success: boolean; data: Expense }> => {
  const response = await fetch(`${API_URL}/${id}/approve`, {
    method: 'PATCH',
    headers: buildHeaders(token),
  });

  return handleResponse(response, 'Failed to approve expense');
};
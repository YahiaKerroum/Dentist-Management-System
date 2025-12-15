import { Expense, CreateExpenseData, UpdateExpenseData } from '../types/expense.types';

const API_URL = 'http://localhost:4000/api/expenses';

// Get all expenses
export const getExpenses = async (token: string): Promise<{ success: boolean; data: Expense[] }> => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return response.json();
};

// Get single expense by ID
export const getExpenseById = async (id: string, token: string): Promise<{ success: boolean; data: Expense }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expense');
  }

  return response.json();
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
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create expense');
  }

  return response.json();
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
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update expense');
  }

  return response.json();
};

// Delete expense
export const deleteExpense = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete expense');
  }
};

// Search expenses
export const searchExpenses = async (
  query: string,
  token: string
): Promise<{ success: boolean; data: Expense[] }> => {
  const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search expenses');
  }

  return response.json();
};
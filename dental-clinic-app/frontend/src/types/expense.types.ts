// Expense interface - matches the backend Expense model
export interface Expense {
  id: string;
  category: string;
  paidTo: string;
  amount: number;
  date: string;
  notes: string | null;
  recordedById: string | null;
  approved: boolean;
  approvedById: string | null;
  createdAt: string;
  updatedAt: string;
  // Included relations from backend
  recordedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  approvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

// Data needed to create a new expense
export interface CreateExpenseData {
  category: string;
  paidTo: string;
  amount: number;
  date: string;
  notes?: string;
}

// Data for updating an expense (all fields optional)
export interface UpdateExpenseData {
  category?: string;
  paidTo?: string;
  amount?: number;
  date?: string;
  notes?: string;
}

// API response format
export interface ExpenseResponse {
  success: boolean;
  data: Expense | Expense[];
  message?: string;
}
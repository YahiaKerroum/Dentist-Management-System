import { Patient } from '../types/patient';

// Main Payment interface
export interface Payment {
  id: string;
  name: string;
  patientId: string;
  patient: Patient;
  date: string;
  amount: number;
  method: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Data structure for creating a new payment
export interface CreatePaymentData {
  name: string;
  patientId: string;
  date: string;
  amount: number;
  method?: string;
  notes?: string;
}

// Data structure for updating an existing payment
export interface UpdatePaymentData {
  name?: string;
  patientId?: string;
  date?: string;
  amount?: number;
  method?: string;
  notes?: string;
}

// API response structure for payment operations
export interface PaymentResponse {
  success: boolean;
  data?: Payment | Payment[];
  message?: string;
}
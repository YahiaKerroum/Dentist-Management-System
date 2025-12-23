import {
  MyPatientsCountResponse,
  TotalPatientsResponse,
  MyAppointmentsResponse,
  CancellationsResponse,
  AppointmentsOverviewResponse,
  CommonTreatmentsResponse,
  ExpensesByCategoryResponse,
  ExpenseTrendsResponse,
  AppointmentHeatmapResponse,
} from '../types/report.types';

const API_URL = 'http://localhost:4000/api/reports';



// 1. My Patients Count - DOCTOR (Stat Card)
export const getMyPatientsCount = async (token: string): Promise<MyPatientsCountResponse> => {
  const response = await fetch(`${API_URL}/my-patients-count`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch my patients count');
  }

  return response.json();
};

// 2. Total Patients - MANAGER (Stat Card)
export const getTotalPatients = async (token: string): Promise<TotalPatientsResponse> => {
  const response = await fetch(`${API_URL}/total-patients`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch total patients');
  }

  return response.json();
};

// 3. My Appointments Today/This Week - DOCTOR (Table)
export const getMyAppointments = async (
  token: string,
  period: 'today' | 'week' = 'today'
): Promise<MyAppointmentsResponse> => {
  const response = await fetch(`${API_URL}/my-appointments?period=${period}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch my appointments');
  }

  return response.json();
};

// 4. Cancellations Today/This Week - ASSISTANT (Stat Card + Table)
export const getCancellations = async (
  token: string,
  period: 'today' | 'week' = 'today'
): Promise<CancellationsResponse> => {
  const response = await fetch(`${API_URL}/cancellations?period=${period}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cancellations');
  }

  return response.json();
};

// 5. Appointments Overview - MANAGER (Pie Chart)
export const getAppointmentsOverview = async (
  token: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AppointmentsOverviewResponse> => {
  let url = `${API_URL}/appointments-overview`;
  const params = new URLSearchParams();
  
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointments overview');
  }

  return response.json();
};

// 6. Most Common Treatment Types - ALL ROLES (Pie Chart)
export const getCommonTreatments = async (token: string): Promise<CommonTreatmentsResponse> => {
  const response = await fetch(`${API_URL}/common-treatments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch common treatments');
  }

  return response.json();
};

// 7. Expenses Summary by Category - MANAGER (Bar Chart)
export const getExpensesByCategory = async (
  token: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ExpensesByCategoryResponse> => {
  let url = `${API_URL}/expenses-by-category`;
  const params = new URLSearchParams();
  
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expenses by category');
  }

  return response.json();
};

// 8. Expense Trends Chart - MANAGER (Line Chart)
export const getExpenseTrends = async (
  token: string,
  months: number = 6
): Promise<ExpenseTrendsResponse> => {
  const response = await fetch(`${API_URL}/expense-trends?months=${months}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expense trends');
  }

  return response.json();
};

// 9. Appointment Heatmap - ALL ROLES (Heatmap)
export const getAppointmentHeatmap = async (token: string): Promise<AppointmentHeatmapResponse> => {
  const response = await fetch(`${API_URL}/appointment-heatmap`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointment heatmap');
  }

  return response.json();
};

// ============================================
// FRIEND'S REPORT API CALLS (9 items) - TODO
// ============================================

// TODO: 1. Upcoming Appointments (7 days) - ASSISTANT
// export const getUpcomingAppointments = async (token: string) => { };

// TODO: 2. New Patients This Month - ASSISTANT
// export const getNewPatientsThisMonth = async (token: string) => { };

// TODO: 3. Today's Appointments - ASSISTANT
// export const getTodaysAppointments = async (token: string) => { };

// TODO: 4. Treatments Performed - DOCTOR
// export const getTreatmentsPerformed = async (token: string) => { };

// TODO: 5. Payment Status - MANAGER
// export const getPaymentStatus = async (token: string) => { };

// TODO: 6. Patient Demographics - MANAGER
// export const getPatientDemographics = async (token: string) => { };

// TODO: 7. Revenue Generated - DOCTOR/MANAGER
// export const getRevenueGenerated = async (token: string) => { };

// TODO: 8. Total Revenue Trend - MANAGER
// export const getTotalRevenueTrend = async (token: string, months: number) => { };

// TODO: 9. Staff Performance - MANAGER
// export const getStaffPerformance = async (token: string) => { };
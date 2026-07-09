import {
  ClinicPulseResponse,
  MyPatientsCountResponse,
  TotalPatientsResponse,
  MyAppointmentsResponse,
  CancellationsResponse,
  AppointmentsOverviewResponse,
  CommonTreatmentsResponse,
  ExpensesByCategoryResponse,
  ExpenseTrendsResponse,
  AppointmentHeatmapResponse,
  UpcomingAppointmentsResponse,
  NewPatientsResponse,
  TodaysAppointmentsResponse,
  TreatmentsPerformedResponse,
  PaymentStatusResponse,
  PatientDemographicsResponse,
  RevenueGeneratedResponse,
  RevenueTrendResponse,
  StaffPerformanceResponse,
} from '../types/report.types';
import { apiClient, authHeader } from '../lib/apiClient';

const RESOURCE = '/reports';

async function get<T>(path: string, token: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.get<T>(`${RESOURCE}${path}`, { params, headers: authHeader(token) });
  return data;
}

// Clinic Pulse Dashboard
export const getClinicPulse = (token: string) => get<ClinicPulseResponse>('/clinic-pulse', token);

// 1. My Patients Count - DOCTOR (Stat Card)
export const getMyPatientsCount = (token: string) => get<MyPatientsCountResponse>('/my-patients-count', token);

// 2. Total Patients - MANAGER (Stat Card)
export const getTotalPatients = (token: string) => get<TotalPatientsResponse>('/total-patients', token);

// 3. My Appointments Today/This Week - DOCTOR (Table)
export const getMyAppointments = (token: string, period: 'today' | 'week' = 'today') =>
  get<MyAppointmentsResponse>('/my-appointments', token, { period });

// 4. Cancellations Today/This Week - ASSISTANT (Stat Card + Table)
export const getCancellations = (token: string, period: 'today' | 'week' = 'today') =>
  get<CancellationsResponse>('/cancellations', token, { period });

// 5. Appointments Overview - MANAGER (Pie Chart)
export const getAppointmentsOverview = (token: string, dateFrom?: string, dateTo?: string) =>
  get<AppointmentsOverviewResponse>('/appointments-overview', token, { dateFrom, dateTo });

// 6. Most Common Treatment Types - ALL ROLES (Pie Chart)
export const getCommonTreatments = (token: string) => get<CommonTreatmentsResponse>('/common-treatments', token);

// 7. Expenses Summary by Category - MANAGER (Bar Chart)
export const getExpensesByCategory = (token: string, dateFrom?: string, dateTo?: string) =>
  get<ExpensesByCategoryResponse>('/expenses-by-category', token, { dateFrom, dateTo });

// 8. Expense Trends Chart - MANAGER (Line Chart)
export const getExpenseTrends = (token: string, months: number = 6) =>
  get<ExpenseTrendsResponse>('/expense-trends', token, { months });

// 9. Appointment Heatmap - ALL ROLES (Heatmap)
export const getAppointmentHeatmap = (token: string) => get<AppointmentHeatmapResponse>('/appointment-heatmap', token);

// 10. Upcoming Appointments (7 days) - ASSISTANT
export const getUpcomingAppointments = (token: string) =>
  get<UpcomingAppointmentsResponse>('/upcoming-appointments', token);

// 11. New Patients This Month - ASSISTANT
export const getNewPatientsThisMonth = (token: string) => get<NewPatientsResponse>('/new-patients', token);

// 12. Today's Appointments - ASSISTANT
export const getTodaysAppointments = (token: string) =>
  get<TodaysAppointmentsResponse>('/todays-appointments', token);

// 13. Treatments Performed - DOCTOR
export const getTreatmentsPerformed = (token: string, dateFrom?: string, dateTo?: string) =>
  get<TreatmentsPerformedResponse>('/treatments-performed', token, { dateFrom, dateTo });

// 14. Payment Status - MANAGER
export const getPaymentStatus = (token: string) => get<PaymentStatusResponse>('/payment-status', token);

// 15. Patient Demographics - MANAGER
export const getPatientDemographics = (token: string) =>
  get<PatientDemographicsResponse>('/patient-demographics', token);

// 16. Revenue Generated - DOCTOR/MANAGER
export const getRevenueGenerated = (token: string, months: number = 6) =>
  get<RevenueGeneratedResponse>('/revenue-generated', token, { months });

// 17. Total Revenue Trend - MANAGER
export const getTotalRevenueTrend = (token: string, months: number = 12) =>
  get<RevenueTrendResponse>('/revenue-trend', token, { months });

// 18. Staff Performance - MANAGER
export const getStaffPerformance = (token: string) => get<StaffPerformanceResponse>('/staff-performance', token);

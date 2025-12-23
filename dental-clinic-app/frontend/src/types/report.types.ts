
// 1. My Patients Count - DOCTOR (Stat Card)
export interface MyPatientsCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

// 2. Total Patients - MANAGER (Stat Card)
export interface TotalPatientsResponse {
  success: boolean;
  data: {
    total: number;
    newThisMonth: number;
  };
}

// 3. My Appointments Today/This Week - DOCTOR (Table)
export interface MyAppointment {
  id: string;
  dateOfTreatment: string;
  status: string;
  typeOfTreatment: string | null;
  notes: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
}

export interface MyAppointmentsResponse {
  success: boolean;
  data: {
    appointments: MyAppointment[];
    count: number;
    period: 'today' | 'week';
    startDate: string;
    endDate: string;
  };
}

// 4. Cancellations Today/This Week - ASSISTANT (Stat Card + Table)
export interface Cancellation {
  id: string;
  dateOfTreatment: string;
  updatedAt: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  doctor: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CancellationsResponse {
  success: boolean;
  data: {
    cancellations: Cancellation[];
    count: number;
    period: 'today' | 'week';
  };
}

// 5. Appointments Overview - MANAGER (Pie Chart)
export interface AppointmentsOverviewResponse {
  success: boolean;
  data: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
    total: number;
  };
}

// 6. Most Common Treatment Types - ALL ROLES (Pie Chart)
export interface TreatmentTypeCount {
  type: string;
  count: number;
}

export interface CommonTreatmentsResponse {
  success: boolean;
  data: TreatmentTypeCount[];
}

// 7. Expenses Summary by Category - MANAGER (Bar Chart)
export interface ExpenseByCategory {
  category: string;
  total: number;
  count: number;
}

export interface ExpensesByCategoryResponse {
  success: boolean;
  data: {
    byCategory: ExpenseByCategory[];
    totalAmount: number;
  };
}

// 8. Expense Trends Chart - MANAGER (Line Chart)
export interface ExpenseTrend {
  month: string;
  total: number;
}

export interface ExpenseTrendsResponse {
  success: boolean;
  data: {
    trends: ExpenseTrend[];
  };
}

// 9. Appointment Heatmap - ALL ROLES (Heatmap)
export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

export interface AppointmentHeatmapResponse {
  success: boolean;
  data: {
    heatmap: HeatmapCell[];
  };
}

// ============================================
// FRIEND'S REPORT TYPES (9 items) - TODO
// ============================================

// TODO: 1. Upcoming Appointments (7 days) - ASSISTANT
// export interface UpcomingAppointmentsResponse { }

// TODO: 2. New Patients This Month - ASSISTANT
// export interface NewPatientsResponse { }

// TODO: 3. Today's Appointments - ASSISTANT
// export interface TodaysAppointmentsResponse { }

// TODO: 4. Treatments Performed - DOCTOR
// export interface TreatmentsPerformedResponse { }

// TODO: 5. Payment Status - MANAGER
// export interface PaymentStatusResponse { }

// TODO: 6. Patient Demographics - MANAGER
// export interface PatientDemographicsResponse { }

// TODO: 7. Revenue Generated - DOCTOR/MANAGER
// export interface RevenueGeneratedResponse { }

// TODO: 8. Total Revenue Trend - MANAGER
// export interface RevenueTrendResponse { }

// TODO: 9. Staff Performance - MANAGER
// export interface StaffPerformanceResponse { }
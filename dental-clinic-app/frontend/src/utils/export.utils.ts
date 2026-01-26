/**
 * Export Utilities
 * Provides functions to export data to CSV format
 */

/**
 * Converts an array of objects to CSV format
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        // Handle dates
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        return value;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

/**
 * Downloads data as a CSV file
 */
export function downloadCSV(data: any[], filename: string): void {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
}

/**
 * Formats patient data for CSV export
 */
export function formatPatientsForExport(patients: any[]) {
  return patients.map(patient => ({
    'First Name': patient.firstName,
    'Last Name': patient.lastName,
    'Email': patient.email,
    'Phone': patient.phone || '',
    'Date of Birth': patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '',
    'Primary Dentist': patient.primaryDentist 
      ? `${patient.primaryDentist.user.firstName} ${patient.primaryDentist.user.lastName}`
      : '',
    'Registered Date': new Date(patient.createdAt).toLocaleDateString(),
    'Last Updated': new Date(patient.updatedAt).toLocaleDateString(),
  }));
}

/**
 * Formats staff data for CSV export
 */
export function formatStaffForExport(staff: any[]) {
  return staff.map(member => ({
    'First Name': member.firstName,
    'Last Name': member.lastName,
    'Email': member.email,
    'Username': member.username,
    'Role': member.role,
    'Phone': member.phone || '',
    'Specialization': member.doctorProfile?.specialization || '',
    'Created Date': new Date(member.createdAt).toLocaleDateString(),
    'Last Updated': new Date(member.updatedAt).toLocaleDateString(),
  }));
}

/**
 * Formats appointment data for CSV export
 */
export function formatAppointmentsForExport(appointments: any[]) {
  return appointments.map(apt => ({
    'Patient': `${apt.patient.firstName} ${apt.patient.lastName}`,
    'Doctor': apt.doctorProfile 
      ? `${apt.doctorProfile.user.firstName} ${apt.doctorProfile.user.lastName}`
      : '',
    'Date': new Date(apt.dateOfTreatment).toLocaleDateString(),
    'Time': new Date(apt.dateOfTreatment).toLocaleTimeString(),
    'Status': apt.status,
    'Notes': apt.notes || '',
  }));
}

/**
 * Formats treatment data for CSV export
 */
export function formatTreatmentsForExport(treatments: any[]) {
  return treatments.map(treatment => ({
    'Patient': `${treatment.patient.firstName} ${treatment.patient.lastName}`,
    'Doctor': treatment.doctorProfile 
      ? `${treatment.doctorProfile.user.firstName} ${treatment.doctorProfile.user.lastName}`
      : '',
    'Treatment Type': treatment.typeOfTreatment,
    'Date': new Date(treatment.dateOfTreatment).toLocaleDateString(),
    'Cost': treatment.cost,
    'Teeth Involved': treatment.teethInvolved?.join(', ') || '',
    'Follow-up Required': treatment.followUpRequired ? 'Yes' : 'No',
  }));
}

/**
 * Formats expense data for CSV export
 */
export function formatExpensesForExport(expenses: any[]) {
  return expenses.map(expense => ({
    'Date': new Date(expense.expenseDate).toLocaleDateString(),
    'Category': expense.category,
    'Description': expense.description,
    'Amount': expense.amount,
    'Paid By': expense.paidBy || '',
  }));
}

/**
 * Formats financial summary for CSV export
 */
export function formatFinancialSummaryForExport(data: {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  paymentsPending: number;
  paymentsCompleted: number;
  period: string;
}) {
  return [{
    'Report Period': data.period,
    'Total Revenue': `$${data.totalRevenue.toFixed(2)}`,
    'Total Expenses': `$${data.totalExpenses.toFixed(2)}`,
    'Net Profit': `$${data.netProfit.toFixed(2)}`,
    'Completed Payments': `$${data.paymentsCompleted.toFixed(2)}`,
    'Pending Payments': `$${data.paymentsPending.toFixed(2)}`,
    'Generated Date': new Date().toLocaleDateString(),
  }];
}

/**
 * Formats revenue trend data for CSV export
 */
export function formatRevenueTrendForExport(data: any[]) {
  return data.map(item => ({
    'Period': item.period || item.month || item.date,
    'Revenue': `$${item.revenue?.toFixed(2) || item.total?.toFixed(2) || 0}`,
    'Number of Treatments': item.count || item.treatments || 0,
  }));
}

/**
 * Formats staff performance for CSV export
 */
export function formatStaffPerformanceForExport(data: any[]) {
  return data.map(staff => ({
    'Staff Name': staff.name || `${staff.firstName} ${staff.lastName}`,
    'Role': staff.role || 'Doctor',
    'Patients Treated': staff.patientsCount || staff.totalPatients || 0,
    'Appointments': staff.appointmentsCount || staff.totalAppointments || 0,
    'Revenue Generated': `$${staff.revenue?.toFixed(2) || 0}`,
    'Rating': staff.rating || 'N/A',
  }));
}

/**
 * Formats treatment statistics for CSV export
 */
export function formatTreatmentStatsForExport(data: any[]) {
  return data.map(treatment => ({
    'Treatment Type': treatment.type || treatment.typeOfTreatment,
    'Total Count': treatment.count || treatment.total || 0,
    'Total Revenue': `$${treatment.revenue?.toFixed(2) || 0}`,
    'Average Cost': `$${treatment.averageCost?.toFixed(2) || 0}`,
  }));
}

/**
 * Formats appointment statistics for CSV export
 */
export function formatAppointmentStatsForExport(data: {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  scheduled: number;
}) {
  return [{
    'Total Appointments': data.total,
    'Completed': data.completed,
    'Scheduled': data.scheduled,
    'Pending': data.pending,
    'Cancelled': data.cancelled,
    'Completion Rate': `${((data.completed / data.total) * 100).toFixed(1)}%`,
    'Cancellation Rate': `${((data.cancelled / data.total) * 100).toFixed(1)}%`,
  }];
}

/**
 * Formats patient demographics for CSV export
 */
export function formatPatientDemographicsForExport(data: any) {
  const rows: any[] = [];
  
  // Age groups
  if (data.ageGroups) {
    data.ageGroups.forEach((group: any) => {
      rows.push({
        'Category': 'Age Group',
        'Group': group.range || group.ageGroup,
        'Count': group.count,
        'Percentage': `${group.percentage?.toFixed(1)}%`,
      });
    });
  }
  
  // Gender distribution
  if (data.gender) {
    Object.entries(data.gender).forEach(([gender, count]) => {
      rows.push({
        'Category': 'Gender',
        'Group': gender,
        'Count': count,
        'Percentage': `${((count as number / data.totalPatients) * 100).toFixed(1)}%`,
      });
    });
  }
  
  return rows;
}

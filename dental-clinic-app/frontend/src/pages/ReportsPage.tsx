import { useState } from 'react';
import { BarChart3, Download } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import { Button } from '../components/ui/Button';

// Your Components
import { MyPatientsCount } from '../components/reports/analytics/MyPatientsCount';
import { TotalPatients } from '../components/reports/analytics/TotalPatients';
import { MyAppointmentsTable } from '../components/reports/analytics/MyAppointmentsTable';
import { CancellationsReport } from '../components/reports/analytics/CancellationsReport';
import { AppointmentsOverviewChart } from '../components/reports/analytics/AppointmentsOverviewChart';
import { CommonTreatmentsChart } from '../components/reports/analytics/CommonTreatmentsChart';
import { ExpensesByCategoryChart } from '../components/reports/analytics/ExpensesByCategoryChart';
import { ExpenseTrendsChart } from '../components/reports/analytics/ExpenseTrendsChart';
import { AppointmentHeatmap } from '../components/reports/analytics/AppointmentHeatmap';

// Friend's Components
import { UpcomingAppointments } from '../components/reports/analytics/UpcomingAppointments';
import { NewPatientsThisMonth } from '../components/reports/analytics/NewPatientsThisMonth';
import { TodaysAppointmentsTable } from '../components/reports/analytics/TodaysAppointmentsTable';
import { TreatmentsPerformedChart } from '../components/reports/analytics/TreatmentsPerformedChart';
import { PaymentStatusChart } from '../components/reports/analytics/PaymentStatusChart';
import { PatientDemographics } from '../components/reports/analytics/PatientDemographics';
import { RevenueGeneratedChart } from '../components/reports/analytics/RevenueGeneratedChart';
import { RevenueTrendChart } from '../components/reports/analytics/RevenueTrendChart';
import { StaffPerformanceChart } from '../components/reports/analytics/StaffPerformanceChart';

interface ReportsPageProps {
  token: string;
  userRole?: string;
}

export function ReportsPage({ token, userRole = 'MANAGER' }: ReportsPageProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReports = async () => {
    setIsExporting(true);
    try {
      // Import report services
      const {
        getTotalPatients,
        getNewPatientsThisMonth,
        getRevenueGenerated,
        getTotalRevenueTrend,
        getStaffPerformance,
        getCommonTreatments,
        getAppointmentsOverview,
        getExpensesByCategory,
        getPaymentStatus,
      } = await import('../services/report.service');

      const { downloadCSV } = await import('../utils/export.utils');

      // Fetch all report data with proper error handling
      const results = await Promise.allSettled([
        getTotalPatients(token),
        getNewPatientsThisMonth(token),
        getRevenueGenerated(token),
        getTotalRevenueTrend(token),
        getStaffPerformance(token),
        getCommonTreatments(token),
        getAppointmentsOverview(token),
        getExpensesByCategory(token),
        getPaymentStatus(token),
      ]);

      // Extract data safely
      const totalPatients = results[0].status === 'fulfilled' ? results[0].value.data : null;
      const newPatients = results[1].status === 'fulfilled' ? results[1].value.data : null;
      const revenue = results[2].status === 'fulfilled' ? results[2].value.data : null;
      const revenueTrend = results[3].status === 'fulfilled' ? results[3].value.data : null;
      const staffPerformance = results[4].status === 'fulfilled' ? results[4].value.data : null;
      const treatments = results[5].status === 'fulfilled' ? results[5].value.data : null;
      const appointments = results[6].status === 'fulfilled' ? results[6].value.data : null;
      const expenses = results[7].status === 'fulfilled' ? results[7].value.data : null;
      const payments = results[8].status === 'fulfilled' ? results[8].value.data : null;

      // Create comprehensive summary report
      const summaryData = [{
        'Report Generated': new Date().toLocaleString(),
        'Report Period': new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        'Total Patients': totalPatients?.total || 0,
        'New Patients This Month': totalPatients?.newThisMonth || 0,
        'New Patient Records': newPatients?.count || 0,
        'Total Revenue': revenue?.totalRevenue ? `$${revenue.totalRevenue.toFixed(2)}` : '$0.00',
        'Total Expenses': expenses?.totalAmount ? `$${expenses.totalAmount.toFixed(2)}` : '$0.00',
        'Net Profit': revenue?.totalRevenue && expenses?.totalAmount 
          ? `$${(revenue.totalRevenue - expenses.totalAmount).toFixed(2)}` 
          : '$0.00',
        'Paid Amount': payments?.amounts?.paid ? `$${payments.amounts.paid.toFixed(2)}` : '$0.00',
        'Pending Amount': payments?.amounts?.pending ? `$${payments.amounts.pending.toFixed(2)}` : '$0.00',
        'Overdue Amount': payments?.amounts?.overdue ? `$${payments.amounts.overdue.toFixed(2)}` : '$0.00',
        'Total Payments': payments?.counts?.total || 0,
        'Paid Payments': payments?.counts?.paid || 0,
        'Pending Payments': payments?.counts?.pending || 0,
        'Overdue Payments': payments?.counts?.overdue || 0,
        'Total Appointments': appointments?.total || 0,
        'Scheduled Appointments': appointments?.scheduled || 0,
        'Completed Appointments': appointments?.completed || 0,
        'Cancelled Appointments': appointments?.cancelled || 0,
        'No-Show Appointments': appointments?.noShow || 0,
      }];
      
      downloadCSV(summaryData, 'clinic-reports-summary');

      // Export revenue trend if available
      if (revenueTrend && 'trends' in revenueTrend && Array.isArray(revenueTrend.trends)) {
        const revenueData = revenueTrend.trends.map((item: any) => ({
          'Month': item.month,
          'Revenue': `$${item.revenue.toFixed(2)}`,
          'Expenses': `$${item.expenses.toFixed(2)}`,
          'Profit': `$${item.profit.toFixed(2)}`,
        }));
        downloadCSV(revenueData, 'revenue-trend');
      }

      // Export staff performance if available
      if (staffPerformance && 'performance' in staffPerformance && Array.isArray(staffPerformance.performance)) {
        const staffData = staffPerformance.performance.map((staff: any) => ({
          'Staff Name': `${staff.firstName} ${staff.lastName}`,
          'Role': staff.role,
          'Appointments': staff.appointmentCount || 0,
          'Patients': staff.patientCount || 0,
          'Revenue': `$${(staff.revenue || 0).toFixed(2)}`,
        }));
        downloadCSV(staffData, 'staff-performance');
      }

      // Export treatment statistics if available
      if (treatments && Array.isArray(treatments)) {
        const treatmentData = treatments.map((treatment: any) => ({
          'Treatment Type': treatment.type || treatment.typeOfTreatment,
          'Count': treatment.count,
        }));
        downloadCSV(treatmentData, 'treatment-statistics');
      }

      // Export expense breakdown if available
      if (expenses && 'byCategory' in expenses && Array.isArray(expenses.byCategory)) {
        const expenseData = expenses.byCategory.map((expense: any) => ({
          'Category': expense.category,
          'Total Amount': `$${expense.total.toFixed(2)}`,
          'Count': expense.count,
          'Average': `$${(expense.total / expense.count).toFixed(2)}`,
        }));
        downloadCSV(expenseData, 'expenses-by-category');
      }

      toast.success('Reports exported', { description: 'Check your downloads folder for the CSV files.' });
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error('Failed to export reports', { description: 'Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-primary-600" size={22} />
            <h1 className="text-xl font-semibold text-surface-900">Reports & Analytics</h1>
          </div>
          <p className="mt-1 text-sm text-surface-500">
            {userRole === 'DOCTOR' && 'View your appointments, patients, and performance metrics'}
            {userRole === 'MANAGER' && 'Monitor clinic performance, finances, and staff metrics'}
            {userRole === 'ASSISTANT' && 'Track appointments, cancellations, and patient activity'}
          </p>
        </div>

        <Button onClick={handleExportReports} isLoading={isExporting} title="Export all reports to CSV files">
          {!isExporting && <Download size={16} />}
          {isExporting ? 'Exporting...' : 'Export Reports'}
        </Button>
      </div>

      {/* DOCTOR REPORTS */}
      {userRole === 'DOCTOR' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <MyPatientsCount token={token} />
            <TreatmentsPerformedChart token={token} />
            <RevenueGeneratedChart token={token} />
          </div>

          <div className="mb-6">
            <MyAppointmentsTable token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CommonTreatmentsChart token={token} />
            <AppointmentHeatmap token={token} />
          </div>
        </>
      )}

      {/* MANAGER REPORTS */}
      {userRole === 'MANAGER' && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
            <div className="flex flex-col gap-4">
              <TotalPatients token={token} />
              <NewPatientsThisMonth token={token} />
            </div>
            <PaymentStatusChart token={token} />
            <RevenueGeneratedChart token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AppointmentsOverviewChart token={token} />
            <CommonTreatmentsChart token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ExpensesByCategoryChart token={token} />
            <ExpenseTrendsChart token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueTrendChart token={token} />
            <StaffPerformanceChart token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PatientDemographics token={token} />
            <AppointmentHeatmap token={token} />
          </div>
        </>
      )}

      {/* ASSISTANT REPORTS */}
      {userRole === 'ASSISTANT' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <CancellationsReport token={token} />
            <UpcomingAppointments token={token} />
            <NewPatientsThisMonth token={token} />
          </div>

          <div className="mb-6">
            <TodaysAppointmentsTable token={token} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CommonTreatmentsChart token={token} />
            <AppointmentHeatmap token={token} />
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsPage;
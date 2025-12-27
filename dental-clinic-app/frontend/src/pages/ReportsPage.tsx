import React from 'react';
import { BarChart3 } from 'lucide-react';

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
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        </div>
        <p className="text-gray-500">
          {userRole === 'DOCTOR' && 'View your appointments, patients, and performance metrics'}
          {userRole === 'MANAGER' && 'Monitor clinic performance, finances, and staff metrics'}
          {userRole === 'ASSISTANT' && 'Track appointments, cancellations, and patient activity'}
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <TotalPatients token={token} />
            <NewPatientsThisMonth token={token} />
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
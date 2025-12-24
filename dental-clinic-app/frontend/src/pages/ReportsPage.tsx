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

// TODO: Friend's Components (uncomment when ready)
// import { UpcomingAppointments } from '../components/reports/analytics/UpcomingAppointments';
// import { NewPatientsThisMonth } from '../components/reports/analytics/NewPatientsThisMonth';
// import { TodaysAppointments } from '../components/reports/analytics/TodaysAppointments';
// import { TreatmentsPerformed } from '../components/reports/analytics/TreatmentsPerformed';
// import { PaymentStatusChart } from '../components/reports/analytics/PaymentStatusChart';
// import { PatientDemographics } from '../components/reports/analytics/PatientDemographics';
// import { RevenueGenerated } from '../components/reports/analytics/RevenueGenerated';
// import { RevenueTrendChart } from '../components/reports/analytics/RevenueTrendChart';
// import { StaffPerformance } from '../components/reports/analytics/StaffPerformance';

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

      {/* ============================================ */}
      {/* DOCTOR REPORTS */}
      {/* ============================================ */}
      {userRole === 'DOCTOR' && (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <MyPatientsCount token={token} />
            {/* TODO: Friend's Component */}
            {/* <TreatmentsPerformed token={token} /> */}
            {/* <RevenueGenerated token={token} /> */}
          </div>

          {/* My Appointments Table */}
          <div className="mb-6">
            <MyAppointmentsTable token={token} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <CommonTreatmentsChart token={token} />
            <AppointmentHeatmap token={token} />
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* MANAGER REPORTS */}
      {/* ============================================ */}
      {userRole === 'MANAGER' && (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <TotalPatients token={token} />
            {/* TODO: Friend's Components */}
            {/* <NewPatientsThisMonth token={token} /> */}
            {/* <PaymentStatusChart token={token} /> */}
            {/* <RevenueGenerated token={token} /> */}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AppointmentsOverviewChart token={token} />
            <CommonTreatmentsChart token={token} />
          </div>

          {/* Charts Row 2 - Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ExpensesByCategoryChart token={token} />
            <ExpenseTrendsChart token={token} />
          </div>

          {/* Full Width Charts */}
          <div className="mb-6">
            <AppointmentHeatmap token={token} />
          </div>

          {/* TODO: Friend's Components */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueTrendChart token={token} />
            <StaffPerformance token={token} />
          </div> */}

          {/* TODO: Friend's Component */}
          {/* <div className="mb-6">
            <PatientDemographics token={token} />
          </div> */}
        </>
      )}

      {/* ============================================ */}
      {/* ASSISTANT REPORTS */}
      {/* ============================================ */}
      {userRole === 'ASSISTANT' && (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <CancellationsReport token={token} />
            {/* TODO: Friend's Components */}
            {/* <UpcomingAppointments token={token} /> */}
            {/* <NewPatientsThisMonth token={token} /> */}
          </div>

          {/* TODO: Friend's Component */}
          {/* <div className="mb-6">
            <TodaysAppointments token={token} />
          </div> */}

          {/* Charts Row */}
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
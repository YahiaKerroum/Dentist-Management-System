import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { ClinicPulsePage } from '../pages/ClinicPulsePage';
import { ProfilePage } from '../pages/ProfilePage';
import { PatientsPage } from '../pages/PatientsPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { TreatmentsPage } from '../pages/TreatmentsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { StaffPage } from '../pages/StaffPage';
import FinancesPage from '../pages/FinancesPage';

/** Bridges the `/patients/:patientId` route param to PatientsPage's existing prop-driven detail view. */
function PatientsRoute({ token }: { token: string }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  return (
    <PatientsPage
      token={token}
      initialPatientId={patientId}
      onPatientOpened={() => navigate('/patients', { replace: true })}
    />
  );
}

/** Bridges TreatmentsPage's "jump to patient" callback to real navigation. */
function TreatmentsRoute({ token }: { token: string }) {
  const navigate = useNavigate();
  return (
    <TreatmentsPage token={token} onNavigateToPatient={(patientId: string) => navigate(`/patients/${patientId}`)} />
  );
}

export function AppRoutes() {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ClinicPulsePage />} />
        <Route path="profile" element={<ProfilePage token={token} />} />
        <Route path="patients" element={<PatientsRoute token={token} />} />
        <Route path="patients/:patientId" element={<PatientsRoute token={token} />} />
        <Route path="appointments" element={<AppointmentsPage token={token} />} />
        <Route path="treatments" element={<TreatmentsRoute token={token} />} />
        <Route path="staff" element={<StaffPage token={token} />} />
        <Route path="reports" element={<ReportsPage token={token} userRole={(user?.role as any) ?? 'MANAGER'} />} />
        <Route path="finances" element={<FinancesPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

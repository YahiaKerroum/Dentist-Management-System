import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { PatientsPage } from '../../pages/PatientsPage';
import { AppointmentsPage } from '../../pages/AppointmentsPage';
import { TreatmentsPage } from '../../pages/TreatmentsPage';
import { ReportsPage } from '../../pages/ReportsPage';
import { StaffPage } from '../../pages/StaffPage';
import FinancesPage from '../../pages/FinancesPage'; 

interface MainLayoutProps {
  token: string;
  onLogout: () => void;
}

export function MainLayout({ token, onLogout }: MainLayoutProps) {
  const [activePage, setActivePage] = useState('dashboard');
  const [targetPatientId, setTargetPatientId] = useState<string | null>(null);

  // Extract username and role from token for display
  const getUserName = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };

  const getUserRole = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'DOCTOR';
    } catch {
      return 'DOCTOR';
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      profile: 'Profile',
      patients: 'Patients',
      appointments: 'Appointments',
      treatments: 'Treatments',
      staff: 'Staff Management',
      reports: 'Reports',
      finances: 'Finances', // ← ADD THIS LINE
    };
    return titles[activePage] || 'Dashboard';
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage token={token} />;
      case 'profile':
        return <ProfilePage token={token} />;
      case 'patients':
        return (
          <PatientsPage 
            token={token} 
            initialPatientId={targetPatientId || undefined}
            onPatientOpened={() => setTargetPatientId(null)}
          />
        );
      case 'appointments':
        return <AppointmentsPage token={token} />;
      case 'treatments':
        return (
          <TreatmentsPage
            token={token}
            onNavigateToPatient={(patientId) => {
              console.log('MainLayout onNavigateToPatient called with:', patientId);
              setTargetPatientId(patientId);
              setActivePage('patients');
            }}
          />
        );
      case 'staff':
        return <StaffPage token={token} />;
      case 'reports':
  return <ReportsPage token={token} userRole={getUserRole()} />;
      case 'finances': // ← ADD THIS CASE
        return <FinancesPage />;
      default:
        return <DashboardPage token={token} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        onLogout={onLogout}
        userRole={getUserRole()}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} userName={getUserName()} onLogout={onLogout} />
        
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
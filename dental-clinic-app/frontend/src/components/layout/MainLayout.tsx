import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { PatientsPage } from '../../pages/PatientsPage';
import { AppointmentsPage } from '../../pages/AppointmentsPage';
import { TreatmentsPage } from '../../pages/TreatmentsPage';
import { ReportsPage } from '../../pages/ReportsPage';

interface MainLayoutProps {
  token: string;
  onLogout: () => void;
}

export function MainLayout({ token, onLogout }: MainLayoutProps) {
  const [activePage, setActivePage] = useState('dashboard');

  // Extract username from token for display
  const getUserName = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      profile: 'Profile',
      patients: 'Patients',
      appointments: 'Appointments',
      treatments: 'Treatments',
      reports: 'Reports',
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
        return <PatientsPage token={token} />;
        case 'appointments':
          return <AppointmentsPage token={token} />;
      case 'treatments':
        return <TreatmentsPage />;
      case 'reports':
        return <ReportsPage />;
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
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} userName={getUserName()} />
        
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

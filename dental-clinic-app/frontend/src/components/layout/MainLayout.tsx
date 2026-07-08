import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { pageEnter } from '../../lib/motion';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Today',
  profile: 'Profile',
  patients: 'Patients',
  appointments: 'Appointments',
  treatments: 'Treatments',
  staff: 'Staff Management',
  reports: 'Reports',
  finances: 'Finances',
};

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeSegment = location.pathname.split('/')[1] || 'dashboard';
  const title = PAGE_TITLES[activeSegment] ?? 'Dashboard';

  useEffect(() => {
    document.title = `${title} · Clinic Pulse`;
  }, [title]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-surface-50">
      <Sidebar userRole={user?.role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          userName={user?.username}
          userRole={user?.role}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} {...pageEnter} className="h-full">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

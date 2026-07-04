import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-surface-50">
      <Sidebar userRole={user?.role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={PAGE_TITLES[activeSegment] ?? 'Dashboard'} userName={user?.username} />

        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

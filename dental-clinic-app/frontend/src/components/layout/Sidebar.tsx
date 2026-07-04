import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  LogOut,
  UserCog,
  Wallet,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onLogout: () => void;
  userRole?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: Users, label: 'Patients', path: '/patients', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: Calendar, label: 'Appointments', path: '/appointments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: Stethoscope, label: 'Treatments', path: '/treatments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: Wallet, label: 'Finances', path: '/finances', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: FileText, label: 'Reports', path: '/reports', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
  { icon: UserCog, label: 'Staff', path: '/staff', roles: ['MANAGER'] },
  { icon: User, label: 'Profile', path: '/profile', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
];

const ROLE_LABEL: Record<string, string> = {
  MANAGER: 'Manager',
  DOCTOR: 'Doctor',
  ASSISTANT: 'Assistant',
  RECEPTIONIST: 'Receptionist',
};

export function Sidebar({ onLogout, userRole = 'DOCTOR' }: SidebarProps) {
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-surface-800 bg-surface-900">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 shadow-sm">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">DentalCare</h1>
          <p className="text-xs text-surface-400">Practice Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-md bg-primary-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-surface-800 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-md bg-surface-800/60 px-3 py-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success-500" />
          <p className="text-xs text-surface-300">
            Signed in as <span className="font-medium text-surface-100">{ROLE_LABEL[userRole] ?? userRole}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-surface-400 transition-colors hover:bg-danger-500/10 hover:text-danger-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log out
        </button>
      </div>
    </aside>
  );
}

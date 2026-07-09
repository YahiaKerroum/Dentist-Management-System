import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  UserCog,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { BrandMark } from '../ui/BrandMark';

interface SidebarProps {
  userRole?: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles: string[];
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { icon: Activity, label: 'Today', path: '/dashboard', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { icon: Users, label: 'Patients', path: '/patients', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
      { icon: Calendar, label: 'Appointments', path: '/appointments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
      { icon: Stethoscope, label: 'Treatments', path: '/treatments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    ],
  },
  {
    label: 'Business',
    items: [
      { icon: Wallet, label: 'Finances', path: '/finances', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
      { icon: FileText, label: 'Reports', path: '/reports', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    ],
  },
  {
    label: 'Admin',
    items: [{ icon: UserCog, label: 'Staff', path: '/staff', roles: ['MANAGER'] }],
  },
];

export function Sidebar({ userRole = 'DOCTOR' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(userRole)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'flex h-screen shrink-0 flex-col bg-gradient-to-b from-surface-900 to-surface-950 transition-[width] duration-300 ease-out',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-5 py-6', collapsed && 'justify-center px-0')}>
        <BrandMark className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate font-display text-[15px] font-semibold leading-tight tracking-tight text-white">
              Clinic<span className="text-primary-400">Pulse</span>
            </h1>
            <p className="truncate text-[11px] text-surface-500">Dental Practice OS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-2">
        {sections.map((section, i) => (
          <div key={section.label ?? i}>
            {section.label && !collapsed && (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-surface-600">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive ? 'text-white' : 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-bg"
                            className="absolute inset-0 rounded-lg bg-primary-500/15"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-bar"
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary-400"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                        <Icon
                          className={cn(
                            'relative z-10 h-[18px] w-[18px] shrink-0',
                            isActive ? 'text-primary-300' : 'text-surface-500 group-hover:text-surface-300'
                          )}
                        />
                        {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-surface-800/80 p-3">
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-800/60 hover:text-surface-200',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

import { LayoutDashboard, User, Users, Calendar, Stethoscope, FileText, LogOut, UserCog, Wallet } from 'lucide-react';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
    onLogout: () => void;
    userRole?: string;
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    { icon: User, label: 'Profile', page: 'profile', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    { icon: Users, label: 'Patients', page: 'patients', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    { icon: Calendar, label: 'Appointments', page: 'appointments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    { icon: Stethoscope, label: 'Treatments', page: 'treatments', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
    { icon: Wallet, label: 'Finances', page: 'finances', roles: ['MANAGER', 'DOCTOR'] }, // ← NEW FINANCES ITEM
    { icon: UserCog, label: 'Staff', page: 'staff', roles: ['MANAGER'] },
    { icon: FileText, label: 'Reports', page: 'reports', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
];

export function Sidebar({ activePage, onPageChange, onLogout, userRole = 'DOCTOR' }: SidebarProps) {
    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-blue-600">DentalCare</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                {visibleMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.page;

                    return (
                        <button
                            key={item.page}
                            onClick={() => onPageChange(item.page)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-200">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
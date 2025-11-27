import { LayoutDashboard, User, Users, Calendar, Stethoscope, FileText, LogOut } from 'lucide-react';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
    onLogout: () => void;
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
    { icon: User, label: 'Profile', page: 'profile' },
    { icon: Users, label: 'Patients', page: 'patients' },
    { icon: Calendar, label: 'Appointments', page: 'appointments' },
    { icon: Stethoscope, label: 'Treatments', page: 'treatments' },
    { icon: FileText, label: 'Reports', page: 'reports' },
];

export function Sidebar({ activePage, onPageChange, onLogout }: SidebarProps) {
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-blue-600">DentalCare</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
                {menuItems.map((item) => {
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

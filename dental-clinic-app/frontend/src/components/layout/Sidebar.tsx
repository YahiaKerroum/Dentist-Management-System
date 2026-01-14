import { LayoutDashboard, User, Users, Calendar, Stethoscope, FileText, LogOut, UserCog, Wallet, ChevronRight } from 'lucide-react';

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
    { icon: Wallet, label: 'Finances', page: 'finances', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] }, 
    { icon: UserCog, label: 'Staff', page: 'staff', roles: ['MANAGER'] },
    { icon: FileText, label: 'Reports', page: 'reports', roles: ['MANAGER', 'DOCTOR', 'ASSISTANT'] },
];

export function Sidebar({ activePage, onPageChange, onLogout, userRole = 'DOCTOR' }: SidebarProps) {
    // Filter menu items based on user role
    const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <div 
            className="w-72 flex flex-col h-screen relative overflow-hidden"
            style={{ 
                background: 'linear-gradient(180deg, #1C6B5A 0%, #134D41 50%, #0a2b27 100%)'
            }}
        >
            {/* Decorative circles */}
            <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
                style={{ backgroundColor: '#3DBEA3' }}
            />
            <div 
                className="absolute top-1/3 -left-10 w-24 h-24 rounded-full opacity-5"
                style={{ backgroundColor: '#7DD3C0' }}
            />
            <div 
                className="absolute bottom-20 -right-8 w-32 h-32 rounded-full opacity-5"
                style={{ backgroundColor: '#3DBEA3' }}
            />

            {/* Logo Section */}
            <div className="relative z-10 px-6 py-8">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: '#3DBEA3' }}
                    >
                        <img 
                            src="/icons/dental-logo.png" 
                            alt="Logo" 
                            className="w-8 h-8 object-contain filter brightness-0 invert"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">DentalCare</h1>
                        <p className="text-xs text-white/60">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex-1 px-4 py-2 overflow-y-auto">
                <p className="px-3 mb-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Menu</p>
                <div className="space-y-1">
                    {visibleMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.page;

                        return (
                            <button
                                key={item.page}
                                onClick={() => onPageChange(item.page)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'shadow-lg'
                                        : 'hover:bg-white/5'
                                }`}
                                style={isActive ? { 
                                    backgroundColor: '#3DBEA3',
                                    boxShadow: '0 4px 15px rgba(61, 190, 163, 0.3)'
                                } : {}}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                            isActive 
                                                ? 'bg-white/20' 
                                                : 'bg-white/5 group-hover:bg-white/10'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                                    </div>
                                    <span className={`font-medium ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
                                        {item.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 text-white/80" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* User Role Badge & Logout */}
            <div className="relative z-10 p-4 mt-auto">
                {/* Role indicator */}
                <div 
                    className="mb-3 px-4 py-3 rounded-xl"
                    style={{ backgroundColor: 'rgba(61, 190, 163, 0.15)' }}
                >
                    <p className="text-xs text-white/50 mb-1">Logged in as</p>
                    <p className="text-sm font-semibold text-white">
                        {userRole === 'MANAGER' ? '👔 Manager' : 
                         userRole === 'DOCTOR' ? '🩺 Doctor' : 
                         '🏥 Assistant'}
                    </p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/20 transition-all duration-200 group"
                >
                    <div className="w-9 h-9 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Bottom decorative gradient */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{ 
                    background: 'linear-gradient(to top, rgba(10, 43, 39, 0.8) 0%, transparent 100%)'
                }}
            />
        </div>
    );
}
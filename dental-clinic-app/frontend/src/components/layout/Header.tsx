import { LogOut } from 'lucide-react';

interface HeaderProps {
    title: string;
    userName?: string;
    onLogout?: () => void;
}

export function Header({ title, userName, onLogout }: HeaderProps) {
    return (
        <header 
            className="px-8 py-4 sticky top-0 z-30 border-b"
            style={{ 
                background: 'linear-gradient(135deg, #1C6B5A 0%, #134D41 50%, #0a2b27 100%)',
                borderColor: 'rgba(61, 190, 163, 0.2)'
            }}
        >
            <div className="flex items-center justify-between">
                {/* Left side - Title and date */}
                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-sm text-white/60 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>

                {/* Right side - User Profile & Logout */}
                <div className="flex items-center gap-4">
                    {/* User Profile */}
                    {userName && (
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                style={{ 
                                    background: 'linear-gradient(135deg, #3DBEA3 0%, #2FA88E 100%)'
                                }}
                            >
                                <span className="text-white text-sm font-semibold">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-sm font-semibold text-white">{userName}</p>
                                <p className="text-xs text-white/60">Online</p>
                            </div>
                        </div>
                    )}

                    {/* Logout Button */}
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/90 hover:text-white transition-all border border-white/10 hover:border-white/30 hover:bg-white/5"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm font-medium">Logout</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

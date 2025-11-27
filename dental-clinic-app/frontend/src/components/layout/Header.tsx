interface HeaderProps {
    title: string;
    userName?: string;
}

export function Header({ title, userName }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {userName && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-gray-600">{userName}</span>
                    </div>
                )}
            </div>
        </header>
    );
}

interface HeaderProps {
  title: string;
  userName?: string;
}

export function Header({ title, userName }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-200 bg-white/80 px-8 py-4 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-surface-900">{title}</h1>
        <p className="mt-0.5 text-sm text-surface-500">{today}</p>
      </div>

      {userName && (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-surface-800">{userName}</p>
          </div>
        </div>
      )}
    </header>
  );
}

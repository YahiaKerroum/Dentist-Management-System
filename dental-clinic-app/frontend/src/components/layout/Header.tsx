import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

interface HeaderProps {
  title: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  MANAGER: 'Manager',
  DOCTOR: 'Doctor',
  ASSISTANT: 'Assistant',
  RECEPTIONIST: 'Receptionist',
};

export function Header({ title, userName, userRole, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white/80 px-6 backdrop-blur-md md:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">{title}</p>

      {userName && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 outline-none transition-colors hover:bg-surface-100 data-[state=open]:bg-surface-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium leading-tight text-surface-800">{userName}</p>
              {userRole && <p className="text-xs leading-tight text-surface-500">{ROLE_LABEL[userRole] ?? userRole}</p>}
            </div>
            <ChevronDown className="h-4 w-4 text-surface-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={onLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}

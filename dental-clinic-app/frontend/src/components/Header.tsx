import {LogOut} from 'lucide-react'

// Header Component
export const Header: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-gray-800">Welcome back Dr. Emily!</h2>
      <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

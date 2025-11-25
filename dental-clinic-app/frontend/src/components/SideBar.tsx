
import { Calendar, Users, FileText, BarChart3, File, LogOut, User } from 'lucide-react';

// Sidebar Component
export const SideBar: React.FC<{ activeTab: string; }> = ({ activeTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: 12 },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'treatments', label: 'Treatments', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: File },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">DentalCare</h1>
        <p className="text-sm text-gray-500">Management System</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              //onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 mb-1 rounded-lg transition-colors relative ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
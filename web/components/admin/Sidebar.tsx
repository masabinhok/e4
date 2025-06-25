import React from 'react';
import { BarChart3, Users, BookOpen } from 'lucide-react';

interface TabButtonProps {
  id: string;
  label: string;
  icon: any;
  isActive: boolean;
  onClick: (id: string) => void;
}

const TabButton = ({ id, label, icon: Icon, isActive, onClick }: TabButtonProps) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-black hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Chess Admin</h1>
        <p className="text-gray-500 text-sm mt-1">e4.learnchess</p>
      </div>

      <nav className="p-4 space-y-2">
        <TabButton
          id="dashboard"
          label="Dashboard"
          icon={BarChart3}
          isActive={activeTab === 'dashboard'}
          onClick={setActiveTab}
        />
        <TabButton
          id="users"
          label="Users"
          icon={Users}
          isActive={activeTab === 'users'}
          onClick={setActiveTab}
        />
        <TabButton
          id="lessons"
          label="Lessons"
          icon={BookOpen}
          isActive={activeTab === 'lessons'}
          onClick={setActiveTab}
        />
      </nav>
    </div>
  );
};

export default Sidebar;

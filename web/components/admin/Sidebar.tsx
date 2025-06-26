import React from 'react';
import { BarChart3, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from "@/public/icons/e4.svg";

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
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
    <div className="w-64 bg-gray-800 shadow-lg border-r border-gray-700 min-h-screen">
      <div className="p-6 border-b flex items-center flex-col border-gray-700">
        <span className='text-xs font-bold text-gray-300'>ADMIN PANEL</span>
        <Link href={"/"} className="flex items-center group">
          <h1 className="text-2xl font-bold hidden lg:block ml-2 text-white">e4.<span className="text-blue-400">learnchess</span></h1>
        </Link>
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

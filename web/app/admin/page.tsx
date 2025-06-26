'use client'
import React, { useEffect, useState } from 'react';
import { Opening, OpeningVariation, User } from '@/types/types';
import Sidebar from '@/components/admin/Sidebar';
import Dashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import LessonManagement from '@/components/admin/LessonManagement';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [openings, setOpenings] = useState<Opening[] | []>([]);
  const [users, setUsers] = useState<User[] | []>([]);
  const [variations, setVariations] = useState<OpeningVariation[] | []>([]);

  const fetchAdminData = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
      method: "GET",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('network error');
      }
      return res.json();
    }).then(data => {
      console.log(data);
      setOpenings(data.openings);
      setUsers(data.users);
      setVariations(data.variations);
    })
  }

  useEffect(() => {
    fetchAdminData();
  }, [])

  const toggleStatus = async (type: string, id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${type}/toggle-status/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('Network error');
      }
      return res.json();
    }).then(() => {
      fetchAdminData();
    })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard variations={variations} users={users} openings={openings} />;
      case 'users':
        return <UserManagement users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'lessons':
        return <LessonManagement openings={openings} variations={variations} toggleStatus={toggleStatus} />;
      default:
        return <Dashboard variations={variations} users={users} openings={openings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full text-black">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

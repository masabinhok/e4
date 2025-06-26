'use client'
import React, { useEffect, useState } from 'react';
import { Opening, OpeningVariation, User } from '@/types/types';
import Sidebar from '@/components/admin/Sidebar';
import Dashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import LessonManagement from '@/components/admin/LessonManagement';
import { useMessageStore } from '@/store/messageStore';
import Message from '@/components/Message';
import { useSoundStore } from '@/store/useSoundStore';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [openings, setOpenings] = useState<Opening[] | []>([]);
  const [users, setUsers] = useState<User[] | []>([]);
  const [variations, setVariations] = useState<OpeningVariation[] | []>([]);

  const { messages, removeMessage, addMessage } = useMessageStore();
  const { playSound } = useSoundStore();

  const fetchAdminData = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
      method: "GET",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) {
        addMessage({ content: 'Network Error', type: 'error' });
        throw new Error('Network error');
      }
      return res.json();
    }).then(data => {
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
        addMessage({ content: 'Network Error', type: 'error' });
        throw new Error('Network error');
      }
      return res.json();
    }).then((data) => {
      addMessage({ content: data.message, type: 'success' })
      setTimeout(() => playSound('achievement'), 1);
      fetchAdminData();
    })
  }

  const handleDelete = async (type: string, id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/${type}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
        addMessage({ content: data.message, type: 'success' })
        setTimeout(() => playSound('achievement'), 1);
        fetchAdminData();
      })
    } catch (error) {
      throw new Error('network error')
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard variations={variations} users={users} openings={openings} />;
      case 'users':
        return <UserManagement handleDelete={handleDelete} users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 'lessons':
        return <LessonManagement handleDelete={handleDelete} openings={openings} variations={variations} toggleStatus={toggleStatus} />;
      default:
        return <Dashboard variations={variations} users={users} openings={openings} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full text-white">
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg.content} type={msg.type} onClose={() => removeMessage(idx)} />
        ))}
      </div>
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

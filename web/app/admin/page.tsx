'use client'
import React, { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  Trophy,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import { Opening, OpeningVariation, Status, User } from '@/types/types';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentUsers, setRecentUsers] = useState([{ id: 1, name: 'Alice Johnson', email: 'alice@email.com', rating: 1450, status: 'active', joined: '2024-06-20' },
  { id: 2, name: 'Bob Smith', email: 'bob@email.com', rating: 1620, status: 'inactive', joined: '2024-06-18' },
  { id: 3, name: 'Carol Davis', email: 'carol@email.com', rating: 1380, status: 'active', joined: '2024-06-15' },
  { id: 4, name: 'David Wilson', email: 'david@email.com', rating: 1750, status: 'active', joined: '2024-06-12' }]);
  const [openings, setOpenings] = useState<Opening[] | []>([]);
  const [users, setUsers] = useState<User[] | []>([]);
  const [variations, setVariations] = useState<OpeningVariation[] | []>([]);
  const [totalUsers, setTotalUsers] = useState();
  const [totalOpenigns, setTotalOpenigns] = useState();
  const [completedLessons, setCompletedLessons] = useState();
  const [totalContributions, setTotalContributions] = useState();
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

  // Mock data
  const stats = {
    totalUsers: 15847,
    totalOpenings: 245,
    completedLessons: 12453,
    totalContributions: 4.7,
  };

  interface TabButtonProps {
    id: string,
    label: string,
    icon: any,
    isActive: boolean,
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

  interface StatCardProps {
    title: string,
    value: string,
    icon: any,
    color: string,
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value="100"
          color="red"
          icon={Users}

        />
        <StatCard
          title="Total Openings"
          value="245"
          color="green"
          icon={BookOpen}
        />
        <StatCard
          title="Completions"
          value="12,453"
          color="blue"
          icon={Trophy}
        />
        <StatCard
          title="Contributions"
          value="4.7/5"
          color="blue"
          icon={Star}
        />
        <StatCard
          title="Recordings"
          value="$45,230"
          color="red"
          icon={Star}
        />
        <StatCard
          title="Custom Lines"
          value="$45,230"
          icon={Star}
          color='green'
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rating: {user.rating}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Performing Lessons</h3>
          <div className="space-y-3">
            {openings.slice(0, 4).map(lesson => (
              <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{lesson.name}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold">User</th>
                <th className="text-left p-4 font-semibold">Rating</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{user.rating}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-black">{user.joined}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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

  const renderLessons = () => (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Lesson Management</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            Add Lesson
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold">Opening</th>
                <th className="text-left p-4 font-semibold">Code</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {openings.map(lesson => (
                <tr key={lesson._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{lesson.name}</p>
                  </td>


                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{lesson.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button disabled={lesson.status === Status.Accepted} onClick={() => toggleStatus('opening', lesson._id)} className={`inline-block px-3 py-1 rounded-full text-sm ${lesson.status === Status.Accepted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {lesson.status}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold">Variations</th>
                <th className="text-left p-4 font-semibold">Code</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variations.map(variation => (
                <tr key={variation._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{variation.title}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{variation.code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button disabled={variation.status === Status.Accepted} onClick={() => toggleStatus('variation', variation._id)} className={`inline-block px-3 py-1 rounded-full text-sm ${variation.status === Status.Accepted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {variation.status}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'lessons':
        return renderLessons();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full text-black">
      <div className="flex">
        {/* Sidebar */}
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
        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
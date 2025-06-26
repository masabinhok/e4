import React from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { User } from '@/types/types';
import { dateConverter } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserManagement = ({ users, searchTerm, setSearchTerm }: UserManagementProps) => {
  ;
  return (
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
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">_id</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{user.role}</span>
                  </td>
                  <td className="p-4 text-black">{user._id}</td>
                  <td className="p-4 text-black">{dateConverter(user.createdAt)}</td>
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
};

export default UserManagement;

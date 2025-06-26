import React from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { User } from '@/types/types';
import { dateConverter } from '@/lib/utils';

interface UserManagementProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleDelete: (type: string, id: string) => void;
}

const UserManagement = ({ users, searchTerm, setSearchTerm, handleDelete }: UserManagementProps) => {
  ;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <Filter size={20} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 font-semibold text-white">User</th>
                <th className="text-left p-4 font-semibold text-white">Role</th>
                <th className="text-left p-4 font-semibold text-white">_id</th>
                <th className="text-left p-4 font-semibold text-white">Joined</th>
                <th className="text-left p-4 font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-gray-700">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white">{user.fullName}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">{user.role}</span>
                  </td>
                  <td className="p-4 text-white">{user._id}</td>
                  <td className="p-4 text-white">{dateConverter(user.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-900 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-green-400 hover:bg-green-900 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete('user', user._id)} className="p-2 text-red-400 hover:bg-red-900 rounded-lg">
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

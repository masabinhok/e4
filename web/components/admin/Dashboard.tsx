import React from 'react';
import { Users, BookOpen, Trophy, Star } from 'lucide-react';
import StatCard from './StatCard';
import { Opening, Role, User } from '@/types/types';

interface DashboardProps {
  users: User[];
  openings: Opening[];
}

const Dashboard = ({ users, openings   }: DashboardProps) => {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          color="red"
          icon={Users}
        />
        <StatCard
          title="Total Openings"
          value={openings.length}
          color="green"
          icon={BookOpen}
        />
        <StatCard
          title="Completions"
          value={1}
          color="blue"
          icon={Trophy}
        />
        <StatCard
          title="Contributions"
          value={1}
          color="blue"
          icon={Star}
        />
        <StatCard
          title="Recordings"
          value={1}
          color="red"
          icon={Star}
        />
        <StatCard
          title="Custom Lines"
          value={1}
          icon={Star}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 4).map(user => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${user.role === Role.Admin ? 'text-green-500' : 'text-blue-500'}`}>{user.role}</p>
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
};

export default Dashboard;

import React from 'react';
import { Users, BookOpen, Trophy, Star } from 'lucide-react';
import StatCard from './StatCard';
import { Opening } from '@/types/types';

interface DashboardProps {
  openings: Opening[];
}

const Dashboard = ({ openings }: DashboardProps) => {
  const recentUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@email.com', rating: 1450, status: 'active', joined: '2024-06-20' },
    { id: 2, name: 'Bob Smith', email: 'bob@email.com', rating: 1620, status: 'inactive', joined: '2024-06-18' },
    { id: 3, name: 'Carol Davis', email: 'carol@email.com', rating: 1380, status: 'active', joined: '2024-06-15' },
    { id: 4, name: 'David Wilson', email: 'david@email.com', rating: 1750, status: 'active', joined: '2024-06-12' }
  ];

  return (
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
          color="green"
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
};

export default Dashboard;

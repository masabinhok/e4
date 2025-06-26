import React from 'react';
import { Users, BookOpen, Trophy, Star } from 'lucide-react';
import StatCard from './StatCard';
import { Opening, OpeningVariation, Role, User } from '@/types/types';

interface DashboardProps {
  users: User[];
  openings: Opening[];
  variations: OpeningVariation[];
}

const Dashboard = ({ users, openings, variations }: DashboardProps) => {

  const recordingsCount = variations.filter((variation) => variation.code === 'recorded-pgns').length
  const customsCount = variations.filter((variation) => variation.code === 'custom-pgns').length
  const contributionsCount = variations.filter((variation) => variation.contributor).length

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
          title="Total Variations"
          value={variations.length}
          color="blue"
          icon={Trophy}
        />
        <StatCard
          title="Total Contributions"
          value={contributionsCount}
          color="blue"
          icon={Star}
        />
        <StatCard
          title="Total Recordings"
          value={recordingsCount}
          color="red"
          icon={Star}
        />
        <StatCard
          title="Total Custom Lines"
          value={customsCount}
          icon={Star}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 4).map(user => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{user.fullName}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${user.role === Role.Admin ? 'text-green-400' : 'text-blue-400'}`}>{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Performing Lessons</h3>
          <div className="space-y-3">
            {openings.slice(0, 4).map(lesson => (
              <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-white">{lesson.name}</p>
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

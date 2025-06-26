import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
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

export default StatCard;

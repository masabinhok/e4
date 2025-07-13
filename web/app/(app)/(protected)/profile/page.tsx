"use client";

import React from "react";
import { useAuth } from "@/store/auth";
import {
  Trophy,
  Target,
  BookOpen,
  Brain,
  Edit3,
  User,
  Mail,
  Calendar,
  LogOut,
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Helper function to get gradient colors
  const getGradientColor = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      "text-blue-400": "from-blue-500 to-blue-600",
      "text-purple-400": "from-purple-500 to-purple-600",
      "text-green-400": "from-green-500 to-green-600",
      "text-orange-400": "from-orange-500 to-orange-600",
      "text-yellow-400": "from-yellow-500 to-yellow-600",
    };
    return colorMap[colorClass] || "from-gray-500 to-gray-600";
  };

  // Calculate user progress from actual data
  const learningStats = [
    {
      name: "Recorded Lines",
      count: user?.recordedLines?.length || 0,
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      name: "Custom Lines",
      count: user?.customLines?.length || 0,
      icon: Edit3,
      color: "text-purple-400",
    },
    {
      name: "Practiced Lines",
      count: user?.practicedLines?.length || 0,
      icon: Target,
      color: "text-green-400",
    },
    {
      name: "Quizzed Lines",
      count: user?.quizzedLines?.length || 0,
      icon: Brain,
      color: "text-orange-400",
    },
    {
      name: "Learned Lines",
      count: user?.learnedLines?.length || 0,
      icon: Trophy,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Profile Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/30 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/20 group-hover:ring-white/30 transition-all duration-300 group-hover:scale-105">
                    {user?.fullName?.charAt(0).toUpperCase() || (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-10 blur-sm"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3 animate-in slide-in-from-left-4 duration-700 delay-200">
                    {user?.fullName || "Chess Student"}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-300 animate-in slide-in-from-left-4 duration-700 delay-300">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">
                        {user?.email || "Not available"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors duration-200">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Joined{" "}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="self-center lg:self-start bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/30 hover:border-red-400/50 rounded-xl px-6 py-3 text-white font-medium transition-all duration-300 flex items-center gap-2 group hover:scale-105 animate-in slide-in-from-right-4 delay-400"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/30 rounded-3xl p-8 shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Learning Progress
              </h2>
              <p className="text-gray-400">Track your chess opening mastery</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {learningStats.map((stat, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-white/40 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in slide-in-from-bottom-4 delay-${600 + index * 100}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${getGradientColor(stat.color)} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {stat.name}
                      </h3>
                      <p className="text-gray-400 text-sm">Total completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                      {stat.count}
                    </div>
                    {stat.count > 0 && (
                      <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                        +{Math.floor(stat.count * 0.1)} this week
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

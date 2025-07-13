"use client";

import React, { useState } from "react";
import { useAuth } from "@/store/auth";
import {
  Trophy,
  Target,
  BookOpen,
  Brain,
  Zap,
  Edit3,
  Crown,
  Star,
  TrendingUp,
  Clock,
  LucideIcon,
  LogOut,
} from "lucide-react";

// Define proper types
type Achievement = {
  name: string;
  description: string;
  icon: LucideIcon;
};

type Stat = {
  totalGames: number;
  winRate: number;
  currentRating: number;
  bestRating: number;
  studyStreak: number;
  totalStudyTime: number;
  favoriteOpening: string;
  recentAchievements: Achievement[];
};

type ProgressItem = {
  category: string;
  count: number;
  color: string;
  icon: LucideIcon;
};

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "progress" | "achievements"
  >("overview");

  const stats: Stat = {
    totalGames: 247,
    winRate: 68,
    currentRating: 1432,
    bestRating: 1587,
    studyStreak: 12,
    totalStudyTime: 156,
    favoriteOpening: "Sicilian Defense",
    recentAchievements: [
      {
        name: "Opening Master",
        description: "Learned 50 opening lines",
        icon: BookOpen,
      },
      {
        name: "Streak Champion",
        description: "15-day study streak",
        icon: Zap,
      },
      { name: "Tactician", description: "Solved 100 puzzles", icon: Target },
    ],
  };

  const learningProgress: ProgressItem[] = [
    {
      category: "Recorded Lines",
      count: user?.recordedLines?.length || 0,
      color: "bg-blue-500",
      icon: BookOpen,
    },
    {
      category: "Custom Lines",
      count: user?.customLines?.length || 0,
      color: "bg-purple-500",
      icon: Edit3,
    },
    {
      category: "Practiced Lines",
      count: user?.practicedLines?.length || 0,
      color: "bg-green-500",
      icon: Target,
    },
    {
      category: "Quizzed Lines",
      count: user?.quizzedLines?.length || 0,
      color: "bg-orange-500",
      icon: Brain,
    },
    {
      category: "Learned Lines",
      count: user?.learnedLines?.length || 0,
      color: "bg-emerald-500",
      icon: Trophy,
    },
  ];

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "text-blue-400",
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: LucideIcon;
    color?: string;
  }) => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-300 uppercase tracking-wide">
            {title}
          </div>
        </div>
      </div>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
  );

  const ProgressCard = ({
    category,
    count,
    color,
    icon: Icon,
  }: ProgressItem) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-medium">{category}</div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white">{count}</div>
      </div>
    </div>
  );

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                      {user?.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {user?.fullName || "Chess Player"}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-300">
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>Rating: {stats.currentRating}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>{stats.winRate}% Win Rate</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span>{stats.studyStreak} Day Streak</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLogout()}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-white font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1 mb-8">
          {["overview", "progress", "achievements"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as "overview" | "progress" | "achievements")
              }
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Games"
                value={stats.totalGames}
                subtitle="This month: +23"
                icon={Target}
                color="text-blue-400"
              />
              <StatCard
                title="Best Rating"
                value={stats.bestRating}
                subtitle="All-time high"
                icon={Trophy}
                color="text-yellow-400"
              />
              <StatCard
                title="Study Hours"
                value={stats.totalStudyTime}
                subtitle="This month: 28h"
                icon={Clock}
                color="text-green-400"
              />
              <StatCard
                title="Win Rate"
                value={`${stats.winRate}%`}
                subtitle="Last 50 games"
                icon={TrendingUp}
                color="text-purple-400"
              />
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-400" />
                <span>Learning Progress</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningProgress.map((item, index) => (
                  <ProgressCard key={index} {...item} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Detailed Progress
            </h2>
            <div className="space-y-6">
              {learningProgress.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {item.category}
                        </h3>
                        <p className="text-gray-400">
                          Total: {item.count} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {item.count}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{
                        width: `${Math.min((item.count / 20) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span>Recent Achievements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <achievement.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {achievement.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

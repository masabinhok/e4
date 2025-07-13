"use client";

import React, { useState, useEffect } from "react";
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
  Calendar,
  Award,
  ChevronRight,
  Activity,
  Users,
  Flame,
  BarChart3,
} from "lucide-react";

type RecentActivity = {
  id: string;
  type: "study" | "practice" | "achievement" | "game";
  title: string;
  description: string;
  timestamp: Date;
  icon: LucideIcon;
  color: string;
};

type WeeklyData = {
  day: string;
  hours: number;
};

// Define proper types
type Achievement = {
  name: string;
  description: string;
  icon: LucideIcon;
  date?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
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
    "overview" | "progress" | "achievements" | "activity"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateStats(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
        date: "2 days ago",
        rarity: "epic",
      },
      {
        name: "Streak Champion",
        description: "15-day study streak",
        icon: Zap,
        date: "1 week ago",
        rarity: "rare",
      },
      {
        name: "Tactician",
        description: "Solved 100 puzzles",
        icon: Target,
        date: "3 days ago",
        rarity: "common",
      },
      {
        name: "Chess Scholar",
        description: "Completed 25 lessons",
        icon: Brain,
        date: "5 days ago",
        rarity: "rare",
      },
      {
        name: "Perfect Score",
        description: "100% accuracy in practice",
        icon: Star,
        date: "1 day ago",
        rarity: "legendary",
      },
      {
        name: "Speed Demon",
        description: "Completed lesson in under 5 minutes",
        icon: Activity,
        date: "4 days ago",
        rarity: "epic",
      },
    ],
  };

  const weeklyStudyData: WeeklyData[] = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.1 },
    { day: "Fri", hours: 4.0 },
    { day: "Sat", hours: 1.5 },
    { day: "Sun", hours: 2.8 },
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "study",
      title: "Completed Sicilian Defense",
      description: "Finished studying 12 variations",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: BookOpen,
      color: "text-blue-400",
    },
    {
      id: "2",
      type: "achievement",
      title: "Perfect Score Achievement",
      description: "Achieved 100% accuracy in practice",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      id: "3",
      type: "practice",
      title: "Practice Session",
      description: "Practiced Queen's Gambit for 45 minutes",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: Target,
      color: "text-green-400",
    },
    {
      id: "4",
      type: "game",
      title: "Rapid Game Victory",
      description: "Won against 1500-rated opponent",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      icon: Crown,
      color: "text-purple-400",
    },
  ];

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
    trend,
    animated = false,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: string;
    trend?: string;
    animated?: boolean;
  }) => (
    <div
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 ${animated ? "animate-fadeInUp" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-300 uppercase tracking-wide">
            {title}
          </div>
        </div>
      </div>
      {trend && (
        <div className="text-xs text-green-400 font-medium">{trend}</div>
      )}
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

  // New ProgressCard for weekly data
  const WeeklyProgressCard = ({
    title,
    data,
  }: {
    title: string;
    data: WeeklyData[];
  }) => (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        {title}
      </h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div
            key={item.day}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-blue-200"
              style={{
                height: `${(item.hours / Math.max(...data.map((d) => d.hours))) * 100}%`,
                minHeight: "8px",
              }}
            ></div>
            <div className="text-xs text-zinc-400">{item.day}</div>
            <div className="text-xs text-white font-medium">{item.hours}h</div>
          </div>
        ))}
      </div>
    </div>
  );

  const AchievementsView = ({
    achievements,
  }: {
    achievements: Achievement[];
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const rarityColors: Record<string, string> = {
            common: "border-gray-500 bg-gray-500/10",
            rare: "border-blue-500 bg-blue-500/10",
            epic: "border-purple-500 bg-purple-500/10",
            legendary: "border-yellow-500 bg-yellow-500/10",
          };

          const rarity = achievement.rarity || "common";
          const colorClass = rarityColors[rarity];

          return (
            <div
              key={index}
              className={`rounded-xl p-6 border-2 ${colorClass} backdrop-blur-sm hover:scale-105 transition-all duration-300`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <achievement.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${colorClass} capitalize`}
                >
                  {rarity}
                </span>
                <span className="text-xs text-zinc-500">
                  {achievement.date || "Recently"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ProgressView = ({
    stats,
    weeklyData,
  }: {
    stats: Stat;
    weeklyData: WeeklyData[];
  }) => (
    <div className="space-y-6">
      <WeeklyProgressCard title="Weekly Study Hours" data={weeklyData} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            Learning Progress
          </h3>
          <div className="space-y-4">
            {learningProgress.map((item, index) => (
              <ProgressCard key={index} {...item} />
            ))}
          </div>
        </div>
        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">
            Study Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
              <span className="text-zinc-300">Total Study Time</span>
              <span className="text-white font-semibold">
                {stats.totalStudyTime}h
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
              <span className="text-zinc-300">Best Rating</span>
              <span className="text-white font-semibold">
                {stats.bestRating}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
              <span className="text-zinc-300">Favorite Opening</span>
              <span className="text-white font-semibold">
                {stats.favoriteOpening}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityView = ({
    recentActivity,
  }: {
    recentActivity: RecentActivity[];
  }) => (
    <div className="space-y-6">
      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Recent Activity Timeline
        </h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 transition-colors"
            >
              <div
                className={`p-3 rounded-lg bg-zinc-600/50 ${activity.color}`}
              >
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white">{activity.title}</h4>
                  <span className="text-xs text-zinc-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{activity.description}</p>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full bg-zinc-600/30 ${activity.color} capitalize`}
                  >
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

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
          {["overview", "progress", "achievements", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab as "overview" | "progress" | "achievements" | "activity",
                )
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
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-zinc-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-800 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-zinc-800 rounded-2xl"></div>
              <div className="h-64 bg-zinc-800 rounded-2xl"></div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Games"
                    value={stats.totalGames.toString()}
                    icon={Users}
                    color="text-blue-400"
                    trend="+12 this month"
                    animated={animateStats}
                  />
                  <StatCard
                    title="Win Rate"
                    value={`${stats.winRate}%`}
                    icon={Trophy}
                    color="text-yellow-400"
                    trend="+5% this month"
                    animated={animateStats}
                  />
                  <StatCard
                    title="Current Rating"
                    value={stats.currentRating.toString()}
                    icon={BarChart3}
                    color="text-green-400"
                    trend="+45 this week"
                    animated={animateStats}
                  />
                  <StatCard
                    title="Study Streak"
                    value={`${stats.studyStreak} days`}
                    icon={Flame}
                    color="text-orange-400"
                    trend="Personal best!"
                    animated={animateStats}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WeeklyProgressCard
                    title="Weekly Study Progress"
                    data={weeklyStudyData}
                  />
                  <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {recentActivity.slice(0, 4).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-700/30 hover:bg-zinc-700/50 transition-colors"
                        >
                          <div
                            className={`p-2 rounded-lg bg-zinc-600/50 ${activity.color}`}
                          >
                            <activity.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">
                              {activity.title}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {activity.description}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
              <ProgressView stats={stats} weeklyData={weeklyStudyData} />
            )}

            {activeTab === "achievements" && (
              <AchievementsView achievements={stats.recentAchievements} />
            )}

            {activeTab === "activity" && (
              <ActivityView recentActivity={recentActivity} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

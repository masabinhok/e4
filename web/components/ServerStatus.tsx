import { useAuth } from "@/store/auth";
import { Crown, Clock, Zap } from "lucide-react";
import React from "react";

const ServerStatus = () => {
  const { isLoading } = useAuth();
  return (
    <div className="w-full max-w-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-xl p-4 shadow-xl relative overflow-hidden">
        {/* Chess board pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 h-full">
            {[...Array(64)].map((_, i) => (
              <div
                key={i}
                className={`${(Math.floor(i / 8) + i) % 2 === 0 ? "bg-white" : "bg-transparent"}`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">e4.learnchess</h4>
              <p className="text-xs text-slate-300">Free Opening Mastery</p>
            </div>
          </div>

          <div
            className={`backdrop-blur-sm rounded-lg p-3 mb-3 border transition-all duration-500 ${
              isLoading
                ? "bg-slate-700/60 border-slate-600"
                : "bg-emerald-900/40 border-emerald-500/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {isLoading ? "📚 Loading Modes..." : "🎯 All Modes Ready"}
              </span>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isLoading ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isLoading ? "FREE" : "LIVE"}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isLoading
                ? "Initializing Learn Mode, Practice Mode, Quiz Mode, PGN Import & Record Line features..."
                : "Learn • Practice • Quiz • Custom PGNs • Record Lines - All ready to use!"}
            </p>
          </div>

          <div
            className={`flex items-center justify-center gap-2 p-2 rounded-lg border transition-all duration-500 ${
              isLoading
                ? "bg-amber-500/20 border-amber-500/30"
                : "bg-emerald-500/20 border-emerald-500/30"
            }`}
          >
            {isLoading ? (
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Zap className="w-4 h-4 text-emerald-400" />
            )}
            <span
              className={`text-xs font-medium transition-colors duration-300 ${
                isLoading ? "text-amber-200" : "text-emerald-200"
              }`}
            >
              {isLoading
                ? "Loading opening variations database..."
                : "Ready to master openings!"}
            </span>
            {isLoading && (
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;

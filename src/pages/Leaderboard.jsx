import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Cpu, 
  Sparkles, 
  UserCheck, 
  Flame, 
  BookOpen,
  TrendingUp,
  Star
} from 'lucide-react';

export default function Leaderboard() {
  const [activeBoard, setActiveBoard] = useState('learners'); // 'learners', 'contributors', 'mentors'
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard');
        setLeaderboardData(res.data);
      } catch (err) {
        console.error("Could not fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-550 dark:text-gray-400">Loading Rankings...</p>
        </div>
      </div>
    );
  }

  const getActiveList = () => {
    if (!leaderboardData) return [];
    if (activeBoard === 'learners') return leaderboardData.topLearners;
    if (activeBoard === 'contributors') return leaderboardData.topContributors;
    return leaderboardData.topMentors;
  };

  const list = getActiveList();

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight mb-2">Network Leaderboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Rankings updated in real time based on educational exchange validations.</p>
        </div>

        {/* Board Switcher tabs */}
        <div className="flex rounded-xl p-1 bg-gray-100 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/80 mb-10 max-w-md mx-auto">
          {[
            { id: 'learners', name: 'Learners', icon: Trophy },
            { id: 'contributors', name: 'Contributors', icon: Sparkles },
            { id: 'mentors', name: 'Mentors', icon: BookOpen }
          ].map((board) => {
            const Icon = board.icon;
            return (
              <button
                key={board.id}
                onClick={() => setActiveBoard(board.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeBoard === board.id
                    ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {board.name}
              </button>
            );
          })}
        </div>

        {/* Podiums (Top 3 highlighting) */}
        {list.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 items-end mb-10 max-w-2xl mx-auto pt-6 text-center">
            {/* 2nd Place */}
            <div className="order-1 space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-300 to-gray-400 mx-auto flex items-center justify-center text-white font-bold text-sm shadow-sm relative">
                {list[1].name[0]}
                <span className="absolute -top-2.5 -right-1 w-5 h-5 bg-gray-400 rounded-full text-[9px] flex items-center justify-center border border-white">2</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{list[1].name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {list[1].score} {activeBoard === 'learners' ? 'KS' : activeBoard === 'contributors' ? 'CS' : 'Students'}
                </div>
              </div>
              <div className="h-16 bg-gray-100 dark:bg-gray-900/40 rounded-t-xl border border-b-0 border-gray-200/50 dark:border-gray-800/50"></div>
            </div>

            {/* 1st Place */}
            <div className="order-2 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 mx-auto flex items-center justify-center text-white font-extrabold text-lg shadow-glow-purple relative">
                {list[0].name[0]}
                <span className="absolute -top-3 right-0.5 w-6 h-6 bg-yellow-500 rounded-full text-xs flex items-center justify-center border-2 border-white animate-pulse">👑</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{list[0].name}</div>
                <div className="text-xs font-extrabold text-primary mt-0.5">
                  {list[0].score} {activeBoard === 'learners' ? 'KS' : activeBoard === 'contributors' ? 'CS' : 'Students'}
                </div>
              </div>
              <div className="h-24 bg-primary/10 dark:bg-primary/5 rounded-t-2xl border border-b-0 border-primary/20 dark:border-primary/20"></div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 mx-auto flex items-center justify-center text-white font-bold text-sm shadow-sm relative">
                {list[2].name[0]}
                <span className="absolute -top-2.5 -right-1 w-5 h-5 bg-amber-700 rounded-full text-[9px] flex items-center justify-center border border-white">3</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{list[2].name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {list[2].score} {activeBoard === 'learners' ? 'KS' : activeBoard === 'contributors' ? 'CS' : 'Students'}
                </div>
              </div>
              <div className="h-12 bg-gray-100 dark:bg-gray-900/40 rounded-t-xl border border-b-0 border-gray-200/50 dark:border-gray-800/50"></div>
            </div>
          </div>
        )}

        {/* General rankings list */}
        <div className="rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-gray-900/40">
            <span>Rank & Contributor</span>
            <span>
              {activeBoard === 'learners' && 'Knowledge Score'}
              {activeBoard === 'contributors' && 'Contribution Score'}
              {activeBoard === 'mentors' && 'Enrolled Students'}
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/40">
            {list.map((item, idx) => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                    {activeBoard === 'mentors' && item.qualityScore && (
                      <span className="text-[10px] text-warning flex items-center gap-0.5 mt-0.5">
                        ★ {item.qualityScore} Quality Rating
                      </span>
                    )}
                  </div>
                </div>

                <span className="font-mono font-bold text-primary dark:text-primary-dark">
                  {item.score} {activeBoard === 'learners' ? 'KS' : activeBoard === 'contributors' ? 'CS' : 'LC Payout'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

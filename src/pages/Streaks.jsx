import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStreaks } from '../hooks/useStreaks';
import { Trophy, Flame, Calendar, Lock } from 'lucide-react';

const ALL_BADGES = [
  { id: 'beginner', name: 'Beginner', streak: 1, icon: '🌟' },
  { id: '3day', name: '3 Day Spark', streak: 3, icon: '🔥' },
  { id: '7day', name: 'Weekly Warrior', streak: 7, icon: '💪' },
  { id: '14day', name: 'Fortnight Queen', streak: 14, icon: '👑' },
  { id: '30day', name: 'Monthly Master', streak: 30, icon: '🏆' },
  { id: '60day', name: 'Cycle Sage', streak: 60, icon: '🧘' },
  { id: '90day', name: 'Diamond Divider', streak: 90, icon: '💎' },
];

export default function Streaks({ userId, t }) {
  const { streakData, loading } = useStreaks(userId);
  const { currentStreak, longestStreak, earnedBadges } = streakData;
  const isHindi = t?.hello?.includes('नमस्ते');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-rose-400 text-4xl animate-pulse">🌸</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-rose-500 flex items-center gap-2"
      >
        <Trophy size={28} /> {isHindi ? 'आपकी उपलब्धियां' : 'Your Achievements'}
      </motion.h2>

      {/* Current Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{isHindi ? 'लगातार दिन' : 'Current Streak'}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl font-bold">{currentStreak}</span>
              <span className="text-lg">{isHindi ? 'दिन' : 'days'}</span>
            </div>
          </div>
          <Flame size={48} className="opacity-80" />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>{isHindi ? 'सबसे लंबी स्ट्रीक' : 'Longest Streak'}: {longestStreak} {isHindi ? 'दिन' : 'days'}</span>
          <Calendar size={20} className="opacity-70" />
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {isHindi ? 'बैज' : 'Badges'}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`relative rounded-2xl p-4 text-center transition-all ${
                  earned
                    ? 'bg-white shadow-md border border-rose-100'
                    : 'bg-gray-100 opacity-70 grayscale'
                }`}
              >
                <span className="text-4xl block">{badge.icon}</span>
                <p className={`text-xs font-semibold mt-2 ${earned ? 'text-gray-800' : 'text-gray-400'}`}>
                  {badge.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {badge.streak} day{earned ? '' : ' 🔒'}
                </p>
                {earned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-4 border border-rose-50 text-sm text-gray-500"
      >
        <p>💡 {isHindi ? 'रोज़ाना mood, symptoms या water log करने पर streak बढ़ती है। लगातार बने रहो!' : 'Log your mood, symptoms or water daily to increase your streak. Stay consistent!'}</p>
      </motion.div>
    </div>
  );
}
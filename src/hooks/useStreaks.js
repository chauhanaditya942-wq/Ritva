import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BADGES = [
  { id: 'beginner', name: 'Beginner', streak: 1, icon: '🌟' },
  { id: '3day', name: '3 Day Spark', streak: 3, icon: '🔥' },
  { id: '7day', name: 'Weekly Warrior', streak: 7, icon: '💪' },
  { id: '14day', name: 'Fortnight Queen', streak: 14, icon: '👑' },
  { id: '30day', name: 'Monthly Master', streak: 30, icon: '🏆' },
  { id: '60day', name: 'Cycle Sage', streak: 60, icon: '🧘' },
  { id: '90day', name: 'Diamond Divider', streak: 90, icon: '💎' },
];

export function useStreaks(userId) {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    earnedBadges: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStreaks = async () => {
    if (!userId) return;

    // ✅ Bug 1 fixed: data → streakRow
    const { data: streakRow } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: badges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const earned = (badges || []).map(b => b.badge_id);

    setStreakData({
      currentStreak: streakRow?.current_streak || 0,
      longestStreak: streakRow?.longest_streak || 0,
      earnedBadges: earned,
    });
    setLoading(false);
  };

  const checkAndUpdateStreak = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const [symptomLog, waterLog] = await Promise.all([
      supabase.from('symptom_logs').select('id').eq('user_id', userId).eq('date', today).maybeSingle(),
      supabase.from('water_logs').select('id').eq('user_id', userId).eq('date', today).maybeSingle(),
    ]);

    const loggedToday = !!(symptomLog.data || waterLog.data);

    // ✅ Bug 2 fixed: .single() → .maybeSingle()
    const { data: streakRow } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let currentStreak = streakRow?.current_streak || 0;
    let longestStreak = streakRow?.longest_streak || 0;
    let lastLogDate = streakRow?.last_log_date || null;

    if (loggedToday) {
      if (lastLogDate === yesterday || lastLogDate === today) {
        if (lastLogDate !== today) {
          currentStreak += 1;
        }
      } else {
        currentStreak = 1;
      }
      lastLogDate = today;
      if (currentStreak > longestStreak) longestStreak = currentStreak;

      await supabase
        .from('user_streaks')
        .upsert({
          user_id: userId,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_log_date: lastLogDate,
          updated_at: new Date(),
        }, { onConflict: 'user_id' });

      const newBadges = BADGES.filter(b => currentStreak >= b.streak && !streakRow?.earned_badges?.includes(b.id));
      if (newBadges.length > 0) {
        const inserts = newBadges.map(b => ({
          user_id: userId,
          badge_id: b.id,
        }));
        await supabase.from('user_badges').upsert(inserts, { onConflict: 'user_id,badge_id' });
        return { updated: true, newBadges };
      }
    } else {
      if (lastLogDate && lastLogDate < yesterday) {
        currentStreak = 0;
        await supabase
          .from('user_streaks')
          .upsert({
            user_id: userId,
            current_streak: 0,
            longest_streak: longestStreak,
            last_log_date: null,
            updated_at: new Date()
          }, { onConflict: 'user_id' });
      }
      return { updated: false };
    }
  };

  useEffect(() => {
    fetchStreaks();
  }, [userId]);

  return { streakData, loading, checkAndUpdateStreak, fetchStreaks };
}
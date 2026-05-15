import { useEffect } from 'react';
import { useStreaks } from '../hooks/useStreaks';
import confetti from 'canvas-confetti';

export default function StreakChecker({ userId }) {
  const { checkAndUpdateStreak } = useStreaks(userId);

  useEffect(() => {
    if (!userId) return;
    const update = async () => {
      const result = await checkAndUpdateStreak();
      if (result?.newBadges?.length > 0) {
        // Celebrate with confetti!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    };
    update();
  }, [userId]);

  return null; // invisible
}
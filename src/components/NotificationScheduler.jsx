import { useEffect } from 'react';
import { useCycle } from '../hooks/useCycle';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationScheduler({ userId, isHindi }) {
  const cycleData = useCycle(userId);

  const {
    enableNotifications,
    notificationsEnabled,
    permissionStatus,
  } = useNotifications(
    userId,
    {
      getNextPeriodDate: cycleData.getNextPeriodDate,
      getOvulationDate: cycleData.getOvulationDate,
      getFertileWindowDates: cycleData.getFertileWindowDates,
    },
    isHindi
  );

  // Automatically enable notifications if permission already granted
  useEffect(() => {
    if (Notification.permission === 'granted') {
      enableNotifications();
    }
  }, []);

  // This component renders nothing, just runs the notification interval in background
  return null;
}
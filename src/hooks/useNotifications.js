import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const showLocalNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/hero.png',
      badge: '/hero.png',
      vibrate: [200, 100, 200],
    })
  }
}

const toDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const daysUntil = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

export function useNotifications(userId, { getNextPeriodDate, getOvulationDate, getFertileWindowDates } = {}, isHindi = false) {
  const [permissionStatus, setPermissionStatus] = useState(Notification.permission)
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted')
  const [inAppNotification, setInAppNotification] = useState(null)

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      setNotificationsEnabled(permission === 'granted')
      return permission === 'granted'
    } catch (err) {
      console.error('Notification error:', err)
      setPermissionStatus('denied')
      return false
    }
  }

  // ✅ Fix: .maybeSingle() instead of .single()
  const fetchTodayLog = async () => {
    if (!userId) return null
    const today = toDateStr(new Date())
    const { data } = await supabase
      .from('symptom_logs')
      .select('sleep_hours, water_intake')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()
    return data
  }

  const checkAndSendReminders = async () => {
    if (!getNextPeriodDate || !getOvulationDate || !getFertileWindowDates) return

    const nextPeriod = getNextPeriodDate()
    const ovulationDateStr = getOvulationDate()
    const fertileWindowDates = getFertileWindowDates()
    const today = toDateStr(new Date())
    const hour = new Date().getHours()

    if (!nextPeriod) return

    const nextPeriodStr = toDateStr(nextPeriod)
    const daysToPeriod = daysUntil(nextPeriodStr)

    if (daysToPeriod === 2) {
      showLocalNotification(
        isHindi ? '🌸 Period आने वाला है!' : '🌸 Period is coming!',
        isHindi
          ? 'अगले 2 दिनों में period शुरू हो सकता है। Pads या tampons ready रखें 🩸'
          : 'Period may start in 2 days. Keep pads or tampons ready 🩸'
      )
    }

    if (daysToPeriod === 1) {
      showLocalNotification(
        isHindi ? '🩸 कल period आ सकता है!' : '🩸 Period expected tomorrow!',
        isHindi
          ? 'Pads या tampons अपने पास ज़रूर रखें। तैयार रहें 💪'
          : 'Make sure to keep pads or tampons handy. Stay prepared 💪'
      )
    }

    if (daysToPeriod === 0) {
      showLocalNotification(
        isHindi ? '🌸 आज period expected है' : '🌸 Period expected today',
        isHindi
          ? 'Hydrated रहें, आराम करें और अपना ख़याल रखें 💗'
          : 'Stay hydrated, rest and take care of yourself 💗'
      )
    }

    if (ovulationDateStr) {
      const daysToOvulation = daysUntil(ovulationDateStr)

      if (daysToOvulation === 1) {
        showLocalNotification(
          isHindi ? '🥚 कल Ovulation है!' : '🥚 Ovulation tomorrow!',
          isHindi
            ? 'कल सबसे fertile दिन होगा। Basal body temperature track करें 🌡️'
            : 'Tomorrow is your most fertile day. Track basal body temperature 🌡️'
        )
      }

      if (daysToOvulation === 0) {
        showLocalNotification(
          isHindi ? '🥚 आज Ovulation Day है!' : '🥚 Today is Ovulation Day!',
          isHindi
            ? 'आज fertility peak पर है — सबसे ज़्यादा fertile दिन 🌟'
            : 'Fertility is at peak today — most fertile day 🌟'
        )
      }
    }

    if (fertileWindowDates.length > 0) {
      const firstFertileDay = fertileWindowDates[0]
      const daysToFertile = daysUntil(firstFertileDay)

      if (daysToFertile === 1) {
        showLocalNotification(
          isHindi ? '🌿 कल Fertile Window शुरू!' : '🌿 Fertile Window starts tomorrow!',
          isHindi
            ? 'कल से आपकी fertile window start होगी — 7 दिन तक fertility elevated रहेगी'
            : 'Your fertile window starts tomorrow — elevated fertility for 7 days'
        )
      }

      if (fertileWindowDates.includes(today)) {
        showLocalNotification(
          isHindi ? '🌿 आप Fertile Window में हैं' : '🌿 You are in your Fertile Window',
          isHindi
            ? 'आज fertility elevated है। अपना ख़याल रखें 🌿'
            : 'Fertility is elevated today. Take care of yourself 🌿'
        )
      }
    }

    if (hour >= 22 && hour < 23) {
      const todayLog = await fetchTodayLog()
      if (!todayLog || (todayLog.sleep_hours || 0) < 7) {
        showLocalNotification(
          isHindi ? '😴 सोने का समय हो गया!' : '😴 Time to sleep!',
          isHindi
            ? 'अच्छी नींद (7–9 घंटे) hormones balance करती है और cycle regular रखती है 🌙'
            : 'Good sleep (7–9 hrs) balances hormones and keeps your cycle regular 🌙'
        )
      }
    }

    if (hour === 9 || hour === 14 || hour === 18) {
      const todayLog = await fetchTodayLog()
      const currentWater = todayLog?.water_intake || 0
      if (currentWater < 8) {
        showLocalNotification(
          isHindi ? '💧 पानी पियो!' : '💧 Drink water!',
          isHindi
            ? `आज अभी तक ${currentWater} गिलास — लक्ष्य 8 गिलास। Cramps और headache कम होंगे 💙`
            : `${currentWater} glasses so far today — goal is 8. Helps reduce cramps & headaches 💙`
        )
      }
    }

    if (hour >= 20 && hour < 21) {
      showLocalNotification(
        isHindi ? '📝 आज का log करो!' : '📝 Log your day!',
        isHindi
          ? 'Ritva में आज का mood, symptoms और health track करें ✨'
          : 'Track today\'s mood, symptoms and health in Ritva ✨'
      )
    }
  }

  useEffect(() => {
    if (permissionStatus !== 'granted' || !notificationsEnabled) return
    checkAndSendReminders()
  }, [notificationsEnabled, permissionStatus])

  // ✅ Fix: 30 min interval instead of 1 hour
  useEffect(() => {
    if (permissionStatus !== 'granted' || !notificationsEnabled) return
    const interval = setInterval(checkAndSendReminders, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [notificationsEnabled, permissionStatus, getNextPeriodDate, isHindi])

  return {
    permissionStatus,
    notificationsEnabled,
    inAppNotification,
    enableNotifications,
    dismissInAppNotification: () => setInAppNotification(null),
  }
}
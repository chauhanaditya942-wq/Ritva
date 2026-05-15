import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const DAILY_GOAL = 8
const REMINDER_INTERVAL_MS = 2 * 60 * 60 * 1000

export default function WaterTracker({ userId, isHindi }) {
  const [glasses, setGlasses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notifEnabled, setNotifEnabled] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = tomorrowDate.toISOString().split('T')[0]

  const fetchToday = useCallback(async () => {
    const { data } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today)
      .lt('date', tomorrow)
      .maybeSingle()
    
    if (data) setGlasses(data.glasses)
    setLoading(false)
  }, [userId, today, tomorrow])

  useEffect(() => { fetchToday() }, [fetchToday])

  const saveGlasses = async (count) => {
    await supabase
      .from('water_logs')
      .upsert({
        user_id: userId,
        date: today,
        glasses: count,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id,date' })
  }

  const addGlass = async () => {
    const newCount = glasses + 1
    setGlasses(newCount)
    await saveGlasses(newCount)
  }

  const removeGlass = async () => {
    if (glasses === 0) return
    const newCount = glasses - 1
    setGlasses(newCount)
    await saveGlasses(newCount)
  }

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) {
      alert(isHindi ? 'आपका browser notifications support नहीं करता' : 'Your browser does not support notifications')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifEnabled(true)
      startReminders()
    }
  }

  const sendNotif = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons.svg' })
    }
  }

  const startReminders = () => {
    setInterval(() => {
      if (glasses < DAILY_GOAL) {
        sendNotif(
          isHindi ? '💧 RITVA — पानी पीने का समय!' : '💧 RITVA — Time to drink water!',
          isHindi
            ? `आपने आज ${glasses} गिलास पिए — ${DAILY_GOAL - glasses} और बाकी हैं। अभी एक गिलास पिएं! 🌸`
            : `You've had ${glasses} glasses today — ${DAILY_GOAL - glasses} more to go. Drink one now! 🌸`
        )
      } else {
        sendNotif(
          isHindi ? '✅ RITVA — शाबाश!' : '✅ RITVA — Well done!',
          isHindi
            ? 'आपने आज का पानी का लक्ष्य पूरा कर लिया! 💧🎉'
            : 'You have completed your daily water goal! 💧🎉'
        )
      }
    }, REMINDER_INTERVAL_MS)
  }

  const percent = Math.min((glasses / DAILY_GOAL) * 100, 100)
  const remaining = Math.max(DAILY_GOAL - glasses, 0)

  const statusColor = glasses >= DAILY_GOAL
    ? 'text-emerald-500'
    : glasses >= 5
      ? 'text-blue-400'
      : 'text-rose-400'

  const statusText = glasses >= DAILY_GOAL
    ? (isHindi ? '🎉 लक्ष्य पूरा!' : '🎉 Goal achieved!')
    : glasses >= 5
      ? (isHindi ? '👍 अच्छा जा रहा है!' : '👍 Going well!')
      : (isHindi ? '⚠️ और पानी पिएं' : '⚠️ Drink more water')

  if (loading) return <div className="text-center py-4 text-rose-300">💧</div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm border border-cyan-100 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">
          💧 {isHindi ? 'पानी ट्रैकर' : 'Water Tracker'}
        </h3>
        <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{isHindi ? `${glasses} गिलास पिए` : `${glasses} glasses drunk`}</span>
          <span>{isHindi ? `${remaining} बाकी` : `${remaining} remaining`}</span>
        </div>
        <div className="w-full bg-cyan-50 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">
          {isHindi ? `लक्ष्य: ${DAILY_GOAL} गिलास` : `Goal: ${DAILY_GOAL} glasses`}
        </p>
      </div>

      {/* Glass Grid */}
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: DAILY_GOAL }, (_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.2 }}
            className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${
              i < glasses
                ? 'bg-cyan-100 scale-105'
                : 'bg-gray-50'
            }`}
          >
            {i < glasses ? '💧' : '○'}
          </motion.div>
        ))}
      </div>

      {/* Add/Remove Buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={removeGlass}
          disabled={glasses === 0}
          className="w-10 h-10 rounded-full bg-rose-50 text-rose-400 text-xl font-bold hover:bg-rose-100 disabled:opacity-30 transition-all"
        >−</motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addGlass}
          className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-xl font-medium hover:opacity-90 transition-all"
        >
          {isHindi ? '+ एक गिलास पिया 💧' : '+ I drank a glass 💧'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={removeGlass}
          disabled={glasses === 0}
          className="w-10 h-10 rounded-full bg-rose-50 text-rose-400 text-xl font-bold hover:bg-rose-100 disabled:opacity-30 transition-all"
        >−</motion.button>
      </div>

      {/* Scientific Info */}
      <div className="bg-blue-50 rounded-xl p-3">
        <p className="text-xs text-blue-600">
          🔬 {isHindi
            ? 'वैज्ञानिक सुझाव: हर 2 घंटे में एक गिलास पानी पिएं — periods में hydration बहुत जरूरी है'
            : 'Scientific tip: Drink one glass every 2 hours — hydration is crucial during periods'}
        </p>
      </div>

      {/* Notification Toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {isHindi ? '🔔 पानी reminder' : '🔔 Water reminder'}
          </p>
          <p className="text-xs text-gray-400">
            {isHindi ? 'हर 2 घंटे में notification' : 'Notification every 2 hours'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={notifEnabled ? () => setNotifEnabled(false) : requestNotifPermission}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
            notifEnabled
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {notifEnabled ? (isHindi ? 'चालू ✓' : 'ON ✓') : (isHindi ? 'बंद' : 'OFF')}
        </motion.button>
      </div>
    </motion.div>
  )
}
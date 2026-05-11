import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
 
// Timezone-safe date parser — 'YYYY-MM-DD' string ko local date banao
const parseDate = (dateStr) => {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00')
}
 
// Date ko 'YYYY-MM-DD' string mein convert karo
const toDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
 
export function useCycle(userId) {
  const [periodLogs, setPeriodLogs] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    if (!userId) return
    fetchLogs()
  }, [userId])
 
  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
 
    if (!error) setPeriodLogs(data || [])
    setLoading(false)
  }
 
  // ✅ FIX: Sirf ACTUAL logged period dates return karo
  // Predicted/future dates bilkul nahi — woh getPredictedDates() se aate hain
  const getPeriodDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates = []
 
    periodLogs.forEach(log => {
      const start = parseDate(log.start_date)
      const end = parseDate(log.end_date)
      if (!start || !end) return
 
      // ✅ Future me start hone wala log skip karo (wo predicted hai, actual nahi)
      if (start > today) return
 
      // Safety: max 10 din period
      const maxEnd = new Date(start)
      maxEnd.setDate(maxEnd.getDate() + 9)
      const safeEnd = end > maxEnd ? maxEnd : end
 
      for (let d = new Date(start); d <= safeEnd; d.setDate(d.getDate() + 1)) {
        dates.push(toDateStr(d))
      }
    })
    return dates
  }
 
  // Average cycle length — scientifically: consecutive start dates ka gap
  const getAvgCycleLength = () => {
    if (periodLogs.length < 2) return 28
    const gaps = []
    for (let i = 0; i < periodLogs.length - 1; i++) {
      const a = parseDate(periodLogs[i].start_date)
      const b = parseDate(periodLogs[i + 1].start_date)
      const gap = Math.round(Math.abs((a - b) / (1000 * 60 * 60 * 24)))
      // Valid cycle: 21–45 din
      if (gap >= 21 && gap <= 45) gaps.push(gap)
    }
    if (gaps.length === 0) return 28
    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  }
 
  // Average period duration
  const getAvgPeriodDuration = () => {
    if (periodLogs.length === 0) return 5
    const durations = periodLogs.map(log => {
      const start = parseDate(log.start_date)
      const end = parseDate(log.end_date)
      if (!start || !end) return 5
      const dur = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
      return dur >= 1 && dur <= 10 ? dur : 5
    })
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
  }
 
  // Next period start date predict karo
  const getNextPeriodDate = () => {
    if (periodLogs.length === 0) return null
    const lastStart = parseDate(periodLogs[0].start_date)
    const cycleLength = getAvgCycleLength()
    const next = new Date(lastStart)
    next.setDate(next.getDate() + cycleLength)
    return next
  }
 
  // Predicted period dates (avg duration ke hisaab se)
  const getPredictedDates = () => {
    const next = getNextPeriodDate()
    if (!next) return []
    const duration = getAvgPeriodDuration()
    const dates = []
    for (let i = 0; i < duration; i++) {
      const d = new Date(next)
      d.setDate(d.getDate() + i)
      dates.push(toDateStr(d))
    }
    return dates
  }
 
  // Ovulation date — next period se 14 din pehle (scientifically correct)
  const getOvulationDate = () => {
    const next = getNextPeriodDate()
    if (!next) return null
    const ov = new Date(next)
    ov.setDate(ov.getDate() - 14)
    return toDateStr(ov)
  }
 
  // Fertile window dates — ovulation se 5 din pehle aur 1 din baad
  const getFertileWindowDates = () => {
    const ovStr = getOvulationDate()
    if (!ovStr) return []
    const dates = []
    const ov = parseDate(ovStr)
    for (let i = -5; i <= 1; i++) {
      if (i === 0) continue // ovulation day khud alag handle hota hai
      const d = new Date(ov)
      d.setDate(d.getDate() + i)
      dates.push(toDateStr(d))
    }
    return dates
  }
 
  // Luteal phase dates — ovulation ke 2 din baad se predicted period se 1 din pehle
  const getLutealDates = () => {
    const ovStr = getOvulationDate()
    const predicted = getPredictedDates()
    if (!ovStr || predicted.length === 0) return []
    const dates = []
    const start = parseDate(ovStr)
    start.setDate(start.getDate() + 2)
    const end = parseDate(predicted[0])
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(toDateStr(d))
    }
    return dates
  }
 
  // Days until next period
  const getDaysUntilNextPeriod = () => {
    const next = getNextPeriodDate()
    if (!next) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24))
  }
 
  // Current cycle day (aaj cycle ka kaunsa din hai)
  const getCurrentCycleDay = () => {
    if (periodLogs.length === 0) return null
    const lastStart = parseDate(periodLogs[0].start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = Math.ceil((today - lastStart) / (1000 * 60 * 60 * 24)) + 1
    return day > 0 ? day : null
  }
 
  // Naya period log karo
  const logPeriod = async (startDate, endDate) => {
    const { error } = await supabase
      .from('period_logs')
      .insert({ user_id: userId, start_date: startDate, end_date: endDate })
    if (!error) fetchLogs()
    return !error
  }
 
  return {
    periodLogs,
    loading,
    getPeriodDates,
    getPredictedDates,
    getOvulationDate,
    getFertileWindowDates,
    getLutealDates,
    getDaysUntilNextPeriod,
    getAvgCycleLength,
    getAvgPeriodDuration,
    getNextPeriodDate,
    getCurrentCycleDay,
    logPeriod,
    fetchLogs
  }
}
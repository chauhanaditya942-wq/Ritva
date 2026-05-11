import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCycle(userId) {
  const [periodLogs, setPeriodLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Supabase se data fetch karo
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

  // Period ke saare dates array banao
  const getPeriodDates = () => {
    const dates = []
    periodLogs.forEach(log => {
      const start = new Date(log.start_date)
      const end = new Date(log.end_date)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }
    })
    return dates
  }

  // Average cycle length calculate karo
  const getAvgCycleLength = () => {
    if (periodLogs.length < 2) return 28
    const gaps = []
    for (let i = 0; i < periodLogs.length - 1; i++) {
      const a = new Date(periodLogs[i].start_date)
      const b = new Date(periodLogs[i + 1].start_date)
      gaps.push(Math.abs((a - b) / (1000 * 60 * 60 * 24)))
    }
    return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  }

  // Next period predict karo
  const getNextPeriodDate = () => {
    if (periodLogs.length === 0) return null
    const lastStart = new Date(periodLogs[0].start_date)
    const cycleLength = getAvgCycleLength()
    const next = new Date(lastStart)
    next.setDate(next.getDate() + cycleLength)
    return next
  }

  // Predicted dates array banao (5 din)
  const getPredictedDates = () => {
    const next = getNextPeriodDate()
    if (!next) return []
    const dates = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(next)
      d.setDate(d.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  // Ovulation date (next period - 14 din)
  const getOvulationDate = () => {
    const next = getNextPeriodDate()
    if (!next) return null
    const ov = new Date(next)
    ov.setDate(ov.getDate() - 14)
    return ov.toISOString().split('T')[0]
  }

  // Days until next period
  const getDaysUntilNextPeriod = () => {
    const next = getNextPeriodDate()
    if (!next) return null
    const today = new Date()
    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
    return diff
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
    getDaysUntilNextPeriod,
    getAvgCycleLength,
    getNextPeriodDate,
    logPeriod,
    fetchLogs
  }
}
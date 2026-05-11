import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCycle } from '../hooks/useCycle'

export default function Insights({ userId, t }) {
  const { periodLogs, getAvgCycleLength, getDaysUntilNextPeriod, getOvulationDate } = useCycle(userId)
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    fetchRecentLogs()
  }, [])

  const fetchRecentLogs = async () => {
    const { data } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    if (data) setRecentLogs(data)
  }

  const ovulationDate = getOvulationDate()
  const daysUntil = getDaysUntilNextPeriod()

  return (
    <div className="max-w-md mx-auto">

      {/* Cycle Stats */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 mb-4 text-white shadow-md">
        <h2 className="font-bold text-lg mb-3">{t.cycleSummary}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs text-rose-100">{t.avgCycleLength}</p>
            <p className="text-2xl font-bold">{getAvgCycleLength()} {t.days}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs text-rose-100">{t.nextPeriod}</p>
            <p className="text-2xl font-bold">{daysUntil !== null ? `${daysUntil} ${t.days}` : '-'}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs text-rose-100">{t.totalCycles}</p>
            <p className="text-2xl font-bold">{periodLogs.length}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-xs text-rose-100">{t.ovulationDate}</p>
            <p className="text-lg font-bold">
              {ovulationDate
                ? new Date(ovulationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Period History */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.periodHistory}</h3>
        {periodLogs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">{t.noPeriodsLogged}</p>
        ) : (
          <div className="space-y-2">
            {periodLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    to {new Date(log.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="bg-rose-50 px-3 py-1 rounded-full">
                  <p className="text-xs text-rose-500 font-medium">
                    {Math.ceil((new Date(log.end_date) - new Date(log.start_date)) / (1000 * 60 * 60 * 24) + 1)} {t.days}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Mood Logs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.recentMoodLogs}</h3>
        {recentLogs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">{t.noMoodLogs}</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{log.mood}</p>
                  {log.symptoms.length > 0 && (
                    <p className="text-xs text-gray-400">
                      {log.symptoms.slice(0, 2).join(', ')}{log.symptoms.length > 2 ? '...' : ''}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
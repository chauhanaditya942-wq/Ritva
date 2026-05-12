import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCycle } from '../hooks/useCycle'
import ChatAssistant from '../components/AI/ChatAssistant'
import CycleChart from '../components/Predictions/CycleChart'

export default function Insights({ userId, t }) {
  const { periodLogs, getAvgCycleLength, getDaysUntilNextPeriod, getOvulationDate } = useCycle(userId)
  const [recentLogs, setRecentLogs] = useState([])
  const [healthLogs, setHealthLogs] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [newEndDate, setNewEndDate] = useState('')

  const isHindi = t.hello.includes('नमस्ते')

  useEffect(() => {
    fetchRecentLogs()
    fetchHealthLogs()
  }, [])

  const fetchRecentLogs = async () => {
    const { data } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (data) setRecentLogs(data)
  }

  const fetchHealthLogs = async () => {
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (data) setHealthLogs(data)
  }

  const handleUpdateEndDate = async () => {
    if (!newEndDate) return
    const { error } = await supabase
      .from('period_logs')
      .update({ end_date: newEndDate })
      .eq('id', editingLog.id)
    if (!error) {
      setEditingLog(null)
      setNewEndDate('')
      window.location.reload()
    }
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

      {/* ── Cycle Charts ── */}
     <CycleChart
  periodLogs={periodLogs}
  healthLogs={healthLogs}
  symptomLogs={recentLogs}
  isHindi={isHindi}
      />

      {/* AI Chat Toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-medium mt-4 mb-4 shadow-sm flex items-center justify-center gap-2"
      >
        <span>🤖</span>
        {showChat
          ? (isHindi ? 'AI Chat बंद करें' : 'Close AI Chat')
          : (isHindi ? 'RITVA AI से पूछें' : 'Ask RITVA AI')}
      </button>

      {/* AI Chat */}
      {showChat && (
        <div className="mb-4">
          <ChatAssistant
            userId={userId}
            periodLogs={periodLogs}
            recentSymptoms={recentLogs}
            isHindi={isHindi}
          />
        </div>
      )}

      {/* Period History */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.periodHistory}</h3>
        {periodLogs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">{t.noPeriodsLogged}</p>
        ) : (
          <div className="space-y-2">
            {periodLogs.slice(0, 5).map(log => (
              <div key={log.id} className="py-2 border-b border-rose-50 last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      to {new Date(log.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-rose-50 px-3 py-1 rounded-full">
                      <p className="text-xs text-rose-500 font-medium">
                        {Math.ceil((new Date(log.end_date) - new Date(log.start_date)) / (1000 * 60 * 60 * 24) + 1)} {t.days}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingLog(log)}
                      className="text-xs bg-rose-100 text-rose-500 px-2 py-1 rounded-full hover:bg-rose-200"
                    >
                      ✏️
                    </button>
                  </div>
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
              <div key={log.id} className="py-2 border-b border-rose-50 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-gray-700">{log.mood}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {log.pain_level > 0 && (
                    <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">😣 Pain: {log.pain_level}/10</span>
                  )}
                  {log.sleep_hours && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">😴 {log.sleep_hours}h sleep</span>
                  )}
                  {log.water_intake && (
                    <span className="text-xs bg-cyan-50 text-cyan-500 px-2 py-0.5 rounded-full">💧 {log.water_intake} glasses</span>
                  )}
                  {log.flow_level && (
                    <span className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">{log.flow_level}</span>
                  )}
                  {log.exercise_done && (
                    <span className="text-xs bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-full">🏃 {log.exercise_type || 'Exercise'}</span>
                  )}
                  {log.symptoms?.length > 0 && (
                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                      {log.symptoms.slice(0, 2).join(', ')}{log.symptoms.length > 2 ? '...' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit End Date Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
              {isHindi ? 'अंत तारीख अपडेट करें' : 'Update End Date'} 🌸
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {isHindi ? 'शुरुआत:' : 'Started:'} {new Date(editingLog.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
            </p>
            <div className="mb-6">
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'अंत की तारीख' : 'End Date'}
              </label>
              <input
                type="date"
                defaultValue={editingLog.end_date}
                onChange={e => setNewEndDate(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setEditingLog(null); setNewEndDate('') }}
                className="flex-1 py-3 rounded-xl border border-rose-100 text-gray-400 text-sm"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleUpdateEndDate}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium"
              >
                {isHindi ? 'अपडेट करें' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
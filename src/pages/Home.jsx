import { useState } from 'react'
import PeriodCalendar from '../components/Calendar/PeriodCalendar'
import { useCycle } from '../hooks/useCycle'
import PhaseCard from '../components/Predictions/PhaseCard'
import { getCyclePhase } from '../lib/cyclePhase'

export default function Home({ userId, t }) {
  const {
    loading,
    periodLogs,
    getPeriodDates,
    getPredictedDates,
    getOvulationDate,
    getDaysUntilNextPeriod,
    getAvgCycleLength,
    getNextPeriodDate,
    logPeriod,
    getFertileWindowDates,
    getLutealDates,
  } = useCycle(userId)
  const [showLogModal, setShowLogModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [logLoading, setLogLoading] = useState(false)

  const handleLogPeriod = async () => {
    if (!startDate) return
    setLogLoading(true)
    const defaultEnd = new Date(startDate)
    defaultEnd.setDate(defaultEnd.getDate() + 4)
    const finalEndDate = endDate || defaultEnd.toISOString().split('T')[0]
    await logPeriod(startDate, finalEndDate)
    setLogLoading(false)
    setShowLogModal(false)
    setStartDate('')
    setEndDate('')
  }

  const nextPeriod = getNextPeriodDate()
  const daysUntil = getDaysUntilNextPeriod()
  const phase = periodLogs.length > 0 ? getCyclePhase(periodLogs[0].start_date, getAvgCycleLength()) : null
  const isHindi = t.hello.includes('नमस्ते')

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-rose-400 text-4xl animate-pulse">🌸</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 mb-4 text-white shadow-md">
        <p className="text-rose-100 text-sm">{t.hello}</p>
        {daysUntil !== null ? (
          <>
            <h2 className="text-xl font-bold mt-1">{t.nextPeriod}</h2>
            <div className="mt-3 bg-white/20 rounded-xl p-3">
              <p className="text-xs text-rose-100">{t.expectedIn}</p>
              <p className="text-2xl font-bold">{daysUntil} {t.days}</p>
              {nextPeriod && (
                <p className="text-xs text-rose-100 mt-1">
                  {nextPeriod.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mt-1">{t.trackCycle}</h2>
            <p className="text-rose-100 text-sm mt-2">{t.logFirstPeriod}</p>
          </>
        )}
      </div>

      {/* Log Period Button */}
      <button
        onClick={() => setShowLogModal(true)}
        className="w-full bg-rose-500 text-white py-3 rounded-2xl font-medium mb-4 hover:bg-rose-600 transition-all shadow-sm"
      >
        {t.logPeriod}
      </button>

      {/* ✅ FIX: fertileWindowDates aur lutealDates ab pass ho rahe hain */}
      <PeriodCalendar
        periodDates={getPeriodDates()}
        predictedDates={getPredictedDates()}
        ovulationDate={getOvulationDate()}
        fertileWindowDates={getFertileWindowDates()}
        lutealDates={getLutealDates()}
        isHindi={isHindi}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-bold text-rose-500">{getAvgCycleLength()}</p>
          <p className="text-xs text-gray-400 mt-1">{t.cycleLength}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-bold text-rose-500">5</p>
          <p className="text-xs text-gray-400 mt-1">{t.periodDays}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-rose-50">
          <p className="text-2xl font-bold text-emerald-500">
            {getOvulationDate() ? new Date(getOvulationDate()).getDate() : '-'}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.ovulationDay}</p>
        </div>
      </div>

      {/* Ovulation Window Card */}
      {getOvulationDate() && (
        <div className="bg-emerald-50 rounded-2xl p-4 mt-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌿</span>
            <h3 className="font-semibold text-emerald-700">Ovulation & Fertile Window</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Ovulation Date</p>
              <p className="text-sm font-bold text-emerald-700">
                {new Date(getOvulationDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Fertile Window Starts</p>
              <p className="text-sm font-bold text-emerald-700">
                {(() => {
                  const d = new Date(getOvulationDate())
                  d.setDate(d.getDate() - 5)
                  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
                })()}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Fertile Window Ends</p>
              <p className="text-sm font-bold text-emerald-700">
                {(() => {
                  const d = new Date(getOvulationDate())
                  d.setDate(d.getDate() + 1)
                  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
                })()}
              </p>
            </div>
          </div>
          <div className="mt-3 bg-emerald-100 rounded-xl p-3">
            <p className="text-xs text-emerald-600 text-center">
              🌿 Fertile window is 7 days — 5 days before ovulation to 1 day after
            </p>
          </div>
        </div>
      )}

      {/* Phase Card */}
      <PhaseCard phase={phase} isHindi={isHindi} />

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-1">{t.logPeriodTitle}</h3>
            <p className="text-xs text-gray-400 mb-4">End date can be updated later when your period ends</p>

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium">{t.startDate} *</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
              />
            </div>

            {startDate && (
              <div className="bg-rose-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-rose-500 font-medium">📅 Expected to end between:</p>
                <p className="text-sm font-bold text-rose-700 mt-1">
                  {(() => {
                    const s = new Date(startDate)
                    const min = new Date(s); min.setDate(min.getDate() + 2)
                    const max = new Date(s); max.setDate(max.getDate() + 6)
                    return `${min.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${max.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                  })()}
                </p>
                <p className="text-xs text-rose-400 mt-1">Based on average 3–7 day cycle</p>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs text-gray-500 font-medium">
                {t.endDate} <span className="text-gray-300">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 py-3 rounded-xl border border-rose-100 text-gray-400 text-sm"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleLogPeriod}
                disabled={logLoading}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {logLoading ? '...' : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
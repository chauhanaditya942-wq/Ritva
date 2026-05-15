import { useState } from 'react'
import { motion } from 'framer-motion'
import PeriodCalendar from '../components/Calendar/PeriodCalendar'
import { useCycle } from '../hooks/useCycle'
import PhaseCard from '../components/Predictions/PhaseCard'
import { getCyclePhase } from '../lib/cyclePhase'
import { useNotifications } from '../hooks/useNotifications'

export default function Home({ userId, t }) {
  const {
    loading,
    periodLogs,
    getPeriodDates,
    getPredictedDates,
    getOvulationDate,
    getFertileWindowDates,
    getLutealDates,
    getDaysUntilNextPeriod,
    getAvgCycleLength,
    getAvgPeriodDuration,
    getNextPeriodDate,
    logPeriod,
  } = useCycle(userId)

  const {
    permissionStatus,
    notificationsEnabled,
    inAppNotification,
    enableNotifications,
    dismissInAppNotification,
  } = useNotifications(userId, {
    getNextPeriodDate,
    getOvulationDate,
    getFertileWindowDates,
  })

  const [showLogModal, setShowLogModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [logLoading, setLogLoading] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)

  const handleLogPeriod = async () => {
    if (!startDate) return
    setLogLoading(true)
    const defaultEnd = new Date(startDate + 'T00:00:00')
    defaultEnd.setDate(defaultEnd.getDate() + 4)
    const finalEndDate = endDate || defaultEnd.toISOString().split('T')[0]
    await logPeriod(startDate, finalEndDate)
    setLogLoading(false)
    setShowLogModal(false)
    setStartDate('')
    setEndDate('')
  }

  const handleEnableNotifications = async () => {
    setNotifLoading(true)
    await enableNotifications()
    setNotifLoading(false)
  }

  const nextPeriod = getNextPeriodDate()
  const daysUntil = getDaysUntilNextPeriod()
  const phase = periodLogs.length > 0 ? getCyclePhase(periodLogs[0].start_date, getAvgCycleLength()) : null
  const isHindi = t.hello.includes('नमस्ते')

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-rose-400 text-4xl"
        >
          🌸
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">

      {/* ── In-App Notification Toast ── */}
      {inAppNotification && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white rounded-2xl shadow-lg border border-rose-100 p-4 flex items-start gap-3"
        >
          <span className="text-2xl">🌸</span>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">{inAppNotification.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{inAppNotification.body}</p>
          </div>
          <button onClick={dismissInAppNotification} className="text-gray-300 hover:text-gray-500 text-lg">✕</button>
        </motion.div>
      )}

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 mb-4 text-white shadow-md"
      >
        <p className="text-rose-100 text-sm">{t.hello}</p>

       {/* ── Decorative Illustration (CSS Art Flower) ── */}
<div className="flex justify-center my-3">
  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center relative">
    <span className="text-3xl">🌸</span>
    <motion.span
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute -top-1 -right-1 text-xl"
    >
      ✨
    </motion.span>
  </div>
</div>

        {daysUntil !== null ? (
          <>
            <h2 className="text-xl font-bold mt-1">{t.nextPeriod}</h2>
            <div className="mt-3 bg-white/20 rounded-xl p-3">
              <p className="text-xs text-rose-100">{t.expectedIn}</p>
              <motion.p
                className="text-2xl font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {daysUntil} {t.days}
              </motion.p>
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
      </motion.div>

      {/* ── Notification Enable Banner ── */}
      {permissionStatus !== 'granted' && !notificationsEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-4 flex items-center gap-3"
        >
          <span className="text-2xl">🔔</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">
              {isHindi ? 'Reminders enable karein' : 'Enable Reminders'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isHindi ? 'Period, ovulation aur pad alerts paayein' : 'Get period, ovulation & pad alerts'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnableNotifications}
            disabled={notifLoading}
            className="bg-rose-500 text-white text-xs px-3 py-2 rounded-xl font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {notifLoading ? '...' : (isHindi ? 'Enable' : 'Enable')}
          </motion.button>
        </motion.div>
      )}

      {/* Notifications enabled confirmation */}
      {notificationsEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mb-4 flex items-center gap-2"
        >
          <span>✅</span>
          <p className="text-xs text-emerald-700 font-medium">
            {isHindi ? 'Reminders active hain 🌸' : 'Reminders are active 🌸'}
          </p>
        </motion.div>
      )}

      {/* Notification denied message */}
      {permissionStatus === 'denied' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4 flex items-center gap-2"
        >
          <span>🔕</span>
          <p className="text-xs text-gray-500">
            {isHindi
              ? 'Notifications blocked hain — browser settings se enable karein'
              : 'Notifications blocked — enable from browser settings'}
          </p>
        </motion.div>
      )}

      {/* Log Period Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowLogModal(true)}
        className="w-full bg-rose-500 text-white py-3 rounded-2xl font-medium mb-4 hover:bg-rose-600 transition-all shadow-sm"
      >
        {t.logPeriod}
      </motion.button>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PeriodCalendar
          periodDates={getPeriodDates()}
          predictedDates={getPredictedDates()}
          ovulationDate={getOvulationDate()}
          fertileWindowDates={getFertileWindowDates()}
          lutealDates={getLutealDates()}
          isHindi={isHindi}
        />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 gap-3 mt-4"
      >
        {[
          { value: getAvgCycleLength(), label: t.cycleLength, color: 'text-rose-500' },
          { value: getAvgPeriodDuration(), label: t.periodDays, color: 'text-rose-500' },
          { value: getOvulationDate() ? new Date(getOvulationDate() + 'T00:00:00').getDate() : '-', label: t.ovulationDay, color: 'text-emerald-500' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-3 text-center shadow-sm border border-rose-50"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Ovulation Window Card */}
      {getOvulationDate() && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 rounded-2xl p-4 mt-4 border border-emerald-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌿</span>
            <h3 className="font-semibold text-emerald-700">Ovulation & Fertile Window</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Ovulation Date</p>
              <p className="text-sm font-bold text-emerald-700">
                {new Date(getOvulationDate() + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Fertile Window Starts</p>
              <p className="text-sm font-bold text-emerald-700">
                {(() => {
                  const d = new Date(getOvulationDate() + 'T00:00:00')
                  d.setDate(d.getDate() - 5)
                  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
                })()}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-600">Fertile Window Ends</p>
              <p className="text-sm font-bold text-emerald-700">
                {(() => {
                  const d = new Date(getOvulationDate() + 'T00:00:00')
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
        </motion.div>
      )}

      {/* ── Daily Wellness Quote Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200 flex items-center gap-4"
      >
        {/* Leaf icon instead of emoji */}
        <div className="w-14 h-14 rounded-full bg-white shadow-inner flex items-center justify-center text-3xl">
  🧘‍♀️
</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-800">Daily Wellness</p>
          <p className="text-xs text-purple-600 mt-1">
            "Your body is a garden – nurture it with rest, water, and self-love."
          </p>
        </div>
      </motion.div>

      {/* Phase Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PhaseCard phase={phase} isHindi={isHindi} />
      </motion.div>

      {/* Log Modal */}
      {showLogModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white w-full max-w-md rounded-t-3xl p-6"
          >
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
                    const s = new Date(startDate + 'T00:00:00')
                    const min = new Date(s); min.setDate(min.getDate() + 2)
                    const max = new Date(s); max.setDate(max.getDate() + 6)
                    return `${min.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${max.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                  })()}
                </p>
                <p className="text-xs text-rose-400 mt-1">Based on average 3–7 day period</p>
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogModal(false)}
                className="flex-1 py-3 rounded-xl border border-rose-100 text-gray-400 text-sm"
              >
                {t.cancel}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogPeriod}
                disabled={logLoading}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {logLoading ? '...' : t.save}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}
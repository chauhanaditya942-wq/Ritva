import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// ── Day type classifier ────────────────────────────────────────
function getDayType(dateStr, periodDates, predictedDates, ovulationDate, fertileWindowDates, lutealDates) {
  if (periodDates.includes(dateStr)) return 'period'
  if (ovulationDate === dateStr) return 'ovulation'
  if (fertileWindowDates.includes(dateStr)) return 'fertile'
  if (predictedDates.includes(dateStr)) return 'predicted'
  if (lutealDates.includes(dateStr)) return 'luteal'
  return 'normal'
}

// ── Day type config ────────────────────────────────────────────
const TYPE_CONFIG = {
  period:    { bg: '#f43f5e', text: '#fff',     label: 'Period',          dot: '#f43f5e' },
  ovulation: { bg: '#10b981', text: '#fff',     label: 'Ovulation Day',   dot: '#10b981' },
  fertile:   { bg: '#d1fae5', text: '#065f46',  label: 'Fertile Window',  dot: '#34d399' },
  predicted: { bg: '#ffe4e6', text: '#f43f5e',  label: 'Expected Period', dot: '#fda4af' },
  luteal:    { bg: '#fef3c7', text: '#92400e',  label: 'Luteal Phase',    dot: '#fcd34d' },
  normal:    { bg: 'transparent', text: '#374151', label: '',             dot: '' },
}

// ── Detail popup content ───────────────────────────────────────
const TYPE_DETAIL = {
  period: {
    icon: '🩸',
    title: 'Period Day',
    tips: ['Stay hydrated', 'Light exercise can help cramps', 'Use heat pad for comfort'],
  },
  ovulation: {
    icon: '🥚',
    title: 'Ovulation Day',
    tips: ['Highest fertility today', 'Best chance of conception', 'May feel more energetic'],
  },
  fertile: {
    icon: '🌿',
    title: 'Fertile Window',
    tips: ['Fertility is elevated', 'Sperm can survive up to 5 days', 'Track basal body temperature'],
  },
  predicted: {
    icon: '📅',
    title: 'Expected Period',
    tips: ['Period may arrive around this date', 'Keep pads/tampons ready', '±2 days variation is normal'],
  },
  luteal: {
    icon: '🌙',
    title: 'Luteal Phase',
    tips: ['Progesterone is rising', 'PMS symptoms may appear', 'Rest & self-care recommended'],
  },
  normal: {
    icon: '✨',
    title: 'Follicular Phase',
    tips: ['Estrogen rising', 'Energy levels increasing', 'Good time for new activities'],
  },
}

// ── Legend items ───────────────────────────────────────────────
const LEGEND = [
  { type: 'period',    label: 'Period' },
  { type: 'predicted', label: 'Expected' },
  { type: 'ovulation', label: 'Ovulation' },
  { type: 'fertile',   label: 'Fertile' },
  { type: 'luteal',    label: 'Luteal' },
]

export default function PeriodCalendar({
  periodDates = [],
  predictedDates = [],
  ovulationDate = null,
  fertileWindowDates: fertileWindowDatesProp = null,
  lutealDates: lutealDatesProp = null,
  onDateClick,
  isHindi = false
}) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    setSelectedDay(null)
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDay(null)
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const formatDate = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const getFertileWindowDates = () => {
    if (!ovulationDate) return []
    const dates = []
    const ov = new Date(ovulationDate)
    for (let i = -5; i <= 1; i++) {
      if (i === 0) continue
      const d = new Date(ov)
      d.setDate(d.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const getLutealDates = () => {
    if (!ovulationDate || predictedDates.length === 0) return []
    const dates = []
    const start = new Date(ovulationDate)
    start.setDate(start.getDate() + 2)
    const end = new Date(predictedDates[0])
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const fertileWindowDates = fertileWindowDatesProp ?? getFertileWindowDates()
  const lutealDates = lutealDatesProp ?? getLutealDates()

  const handleDayClick = (day) => {
    const dateStr = formatDate(day)
    setSelectedDay(selectedDay === day ? null : day)
    onDateClick?.(dateStr)
  }

  const todayStr = today.toISOString().split('T')[0]
  const todayType = getDayType(todayStr, periodDates, predictedDates, ovulationDate, fertileWindowDates, lutealDates)
  const todayDetail = TYPE_DETAIL[todayType]

  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const selectedDateStr = selectedDay ? formatDate(selectedDay) : null
  const selectedType = selectedDateStr
    ? getDayType(selectedDateStr, periodDates, predictedDates, ovulationDate, fertileWindowDates, lutealDates)
    : null
  const selectedConfig = selectedType ? TYPE_CONFIG[selectedType] : null
  const selectedDetail = selectedType ? TYPE_DETAIL[selectedType] : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">

      {/* ── Today's Phase Banner ── */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 px-4 pt-4 pb-3">
        <p className="text-rose-100 text-xs font-medium mb-1">
          {isHindi ? 'आज का phase' : "Today's phase"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xl">{todayDetail.icon}</span>
          <div>
            <p className="text-white font-bold text-sm">{todayDetail.title}</p>
            <p className="text-rose-100 text-xs">{todayDetail.tips[0]}</p>
          </div>
        </div>
      </div>

      <div className="p-4">

        {/* ── Month Navigation ── */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 font-bold hover:bg-rose-100 transition-colors"
          >‹</button>
          <h3 className="font-bold text-gray-700 text-base">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 font-bold hover:bg-rose-100 transition-colors"
          >›</button>
        </div>

        {/* ── Day Name Headers ── */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-semibold py-1">{d}</div>
          ))}
        </div>

        {/* ── Calendar Grid ── */}
        <div className="grid grid-cols-7 gap-y-1">
          {blanks.map((_, i) => <div key={`b-${i}`} />)}
          {days.map(day => {
            const dateStr = formatDate(day)
            const type = getDayType(dateStr, periodDates, predictedDates, ovulationDate, fertileWindowDates, lutealDates)
            const cfg = TYPE_CONFIG[type]
            const todayDay = isToday(day)
            const isSelected = selectedDay === day

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                style={{
                  backgroundColor: cfg.bg,
                  color: cfg.text,
                  // ✅ FIX: today pe hamesha red outline, chahe koi bhi phase ho
                  outline: isSelected ? '2px solid #f43f5e' : todayDay ? '2px solid #f43f5e' : 'none',
                  outlineOffset: '2px',
                  border: type === 'predicted' ? '1.5px dashed #fda4af' : 'none',
                }}
                className="aspect-square rounded-full text-xs flex flex-col items-center justify-center font-medium transition-all hover:scale-110 relative mx-auto w-9 h-9"
              >
                <span>{day}</span>
                {type !== 'normal' && (
                  <span
                    style={{ backgroundColor: cfg.dot }}
                    className="absolute bottom-0.5 w-1 h-1 rounded-full opacity-70"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Selected Day Detail Card ── */}
        {selectedDay && selectedDetail && (
          <div
            style={{ borderColor: selectedConfig.dot, borderWidth: '1.5px' }}
            className="mt-4 rounded-2xl p-4 bg-white border transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedDetail.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{selectedDetail.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(selectedDateStr).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
              <span
                style={{ backgroundColor: selectedConfig.bg, color: selectedConfig.dot }}
                className="text-xs font-semibold px-2 py-1 rounded-full"
              >
                {selectedConfig.label}
              </span>
            </div>
            <div className="space-y-1.5 mt-3">
              {selectedDetail.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 text-xs mt-0.5">•</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 pt-3 border-t border-rose-50">
          {LEGEND.map(({ type, label }) => {
            const cfg = TYPE_CONFIG[type]
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  style={{
                    backgroundColor: cfg.bg,
                    border: type === 'predicted' ? '1.5px dashed #fda4af' : `1.5px solid ${cfg.dot}`,
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0
                  }}
                />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #f43f5e', flexShrink: 0 }} />
            <span className="text-xs text-gray-500">Today</span>
          </div>
        </div>

        {/* ── Phase Timeline Bar ── */}
        <div className="mt-4 pt-3 border-t border-rose-50">
          <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">
            {isHindi ? 'इस महीने का cycle' : 'Cycle phases this month'}
          </p>
          <div className="flex rounded-full overflow-hidden h-3 gap-px">
            <div className="bg-rose-400 flex-none" style={{ width: '18%' }} title="Period" />
            <div className="bg-rose-100 flex-none" style={{ width: '22%' }} title="Follicular" />
            <div className="bg-emerald-200 flex-none" style={{ width: '25%' }} title="Fertile" />
            <div className="bg-emerald-500 flex-none" style={{ width: '4%' }} title="Ovulation" />
            <div className="bg-amber-200 flex-1" title="Luteal" />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Period</span>
            <span>Follicular</span>
            <span>Fertile</span>
            <span>Luteal</span>
          </div>
        </div>

      </div>
    </div>
  )
}
import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function PeriodCalendar({ periodDates = [], predictedDates = [], ovulationDate = null, onDateClick }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const formatDate = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  // Fertile window — 5 din pehle se 1 din baad ovulation tak
  const getFertileWindowDates = () => {
    if (!ovulationDate) return []
    const dates = []
    const ov = new Date(ovulationDate)
    for (let i = -5; i <= 1; i++) {
      const d = new Date(ov)
      d.setDate(d.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const fertileWindowDates = getFertileWindowDates()

  const isPeriod = (day) => periodDates.includes(formatDate(day))
  const isPredicted = (day) => predictedDates.includes(formatDate(day))
  const isOvulation = (day) => ovulationDate === formatDate(day)
  const isFertile = (day) => fertileWindowDates.includes(formatDate(day)) && !isOvulation(day)

  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-rose-100">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 font-bold hover:bg-rose-100">‹</button>
        <h3 className="font-bold text-gray-700">{MONTHS[currentMonth]} {currentYear}</h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 font-bold hover:bg-rose-100">›</button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b-${i}`} />)}
        {days.map(day => (
          <button
            key={day}
            onClick={() => onDateClick?.(formatDate(day))}
            className={`
              aspect-square rounded-full text-sm flex items-center justify-center font-medium transition-all
              ${isPeriod(day) ? 'bg-rose-500 text-white' : ''}
              ${isPredicted(day) && !isPeriod(day) ? 'bg-rose-100 text-rose-400 border border-dashed border-rose-300' : ''}
              ${isOvulation(day) ? 'bg-emerald-500 text-white ring-2 ring-emerald-300' : ''}
              ${isFertile(day) && !isPeriod(day) && !isPredicted(day) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : ''}
              ${isToday(day) && !isPeriod(day) && !isOvulation(day) ? 'border-2 border-rose-400 text-rose-500' : ''}
              ${!isPeriod(day) && !isPredicted(day) && !isOvulation(day) && !isFertile(day) ? 'hover:bg-rose-50 text-gray-700' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-4 justify-center flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-rose-500" /> Period
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-rose-100 border border-dashed border-rose-300" /> Predicted
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500" /> Ovulation
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-200" /> Fertile
        </div>
      </div>
    </div>
  )
}
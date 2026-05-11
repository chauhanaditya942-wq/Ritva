import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine
} from 'recharts'

// ── Metric Card ──────────────────────────────────────────────
function MetricCard({ label, value, unit, trend, trendUp }) {
  return (
    <div className="bg-rose-50 rounded-xl p-3 flex flex-col gap-1">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-rose-500">
        {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      {trend && (
        <p className={`text-xs ${trendUp ? 'text-emerald-500' : 'text-rose-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      )}
    </div>
  )
}

// ── Insight Item ─────────────────────────────────────────────
function InsightItem({ icon, text, highlight }) {
  return (
    <div className={`flex gap-3 items-start p-3 rounded-xl text-sm ${highlight ? 'bg-rose-50' : 'bg-gray-50'}`}>
      <span className="text-lg">{icon}</span>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function CycleChart({ periodLogs, healthLogs, isHindi }) {

  // ── Data calculations ──────────────────────────────────────

  const reversed = periodLogs.slice(0, 6).reverse()

  // Cycle length data (gap between consecutive periods)
  const cycleData = reversed.map((log, i, arr) => {
    if (i === 0) return null
    const days = Math.ceil(
      (new Date(log.start_date) - new Date(arr[i - 1].start_date)) / (1000 * 60 * 60 * 24)
    )
    return {
      name: new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      days: Math.abs(days)
    }
  }).filter(Boolean)

  // Average cycle length
  const avgCycle = cycleData.length > 0
    ? Math.round(cycleData.reduce((s, d) => s + d.days, 0) / cycleData.length)
    : 28

  // Period duration data
  const durationData = reversed.map(log => ({
    name: new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    duration: Math.ceil(
      (new Date(log.end_date) - new Date(log.start_date)) / (1000 * 60 * 60 * 24) + 1
    )
  }))

  const avgDuration = durationData.length > 0
    ? Math.round(durationData.reduce((s, d) => s + d.duration, 0) / durationData.length)
    : 5

  // Cycle variability (deviation from avg per cycle)
  const variabilityData = cycleData.map((d, i) => ({
    name: d.name,
    deviation: Math.abs(d.days - avgCycle),
    index: i + 1
  }))

  // Regularity % — cycles within ±3 days of avg
  const regularCount = cycleData.filter(d => Math.abs(d.days - avgCycle) <= 3).length
  const regularityPct = cycleData.length > 0
    ? Math.round((regularCount / cycleData.length) * 100)
    : 0

  // Weight & temperature data
  const weightData = (healthLogs || []).slice(0, 7).reverse().map(log => ({
    name: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: log.weight,
    temp: log.temperature
  })).filter(d => d.weight || d.temp)

  // ── Insights ───────────────────────────────────────────────

  const insights = []

  if (cycleData.length >= 2) {
    const recent = cycleData[cycleData.length - 1].days
    const prev = cycleData[cycleData.length - 2].days
    if (Math.abs(recent - prev) <= 2) {
      insights.push({
        icon: '✅',
        text: isHindi
          ? `आपका cycle regular हो रहा है — पिछले 2 महीने ${prev} और ${recent} दिन थे।`
          : `Your cycle is getting regular — last 2 were ${prev} and ${recent} days.`
      })
    } else {
      insights.push({
        icon: '📌',
        text: isHindi
          ? `Cycle में थोड़ा variation है — ${prev} दिन से ${recent} दिन हुआ।`
          : `Cycle varied slightly — from ${prev} to ${recent} days.`
      })
    }
  }

  if (avgDuration <= 4) {
    insights.push({
      icon: '📉',
      text: isHindi
        ? `Average period duration ${avgDuration} दिन है — थोड़ा कम, doctor से discuss करें।`
        : `Avg period duration is ${avgDuration} days — on the shorter side, worth discussing with a doctor.`
    })
  } else if (avgDuration >= 7) {
    insights.push({
      icon: '⚠️',
      text: isHindi
        ? `Average duration ${avgDuration} दिन है — heavy bleeding के बारे में doctor से बात करें।`
        : `Avg duration is ${avgDuration} days — consider talking to a doctor about heavy bleeding.`
    })
  } else {
    insights.push({
      icon: '💚',
      text: isHindi
        ? `Period duration (${avgDuration} दिन) normal range में है।`
        : `Period duration (${avgDuration} days) is in the normal range.`
    })
  }

  if (regularityPct >= 80) {
    insights.push({
      icon: '🌸',
      text: isHindi
        ? `Regularity ${regularityPct}% — बहुत अच्छा! Cycle predictable है।`
        : `Regularity ${regularityPct}% — great! Your cycle is highly predictable.`,
      highlight: true
    })
  } else {
    insights.push({
      icon: '📊',
      text: isHindi
        ? `Regularity ${regularityPct}% — और data log करने से prediction बेहतर होगी।`
        : `Regularity ${regularityPct}% — log more cycles for better predictions.`,
      highlight: true
    })
  }

  // ── Not enough data ────────────────────────────────────────

  if (periodLogs.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-50 text-center">
        <p className="text-4xl mb-2">📊</p>
        <p className="text-gray-400 text-sm">
          {isHindi ? 'चार्ट के लिए कम से कम 2 periods log करें' : 'Log at least 2 periods to see charts'}
        </p>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────

  const tooltipStyle = { borderRadius: '12px', border: '1px solid #fce7f3', fontSize: '12px' }

  return (
    <div className="space-y-4">

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label={isHindi ? 'औसत cycle' : 'Avg cycle'}
          value={avgCycle}
          unit={isHindi ? 'दिन' : 'days'}
          trend={avgCycle >= 21 && avgCycle <= 35
            ? (isHindi ? 'Normal range' : 'Normal range')
            : (isHindi ? 'Irregular' : 'Check with doctor')}
          trendUp={avgCycle >= 21 && avgCycle <= 35}
        />
        <MetricCard
          label={isHindi ? 'औसत अवधि' : 'Avg period'}
          value={avgDuration}
          unit={isHindi ? 'दिन' : 'days'}
          trend={isHindi ? 'सामान्य range' : 'Normal range'}
          trendUp={avgDuration >= 3 && avgDuration <= 7}
        />
        <MetricCard
          label={isHindi ? 'Regularity' : 'Regularity'}
          value={regularityPct}
          unit="%"
          trend={regularityPct >= 80
            ? (isHindi ? 'बेहतर हो रहा' : 'Improving')
            : (isHindi ? 'और data चाहिए' : 'Need more data')}
          trendUp={regularityPct >= 70}
        />
      </div>

      {/* ── Cycle Length Chart ── */}
      {cycleData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '📈 चक्र लंबाई' : '📈 Cycle Length'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {isHindi ? 'हर cycle कितने दिन की थी' : 'How many days each cycle lasted'}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [`${val} ${isHindi ? 'दिन' : 'days'}`, isHindi ? 'चक्र' : 'Cycle']}
              />
              {/* Average reference line */}
              <ReferenceLine y={avgCycle} stroke="#9FE1CB" strokeDasharray="5 4" strokeWidth={1.5}
                label={{ value: `Avg ${avgCycle}d`, fontSize: 10, fill: '#6b7280', position: 'insideTopRight' }}
              />
              <Line
                type="monotone" dataKey="days" stroke="#f43f5e" strokeWidth={2}
                dot={{ fill: '#f43f5e', r: 4 }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Period Duration Chart ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-1">
          {isHindi ? '📊 मासिक धर्म अवधि' : '📊 Period Duration'}
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          {isHindi ? 'हर महीने bleeding कितने दिन रही' : 'Days of bleeding each month'}
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={durationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val) => [`${val} ${isHindi ? 'दिन' : 'days'}`, isHindi ? 'अवधि' : 'Duration']}
            />
            <Bar dataKey="duration" fill="#fb7185" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Variability Chart ── */}
      {variabilityData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '📉 Cycle Variability' : '📉 Cycle Variability'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {isHindi ? 'Average से कितना अंतर — कम = better' : 'Deviation from avg — lower is better'}
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={variabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [`±${val} ${isHindi ? 'दिन' : 'days'}`, isHindi ? 'अंतर' : 'Deviation']}
              />
              <ReferenceLine y={3} stroke="#fca5a5" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: '±3d', fontSize: 10, fill: '#f87171', position: 'insideTopRight' }}
              />
              <Line
                type="monotone" dataKey="deviation" stroke="#10b981" strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Weight & Temperature ── */}
      {weightData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '⚖️ वजन और तापमान' : '⚖️ Weight & Temperature'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {isHindi ? 'Health trends' : 'Health trends over time'}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="weight" stroke="#f43f5e" strokeWidth={2}
                dot={{ fill: '#f43f5e', r: 4 }} name={isHindi ? 'वजन (kg)' : 'Weight (kg)'} />
              <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }} name={isHindi ? 'तापमान (°C)' : 'Temp (°C)'} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Insights Section ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">
          {isHindi ? '💡 Insights' : '💡 Insights'}
        </h3>
        <div className="space-y-2">
          {insights.map((ins, i) => (
            <InsightItem key={i} icon={ins.icon} text={ins.text} highlight={ins.highlight} />
          ))}
        </div>
      </div>

    </div>
  )
}
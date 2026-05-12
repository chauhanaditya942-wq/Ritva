import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, AreaChart, Area
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

// ── Health Metric Card ────────────────────────────────────────
function HealthCard({ icon, label, value, unit, status, statusColor }) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1 ${statusColor === 'green' ? 'bg-emerald-50' : statusColor === 'red' ? 'bg-rose-50' : 'bg-blue-50'}`}>
      <p className="text-xs text-gray-400">{icon} {label}</p>
      <p className={`text-2xl font-semibold ${statusColor === 'green' ? 'text-emerald-500' : statusColor === 'red' ? 'text-rose-500' : 'text-blue-500'}`}>
        {value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      {status && (
        <p className={`text-xs ${statusColor === 'green' ? 'text-emerald-500' : statusColor === 'red' ? 'text-rose-400' : 'text-blue-400'}`}>
          {status}
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
export default function CycleChart({ periodLogs, healthLogs, symptomLogs = [], isHindi }) {

  const tooltipStyle = { borderRadius: '12px', border: '1px solid #fce7f3', fontSize: '12px' }

  // ── Cycle Data ─────────────────────────────────────────────
  const reversed = periodLogs.slice(0, 6).reverse()

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

  const avgCycle = cycleData.length > 0
    ? Math.round(cycleData.reduce((s, d) => s + d.days, 0) / cycleData.length) : 28

  const durationData = reversed.map(log => ({
    name: new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    duration: Math.ceil((new Date(log.end_date) - new Date(log.start_date)) / (1000 * 60 * 60 * 24) + 1)
  }))

  const avgDuration = durationData.length > 0
    ? Math.round(durationData.reduce((s, d) => s + d.duration, 0) / durationData.length) : 5

  const variabilityData = cycleData.map((d) => ({
    name: d.name,
    deviation: Math.abs(d.days - avgCycle),
  }))

  const regularCount = cycleData.filter(d => Math.abs(d.days - avgCycle) <= 3).length
  const regularityPct = cycleData.length > 0
    ? Math.round((regularCount / cycleData.length) * 100) : 0

  const weightData = (healthLogs || []).slice(0, 7).reverse().map(log => ({
    name: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: log.weight,
    temp: log.temperature
  })).filter(d => d.weight || d.temp)

  // ── Sleep Data from symptom_logs ───────────────────────────
  const sleepData = (symptomLogs || []).slice(0, 7).reverse().map(log => ({
    name: new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    sleep: log.sleep_hours,
    recommended: 8
  })).filter(d => d.sleep)

  const avgSleep = sleepData.length > 0
    ? Math.round((sleepData.reduce((s, d) => s + d.sleep, 0) / sleepData.length) * 10) / 10 : 0

  const sleepStatus = avgSleep >= 7 && avgSleep <= 9
    ? { text: isHindi ? '✅ अच्छी नींद' : '✅ Good sleep', color: 'green' }
    : avgSleep < 7
      ? { text: isHindi ? '⚠️ कम नींद' : '⚠️ Low sleep', color: 'red' }
      : { text: isHindi ? '😴 ज़्यादा नींद' : '😴 Too much sleep', color: 'blue' }

  // ── Hydration Data from symptom_logs ──────────────────────
  const hydrationData = (symptomLogs || []).slice(0, 7).reverse().map(log => ({
    name: new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    water: log.water_intake,
    recommended: 8
  })).filter(d => d.water !== null && d.water !== undefined)

  const avgWater = hydrationData.length > 0
    ? Math.round((hydrationData.reduce((s, d) => s + d.water, 0) / hydrationData.length) * 10) / 10 : 0

  const waterStatus = avgWater >= 8
    ? { text: isHindi ? '✅ अच्छी hydration' : '✅ Well hydrated', color: 'green' }
    : avgWater >= 6
      ? { text: isHindi ? '⚠️ थोड़ा कम' : '⚠️ Slightly low', color: 'blue' }
      : { text: isHindi ? '🚨 कम पानी' : '🚨 Low hydration', color: 'red' }

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
        ? `औसत period ${avgDuration} दिन — थोड़ा कम, doctor से बात करें।`
        : `Avg period ${avgDuration} days — on the shorter side, worth discussing with a doctor.`
    })
  } else if (avgDuration >= 7) {
    insights.push({
      icon: '⚠️',
      text: isHindi
        ? `औसत duration ${avgDuration} दिन — heavy bleeding के बारे में doctor से बात करें।`
        : `Avg duration ${avgDuration} days — consider talking to a doctor about heavy bleeding.`
    })
  } else {
    insights.push({
      icon: '💚',
      text: isHindi
        ? `Period duration (${avgDuration} दिन) normal range में है।`
        : `Period duration (${avgDuration} days) is in the normal range.`
    })
  }

  if (avgSleep > 0 && avgSleep < 7) {
    insights.push({
      icon: '😴',
      text: isHindi
        ? `औसत नींद ${avgSleep} घंटे — वैज्ञानिक रूप से 7–9 घंटे जरूरी हैं। जल्दी सोने की कोशिश करें।`
        : `Avg sleep ${avgSleep}h — scientifically 7–9 hours needed. Try sleeping earlier.`
    })
  }

  if (avgWater > 0 && avgWater < 8) {
    insights.push({
      icon: '💧',
      text: isHindi
        ? `औसत पानी ${avgWater} गिलास — रोज़ 8 गिलास पानी पीना जरूरी है।`
        : `Avg water ${avgWater} glasses — 8 glasses daily is the recommended amount.`,
      highlight: true
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

  return (
    <div className="space-y-4">

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label={isHindi ? 'औसत cycle' : 'Avg cycle'}
          value={avgCycle}
          unit={isHindi ? 'दिन' : 'days'}
          trend={avgCycle >= 21 && avgCycle <= 35 ? (isHindi ? 'सामान्य' : 'Normal') : (isHindi ? 'अनियमित' : 'Irregular')}
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
          label={isHindi ? 'नियमितता' : 'Regularity'}
          value={regularityPct}
          unit="%"
          trend={regularityPct >= 80 ? (isHindi ? 'बेहतर हो रहा' : 'Improving') : (isHindi ? 'और data चाहिए' : 'Need more data')}
          trendUp={regularityPct >= 70}
        />
      </div>

      {/* ── Sleep & Water Summary Cards ── */}
      {(sleepData.length > 0 || hydrationData.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {sleepData.length > 0 && (
            <HealthCard
              icon="😴"
              label={isHindi ? 'औसत नींद' : 'Avg Sleep'}
              value={avgSleep}
              unit={isHindi ? 'घंटे' : 'hrs'}
              status={sleepStatus.text}
              statusColor={sleepStatus.color}
            />
          )}
          {hydrationData.length > 0 && (
            <HealthCard
              icon="💧"
              label={isHindi ? 'औसत पानी' : 'Avg Water'}
              value={avgWater}
              unit={isHindi ? 'गिलास' : 'glasses'}
              status={waterStatus.text}
              statusColor={waterStatus.color}
            />
          )}
        </div>
      )}

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
              <ReferenceLine y={avgCycle} stroke="#9FE1CB" strokeDasharray="5 4" strokeWidth={1.5}
                label={{ value: `Avg ${avgCycle}d`, fontSize: 10, fill: '#6b7280', position: 'insideTopRight' }}
              />
              <Line type="monotone" dataKey="days" stroke="#f43f5e" strokeWidth={2}
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

      {/* ── Sleep Chart ── */}
      {sleepData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '😴 नींद tracker' : '😴 Sleep Tracker'}
          </h3>
          <p className="text-xs text-gray-400 mb-1">
            {isHindi ? 'रोज़ कितने घंटे सोईं — 7–9 घंटे scientifically जरूरी' : 'Daily sleep hours — 7–9 hrs scientifically recommended'}
          </p>
          {avgSleep < 7 && (
            <div className="bg-rose-50 rounded-xl px-3 py-2 mb-3 text-xs text-rose-600">
              {isHindi
                ? `⚠️ आपकी औसत नींद ${avgSleep} घंटे है — कम नींद से hormones, mood और cycle प्रभावित होते हैं।`
                : `⚠️ Your avg sleep is ${avgSleep}h — low sleep affects hormones, mood & cycle.`}
            </div>
          )}
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sleepData}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ ...tooltipStyle, border: '1px solid #e0e7ff' }}
                formatter={(val, name) => [
                  `${val} ${isHindi ? 'घंटे' : 'hrs'}`,
                  name === 'sleep' ? (isHindi ? 'नींद' : 'Sleep') : (isHindi ? 'लक्ष्य' : 'Target')
                ]}
              />
              <ReferenceLine y={7} stroke="#6ee7b7" strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: isHindi ? 'न्यूनतम 7h' : 'Min 7h', fontSize: 10, fill: '#10b981', position: 'insideTopRight' }}
              />
              <Area type="monotone" dataKey="sleep" stroke="#818cf8" strokeWidth={2}
                fill="url(#sleepGrad)" dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Hydration Chart ── */}
      {hydrationData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-cyan-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '💧 पानी tracker' : '💧 Hydration Tracker'}
          </h3>
          <p className="text-xs text-gray-400 mb-1">
            {isHindi ? 'रोज़ कितने गिलास पानी पिया — 8 गिलास recommended' : 'Daily water intake — 8 glasses recommended'}
          </p>
          {avgWater < 8 && (
            <div className="bg-cyan-50 rounded-xl px-3 py-2 mb-3 text-xs text-cyan-700">
              {isHindi
                ? `💧 औसत ${avgWater} गिलास — कम पानी से cramps, headache और थकान बढ़ सकती है।`
                : `💧 Avg ${avgWater} glasses — low hydration can worsen cramps, headaches & fatigue.`}
            </div>
          )}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hydrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cffafe" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ ...tooltipStyle, border: '1px solid #cffafe' }}
                formatter={(val, name) => [
                  `${val} ${isHindi ? 'गिलास' : 'glasses'}`,
                  name === 'water' ? (isHindi ? 'पानी' : 'Water') : (isHindi ? 'लक्ष्य' : 'Target')
                ]}
              />
              <ReferenceLine y={8} stroke="#06b6d4" strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: isHindi ? 'लक्ष्य 8' : 'Goal 8', fontSize: 10, fill: '#0891b2', position: 'insideTopRight' }}
              />
              <Bar dataKey="water" radius={[6, 6, 0, 0]}
                fill="#22d3ee"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Variability Chart ── */}
      {variabilityData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-1">
            {isHindi ? '📉 Cycle Variability' : '📉 Cycle Variability'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {isHindi ? 'Average से कितना अंतर — कम = बेहतर' : 'Deviation from avg — lower is better'}
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
              <Line type="monotone" dataKey="deviation" stroke="#10b981" strokeWidth={2}
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
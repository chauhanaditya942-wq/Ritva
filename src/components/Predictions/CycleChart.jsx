import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'

export default function CycleChart({ periodLogs, healthLogs, isHindi }) {
  // Cycle length data
  const cycleData = periodLogs.slice(0, 6).reverse().map((log, i, arr) => {
    if (i === 0) return null
    const prev = arr[i - 1]
    const days = Math.ceil((new Date(log.start_date) - new Date(prev.start_date)) / (1000 * 60 * 60 * 24))
    return {
      name: new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      days: Math.abs(days)
    }
  }).filter(Boolean)

  // Period duration data
  const durationData = periodLogs.slice(0, 6).reverse().map(log => ({
    name: new Date(log.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    duration: Math.ceil((new Date(log.end_date) - new Date(log.start_date)) / (1000 * 60 * 60 * 24) + 1)
  }))

  // Weight data
  const weightData = (healthLogs || []).slice(0, 7).reverse().map(log => ({
    name: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: log.weight,
    temp: log.temperature
  })).filter(d => d.weight || d.temp)

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

      {/* Cycle Length Chart */}
      {cycleData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-4">
            {isHindi ? '📈 चक्र लंबाई' : '📈 Cycle Length'}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #fce7f3' }}
                formatter={(val) => [`${val} ${isHindi ? 'दिन' : 'days'}`, isHindi ? 'चक्र' : 'Cycle']}
              />
              <Line
                type="monotone"
                dataKey="days"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: '#f43f5e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period Duration Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-4">
          {isHindi ? '📊 मासिक धर्म अवधि' : '📊 Period Duration'}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={durationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #fce7f3' }}
              formatter={(val) => [`${val} ${isHindi ? 'दिन' : 'days'}`, isHindi ? 'अवधि' : 'Duration']}
            />
            <Bar dataKey="duration" fill="#fb7185" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weight & Temperature Chart */}
      {weightData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-4">
            {isHindi ? '⚖️ वजन और तापमान' : '⚖️ Weight & Temperature'}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #fce7f3' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ fill: '#f43f5e', r: 4 }}
                name={isHindi ? 'वजन (kg)' : 'Weight (kg)'}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name={isHindi ? 'तापमान (°C)' : 'Temp (°C)'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
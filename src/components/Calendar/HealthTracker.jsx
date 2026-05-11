import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function HealthTracker({ userId, isHindi }) {
  const [logs, setLogs] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [temperature, setTemperature] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    if (data) setLogs(data)
  }

  const handleSave = async () => {
    if (!weight && !temperature) return
    setLoading(true)
    const { error } = await supabase
      .from('health_logs')
      .upsert({
        user_id: userId,
        date,
        weight: weight || null,
        temperature: temperature || null,
        notes
      }, { onConflict: 'user_id,date' })

    setLoading(false)
    if (!error) {
      setSuccess(true)
      fetchLogs()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-4">

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-4">
          {isHindi ? '📊 स्वास्थ्य ट्रैकर' : '📊 Health Tracker'}
        </h3>

        <div className="mb-3">
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'तारीख' : 'Date'}
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'वजन (kg) ⚖️' : 'Weight (kg) ⚖️'}
            </label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="55.5"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'तापमान (°C) 🌡️' : 'Temp (°C) 🌡️'}
            </label>
            <input
              type="number"
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
              placeholder="36.6"
              step="0.1"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
            />
          </div>
        </div>

        {/* BBT Info */}
        <div className="bg-blue-50 rounded-xl p-3 mb-3">
          <p className="text-xs text-blue-600">
            💡 {isHindi
              ? 'BBT (बेसल बॉडी टेम्परेचर) सुबह उठते ही नापें — अंडोत्सर्ग के समय तापमान 0.2°C बढ़ता है'
              : 'Measure BBT (Basal Body Temperature) first thing in morning — temp rises ~0.2°C at ovulation'}
          </p>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-600 text-center py-2 rounded-xl mb-3 text-sm">
            ✅ {isHindi ? 'सेव हो गया!' : 'Saved!'}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50"
        >
          {loading ? '...' : (isHindi ? 'सेव करें' : 'Save')}
        </button>
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-3">
            {isHindi ? 'हाल के रिकॉर्ड' : 'Recent Records'}
          </h3>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                <p className="text-xs text-gray-400">
                  {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="flex gap-3">
                  {log.weight && (
                    <span className="text-xs bg-rose-50 text-rose-500 px-2 py-1 rounded-full">
                      ⚖️ {log.weight} kg
                    </span>
                  )}
                  {log.temperature && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-full">
                      🌡️ {log.temperature}°C
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
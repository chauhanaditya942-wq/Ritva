import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const DISCHARGE_TYPES = ['None', 'Normal', 'Spotting', 'Heavy', 'Unusual']
const DISCHARGE_TYPES_HI = ['कोई नहीं', 'सामान्य', 'हल्का', 'भारी', 'असामान्य']
const COLORS = ['Clear', 'White', 'Yellow', 'Green', 'Brown', 'Pink', 'Red']
const COLORS_HI = ['साफ', 'सफेद', 'पीला', 'हरा', 'भूरा', 'गुलाबी', 'लाल']
const CONSISTENCY = ['Watery', 'Creamy', 'Sticky', 'Egg white', 'Thick']
const CONSISTENCY_HI = ['पतला', 'क्रीमी', 'चिपचिपा', 'अंडे जैसा', 'गाढ़ा']
const ODORS = ['None', 'Mild', 'Strong', 'Fishy']
const ODORS_HI = ['कोई नहीं', 'हल्की', 'तेज', 'मछली जैसी']
const WARNING_COLORS = ['Yellow', 'Green']
const WARNING_TYPES = ['Unusual', 'Heavy']

export default function VaginalHealthTracker({ userId, isHindi }) {
  const [dischargeType, setDischargeType] = useState('')
  const [dischargeColor, setDischargeColor] = useState('')
  const [dischargeConsistency, setDischargeConsistency] = useState('')
  const [odor, setOdor] = useState('')
  const [itching, setItching] = useState(false)
  const [notes, setNotes] = useState('')
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('vaginal_health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    if (data) setRecentLogs(data)
  }

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('vaginal_health_logs')
      .upsert({
        user_id: userId,
        date: today,
        discharge_type: dischargeType,
        discharge_color: dischargeColor,
        discharge_consistency: dischargeConsistency,
        odor: odor,
        itching: itching,
        notes: notes
      }, { onConflict: 'user_id,date' })

    setLoading(false)
    if (!error) {
      setSuccess(true)
      fetchLogs()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      console.error('Save error:', error)
    }
  }

  const showWarning = WARNING_COLORS.includes(dischargeColor) || WARNING_TYPES.includes(dischargeType)

  const dischargeTypes = isHindi ? DISCHARGE_TYPES_HI : DISCHARGE_TYPES
  const colors = isHindi ? COLORS_HI : COLORS
  const consistency = isHindi ? CONSISTENCY_HI : CONSISTENCY
  const odors = isHindi ? ODORS_HI : ODORS

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl p-4 text-white">
        <h3 className="font-bold text-lg">🌸 {isHindi ? 'योनि स्वास्थ्य ट्रैकर' : 'Vaginal Health Tracker'}</h3>
        <p className="text-pink-100 text-sm mt-1">
          {isHindi ? 'अपने स्वास्थ्य को track करें — यह जरूरी है' : 'Track your health — this matters'}
        </p>
      </div>

      {/* Warning */}
      {showWarning && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-600 text-sm font-medium">⚠️ {isHindi ? 'डॉक्टर से मिलें' : 'Consult a doctor'}</p>
          <p className="text-red-500 text-xs mt-1">
            {isHindi ? 'असामान्य discharge infection का संकेत हो सकता है' : 'Unusual discharge may indicate an infection'}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 space-y-4">

        {/* Discharge Type */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'स्राव का प्रकार' : 'Discharge Type'}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {dischargeTypes.map((type, i) => (
              <button
                key={type}
                onClick={() => setDischargeType(DISCHARGE_TYPES[i])}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  dischargeType === DISCHARGE_TYPES[i]
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'रंग' : 'Color'}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((color, i) => (
              <button
                key={color}
                onClick={() => setDischargeColor(COLORS[i])}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  dischargeColor === COLORS[i]
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-gray-600'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Consistency */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'गाढ़ापन' : 'Consistency'}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {consistency.map((c, i) => (
              <button
                key={c}
                onClick={() => setDischargeConsistency(CONSISTENCY[i])}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  dischargeConsistency === CONSISTENCY[i]
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Odor */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'गंध' : 'Odor'}
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {odors.map((o, i) => (
              <button
                key={o}
                onClick={() => setOdor(ODORS[i])}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  odor === ODORS[i]
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-gray-600'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Itching */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            {isHindi ? 'खुजली' : 'Itching'}
          </label>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setItching(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                !itching ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isHindi ? 'नहीं' : 'No'}
            </button>
            <button
              onClick={() => setItching(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                itching ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isHindi ? 'हाँ' : 'Yes'}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-500 font-medium">{isHindi ? 'नोट्स' : 'Notes'}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isHindi ? 'कुछ और लिखें...' : 'Any additional notes...'}
            rows={2}
            className="w-full mt-1 px-4 py-2 rounded-xl border border-rose-100 focus:outline-none text-sm resize-none"
          />
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-600 text-center py-2 rounded-xl text-sm">
            ✅ {isHindi ? 'सेव हो गया!' : 'Saved!'}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? '...' : (isHindi ? 'सेव करें' : 'Save')}
        </button>
      </div>

      {/* Education Card */}
      <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
        <h4 className="font-medium text-pink-700 mb-2">
          🔬 {isHindi ? 'जानकारी' : 'Did you know?'}
        </h4>
        <div className="space-y-1.5">
          {(isHindi ? [
            '✅ साफ/सफेद discharge सामान्य है',
            '⚠️ पीला/हरा discharge infection का संकेत हो सकता है',
            '🌸 Ovulation के समय egg white जैसा discharge होता है',
            '🚨 तेज गंध या खुजली हो तो doctor से मिलें'
          ] : [
            '✅ Clear/white discharge is normal',
            '⚠️ Yellow/green may indicate infection',
            '🌸 Egg-white discharge indicates ovulation',
            '🚨 Strong odor or itching — see a doctor'
          ]).map((tip, i) => (
            <p key={i} className="text-xs text-pink-600">{tip}</p>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h4 className="font-medium text-gray-700 mb-3">
            {isHindi ? 'हाल के records' : 'Recent Records'}
          </h4>
          <div className="space-y-2">
            {recentLogs.map(record => (
              <div key={record.id} className="flex justify-between items-center py-2 border-b border-rose-50 last:border-0">
                <p className="text-xs text-gray-400">
                  {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {record.discharge_type && (
                    <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">
                      {record.discharge_type}
                    </span>
                  )}
                  {record.discharge_color && (
                    <span className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
                      {record.discharge_color}
                    </span>
                  )}
                  {record.itching && (
                    <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                      {isHindi ? 'खुजली' : 'Itching'}
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
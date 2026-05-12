import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const COMMON_MEDS = ['Iron', 'Folic Acid', 'Vitamin D', 'Calcium', 'Vitamin B12', 'Contraceptive Pill', 'Painkiller']
const COMMON_MEDS_HI = ['आयरन', 'फोलिक एसिड', 'विटामिन D', 'कैल्शियम', 'विटामिन B12', 'गर्भनिरोधक गोली', 'दर्द निवारक']
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night']
const TIMES_HI = ['सुबह', 'दोपहर', 'शाम', 'रात']

export default function MedicationTracker({ userId, isHindi }) {
  const [medications, setMedications] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time_of_day: 'Morning' })
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchMedications()
    fetchTodayLogs()
  }, [])

  const fetchMedications = async () => {
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true })
    if (data) setMedications(data)
  }

  const fetchTodayLogs = async () => {
    const { data } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
    if (data) setTodayLogs(data)
  }

  const handleAddMed = async () => {
    if (!newMed.name.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('medications')
      .insert({
        user_id: userId,
        name: newMed.name,
        dosage: newMed.dosage,
        time_of_day: newMed.time_of_day
      })
    setLoading(false)
    if (!error) {
      setNewMed({ name: '', dosage: '', time_of_day: 'Morning' })
      setShowAdd(false)
      fetchMedications()
    }
  }

  const toggleTaken = async (med) => {
    const existing = todayLogs.find(l => l.medication_id === med.id)
    if (existing) {
      await supabase
        .from('medication_logs')
        .update({ taken: !existing.taken })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('medication_logs')
        .insert({
          user_id: userId,
          medication_id: med.id,
          date: today,
          taken: true
        })
    }
    fetchTodayLogs()
  }

  const deleteMed = async (id) => {
    await supabase.from('medications').update({ active: false }).eq('id', id)
    fetchMedications()
  }

  const isTaken = (medId) => todayLogs.find(l => l.medication_id === medId)?.taken || false
  const takenCount = medications.filter(m => isTaken(m.id)).length
  const commonMeds = isHindi ? COMMON_MEDS_HI : COMMON_MEDS
  const times = isHindi ? TIMES_HI : TIMES

  return (
    <div className="space-y-4">

      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">💊 {isHindi ? 'दवाई ट्रैकर' : 'Medication Tracker'}</h3>
            <p className="text-violet-100 text-sm mt-1">
              {isHindi
                ? `आज ${takenCount}/${medications.length} दवाइयां ली`
                : `${takenCount}/${medications.length} taken today`}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-white/20 px-3 py-1.5 rounded-full text-xs hover:bg-white/30"
          >
            {showAdd ? '✕' : '+ Add'}
          </button>
        </div>

        {/* Progress */}
        {medications.length > 0 && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(takenCount / medications.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-100">
          <h4 className="font-medium text-gray-700 mb-3">
            {isHindi ? 'नई दवाई जोड़ें' : 'Add New Medication'}
          </h4>

          {/* Quick Select */}
          <p className="text-xs text-gray-400 mb-2">
            {isHindi ? 'जल्दी चुनें:' : 'Quick select:'}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonMeds.map(med => (
              <button
                key={med}
                onClick={() => setNewMed({ ...newMed, name: med })}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  newMed.name === med
                    ? 'bg-violet-500 text-white'
                    : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                }`}
              >
                {med}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'नाम' : 'Name'}
              </label>
              <input
                type="text"
                value={newMed.name}
                onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                placeholder={isHindi ? 'दवाई का नाम' : 'Medication name'}
                className="w-full mt-1 px-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:border-violet-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'खुराक' : 'Dosage'}
              </label>
              <input
                type="text"
                value={newMed.dosage}
                onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                placeholder="e.g. 500mg"
                className="w-full mt-1 px-4 py-2 rounded-xl border border-violet-100 focus:outline-none focus:border-violet-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'समय' : 'Time of day'}
              </label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {times.map((time, i) => (
                  <button
                    key={time}
                    onClick={() => setNewMed({ ...newMed, time_of_day: TIMES[i] })}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      newMed.time_of_day === TIMES[i]
                        ? 'bg-violet-500 text-white'
                        : 'bg-violet-50 text-violet-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddMed}
            disabled={loading || !newMed.name.trim()}
            className="w-full mt-4 py-3 bg-violet-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : (isHindi ? 'जोड़ें' : 'Add Medication')}
          </button>
        </div>
      )}

      {/* Today's Medications */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-violet-50">
          <p className="text-3xl mb-2">💊</p>
          <p className="text-gray-400 text-sm">
            {isHindi ? 'कोई दवाई नहीं — ऊपर Add करें' : 'No medications — add one above'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-50">
          <h4 className="font-medium text-gray-700 mb-3">
            {isHindi ? 'आज की दवाइयां' : "Today's Medications"}
          </h4>
          <div className="space-y-2">
            {medications.map(med => (
              <div
                key={med.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isTaken(med.id) ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaken(med)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isTaken(med.id)
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isTaken(med.id) && '✓'}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${isTaken(med.id) ? 'text-emerald-600 line-through' : 'text-gray-700'}`}>
                      {med.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {med.dosage} • {isHindi
                        ? TIMES_HI[TIMES.indexOf(med.time_of_day)]
                        : med.time_of_day}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMed(med.id)}
                  className="text-gray-300 hover:text-rose-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SymptomTips from '../components/Symptoms/SymptomTips'

const MOODS = ['😊 Happy', '😢 Sad', '😠 Angry', '😴 Tired', '😰 Anxious', '🥰 Loving', '😐 Neutral']
const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Back Pain', 'Nausea', 'Fatigue', 'Spotting', 'Breast Tenderness', 'Mood Swings', 'Acne']
const MOODS_HI = ['😊 खुश', '😢 उदास', '😠 गुस्सा', '😴 थकी हुई', '😰 चिंतित', '🥰 प्यारभरी', '😐 सामान्य']
const SYMPTOMS_HI = ['ऐंठन', 'सिरदर्द', 'पेट फूलना', 'पीठ दर्द', 'मतली', 'थकान', 'हल्का रक्तस्राव', 'स्तन कोमलता', 'मूड बदलना', 'मुंहासे']
const FLOW_LEVELS = ['💧 Light', '💧💧 Medium', '💧💧💧 Heavy', '🩸 Very Heavy']
const FLOW_LEVELS_HI = ['💧 हल्का', '💧💧 मध्यम', '💧💧💧 भारी', '🩸 बहुत भारी']
const EXERCISE_TYPES = ['🚶 Walk', '🏃 Run', '🧘 Yoga', '🏋️ Gym', '🚴 Cycling', '💃 Dance', '🏊 Swimming']
const EXERCISE_TYPES_HI = ['🚶 चलना', '🏃 दौड़ना', '🧘 योग', '🏋️ जिम', '🚴 साइकिल', '💃 नृत्य', '🏊 तैराकी']

export default function Log({ userId, t }) {
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [flowLevel, setFlowLevel] = useState('')
  const [sleepHours, setSleepHours] = useState(7)
  const [waterIntake, setWaterIntake] = useState(8)
  const [exerciseDone, setExerciseDone] = useState(false)
  const [exerciseType, setExerciseType] = useState('')
  const [painLevel, setPainLevel] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const isHindi = t.howFeeling.includes('कैसा')
  const moods = isHindi ? MOODS_HI : MOODS
  const symptoms = isHindi ? SYMPTOMS_HI : SYMPTOMS
  const flowLevels = isHindi ? FLOW_LEVELS_HI : FLOW_LEVELS
  const exerciseTypes = isHindi ? EXERCISE_TYPES_HI : EXERCISE_TYPES

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  const handleSave = async () => {
    if (!selectedMood) return alert(isHindi ? 'कृपया मनोदशा चुनें!' : 'Please select a mood!')
    setLoading(true)

    const { error } = await supabase.from('symptom_logs').upsert({
      user_id: userId,
      date,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      notes,
      flow_level: flowLevel,
      sleep_hours: sleepHours,
      water_intake: waterIntake,
      exercise_done: exerciseDone,
      exercise_type: exerciseDone ? exerciseType : null,
      pain_level: painLevel
    }, { onConflict: 'user_id,date' })

    setLoading(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">

      {/* Date */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <label className="text-xs text-gray-500 font-medium">{t.date}</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full mt-1 px-4 py-2 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
        />
      </div>

      {/* Mood */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.howFeeling}</h3>
        <div className="grid grid-cols-4 gap-2">
          {moods.map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`py-2 px-1 rounded-xl text-xs text-center transition-all ${
                selectedMood === mood ? 'bg-rose-500 text-white shadow' : 'bg-rose-50 text-gray-600 hover:bg-rose-100'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Flow Level */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">
          {isHindi ? 'प्रवाह स्तर 🩸' : 'Flow Level 🩸'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {flowLevels.map(level => (
            <button
              key={level}
              onClick={() => setFlowLevel(level)}
              className={`py-2 px-3 rounded-xl text-xs text-center transition-all ${
                flowLevel === level ? 'bg-rose-500 text-white shadow' : 'bg-rose-50 text-gray-600 hover:bg-rose-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Pain Level */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-1">
          {isHindi ? `दर्द स्तर 😣 : ${painLevel}/10` : `Pain Level 😣 : ${painLevel}/10`}
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {painLevel === 0 ? '😊 No pain' : painLevel <= 3 ? '🙂 Mild' : painLevel <= 6 ? '😣 Moderate' : '😫 Severe'}
        </p>
        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={e => setPainLevel(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>

      {/* Sleep */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-1">
          {isHindi ? `नींद 😴 : ${sleepHours} घंटे` : `Sleep 😴 : ${sleepHours} hours`}
        </h3>
        <input
          type="range"
          min="2"
          max="12"
          step="0.5"
          value={sleepHours}
          onChange={e => setSleepHours(Number(e.target.value))}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>2h</span><span>7h</span><span>12h</span>
        </div>
      </div>

      {/* Water Intake */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">
          {isHindi ? `पानी 💧 : ${waterIntake} गिलास` : `Water Intake 💧 : ${waterIntake} glasses`}
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWaterIntake(w => Math.max(0, w - 1))}
            className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 text-xl font-bold hover:bg-rose-100"
          >−</button>
          <div className="flex-1 flex gap-1 flex-wrap justify-center">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  i < waterIntake ? 'bg-blue-400 text-white' : 'bg-gray-100'
                }`}
              >
                💧
              </div>
            ))}
          </div>
          <button
            onClick={() => setWaterIntake(w => Math.min(12, w + 1))}
            className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 text-xl font-bold hover:bg-rose-100"
          >+</button>
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">
            {isHindi ? 'व्यायाम 🏃' : 'Exercise 🏃'}
          </h3>
          <button
            onClick={() => { setExerciseDone(!exerciseDone); setExerciseType('') }}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              exerciseDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {exerciseDone ? (isHindi ? 'हाँ ✓' : 'Yes ✓') : (isHindi ? 'नहीं' : 'No')}
          </button>
        </div>
        {exerciseDone && (
          <div className="flex flex-wrap gap-2">
            {exerciseTypes.map(type => (
              <button
                key={type}
                onClick={() => setExerciseType(type)}
                className={`py-1.5 px-3 rounded-full text-xs transition-all ${
                  exerciseType === type ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Symptoms */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.symptoms}</h3>
        <div className="flex flex-wrap gap-2">
          {symptoms.map(symptom => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              className={`py-1.5 px-3 rounded-full text-xs transition-all ${
                selectedSymptoms.includes(symptom) ? 'bg-rose-500 text-white' : 'bg-rose-50 text-gray-600 hover:bg-rose-100'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Tips */}
      <SymptomTips symptoms={selectedSymptoms} isHindi={isHindi} />

      {/* Notes */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">{t.notes}</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm resize-none"
        />
      </div>

      {success && (
        <div className="bg-emerald-50 text-emerald-600 text-center py-2 rounded-xl text-sm">
          {t.savedSuccess}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-rose-500 text-white py-3 rounded-2xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50 mb-4"
      >
        {loading ? '...' : t.saveLog}
      </button>

    </div>
  )
}
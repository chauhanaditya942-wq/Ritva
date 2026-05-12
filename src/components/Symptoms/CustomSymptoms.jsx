import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMOJIS = ['🔹', '💊', '🤒', '😵', '🥵', '🥶', '😶', '🤢', '😤', '💔', '🦷', '👁️', '🦵', '💪', '🫀', '🧠', '😪', '🤧']

export default function CustomSymptoms({ userId, isHindi, onSymptomsChange }) {
  const [symptoms, setSymptoms] = useState([])
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🔹')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSymptoms()
  }, [])

  const fetchSymptoms = async () => {
    const { data } = await supabase
      .from('custom_symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data) {
      setSymptoms(data)
      onSymptomsChange?.(data.map(s => `${s.emoji} ${s.name}`))
    }
  }

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('custom_symptoms')
      .insert({
        user_id: userId,
        name: newName.trim(),
        emoji: newEmoji
      })
    setLoading(false)
    if (!error) {
      setNewName('')
      setNewEmoji('🔹')
      setShowAdd(false)
      fetchSymptoms()
    }
  }

  const handleDelete = async (id) => {
    await supabase
      .from('custom_symptoms')
      .delete()
      .eq('id', id)
    fetchSymptoms()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">
          {isHindi ? '✨ मेरे लक्षण' : '✨ My Custom Symptoms'}
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs bg-rose-500 text-white px-3 py-1.5 rounded-full hover:bg-rose-600 transition-all"
        >
          {showAdd ? '✕' : '+ Add'}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-rose-50 rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'लक्षण का नाम' : 'Symptom name'}
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={isHindi ? 'जैसे: पीठ दर्द' : 'e.g. Lower back pain'}
              className="w-full mt-1 px-4 py-2 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'Emoji चुनें' : 'Choose emoji'}
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                    newEmoji === emoji ? 'bg-rose-500 scale-110' : 'bg-white hover:bg-rose-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="w-full py-2 bg-rose-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? '...' : (isHindi ? 'जोड़ें' : 'Add Symptom')}
          </button>
        </div>
      )}

      {/* Symptoms List */}
      {symptoms.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          {isHindi ? 'अभी कोई custom symptom नहीं — ऊपर Add करें!' : 'No custom symptoms yet — add one above!'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {symptoms.map(symptom => (
            <div
              key={symptom.id}
              className="flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full"
            >
              <span className="text-sm">{symptom.emoji}</span>
              <span className="text-xs text-gray-600">{symptom.name}</span>
              <button
                onClick={() => handleDelete(symptom.id)}
                className="text-rose-300 hover:text-rose-500 ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
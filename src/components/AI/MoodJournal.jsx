import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function MoodJournal({ userId, isHindi }) {
  const [entry, setEntry] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [pastEntries, setPastEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { fetchEntries() }, [])

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('mood_journal')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)
    if (data) setPastEntries(data)
  }

  const analyzeWithAI = async (text) => {
    const prompt = `You are RITVA, a women's health AI. Analyze this journal entry and respond ONLY in JSON format like this:
{
  "sentiment": "positive/negative/neutral/mixed",
  "emotions": ["emotion1", "emotion2"],
  "analysis": "2-3 sentence empathetic analysis",
  "tip": "one practical tip"
}
${isHindi ? 'Respond in Hindi.' : 'Respond in English.'}
Journal entry: "${text}"`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    )
    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }

  const handleSave = async () => {
    if (!entry.trim()) return
    setLoading(true)

    let aiResult = null
    try {
      aiResult = await analyzeWithAI(entry)
      setAnalysis(aiResult)
    } catch (e) {
      console.error('AI error', e)
    }

    await supabase.from('mood_journal').upsert({
      user_id: userId,
      date: today,
      entry,
      ai_analysis: aiResult?.analysis || null,
      emotions: aiResult?.emotions || [],
      sentiment: aiResult?.sentiment || null
    }, { onConflict: 'user_id,date' })

    setLoading(false)
    fetchEntries()
  }

  const sentimentColor = (s) => {
    if (s === 'positive') return 'text-emerald-500'
    if (s === 'negative') return 'text-rose-500'
    if (s === 'mixed') return 'text-yellow-500'
    return 'text-gray-400'
  }

  const sentimentEmoji = (s) => {
    if (s === 'positive') return '😊'
    if (s === 'negative') return '😢'
    if (s === 'mixed') return '😐'
    return '💭'
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-3">
          📔 {isHindi ? 'मूड जर्नल' : 'Mood Journal'}
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          {isHindi ? 'आज कैसा महसूस हो रहा है? लिखो — AI analyze करेगा' : 'How are you feeling today? Write — AI will analyze'}
        </p>
        <textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          placeholder={isHindi ? 'आज मुझे... महसूस हो रहा है' : 'Today I feel...'}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm resize-none"
        />
        <button
          onClick={handleSave}
          disabled={loading || !entry.trim()}
          className="w-full mt-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? (isHindi ? 'AI analyze कर रहा है... 🤖' : 'AI analyzing... 🤖') : (isHindi ? 'सेव करें + AI Analysis' : 'Save + AI Analysis')}
        </button>
      </div>

      {/* AI Analysis Result */}
      {analysis && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <h3 className="font-semibold text-purple-700 mb-3">🤖 AI Analysis</h3>
          <div className="flex gap-2 flex-wrap mb-3">
            {analysis.emotions?.map((e, i) => (
              <span key={i} className="text-xs bg-white px-3 py-1 rounded-full text-purple-600 border border-purple-100">
                {e}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mb-3">{analysis.analysis}</p>
          {analysis.tip && (
            <div className="bg-white rounded-xl p-3">
              <p className="text-xs text-purple-600">💡 {analysis.tip}</p>
            </div>
          )}
          <p className={`text-xs mt-2 font-medium ${sentimentColor(analysis.sentiment)}`}>
            {sentimentEmoji(analysis.sentiment)} {analysis.sentiment}
          </p>
        </div>
      )}

      {/* Past Entries */}
      {pastEntries.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <h3 className="font-semibold text-gray-700 mb-3">
            {isHindi ? '📅 पिछले entries' : '📅 Past Entries'}
          </h3>
          <div className="space-y-3">
            {pastEntries.map(log => (
              <div key={log.id} className="border-b border-rose-50 pb-3 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  {log.sentiment && (
                    <span className={`text-xs ${sentimentColor(log.sentiment)}`}>
                      {sentimentEmoji(log.sentiment)} {log.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{log.entry}</p>
                {log.ai_analysis && (
                  <p className="text-xs text-purple-500 mt-1 line-clamp-1">🤖 {log.ai_analysis}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
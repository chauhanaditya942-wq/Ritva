import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ChatAssistant({ userId, periodLogs, recentSymptoms, isHindi }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: isHindi
        ? 'नमस्ते! मैं RITVA AI हूँ 🌸 आपके स्वास्थ्य से जुड़े किसी भी सवाल पूछें!'
        : "Hi! I'm RITVA AI 🌸 Ask me anything about your health and cycle!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const buildContext = () => {
    let context = `You are RITVA, a helpful women's health AI assistant. 
    You help users understand their menstrual cycle, symptoms, and overall health.
    Always be empathetic, accurate, and supportive.
    Keep responses concise and practical.
    ${isHindi ? 'Always respond in Hindi.' : 'Respond in English.'}
    
    User's health data:`

    if (periodLogs && periodLogs.length > 0) {
      context += `\n- Last period started: ${periodLogs[0].start_date}`
      context += `\n- Total cycles logged: ${periodLogs.length}`
    }

    if (recentSymptoms && recentSymptoms.length > 0) {
      const latest = recentSymptoms[0]
      context += `\n- Recent mood: ${latest.mood}`
      context += `\n- Recent symptoms: ${latest.symptoms?.join(', ')}`
      context += `\n- Pain level: ${latest.pain_level}/10`
      context += `\n- Sleep: ${latest.sleep_hours} hours`
    }

    return context
  }

  // Smart Gemini call with cooldown & single retry on 429
  const callGemini = async (promptText) => {
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Cooldown before first call
    await delay(500);

    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          return text || null;
        }

        if (response.status === 429 && attempt === 0) {
          // rate limited, wait 3 seconds then retry
          await delay(3000);
          continue;
        }

        // other error or second 429
        return null;
      } catch (err) {
        return null;
      }
    }
    return null;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const prompt = `${buildContext()}\n\nUser question: ${input}`
    const reply = await callGemini(prompt)

    if (reply) {
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: isHindi
          ? '⏳ AI अभी व्यस्त है, कृपया 1-2 मिनट बाद पुनः प्रयास करें।'
          : '⏳ AI is busy right now. Please try again in 1-2 minutes.'
      }])
    }
    setLoading(false)
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div>
          <h3 className="text-white font-semibold text-sm">RITVA AI</h3>
          <p className="text-rose-100 text-xs">
            {isHindi ? 'आपकी स्वास्थ्य सहायक' : 'Your health assistant'}
          </p>
        </div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="ml-auto w-2 h-2 bg-emerald-400 rounded-full" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} variants={messageVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 * i }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-rose-500 text-white rounded-tr-sm'
                : 'bg-rose-50 text-gray-700 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-rose-50 px-4 py-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-rose-300 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-rose-300 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-rose-300 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {(isHindi ? [
          'आज के लिए सुझाव?',
          'ऐंठन कम करने के उपाय?',
          'अंडोत्सर्ग कब होगा?'
        ] : [
          'Tips for today?',
          'How to reduce cramps?',
          'When is my ovulation?'
        ]).map((q, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setInput(q)}
            className="whitespace-nowrap text-xs bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-all"
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-rose-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={isHindi ? 'कुछ पूछें...' : 'Ask anything...'}
          className="flex-1 px-4 py-2 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 disabled:opacity-50 transition-all"
        >
          ➤
        </motion.button>
      </div>
    </div>
  )
}
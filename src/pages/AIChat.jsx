import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ShieldAlert, Loader2 } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Smart helper with cooldown & single retry on 429
const callGemini = async (promptText) => {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // Cool-down before first call to avoid bursting quota
  await delay(500);

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }

      if (res.status === 429 && attempt === 0) {
        // rate limited, wait longer then retry once
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

export default function AIChat({ userId, t }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI health companion. Ask me anything about periods, ovulation, PMS, or general women's health. (Note: This is not a substitute for professional medical advice.)"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const systemPrompt = "You are a friendly, knowledgeable women's health assistant (like a virtual gynecologist). Provide helpful, accurate, and safe information about menstrual cycles, ovulation, contraception, pregnancy, and general wellness. Always remind users to consult a real doctor for medical concerns. Keep answers concise and supportive. Use simple language.";
    const prompt = systemPrompt + "\n\nUser question: " + input;

    const reply = await callGemini(prompt);

    if (reply) {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ AI is currently busy. Please wait a moment and try again.'
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 max-w-md mx-auto h-[80vh] flex flex-col">
      <motion.div className="flex items-center gap-2 mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-rose-100 p-2 rounded-full">
          <Bot size={24} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-rose-500">Ask Gynae AI</h2>
          <p className="text-xs text-gray-400">100% Anonymous · Not a Doctor</p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-rose-500 text-white' : 'bg-white border border-rose-100 shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'user' ? <User size={14} className="text-rose-200" /> : <Bot size={14} className="text-rose-400" />}
                <span className="text-xs font-semibold">{msg.role === 'user' ? 'You' : 'Gynae AI'}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && idx > 0 && (
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <ShieldAlert size={10} /> This is not medical advice
                </p>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-rose-100 shadow-sm p-3 rounded-2xl flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-rose-400" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <motion.div
        className="bg-white rounded-2xl border border-rose-100 shadow-lg p-2 flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about periods, ovulation, etc..."
          className="flex-1 px-3 py-2 rounded-xl border-0 outline-none text-sm"
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-rose-500 text-white p-2 rounded-full disabled:opacity-50"
        >
          <Send size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}
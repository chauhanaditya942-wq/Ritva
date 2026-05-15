import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Loader2, AlertCircle } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

function localPrediction(logs) {
  if (logs.length < 2) return null;
  let totalCycle = 0, totalPeriod = 0, count = 0;
  for (let i = 1; i < logs.length; i++) {
    const start1 = new Date(logs[i].start_date + 'T00:00:00');
    const start2 = new Date(logs[i-1].start_date + 'T00:00:00');
    const cycleLen = Math.round((start2 - start1) / (1000 * 60 * 60 * 24));
    totalCycle += cycleLen;
    count++;
    if (logs[i].end_date) {
      const end = new Date(logs[i].end_date + 'T00:00:00');
      const periodLen = Math.round((end - start1) / (1000*60*60*24)) + 1;
      totalPeriod += periodLen;
    }
  }
  const avgCycle = Math.round(totalCycle / count);
  const avgPeriod = count > 0 ? Math.round(totalPeriod / count) : 5;
  const lastStart = new Date(logs[0].start_date + 'T00:00:00');
  const nextStart = new Date(lastStart);
  nextStart.setDate(nextStart.getDate() + avgCycle);
  const ovulation = new Date(nextStart);
  ovulation.setDate(ovulation.getDate() - 14);
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  return { nextStart, ovulation, fertileStart, fertileEnd, avgCycle, avgPeriod };
}

export default function AIPredictions({ userId, t }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [usingLocal, setUsingLocal] = useState(false);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('period_logs')
      .select('start_date, end_date')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(12);
    if (data) setLogs(data);
  };

  const getPredictions = async () => {
    if (logs.length < 3) {
      setError('Need at least 3 logged cycles for accurate prediction.');
      return;
    }
    setLoading(true);
    setError('');
    setUsingLocal(false);

    const local = localPrediction(logs);
    if (local) {
      const localText = `📋 Quick Cycle Math:\n• Avg cycle: ${local.avgCycle} days\n• Avg period: ${local.avgPeriod} days\n• Next predicted period: ${local.nextStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n• Est. Ovulation: ${local.ovulation.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n• Fertile window: ${local.fertileStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${local.fertileEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
      setPrediction(localText + '\n\n⏳ AI insights loading...');
    }

    const cycles = logs.map(log => `Start: ${log.start_date}, End: ${log.end_date || '?'}`);
    const prompt = `As a friendly women's health AI, analyze these period cycles:\n${cycles.join('\n')}\n\nGive a short, supportive summary in bullet points including:\n- Predicted next period date (if possible)\n- Ovulation estimate\n- Fertile window\n- One lifestyle tip for her current phase\nKeep it concise and warm.`;

    let responseText = '';
    let retries = 2;
    while (retries >= 0) {
      try {
        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!res.ok) {
          if (res.status === 429) {
            retries--;
            if (retries >= 0) {
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }
            throw new Error('rate_limit');
          }
          throw new Error('api_error');
        }
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        break;
      } catch (err) {
        if (err.message === 'rate_limit') {
          if (local) {
            setUsingLocal(true);
            setPrediction('🔮 AI currently busy, showing smart local prediction:\n\n' +
              `📋 Avg cycle: ${local.avgCycle} days | Avg period: ${local.avgPeriod} days\n` +
              `🗓 Next period: ${local.nextStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n` +
              `🥚 Ovulation: ${local.ovulation.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n` +
              `🌱 Fertile: ${local.fertileStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${local.fertileEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\n\n` +
              '💡 Tip: Stay hydrated and practise gentle yoga during PMS.');
            setLoading(false);
            return;
          }
          setError('AI is currently overloaded. Please try again in a minute.');
        } else {
          setError('Could not fetch AI insights. Please try again later.');
        }
        setLoading(false);
        return;
      }
    }

    if (responseText) {
      setPrediction(`📊 Smart Prediction (AI + Local):\n\n${responseText}\n\n📋 Your average cycle: ${local?.avgCycle || '?'} days, period: ${local?.avgPeriod || '?'} days.`);
      setUsingLocal(false);
    } else if (local) {
      setPrediction('🔮 AI insight unavailable, showing local prediction:\n\n' +
        `📋 Avg cycle: ${local.avgCycle} days | Avg period: ${local.avgPeriod} days\n` +
        `🗓 Next period: ${local.nextStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n` +
        `🥚 Ovulation: ${local.ovulation.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}\n` +
        `🌱 Fertile window: ${local.fertileStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${local.fertileEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
      setUsingLocal(true);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 max-w-md mx-auto space-y-6">
      <motion.h2 className="text-2xl font-bold text-rose-500 flex items-center gap-2" initial={{ opacity:0, y:20}} animate={{opacity:1, y:0}}>
        <Sparkles size={28} /> AI Cycle Prediction
      </motion.h2>

      {logs.length < 3 ? (
        <motion.div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <AlertCircle size={18} className="text-amber-500 mt-0.5" />
          <div><p className="text-sm font-medium text-amber-700">Need 3+ cycles</p><p className="text-xs text-amber-600">Log at least 3 cycles to unlock prediction.</p></div>
        </motion.div>
      ) : (
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={getPredictions} disabled={loading}
          className="w-full bg-rose-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          {loading ? 'Analyzing...' : 'Get AI Predictions'}
        </motion.button>
      )}

      {error && (
        <motion.div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600" initial={{opacity:0}} animate={{opacity:1}}>
          {error}
        </motion.div>
      )}

      {prediction && (
        <motion.div className="bg-white rounded-2xl p-5 shadow-md border border-rose-50 whitespace-pre-wrap text-gray-700" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-rose-500" />
            <h3 className="font-semibold text-rose-600">Your Personalized Insights</h3>
            {usingLocal && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Local estimate</span>}
          </div>
          {prediction}
        </motion.div>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">🔒 Your cycle data is only used for this prediction and not stored.</p>
    </div>
  );
}
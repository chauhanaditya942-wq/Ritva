import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Activity, Frown, Droplet } from 'lucide-react';

const COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#f87171'];

export default function Trends({ userId, t }) {
  const [periodLogs, setPeriodLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('pain'); // pain | flow | mood | symptoms

  const isHindi = t?.hello?.includes('नमस्ते');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch period logs (last 12 cycles)
    const { data: periods } = await supabase
      .from('period_logs')
      .select('start_date, end_date')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(12);
    
    // Fetch symptom logs (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    const { data: symptoms } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', ninetyDaysAgo)
      .order('date', { ascending: true });

    setPeriodLogs(periods || []);
    setSymptomLogs(symptoms || []);
    setLoading(false);
  };

  // ── Process data for Pain Trend (line chart) ──
  const getPainTrendData = () => {
    return symptomLogs.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      pain: log.pain_level || 0,
    }));
  };

  // ── Process data for Flow Distribution (bar chart) ──
  const getFlowData = () => {
    const counts = { Light: 0, Medium: 0, Heavy: 0, 'Very Heavy': 0 };
    symptomLogs.forEach(log => {
      if (log.flow_level) {
        const level = log.flow_level.replace(/💧💧💧?/, '').trim();
        if (level === 'Light') counts.Light++;
        else if (level === 'Medium') counts.Medium++;
        else if (level === 'Heavy' || level === 'Very Heavy') counts['Very Heavy']++;
        else if (level === 'Heavy') counts.Heavy++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // ── Process data for Mood Distribution (pie chart) ──
  const getMoodData = () => {
    const moodCount = {};
    symptomLogs.forEach(log => {
      const mood = log.mood?.replace(/😊|😢|😠|😴|😰|🥰|😐/g, '').trim();
      if (mood) moodCount[mood] = (moodCount[mood] || 0) + 1;
    });
    return Object.entries(moodCount).map(([name, value]) => ({ name, value }));
  };

  // ── Process data for Symptom Frequency (bar chart) ──
  const getSymptomData = () => {
    const symCount = {};
    symptomLogs.forEach(log => {
      (log.symptoms || []).forEach(s => {
        symCount[s] = (symCount[s] || 0) + 1;
      });
    });
    return Object.entries(symCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-rose-400 text-4xl animate-pulse">🌸</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-rose-500 flex items-center gap-2"
      >
        <TrendingUp size={28} /> {isHindi ? 'लक्षण रुझान' : 'Symptom Trends'}
      </motion.h2>

      {/* Chart Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {[
          { key: 'pain', icon: Activity, label: isHindi ? 'दर्द' : 'Pain' },
          { key: 'flow', icon: Droplet, label: isHindi ? 'प्रवाह' : 'Flow' },
          { key: 'mood', icon: Frown, label: isHindi ? 'मूड' : 'Mood' },
          { key: 'symptoms', icon: TrendingUp, label: isHindi ? 'लक्षण' : 'Symptoms' },
        ].map(({ key, icon: Icon, label }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedChart(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 ${
              selectedChart === key
                ? 'bg-rose-500 text-white shadow'
                : 'bg-white border border-rose-100 text-gray-600'
            }`}
          >
            <Icon size={14} /> {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Chart Area */}
      <motion.div
        key={selectedChart}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50"
      >
        {selectedChart === 'pain' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              😣 {isHindi ? 'दर्द का स्तर (पिछले 90 दिन)' : 'Pain Level (Last 90 Days)'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getPainTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pain" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedChart === 'flow' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              🩸 {isHindi ? 'प्रवाह वितरण' : 'Flow Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getFlowData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedChart === 'mood' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              😊 {isHindi ? 'मूड वितरण' : 'Mood Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getMoodData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {getMoodData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedChart === 'symptoms' && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              🤒 {isHindi ? 'सबसे आम लक्षण' : 'Top Symptoms'}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getSymptomData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#f43f5e" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 border border-rose-200"
      >
        <p className="text-xs text-rose-700">
          {isHindi
            ? '📊 यह चार्ट पिछले 90 दिनों के logged लक्षणों पर आधारित हैं। नियमित tracking से बेहतर insights मिलते हैं।'
            : '📊 Charts are based on last 90 days of logged symptoms. Regular tracking gives better insights.'}
        </p>
      </motion.div>
    </div>
  );
}
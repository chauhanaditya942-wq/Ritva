import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useLanguage } from './i18n/useLanguage';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, PenLine, BarChart3, HeartHandshake, FileText, User,
  LogOut, Globe, Sparkles, Bot, TrendingUp, Trophy
} from 'lucide-react';

import Auth from './pages/Auth';
import HomePage from './pages/Home';
import Log from './pages/Log';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Partner from './pages/Partner';
import DoctorReport from './pages/DoctorReport';
import AIPredictions from './pages/AIPredictions';
import AIChat from './pages/AIChat';
import Trends from './pages/Trends';
import Streaks from './pages/Streaks';
import NotificationScheduler from './components/NotificationScheduler';
import StreakChecker from './components/StreakChecker';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-rose-400 text-4xl"
        >
          🌸
        </motion.div>
      </div>
    );
  }

  if (!session) return <Auth t={t} />;

  const navItems = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'log', icon: PenLine, label: t.log },
    { id: 'insights', icon: BarChart3, label: t.insights },
    { id: 'trends', icon: TrendingUp, label: 'Trends' },
    { id: 'streaks', icon: Trophy, label: 'Streaks' },
    { id: 'partner', icon: HeartHandshake, label: t.partner || 'Partner' },
    { id: 'doctorreport', icon: FileText, label: t.doctorReport || 'Report' },
    { id: 'aipredictions', icon: Sparkles, label: 'Predict' },
    { id: 'aichat', icon: Bot, label: 'Ask AI' },
    { id: 'profile', icon: User, label: t.profile || 'Profile' },
  ];

  const isHindi = t.hello?.includes('नमस्ते');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 font-sans relative overflow-hidden">
      {/* ── Background Decorative Blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-5 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-5 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-rose-300/20 rounded-full blur-2xl" />
        <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-fuchsia-200/30 rounded-full blur-2xl" />
      </div>

      {/* ── Floating Decorative Emojis ── */}
      <div className="fixed top-20 right-8 text-4xl opacity-20 pointer-events-none z-10">
        <motion.span
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="block"
        >
          🌷
        </motion.span>
      </div>
      <div className="fixed bottom-32 left-8 text-3xl opacity-20 pointer-events-none z-10">
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="block"
        >
          💖
        </motion.span>
      </div>
      <div className="fixed top-1/3 left-4 text-2xl opacity-15 pointer-events-none z-10">
        <motion.span
          animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="block"
        >
          ✨
        </motion.span>
      </div>

      {/* Animated Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 shadow-md relative z-20"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌸
              </motion.span>
              RITVA
            </h1>
            <p className="text-sm text-rose-100">{t.appTagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLang}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 font-medium flex items-center gap-1"
            >
              <Globe size={14} />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => supabase.auth.signOut()}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 flex items-center gap-1"
            >
              <LogOut size={14} />
              {t.logout}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Animated Page Container */}
      <main className="pb-24 px-4 pt-4 relative z-10">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <HomePage userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'log' && (
            <motion.div key="log" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Log userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Insights userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'trends' && (
            <motion.div key="trends" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Trends userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'streaks' && (
            <motion.div key="streaks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Streaks userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'partner' && (
            <motion.div key="partner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Partner userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'doctorreport' && (
            <motion.div key="doctorreport" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <DoctorReport userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'aipredictions' && (
            <motion.div key="aipredictions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AIPredictions userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'aichat' && (
            <motion.div key="aichat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <AIChat userId={session.user.id} t={t} />
            </motion.div>
          )}
          {activePage === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              <Profile userId={session.user.id} t={t} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GLOBAL NOTIFICATION SCHEDULER ── */}
        {session?.user?.id && (
          <NotificationScheduler userId={session.user.id} isHindi={isHindi} />
        )}

        {/* ── STREAK CHECKER (background) ── */}
        {session?.user?.id && (
          <StreakChecker userId={session.user.id} />
        )}
      </main>

      {/* Premium Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 flex justify-around py-3 shadow-lg backdrop-blur-sm bg-white/90 overflow-x-auto z-20">
        {navItems.map(({ id, icon: Icon, label }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActivePage(id)}
            className={`flex flex-col items-center text-xs gap-1 whitespace-nowrap px-2 ${activePage === id ? 'text-rose-500' : 'text-gray-400'}`}
          >
            <Icon size={20} strokeWidth={activePage === id ? 2.5 : 2} />
            <span className="leading-none">{label}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}

export default App;
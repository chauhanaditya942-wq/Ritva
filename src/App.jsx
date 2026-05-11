import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useLanguage } from './i18n/useLanguage'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Log from './pages/Log'
import Insights from './pages/Insights'
import Profile from './pages/Profile'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const { lang, toggleLang, t } = useLanguage()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-400 text-4xl animate-pulse">🌸</div>
      </div>
    )
  }

  if (!session) return <Auth t={t} />

  return (
    <div className="min-h-screen bg-rose-50 font-sans">
      <header className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">🌸 RITVA</h1>
            <p className="text-sm text-rose-100">{t.appTagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 font-medium"
            >
              {lang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24 px-4 pt-4">
        {activePage === 'home' && <Home userId={session.user.id} t={t} />}
        {activePage === 'log' && <Log userId={session.user.id} t={t} />}
        {activePage === 'insights' && <Insights userId={session.user.id} t={t} />}
        {activePage === 'profile' && <Profile userId={session.user.id} t={t} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 flex justify-around py-3 shadow-lg">
        <button
          onClick={() => setActivePage('home')}
          className={`flex flex-col items-center text-xs gap-1 ${activePage === 'home' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <span className="text-xl">🏠</span>
          {t.home}
        </button>
        <button
          onClick={() => setActivePage('log')}
          className={`flex flex-col items-center text-xs gap-1 ${activePage === 'log' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <span className="text-xl">📝</span>
          {t.log}
        </button>
        <button
          onClick={() => setActivePage('insights')}
          className={`flex flex-col items-center text-xs gap-1 ${activePage === 'insights' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <span className="text-xl">📊</span>
          {t.insights}
        </button>
        <button
          onClick={() => setActivePage('profile')}
          className={`flex flex-col items-center text-xs gap-1 ${activePage === 'profile' ? 'text-rose-500' : 'text-gray-400'}`}
        >
          <span className="text-xl">👤</span>
          {t.profile || 'Profile'}
        </button>
      </nav>
    </div>
  )
}

export default App
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: name,
          avg_cycle_length: 28,
          period_duration: 5
        })
        setMessage('Account created! Please verify your email 📧')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-rose-500">🌸 RITVA</h1>
        <p className="text-gray-400 mt-2 text-sm">Your rhythm, your health</p>
      </div>

      <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-6 border border-rose-100">
        <div className="flex bg-rose-50 rounded-xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-rose-500 text-white shadow' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-rose-500 text-white shadow' : 'text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        {!isLogin && (
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sarah"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-gray-500 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="sarah@email.com"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="text-xs text-gray-500 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
          />
        </div>

        {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
        {message && <p className="text-emerald-500 text-xs mb-4 text-center">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50"
        >
          {loading ? '...' : isLogin ? 'Login' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
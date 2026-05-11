import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import HealthTracker from '../components/Calendar/HealthTracker'

export default function Profile({ userId, t }) {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    avg_cycle_length: 28,
    period_duration: 5,
    weight: '',
    height: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const isHindi = t.hello.includes('नमस्ते')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        age: profile.age,
        avg_cycle_length: profile.avg_cycle_length,
        period_duration: profile.period_duration,
        weight: profile.weight,
        height: profile.height
      })
      .eq('id', userId)

    setSaving(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-rose-400 text-4xl animate-pulse">🌸</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-4">

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            👩
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || 'Your Profile'}</h2>
            <p className="text-rose-100 text-sm">
              {isHindi ? 'अपनी जानकारी अपडेट करें' : 'Update your information'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-4">
          {isHindi ? '👤 व्यक्तिगत जानकारी' : '👤 Personal Info'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'नाम' : 'Name'}
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
              placeholder={isHindi ? 'आपका नाम' : 'Your name'}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? 'उम्र' : 'Age'}
            </label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={e => setProfile({ ...profile, age: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
              placeholder="25"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'वजन (kg)' : 'Weight (kg)'}
              </label>
              <input
                type="number"
                value={profile.weight || ''}
                onChange={e => setProfile({ ...profile, weight: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
                placeholder="55"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">
                {isHindi ? 'ऊंचाई (cm)' : 'Height (cm)'}
              </label>
              <input
                type="number"
                value={profile.height || ''}
                onChange={e => setProfile({ ...profile, height: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 text-sm"
                placeholder="160"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
        <h3 className="font-semibold text-gray-700 mb-4">
          {isHindi ? '🌸 मासिक धर्म जानकारी' : '🌸 Cycle Information'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? `औसत चक्र लंबाई: ${profile.avg_cycle_length} दिन` : `Average Cycle Length: ${profile.avg_cycle_length} days`}
            </label>
            <input
              type="range"
              min="21"
              max="35"
              value={profile.avg_cycle_length}
              onChange={e => setProfile({ ...profile, avg_cycle_length: Number(e.target.value) })}
              className="w-full mt-2 accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>21</span><span>28</span><span>35</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">
              {isHindi ? `मासिक धर्म की अवधि: ${profile.period_duration} दिन` : `Period Duration: ${profile.period_duration} days`}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={profile.period_duration}
              onChange={e => setProfile({ ...profile, period_duration: Number(e.target.value) })}
              className="w-full mt-2 accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>2</span><span>5</span><span>8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 text-center py-2 rounded-xl text-sm">
          ✅ {isHindi ? 'सफलतापूर्वक सेव हो गया!' : 'Saved successfully!'}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-rose-500 text-white py-3 rounded-2xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50"
      >
        {saving ? '...' : (isHindi ? 'सेव करें' : 'Save Profile')}
      </button>

      {/* Health Tracker */}
      <HealthTracker userId={userId} isHindi={isHindi} />

    </div>
  )
}
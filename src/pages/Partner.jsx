import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Partner({ userId, t }) {
  const [inviteCode, setInviteCode] = useState('');
  const [myCode, setMyCode] = useState(null);
  const [connection, setConnection] = useState(null);
  const [permissions, setPermissions] = useState({
    view_period_cycle: true,
    view_symptoms: true,
    view_mood: true,
  });
  const [partnerData, setPartnerData] = useState([]);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    const { data, error } = await supabase
      .from('partner_connections')
      .select('*, partner_permissions(*)')
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
      .eq('status', 'accepted')
      .maybeSingle();
    if (data) {
      setConnection(data);
      if (data.partner_permissions?.[0]) {
        setPermissions(data.partner_permissions[0]);
      }
    }
  };

  const generateCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('partner_connections')
      .insert({ user_id: userId, invite_code: code, status: 'pending' })
      .select()
      .single();
    if (error) alert(error.message);
    else setMyCode(data.invite_code);
  };

  const joinPartner = async () => {
    if (!inviteCode) return;
    const { data: conn, error } = await supabase
      .from('partner_connections')
      .select('*')
      .eq('invite_code', inviteCode)
      .eq('status', 'pending')
      .single();
    if (error || !conn) return alert('Invalid code');
    if (conn.user_id === userId) return alert("Can't connect to yourself");

    await supabase
      .from('partner_connections')
      .update({ partner_id: userId, status: 'accepted', updated_at: new Date() })
      .eq('id', conn.id);
    await supabase.from('partner_permissions').insert({ connection_id: conn.id });
    alert('Connected!');
    loadConnection();
    setInviteCode('');
  };

  const togglePermission = async (key, value) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
    if (connection) {
      await supabase
        .from('partner_permissions')
        .update({ [key]: value })
        .eq('connection_id', connection.id);
    }
  };

  const fetchPartnerData = async (type) => {
    if (!connection) return;
    const partnerId =
      connection.user_id === userId ? connection.partner_id : connection.user_id;
    let query;
    switch (type) {
      case 'period':
        query = supabase
          .from('period_logs')
          .select('date, flow_level, mood, symptoms, notes')
          .eq('user_id', partnerId)
          .order('date', { ascending: false })
          .limit(30);
        break;
      case 'symptoms':
        query = supabase
          .from('symptom_logs')
          .select('date, symptoms, mood, notes')
          .eq('user_id', partnerId)
          .order('date', { ascending: false })
          .limit(30);
        break;
      case 'mood':
        query = supabase
          .from('mood_journal')
          .select('date, entry, emotions, sentiment')
          .eq('user_id', partnerId)
          .order('date', { ascending: false })
          .limit(30);
        break;
    }
    const { data } = await query;
    setPartnerData(data || []);
  };

  return (
    <div className="px-4 space-y-6">
      <h2 className="text-2xl font-bold text-rose-500">💑 {t.partner || 'Partner Mode'}</h2>

      {!connection ? (
        <>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Your Invite Code</h3>
            {myCode ? (
              <div className="bg-rose-100 text-rose-800 text-3xl font-bold text-center py-3 rounded-lg tracking-widest">
                {myCode}
              </div>
            ) : (
              <button onClick={generateCode} className="w-full bg-rose-500 text-white py-2 rounded-lg">
                Generate Code
              </button>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Join Partner</h3>
            <input
              type="text"
              placeholder="Enter partner code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full border border-rose-200 rounded-lg p-2 text-center"
            />
            <button onClick={joinPartner} className="w-full bg-rose-500 text-white py-2 rounded-lg mt-2">
              Connect
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">✅ Connected</h3>
            <div className="space-y-2">
              {Object.entries({
                view_period_cycle: 'Period Cycle',
                view_symptoms: 'Symptoms',
                view_mood: 'Mood',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={(e) => togglePermission(key, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">View Partner's Data</h3>
            <div className="flex gap-2 mb-4">
              <button onClick={() => fetchPartnerData('period')} className="bg-rose-500 text-white px-4 py-2 rounded-lg">
                Period
              </button>
              <button onClick={() => fetchPartnerData('symptoms')} className="bg-rose-500 text-white px-4 py-2 rounded-lg">
                Symptoms
              </button>
              <button onClick={() => fetchPartnerData('mood')} className="bg-rose-500 text-white px-4 py-2 rounded-lg">
                Mood
              </button>
            </div>
            {partnerData.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {partnerData.map((item, idx) => (
                  <div key={idx} className="border-b pb-2 text-sm">
                    <p className="font-medium">{item.date}</p>
                    <p>Flow: {item.flow_level || '-'} | Mood: {item.mood || item.sentiment || '-'}</p>
                    {item.symptoms && <p>Symptoms: {item.symptoms.join(', ')}</p>}
                    {item.notes && <p>Notes: {item.notes}</p>}
                    {item.entry && <p>Entry: {item.entry}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
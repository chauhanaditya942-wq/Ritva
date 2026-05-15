import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { HeartHandshake, Copy, CheckCircle, Link, Eye, EyeOff, RefreshCw, UserPlus, Shield } from 'lucide-react';

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
  const [dataType, setDataType] = useState(null);

  useEffect(() => { loadConnection(); }, []);

  const loadConnection = async () => {
    const { data } = await supabase
      .from('partner_connections')
      .select('*, partner_permissions(*)')
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`)
      .eq('status', 'accepted')
      .maybeSingle();
    if (data) {
      setConnection(data);
      if (data.partner_permissions?.[0]) setPermissions(data.partner_permissions[0]);
    }
  };

  const generateCode = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await supabase
      .from('partner_connections')
      .insert({ user_id: userId, invite_code: code, status: 'pending' })
      .select()
      .single();
    if (data) setMyCode(data.invite_code);
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
    loadConnection();
    setInviteCode('');
  };

  const togglePermission = async (key, value) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
    if (connection) {
      await supabase.from('partner_permissions').update({ [key]: value }).eq('connection_id', connection.id);
    }
  };

  const fetchPartnerData = async (type) => {
    if (!connection) return;
    setDataType(type);
    const partnerId = connection.user_id === userId ? connection.partner_id : connection.user_id;
    let query;
    switch (type) {
      case 'period':
        query = supabase.from('period_logs').select('date, flow_level, mood, symptoms, notes').eq('user_id', partnerId).order('date', { ascending: false }).limit(30);
        break;
      case 'symptoms':
        query = supabase.from('symptom_logs').select('date, symptoms, mood, notes').eq('user_id', partnerId).order('date', { ascending: false }).limit(30);
        break;
      case 'mood':
        query = supabase.from('mood_journal').select('date, entry, emotions, sentiment').eq('user_id', partnerId).order('date', { ascending: false }).limit(30);
        break;
    }
    const { data } = await query;
    setPartnerData(data || []);
  };

  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="px-4 space-y-6">
      <motion.h2 className="text-2xl font-bold text-rose-500 flex items-center gap-2" {...fadeIn}>
        <HeartHandshake size={28} /> {t.partner || 'Partner Mode'}
      </motion.h2>

      {!connection ? (
        <>
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><Link size={18} /> Your Invite Code</h3>
            {myCode ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-rose-100 text-rose-800 text-3xl font-bold text-center py-3 rounded-lg tracking-widest cursor-pointer flex items-center justify-center gap-3"
                onClick={() => { navigator.clipboard.writeText(myCode); alert('Copied!'); }}
                whileTap={{ scale: 0.95 }}
              >
                {myCode}
                <Copy size={20} className="text-rose-500" />
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCode}
                className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Generate Code
              </motion.button>
            )}
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><UserPlus size={18} /> Join Partner</h3>
            <input
              type="text"
              placeholder="Enter partner code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full border border-rose-200 rounded-lg p-2 text-center"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={joinPartner}
              className="w-full bg-rose-500 text-white py-3 rounded-lg mt-2 font-semibold"
            >
              Connect
            </motion.button>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div {...fadeIn} className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
              <CheckCircle size={20} /> Connected
            </div>
            <div className="space-y-3">
              {[
                { key: 'view_period_cycle', label: 'Period Cycle' },
                { key: 'view_symptoms', label: 'Symptoms' },
                { key: 'view_mood', label: 'Mood' },
              ].map(({ key, label }) => (
                <motion.label
                  key={key}
                  whileHover={{ backgroundColor: '#fff5f5' }}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {permissions[key] ? <Eye size={16} /> : <EyeOff size={16} />}
                    {label}
                  </span>
                  <input
                    type="checkbox"
                    checked={permissions[key]}
                    onChange={(e) => togglePermission(key, e.target.checked)}
                    className="accent-rose-500 scale-125"
                  />
                </motion.label>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn} className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Shield size={18} /> View Partner's Data</h3>
            <div className="flex gap-2 mb-4">
              {['period', 'symptoms', 'mood'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchPartnerData(type)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm ${dataType === type ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
            {partnerData.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {partnerData.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b pb-2 text-sm"
                  >
                    <p className="font-medium">{item.date}</p>
                    <p>Flow: {item.flow_level || '-'} | Mood: {item.mood || item.sentiment || '-'}</p>
                    {item.symptoms && <p>Symptoms: {item.symptoms.join(', ')}</p>}
                    {item.notes && <p>Notes: {item.notes}</p>}
                    {item.entry && <p>Entry: {item.entry}</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
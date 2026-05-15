import { useState } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';

export default function DoctorReport({ userId, t }) {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, age, avg_cycle_length, period_duration')
        .eq('id', userId)
        .single();

      // Fetch period logs
      const { data: periodLogs } = await supabase
        .from('period_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // Fetch symptom logs
      const { data: symptomLogs } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch mood journal
      const { data: moodEntries } = await supabase
        .from('mood_journal')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      // Calculate symptom frequency
      const symptomCount = {};
      (symptomLogs || []).forEach(log => {
        (log.symptoms || []).forEach(s => symptomCount[s] = (symptomCount[s] || 0) + 1);
      });
      const symptomSummary = Object.entries(symptomCount)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ') || 'None reported';

      // Build professional HTML
      const reportHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; max-width: 700px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f472b6, #db2777); padding: 25px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0;">🌸 RITVA Health Report</h1>
            <p style="color: #ffe4e6; margin: 8px 0 0;">Women's Health Summary</p>
          </div>

          <!-- Patient Info -->
          <div style="background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #be185d; margin: 0 0 12px; border-bottom: 2px solid #fce7f3; padding-bottom: 6px;">👩‍⚕️ Patient Information</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px 24px;">
              <div><strong>Name:</strong> ${profile?.name || 'N/A'}</div>
              <div><strong>Age:</strong> ${profile?.age || 'N/A'}</div>
              <div><strong>Avg Cycle:</strong> ${profile?.avg_cycle_length || '-'} days</div>
              <div><strong>Period Duration:</strong> ${profile?.period_duration || '-'} days</div>
            </div>
            <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">Report Period: ${startDate} — ${endDate}</p>
          </div>

          <!-- Period History Table -->
          <div style="background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #be185d; margin: 0 0 12px; border-bottom: 2px solid #fce7f3; padding-bottom: 6px;">📅 Period History</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #fce7f3; color: #9d174d;">
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Date</th>
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Flow</th>
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Symptoms</th>
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Mood</th>
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Pain (0-5)</th>
                  <th style="padding: 8px; border: 1px solid #f3d4e0;">Notes</th>
                </tr>
              </thead>
              <tbody>
                ${(periodLogs || []).map(log => `
                  <tr>
                    <td style="padding: 6px; border: 1px solid #f3d4e0;">${log.date}</td>
                    <td style="padding: 6px; border: 1px solid #f3d4e0; text-transform: capitalize;">${log.flow_level || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #f3d4e0;">${(log.symptoms || []).join(', ') || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #f3d4e0;">${log.mood || '-'}</td>
                    <td style="padding: 6px; border: 1px solid #f3d4e0;">${log.pain_level ?? '-'}</td>
                    <td style="padding: 6px; border: 1px solid #f3d4e0;">${log.notes || '-'}</td>
                  </tr>
                `).join('')}
                ${(periodLogs || []).length === 0 ? '<tr><td colspan="6" style="text-align:center; padding:12px; color:#999;">No period records found</td></tr>' : ''}
              </tbody>
            </table>
          </div>

          <!-- Symptom Summary -->
          <div style="background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #be185d; margin: 0 0 12px; border-bottom: 2px solid #fce7f3; padding-bottom: 6px;">🔍 Symptom Overview</h3>
            <p style="font-size: 14px;"><strong>Frequency:</strong> ${symptomSummary}</p>
          </div>

          <!-- Mood Journal -->
          <div style="background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="color: #be185d; margin: 0 0 12px; border-bottom: 2px solid #fce7f3; padding-bottom: 6px;">🧠 Mood Journal</h3>
            ${(moodEntries || []).length === 0 ? '<p style="color:#999;">No mood entries</p>' : 
              `<ul style="padding-left: 18px; margin: 0;">${moodEntries.map(m => `
                <li style="margin-bottom: 6px;"><strong>${m.date}</strong> – ${m.sentiment || 'neutral'} ${m.emotions ? '(' + m.emotions.join(', ') + ')' : ''}</li>
              `).join('')}</ul>`
            }
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3d4e0; padding-top: 10px;">
            Generated by Ritva App • This report is for medical consultation only<br/>
            ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;

      // Render HTML to canvas
      const container = document.createElement('div');
      container.innerHTML = reportHTML;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2, useCORS: true });
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height;
      }

      pdf.save(`Ritva_Report_${startDate}_to_${endDate}.pdf`);

      // Save metadata to DB
      await supabase.from('doctor_reports').insert({
        user_id: userId,
        report_url: 'local',
        report_date: new Date(),
        date_range_start: startDate,
        date_range_end: endDate,
        file_name: `Ritva_Report_${startDate}_to_${endDate}.pdf`
      });

    } catch (err) {
      alert('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-rose-500 mb-4 flex items-center gap-2"
      >
        <FileText size={28} /> {t.doctorReport || 'Doctor Report'}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-xl shadow-md space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Calendar size={16} /> Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-rose-200 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Calendar size={16} /> End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-rose-200 rounded-lg p-2"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateReport}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 size={20} />
            </motion.span>
          ) : (
            <Download size={20} />
          )}
          {loading ? 'Generating Report...' : 'Download PDF Report'}
        </motion.button>
      </motion.div>
    </div>
  );
}
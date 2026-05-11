import { PHASE_INFO } from '../../lib/cyclePhase'

export default function PhaseCard({ phase, isHindi }) {
  if (!phase || !PHASE_INFO[phase]) return null

  const info = PHASE_INFO[phase]
  const name = isHindi ? info.nameHi : info.name
  const description = isHindi ? info.descriptionHi : info.description
  const tips = isHindi ? info.tipsHi : info.tips

  const colorMap = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-100', title: 'text-rose-700', badge: 'bg-rose-100 text-rose-600', tip: 'bg-rose-100 text-rose-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-600', tip: 'bg-emerald-100 text-emerald-700' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', title: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-600', tip: 'bg-yellow-100 text-yellow-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', title: 'text-purple-700', badge: 'bg-purple-100 text-purple-600', tip: 'bg-purple-100 text-purple-700' },
  }

  const c = colorMap[info.color]

  return (
    <div className={`${c.bg} rounded-2xl p-4 border ${c.border} mt-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <h3 className={`font-bold text-sm ${c.title}`}>{name}</h3>
            <p className="text-xs text-gray-400">{info.duration}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.badge}`}>
          {isHindi ? 'आज का चरण' : 'Today\'s Phase'}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3">{description}</p>

      {/* Tips */}
      <h4 className={`text-xs font-semibold ${c.title} mb-2`}>
        {isHindi ? '💡 आज के लिए सुझाव:' : '💡 Tips for today:'}
      </h4>
      <div className="space-y-1.5">
        {tips.slice(0, 4).map((tip, i) => (
          <div key={i} className={`flex items-start gap-2 ${c.tip} rounded-lg px-3 py-2`}>
            <span className="text-xs mt-0.5">✓</span>
            <p className="text-xs">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
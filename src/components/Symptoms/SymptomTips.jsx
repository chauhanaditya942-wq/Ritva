import { SYMPTOM_TIPS } from '../../lib/cyclePhase'

export default function SymptomTips({ symptoms, isHindi }) {
  if (!symptoms || symptoms.length === 0) return null

  const relevantTips = symptoms
    .filter(s => SYMPTOM_TIPS[s])
    .slice(0, 3)

  if (relevantTips.length === 0) return null

  return (
    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🩺</span>
        <h3 className="font-semibold text-blue-700 text-sm">
          {isHindi ? 'लक्षणों के लिए सुझाव' : 'Tips for your symptoms'}
        </h3>
      </div>
      <div className="space-y-3">
        {relevantTips.map(symptom => (
          <div key={symptom}>
            <p className="text-xs font-semibold text-blue-600 mb-1">
              {symptom}
            </p>
            <div className="space-y-1">
              {SYMPTOM_TIPS[symptom]?.slice(0, 2).map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-blue-100 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-blue-400 mt-0.5">→</span>
                  <p className="text-xs text-blue-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
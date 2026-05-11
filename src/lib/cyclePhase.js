export function getCyclePhase(lastPeriodStart, avgCycleLength = 28) {
  if (!lastPeriodStart) return null
  
  const today = new Date()
  const start = new Date(lastPeriodStart)
  const dayOfCycle = Math.ceil((today - start) / (1000 * 60 * 60 * 24)) + 1

  if (dayOfCycle <= 5) return 'menstrual'
  if (dayOfCycle <= 13) return 'follicular'
  if (dayOfCycle <= 16) return 'ovulation'
  if (dayOfCycle <= avgCycleLength) return 'luteal'
  return 'menstrual'
}

export const PHASE_INFO = {
  menstrual: {
    name: 'Menstrual Phase',
    nameHi: 'मासिक धर्म चरण',
    emoji: '🌸',
    color: 'rose',
    duration: 'Day 1–5',
    tips: [
      'Rest as much as possible',
      'Use a heating pad for cramps',
      'Eat iron-rich foods like spinach & lentils',
      'Stay hydrated — drink 8+ glasses of water',
      'Light walks can help reduce pain',
      'Avoid caffeine & alcohol'
    ],
    tipsHi: [
      'जितना हो सके आराम करें',
      'ऐंठन के लिए हीटिंग पैड का उपयोग करें',
      'पालक और दाल जैसे आयरन युक्त खाद्य पदार्थ खाएं',
      'हाइड्रेटेड रहें — 8+ गिलास पानी पिएं',
      'हल्की सैर दर्द कम करने में मदद कर सकती है',
      'कैफीन और शराब से बचें'
    ],
    description: 'Your body is shedding the uterine lining. Rest and nourish yourself.',
    descriptionHi: 'आपका शरीर गर्भाशय की परत को बाहर निकाल रहा है। आराम करें और खुद को पोषण दें।'
  },
  follicular: {
    name: 'Follicular Phase',
    nameHi: 'फॉलिक्यूलर चरण',
    emoji: '🌱',
    color: 'emerald',
    duration: 'Day 6–13',
    tips: [
      'Energy is rising — great time to exercise',
      'Try new activities or start new projects',
      'Eat foods rich in estrogen: flaxseeds, soy',
      'Social activities feel more enjoyable now',
      'Focus on strength training',
      'Good time for creative work'
    ],
    tipsHi: [
      'ऊर्जा बढ़ रही है — व्यायाम के लिए अच्छा समय',
      'नई गतिविधियाँ आज़माएं या नए प्रोजेक्ट शुरू करें',
      'एस्ट्रोजन से भरपूर खाद्य पदार्थ खाएं: अलसी, सोया',
      'सामाजिक गतिविधियाँ अधिक आनंददायक लगती हैं',
      'स्ट्रेंथ ट्रेनिंग पर ध्यान दें',
      'रचनात्मक काम के लिए अच्छा समय'
    ],
    description: 'Estrogen is rising. You feel more energetic and social.',
    descriptionHi: 'एस्ट्रोजन बढ़ रहा है। आप अधिक ऊर्जावान और सामाजिक महसूस करती हैं।'
  },
  ovulation: {
    name: 'Ovulation Phase',
    nameHi: 'अंडोत्सर्ग चरण',
    emoji: '✨',
    color: 'yellow',
    duration: 'Day 14–16',
    tips: [
      'Peak energy and confidence today!',
      'Great time for important meetings or events',
      'High intensity workouts work well now',
      'Fertile window — be aware if planning/avoiding pregnancy',
      'Communication skills are at their best',
      'Eat antioxidant-rich foods'
    ],
    tipsHi: [
      'आज ऊर्जा और आत्मविश्वास चरम पर है!',
      'महत्वपूर्ण मीटिंग या इवेंट के लिए अच्छा समय',
      'हाई इंटेंसिटी वर्कआउट अभी अच्छे से काम करते हैं',
      'उपजाऊ खिड़की — गर्भावस्था की योजना/परहेज करने पर ध्यान दें',
      'संचार कौशल अपने सर्वश्रेष्ठ पर हैं',
      'एंटीऑक्सीडेंट युक्त खाद्य पदार्थ खाएं'
    ],
    description: 'An egg is released. You feel confident and at your best!',
    descriptionHi: 'अंडा जारी हो रहा है। आप आत्मविश्वासी और अपने सर्वश्रेष्ठ पर महसूस करती हैं!'
  },
  luteal: {
    name: 'Luteal Phase',
    nameHi: 'ल्यूटियल चरण',
    emoji: '🌙',
    color: 'purple',
    duration: 'Day 17–28',
    tips: [
      'Mood swings are normal — be kind to yourself',
      'Reduce caffeine to help with PMS',
      'Magnesium-rich foods help: dark chocolate, nuts',
      'Prioritize sleep — aim for 8 hours',
      'Gentle yoga or stretching is ideal',
      'Journaling helps process emotions'
    ],
    tipsHi: [
      'मूड स्विंग सामान्य है — खुद के प्रति दयालु रहें',
      'PMS में मदद के लिए कैफीन कम करें',
      'मैग्नीशियम युक्त खाद्य पदार्थ मदद करते हैं: डार्क चॉकलेट, नट्स',
      'नींद को प्राथमिकता दें — 8 घंटे का लक्ष्य रखें',
      'हल्का योग या स्ट्रेचिंग आदर्श है',
      'जर्नलिंग भावनाओं को संसाधित करने में मदद करती है'
    ],
    description: 'Progesterone rises. PMS symptoms may appear. Self-care is key.',
    descriptionHi: 'प्रोजेस्टेरोन बढ़ता है। PMS लक्षण आ सकते हैं। स्व-देखभाल महत्वपूर्ण है।'
  }
}

export const SYMPTOM_TIPS = {
  'Cramps': ['Apply heat pad on lower abdomen', 'Try child\'s pose yoga', 'Avoid cold drinks', 'Ginger tea helps'],
  'ऐंठन': ['पेट के निचले हिस्से पर हीट पैड लगाएं', 'चाइल्ड पोज़ योग करें', 'ठंडे पेय से बचें', 'अदरक की चाय मदद करती है'],
  'Headache': ['Stay hydrated', 'Rest in a dark room', 'Gentle neck massage', 'Avoid bright screens'],
  'सिरदर्द': ['हाइड्रेटेड रहें', 'अंधेरे कमरे में आराम करें', 'हल्की गर्दन की मालिश करें', 'तेज स्क्रीन से बचें'],
  'Bloating': ['Avoid salty & processed foods', 'Gentle walk after meals', 'Peppermint tea helps', 'Avoid carbonated drinks'],
  'पेट फूलना': ['नमकीन और प्रसंस्कृत खाद्य से बचें', 'खाने के बाद हल्की सैर करें', 'पुदीने की चाय मदद करती है'],
  'Fatigue': ['Short 20 min naps help', 'Iron-rich foods: spinach, lentils', 'Light exercise boosts energy', 'B12 vitamins help'],
  'थकान': ['20 मिनट की झपकी मदद करती है', 'आयरन युक्त खाद्य: पालक, दाल', 'हल्का व्यायाम ऊर्जा बढ़ाता है']
}
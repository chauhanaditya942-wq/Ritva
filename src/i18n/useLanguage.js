import { useState } from 'react'
import en from './en.json'
import hi from './hi.json'

export function useLanguage() {
  const [lang, setLang] = useState(localStorage.getItem('ritva-lang') || 'en')

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en'
    setLang(newLang)
    localStorage.setItem('ritva-lang', newLang)
  }

  const t = lang === 'en' ? en : hi

  return { lang, toggleLang, t }
}
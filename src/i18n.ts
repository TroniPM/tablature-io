import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

const LOCALE_KEY = 'app-locale'

type SupportedLocale = 'en' | 'pt-BR' | 'es'

function detectLocale(): SupportedLocale {
  const saved = localStorage.getItem(LOCALE_KEY) as SupportedLocale | null
  if (saved && ['en', 'pt-BR', 'es'].includes(saved)) return saved

  const lang = navigator.language || ''
  if (lang.startsWith('pt')) return 'pt-BR'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'pt-BR': ptBR,
    es,
  },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_KEY, locale)
}

export type { SupportedLocale }

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { translate, type Lang } from '@/lib/i18n'
import { useAppData } from '@/store/AppDataContext'
import { usePersistedState } from '@/store/persist'

interface LanguageContextValue {
  lang: Lang
  dir: 'rtl' | 'ltr'
  setLang: (lang: Lang) => void
  t: (key: string, fallback: string) => string
  overrides: Record<string, string>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { overrides: overrideList, settings } = useAppData()
  const [lang, setLang] = usePersistedState<Lang>('lang', settings.defaultLanguage)

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const overrides = useMemo(
    () => Object.fromEntries(overrideList.items.map((item) => [item.key, item.value])),
    [overrideList.items],
  )

  const t = useCallback((key: string, fallback: string) => translate(lang, key, fallback, overrides), [lang, overrides])
  const setLanguage = useCallback((next: Lang) => setLang(next), [setLang])

  const value = useMemo(
    () => ({ lang, dir, setLang: setLanguage, t, overrides }),
    [lang, dir, setLanguage, t, overrides],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}

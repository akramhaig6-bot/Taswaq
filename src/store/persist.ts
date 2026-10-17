import { useCallback, useEffect, useState } from 'react'

/**
 * إصدار مساحة التخزين المحلي.
 * يُرفع عند تغيير بنية البيانات الأولية (seed) ليتم تحميل النسخة الأحدث
 * تلقائيًا بدل البقاء على بيانات قديمة محفوظة في المتصفح.
 */
export const STORAGE_VERSION = 'v2'
const PREFIX = `sawqli.${STORAGE_VERSION}.`

export function storageKey(key: string): string {
  return `${PREFIX}${key}`
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch (error) {
    console.warn('تعذّر حفظ البيانات محليًا', error)
  }
}

/** حالة محفوظة في LocalStorage (يعمل الموقع بدون خادم) */
export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readStorage<T>(key, initial))
  useEffect(() => {
    writeStorage(key, state)
  }, [key, state])
  return [state, setState] as const
}

/** مجموعة عناصر (CRUD) محفوظة محليًا */
export function useCollection<T extends { id: string }>(key: string, initial: T[]) {
  const [items, setItems] = usePersistedState<T[]>(key, initial)

  const add = useCallback((item: T) => setItems((prev) => [item, ...prev]), [setItems])
  const addMany = useCallback((list: T[]) => setItems((prev) => [...list, ...prev]), [setItems])
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item))),
    [setItems],
  )
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((item) => item.id !== id)), [setItems])
  const find = useCallback((id: string) => items.find((item) => item.id === id), [items])

  return { items, add, addMany, update, remove, find, set: setItems }
}

/** يعيد التطبيق لحالته الأولى (حذف كل البيانات المحفوظة محليًا) */
export function resetAppData(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key))
  window.location.reload()
}

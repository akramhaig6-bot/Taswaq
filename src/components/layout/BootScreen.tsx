import { useCallback, useEffect, useState } from 'react'
import { CloudOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/display'

type State = 'loading' | 'error'

/**
 * شاشة التحميل الأولية:
 * - شعار سوقلي مع نبض + مؤشر تحميل دائري.
 * - عند فشل الاتصال (لا يوجد إنترنت) تنتظر 10 ثوانٍ ثم تعرض شاشة الخطأ مع "إعادة المحاولة".
 */
export function BootScreen({ onReady }: { onReady: () => void }) {
  const [state, setState] = useState<State>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let timer: number
    let failTimer: number

    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    if (offline) {
      failTimer = window.setTimeout(() => setState('error'), 10000)
    } else {
      timer = window.setTimeout(() => onReady(), 900)
    }
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(failTimer)
    }
  }, [attempt, onReady])

  const retry = useCallback(() => {
    setState('loading')
    setAttempt((value) => value + 1)
  }, [])

  if (state === 'error') {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-white px-10 text-center animate-fade-in">
        <span className="flex size-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <CloudOff className="size-9" />
        </span>
        <p className="text-[13.5px] leading-6 text-gray-600">
          تعذر الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.
        </p>
        <Button onClick={retry}>إعادة المحاولة</Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-white animate-fade-in">
      <span className="animate-pulse-soft text-4xl font-extrabold text-brand">سوقلي</span>
      <Spinner className="size-6" />
    </div>
  )
}

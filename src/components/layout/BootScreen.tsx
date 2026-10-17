import { useCallback, useEffect, useLayoutEffect, useState, type KeyboardEvent } from 'react'
import { storageKey } from '@/store/persist'

const SPLASH_SEEN_KEY = storageKey('splash-seen')
const FIRST_RUN_DURATION = 7000
const RETURNING_DURATION = 3000
const SKIP_AFTER = 3000
const EXIT_DURATION = 320

type BootScreenProps = {
  onReady: () => void
}

function isFirstLaunch(): boolean {
  try {
    return window.localStorage.getItem(SPLASH_SEEN_KEY) !== 'true'
  } catch {
    return true
  }
}

/** شاشة البداية المتحركة للسوق — سبع ثوانٍ في أول زيارة وثلاث في الزيارات التالية. */
export function BootScreen({ onReady }: BootScreenProps) {
  const [firstLaunch] = useState(isFirstLaunch)
  const [canSkip, setCanSkip] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const duration = firstLaunch ? FIRST_RUN_DURATION : RETURNING_DURATION

  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
    document.documentElement.classList.add('splash-active')
    return () => document.documentElement.classList.remove('splash-active')
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(SPLASH_SEEN_KEY, 'true')
    } catch {
      // تبقى شاشة البداية عاملة حتى في وضع التصفح الخاص أو عند تعطيل التخزين.
    }
  }, [])

  const skip = useCallback(() => {
    if (canSkip && !skipping) setSkipping(true)
  }, [canSkip, skipping])

  const finish = useCallback(() => {
    const root = document.getElementById('root')
    if (root) {
      root.classList.remove('app-view--ready')
      void root.offsetWidth
      root.classList.add('app-view--ready')
      window.setTimeout(() => root.classList.remove('app-view--ready'), 150)
    }
    onReady()
  }, [onReady])

  useEffect(() => {
    if (skipping) {
      const exitTimer = window.setTimeout(finish, EXIT_DURATION)
      return () => window.clearTimeout(exitTimer)
    }

    const skipTimer = window.setTimeout(() => setCanSkip(true), SKIP_AFTER)
    const readyTimer = window.setTimeout(finish, duration)
    return () => {
      window.clearTimeout(skipTimer)
      window.clearTimeout(readyTimer)
    }
  }, [duration, finish, skipping])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (canSkip && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        skip()
      }
    },
    [canSkip, skip],
  )

  return (
    <div
      className={`splash-screen ${firstLaunch ? 'splash-screen--first' : 'splash-screen--returning'}${
        skipping ? ' splash-screen--skipping' : ''
      }`}
      role="button"
      tabIndex={0}
      aria-label="شاشة بداية السوق — اضغط للتخطي"
      aria-disabled={!canSkip}
      onClick={skip}
      onKeyDown={handleKeyDown}
    >
      <div className="splash-blackout" aria-hidden="true" />
      <div className="splash-gradient" aria-hidden="true" />
      <div className="splash-ornament" aria-hidden="true" />

      <div className="splash-content" aria-hidden="true">
        <div className="splash-emblem">
          <span className="splash-emblem-glow" />
          <svg className="splash-mark" viewBox="0 0 120 120" fill="none">
            <g className="splash-ring-enter">
              <g className="splash-ring-spin">
                <path className="splash-arc splash-arc--top" d="M34.9 30.1A39 39 0 0 1 85.1 30.1" />
                <path className="splash-arc splash-arc--right" d="M89.9 34.9A39 39 0 0 1 89.9 85.1" />
                <path className="splash-arc splash-arc--bottom" d="M85.1 89.9A39 39 0 0 1 34.9 89.9" />
                <path className="splash-arc splash-arc--left" d="M30.1 85.1A39 39 0 0 1 30.1 34.9" />
              </g>
            </g>
            <circle className="splash-birth" cx="60" cy="60" r="2.8" />
            <g className="splash-logo-art">
              {/* عربة التسوق وخط عربي متموّج مستوحى من حرف السين */}
              <path
                className="splash-icon-line splash-cart-frame"
                pathLength="1"
                d="M26 38h9l8 34h38l11-27H39"
              />
              <path
                className="splash-icon-line splash-cart-weave"
                pathLength="1"
                d="M42 49c6 0 6-8 12-8s6 9 12 9 6-8 12-8 6 8 12 8"
              />
              <path className="splash-icon-line splash-cart-base" pathLength="1" d="M46 79h35" />
              <circle className="splash-icon-line splash-cart-wheel" pathLength="1" cx="51" cy="88" r="3.5" />
              <circle className="splash-icon-line splash-cart-wheel" pathLength="1" cx="75" cy="88" r="3.5" />
              <path className="splash-icon-line splash-handle-detail" pathLength="1" d="M27 38h-5" />
            </g>
          </svg>
        </div>

        <h1 className="splash-title" dir="rtl">
          السوق
        </h1>
        <span className="splash-divider" />
        <p className="splash-tagline">السوق العربي الشامل</p>
      </div>

      <div className="splash-whiteout" aria-hidden="true" />
    </div>
  )
}

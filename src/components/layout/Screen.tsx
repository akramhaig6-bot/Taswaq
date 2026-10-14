import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** هيكل الشاشة: رأس ثابت + محتوى قابل للتمرير + شريط سفلي ثابت */
export function Screen({
  header,
  children,
  footer,
  className,
  contentClassName,
  resetScrollKey,
}: {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  resetScrollKey?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [location.pathname, resetScrollKey])

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {header}
      <div
        ref={ref}
        className={cn('no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain', contentClassName)}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn, remainingParts } from '@/lib/utils'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function CountdownTimer({
  end,
  onExpire,
  size = 'md',
  className,
}: {
  end: string
  onExpire?: () => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const [parts, setParts] = useState(() => remainingParts(end))

  useEffect(() => {
    setParts(remainingParts(end))
    const timer = window.setInterval(() => {
      const next = remainingParts(end)
      setParts(next)
      if (next.expired) {
        window.clearInterval(timer)
        onExpire?.()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [end, onExpire])

  if (parts.expired) {
    return <span className={cn('text-[12px] font-bold text-gray-400', className)}>انتهى العرض</span>
  }

  const box = size === 'sm' ? 'min-w-7 px-1 py-0.5 text-[11px]' : 'min-w-9 px-1.5 py-1 text-[13px]'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Clock className={cn('text-danger', size === 'sm' ? 'size-3.5' : 'size-4')} />
      <span className={cn('rounded-md bg-danger/10 font-bold tabular-nums text-danger', box)}>{pad(parts.hours)}</span>
      <span className="text-danger/70">:</span>
      <span className={cn('rounded-md bg-danger/10 font-bold tabular-nums text-danger', box)}>{pad(parts.minutes)}</span>
      <span className="text-danger/70">:</span>
      <span className={cn('rounded-md bg-danger/10 font-bold tabular-nums text-danger', box)}>{pad(parts.seconds)}</span>
    </div>
  )
}

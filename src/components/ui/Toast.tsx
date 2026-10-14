import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useToast, type ToastType } from '@/store/ToastContext'

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-brand',
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[70] flex flex-col gap-2',
        isAdmin
          ? 'bottom-6 end-6 w-[min(360px,92vw)]'
          : 'bottom-[86px] left-1/2 w-[min(420px,92vw)] -translate-x-1/2',
      )}
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-2xl px-3.5 py-3 text-white shadow-lg animate-slide-up',
              STYLES[toast.type],
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/25">
              <Icon className="size-3.5" strokeWidth={3} />
            </span>
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-5">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  dismissToast(toast.id)
                }}
                className="shrink-0 rounded-lg bg-white/20 px-2.5 py-1 text-[12px] font-bold hover:bg-white/30"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-white/20"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

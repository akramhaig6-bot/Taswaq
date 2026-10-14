import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { uid } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  action?: ToastAction
  duration: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  showToast: (message: string, options?: { type?: ToastType; action?: ToastAction; duration?: number }) => string
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, options) => {
      const id = uid('toast')
      const duration = options?.duration ?? (options?.action ? 5000 : 3000)
      setToasts((prev) => [...prev.slice(-2), { id, message, type: options?.type ?? 'success', action: options?.action, duration }])
      window.setTimeout(() => dismissToast(id), duration)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

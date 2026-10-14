import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

function useEscapeAndLock(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

const FRAME_MAX = 'max-w-[var(--app-width)]'

/* ------------------------------- Modal ------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}) {
  useEscapeAndLock(open, onClose)
  if (!open) return null
  const width = {
    sm: 'max-w-[380px]',
    md: 'max-w-[440px]',
    lg: 'max-w-[560px]',
    xl: 'max-w-[820px]',
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        className={cn(
          'relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl animate-slide-up',
          width,
        )}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="thin-scroll flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-gray-100 bg-gray-50 p-3">{footer}</div>}
      </div>
    </div>
  )
}

/* ----------------------------- Bottom Sheet ----------------------------- */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEscapeAndLock(open, onClose)
  const startY = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl animate-sheet-up',
          FRAME_MAX,
        )}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
      >
        <div
          className="flex cursor-grab flex-col items-center pt-2.5 pb-1"
          onTouchStart={(event) => {
            startY.current = event.touches[0].clientY
          }}
          onTouchMove={(event) => {
            if (startY.current === null) return
            const delta = event.touches[0].clientY - startY.current
            if (delta > 0) setDragY(delta)
          }}
          onTouchEnd={() => {
            if (dragY > 110) onClose()
            setDragY(0)
            startY.current = null
          }}
        >
          <span className="h-1.5 w-10 rounded-full bg-gray-300" onClick={onClose} />
        </div>
        {title && (
          <div className="flex items-center justify-between gap-3 px-4 pb-2">
            <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="thin-scroll flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && (
          <div
            className="border-t border-gray-100 bg-white p-3"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------- Confirm Dialog ---------------------------- */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-[360px] overflow-hidden rounded-2xl bg-white p-4 shadow-xl animate-slide-up">
        {title && <h3 className="mb-1 text-[15px] font-bold text-gray-900">{title}</h3>}
        {message && <p className="text-[13px] leading-6 text-gray-600">{message}</p>}
        {children}
        <div className="mt-4 flex gap-2">
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Dropdown ------------------------------- */
export function Dropdown({
  trigger,
  children,
  align = 'end',
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'end'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 min-w-44 overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg animate-fade-in',
            align === 'end' ? 'end-0' : 'start-0',
            className,
          )}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  children,
  onClick,
  danger,
  icon,
  active,
}: {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
  icon?: ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] transition-colors',
        danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 hover:bg-gray-100',
        active && 'bg-brand-soft font-semibold text-brand',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

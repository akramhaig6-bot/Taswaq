import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'dark' | 'gold'
type Size = 'xs' | 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark shadow-xs',
  outline: 'border border-brand text-brand bg-white hover:bg-brand-soft',
  ghost: 'text-gray-600 hover:bg-gray-100',
  soft: 'bg-brand-soft text-brand hover:bg-brand/15',
  danger: 'bg-danger text-white hover:brightness-95',
  dark: 'bg-ink text-white hover:brightness-110',
  gold: 'bg-gold text-white hover:brightness-95',
}

const SIZES: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1 rounded-lg',
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-2xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconEnd,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98]',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <span className="spinner block size-4 rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        icon
      )}
      {children}
      {!loading && iconEnd}
    </button>
  )
}

export function IconButton({
  children,
  className,
  badge,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { badge?: number }) {
  return (
    <button
      {...rest}
      className={cn(
        'relative inline-flex size-10 items-center justify-center rounded-full text-gray-700',
        'transition-colors hover:bg-gray-100 active:scale-95',
        className,
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

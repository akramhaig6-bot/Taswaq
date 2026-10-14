import { useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronLeft, Minus, Plus, Star, X } from 'lucide-react'
import { cn, colorFromString, formatNumber, formatPrice, initials, relativeTime, truncate } from '@/lib/utils'

/* ------------------------------- Spinner ------------------------------- */
export function Spinner({ className }: { className?: string }) {
  return <span className={cn('spinner block size-5 rounded-full border-2 border-brand/25 border-t-brand', className)} />
}

export function PageLoader({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Spinner />
      <span className="text-[12px]">{label}</span>
    </div>
  )
}

/* -------------------------------- Badges -------------------------------- */
export function Badge({
  children,
  tone = 'gray',
  className,
}: {
  children: ReactNode
  tone?: 'gray' | 'brand' | 'success' | 'danger' | 'warning' | 'gold'
  className?: string
}) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success/12 text-success',
    danger: 'bg-danger/12 text-danger',
    warning: 'bg-warning/12 text-warning',
    gold: 'bg-gold/15 text-[#b45309]',
  }[tone]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', tones, className)}>
      {children}
    </span>
  )
}

export function DiscountBadge({ percent, className }: { percent: number; className?: string }) {
  if (percent <= 0) return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white shadow-xs',
        className,
      )}
    >
      -{percent}%
    </span>
  )
}

export const ORDER_STATUS_META: Record<string, { label: string; tone: 'warning' | 'brand' | 'success' | 'danger' }> = {
  processing: { label: 'قيد المعالجة', tone: 'warning' },
  shipping: { label: 'قيد الشحن', tone: 'brand' },
  delivered: { label: 'تم التوصيل', tone: 'success' },
  cancelled: { label: 'ملغي', tone: 'danger' },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = ORDER_STATUS_META[status] ?? { label: status, tone: 'gray' as const }
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  )
}

/* ------------------------------- Rating ------------------------------- */
export function Rating({
  value,
  count,
  size = 14,
  onClick,
  className,
}: {
  value: number
  count?: number
  size?: number
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn('inline-flex items-center gap-1.5 text-start', onClick && 'cursor-pointer', className)}
    >
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            style={{ width: size, height: size }}
            className={cn(index <= Math.round(value) ? 'fill-gold text-gold' : 'text-gray-300')}
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="text-[12px] font-semibold text-gray-500">
          {value.toFixed(1)} {count > 0 && `(${formatNumber(count)} تقييم)`}
        </span>
      )}
    </button>
  )
}

const RATING_LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جدًا', 'ممتاز']

export function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            onMouseEnter={() => setHover(index)}
            onClick={() => onChange(index)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`${index} نجوم`}
          >
            <Star className={cn('size-9', index <= active ? 'fill-gold text-gold' : 'text-gray-300')} />
          </button>
        ))}
      </div>
      <span className={cn('text-[13px] font-bold', active ? 'text-gold' : 'text-gray-400')}>
        {active ? RATING_LABELS[active] : 'اختر تقييمك'}
      </span>
    </div>
  )
}

/* -------------------------------- Price -------------------------------- */
export function PriceTag({
  price,
  compareAtPrice,
  currency = 'ر.س',
  size = 'md',
  showSavings = false,
  className,
}: {
  price: number
  compareAtPrice?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSavings?: boolean
  className?: string
}) {
  const hasDiscount = Boolean(compareAtPrice && compareAtPrice > price)
  const sizes = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-lg',
    xl: 'text-2xl',
  }[size]
  const oldSizes = { sm: 'text-[11px]', md: 'text-[12px]', lg: 'text-[13px]', xl: 'text-sm' }[size]
  const saved = hasDiscount ? (compareAtPrice as number) - price : 0
  const percent = hasDiscount ? Math.round((saved / (compareAtPrice as number)) * 100) : 0

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-extrabold', hasDiscount ? 'text-danger' : 'text-gray-900', sizes)}>
        {formatPrice(price, currency)}
      </span>
      {hasDiscount && (
        <span className={cn('text-gray-400 line-through', oldSizes)}>{formatPrice(compareAtPrice as number, currency)}</span>
      )}
      {showSavings && hasDiscount && (
        <span className="w-full text-[12px] font-semibold text-success">
          وفّرت {formatPrice(saved, currency)} ({percent}%)
        </span>
      )}
    </div>
  )
}

/* --------------------------- Quantity Stepper --------------------------- */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  onExceedMax,
  onMinReached,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  onExceedMax?: (max: number) => void
  /** يُستدعى عند الضغط على (-) والكمية عند الحد الأدنى (لإظهار تأكيد الإزالة) */
  onMinReached?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const btn = size === 'sm' ? 'size-7' : 'size-9'
  const text = size === 'sm' ? 'text-[13px] w-8' : 'text-sm w-11'

  const commit = () => {
    const parsed = Number(draft)
    setEditing(false)
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    if (parsed > max) {
      onChange(max)
      setDraft(String(max))
      onExceedMax?.(max)
      return
    }
    if (parsed < min) {
      onChange(min)
      setDraft(String(min))
      return
    }
    onChange(Math.floor(parsed))
    setDraft(String(Math.floor(parsed)))
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-0.5">
      <button
        type="button"
        onClick={() => {
          if (value <= min) {
            onMinReached?.()
            return
          }
          onChange(Math.max(min, value - 1))
        }}
        className={cn('flex items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-35', btn)}
        aria-label="تقليل الكمية"
      >
        <Minus className="size-4" />
      </button>
      {editing ? (
        <input
          autoFocus
          value={draft}
          inputMode="numeric"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
          }}
          className={cn('bg-transparent text-center font-bold text-gray-900 outline-none', text)}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(String(value))
            setEditing(true)
          }}
          className={cn('text-center font-bold text-gray-900', text)}
        >
          {value}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (value >= max) {
            onExceedMax?.(max)
            return
          }
          onChange(value + 1)
        }}
        disabled={value >= max}
        className={cn('flex items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-35', btn)}
        aria-label="زيادة الكمية"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

/* ------------------------------- Skeleton ------------------------------- */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('skeleton rounded-lg', className)} style={style} />
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
          <Skeleton className="size-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------ Empty state ------------------------------ */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center animate-fade-in', className)}>
      {icon && (
        <span className="flex size-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">{icon}</span>
      )}
      <h3 className="text-[15px] font-bold text-gray-800">{title}</h3>
      {body && <p className="max-w-xs text-[13px] leading-6 text-gray-500">{body}</p>}
      {action}
    </div>
  )
}

/* ----------------------------- Section header ----------------------------- */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  extra,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
  extra?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-extrabold text-gray-900">{title}</h2>
        {extra}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-0.5 text-[12.5px] font-bold text-brand hover:underline"
        >
          {actionLabel}
          <ChevronLeft className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/* -------------------------------- Avatar -------------------------------- */
export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  if (src) {
    return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: colorFromString(name), fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  )
}

/* --------------------------------- Chip --------------------------------- */
export function Chip({
  children,
  active,
  onClick,
  onRemove,
  className,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
        active ? 'border-brand bg-brand text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="flex size-4 items-center justify-center rounded-full hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}

/* --------------------------------- Tabs --------------------------------- */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'pills',
  className,
}: {
  items: Array<{ value: T; label: string; count?: number }>
  value: T
  onChange: (value: T) => void
  variant?: 'pills' | 'underline'
  className?: string
}) {
  if (variant === 'underline') {
    return (
      <div className={cn('no-scrollbar flex gap-5 overflow-x-auto border-b border-gray-200', className)}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'relative shrink-0 pb-2.5 text-[13px] font-bold transition-colors',
              item.value === value ? 'text-brand' : 'text-gray-500',
            )}
          >
            {item.label}
            {item.value === value && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className={cn('no-scrollbar flex gap-2 overflow-x-auto pb-1', className)}>
      {items.map((item) => (
        <Chip key={item.value} active={item.value === value} onClick={() => onChange(item.value)}>
          {item.label}
          {item.count !== undefined && <span className="opacity-70">({item.count})</span>}
        </Chip>
      ))}
    </div>
  )
}

/* ------------------------------- Progress ------------------------------- */
export function ProgressBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <span className={cn('block h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}>
      <span
        className={cn('block h-full rounded-full bg-brand transition-all duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </span>
  )
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-gray-100', className)} />
}

/** نص يقتطع مع زر عرض المزيد */
export function ExpandableText({ text, lines = 5, className }: { text: string; lines?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const long = text.length > 260 || text.split('\n').length > lines
  return (
    <div className={className}>
      <p
        className={cn('rich-text text-[13.5px] leading-7 text-gray-600', !expanded && long && 'line-clamp-5')}
        dangerouslySetInnerHTML={{ __html: renderRich(text) }}
      />
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[12.5px] font-bold text-brand hover:underline"
        >
          {expanded ? 'عرض أقل' : 'عرض المزيد'}
        </button>
      )}
    </div>
  )
}

/** تحويل نص بسيط (Markdown مبسّط) إلى HTML آمن */
export function renderRich(text: string): string {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const inline = (value: string) =>
    escape(value)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')

  const lines = escape(text)
    .split('\n')
    .map((line) => line.trimEnd())
  const html: string[] = []
  let inList = false

  lines.forEach((line) => {
    const trimmed = line.trim()
    const isBullet = /^[-•*]\s+/.test(trimmed)
    if (isBullet) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${inline(trimmed.replace(/^[-•*]\s+/, ''))}</li>`)
      return
    }
    if (inList) {
      html.push('</ul>')
      inList = false
    }
    if (trimmed) html.push(`<p>${inline(trimmed)}</p>`)
  })
  if (inList) html.push('</ul>')
  return html.join('') || '<p></p>'
}

export function ProductRow({
  image,
  name,
  meta,
  price,
  currency,
  onPress,
  trailing,
}: {
  image: string
  name: string
  meta?: string
  price?: number
  currency?: string
  onPress?: () => void
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={image}
        alt={name}
        onClick={onPress}
        className="size-14 shrink-0 rounded-xl border border-gray-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p onClick={onPress} className="line-clamp-2 text-[13.5px] font-semibold text-gray-800">
          {truncate(name, 70)}
        </p>
        {meta && <p className="mt-0.5 text-[11.5px] text-gray-500">{meta}</p>}
        {price !== undefined && (
          <p className="mt-0.5 text-[13px] font-bold text-gray-900">{formatPrice(price, currency)}</p>
        )}
      </div>
      {trailing}
    </div>
  )
}

export function TimeAgo({ iso }: { iso: string }) {
  return <span className="text-[11.5px] text-gray-400">{relativeTime(iso)}</span>
}

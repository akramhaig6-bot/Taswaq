import { useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronLeft, Inbox } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'

/* ------------------------------- الصفحة ------------------------------- */
export function AdminPage({
  title,
  subtitle,
  actions,
  children,
  breadcrumbs,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  breadcrumbs?: string[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-1 flex items-center gap-1 text-[11.5px] text-gray-400">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb} className="flex items-center gap-1">
                  {index > 0 && <ChevronLeft className="size-3" />}
                  {crumb}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <div>
            {title && <h2 className="text-[14px] font-extrabold text-gray-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[11.5px] text-gray-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn(padded && 'p-4')}>{children}</div>
    </section>
  )
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  onClick,
  hint,
}: {
  label: string
  value: string
  delta?: number
  icon?: ReactNode
  onClick?: () => void
  hint?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-start transition-all',
        onClick && 'hover:border-brand hover:shadow-sm',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-500">{label}</span>
        {icon && <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand">{icon}</span>}
      </div>
      <span className="text-2xl font-extrabold text-gray-900">{value}</span>
      <div className="flex items-center gap-2">
        {delta !== undefined && (
          <span className={cn('text-[11.5px] font-bold', delta >= 0 ? 'text-success' : 'text-danger')}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-[11.5px] text-gray-400">{hint}</span>}
      </div>
    </button>
  )
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}

/* ------------------------------ جدول البيانات ------------------------------ */
export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  selectable = false,
  bulkActions,
  pageSize: initialPageSize = 10,
  emptyText = 'لا توجد بيانات لعرضها.',
  renderCard,
}: {
  columns: Array<Column<T>>
  rows: T[]
  onRowClick?: (row: T) => void
  selectable?: boolean
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode
  pageSize?: number
  emptyText?: string
  /** عرض البطاقات على الشاشات الصغيرة (الجوال) بدل الجدول */
  renderCard?: (row: T) => ReactNode
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [selected, setSelected] = useState<string[]>([])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, totalPages)
  const paged = useMemo(() => rows.slice((current - 1) * pageSize, current * pageSize), [rows, current, pageSize])
  const allSelected = paged.length > 0 && paged.every((row) => selected.includes(row.id))

  const toggleAll = () => {
    if (allSelected) setSelected((prev) => prev.filter((id) => !paged.some((row) => row.id === id)))
    else setSelected((prev) => [...new Set([...prev, ...paged.map((row) => row.id)])])
  }

  const clear = () => setSelected([])

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-8" />}
        title="لا توجد بيانات"
        body={emptyText}
        className="py-8"
      />
    )
  }

  return (
    <div>
      {selectable && selected.length > 0 && bulkActions && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-brand-soft px-3 py-2">
          <span className="text-[12.5px] font-bold text-brand">تم تحديد {formatNumber(selected.length)} عنصر</span>
          <div className="flex flex-wrap items-center gap-2">{bulkActions(selected, clear)}</div>
        </div>
      )}

      {renderCard && (
        <ul className="space-y-2 sm:hidden">
          {paged.map((row) => (
            <li
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'rounded-xl border border-gray-200 bg-white p-3',
                onRowClick && 'cursor-pointer active:bg-gray-50',
              )}
            >
              {renderCard(row)}
            </li>
          ))}
        </ul>
      )}

      <div className={cn('thin-scroll -mx-4 overflow-x-auto px-4', renderCard && 'hidden sm:block')}>
        <table className="w-full min-w-[720px] border-collapse text-start">
          <thead>
            <tr className="border-b border-gray-200 text-[11.5px] text-gray-500">
              {selectable && (
                <th className="w-10 py-2.5">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={cn(
                      'flex size-5 items-center justify-center rounded-md border',
                      allSelected ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white',
                    )}
                  >
                    {allSelected && <Check className="size-3" strokeWidth={3} />}
                  </button>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap px-3 py-2.5 font-bold',
                    column.align === 'center' ? 'text-center' : column.align === 'end' ? 'text-end' : 'text-start',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => {
              const isSelected = selected.includes(row.id)
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-gray-100 text-[12.5px] transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                    isSelected && 'bg-brand-soft/50',
                  )}
                >
                  {selectable && (
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelected((prev) =>
                            prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id],
                          )
                        }}
                        className={cn(
                          'flex size-5 items-center justify-center rounded-md border',
                          isSelected ? 'border-brand bg-brand text-white' : 'border-gray-300 bg-white',
                        )}
                      >
                        {isSelected && <Check className="size-3" strokeWidth={3} />}
                      </button>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-3 py-2.5 align-middle',
                        column.align === 'center' ? 'text-center' : column.align === 'end' ? 'text-end' : 'text-start',
                        column.className,
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-gray-500">
          <span>عدد الصفوف:</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
            className="h-8 rounded-lg border border-gray-200 px-2 text-[12px]"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {formatNumber(rows.length)} عنصر — صفحة {current} من {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" disabled={current <= 1} onClick={() => setPage(current - 1)}>
            السابق
          </Button>
          <Button size="sm" variant="ghost" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
            التالي
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- الرسوم -------------------------------- */
export function LineChart({
  values,
  labels,
  height = 180,
  formatter = (value: number) => formatNumber(value),
}: {
  values: number[]
  labels: string[]
  height?: number
  formatter?: (value: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...values, 1)
  const step = 100 / Math.max(1, values.length - 1)
  const points = values.map((value, index) => ({
    x: index * step,
    y: 100 - (value / max) * 100,
    value,
  }))
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${path} L 100 100 L 0 100 Z`

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full">
          <defs>
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-brand)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--c-brand)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((line) => (
            <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="#e5e7eb" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="url(#lineFill)" />
          <path d={path} fill="none" stroke="var(--c-brand)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={hover === index ? 3.2 : 1.8}
              fill="#fff"
              stroke="var(--c-brand)"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[11px] font-bold text-white"
            style={{ left: `${points[hover].x}%`, top: `${Math.max(0, points[hover].y - 12)}%` }}
          >
            {labels[hover]}: {formatter(points[hover].value)}
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10.5px] text-gray-400">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className={cn(labels.length > 8 && index % 2 === 1 && 'hidden sm:inline')}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BarChart({
  items,
  formatter = (value: number) => formatNumber(value),
}: {
  items: Array<{ label: string; value: number; color?: string }>
  formatter?: (value: number) => string
}) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-[12px]">
            <span className="truncate font-semibold text-gray-700">{item.label}</span>
            <span className="text-gray-500">{formatter(item.value)}</span>
          </div>
          <span className="block h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <span
              className="block h-full rounded-full animate-bar-grow"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color ?? 'var(--c-brand)' }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

const DONUT_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#f59e0b', '#dc2626', '#0891b2', '#db2777', '#65a30d']

export function DonutChart({
  slices,
  size = 180,
}: {
  slices: Array<{ label: string; value: number }>
  size?: number
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {slices.map((slice, index) => {
          const fraction = slice.value / total
          const dash = fraction * circumference
          const element = (
            <circle
              key={slice.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return element
        })}
      </svg>
      <ul className="space-y-1.5">
        {slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center gap-2 text-[12px]">
            <span
              className="size-3 rounded-full"
              style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
            />
            <span className="font-semibold text-gray-700">{slice.label}</span>
            <span className="text-gray-400">
              {formatNumber(slice.value)} ({Math.round((slice.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-end text-[12.5px] font-semibold text-gray-800">{value}</span>
    </div>
  )
}

/* ==========================================================================
   أدوات مساعدة عامة
   ========================================================================== */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

export function orderNumber(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/* ------------------------------ الأرقام ------------------------------ */
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return numberFormat.format(Math.round(value * 100) / 100)
}

export function formatPrice(value: number, currency = 'ر.س'): string {
  return `${formatNumber(value)} ${currency}`
}

/** يحذف الفواصل والمسافات من أرقام الجوال */
export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '')
}

/* ------------------------------ التواريخ ------------------------------ */
export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(iso)} - ${hh}:${mm}`
}

export function dateInputValue(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins === 1) return 'منذ دقيقة'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hours = Math.floor(mins / 60)
  if (hours === 1) return 'منذ ساعة'
  if (hours < 24) return `منذ ${hours} ساعات`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'أمس'
  if (days < 30) return `منذ ${days} يوم`
  return formatDate(iso)
}

export function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/** يحسب الوقت المتبقي بشكل تنازلي */
export function remainingParts(target: string | Date) {
  const end = typeof target === 'string' ? new Date(target).getTime() : target.getTime()
  const diff = Math.max(0, end - Date.now())
  return {
    total: diff,
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff <= 0,
  }
}

/* ------------------------------ التحقق ------------------------------ */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function isPhone(value: string): boolean {
  const v = normalizePhone(value)
  return /^(?:\+?966|0)?5\d{8}$/.test(v)
}

export type PasswordStrength = 'weak' | 'medium' | 'strong'
export function passwordStrength(value: string): PasswordStrength {
  const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(value)
  const hasNumbers = /\d/.test(value)
  const hasSymbols = /[^a-zA-Z0-9\u0600-\u06FF]/.test(value)
  if (value.length >= 8 && hasLetters && hasNumbers && hasSymbols) return 'strong'
  if (value.length >= 6 && hasNumbers && (hasLetters || hasSymbols)) return 'medium'
  return 'weak'
}

/* ------------------------------ نصوص ------------------------------ */
export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max).trim()}…` : value
}

export function initials(name: string): string {
  const clean = name.trim()
  if (!clean) return '؟'
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return `${parts[0][0]}${parts[1][0]}`
}

/** قائمة ألوان ثابتة للصور الرمزية */
const AVATAR_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#0891b2',
  '#16a34a',
  '#4f46e5',
  '#b45309',
]
export function colorFromString(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 9973
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/* ------------------------------ الملفات ------------------------------ */

/** يقرأ صورة ويضغطها ويحوّلها إلى Data URL (تخزين محلي) */
export function readImageFile(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read-error'))
    reader.onload = () => {
      const src = String(reader.result)
      const img = new Image()
      img.onerror = () => resolve(src)
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(src)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const isPng = file.type === 'image/png'
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

/* ------------------------------ صيغ مجرّدة ------------------------------ */

export function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '')
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/* ---------------------- أدوات مساعدة إضافية (بحث/أسعار) ---------------------- */

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

/** يحوّل الأرقام العربية-الهندية (٠-٩) إلى لاتينية */
export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
}

/**
 * يقرأ مبلغًا مكتوبًا نصًا: يقبل الأرقام العربية، الفاصلة العشرية العربية (٫)،
 * الفواصل (1,500) ولاحقات الاختصار: k/K (ألف) و m/M (مليون).
 * مثال: "٥٠٠" → 500، "1.5k" → 1500، "2m" → 2000000
 */
export function parseAmount(value: string): number | undefined {
  if (!value) return undefined
  const normalized = toLatinDigits(value.trim())
    .replace(/[٫،]/g, '.')
    .replace(/,/g, '')
    .toLowerCase()
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(k|m|ألف|الف|مليون)?/)
  if (!match) return undefined
  const base = Number.parseFloat(match[1])
  if (Number.isNaN(base)) return undefined
  const suffix = match[2]
  const factor = suffix === 'k' || suffix === 'ألف' || suffix === 'الف' ? 1000 : suffix === 'm' || suffix === 'مليون' ? 1_000_000 : 1
  return base * factor
}

export interface HighlightPart {
  text: string
  match: boolean
}

/** يقسّم نصًا إلى أجزاء: الأجزاء المطابقة لكلمات البحث تُعلَّم لتُبرز بخط عريض */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const terms = toLatinDigits(query)
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
  if (terms.length === 0) return [{ text, match: false }]

  const lower = toLatinDigits(text).toLowerCase()
  const matched = new Array(text.length).fill(false)
  terms.forEach((term) => {
    let from = 0
    for (;;) {
      const index = lower.indexOf(term, from)
      if (index === -1) break
      for (let i = index; i < index + term.length && i < matched.length; i += 1) matched[i] = true
      from = index + term.length
    }
  })

  const parts: HighlightPart[] = []
  let buffer = ''
  let current = matched[0] ?? false
  for (let index = 0; index < text.length; index += 1) {
    if (matched[index] === current) {
      buffer += text[index]
      continue
    }
    parts.push({ text: buffer, match: current })
    buffer = text[index]
    current = matched[index]
  }
  if (buffer) parts.push({ text: buffer, match: current })
  return parts
}

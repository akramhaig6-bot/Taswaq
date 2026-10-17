/* ==========================================================================
   طبقة الخدمات (Data Gateway)
   --------------------------------------------------------------------------
   كل عملية كتابة أو قراءة حساسة تمر عبر هذه الطبقة بدل التعامل المباشر
   مع التخزين المحلي. الطبقة تتحقق من صحة البيانات، وتُحاكي زمن الاستجابة
   للشبكة، وترجع نتائج موحّدة (نجاح/خطأ) مع رسائل عربية واضحة.
   ========================================================================== */

export type ServiceStatus = 'success' | 'error'

export interface ServiceResult<T = undefined> {
  ok: boolean
  status: ServiceStatus
  data?: T
  error?: string
  /** رمز الخطأ，便于 التفريق بين الحالات (AUTH_FAILED, OUT_OF_STOCK …) */
  code?: string
}

export const serviceOk = <T>(data?: T): ServiceResult<T> => ({ ok: true, status: 'success', data })
export const serviceFail = <T>(error: string, code?: string): ServiceResult<T> => ({
  ok: false,
  status: 'error',
  error,
  code,
})

/** زمن استجابة الشبكة المحاكى (مللي ثانية) */
export const NETWORK_LATENCY = { min: 140, max: 340 }

/** التأخير المحاكى + محاكاة انقطاع الشبكة */
export function wait(min = NETWORK_LATENCY.min, max = NETWORK_LATENCY.max): Promise<void> {
  const delay = min + Math.random() * Math.max(0, max - min)
  return new Promise((resolve) => window.setTimeout(resolve, delay))
}

/** يتحقق من الاتصال قبل تنفيذ أي عملية */
export function assertOnline(): ServiceResult {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return serviceFail('لا يوجد اتصال بالإنترنت. تحقّق من اتصالك وحاول مرة أخرى.', 'OFFLINE')
  }
  return { ok: true, status: 'success' }
}

/** يولّد رقم طلب تسلسليًا يتبع آخر رقم في النظام */
export function nextOrderNumber(currentNumbers: string[]): string {
  const highest = currentNumbers.reduce((max, value) => {
    const digits = Number.parseInt(value.replace(/\D/g, ''), 10)
    return Number.isFinite(digits) && digits > max ? digits : max
  }, 100000)
  return `SQ-${highest + 1}`
}

/** يتحقق من صحة رقم الجوال السعودي */
export function isValidPhone(value: string): boolean {
  return /^(?:0|\+966)?5\d{8}$/.test(value.replace(/[\s-]/g, ''))
}

/** يتحقق من صحة البريد الإلكتروني */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/** كلمة مرور قوية بما يكفي */
export function isValidPassword(value: string): boolean {
  return value.length >= 6
}

/** عدد الأيام منذ تاريخ ISO */
export function daysSince(iso: string): number {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return Number.POSITIVE_INFINITY
  return Math.floor((Date.now() - time) / 86400000)
}

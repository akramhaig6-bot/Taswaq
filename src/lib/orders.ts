/* ==========================================================================
   أدوات الطلبات (الخط الزمني، الحالات، أسباب الإلغاء)
   ========================================================================== */
import type { Order, OrderStatus, TimelineStep } from '@/types'

export const ORDER_STEPS: Array<{ key: string; label: string }> = [
  { key: 'received', label: 'تم استلام الطلب' },
  { key: 'preparing', label: 'قيد التجهيز' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'out', label: 'خرج للتوصيل' },
  { key: 'delivered', label: 'تم التوصيل' },
]

/** يبني الخط الزمني لطلب جديد أو قديم حسب حالته */
export function buildTimeline(status: OrderStatus, createdAt: string): TimelineStep[] {
  if (status === 'cancelled') {
    return [
      { key: 'received', label: 'تم استلام الطلب', at: createdAt, done: true },
      { key: 'cancelled', label: 'تم إلغاء الطلب', at: new Date().toISOString(), done: true },
    ]
  }
  const reached = status === 'processing' ? 2 : status === 'shipping' ? 4 : 5
  return ORDER_STEPS.map((step, index) => ({
    ...step,
    done: index < reached,
    at:
      index < reached
        ? new Date(new Date(createdAt).getTime() + index * 26 * 3600000).toISOString()
        : undefined,
  }))
}

export const ORDER_STATUS_TABS: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'الكل' },
  { value: 'processing', label: 'قيد المعالجة' },
  { value: 'shipping', label: 'قيد الشحن' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'cancelled', label: 'ملغاة' },
]

export const CANCEL_REASONS = ['تغيير الرأي', 'وجدت سعرًا أفضل', 'تأخر الشحن', 'خطأ في العنوان', 'أخرى...']

export function paymentStatusLabel(order: Order): string {
  if (order.paymentStatus === 'refunded') return 'تم استرجاع المبلغ'
  if (order.paymentStatus === 'paid') return 'مدفوع'
  return order.paymentMethodId === 'pm-cod' ? 'في انتظار الدفع عند الاستلام' : 'في انتظار الدفع'
}

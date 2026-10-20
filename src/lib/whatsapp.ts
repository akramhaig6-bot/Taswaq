/* ==========================================================================
   التواصل عبر واتساب
   --------------------------------------------------------------------------
   كل روابط واتساب في واجهة العميل تمر من هنا، حتى لا يتكرر الرقم في الواجهة
   ولا يظهر نصًا للعميل إطلاقًا. الرقم الافتراضي يُستخدم إذا لم يُضبط رقم
   المتجر من لوحة الإدارة.
   ========================================================================== */
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'

/** الرقم الرسمي للمتجر (بدون علامة +) */
export const DEFAULT_WHATSAPP_NUMBER = '966574028968'

/** يحوّل أي صيغة محلية أو دولية إلى صيغة واتساب الدولية (9665xxxxxxxx) */
export function normalizeWhatsAppNumber(value?: string): string {
  const digits = (value ?? '').replace(/\D/g, '')
  if (!digits) return DEFAULT_WHATSAPP_NUMBER
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('966')) return digits
  if (digits.startsWith('0')) return `966${digits.slice(1)}`
  if (digits.length === 9 && digits.startsWith('5')) return `966${digits}`
  return digits
}

/** يبني رابط محادثة واتساب مع رسالة جاهزة (لا يُعرض الرقم في الواجهة) */
export function whatsappUrl(message?: string, number?: string): string {
  const phone = normalizeWhatsAppNumber(number)
  const text = message?.trim()
  return text ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/${phone}`
}

/**
 * يفتح واتساب في تبويب جديد، مع بديل عبر رابط مباشر إذا منع المتصفح النوافذ.
 * لا يُرجع الرقم أو يعرضه في أي مكان.
 */
export function openWhatsApp(message?: string, number?: string): void {
  const url = whatsappUrl(message, number)

  try {
    const opened = window.open(url, '_blank')
    if (opened) {
      try {
        opened.opener = null
      } catch {
        /* تجاهل قيود المتصفح */
      }
      return
    }
  } catch {
    /* بعض المتصفحات تمنع النوافذ المنبثقة — نستخدم الرابط المباشر */
  }

  try {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch {
    try {
      window.location.href = url
    } catch {
      /* تجاهل */
    }
  }
}

/** رسالة جاهزة لتأكيد طلب كامل عبر واتساب */
export function buildOrderMessage(
  order: Order,
  options: { storeName: string; currency: string },
): string {
  const lines: string[] = [
    `مرحبًا ${options.storeName}، أود تأكيد طلبي:`,
    `رقم الطلب: #${order.number}`,
    `الاسم: ${order.customerName}`,
    `الجوال: ${order.customerPhone}`,
  ]

  if (order.address) {
    const { city, district, street } = order.address
    lines.push(`العنوان: ${[city, district, street].filter(Boolean).join('، ')}`)
  }

  if (order.shippingMethod) lines.push(`طريقة التسليم: ${order.shippingMethod}`)

  lines.push('', 'المنتجات:')
  order.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity, options.currency)}`,
    )
  })

  if (order.discount > 0) lines.push(`الخصم: - ${formatPrice(order.discount, options.currency)}`)
  if (order.shipping > 0) lines.push(`الشحن: ${formatPrice(order.shipping, options.currency)}`)
  if (order.tax > 0) lines.push(`الضريبة: ${formatPrice(order.tax, options.currency)}`)
  lines.push(`الإجمالي: ${formatPrice(order.total, options.currency)}`)

  if (order.note) lines.push('', `ملاحظة: ${order.note}`)

  return lines.join('\n')
}

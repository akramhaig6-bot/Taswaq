/* ==========================================================================
   حسابات الأسعار والخصومات (السلة / الدفع / الطلبات)
   ========================================================================== */
import type { CartItem, Coupon, Order, PaymentMethodSetting, Product, Settings } from '@/types'

export interface PriceBreakdown {
  subtotal: number
  discount: number
  shipping: number
  codFee: number
  tax: number
  total: number
}

export function productOptionValues(product: Product, options: Record<string, string> = {}) {
  return product.options
    .map((option) => {
      const valueId = options[option.id]
      const value = option.values.find((v) => v.id === valueId)
      return value ? { option, value } : null
    })
    .filter(Boolean) as Array<{ option: Product['options'][number]; value: Product['options'][number]['values'][number] }>
}

export function optionsLabel(product: Product, options: Record<string, string> = {}): string {
  return productOptionValues(product, options)
    .map(({ option, value }) => `${option.label}: ${value.label}`)
    .join(' | ')
}

/** سعر الوحدة مع فروق أسعار الخيارات */
export function unitPrice(product: Product, options: Record<string, string> = {}): number {
  const delta = productOptionValues(product, options).reduce((sum, item) => sum + (item.value.priceDelta ?? 0), 0)
  return product.price + delta
}

export function isDiscountActive(product: Product): boolean {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return false
  const now = Date.now()
  if (product.discountStart && new Date(product.discountStart).getTime() > now) return false
  if (product.discountEnd && new Date(product.discountEnd).getTime() < now) return false
  return true
}

export function discountPercent(product: Product): number {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
}

export function isOutOfStock(product: Product): boolean {
  if (!product.trackStock) return false
  return product.stock <= 0 && !product.allowBackorder
}

export function isLowStock(product: Product, threshold = 5): boolean {
  return product.trackStock && product.stock > 0 && product.stock <= threshold
}

export interface CouponResult {
  valid: boolean
  discount: number
  message?: string
}

/** يتحقق من صلاحية كود الخصم ويحسب قيمته */
export function validateCoupon(coupon: Coupon | undefined, subtotal: number): CouponResult {
  if (!coupon) return { valid: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' }
  if (!coupon.active) return { valid: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' }
  const now = Date.now()
  if (coupon.startDate && new Date(coupon.startDate).getTime() > now)
    return { valid: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' }
  if (coupon.endDate && new Date(coupon.endDate).getTime() < now)
    return { valid: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية.' }
  if (coupon.minOrder && subtotal < coupon.minOrder)
    return { valid: false, discount: 0, message: `الحد الأدنى لاستخدام الكود هو ${coupon.minOrder} ر.س` }
  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  discount = Math.min(discount, subtotal)
  return { valid: true, discount: Math.round(discount) }
}

export interface TotalsInput {
  items: CartItem[]
  products: Product[]
  coupon?: Coupon
  settings: Settings
  shippingMethodId?: string
  paymentMethodId?: string
}

/** يحسب كل مبالغ الطلب */
export function computeTotals({
  items,
  products,
  coupon,
  settings,
  shippingMethodId,
  paymentMethodId,
}: TotalsInput): PriceBreakdown & { coupon?: CouponResult } {
  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return null
      return { item, product, line: unitPrice(product, item.options) * item.quantity }
    })
    .filter(Boolean) as Array<{ item: CartItem; product: Product; line: number }>

  const subtotal = lines.reduce((sum, l) => sum + l.line, 0)

  const couponResult = coupon ? validateCoupon(coupon, subtotal) : undefined
  const discount = couponResult?.valid ? couponResult.discount : 0

  const method =
    settings.shipping.methods.find((m) => m.id === shippingMethodId && m.enabled) ??
    settings.shipping.methods.find((m) => m.enabled)

  let shipping = method?.fee ?? 0
  if (settings.shipping.freeOver > 0 && subtotal >= settings.shipping.freeOver) shipping = 0
  if (subtotal === 0) shipping = 0

  const payment: PaymentMethodSetting | undefined = settings.paymentMethods.find((p) => p.id === paymentMethodId)
  const codFee = payment?.kind === 'cod' ? payment.extraFee ?? settings.codFee : 0

  const taxable = Math.max(0, subtotal - discount)
  const tax = settings.tax.enabled ? Math.round((taxable * settings.tax.rate) / 100) : 0

  const total = Math.max(0, subtotal - discount + shipping + codFee + tax)

  return { subtotal, discount, shipping, codFee, tax, total, coupon: couponResult }
}

/** يعيد حساب ملخص مبالغ طلب محفوظ */
export function orderTotals(order: Order): PriceBreakdown {
  return {
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    codFee: order.codFee,
    tax: order.tax,
    total: order.total,
  }
}

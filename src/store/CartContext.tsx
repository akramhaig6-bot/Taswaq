import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Coupon, Product } from '@/types'
import { computeTotals, optionsLabel, unitPrice, validateCoupon, type CouponResult, type PriceBreakdown } from '@/lib/pricing'
import { clamp, uid } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'
import { readStorage, writeStorage } from '@/store/persist'

interface CartValue {
  items: CartItem[]
  count: number
  couponCode: string | null
  coupon?: Coupon
  totals: PriceBreakdown & { coupon?: CouponResult }
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  restoreItem: (item: CartItem) => void
  clearCart: () => void
  applyCoupon: (code: string) => CouponResult
  removeCoupon: () => void
  itemOptionsLabel: (item: CartItem) => string
  itemUnitPrice: (item: CartItem) => number
  maxQuantity: (item: CartItem) => number
}

const CartContext = createContext<CartValue | null>(null)

function sameSelection(a: CartItem, productId: string, options: Record<string, string>): boolean {
  if (a.productId !== productId) return false
  const keysA = Object.keys(a.options).sort()
  const keysB = Object.keys(options).sort()
  if (keysA.length !== keysB.length) return false
  return keysA.every((key, index) => key === keysB[index] && a.options[key] === options[key])
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, coupons, settings } = useAppData()
  const [items, setItems] = useState<CartItem[]>(() => readStorage<CartItem[]>('cart', []))
  const [couponCode, setCouponCode] = useState<string | null>(() => readStorage<string | null>('cart.coupon', null))

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    writeStorage('cart', next)
  }, [])

  const persistCoupon = useCallback((code: string | null) => {
    setCouponCode(code)
    writeStorage('cart.coupon', code)
  }, [])

  const maxQuantity = useCallback(
    (item: CartItem) => {
      const product = products.items.find((p) => p.id === item.productId)
      if (!product || !product.trackStock) return 99
      return Math.max(1, product.stock)
    },
    [products.items],
  )

  const addToCart = useCallback<CartValue['addToCart']>(
    (product, quantity = 1, options = {}) => {
      setItems((prev) => {
        const existing = prev.find((item) => sameSelection(item, product.id, options))
        let next: CartItem[]
        if (existing) {
          const limit = product.trackStock ? Math.max(1, product.stock) : 99
          next = prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: clamp(item.quantity + quantity, 1, limit) } : item,
          )
        } else {
          next = [...prev, { id: uid('ci'), productId: product.id, quantity: Math.max(1, quantity), options }]
        }
        writeStorage('cart', next)
        return next
      })
    },
    [],
  )

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return
      const limit = maxQuantity(item)
      persist(items.map((i) => (i.id === itemId ? { ...i, quantity: clamp(quantity, 1, limit) } : i)))
    },
    [items, maxQuantity, persist],
  )

  const removeItem = useCallback((itemId: string) => persist(items.filter((i) => i.id !== itemId)), [items, persist])

  const restoreItem = useCallback((item: CartItem) => persist([...items, item]), [items, persist])

  const clearCart = useCallback(() => {
    persist([])
    persistCoupon(null)
  }, [persist, persistCoupon])

  const coupon = useMemo(
    () => coupons.items.find((c) => c.code.toLowerCase() === (couponCode ?? '').toLowerCase()),
    [coupons.items, couponCode],
  )

  const applyCoupon = useCallback<CartValue['applyCoupon']>(
    (code) => {
      const found = coupons.items.find((c) => c.code.toLowerCase() === code.trim().toLowerCase())
      const subtotal = items.reduce((sum, item) => {
        const product = products.items.find((p) => p.id === item.productId)
        return sum + (product ? unitPrice(product, item.options) * item.quantity : 0)
      }, 0)
      const result = validateCoupon(found, subtotal)
      if (result.valid) persistCoupon(found?.code ?? null)
      return result
    },
    [coupons.items, items, products.items, persistCoupon],
  )

  const removeCoupon = useCallback(() => persistCoupon(null), [persistCoupon])

  const itemOptionsLabel = useCallback(
    (item: CartItem) => {
      const product = products.items.find((p) => p.id === item.productId)
      return product ? optionsLabel(product, item.options) : ''
    },
    [products.items],
  )

  const itemUnitPrice = useCallback(
    (item: CartItem) => {
      const product = products.items.find((p) => p.id === item.productId)
      return product ? unitPrice(product, item.options) : 0
    },
    [products.items],
  )

  const totals = useMemo(
    () => computeTotals({ items, products: products.items, coupon, settings }),
    [items, products.items, coupon, settings],
  )

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const value = useMemo<CartValue>(
    () => ({
      items,
      count,
      couponCode,
      coupon,
      totals,
      addToCart,
      updateQuantity,
      removeItem,
      restoreItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      itemOptionsLabel,
      itemUnitPrice,
      maxQuantity,
    }),
    [
      items,
      count,
      couponCode,
      coupon,
      totals,
      addToCart,
      updateQuantity,
      removeItem,
      restoreItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      itemOptionsLabel,
      itemUnitPrice,
      maxQuantity,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

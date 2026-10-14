import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ShoppingCart, Tag, Ticket, Trash2 } from 'lucide-react'
import type { CartItem } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { isOutOfStock } from '@/lib/pricing'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { EmptyState, PriceTag, QuantityStepper } from '@/components/ui/display'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useCart } from '@/store/CartContext'
import { useLang } from '@/store/LanguageContext'
import { useToast } from '@/store/ToastContext'
import { useAuth } from '@/store/AuthContext'

export default function Cart() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { settings, products } = useAppData()
  const { items, count, totals, updateQuantity, removeItem, restoreItem, applyCoupon, removeCoupon, coupon, itemOptionsLabel, itemUnitPrice, maxQuantity } = useCart()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [applying, setApplying] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<{ item: CartItem; reason: 'quantity' | 'button' } | null>(null)

  /** إزالة فورية (بالسحب لليسار) مع إمكانية التراجع */
  const removeWithUndo = (item: CartItem) => {
    removeItem(item.id)
    showToast('تم إزالة المنتج من السلة', {
      type: 'info',
      action: { label: 'تراجع', onClick: () => restoreItem(item) },
    })
  }

  const lines = useMemo(
    () =>
      items.map((item) => ({
        item,
        product: products.items.find((product) => product.id === item.productId),
      })),
    [items, products.items],
  )

  const hasUnavailable = lines.some((line) => !line.product || line.product.status !== 'published' || isOutOfStock(line.product))

  const onApplyCoupon = () => {
    if (!code.trim()) {
      setCodeError('يرجى إدخال كود الخصم.')
      return
    }
    setApplying(true)
    window.setTimeout(() => {
      const result = applyCoupon(code)
      setApplying(false)
      if (result.valid) {
        setCodeError('')
        setCode('')
        showToast('تم تطبيق كود الخصم بنجاح.', { type: 'success' })
      } else {
        setCodeError(result.message ?? 'كود الخصم غير صالح أو منتهي الصلاحية.')
      }
    }, 600)
  }

  const summary = (
    <div className="rounded-2xl bg-gray-50 p-3.5">
      <ul className="space-y-1.5">
        <li className="flex items-center justify-between text-[12.5px] text-gray-600">
          <span>المجموع الفرعي</span>
          <span className="font-semibold text-gray-800">{formatPrice(totals.subtotal, settings.currency)}</span>
        </li>
        {totals.discount > 0 && (
          <li className="flex items-center justify-between text-[12.5px] text-success">
            <span>الخصم {coupon && `(${coupon.code})`}</span>
            <span className="font-semibold">- {formatPrice(totals.discount, settings.currency)}</span>
          </li>
        )}
        <li className="flex items-center justify-between text-[12.5px] text-gray-600">
          <span>رسوم الشحن</span>
          {totals.shipping === 0 ? (
            <span className="font-semibold text-success">مجاني</span>
          ) : (
            <span className="font-semibold text-gray-800">{formatPrice(totals.shipping, settings.currency)}</span>
          )}
        </li>
        {settings.tax.enabled && (
          <li className="flex items-center justify-between text-[12.5px] text-gray-600">
            <span>الضريبة ({settings.tax.rate}%)</span>
            <span className="font-semibold text-gray-800">{formatPrice(totals.tax, settings.currency)}</span>
          </li>
        )}
      </ul>
      <div className="my-2.5 h-px bg-gray-200" />
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-bold text-gray-800">المجموع الكلي</span>
        <span className="text-[16px] font-extrabold text-gray-900">{formatPrice(totals.total, settings.currency)}</span>
      </div>
      {settings.shipping.freeOver > 0 && totals.subtotal < settings.shipping.freeOver && (
        <p className="mt-2 rounded-xl bg-white px-2.5 py-1.5 text-[11.5px] text-gray-500">
          أضف بقيمة {formatPrice(settings.shipping.freeOver - totals.subtotal, settings.currency)} للحصول على شحن مجاني.
        </p>
      )}
    </div>
  )

  if (items.length === 0) {
    return (
      <Screen
        header={
          <PageHeader
            title={`${t('cart.title', 'سلة التسوق')} (0)`}
            actions={
              <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
                تسوق
              </Button>
            }
          />
        }
      >
        <EmptyState
          icon={<ShoppingCart className="size-9" />}
          title={t('empty.cart.title', 'سلتك فارغة')}
          body={t('empty.cart.body', 'ابدأ بتصفح المنتجات وأضف ما يعجبك إلى السلة.')}
          action={<Button onClick={() => navigate('/')}>{t('empty.cart.cta', 'تصفح المنتجات')}</Button>}
        />
      </Screen>
    )
  }

  return (
    <Screen
      header={<PageHeader title={`${t('cart.title', 'سلة التسوق')} (${count})`} />}
      footer={
        <div className="shrink-0 border-t border-gray-100 bg-white p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] text-gray-500">المجموع الكلي</p>
              <p className="text-[16px] font-extrabold text-gray-900">{formatPrice(totals.total, settings.currency)}</p>
            </div>
            <Button
              size="lg"
              disabled={hasUnavailable}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: '/checkout' } })
                  return
                }
                navigate('/checkout')
              }}
            >
              {t('cart.checkout', 'إتمام الطلب')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3 p-4">
        {hasUnavailable && (
          <div className="flex items-start gap-2 rounded-xl bg-danger/10 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-[12px] font-semibold leading-6 text-danger">
              بعض المنتجات في سلتك لم تعد متوفرة. يرجى مراجعة السلة.
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-400">اسحب المنتج لليسار لحذفه بسرعة</p>

        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {lines.map(({ item, product }) => {
            const unavailable = !product || product.status !== 'published' || isOutOfStock(product)
            return (
              <li key={item.id}>
                <SwipeableRow onDelete={() => removeWithUndo(item)} disabled={false}>
                  {unavailable && (
                    <span className="absolute inset-0 z-10 flex items-center justify-center bg-danger/10 text-[13px] font-extrabold text-danger">
                      غير متوفر
                    </span>
                  )}
                  <div className="flex gap-3">
                    <img
                      src={product?.images[0]}
                      alt={product?.name}
                      onClick={() => product && navigate(`/product/${product.id}`)}
                      className="size-20 shrink-0 cursor-pointer rounded-xl border border-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => product && navigate(`/product/${product.id}`)}
                          className="line-clamp-2 text-start text-[13px] font-semibold text-gray-800"
                        >
                          {product?.name ?? 'منتج محذوف'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingRemove({ item, reason: 'button' })}
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger"
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[11.5px] text-gray-500">{itemOptionsLabel(item)}</p>
                      <div className="mt-1">
                        <PriceTag
                          price={itemUnitPrice(item)}
                          compareAtPrice={product && product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : undefined}
                          currency={settings.currency}
                          size="sm"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          max={maxQuantity(item)}
                          onChange={(value) => {
                            if (value < 1) return
                            updateQuantity(item.id, value)
                          }}
                          onMinReached={() => setPendingRemove({ item, reason: 'quantity' })}
                          onExceedMax={(max) => showToast(`الكمية المتوفرة ${max} فقط`, { type: 'warning' })}
                        />
                        <span className="text-[13.5px] font-extrabold text-gray-900">
                          {formatPrice(itemUnitPrice(item) * item.quantity, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwipeableRow>
              </li>
            )
          })}
        </ul>

        {/* كوبون الخصم */}
        <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
          <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
            <Ticket className="size-4 text-brand" /> كود الخصم
          </h3>
          {coupon ? (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-success/10 px-3 py-2.5">
              <span className="text-[12.5px] font-bold text-success">
                ✓ تم تطبيق كود الخصم: {coupon.code} (
                {coupon.type === 'percent' ? `خصم ${coupon.value}%` : `خصم ${coupon.value} ${settings.currency}`})
              </span>
              <button
                type="button"
                onClick={() => {
                  removeCoupon()
                  showToast('تم إزالة كود الخصم.', { type: 'info' })
                }}
                className="text-[12px] font-bold text-danger"
              >
                إزالة
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase())
                    setCodeError('')
                  }}
                  placeholder={t('cart.couponPlaceholder', 'أدخل كود الخصم')}
                  className={cn(
                    'h-11 flex-1 rounded-xl border bg-white px-3 text-[13px] uppercase outline-none',
                    codeError ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand',
                  )}
                />
                <Button loading={applying} onClick={onApplyCoupon} icon={<Tag className="size-4" />}>
                  تطبيق
                </Button>
              </div>
              {codeError && <p className="mt-1.5 text-[12px] font-semibold text-danger">{codeError}</p>}
            </>
          )}
        </section>

        {summary}
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="إزالة منتج"
        message={
          pendingRemove?.reason === 'quantity'
            ? 'الكمية الحالية 1 — هل تريد إزالة هذا المنتج من السلة؟'
            : 'هل تريد إزالة هذا المنتج من السلة؟'
        }
        confirmLabel="إزالة"
        danger
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (!pendingRemove) return
          removeWithUndo(pendingRemove.item)
          setPendingRemove(null)
        }}
      />
    </Screen>
  )
}

/* --------------------------------------------------------------------------
   صف قابل للسحب لليسار (Swipe to Delete) — حسب الوثيقة (9.2):
   السحب لليسار يُظهر زر "حذف"، والضغط عليه يحذف مباشرة مع Toast فيه "تراجع".
   -------------------------------------------------------------------------- */
function SwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode
  onDelete: () => void
  disabled?: boolean
}) {
  const startX = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)
  const REVEAL = 88

  const onTouchStart = (event: React.TouchEvent) => {
    startX.current = event.touches[0]?.clientX ?? null
  }
  const onTouchMove = (event: React.TouchEvent) => {
    if (startX.current === null) return
    const delta = (event.touches[0]?.clientX ?? 0) - startX.current
    /* RTL: السحب لليسار يعني delta سالب */
    setOffset(Math.max(-REVEAL, Math.min(0, delta)))
  }
  const onTouchEnd = () => {
    setOffset((value) => (value < -REVEAL / 2 ? -REVEAL : 0))
    startX.current = null
  }

  return (
    <div className="relative overflow-hidden bg-danger/90">
      <button
        type="button"
        onClick={() => {
          setOffset(0)
          onDelete()
        }}
        className={cn(
          'absolute inset-y-0 end-0 flex w-[88px] flex-col items-center justify-center gap-1 bg-danger text-[11.5px] font-bold text-white transition-opacity',
          offset === 0 && 'pointer-events-none opacity-0',
        )}
      >
        <Trash2 className="size-4" />
        حذف
      </button>
      <div
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)`, touchAction: 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative p-3">{children}</div>
      </div>
    </div>
  )
}

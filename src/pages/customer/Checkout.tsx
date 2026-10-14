import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, Landmark, Wallet, Banknote, Plus, ShieldCheck } from 'lucide-react'
import type { Address, Order } from '@/types'
import { buildTimeline } from '@/lib/orders'
import { cn, formatPrice, orderNumber } from '@/lib/utils'
import { computeTotals, optionsLabel, unitPrice } from '@/lib/pricing'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { AddressCard, AddressFormModal } from '@/components/customer/AddressModals'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input } from '@/components/ui/form'
import { ConfirmDialog } from '@/components/ui/overlay'
import { Badge } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'

const STEPS = [
  { id: 1, label: 'العنوان' },
  { id: 2, label: 'الدفع' },
  { id: 3, label: 'المراجعة' },
]

const PAYMENT_ICONS = {
  cod: Banknote,
  card: CreditCard,
  wallet: Wallet,
  bank: Landmark,
} as const

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, addAddress, updateAddress } = useAuth()
  const { settings, products, orders, coupons, pushNotification } = useAppData()
  const { items, coupon, clearCart } = useCart()
  const { showToast } = useToast()

  const enabledPayments = useMemo(() => settings.paymentMethods.filter((method) => method.enabled), [settings.paymentMethods])
  const enabledShipping = useMemo(() => settings.shipping.methods.filter((method) => method.enabled), [settings.shipping.methods])

  const [step, setStep] = useState(1)
  const [addressId, setAddressId] = useState('')
  const [addressModal, setAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [paymentId, setPaymentId] = useState(enabledPayments[0]?.id ?? '')
  const [shippingId, setShippingId] = useState(enabledShipping[0]?.id ?? '')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', save: false })
  const [note, setNote] = useState('')
  const [agree, setAgree] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [leaveConfirm, setLeaveConfirm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true })
      return
    }
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [isAuthenticated, items.length, navigate])

  useEffect(() => {
    const defaultAddress = user?.addresses.find((address) => address.isDefault) ?? user?.addresses[0]
    if (defaultAddress) setAddressId(defaultAddress.id)
    else if (user && user.addresses.length === 0) setAddressModal(true)
  }, [user])

  const totals = useMemo(
    () => computeTotals({ items, products: products.items, coupon, settings, shippingMethodId: shippingId, paymentMethodId: paymentId }),
    [items, products.items, coupon, settings, shippingId, paymentId],
  )

  const address = user?.addresses.find((item) => item.id === addressId)
  const payment = enabledPayments.find((method) => method.id === paymentId)
  const shippingMethod = enabledShipping.find((method) => method.id === shippingId)
  const cardComplete =
    payment?.kind !== 'card' ||
    (card.number.replace(/\s/g, '').length === 16 && card.name.trim().length >= 3 && /^\d{2}\/\d{2}$/.test(card.expiry) && card.cvv.length >= 3)

  const dirty = step > 1 || card.number.length > 0 || note.length > 0

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
      return
    }
    if (dirty) setLeaveConfirm(true)
    else navigate('/cart')
  }

  const placeOrder = () => {
    if (!agree || !address || !payment) return
    setPlacing(true)
    setError('')

    window.setTimeout(() => {
      /* رفض بطاقات الاختبار التي تبدأ بـ 4000 */
      if (payment.kind === 'card' && card.number.replace(/\s/g, '').startsWith('4000')) {
        setPlacing(false)
        setError('فشلت عملية الدفع. تحقق من بيانات البطاقة وحاول مرة أخرى.')
        return
      }

      const lineItems = items
        .map((item) => {
          const product = products.items.find((p) => p.id === item.productId)
          if (!product) return null
          return {
            id: `oi-${item.id}`,
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price: unitPrice(product, item.options),
            quantity: item.quantity,
            optionsLabel: optionsLabel(product, item.options) || undefined,
          }
        })
        .filter(Boolean) as Order['items']

      const order: Order = {
        id: `o-${Date.now().toString(36)}`,
        number: orderNumber(),
        customerId: user?.id,
        customerName: address.fullName,
        customerEmail: user?.email ?? '',
        customerPhone: address.phone,
        items: lineItems,
        address,
        paymentMethodId: payment.id,
        paymentMethodName: payment.name,
        paymentStatus: payment.kind === 'cod' || payment.kind === 'bank' ? 'pending' : 'paid',
        shippingMethod: shippingMethod?.name ?? 'توصيل',
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: coupon?.code,
        shipping: totals.shipping,
        codFee: totals.codFee,
        tax: totals.tax,
        total: totals.total,
        status: 'processing',
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        note: note || undefined,
        createdAt: new Date().toISOString(),
        timeline: buildTimeline('processing', new Date().toISOString()),
      }

      orders.add(order)

      /* تحديث المخزون والمبيعات */
      items.forEach((item) => {
        const product = products.items.find((p) => p.id === item.productId)
        if (product?.trackStock) {
          products.update(product.id, {
            stock: Math.max(0, product.stock - item.quantity),
            sales: product.sales + item.quantity,
          })
        }
      })

      if (coupon) coupons.update(coupon.id, { usedCount: coupon.usedCount + 1 })

      pushNotification({
        type: 'order',
        title: 'تم استلام طلبك',
        body: `تم استلام طلبك رقم #${order.number} وسنبدأ بتجهيزه.`,
        target: `/orders/${order.id}`,
      })
      pushNotification({
        type: 'order',
        title: 'طلب جديد',
        body: `طلب جديد من ${order.customerName} بقيمة ${formatPrice(order.total, settings.currency)}.`,
        forAdmin: true,
        target: `/admin/orders/${order.id}`,
      })

      clearCart()
      setPlacing(false)
      navigate(`/order-success/${order.id}`, { replace: true })
    }, 1200)
  }

  return (
    <Screen
      header={
        <PageHeader
          title="إتمام الطلب"
          onBack={goBack}
          actions={<Badge tone="brand"><ShieldCheck className="size-3" /> دفع آمن</Badge>}
        >
          {/* مؤشر الخطوات */}
          <div className="flex items-center gap-1.5 px-4 pb-3">
            {STEPS.map((item, index) => {
              const done = step > item.id
              const active = step === item.id
              return (
                <div key={item.id} className="flex flex-1 items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                        done ? 'bg-success text-white' : active ? 'bg-brand text-white' : 'border border-gray-300 text-gray-400',
                      )}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : item.id}
                    </span>
                    <span className={cn('text-[11.5px] font-bold', active ? 'text-gray-900' : 'text-gray-400')}>
                      {item.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <span className={cn('h-0.5 flex-1 rounded-full', done ? 'bg-success' : 'bg-gray-200')} />
                  )}
                </div>
              )
            })}
          </div>
        </PageHeader>
      }
      footer={
        <div className="shrink-0 border-t border-gray-100 bg-white p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={goBack}>
                رجوع
              </Button>
            )}
            {step === 1 && (
              <Button
                size="lg"
                fullWidth
                disabled={!addressId}
                onClick={() => setStep(2)}
              >
                متابعة إلى الدفع
              </Button>
            )}
            {step === 2 && (
              <Button size="lg" fullWidth disabled={!paymentId || !cardComplete} onClick={() => setStep(3)}>
                متابعة إلى المراجعة
              </Button>
            )}
            {step === 3 && (
              <Button size="lg" fullWidth loading={placing} disabled={!agree} onClick={placeOrder}>
                تأكيد الطلب — {formatPrice(totals.total, settings.currency)}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        {error && (
          <div className="rounded-xl bg-danger/10 p-3">
            <p className="text-[12.5px] font-semibold text-danger">{error}</p>
            <button type="button" onClick={() => setStep(2)} className="mt-1 text-[12px] font-bold text-brand underline">
              العودة إلى خطوة الدفع
            </button>
          </div>
        )}

        {/* ------------------------- الخطوة 1: العنوان ------------------------- */}
        {step === 1 && (
          <>
            <section>
              <h2 className="mb-2 text-[14px] font-extrabold text-gray-900">عنوان الشحن</h2>
              {user?.addresses.length ? (
                <div className="space-y-2">
                  {user.addresses.map((item) => (
                    <AddressCard
                      key={item.id}
                      address={item}
                      selected={addressId === item.id}
                      onSelect={() => setAddressId(item.id)}
                      onEdit={() => {
                        setEditingAddress(item)
                        setAddressModal(true)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-300 p-4 text-center text-[12.5px] text-gray-500">
                  لم تضف أي عنوان بعد. أضف عنوانك الأول لإكمال الطلب.
                </p>
              )}
              <Button
                variant="outline"
                fullWidth
                className="mt-3"
                icon={<Plus className="size-4" />}
                onClick={() => {
                  setEditingAddress(null)
                  setAddressModal(true)
                }}
              >
                إضافة عنوان جديد
              </Button>
            </section>

            <section>
              <h2 className="mb-2 text-[14px] font-extrabold text-gray-900">طريقة الشحن</h2>
              <div className="space-y-2">
                {enabledShipping.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setShippingId(method.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors',
                      shippingId === method.id ? 'border-brand bg-brand-soft/50' : 'border-gray-200',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full border',
                        shippingId === method.id ? 'border-brand' : 'border-gray-300',
                      )}
                    >
                      {shippingId === method.id && <span className="size-2.5 rounded-full bg-brand" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold text-gray-800">{method.name}</span>
                      {method.eta && <span className="block text-[11.5px] text-gray-500">مدة التوصيل: {method.eta}</span>}
                    </span>
                    <span className="text-[13px] font-bold text-gray-900">
                      {method.fee === 0 ? 'مجاني' : formatPrice(method.fee, settings.currency)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ------------------------- الخطوة 2: الدفع ------------------------- */}
        {step === 2 && (
          <>
            <section>
              <h2 className="mb-2 text-[14px] font-extrabold text-gray-900">طريقة الدفع</h2>
              {enabledPayments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-300 p-4 text-center text-[12.5px] text-gray-500">
                  لا توجد طرق دفع متاحة حاليًا. يرجى المحاولة لاحقًا.
                </p>
              ) : (
                <div className="space-y-2">
                  {enabledPayments.map((method) => {
                    const Icon = PAYMENT_ICONS[method.kind]
                    const active = paymentId === method.id
                    return (
                      <div key={method.id}>
                        <button
                          type="button"
                          onClick={() => setPaymentId(method.id)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-colors',
                            active ? 'border-brand bg-brand-soft/50' : 'border-gray-200',
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-5 items-center justify-center rounded-full border',
                              active ? 'border-brand' : 'border-gray-300',
                            )}
                          >
                            {active && <span className="size-2.5 rounded-full bg-brand" />}
                          </span>
                          <span className={cn('flex size-9 items-center justify-center rounded-xl', active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500')}>
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-bold text-gray-800">{method.name}</span>
                            {method.description && <span className="block text-[11.5px] text-gray-500">{method.description}</span>}
                            {method.kind === 'cod' && (method.extraFee ?? settings.codFee) > 0 && (
                              <span className="mt-0.5 block text-[11.5px] font-semibold text-warning">
                                + {formatPrice(method.extraFee ?? settings.codFee, settings.currency)} رسوم إضافية
                              </span>
                            )}
                          </span>
                        </button>

                        {active && method.kind === 'card' && (
                          <div className="mt-2 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <Input
                              label="رقم البطاقة"
                              inputMode="numeric"
                              placeholder="0000 0000 0000 0000"
                              value={card.number}
                              onChange={(event) => setCard({ ...card, number: formatCardNumber(event.target.value) })}
                            />
                            <Input
                              label="اسم حامل البطاقة"
                              placeholder="الاسم كما يظهر على البطاقة"
                              value={card.name}
                              onChange={(event) => setCard({ ...card, name: event.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                label="تاريخ الانتهاء"
                                placeholder="MM/YY"
                                inputMode="numeric"
                                value={card.expiry}
                                onChange={(event) => setCard({ ...card, expiry: formatExpiry(event.target.value) })}
                              />
                              <Input
                                label="CVV"
                                placeholder="123"
                                inputMode="numeric"
                                maxLength={4}
                                value={card.cvv}
                                onChange={(event) => setCard({ ...card, cvv: event.target.value.replace(/\D/g, '') })}
                                hint="3 أرقام خلف البطاقة"
                              />
                            </div>
                            <Checkbox
                              checked={card.save}
                              onChange={(checked) => setCard({ ...card, save: checked })}
                              label="حفظ البطاقة للمرات القادمة"
                            />
                          </div>
                        )}

                        {active && method.kind === 'bank' && (
                          <div className="mt-2 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                            <p className="text-[12.5px] font-bold text-gray-800">تفاصيل الحساب البنكي</p>
                            <p className="mt-1 text-[12px] leading-6 text-gray-600">{method.bankDetails}</p>
                            {method.instructions && <p className="mt-1 text-[11.5px] text-gray-500">{method.instructions}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <p className="flex items-center gap-1.5 text-[11.5px] text-gray-500">
              <ShieldCheck className="size-3.5 text-success" />
              جميع المدفوعات مشفّرة وآمنة.
            </p>
          </>
        )}

        {/* ------------------------ الخطوة 3: المراجعة ------------------------ */}
        {step === 3 && (
          <>
            <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-800">عنوان الشحن</h3>
                <button type="button" onClick={() => setStep(1)} className="text-[12px] font-bold text-brand">
                  تعديل
                </button>
              </div>
              <p className="mt-1 text-[12.5px] leading-6 text-gray-600">
                {address?.fullName} — {address?.phone}
                <br />
                {address?.city}، {address?.district}، {address?.street}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-800">طريقة الدفع</h3>
                <button type="button" onClick={() => setStep(2)} className="text-[12px] font-bold text-brand">
                  تعديل
                </button>
              </div>
              <p className="mt-1 text-[12.5px] text-gray-600">
                {payment?.name}
                {payment?.kind === 'card' && card.number && ` — **** ${card.number.slice(-4)}`}
              </p>
              <p className="mt-1 text-[12px] text-gray-500">الشحن: {shippingMethod?.name}</p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
              <h3 className="mb-2 text-[13px] font-bold text-gray-800">المنتجات ({items.length})</h3>
              <ul className="space-y-3">
                {items.map((item) => {
                  const product = products.items.find((p) => p.id === item.productId)
                  if (!product) return null
                  return (
                    <li key={item.id} className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="size-12 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[12.5px] font-semibold text-gray-800">{product.name}</p>
                        <p className="text-[11.5px] text-gray-500">الكمية: {item.quantity}</p>
                      </div>
                      <span className="text-[12.5px] font-bold text-gray-900">
                        {formatPrice(product.price * item.quantity, settings.currency)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="rounded-2xl bg-gray-50 p-3.5">
              <ul className="space-y-1.5 text-[12.5px] text-gray-600">
                <li className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold">{formatPrice(totals.subtotal, settings.currency)}</span>
                </li>
                {totals.discount > 0 && (
                  <li className="flex justify-between text-success">
                    <span>الخصم {coupon && `(${coupon.code})`}</span>
                    <span className="font-semibold">- {formatPrice(totals.discount, settings.currency)}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>رسوم الشحن</span>
                  <span className="font-semibold">
                    {totals.shipping === 0 ? 'مجاني' : formatPrice(totals.shipping, settings.currency)}
                  </span>
                </li>
                {totals.codFee > 0 && (
                  <li className="flex justify-between">
                    <span>رسوم الدفع عند الاستلام</span>
                    <span className="font-semibold">{formatPrice(totals.codFee, settings.currency)}</span>
                  </li>
                )}
                {settings.tax.enabled && (
                  <li className="flex justify-between">
                    <span>الضريبة ({settings.tax.rate}%)</span>
                    <span className="font-semibold">{formatPrice(totals.tax, settings.currency)}</span>
                  </li>
                )}
              </ul>
              <div className="my-2.5 h-px bg-gray-200" />
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-bold text-gray-800">المجموع الكلي</span>
                <span className="text-[16px] font-extrabold text-gray-900">{formatPrice(totals.total, settings.currency)}</span>
              </div>
            </section>

            <section>
              <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">ملاحظات على الطلب (اختياري)</label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="أضف ملاحظة على الطلب (اختياري)..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-[13px] outline-none focus:border-brand"
              />
            </section>

            <Checkbox
              checked={agree}
              onChange={setAgree}
              label="أوافق على شروط الطلب وسياسة الاسترجاع، وأؤكد صحة بيانات الطلب."
            />
          </>
        )}
      </div>

      <AddressFormModal
        open={addressModal}
        onClose={() => setAddressModal(false)}
        address={editingAddress}
        onSave={(value) => {
          if (value.id) updateAddress(value.id, value)
          else {
            const created = addAddress({ ...value })
            setAddressId(created.id)
          }
          showToast('تم حفظ العنوان بنجاح.', { type: 'success' })
        }}
      />

      <ConfirmDialog
        open={leaveConfirm}
        title="هل تريد الرجوع؟"
        message="ستفقد البيانات غير المحفوظة."
        confirmLabel="رجوع"
        cancelLabel="البقاء"
        danger
        onCancel={() => setLeaveConfirm(false)}
        onConfirm={() => {
          setLeaveConfirm(false)
          navigate('/cart')
        }}
      />
    </Screen>
  )
}

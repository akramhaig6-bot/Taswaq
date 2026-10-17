import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Copy, Download, ExternalLink, Headphones, Package, RotateCcw, Star, X } from 'lucide-react'
import type { Product } from '@/types'
import { CANCEL_REASONS, paymentStatusLabel } from '@/lib/orders'
import { cn, copyToClipboard, formatDate, formatDateTime, formatPrice } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { ReviewModal } from '@/components/customer/Reviews'
import { SupportModal } from '@/components/customer/SupportModal'
import { Button } from '@/components/ui/Button'
import { EmptyState, PriceTag, StatusBadge } from '@/components/ui/display'
import { Modal } from '@/components/ui/overlay'
import { Select } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import { useService } from '@/store/ServiceContext'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'

function downloadDeliveryContent(title: string, content: string) {
  const safeName = title.trim().replace(/[^a-zA-Z0-9\u0600-\u06ff-]+/g, '-').replace(/^-|-$/g, '') || 'delivery-content'
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName}.txt`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function OrderDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { orders, settings, products } = useAppData()
  const service = useService()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const order = orders.items.find((item) => item.id === id)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState(CANCEL_REASONS[0])
  const [rateOpen, setRateOpen] = useState(false)
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [supportOpen, setSupportOpen] = useState(false)

  if (!order) {
    return (
      <Screen header={<PageHeader title="تفاصيل الطلب" backTo="/orders" />}>
        <EmptyState icon={<Package className="size-9" />} title="لم يتم العثور على هذا الطلب" />
      </Screen>
    )
  }

  const cancelOrder = async () => {
    setCancelling(true)
    const result = await service.cancelOrder(order.id, reason)
    setCancelling(false)
    if (!result.ok) {
      showToast(result.error ?? 'تعذّر إلغاء الطلب. حاول مرة أخرى.', { type: 'error' })
      return
    }
    setCancelOpen(false)
    showToast('تم إلغاء طلبك بنجاح.', { type: 'success' })
  }

  const reorder = () => {
    let added = 0
    order.items.forEach((item) => {
      const product = products.items.find((p) => p.id === item.productId)
      if (product && product.status === 'published' && (!product.trackStock || product.stock > 0)) {
        addToCart(product, item.quantity, {})
        added += 1
      }
    })
    if (added) {
      showToast(`تمت إضافة ${added} منتجات إلى السلة.`, {
        type: 'success',
        action: { label: 'عرض السلة', onClick: () => navigate('/cart') },
      })
      navigate('/cart')
    } else {
      showToast('المنتجات غير متوفرة حاليًا.', { type: 'error' })
    }
  }

  const currentStepIndex = order.timeline.findIndex((step) => !step.done)

  return (
    <Screen
      header={<PageHeader title={`الطلب #${order.number}`} backTo="/orders" actions={<StatusBadge status={order.status} />} />}
      footer={
        <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {order.status === 'processing' && (
            <Button variant="outline" fullWidth className="text-danger border-danger" onClick={() => setCancelOpen(true)}>
              إلغاء الطلب
            </Button>
          )}
          {order.status === 'delivered' && (
            <div className="flex gap-2">
              <Button fullWidth icon={<RotateCcw className="size-4" />} onClick={reorder}>
                إعادة الطلب
              </Button>
              <Button fullWidth variant="outline" icon={<Star className="size-4" />} onClick={() => setRateOpen(true)}>
                تقييم المنتجات
              </Button>
            </div>
          )}
          <Button variant="ghost" fullWidth icon={<Headphones className="size-4" />} onClick={() => setSupportOpen(true)}>
            تواصل مع الدعم
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        {/* الخط الزمني */}
        <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
          <h3 className="mb-3 text-[14px] font-extrabold text-gray-900">حالة الطلب</h3>
          <ol className="space-y-0">
            {order.timeline.map((step, index) => {
              const isCurrent = order.status !== 'cancelled' && index === currentStepIndex
              const isCancelled = step.key === 'cancelled'
              return (
                <li key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full text-white',
                        isCancelled ? 'bg-danger' : step.done ? 'bg-success' : isCurrent ? 'bg-brand animate-pulse-soft' : 'border border-gray-300 bg-white',
                      )}
                    >
                      {isCancelled ? (
                        <X className="size-3.5" strokeWidth={3} />
                      ) : step.done ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : (
                        <span className={cn('size-2 rounded-full', isCurrent ? 'bg-white' : 'bg-gray-300')} />
                      )}
                    </span>
                    {index < order.timeline.length - 1 && (
                      <span className={cn('my-1 w-0.5 flex-1', step.done ? 'bg-success' : 'bg-gray-200')} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={cn('text-[13px] font-bold', step.done || isCurrent ? 'text-gray-800' : 'text-gray-400')}>
                      {step.label}
                    </p>
                    {step.at && <p className="mt-0.5 text-[11.5px] text-gray-500">{formatDateTime(step.at)}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
          {order.cancelReason && (
            <p className="mt-1 rounded-xl bg-danger/10 px-3 py-2 text-[12px] text-danger">
              سبب الإلغاء: {order.cancelReason}
            </p>
          )}
        </section>

        {/* معلومات التسليم */}
        <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
          <h3 className="mb-2 text-[14px] font-extrabold text-gray-900">{order.address ? 'معلومات الشحن' : 'معلومات التسليم'}</h3>
          <p className="text-[12.5px] leading-6 text-gray-600">
            {order.address ? <>{order.address.fullName} — {order.address.phone}<br />{order.address.city}، {order.address.district}، {order.address.street}{order.address.building ? `، مبنى ${order.address.building}` : ''}</> : 'تسليم رقمي أو تنفيذ خدمة؛ ستظهر التفاصيل ضمن متابعة الطلب.'}
          </p>
          <dl className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-[12px]">
            <div className="flex justify-between">
              <dt className="text-gray-500">{order.address ? 'طريقة الشحن' : 'طريقة التسليم'}</dt>
              <dd className="font-semibold text-gray-800">{order.shippingMethod ?? (order.address ? 'توصيل' : 'إلكتروني / خدمة')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{order.address ? 'التوصيل المتوقع' : 'موعد التنفيذ المتوقع'}</dt>
              <dd className="font-semibold text-gray-800">{order.expectedDelivery ? formatDate(order.expectedDelivery) : 'سيتم التنسيق قريبًا'}</dd>
            </div>
            {order.shippingCompany && (
              <div className="flex justify-between">
                <dt className="text-gray-500">شركة الشحن</dt>
                <dd className="font-semibold text-gray-800">{order.shippingCompany}</dd>
              </div>
            )}
            {order.trackNumber && (
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">رقم التتبع</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {order.trackNumber}
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(order.trackNumber ?? '')
                      showToast(ok ? 'تم نسخ رقم التتبع.' : 'تعذّر النسخ.', { type: ok ? 'success' : 'error' })
                    }}
                    className="text-brand"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* المنتجات */}
        <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
          <h3 className="mb-3 text-[14px] font-extrabold text-gray-900">المنتجات ({order.items.length})</h3>
          <ul className="space-y-3">
            {order.items.map((item) => {
              const content = item.deliveryInstructions?.trim()
              const contentUrl = content && /^https?:\/\/\S+$/i.test(content) ? content : ''
              const deliveryType = item.kind === 'digital' || item.kind === 'service'
              return (
                <li key={item.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => navigate(`/product/${item.productId}`)}
                      className="size-14 shrink-0 cursor-pointer rounded-xl border border-gray-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="line-clamp-2 cursor-pointer text-[12.5px] font-semibold text-gray-800"
                      >
                        {item.name}
                      </p>
                      {item.optionsLabel && <p className="text-[11px] text-gray-500">{item.optionsLabel}</p>}
                      <p className="text-[11.5px] text-gray-500">الكمية: {item.quantity}</p>
                    </div>
                    <span className="text-[12.5px] font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity, settings.currency)}
                    </span>
                  </div>
                  {deliveryType && (
                    <div className="rounded-xl border border-brand/10 bg-brand-soft/40 p-3">
                      <p className="text-[12px] font-bold text-brand">{item.kind === 'digital' ? 'المحتوى الرقمي' : 'تعليمات تنفيذ الخدمة'}</p>
                      {order.paymentStatus !== 'paid' ? (
                        <p className="mt-1 text-[11.5px] leading-5 text-gray-600">ستظهر تفاصيل التسليم بعد تأكيد الدفع.</p>
                      ) : content ? (
                        <>
                          {contentUrl ? (
                            <a href={contentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-brand underline">
                              فتح المحتوى الرقمي <ExternalLink className="size-3.5" />
                            </a>
                          ) : (
                            <p className="mt-1 whitespace-pre-wrap break-words text-[11.5px] leading-6 text-gray-700">{content}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button size="xs" variant="outline" icon={<Copy className="size-3.5" />} onClick={async () => {
                              const copied = await copyToClipboard(content)
                              showToast(copied ? 'تم نسخ تفاصيل التسليم.' : 'تعذّر النسخ.', { type: copied ? 'success' : 'error' })
                            }}>نسخ المحتوى</Button>
                            {!contentUrl && <Button size="xs" variant="ghost" icon={<Download className="size-3.5" />} onClick={() => downloadDeliveryContent(item.name, content)}>تنزيل ملف نصي</Button>}
                          </div>
                        </>
                      ) : (
                        <p className="mt-1 text-[11.5px] leading-5 text-gray-600">سيتم التنسيق معك لتسليم المحتوى أو استكمال الخدمة.</p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* ملخص المبالغ */}
        <section className="rounded-2xl bg-gray-50 p-3.5">
          <ul className="space-y-1.5 text-[12.5px] text-gray-600">
            <li className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span className="font-semibold">{formatPrice(order.subtotal, settings.currency)}</span>
            </li>
            {order.discount > 0 && (
              <li className="flex justify-between text-success">
                <span>الخصم {order.couponCode && `(${order.couponCode})`}</span>
                <span className="font-semibold">- {formatPrice(order.discount, settings.currency)}</span>
              </li>
            )}
            <li className="flex justify-between">
              <span>رسوم الشحن</span>
              <span className="font-semibold">
                {order.shipping === 0 ? 'مجاني' : formatPrice(order.shipping, settings.currency)}
              </span>
            </li>
            {order.codFee > 0 && (
              <li className="flex justify-between">
                <span>رسوم الدفع عند الاستلام</span>
                <span className="font-semibold">{formatPrice(order.codFee, settings.currency)}</span>
              </li>
            )}
            {order.tax > 0 && (
              <li className="flex justify-between">
                <span>الضريبة</span>
                <span className="font-semibold">{formatPrice(order.tax, settings.currency)}</span>
              </li>
            )}
          </ul>
          <div className="my-2.5 h-px bg-gray-200" />
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-bold text-gray-800">المجموع الكلي</span>
            <PriceTag price={order.total} currency={settings.currency} size="lg" />
          </div>
        </section>

        {/* طريقة الدفع */}
        <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
          <h3 className="mb-1.5 text-[14px] font-extrabold text-gray-900">طريقة الدفع</h3>
          <p className="text-[12.5px] text-gray-600">{order.paymentMethodName}</p>
          <p className="mt-1 text-[12px] font-semibold text-gray-500">{paymentStatusLabel(order)}</p>
        </section>

        {order.note && (
          <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
            <h3 className="mb-1.5 text-[14px] font-extrabold text-gray-900">ملاحظات الطلب</h3>
            <p className="text-[12.5px] leading-6 text-gray-600">{order.note}</p>
          </section>
        )}
      </div>

      {/* إلغاء الطلب */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="إلغاء الطلب"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="danger" fullWidth loading={cancelling} onClick={cancelOrder}>
              تأكيد الإلغاء
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setCancelOpen(false)}>
              تراجع
            </Button>
          </div>
        }
      >
        <p className="mb-3 text-[13px] text-gray-600">هل تريد إلغاء هذا الطلب؟</p>
        <Select
          label="سبب الإلغاء (اختياري)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          options={CANCEL_REASONS.map((item) => ({ value: item, label: item }))}
        />
      </Modal>

      {/* تقييم المنتجات */}
      <Modal open={rateOpen} onClose={() => setRateOpen(false)} title="تقييم منتجات الطلب">
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  const product = products.items.find((p) => p.id === item.productId)
                  if (!product) {
                    showToast('هذا المنتج لم يعد متاحًا.', { type: 'error' })
                    return
                  }
                  setRateOpen(false)
                  setReviewProduct(product)
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-2.5 text-start hover:border-brand"
              >
                <img src={item.image} alt={item.name} className="size-11 rounded-lg object-cover" />
                <span className="line-clamp-2 flex-1 text-[12.5px] font-semibold text-gray-800">{item.name}</span>
                <Star className="size-4 text-gold" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      {reviewProduct && (
        <ReviewModal open onClose={() => setReviewProduct(null)} product={reviewProduct} />
      )}

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </Screen>
  )
}

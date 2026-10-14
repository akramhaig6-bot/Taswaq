import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, Copy, Mail, Printer, RefreshCw, Save, Send } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { CANCEL_REASONS, ORDER_STATUS_TABS, paymentStatusLabel } from '@/lib/orders'
import { copyToClipboard, formatDate, formatDateTime, formatPrice } from '@/lib/utils'
import { AdminPage, Card, FieldRow } from '@/components/admin/AdminUI'
import { Badge, Button, EmptyState, StatusBadge } from '@/components/ui'
import { Input, Select, Textarea } from '@/components/ui/form'
import { Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminOrderDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { orders, settings, pushNotification } = useAppData()
  const { showToast } = useToast()

  const order = orders.items.find((item) => item.id === id)
  const [tracking, setTracking] = useState(order?.trackNumber ?? '')
  const [company, setCompany] = useState(order?.shippingCompany ?? '')
  const [internalNote, setInternalNote] = useState(order?.internalNote ?? '')
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [reason, setReason] = useState(CANCEL_REASONS[0])

  if (!order) {
    return (
      <AdminPage title="تفاصيل الطلب" breadcrumbs={['لوحة الإدارة', 'الطلبات']}>
        <EmptyState title="لم يتم العثور على الطلب" action={<Button onClick={() => navigate('/admin/orders')}>عودة للطلبات</Button>} />
      </AdminPage>
    )
  }

  const saveShipping = () => {
    orders.update(order.id, { trackNumber: tracking || undefined, shippingCompany: company || undefined })
    showToast('تم حفظ بيانات الشحنة.', { type: 'success' })
  }

  const saveInternalNote = () => {
    orders.update(order.id, { internalNote })
    showToast('تم حفظ الملاحظة الداخلية.', { type: 'success' })
  }

  const changeStatus = (status: OrderStatus) => {
    orders.update(order.id, { status })
    pushNotification({
      type: 'order',
      title: 'تحديث حالة الطلب',
      body: `تم تحديث حالة الطلب #${order.number} إلى ${ORDER_STATUS_TABS.find((tab) => tab.value === status)?.label}.`,
      target: `/orders/${order.id}`,
    })
    showToast('تم تحديث حالة الطلب.', { type: 'success' })
  }

  return (
    <AdminPage
      title={`الطلب #${order.number}`}
      subtitle={`${formatDateTime(order.createdAt)} — ${order.customerName}`}
      breadcrumbs={['لوحة الإدارة', 'الطلبات', `#${order.number}`]}
      actions={
        <>
          <StatusBadge status={order.status} />
          <Button variant="outline" icon={<Printer className="size-4" />} onClick={() => setInvoiceOpen(true)}>
            طباعة الفاتورة
          </Button>
          <Button
            variant="outline"
            icon={<Mail className="size-4" />}
            onClick={() => {
              pushNotification({
                type: 'order',
                title: 'تحديث من المتجر',
                body: `تم إرسال تحديث عن حالة الطلب #${order.number} إلى العميل عبر البريد الإلكتروني.`,
                target: `/orders/${order.id}`,
              })
              showToast('تم إرسال تحديث للعميل.', { type: 'success' })
            }}
          >
            إرسال تحديث للعميل
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="المنتجات" subtitle={`${order.items.length} منتج`}>
            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5">
                  <img src={item.image} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[12.5px] font-semibold text-gray-800">{item.name}</p>
                    {item.optionsLabel && <p className="text-[11px] text-gray-500">{item.optionsLabel}</p>}
                    <p className="text-[11.5px] text-gray-500">
                      {formatPrice(item.price, settings.currency)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-[12.5px] font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity, settings.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
              <FieldRow label="المجموع الفرعي" value={formatPrice(order.subtotal, settings.currency)} />
              {order.discount > 0 && (
                <FieldRow
                  label={`الخصم ${order.couponCode ?? ''}`}
                  value={<span className="text-success">- {formatPrice(order.discount, settings.currency)}</span>}
                />
              )}
              <FieldRow
                label="رسوم الشحن"
                value={order.shipping === 0 ? 'مجاني' : formatPrice(order.shipping, settings.currency)}
              />
              {order.codFee > 0 && <FieldRow label="رسوم الدفع عند الاستلام" value={formatPrice(order.codFee, settings.currency)} />}
              {order.tax > 0 && <FieldRow label="الضريبة" value={formatPrice(order.tax, settings.currency)} />}
              <FieldRow label="المجموع الكلي" value={<span className="text-[15px] font-extrabold">{formatPrice(order.total, settings.currency)}</span>} />
            </div>
          </Card>

          <Card title="سجل تغييرات الحالة" subtitle="Timeline">
            <ol className="space-y-3">
              {order.timeline.map((step) => (
                <li key={step.key} className="flex items-start gap-3">
                  <span className={`mt-1 size-2.5 shrink-0 rounded-full ${step.done ? 'bg-success' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-[12.5px] font-semibold text-gray-800">{step.label}</p>
                    {step.at && <p className="text-[11px] text-gray-400">{formatDateTime(step.at)}</p>}
                  </div>
                </li>
              ))}
            </ol>
            {order.cancelReason && (
              <p className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-[12px] text-danger">سبب الإلغاء: {order.cancelReason}</p>
            )}
          </Card>

          <Card title="الفاتورة" subtitle="معاينة سريعة">
            <div id="invoice-print" className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-[16px] font-extrabold text-brand">{settings.storeName}</p>
                  <p className="text-[11.5px] text-gray-500">{settings.contact.address}</p>
                  <p className="text-[11.5px] text-gray-500">
                    {settings.contact.phone} — {settings.contact.email}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-[12.5px] font-bold text-gray-800">فاتورة #{order.number}</p>
                  <p className="text-[11.5px] text-gray-500">{formatDate(order.createdAt)}</p>
                  <p className="text-[11.5px] text-gray-500">طريقة الدفع: {order.paymentMethodName}</p>
                </div>
              </div>
              <p className="mb-3 text-[11.5px] text-gray-600">
                العميل: {order.customerName} — {order.customerPhone}
                <br />
                العنوان: {order.address.city}، {order.address.district}، {order.address.street}
              </p>
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="border-y border-gray-200 bg-gray-50 text-gray-500">
                    <th className="py-1.5 text-start">المنتج</th>
                    <th className="py-1.5 text-center">الكمية</th>
                    <th className="py-1.5 text-end">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-700">{item.name}</td>
                      <td className="py-1.5 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-1.5 text-end text-gray-700">{formatPrice(item.price * item.quantity, settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 ms-auto w-56">
                <FieldRow label="المجموع الفرعي" value={formatPrice(order.subtotal, settings.currency)} />
                <FieldRow label="الخصم" value={formatPrice(order.discount, settings.currency)} />
                <FieldRow label="الشحن" value={formatPrice(order.shipping, settings.currency)} />
                <FieldRow label="الضريبة" value={formatPrice(order.tax, settings.currency)} />
                <FieldRow label="الإجمالي" value={<strong>{formatPrice(order.total, settings.currency)}</strong>} />
              </div>
              <p className="mt-3 text-center text-[11px] text-gray-400">
                {settings.copyright} — شكرًا لتسوقك معنا
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="إدارة الطلب">
            <div className="space-y-3">
              <Select
                label="حالة الطلب"
                value={order.status}
                onChange={(event) => changeStatus(event.target.value as OrderStatus)}
                options={ORDER_STATUS_TABS.filter((tab) => tab.value !== 'all').map((tab) => ({ value: tab.value, label: tab.label }))}
              />
              <Input
                label="رقم تتبع الشحنة"
                value={tracking}
                onChange={(event) => setTracking(event.target.value)}
                placeholder="SWQ000000"
              />
              <Input
                label="شركة الشحن"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="أرامكس، سمسا..."
              />
              <Button fullWidth icon={<Save className="size-4" />} onClick={saveShipping}>
                حفظ بيانات الشحنة
              </Button>

              <div className="flex gap-2">
                {order.paymentStatus === 'paid' && (
                  <Button variant="outline" fullWidth icon={<RefreshCw className="size-4" />} onClick={() => setRefundOpen(true)}>
                    استرجاع المبلغ
                  </Button>
                )}
                {order.status !== 'cancelled' && (
                  <Button variant="outline" fullWidth className="border-danger text-danger" icon={<Ban className="size-4" />} onClick={() => setCancelOpen(true)}>
                    إلغاء الطلب
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card title="بيانات العميل">
            <FieldRow label="الاسم" value={order.customerName} />
            <FieldRow label="الجوال" value={order.customerPhone} />
            <FieldRow label="البريد" value={order.customerEmail || '—'} />
            <FieldRow
              label="العنوان"
              value={`${order.address.city}، ${order.address.district}، ${order.address.street}`}
            />
            {order.address.building && <FieldRow label="المبنى" value={order.address.building} />}
            {order.address.postalCode && <FieldRow label="الرمز البريدي" value={order.address.postalCode} />}
            <FieldRow label="حالة الدفع" value={<Badge tone={order.paymentStatus === 'paid' ? 'success' : 'warning'}>{paymentStatusLabel(order)}</Badge>} />
            <FieldRow label="طريقة الشحن" value={order.shippingMethod} />
            <FieldRow label="التوصيل المتوقع" value={order.expectedDelivery ? formatDate(order.expectedDelivery) : '—'} />
            <FieldRow
              label="رقم التتبع"
              value={
                order.trackNumber ? (
                  <span className="flex items-center gap-1.5">
                    {order.trackNumber}
                    <button
                      type="button"
                      onClick={async () => {
                        await copyToClipboard(order.trackNumber ?? '')
                        showToast('تم النسخ.', { type: 'success' })
                      }}
                      className="text-brand"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  '—'
                )
              }
            />
            {order.note && <FieldRow label="ملاحظة العميل" value={order.note} />}
          </Card>

          <Card title="ملاحظة داخلية" subtitle="لا تظهر للعميل">
            <Textarea
              value={internalNote}
              onChange={(event) => setInternalNote(event.target.value)}
              placeholder="أضف ملاحظة داخلية عن الطلب..."
              rows={3}
            />
            <Button className="mt-2" fullWidth variant="outline" icon={<Save className="size-4" />} onClick={saveInternalNote}>
              حفظ الملاحظة
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title={`فاتورة الطلب #${order.number}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button fullWidth icon={<Printer className="size-4" />} onClick={() => window.print()}>
              طباعة
            </Button>
            <Button
              variant="outline"
              fullWidth
              icon={<Mail className="size-4" />}
              onClick={() => showToast('تم إرسال الفاتورة إلى بريد العميل.', { type: 'success' })}
            >
              إرسال بالبريد
            </Button>
          </div>
        }
      >
        <p className="text-[12.5px] leading-6 text-gray-600">
          يمكنك طباعة الفاتورة مباشرة من هنا. يتم إخفاء بقية عناصر الواجهة أثناء الطباعة تلقائيًا.
        </p>
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="إلغاء الطلب"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                orders.update(order.id, {
                  status: 'cancelled',
                  cancelReason: reason,
                  timeline: [
                    { key: 'received', label: 'تم استلام الطلب', at: order.createdAt, done: true },
                    { key: 'cancelled', label: 'تم إلغاء الطلب', at: new Date().toISOString(), done: true },
                  ],
                })
                pushNotification({
                  type: 'order',
                  title: 'تم إلغاء طلبك',
                  body: `تم إلغاء الطلب #${order.number}. سبب الإلغاء: ${reason}`,
                  target: `/orders/${order.id}`,
                })
                setCancelOpen(false)
                showToast('تم إلغاء الطلب.', { type: 'success' })
              }}
            >
              تأكيد الإلغاء
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setCancelOpen(false)}>
              تراجع
            </Button>
          </div>
        }
      >
        <Select
          label="سبب الإلغاء"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          options={CANCEL_REASONS.map((item) => ({ value: item, label: item }))}
        />
      </Modal>

      <Modal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="استرجاع المبلغ"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                orders.update(order.id, { paymentStatus: 'refunded', status: 'cancelled' })
                pushNotification({
                  type: 'order',
                  title: 'تم استرجاع المبلغ',
                  body: `تم استرجاع مبلغ ${formatPrice(order.total, settings.currency)} للطلب #${order.number}.`,
                  target: `/orders/${order.id}`,
                })
                setRefundOpen(false)
                showToast('تم تنفيذ الاسترجاع.', { type: 'success' })
              }}
            >
              تأكيد الاسترجاع
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setRefundOpen(false)}>
              إلغاء
            </Button>
          </div>
        }
      >
        <p className="flex items-center gap-2 text-[12.5px] leading-6 text-gray-600">
          <Send className="size-4 text-brand" />
          سيتم استرجاع مبلغ {formatPrice(order.total, settings.currency)} إلى العميل.
        </p>
      </Modal>
    </AdminPage>
  )
}

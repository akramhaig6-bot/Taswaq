import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Filter, Package } from 'lucide-react'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_TABS } from '@/lib/orders'
import { downloadCsv, formatDate, formatNumber, formatPrice } from '@/lib/utils'
import { AdminPage, Card, DataTable, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip, StatusBadge } from '@/components/ui'
import { Input, Select } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminOrders() {
  const navigate = useNavigate()
  const { orders, settings, updateOrderStatus } = useAdminOrders()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [payment, setPayment] = useState('all')
  const [city, setCity] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.items
      .filter((order) => {
        if (status !== 'all' && order.status !== status) return false
        if (payment !== 'all' && order.paymentMethodId !== payment) return false
        if (city !== 'all' && order.address.city !== city) return false
        if (from && new Date(order.createdAt) < new Date(from)) return false
        if (to && new Date(order.createdAt) > new Date(`${to}T23:59:59`)) return false
        if (q && !order.number.includes(q) && !order.customerName.toLowerCase().includes(q) && !order.customerPhone.includes(q))
          return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders.items, query, status, payment, city, from, to])

  const cities = useMemo(() => Array.from(new Set(orders.items.map((order) => order.address.city))), [orders.items])

  const exportCsv = () => {
    downloadCsv('orders.csv', [
      ['رقم الطلب', 'العميل', 'الجوال', 'المدينة', 'المبلغ', 'طريقة الدفع', 'الحالة', 'التاريخ'],
      ...filtered.map((order) => [
        order.number,
        order.customerName,
        order.customerPhone,
        order.address.city,
        order.total,
        order.paymentMethodName,
        ORDER_STATUS_TABS.find((tab) => tab.value === order.status)?.label ?? order.status,
        formatDate(order.createdAt),
      ]),
    ])
  }

  return (
    <AdminPage
      title="الطلبات"
      subtitle={`${formatNumber(filtered.length)} طلب`}
      breadcrumbs={['لوحة الإدارة', 'الطلبات']}
      actions={
        <>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>
            تصدير
          </Button>
          <Button variant="outline" icon={<Package className="size-4" />} onClick={() => navigate('/admin/products')}>
            إدارة المنتجات
          </Button>
        </>
      }
    >
      <Card padded={false}>
        <div className="space-y-3 p-4">
          <Toolbar>
            <Input
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الجوال"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-60 flex-1"
            />
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as 'all' | OrderStatus)}
              options={ORDER_STATUS_TABS.map((tab) => ({ value: tab.value, label: tab.label }))}
              className="h-10 w-40"
            />
            <Select
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
              options={[{ value: 'all', label: 'كل طرق الدفع' }, ...settings.paymentMethods.map((method) => ({ value: method.id, label: method.name }))]}
              className="h-10 w-44"
            />
            <Select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              options={[{ value: 'all', label: 'كل المدن' }, ...cities.map((item) => ({ value: item, label: item }))]}
              className="h-10 w-36"
            />
            <div className="flex items-center gap-2">
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 w-36" />
              <span className="text-gray-400">—</span>
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 w-36" />
            </div>
          </Toolbar>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] text-gray-500">
              <Filter className="size-3.5" /> فلاتر سريعة:
            </span>
            {ORDER_STATUS_TABS.map((tab) => (
              <Chip key={tab.value} active={status === tab.value} onClick={() => setStatus(tab.value)}>
                {tab.label}
              </Chip>
            ))}
            {(from || to || city !== 'all' || payment !== 'all' || status !== 'all' || query) && (
              <button
                type="button"
                onClick={() => {
                  setFrom('')
                  setTo('')
                  setCity('all')
                  setPayment('all')
                  setStatus('all')
                  setQuery('')
                }}
                className="text-[12px] font-bold text-danger"
              >
                إعادة تعيين
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4">
          <DataTable<Order>
            rows={filtered}
            onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
            emptyText="لا توجد طلبات مطابقة للفلاتر الحالية."
            renderCard={(order) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">#{order.number}</p>
                    <p className="truncate text-[11.5px] text-gray-500">
                      {order.customerName} — {order.address.city}
                    </p>
                    <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={order.status} />
                    <span className="text-[12.5px] font-bold text-gray-900">
                      {formatPrice(order.total, settings.currency)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                  <span className="text-[11.5px] text-gray-500">{order.paymentMethodName}</span>
                  <select
                    value={order.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateOrderStatus(order, event.target.value as OrderStatus)}
                    className="h-8 rounded-lg border border-gray-200 px-2 text-[11.5px]"
                  >
                    {ORDER_STATUS_TABS.filter((tab) => tab.value !== 'all').map((tab) => (
                      <option key={tab.value} value={tab.value}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            columns={[
              {
                key: 'number',
                header: 'رقم الطلب',
                render: (order) => (
                  <div>
                    <p className="font-bold text-gray-900">#{order.number}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'العميل',
                render: (order) => (
                  <div>
                    <p className="font-semibold text-gray-800">{order.customerName}</p>
                    <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                  </div>
                ),
              },
              { key: 'city', header: 'المدينة', render: (order) => order.address.city },
              { key: 'items', header: 'المنتجات', render: (order) => `${order.items.length} منتج` },
              { key: 'payment', header: 'طريقة الدفع', render: (order) => order.paymentMethodName },
              {
                key: 'total',
                header: 'المبلغ',
                render: (order) => <span className="font-bold">{formatPrice(order.total, settings.currency)}</span>,
              },
              {
                key: 'status',
                header: 'الحالة',
                render: (order) => (
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={order.status} />
                    {order.paymentStatus === 'paid' ? (
                      <Badge tone="success">مدفوع</Badge>
                    ) : order.paymentStatus === 'refunded' ? (
                      <Badge tone="gray">مسترجع</Badge>
                    ) : (
                      <Badge tone="warning">غير مدفوع</Badge>
                    )}
                  </div>
                ),
              },
              {
                key: 'quick',
                header: 'تحديث سريع',
                render: (order) => (
                  <select
                    value={order.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateOrderStatus(order, event.target.value as OrderStatus)}
                    className="h-8 rounded-lg border border-gray-200 px-2 text-[11.5px]"
                  >
                    {ORDER_STATUS_TABS.filter((tab) => tab.value !== 'all').map((tab) => (
                      <option key={tab.value} value={tab.value}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                ),
              },
            ]}
          />
        </div>
      </Card>
    </AdminPage>
  )
}

/** hook صغير لتحديث حالة الطلب مع إشعار */
function useAdminOrders() {
  const { orders, settings, pushNotification } = useAppData()
  const { showToast } = useToast()

  const updateOrderStatus = (order: Order, status: OrderStatus) => {
    orders.update(order.id, { status })
    pushNotification({
      type: 'order',
      title: 'تحديث حالة الطلب',
      body: `تم تحديث حالة الطلب #${order.number} إلى ${
        ORDER_STATUS_TABS.find((tab) => tab.value === status)?.label ?? status
      }.`,
      target: `/orders/${order.id}`,
    })
    showToast('تم تحديث حالة الطلب.', { type: 'success' })
  }

  return { orders, settings, updateOrderStatus }
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Boxes, DollarSign, Package, ShoppingBag, Star, Users } from 'lucide-react'
import { formatNumber, formatPrice, relativeTime } from '@/lib/utils'
import { discountPercent, isDiscountActive, isOutOfStock } from '@/lib/pricing'
import { AdminPage, BarChart, Card, DataTable, DonutChart, LineChart, StatCard } from '@/components/admin/AdminUI'
import { Badge, Button, Rating, StatusBadge } from '@/components/ui'
import { Select } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import type { Order } from '@/types'

type Period = 'today' | 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  year: 'هذا العام',
}

function periodStart(period: Period): Date {
  const now = new Date()
  const start = new Date(now)
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      return start
    case 'week':
      start.setDate(now.getDate() - 7)
      return start
    case 'month':
      start.setMonth(now.getMonth() - 1)
      return start
    default:
      start.setFullYear(now.getFullYear() - 1)
      return start
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { orders, products, customers, reviews, categories, settings, categoryProductCount } = useAppData()
  const [period, setPeriod] = useState<Period>('month')

  const inRange = useMemo(() => {
    const start = periodStart(period)
    const previousStart = new Date(start.getTime() - (Date.now() - start.getTime()))
    const current = orders.items.filter((order) => new Date(order.createdAt) >= start && order.status !== 'cancelled')
    const previous = orders.items.filter((order) => {
      const date = new Date(order.createdAt)
      return date >= previousStart && date < start && order.status !== 'cancelled'
    })
    return { current, previous, start }
  }, [orders.items, period])

  const stats = useMemo(() => {
    const sales = inRange.current.reduce((sum, order) => sum + order.total, 0)
    const previousSales = inRange.previous.reduce((sum, order) => sum + order.total, 0)
    const itemsSold = inRange.current.reduce(
      (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
      0,
    )
    const previousItems = inRange.previous.reduce(
      (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
      0,
    )
    const newCustomers = customers.items.filter((customer) => new Date(customer.createdAt) >= inRange.start).length
    const delta = (value: number, previous: number) =>
      previous === 0 ? (value > 0 ? 100 : 0) : Math.round(((value - previous) / previous) * 100)

    return {
      sales,
      salesDelta: delta(sales, previousSales),
      orders: inRange.current.length,
      ordersDelta: delta(inRange.current.length, inRange.previous.length),
      itemsSold,
      itemsDelta: delta(itemsSold, previousItems),
      newCustomers,
      customersDelta: delta(newCustomers, Math.max(1, Math.round(customers.items.length / 4))),
    }
  }, [inRange, customers.items])

  /* الرسم الخطي للمبيعات */
  const series = useMemo(() => {
    const buckets: Array<{ label: string; value: number }> = []
    const now = new Date()
    if (period === 'today') {
      for (let hour = 0; hour < 24; hour += 4) {
        const start = new Date(now)
        start.setHours(hour, 0, 0, 0)
        const end = new Date(start)
        end.setHours(hour + 4)
        const value = inRange.current
          .filter((order) => new Date(order.createdAt) >= start && new Date(order.createdAt) < end)
          .reduce((sum, order) => sum + order.total, 0)
        buckets.push({ label: `${hour}:00`, value })
      }
    } else {
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 12
      for (let index = days - 1; index >= 0; index -= 1) {
        const start = new Date(now)
        if (period === 'year') {
          start.setMonth(now.getMonth() - index, 1)
          start.setHours(0, 0, 0, 0)
        } else {
          start.setDate(now.getDate() - index)
          start.setHours(0, 0, 0, 0)
        }
        const end = new Date(start)
        if (period === 'year') end.setMonth(start.getMonth() + 1)
        else end.setDate(start.getDate() + 1)
        const value = orders.items
          .filter((order) => {
            const date = new Date(order.createdAt)
            return date >= start && date < end && order.status !== 'cancelled'
          })
          .reduce((sum, order) => sum + order.total, 0)
        buckets.push({
          label:
            period === 'year'
              ? `${start.getMonth() + 1}`
              : `${start.getDate()}/${start.getMonth() + 1}`,
          value,
        })
      }
    }
    return buckets
  }, [period, orders.items, inRange.current])

  const categorySales = useMemo(() => {
    const totals = new Map<string, number>()
    inRange.current.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.items.find((p) => p.id === item.productId)
        if (!product) return
        const rootId = product.categoryIds.find((id) => categories.items.some((c) => c.id === id && !c.parentId)) ?? product.categoryIds[0]
        if (!rootId) return
        totals.set(rootId, (totals.get(rootId) ?? 0) + item.price * item.quantity)
      })
    })
    return Array.from(totals.entries())
      .map(([id, value]) => ({
        label: categories.items.find((c) => c.id === id)?.name ?? 'غير مصنف',
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [inRange.current, products.items, categories.items])

  const topProducts = useMemo(
    () =>
      [...products.items]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 8)
        .map((product) => ({ label: product.name, value: product.sales })),
    [products.items],
  )

  const latestOrders = useMemo(
    () => [...orders.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    [orders.items],
  )

  const lowStock = useMemo(
    () =>
      products.items
        .filter((product) => product.trackStock && product.stock <= (product.lowStockThreshold || settings.lowStockThreshold))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6),
    [products.items, settings.lowStockThreshold],
  )

  const latestReviews = useMemo(
    () => [...reviews.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [reviews.items],
  )

  const newOrdersCount = orders.items.filter((order) => order.status === 'processing').length

  return (
    <AdminPage
      title="لوحة التحكم"
      subtitle={`نظرة عامة على أداء المتجر — ${PERIOD_LABELS[period]}`}
      breadcrumbs={['لوحة الإدارة', 'الرئيسية']}
      actions={
        <div className="w-44">
          <Select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            options={Object.entries(PERIOD_LABELS).map(([value, label]) => ({ value, label }))}
            className="h-10"
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المبيعات"
          value={formatPrice(stats.sales, settings.currency)}
          delta={stats.salesDelta}
          icon={<DollarSign className="size-4" />}
          onClick={() => navigate('/admin/reports')}
        />
        <StatCard
          label="الطلبات"
          value={formatNumber(stats.orders)}
          delta={stats.ordersDelta}
          hint={`${newOrdersCount} قيد المعالجة`}
          icon={<ShoppingBag className="size-4" />}
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          label="المنتجات المباعة"
          value={formatNumber(stats.itemsSold)}
          delta={stats.itemsDelta}
          icon={<Boxes className="size-4" />}
          onClick={() => navigate('/admin/products')}
        />
        <StatCard
          label="عملاء جدد"
          value={formatNumber(stats.newCustomers)}
          delta={stats.customersDelta}
          icon={<Users className="size-4" />}
          onClick={() => navigate('/admin/customers')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="المبيعات" subtitle={`إجمالي المبيعات خلال ${PERIOD_LABELS[period]}`} className="xl:col-span-2">
          <LineChart
            values={series.map((point) => point.value)}
            labels={series.map((point) => point.label)}
            formatter={(value) => formatPrice(value, settings.currency)}
          />
        </Card>
        <Card title="أفضل الأقسام مبيعًا" subtitle="حسب قيمة المبيعات">
          {categorySales.length ? <DonutChart slices={categorySales} /> : <p className="py-8 text-center text-[12.5px] text-gray-400">لا توجد بيانات</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="أفضل المنتجات مبيعًا" subtitle="أعلى 8 منتجات">
          <BarChart items={topProducts} formatter={(value) => `${formatNumber(value)} قطعة`} />
        </Card>
        <Card
          title="المنتجات منخفضة المخزون"
          subtitle={`أقل من أو يساوي ${settings.lowStockThreshold} قطع`}
          actions={
            <Badge tone={lowStock.length ? 'warning' : 'success'}>
              <AlertTriangle className="size-3" /> {lowStock.length} منتج
            </Badge>
          }
        >
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-gray-400">لا توجد منتجات منخفضة المخزون.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                  <img src={product.images[0]} alt="" className="size-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-gray-800">{product.name}</p>
                    <p className="text-[11.5px] text-warning">بقي {formatNumber(product.stock)} قطعة فقط</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                    تحديث المخزون
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="أحدث الطلبات"
        subtitle="آخر 10 طلبات"
        padded={false}
        actions={
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/orders')}>
            عرض جميع الطلبات
          </Button>
        }
      >
        <div className="p-4">
          <DataTable<Order>
            pageSize={5}
            rows={latestOrders}
            onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
            columns={[
              { key: 'number', header: 'رقم الطلب', render: (order) => <span className="font-bold">#{order.number}</span> },
              { key: 'customer', header: 'العميل', render: (order) => order.customerName },
              { key: 'total', header: 'المبلغ', render: (order) => formatPrice(order.total, settings.currency) },
              { key: 'status', header: 'الحالة', render: (order) => <StatusBadge status={order.status} /> },
              { key: 'date', header: 'التاريخ', render: (order) => relativeTime(order.createdAt) },
              {
                key: 'actions',
                header: 'إجراءات',
                render: (order) => (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(`/admin/orders/${order.id}`)
                    }}
                  >
                    عرض
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="أحدث التقييمات" subtitle="آخر 5 تقييمات">
          {latestReviews.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-gray-400">لا توجد تقييمات بعد.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {latestReviews.map((review) => (
                <li key={review.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-bold text-gray-800">{review.userName}</span>
                    <span className="text-[11px] text-gray-400">{relativeTime(review.createdAt)}</span>
                  </div>
                  <Rating value={review.rating} size={12} className="mt-1" />
                  <p className="mt-1 line-clamp-2 text-[12px] text-gray-500">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="ملخص سريع" subtitle="حالة المتجر الآن">
          <ul className="space-y-2.5 text-[12.5px]">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><Package className="size-4 text-gray-400" /> إجمالي المنتجات</span>
              <span className="font-bold text-gray-900">{formatNumber(products.items.length)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><Boxes className="size-4 text-gray-400" /> منتجات متاحة للبيع</span>
              <span className="font-bold text-gray-900">
                {formatNumber(products.items.filter((product) => !isOutOfStock(product) && product.status === 'published').length)}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><Star className="size-4 text-gray-400" /> منتجات عليها خصم</span>
              <span className="font-bold text-gray-900">
                {formatNumber(products.items.filter((product) => isDiscountActive(product)).length)}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><Users className="size-4 text-gray-400" /> إجمالي العملاء</span>
              <span className="font-bold text-gray-900">{formatNumber(customers.items.length)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><ShoppingBag className="size-4 text-gray-400" /> متوسط قيمة الطلب</span>
              <span className="font-bold text-gray-900">
                {formatPrice(
                  orders.items.length
                    ? orders.items.reduce((sum, order) => sum + order.total, 0) / orders.items.length
                    : 0,
                  settings.currency,
                )}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600"><Star className="size-4 text-gray-400" /> متوسط التقييم العام</span>
              <span className="font-bold text-gray-900">
                {(products.items.reduce((sum, product) => sum + product.rating, 0) / Math.max(1, products.items.length)).toFixed(1)}
              </span>
            </li>
          </ul>
          <div className="mt-3 rounded-xl bg-brand-soft p-3">
            <p className="text-[11.5px] font-bold text-brand">أعلى خصم حالي</p>
            <p className="mt-0.5 text-[12px] text-gray-600">
              {Math.max(0, ...products.items.map((product) => discountPercent(product)))}% على المنتجات المشمولة بالعرض
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              أقسام رئيسية: {formatNumber(categories.items.filter((category) => !category.parentId).length)} — أكبر قسم:{' '}
              {formatNumber(Math.max(0, ...categories.items.filter((c) => !c.parentId).map((c) => categoryProductCount(c.id))))} منتج
            </p>
          </div>
        </Card>
      </div>
    </AdminPage>
  )
}

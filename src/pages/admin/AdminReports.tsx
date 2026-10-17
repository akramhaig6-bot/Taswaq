import { useMemo, useState } from 'react'
import { CalendarRange, Download, FileSpreadsheet, Printer, TrendingUp } from 'lucide-react'
import type { Order } from '@/types'
import { downloadCsv, formatDate, formatNumber, formatPrice } from '@/lib/utils'
import { discountPercent, isDiscountActive } from '@/lib/pricing'
import { AdminPage, BarChart, Card, DataTable, DonutChart, LineChart, StatCard, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, ProgressBar, StatusBadge } from '@/components/ui'
import { Input, Select } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

type Range = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

const RANGE_LABELS: Record<Exclude<Range, 'custom'>, string> = {
  today: 'اليوم',
  week: 'آخر 7 أيام',
  month: 'آخر 30 يومًا',
  quarter: 'آخر 3 أشهر',
  year: 'آخر سنة',
}

function startOf(range: Range, from: string, to: string): { start: Date; end: Date } {
  const end = new Date()
  if (range === 'custom') {
    return {
      start: from ? new Date(from) : new Date(0),
      end: to ? new Date(`${to}T23:59:59`) : end,
    }
  }
  const start = new Date()
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(end.getDate() - 7)
      break
    case 'month':
      start.setDate(end.getDate() - 30)
      break
    case 'quarter':
      start.setMonth(end.getMonth() - 3)
      break
    default:
      start.setFullYear(end.getFullYear() - 1)
  }
  return { start, end }
}

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export default function AdminReports() {
  const { orders, products, customers, categories, settings, getProduct } = useAppData()
  const { showToast } = useToast()

  const [range, setRange] = useState<Range>('month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [metric, setMetric] = useState<'sales' | 'orders' | 'items'>('sales')

  const { start, end } = useMemo(() => startOf(range, from, to), [range, from, to])

  const scoped = useMemo(
    () => orders.items.filter((order) => new Date(order.createdAt) >= start && new Date(order.createdAt) <= end),
    [orders.items, start, end],
  )

  const valid = useMemo(() => scoped.filter((order) => order.status !== 'cancelled'), [scoped])

  const totals = useMemo(() => {
    const sales = valid.reduce((sum, order) => sum + order.total, 0)
    const itemsSold = valid.reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0)
    const discounts = valid.reduce((sum, order) => sum + order.discount, 0)
    const tax = valid.reduce((sum, order) => sum + order.tax, 0)
    const shipping = valid.reduce((sum, order) => sum + order.shipping, 0)
    const cancelled = scoped.length - valid.length
    return {
      sales,
      itemsSold,
      discounts,
      tax,
      shipping,
      cancelled,
      averageOrder: valid.length ? sales / valid.length : 0,
    }
  }, [valid, scoped])

  /** تقسيم الفترة لـ 8 نقاط لعرض الرسم البياني */
  const series = useMemo(() => {
    const points = 8
    const span = Math.max(1, end.getTime() - start.getTime())
    const step = span / points
    const buckets = Array.from({ length: points }, (_, index) => ({
      label: new Date(start.getTime() + step * index).toLocaleDateString('ar-SA-u-nu-latn', { day: '2-digit', month: '2-digit' }),
      value: 0,
    }))
    valid.forEach((order) => {
      const index = Math.min(points - 1, Math.floor((new Date(order.createdAt).getTime() - start.getTime()) / step))
      const bucket = buckets[index]
      if (!bucket) return
      if (metric === 'sales') bucket.value += order.total
      else if (metric === 'orders') bucket.value += 1
      else bucket.value += order.items.reduce((count, item) => count + item.quantity, 0)
    })
    return buckets
  }, [valid, start, end, metric])

  const monthly = useMemo(
    () =>
      MONTH_NAMES.map((label, index) => ({
        label,
        value: orders.items
          .filter((order) => new Date(order.createdAt).getMonth() === index && order.status !== 'cancelled')
          .reduce((sum, order) => sum + order.total, 0),
      })),
    [orders.items],
  )

  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>()
    valid.forEach((order) =>
      order.items.forEach((item) => {
        const current = map.get(item.productId) ?? { qty: 0, revenue: 0 }
        map.set(item.productId, { qty: current.qty + item.quantity, revenue: current.revenue + item.price * item.quantity })
      }),
    )
    return Array.from(map.entries())
      .map(([productId, value]) => ({ productId, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [valid])

  const categorySlices = useMemo(() => {
    const map = new Map<string, number>()
    valid.forEach((order) =>
      order.items.forEach((item) => {
        const product = getProduct(item.productId)
        const primary = product?.categoryIds[0]
        const name = categories.items.find((category) => category.id === primary)?.name ?? 'غير مصنّف'
        map.set(name, (map.get(name) ?? 0) + item.price * item.quantity)
      }),
    )
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [valid, categories.items, getProduct])

  const paymentSlices = useMemo(() => {
    const map = new Map<string, number>()
    valid.forEach((order) => map.set(order.paymentMethodName, (map.get(order.paymentMethodName) ?? 0) + order.total))
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
  }, [valid])

  const cityRows = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    valid.forEach((order) => {
      const city = order.address?.city ?? 'تسليم رقمي / خدمة'
      const current = map.get(city) ?? { count: 0, total: 0 }
      map.set(city, { count: current.count + 1, total: current.total + order.total })
    })
    return Array.from(map.entries())
      .map(([city, value]) => ({ id: city, city, ...value }))
      .sort((a, b) => b.total - a.total)
  }, [valid])

  const bestCustomers = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number }>()
    valid.forEach((order) => {
      const key = order.customerId ?? order.customerPhone
      const current = map.get(key) ?? { name: order.customerName, count: 0, total: 0 }
      map.set(key, { name: current.name, count: current.count + 1, total: current.total + order.total })
    })
    return Array.from(map.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
  }, [valid])

  const statusRows = useMemo(() => {
    const map = new Map<string, number>()
    scoped.forEach((order) => map.set(order.status, (map.get(order.status) ?? 0) + 1))
    return map
  }, [scoped])

  const exportSales = () => {
    downloadCsv(`report-${range}.csv`, [
      ['التقرير', RANGE_LABELS[range as Exclude<Range, 'custom'>] ?? 'مخصص'],
      ['من', formatDate(start.toISOString())],
      ['إلى', formatDate(end.toISOString())],
      [],
      ['الطلب', 'العميل', 'المدينة', 'الحالة', 'طريقة الدفع', 'المجموع الفرعي', 'الخصم', 'الشحن', 'الضريبة', 'الإجمالي'],
      ...scoped.map((order: Order) => [
        order.number,
        order.customerName,
        order.address?.city ?? 'تسليم رقمي / خدمة',
        order.status,
        order.paymentMethodName,
        order.subtotal,
        order.discount,
        order.shipping,
        order.tax,
        order.total,
      ]),
    ])
    showToast('تم تصدير التقرير بصيغة CSV.', { type: 'success' })
  }

  const maxProductRevenue = Math.max(1, ...topProducts.slice(0, 8).map((row) => row.revenue))

  return (
    <AdminPage
      title="التقارير"
      subtitle="مؤشرات البيع والأداء خلال الفترة المحددة"
      breadcrumbs={['لوحة الإدارة', 'التقارير']}
      actions={
        <>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={exportSales}>
            تصدير CSV
          </Button>
          <Button variant="outline" icon={<FileSpreadsheet className="size-4" />} onClick={() => showToast('استخدم زر تصدير CSV لتنزيل التقرير بصيغة جداول.', { type: 'info' })}>
            تصدير Excel
          </Button>
          <Button icon={<Printer className="size-4" />} onClick={() => window.print()}>
            طباعة التقرير
          </Button>
        </>
      }
    >
      <Card>
        <Toolbar>
          <Select
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
            options={[
              ...(Object.keys(RANGE_LABELS) as Array<Exclude<Range, 'custom'>>).map((value) => ({
                value,
                label: RANGE_LABELS[value],
              })),
              { value: 'custom', label: 'فترة مخصصة' },
            ]}
            className="h-10 w-44"
          />
          {range === 'custom' && (
            <>
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 w-40" />
              <span className="text-gray-400">—</span>
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 w-40" />
            </>
          )}
          <Select
            value={metric}
            onChange={(event) => setMetric(event.target.value as 'sales' | 'orders' | 'items')}
            options={[
              { value: 'sales', label: 'المبيعات' },
              { value: 'orders', label: 'عدد الطلبات' },
              { value: 'items', label: 'عدد القطع' },
            ]}
            className="h-10 w-40"
          />
          <span className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <CalendarRange className="size-3.5" />
            {formatDate(start.toISOString())} — {formatDate(end.toISOString())}
          </span>
        </Toolbar>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المبيعات"
          value={formatPrice(totals.sales, settings.currency)}
          icon={<TrendingUp className="size-4" />}
          hint={`${formatNumber(valid.length)} طلب`}
        />
        <StatCard label="متوسط قيمة الطلب" value={formatPrice(totals.averageOrder, settings.currency)} />
        <StatCard label="القطع المبيعة" value={formatNumber(totals.itemsSold)} />
        <StatCard label="طلبات ملغية" value={formatNumber(totals.cancelled)} hint={`من ${formatNumber(scoped.length)}`} />
        <StatCard label="إجمالي الخصومات" value={formatPrice(totals.discounts, settings.currency)} />
        <StatCard label="الضريبة المحصّلة" value={formatPrice(totals.tax, settings.currency)} />
        <StatCard label="إيراد الشحن" value={formatPrice(totals.shipping, settings.currency)} />
        <StatCard label="عملاء اشتروا" value={formatNumber(new Set(valid.map((order) => order.customerId ?? order.customerPhone)).size)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card
          title={
            metric === 'sales' ? 'المبيعات حسب الفترة' : metric === 'orders' ? 'الطلبات حسب الفترة' : 'القطع المبيعة حسب الفترة'
          }
          className="xl:col-span-2"
        >
          <LineChart
            values={series.map((point) => point.value)}
            labels={series.map((point) => point.label)}
            height={220}
            formatter={(value) => (metric === 'sales' ? formatPrice(value, settings.currency) : formatNumber(value))}
          />
        </Card>

        <Card title="المبيعات حسب القسم">
          {categorySlices.length ? (
            <DonutChart slices={categorySlices} />
          ) : (
            <p className="py-10 text-center text-[12.5px] text-gray-400">لا توجد بيانات في هذه الفترة.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="المبيعات الشهرية (هذا العام)">
          <BarChart items={monthly} formatter={(value) => formatPrice(value, settings.currency)} />
        </Card>

        <Card title="طرق الدفع المستخدمة">
          {paymentSlices.length ? (
            <DonutChart slices={paymentSlices} />
          ) : (
            <p className="py-10 text-center text-[12.5px] text-gray-400">لا توجد مدفوعات في هذه الفترة.</p>
          )}
        </Card>
      </div>

      <Card title="الأكثر مبيعًا" subtitle={`${topProducts.length} منتج تم بيعه في الفترة`} padded={false}>
        <div className="p-4">
          <ul className="space-y-3">
            {topProducts.slice(0, 8).map((row) => {
              const product = getProduct(row.productId)
              return (
                <li key={row.productId} className="flex items-center gap-3">
                  {product?.images[0] && <img src={product.images[0]} alt="" className="size-10 rounded-lg object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-[12.5px] font-semibold text-gray-800">{product?.name ?? 'منتج محذوف'}</p>
                      <span className="shrink-0 text-[12px] font-bold text-gray-900">
                        {formatPrice(row.revenue, settings.currency)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <ProgressBar value={(row.revenue / maxProductRevenue) * 100} className="h-1.5 flex-1" />
                      <span className="text-[11px] text-gray-400">{formatNumber(row.qty)} قطعة</span>
                    </div>
                  </div>
                </li>
              )
            })}
            {topProducts.length === 0 && <p className="py-6 text-center text-[12.5px] text-gray-400">لا توجد مبيعات في الفترة.</p>}
          </ul>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="أفضل العملاء" padded={false}>
          <ul className="divide-y divide-gray-100">
            {bestCustomers.map((customer) => (
              <li key={customer.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-800">{customer.name}</p>
                  <p className="text-[11px] text-gray-400">{formatNumber(customer.count)} طلب</p>
                </div>
                <span className="text-[12.5px] font-bold text-gray-900">{formatPrice(customer.total, settings.currency)}</span>
              </li>
            ))}
            {bestCustomers.length === 0 && <li className="px-4 py-6 text-center text-[12.5px] text-gray-400">لا توجد بيانات.</li>}
          </ul>
        </Card>

        <Card title="طلبات حسب الحالة">
          <ul className="space-y-3">
            {(['processing', 'shipping', 'delivered', 'cancelled'] as const).map((status) => {
              const count = statusRows.get(status) ?? 0
              const percent = scoped.length ? (count / scoped.length) * 100 : 0
              return (
                <li key={status}>
                  <div className="mb-1 flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-[12px] text-gray-500">
                      {formatNumber(count)} ({percent.toFixed(0)}%)
                    </span>
                  </div>
                  <ProgressBar value={percent} className="h-1.5" />
                </li>
              )
            })}
          </ul>
        </Card>

        <Card title="مخزون منخفض" subtitle={`أقل من ${settings.lowStockThreshold} قطعة`} padded={false}>
          <ul className="divide-y divide-gray-100">
            {products.items
              .filter((product) => product.trackStock && product.stock <= product.lowStockThreshold)
              .slice(0, 6)
              .map((product) => (
                <li key={product.id} className="flex items-center justify-between px-4 py-2.5">
                  <p className="line-clamp-1 max-w-44 text-[12.5px] text-gray-700">{product.name}</p>
                  <Badge tone={product.stock === 0 ? 'danger' : 'warning'}>{formatNumber(product.stock)} قطعة</Badge>
                </li>
              ))}
            {products.items.filter((product) => product.trackStock && product.stock <= product.lowStockThreshold).length === 0 && (
              <li className="px-4 py-6 text-center text-[12.5px] text-gray-400">كل المنتجات بمخزون جيد.</li>
            )}
          </ul>
        </Card>
      </div>

      <Card title="المدن الأكثر شراءً" padded={false}>
        <div className="p-4">
          <DataTable
            rows={cityRows}
            pageSize={8}
            emptyText="لا توجد بيانات في الفترة."
            columns={[
              { key: 'city', header: 'المدينة', render: (row) => <span className="font-semibold text-gray-800">{row.city}</span> },
              { key: 'count', header: 'عدد الطلبات', render: (row) => formatNumber(row.count) },
              {
                key: 'total',
                header: 'إجمالي المبيعات',
                render: (row) => <span className="font-bold">{formatPrice(row.total, settings.currency)}</span>,
              },
              {
                key: 'share',
                header: 'النسبة',
                render: (row) => `${totals.sales ? ((row.total / totals.sales) * 100).toFixed(1) : '0'}%`,
              },
            ]}
          />
        </div>
      </Card>

      <Card title="منتجات بخصومات نشطة" subtitle="ملخص العروض الحالية">
        <div className="flex flex-wrap gap-2">
          {products.items
            .filter((product) => isDiscountActive(product))
            .slice(0, 10)
            .map((product) => (
              <Badge key={product.id} tone="gold">
                {product.name} — {discountPercent(product)}%
              </Badge>
            ))}
        </div>
        <p className="mt-3 text-[11.5px] text-gray-500">
          عدد العملاء المسجلين: <strong>{formatNumber(customers.items.length)}</strong> — عدد المنتجات:{' '}
          <strong>{formatNumber(products.items.length)}</strong>
        </p>
      </Card>
    </AdminPage>
  )
}

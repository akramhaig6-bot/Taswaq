import { useMemo, useState } from 'react'
import { Ban, CheckCircle2, Download, Eye, Mail, Plus, Trash2 } from 'lucide-react'
import type { Customer } from '@/types'
import { downloadCsv, formatDate, formatNumber, formatPrice, initials, uid } from '@/lib/utils'
import { AdminPage, Card, DataTable, FieldRow, StatCard, Toolbar } from '@/components/admin/AdminUI'
import { Avatar, Badge, Button, Chip, EmptyState } from '@/components/ui'
import { Input, Select, Textarea } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminCustomers() {
  const { customers, orders, settings, pushNotification } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [city, setCity] = useState('all')
  const [spend, setSpend] = useState<'all' | 'none' | 'medium' | 'high'>('all')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', password: '123456', city: '' })

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    orders.items.forEach((order) => {
      if (!order.customerId) return
      const current = map.get(order.customerId) ?? { count: 0, total: 0 }
      map.set(order.customerId, { count: current.count + 1, total: current.total + order.total })
    })
    return map
  }, [orders.items])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.items
      .filter((customer) => {
        if (q && !customer.name.toLowerCase().includes(q) && !customer.email.toLowerCase().includes(q) && !customer.phone.includes(q))
          return false
        if (city !== 'all' && !customer.addresses.some((address) => address.city === city)) return false
        const total = stats.get(customer.id)?.total ?? 0
        if (spend === 'none' && total > 0) return false
        if (spend === 'medium' && (total <= 0 || total > 2000)) return false
        if (spend === 'high' && total <= 2000) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [customers.items, query, city, spend, stats])

  const cities = useMemo(() => Array.from(new Set(customers.items.flatMap((customer) => customer.addresses.map((a) => a.city)))), [customers.items])
  const totalRevenue = orders.items.reduce((sum, order) => sum + order.total, 0)

  const exportCsv = () => {
    downloadCsv('customers.csv', [
      ['الاسم', 'البريد', 'الجوال', 'عدد الطلبات', 'إجمالي الشراء', 'محظور', 'تاريخ التسجيل'],
      ...list.map((customer) => [
        customer.name,
        customer.email,
        customer.phone,
        stats.get(customer.id)?.count ?? 0,
        stats.get(customer.id)?.total ?? 0,
        customer.blocked ? 'نعم' : 'لا',
        formatDate(customer.createdAt),
      ]),
    ])
  }

  return (
    <AdminPage
      title="العملاء"
      subtitle={`${formatNumber(customers.items.length)} عميل مسجّل`}
      breadcrumbs={['لوحة الإدارة', 'العملاء']}
      actions={
        <>
          <Button icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
            عميل جديد
          </Button>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>
            تصدير
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي العملاء" value={formatNumber(customers.items.length)} icon="👥" />
        <StatCard label="عملاء لديهم طلبات" value={formatNumber(stats.size)} icon="🧾" />
        <StatCard label="عملاء محظورون" value={formatNumber(customers.items.filter((customer) => customer.blocked).length)} icon="🚫" />
        <StatCard label="إجمالي المشتريات" value={formatPrice(totalRevenue, settings.currency)} icon="💰" />
      </div>

      <Card>
        <Toolbar>
          <Input
            placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 min-w-56 flex-1"
          />
          <Select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            options={[{ value: 'all', label: 'كل المدن' }, ...cities.map((item) => ({ value: item, label: item }))]}
            className="h-10 w-40"
          />
          <Select
            value={spend}
            onChange={(event) => setSpend(event.target.value as 'all' | 'none' | 'medium' | 'high')}
            options={[
              { value: 'all', label: 'كل العملاء' },
              { value: 'none', label: 'بدون مشتريات' },
              { value: 'medium', label: 'حتى 2000' },
              { value: 'high', label: 'أكثر من 2000' },
            ]}
            className="h-10 w-40"
          />
        </Toolbar>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip active={spend === 'none'} onClick={() => setSpend(spend === 'none' ? 'all' : 'none')}>
            بدون مشتريات
          </Chip>
          <Chip active={spend === 'high'} onClick={() => setSpend(spend === 'high' ? 'all' : 'high')}>
            عملاء مميزون
          </Chip>
          <Chip>{formatNumber(list.length)} نتيجة</Chip>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4">
          <DataTable<Customer>
            rows={list}
            emptyText="لا يوجد عملاء مطابقون للفلاتر الحالية."
            renderCard={(customer) => (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <Avatar name={customer.name} src={customer.avatar} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 font-semibold text-gray-800">
                      {customer.name}
                      {customer.blocked && <Badge tone="danger">محظور</Badge>}
                    </p>
                    <p className="truncate text-[11.5px] text-gray-500">{customer.email || '—'}</p>
                    <p className="text-[11px] text-gray-400">
                      {customer.phone} — {customer.addresses[0]?.city ?? 'بدون مدينة'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-[11.5px] text-gray-500">
                  <span>{formatNumber(stats.get(customer.id)?.count ?? 0)} طلب</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(stats.get(customer.id)?.total ?? 0, settings.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={<Eye className="size-3.5" />}
                    onClick={() => {
                      setSelected(customer)
                      setNoteDraft(customer.notes ?? '')
                    }}
                  >
                    عرض
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    className={customer.blocked ? 'text-success' : 'text-danger'}
                    icon={customer.blocked ? <CheckCircle2 className="size-3.5" /> : <Ban className="size-3.5" />}
                    onClick={() => {
                      customers.update(customer.id, { blocked: !customer.blocked })
                      showToast(customer.blocked ? 'تم إلغاء حظر العميل.' : 'تم حظر العميل.', { type: 'success' })
                    }}
                  >
                    {customer.blocked ? 'إلغاء الحظر' : 'حظر'}
                  </Button>
                </div>
              </div>
            )}
            columns={[
              {
                key: 'name',
                header: 'العميل',
                render: (customer) => (
                  <div className="flex items-center gap-2.5">
                    <Avatar name={customer.name} src={customer.avatar} size={36} />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {customer.name} {customer.blocked && <Badge tone="danger">محظور</Badge>}
                      </p>
                      <p className="text-[11px] text-gray-400">{customer.email || '—'}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'phone', header: 'الجوال', render: (customer) => customer.phone },
              {
                key: 'city',
                header: 'المدينة',
                render: (customer) => customer.addresses[0]?.city ?? '—',
              },
              {
                key: 'orders',
                header: 'الطلبات',
                render: (customer) => formatNumber(stats.get(customer.id)?.count ?? 0),
              },
              {
                key: 'spent',
                header: 'إجمالي الشراء',
                render: (customer) => (
                  <span className="font-bold text-gray-900">
                    {formatPrice(stats.get(customer.id)?.total ?? 0, settings.currency)}
                  </span>
                ),
              },
              { key: 'since', header: 'تاريخ التسجيل', render: (customer) => formatDate(customer.createdAt) },
              {
                key: 'actions',
                header: 'الإجراءات',
                render: (customer) => (
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<Eye className="size-3.5" />}
                      onClick={() => {
                        setSelected(customer)
                        setNoteDraft(customer.notes ?? '')
                      }}
                    >
                      عرض
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className={customer.blocked ? 'text-success' : 'text-danger'}
                      icon={customer.blocked ? <CheckCircle2 className="size-3.5" /> : <Ban className="size-3.5" />}
                      onClick={() => {
                        customers.update(customer.id, { blocked: !customer.blocked })
                        showToast(customer.blocked ? 'تم إلغاء حظر العميل.' : 'تم حظر العميل.', { type: 'success' })
                      }}
                    >
                      {customer.blocked ? 'إلغاء الحظر' : 'حظر'}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`ملف العميل: ${selected?.name ?? ''}`}
        size="lg"
        footer={
          <div className="flex flex-wrap gap-2">
            <Button
              fullWidth
              icon={<Mail className="size-4" />}
              onClick={() => {
                if (!selected) return
                pushNotification({
                  type: 'info',
                  title: 'رسالة من المتجر',
                  body: 'لدينا عرض خاص لك اليوم! تفضل بزيارة قسم العروض.',
                  target: '/offers',
                })
                showToast('تم إرسال إشعار للعميل.', { type: 'success' })
              }}
            >
              إرسال إشعار
            </Button>
            <Button variant="outline" fullWidth onClick={() => setSelected(null)}>
              إغلاق
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="عدد الطلبات" value={formatNumber(stats.get(selected.id)?.count ?? 0)} />
              <StatCard
                label="إجمالي الشراء"
                value={formatPrice(stats.get(selected.id)?.total ?? 0, settings.currency)}
              />
              <StatCard label="العناوين" value={formatNumber(selected.addresses.length)} />
            </div>

            <div>
              <p className="mb-1.5 text-[12.5px] font-bold text-gray-700">ملف العميل</p>
              <FieldRow label="الاسم" value={selected.name} />
              <FieldRow label="البريد الإلكتروني" value={selected.email || '—'} />
              <FieldRow label="الجوال" value={selected.phone} />
              <FieldRow label="تاريخ التسجيل" value={formatDate(selected.createdAt)} />
              <FieldRow label="الحالة" value={selected.blocked ? <Badge tone="danger">محظور</Badge> : <Badge tone="success">نشط</Badge>} />
            </div>

            <div>
              <p className="mb-1.5 text-[12.5px] font-bold text-gray-700">العناوين ({selected.addresses.length})</p>
              {selected.addresses.length === 0 ? (
                <p className="rounded-xl bg-gray-50 p-3 text-[12px] text-gray-500">لا توجد عناوين محفوظة.</p>
              ) : (
                <ul className="space-y-2">
                  {selected.addresses.map((address) => (
                    <li key={address.id} className="rounded-xl border border-gray-200 p-2.5 text-[12px] text-gray-600">
                      <span className="font-semibold text-gray-800">{address.label}</span> — {address.city}، {address.district}،{' '}
                      {address.street}
                      {address.building ? `، مبنى ${address.building}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-[12.5px] font-bold text-gray-700">آخر الطلبات</p>
              {orders.items.filter((order) => order.customerId === selected.id).length === 0 ? (
                <EmptyState title="لا توجد طلبات" className="py-6" />
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {orders.items
                    .filter((order) => order.customerId === selected.id)
                    .slice(0, 5)
                    .map((order) => (
                      <li key={order.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
                        <span className="font-semibold text-gray-700">#{order.number}</span>
                        <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                        <span className="font-bold text-gray-900">{formatPrice(order.total, settings.currency)}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div>
              <Textarea
                label="ملاحظات داخلية"
                rows={2}
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    customers.update(selected.id, { notes: noteDraft })
                    showToast('تم حفظ الملاحظة.', { type: 'success' })
                  }}
                >
                  حفظ الملاحظة
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" />} onClick={() => setPendingDelete(selected)}>
                  حذف العميل
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="إضافة عميل"
        size="sm"
        footer={
          <Button
            fullWidth
            onClick={() => {
              if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
                showToast('يرجى إدخال الاسم ورقم الجوال.', { type: 'error' })
                return
              }
              customers.add({
                id: uid('u'),
                name: newCustomer.name.trim(),
                email: newCustomer.email.trim(),
                phone: newCustomer.phone.trim(),
                password: newCustomer.password || '123456',
                gender: 'undisclosed',
                addresses: newCustomer.city
                  ? [
                      {
                        id: uid('ad'),
                        label: 'العنوان الرئيسي',
                        fullName: newCustomer.name.trim(),
                        phone: newCustomer.phone.trim(),
                        city: newCustomer.city,
                        district: '-',
                        street: '-',
                        isDefault: true,
                      },
                    ]
                  : [],
                savedCards: [],
                blocked: false,
                createdAt: new Date().toISOString(),
              })
              setNewCustomer({ name: '', email: '', phone: '', password: '123456', city: '' })
              setAddOpen(false)
              showToast('تم إضافة العميل.', { type: 'success' })
            }}
          >
            إضافة العميل
          </Button>
        }
      >
        <div className="space-y-3">
          <Input label="الاسم" required value={newCustomer.name} onChange={(event) => setNewCustomer({ ...newCustomer, name: event.target.value })} />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={newCustomer.email}
            onChange={(event) => setNewCustomer({ ...newCustomer, email: event.target.value })}
          />
          <Input label="رقم الجوال" required value={newCustomer.phone} onChange={(event) => setNewCustomer({ ...newCustomer, phone: event.target.value })} />
          <Input
            label="كلمة المرور المبدئية"
            value={newCustomer.password}
            onChange={(event) => setNewCustomer({ ...newCustomer, password: event.target.value })}
          />
          <Select
            label="المدينة"
            value={newCustomer.city}
            onChange={(event) => setNewCustomer({ ...newCustomer, city: event.target.value })}
            placeholder="اختر المدينة"
            options={settings.cities.map((city) => ({ value: city.name, label: city.name }))}
          />
          <p className="flex items-center gap-2 rounded-xl bg-brand-soft p-3 text-[11.5px] text-gray-600">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">{initials(newCustomer.name || 'عميل')}</span>
            سيتمكن العميل من الدخول بالبريد أو رقم الجوال وكلمة المرور المحددة.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف العميل"
        message={`سيتم حذف حساب "${pendingDelete?.name ?? ''}" وكل عناوينه. الطلبات السابقة ستبقى في السجل.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          customers.remove(pendingDelete.id)
          setPendingDelete(null)
          setSelected(null)
          showToast('تم حذف العميل.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

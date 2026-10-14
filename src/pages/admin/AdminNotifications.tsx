import { useMemo, useState } from 'react'
import { Bell, BellRing, CheckCheck, Megaphone, Send, Trash2 } from 'lucide-react'
import type { AppNotification } from '@/types'
import { cn, formatDateTime, formatNumber, relativeTime } from '@/lib/utils'
import { AdminPage, Card, StatCard, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip } from '@/components/ui'
import { ConfirmDialog } from '@/components/ui/overlay'
import { Input, Select, Textarea } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

const TYPE_META: Record<AppNotification['type'], { label: string; emoji: string }> = {
  order: { label: 'طلبات', emoji: '📦' },
  offer: { label: 'عروض', emoji: '🏷️' },
  reminder: { label: 'تذكير', emoji: '⏰' },
  info: { label: 'معلومات', emoji: 'ℹ️' },
}

const TEMPLATES: Array<{ title: string; body: string; type: AppNotification['type']; target: string }> = [
  {
    title: 'خصم خاص لك اليوم',
    body: 'استمتع بخصم 15% على الجوالات اليوم فقط. استخدم كود TECH15 عند الدفع.',
    type: 'offer',
    target: '/offers',
  },
  {
    title: 'تم شحن طلبك',
    body: 'طلبك في الطريق إليك! يمكنك تتبع الشحنة من صفحة طلباتي.',
    type: 'order',
    target: '/orders',
  },
  {
    title: 'منتجات جديدة وصلت',
    body: 'تصفح أحدث الإلكترونيات المضافة إلى المتجر الآن.',
    type: 'info',
    target: '/search',
  },
  {
    title: 'هل تركت شيئًا في السلة؟',
    body: 'منتجاتك بانتظارك! أكمل عملية الشراء قبل نفاد الكمية.',
    type: 'reminder',
    target: '/cart',
  },
]

export default function AdminNotifications() {
  const { notifications, settings, pushNotification, products } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | AppNotification['type']>('all')
  const [tab, setTab] = useState<'admin' | 'customers'>('admin')
  const [form, setForm] = useState({ title: '', body: '', type: 'offer' as AppNotification['type'], target: '/offers' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clearOpen, setClearOpen] = useState(false)

  const adminItems = useMemo(
    () => notifications.items.filter((notification) => notification.forAdmin).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications.items],
  )
  const customerItems = useMemo(
    () => notifications.items.filter((notification) => !notification.forAdmin).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications.items],
  )

  const list = (tab === 'admin' ? adminItems : customerItems).filter((notification) => {
    if (type !== 'all' && notification.type !== type) return false
    const q = query.trim().toLowerCase()
    if (q && !notification.title.toLowerCase().includes(q) && !notification.body.toLowerCase().includes(q)) return false
    return true
  })

  const send = () => {
    const next: Record<string, string> = {}
    if (form.title.trim().length < 3) next.title = 'يرجى إدخال عنوان الإشعار.'
    if (form.body.trim().length < 5) next.body = 'يرجى إدخال نص الإشعار.'
    setErrors(next)
    if (Object.keys(next).length) return

    pushNotification({
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
      target: form.target === 'none' ? undefined : form.target,
    })
    setForm({ title: '', body: '', type: 'offer', target: '/offers' })
    showToast('تم إرسال الإشعار للعملاء.', { type: 'success' })
  }

  return (
    <AdminPage
      title="الإشعارات"
      subtitle="أرسل إشعارات فورية للعملاء وتابع سجل الإشعارات"
      breadcrumbs={['لوحة الإدارة', 'الإشعارات']}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي الإشعارات" value={formatNumber(notifications.items.length)} icon={<Bell className="size-4" />} />
        <StatCard
          label="غير مقروءة (الإدارة)"
          value={formatNumber(adminItems.filter((notification) => !notification.read).length)}
          icon={<BellRing className="size-4" />}
        />
        <StatCard
          label="إشعارات العملاء"
          value={formatNumber(customerItems.length)}
          icon={<Megaphone className="size-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="إرسال إشعار" subtitle="يشبه إشعار Push داخل التطبيق" className="xl:col-span-1">
          <div className="space-y-3">
            <Input
              label="عنوان الإشعار"
              required
              value={form.title}
              error={errors.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <Textarea
              label="نص الإشعار"
              rows={3}
              value={form.body}
              error={errors.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
            />
            <Select
              label="النوع"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as AppNotification['type'] })}
              options={(Object.keys(TYPE_META) as Array<AppNotification['type']>).map((value) => ({
                value,
                label: TYPE_META[value].label,
              }))}
            />
            <Select
              label="عند الضغط يفتح"
              value={form.target}
              onChange={(event) => setForm({ ...form, target: event.target.value })}
              options={[
                { value: '/offers', label: 'شاشة العروض' },
                { value: '/search', label: 'البحث' },
                { value: '/orders', label: 'طلباتي' },
                { value: '/cart', label: 'السلة' },
                { value: '/categories', label: 'الأقسام' },
                { value: 'none', label: 'بدون وجهة' },
              ]}
            />
            <Button fullWidth icon={<Send className="size-4" />} onClick={send}>
              إرسال الإشعار
            </Button>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-2 text-[12px] font-bold text-gray-700">قوالب جاهزة</p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((template) => (
                  <Chip
                    key={template.title}
                    onClick={() =>
                      setForm({ title: template.title, body: template.body, type: template.type, target: template.target })
                    }
                  >
                    {template.title}
                  </Chip>
                ))}
              </div>
            </div>

            <p className="rounded-xl bg-brand-soft p-3 text-[11.5px] leading-5 text-gray-600">
              الإشعارات داخل التطبيق فقط (In-App) بحسب ملاحظات التصميم، ولا يوجد تكامل SMS في هذه النسخة.
            </p>
          </div>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div className="flex gap-2">
                <Chip active={tab === 'admin'} onClick={() => setTab('admin')}>
                  إشعارات الإدارة ({formatNumber(adminItems.length)})
                </Chip>
                <Chip active={tab === 'customers'} onClick={() => setTab('customers')}>
                  إشعارات العملاء ({formatNumber(customerItems.length)})
                </Chip>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<CheckCheck className="size-3.5" />}
                  onClick={() => {
                    list.forEach((notification) => notifications.update(notification.id, { read: true }))
                    showToast('تم تعليم الإشعارات كمقروءة.', { type: 'success' })
                  }}
                >
                  تعليم الكل كمقروء
                </Button>
                <Button size="sm" variant="ghost" className="text-danger" onClick={() => setClearOpen(true)}>
                  حذف المعروضة
                </Button>
              </div>
            </div>

            <div className="px-4 pb-3">
              <Toolbar>
                <Input
                  placeholder="ابحث في الإشعارات..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 min-w-56 flex-1"
                />
                <Select
                  value={type}
                  onChange={(event) => setType(event.target.value as 'all' | AppNotification['type'])}
                  options={[
                    { value: 'all', label: 'كل الأنواع' },
                    ...(Object.keys(TYPE_META) as Array<AppNotification['type']>).map((value) => ({
                      value,
                      label: TYPE_META[value].label,
                    })),
                  ]}
                  className="h-10 w-40"
                />
              </Toolbar>
            </div>

            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {list.map((notification) => (
                <li
                  key={notification.id}
                  className={cn('flex items-start gap-3 px-4 py-3', !notification.read && 'bg-brand-soft/50')}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-[15px] shadow-xs">
                    {TYPE_META[notification.type].emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold text-gray-800">{notification.title}</p>
                      {!notification.read && <Badge tone="brand">جديد</Badge>}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-6 text-gray-600">{notification.body}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {relativeTime(notification.createdAt)} • {formatDateTime(notification.createdAt)}
                      {notification.target ? ` • ${notification.target}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!notification.read && (
                      <Button size="xs" variant="ghost" onClick={() => notifications.update(notification.id, { read: true })}>
                        مقروء
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-danger"
                      icon={<Trash2 className="size-3.5" />}
                      onClick={() => notifications.remove(notification.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </li>
              ))}
              {list.length === 0 && (
                <li className="px-4 py-12 text-center text-[12.5px] text-gray-400">لا توجد إشعارات مطابقة.</li>
              )}
            </ul>
          </Card>

          <Card title="ملخص سريع">
            <div className="grid grid-cols-2 gap-3 text-[12px] text-gray-600 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">طلبات</p>
                <p className="text-[15px] font-extrabold text-gray-900">
                  {formatNumber(notifications.items.filter((notification) => notification.type === 'order').length)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">عروض</p>
                <p className="text-[15px] font-extrabold text-gray-900">
                  {formatNumber(notifications.items.filter((notification) => notification.type === 'offer').length)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">تذكير</p>
                <p className="text-[15px] font-extrabold text-gray-900">
                  {formatNumber(notifications.items.filter((notification) => notification.type === 'reminder').length)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">معلومات</p>
                <p className="text-[15px] font-extrabold text-gray-900">
                  {formatNumber(notifications.items.filter((notification) => notification.type === 'info').length)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11.5px] text-gray-500">
              {formatNumber(products.items.length)} منتج متاح • العملة {settings.currency}
            </p>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="حذف الإشعارات المعروضة"
        message={`سيتم حذف ${formatNumber(list.length)} إشعارًا. لا يمكن التراجع.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setClearOpen(false)}
        onConfirm={() => {
          list.forEach((notification) => notifications.remove(notification.id))
          setClearOpen(false)
          showToast('تم حذف الإشعارات.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

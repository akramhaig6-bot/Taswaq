import { useMemo, useState } from 'react'
import { Copy, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import type { Coupon } from '@/types'
import { copyToClipboard, dateInputValue, formatDate, formatNumber, formatPrice, uid } from '@/lib/utils'
import { AdminPage, Card, DataTable, StatCard, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip } from '@/components/ui'
import { Input, RadioGroup, Select, Textarea, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

interface Draft {
  id?: string
  code: string
  type: 'percent' | 'fixed'
  value: string
  minOrder: string
  maxDiscount: string
  usageLimit: string
  perCustomerLimit: string
  startDate: string
  endDate: string
  active: boolean
  categoryIds: string[]
  audience: 'all' | 'new' | 'list'
  notes: string
}

const blank = (): Draft => ({
  code: '',
  type: 'percent',
  value: '10',
  minOrder: '',
  maxDiscount: '',
  usageLimit: '',
  perCustomerLimit: '',
  startDate: '',
  endDate: '',
  active: true,
  categoryIds: [],
  audience: 'all',
  notes: '',
})

export default function AdminCoupons() {
  const { coupons, categories, orders, settings } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null)

  const usedCodes = useMemo(() => {
    const map = new Map<string, number>()
    orders.items.forEach((order) => {
      if (!order.couponCode) return
      map.set(order.couponCode, (map.get(order.couponCode) ?? 0) + 1)
    })
    return map
  }, [orders.items])

  const isExpired = (coupon: Coupon) => Boolean(coupon.endDate && new Date(coupon.endDate) < new Date())

  const list = useMemo(() => {
    const q = query.trim().toUpperCase()
    return coupons.items
      .filter((coupon) => {
        if (q && !coupon.code.includes(q)) return false
        if (filter === 'active' && (!coupon.active || isExpired(coupon))) return false
        if (filter === 'expired' && !isExpired(coupon)) return false
        if (filter === 'inactive' && coupon.active) return false
        return true
      })
      .sort((a, b) => Number(b.active) - Number(a.active))
  }, [coupons.items, query, filter])

  const save = () => {
    if (!draft) return
    const next: Record<string, string> = {}
    if (!draft.code.trim()) next.code = 'يرجى إدخال كود الكوبون.'
    if (!draft.value || Number(draft.value) <= 0) next.value = 'يرجى إدخال قيمة صحيحة.'
    if (draft.type === 'percent' && Number(draft.value) > 90) next.value = 'النسبة يجب ألا تتجاوز 90%.'
    if (draft.startDate && draft.endDate && new Date(draft.endDate) < new Date(draft.startDate))
      next.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية.'
    const duplicated = coupons.items.some(
      (coupon) => coupon.code.toUpperCase() === draft.code.trim().toUpperCase() && coupon.id !== draft.id,
    )
    if (duplicated) next.code = 'هذا الكود مستخدم مسبقًا.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      code: draft.code.trim().toUpperCase(),
      type: draft.type,
      value: Number(draft.value),
      minOrder: draft.minOrder ? Number(draft.minOrder) : undefined,
      maxDiscount: draft.maxDiscount ? Number(draft.maxDiscount) : undefined,
      usageLimit: draft.usageLimit ? Number(draft.usageLimit) : undefined,
      perCustomerLimit: draft.perCustomerLimit ? Number(draft.perCustomerLimit) : undefined,
      startDate: draft.startDate ? new Date(draft.startDate).toISOString() : undefined,
      endDate: draft.endDate ? new Date(draft.endDate).toISOString() : undefined,
      active: draft.active,
      categoryIds: draft.categoryIds.length ? draft.categoryIds : undefined,
      audience: draft.audience,
    }
    if (draft.id) {
      coupons.update(draft.id, payload)
      showToast('تم تحديث الكوبون.', { type: 'success' })
    } else {
      coupons.add({ id: uid('cp'), usedCount: 0, ...payload })
      showToast('تم إنشاء الكوبون.', { type: 'success' })
    }
    setDraft(null)
  }

  return (
    <AdminPage
      title="الكوبونات"
      subtitle={`${formatNumber(coupons.items.length)} كوبون`}
      breadcrumbs={['لوحة الإدارة', 'الكوبونات']}
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setDraft(blank())}>
          كوبون جديد
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="كوبونات نشطة" value={String(coupons.items.filter((c) => c.active && !isExpired(c)).length)} icon="✅" />
        <StatCard label="كوبونات منتهية" value={String(coupons.items.filter(isExpired).length)} icon="⌛" />
        <StatCard label="مرات الاستخدام" value={formatNumber(coupons.items.reduce((sum, c) => sum + c.usedCount, 0))} icon="🎟️" />
        <StatCard
          label="خصومات مُطبّقة"
          value={formatPrice(orders.items.reduce((sum, order) => sum + order.discount, 0), settings.currency)}
          icon="💸"
        />
      </div>

      <Card>
        <Toolbar>
          <Input
            placeholder="ابحث بكود الكوبون..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 min-w-56 flex-1"
          />
        </Toolbar>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['all', 'active', 'expired', 'inactive'] as const).map((value) => (
            <Chip key={value} active={filter === value} onClick={() => setFilter(value)}>
              {value === 'all' ? 'الكل' : value === 'active' ? 'نشطة' : value === 'expired' ? 'منتهية' : 'معطّلة'}
            </Chip>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4">
          <DataTable<Coupon>
            rows={list}
            emptyText="لا توجد كوبونات مطابقة."
            columns={[
              {
                key: 'code',
                header: 'الكود',
                render: (coupon) => (
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Tag className="size-4" />
                    </span>
                    <div>
                      <p className="font-extrabold tracking-wide text-gray-900">{coupon.code}</p>
                      <p className="text-[11px] text-gray-400">
                        {coupon.audience === 'all' ? 'كل العملاء' : coupon.audience === 'new' ? 'عملاء جدد' : 'قائمة محددة'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-brand"
                      onClick={async () => {
                        await copyToClipboard(coupon.code)
                        showToast('تم نسخ الكود.', { type: 'success' })
                      }}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                ),
              },
              {
                key: 'value',
                header: 'القيمة',
                render: (coupon) => (
                  <span className="font-bold text-gray-900">
                    {coupon.type === 'percent' ? `${formatNumber(coupon.value)}%` : formatPrice(coupon.value, settings.currency)}
                  </span>
                ),
              },
              {
                key: 'limits',
                header: 'الشروط',
                render: (coupon) => (
                  <div className="text-[11.5px] text-gray-600">
                    {coupon.minOrder ? <p>أدنى قيمة: {formatPrice(coupon.minOrder, settings.currency)}</p> : <p>بدون حد أدنى</p>}
                    {coupon.maxDiscount ? <p>أقصى خصم: {formatPrice(coupon.maxDiscount, settings.currency)}</p> : null}
                    {coupon.categoryIds?.length ? <p>أقسام محددة ({coupon.categoryIds.length})</p> : null}
                  </div>
                ),
              },
              {
                key: 'usage',
                header: 'الاستخدام',
                render: (coupon) => (
                  <div className="text-[11.5px] text-gray-600">
                    <p className="font-semibold text-gray-800">
                      {formatNumber(coupon.usedCount)} {coupon.usageLimit ? `/ ${formatNumber(coupon.usageLimit)}` : 'مرة'}
                    </p>
                    <p className="text-gray-400">من الطلبات: {formatNumber(usedCodes.get(coupon.code) ?? 0)}</p>
                  </div>
                ),
              },
              {
                key: 'dates',
                header: 'الفترة',
                render: (coupon) => (
                  <div className="text-[11.5px] text-gray-600">
                    <p>{coupon.startDate ? formatDate(coupon.startDate) : 'الآن'}</p>
                    <p className="text-gray-400">حتى {coupon.endDate ? formatDate(coupon.endDate) : 'غير محدد'}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'الحالة',
                render: (coupon) =>
                  !coupon.active ? (
                    <Badge tone="gray">معطّل</Badge>
                  ) : isExpired(coupon) ? (
                    <Badge tone="danger">منتهي</Badge>
                  ) : (
                    <Badge tone="success">نشط</Badge>
                  ),
              },
              {
                key: 'actions',
                header: 'الإجراءات',
                render: (coupon) => (
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<Pencil className="size-3.5" />}
                      onClick={() =>
                        setDraft({
                          id: coupon.id,
                          code: coupon.code,
                          type: coupon.type,
                          value: String(coupon.value),
                          minOrder: coupon.minOrder ? String(coupon.minOrder) : '',
                          maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
                          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
                          perCustomerLimit: coupon.perCustomerLimit ? String(coupon.perCustomerLimit) : '',
                          startDate: dateInputValue(coupon.startDate),
                          endDate: dateInputValue(coupon.endDate),
                          active: coupon.active,
                          categoryIds: coupon.categoryIds ?? [],
                          audience: coupon.audience,
                          notes: '',
                        })
                      }
                    >
                      تعديل
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className={coupon.active ? 'text-danger' : 'text-success'}
                      onClick={() => coupons.update(coupon.id, { active: !coupon.active })}
                    >
                      {coupon.active ? 'تعطيل' : 'تنشيط'}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-danger"
                      icon={<Trash2 className="size-3.5" />}
                      onClick={() => setPendingDelete(coupon)}
                    >
                      حذف
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button fullWidth onClick={save}>
              {draft?.id ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setDraft(null)}>
              إلغاء
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="كود الكوبون"
                required
                value={draft.code}
                error={errors.code}
                onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })}
                placeholder="أدخل كود الكوبون"
              />
              <div>
                <p className="mb-1.5 text-[12.5px] font-semibold text-gray-700">نوع الخصم</p>
                <RadioGroup
                  value={draft.type}
                  onChange={(value) => setDraft({ ...draft, type: value })}
                  direction="row"
                  options={[
                    { value: 'percent', label: 'نسبة مئوية %' },
                    { value: 'fixed', label: `مبلغ ثابت (${settings.currency})` },
                  ]}
                />
              </div>
              <Input
                label={draft.type === 'percent' ? 'نسبة الخصم %' : `قيمة الخصم (${settings.currency})`}
                required
                type="number"
                value={draft.value}
                error={errors.value}
                onChange={(event) => setDraft({ ...draft, value: event.target.value })}
              />
              <Input
                label={`الحد الأدنى للطلب (${settings.currency})`}
                type="number"
                value={draft.minOrder}
                onChange={(event) => setDraft({ ...draft, minOrder: event.target.value })}
              />
              <Input
                label={`الحد الأقصى للخصم (${settings.currency})`}
                type="number"
                value={draft.maxDiscount}
                onChange={(event) => setDraft({ ...draft, maxDiscount: event.target.value })}
              />
              <Input
                label="حد الاستخدام الكلي"
                type="number"
                value={draft.usageLimit}
                onChange={(event) => setDraft({ ...draft, usageLimit: event.target.value })}
              />
              <Input
                label="حد الاستخدام لكل عميل"
                type="number"
                value={draft.perCustomerLimit}
                onChange={(event) => setDraft({ ...draft, perCustomerLimit: event.target.value })}
              />
              <Select
                label="الفئة المستهدفة"
                value={draft.audience}
                onChange={(event) => setDraft({ ...draft, audience: event.target.value as 'all' | 'new' | 'list' })}
                options={[
                  { value: 'all', label: 'كل العملاء' },
                  { value: 'new', label: 'العملاء الجدد فقط' },
                  { value: 'list', label: 'قائمة مخصصة' },
                ]}
              />
              <Input
                label="تاريخ البداية"
                type="date"
                value={draft.startDate}
                onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
              />
              <Input
                label="تاريخ الانتهاء"
                type="date"
                value={draft.endDate}
                error={errors.endDate}
                onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
              />
            </div>

            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold text-gray-700">تخصيص لأقسام (اختياري)</p>
              <div className="flex flex-wrap gap-2">
                {categories.items
                  .filter((category) => !category.parentId)
                  .map((category) => (
                    <Chip
                      key={category.id}
                      active={draft.categoryIds.includes(category.id)}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          categoryIds: draft.categoryIds.includes(category.id)
                            ? draft.categoryIds.filter((id) => id !== category.id)
                            : [...draft.categoryIds, category.id],
                        })
                      }
                    >
                      {category.name}
                    </Chip>
                  ))}
              </div>
            </div>

            <Textarea
              label="ملاحظات داخلية"
              rows={2}
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />

            <Toggle
              checked={draft.active}
              onChange={(checked) => setDraft({ ...draft, active: checked })}
              label="الكوبون مفعّل"
              hint="يمكن إيقافه مؤقتًا دون حذفه"
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف الكوبون"
        message={`سيتم حذف الكوبون "${pendingDelete?.code ?? ''}" نهائيًا.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) coupons.remove(pendingDelete.id)
          setPendingDelete(null)
          showToast('تم حذف الكوبون.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

import { useState } from 'react'
import { ArrowDown, ArrowUp, Eye, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Banner, BannerTargetType, SectionKind } from '@/types'
import { BANNER_THEMES, bannerImage, bannerTheme } from '@/lib/artwork'
import { cn, dateInputValue, formatDate, uid } from '@/lib/utils'
import { AdminPage, Card, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip } from '@/components/ui'
import { Input, Select, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { ImagePicker } from '@/components/ui/ImageUploader'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

interface Draft {
  id?: string
  title: string
  subtitle: string
  image: string
  theme: string
  targetType: BannerTargetType
  targetValue: string
  startDate: string
  endDate: string
  active: boolean
}

const blank = (): Draft => ({
  title: '',
  subtitle: '',
  image: '',
  theme: BANNER_THEMES[0]?.id ?? 'theme-1',
  targetType: 'none',
  targetValue: '',
  startDate: '',
  endDate: '',
  active: true,
})

const SECTION_LABELS: Record<SectionKind, string> = {
  banners: 'البانرات (سلايدر)',
  categories: 'الأقسام',
  deals: 'عروض اليوم',
  best: 'الأكثر مبيعًا',
  new: 'وصل حديثًا',
  brands: 'العلامات التجارية',
  custom: 'قسم مخصص',
}

export default function AdminBanners() {
  const { banners, products, categories, settings, updateSettings } = useAppData()
  const { showToast } = useToast()

  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null)
  const [preview, setPreview] = useState<Banner | null>(null)

  const ordered = [...banners.items].sort((a, b) => a.order - b.order)

  const save = () => {
    if (!draft) return
    const next: Record<string, string> = {}
    if (!draft.title.trim()) next.title = 'يرجى إدخال عنوان البانر.'
    if (draft.targetType !== 'none' && !draft.targetValue.trim()) next.targetValue = 'يرجى تحديد وجهة البانر.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || undefined,
      image: draft.image || bannerImage(draft.theme),
      theme: draft.theme,
      target: { type: draft.targetType, value: draft.targetValue.trim() || undefined },
      startDate: draft.startDate ? new Date(draft.startDate).toISOString() : undefined,
      endDate: draft.endDate ? new Date(draft.endDate).toISOString() : undefined,
      active: draft.active,
    }
    if (draft.id) {
      banners.update(draft.id, payload)
      showToast('تم تحديث البانر.', { type: 'success' })
    } else {
      banners.add({ id: uid('bn'), order: banners.items.length + 1, ...payload })
      showToast('تم إضافة البانر.', { type: 'success' })
    }
    setDraft(null)
  }

  const move = (banner: Banner, direction: -1 | 1) => {
    const index = ordered.findIndex((item) => item.id === banner.id)
    const target = ordered[index + direction]
    if (!target) return
    banners.update(banner.id, { order: target.order })
    banners.update(target.id, { order: banner.order })
  }

  const targetValueOptions = () => {
    if (!draft) return []
    if (draft.targetType === 'product') return products.items.map((product) => ({ value: product.id, label: product.name }))
    if (draft.targetType === 'category') return categories.items.map((category) => ({ value: category.id, label: category.name }))
    if (draft.targetType === 'offer') return [{ value: 'offers', label: 'شاشة العروض' }]
    return []
  }

  const updateSection = (id: string, patch: Partial<(typeof settings.sections)[number]>) => {
    updateSettings({ sections: settings.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)) })
  }

  return (
    <AdminPage
      title="البانرات والأقسام"
      subtitle="إدارة سلايدر الصفحة الرئيسية وأقسام الواجهة"
      breadcrumbs={['لوحة الإدارة', 'البانرات']}
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setDraft(blank())}>
          بانر جديد
        </Button>
      }
    >
      <Card title="بانرات الصفحة الرئيسية" subtitle={`${ordered.length} بانر`} padded={false}>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((banner, index) => {
            const theme = bannerTheme(banner.theme)
            const expired = Boolean(banner.endDate && new Date(banner.endDate) < new Date())
            return (
              <div key={banner.id} className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="relative h-28">
                  <img src={banner.image} alt="" className="size-full object-cover" />
                  <span
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, ${theme.from}dd, ${theme.to}22)` }}
                  />
                  <div className="absolute inset-x-3 bottom-2 text-white">
                    <p className="text-[13px] font-extrabold drop-shadow">{banner.title}</p>
                    {banner.subtitle && <p className="text-[11px] opacity-90">{banner.subtitle}</p>}
                  </div>
                  <span className="absolute top-2 start-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {!banner.active ? <Badge tone="gray">معطّل</Badge> : expired ? <Badge tone="danger">منتهي</Badge> : <Badge tone="success">نشط</Badge>}
                    <Badge tone="brand">
                      {banner.target.type === 'none'
                        ? 'بدون رابط'
                        : banner.target.type === 'product'
                          ? 'منتج'
                          : banner.target.type === 'category'
                            ? 'قسم'
                            : banner.target.type === 'offer'
                              ? 'العروض'
                              : 'رابط خارجي'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {banner.startDate ? formatDate(banner.startDate) : 'الآن'} — {banner.endDate ? formatDate(banner.endDate) : 'بدون انتهاء'}
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button size="xs" variant="ghost" onClick={() => move(banner, -1)}>
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => move(banner, 1)}>
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button size="xs" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => setPreview(banner)}>
                      معاينة
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<Pencil className="size-3.5" />}
                      onClick={() =>
                        setDraft({
                          id: banner.id,
                          title: banner.title ?? '',
                          subtitle: banner.subtitle ?? '',
                          image: banner.image,
                          theme: banner.theme,
                          targetType: banner.target.type,
                          targetValue: banner.target.value ?? '',
                          startDate: dateInputValue(banner.startDate),
                          endDate: dateInputValue(banner.endDate),
                          active: banner.active,
                        })
                      }
                    >
                      تعديل
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => banners.update(banner.id, { active: !banner.active })}>
                      {banner.active ? 'تعطيل' : 'تنشيط'}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-danger"
                      icon={<Trash2 className="size-3.5" />}
                      onClick={() => setPendingDelete(banner)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setDraft(blank())}
            className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-brand hover:text-brand"
          >
            <ImagePlus className="size-6" />
            <span className="text-[12.5px] font-semibold">إضافة بانر</span>
          </button>
        </div>
      </Card>

      <Card
        title="أقسام الصفحة الرئيسية"
        subtitle="تحكم في ترتيب الأقسام وإظهارها — التغييرات تُطبّق مباشرة على التطبيق"
      >
        <ul className="space-y-2">
          {[...settings.sections]
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <li key={section.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-[12px] font-bold text-gray-500">
                  {section.order}
                </span>
                <div className="min-w-40 flex-1">
                  <p className="text-[13px] font-bold text-gray-800">
                    {section.title}
                    <span className="ms-2 text-[11px] font-normal text-gray-400">{SECTION_LABELS[section.kind]}</span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {section.layout === 'grid' ? 'شبكة' : 'صف أفقي'} •{' '}
                    {section.kind === 'custom'
                      ? `${section.productIds?.length ?? 0} منتج مخصص`
                      : `حتى ${section.limit ?? 8} عنصر`}
                  </p>
                </div>
                <Select
                  value={section.layout}
                  onChange={(event) => updateSection(section.id, { layout: event.target.value as 'row' | 'grid' })}
                  options={[
                    { value: 'row', label: 'صف أفقي' },
                    { value: 'grid', label: 'شبكة' },
                  ]}
                  className="h-9 w-28"
                />
                <Input
                  type="number"
                  value={String(section.limit ?? 8)}
                  onChange={(event) => updateSection(section.id, { limit: Number(event.target.value) })}
                  className="h-9 w-20"
                />
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    const sorted = [...settings.sections].sort((a, b) => a.order - b.order)
                    const index = sorted.findIndex((item) => item.id === section.id)
                    const target = sorted[index - 1]
                    if (!target) return
                    updateSection(section.id, { order: target.order })
                    updateSection(target.id, { order: section.order })
                  }}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    const sorted = [...settings.sections].sort((a, b) => a.order - b.order)
                    const index = sorted.findIndex((item) => item.id === section.id)
                    const target = sorted[index + 1]
                    if (!target) return
                    updateSection(section.id, { order: target.order })
                    updateSection(target.id, { order: section.order })
                  }}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Toggle
                  checked={section.enabled}
                  onChange={(checked) => updateSection(section.id, { enabled: checked })}
                  label=""
                />
              </li>
            ))}
        </ul>
      </Card>

      <Card title="أقسام مخصصة" subtitle="أضف قسمًا يعرض منتجات تختارها بنفسك">
        <Toolbar>
          <Input
            placeholder="اسم القسم المخصص"
            id="custom-section-title"
            className="h-10 min-w-56 flex-1"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('custom-section-title') as HTMLInputElement | null
              const title = input?.value.trim()
              if (!title) {
                showToast('يرجى إدخال اسم القسم.', { type: 'error' })
                return
              }
              updateSettings({
                sections: [
                  ...settings.sections,
                  {
                    id: uid('sec'),
                    kind: 'custom',
                    title,
                    layout: 'row',
                    enabled: true,
                    order: settings.sections.length + 1,
                    productIds: products.items.slice(0, 6).map((product) => product.id),
                    limit: 6,
                  },
                ],
              })
              if (input) input.value = ''
              showToast('تم إضافة القسم المخصص.', { type: 'success' })
            }}
          >
            إضافة قسم
          </Button>
        </Toolbar>
        <div className="mt-3 flex flex-wrap gap-2">
          {settings.sections
            .filter((section) => section.kind === 'custom')
            .map((section) => (
              <Chip
                key={section.id}
                onRemove={() => updateSettings({ sections: settings.sections.filter((item) => item.id !== section.id) })}
              >
                {section.title}
              </Chip>
            ))}
          {settings.sections.filter((section) => section.kind === 'custom').length === 0 && (
            <p className="text-[12px] text-gray-400">لا توجد أقسام مخصصة بعد.</p>
          )}
        </div>
      </Card>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'تعديل البانر' : 'إضافة بانر'}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button fullWidth onClick={save}>
              {draft?.id ? 'حفظ التعديلات' : 'إضافة البانر'}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setDraft(null)}>
              إلغاء
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-3">
            <Input
              label="عنوان البانر"
              required
              value={draft.title}
              error={errors.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
            <Input
              label="العنوان الفرعي"
              value={draft.subtitle}
              onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
            />

            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold text-gray-700">الخلفية</p>
              <div className="flex flex-wrap gap-2">
                {BANNER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, theme: theme.id, image: bannerImage(theme.id) })}
                    className={cn(
                      'h-14 w-24 overflow-hidden rounded-xl border-2',
                      draft.theme === theme.id ? 'border-brand' : 'border-transparent hover:border-gray-200',
                    )}
                    style={{ background: `linear-gradient(120deg, ${theme.from}, ${theme.to})` }}
                  >
                    <span className="sr-only">{theme.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <ImagePicker
              label="أو ارفع صورة البانر (مقاس مقترح 1200×600)"
              value={draft.image}
              onChange={(value) => setDraft({ ...draft, image: value })}
              aspect="banner"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="وجهة البانر"
                value={draft.targetType}
                onChange={(event) => setDraft({ ...draft, targetType: event.target.value as BannerTargetType, targetValue: '' })}
                options={[
                  { value: 'none', label: 'بدون رابط' },
                  { value: 'product', label: 'منتج' },
                  { value: 'category', label: 'قسم' },
                  { value: 'offer', label: 'شاشة العروض' },
                  { value: 'external', label: 'رابط خارجي' },
                ]}
              />
              {draft.targetType === 'external' ? (
                <Input
                  label="الرابط الخارجي"
                  value={draft.targetValue}
                  error={errors.targetValue}
                  onChange={(event) => setDraft({ ...draft, targetValue: event.target.value })}
                  placeholder="https://"
                />
              ) : draft.targetType === 'none' ? (
                <div />
              ) : (
                <Select
                  label="اختر العنصر"
                  value={draft.targetValue}
                  error={errors.targetValue}
                  onChange={(event) => setDraft({ ...draft, targetValue: event.target.value })}
                  placeholder="اختر"
                  options={targetValueOptions()}
                />
              )}
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
                onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
              />
            </div>

            <Toggle
              checked={draft.active}
              onChange={(checked) => setDraft({ ...draft, active: checked })}
              label="البانر نشط"
              hint="سيظهر في أعلى الصفحة الرئيسية"
            />
          </div>
        )}
      </Modal>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title="معاينة البانر" size="md">
        {preview && (
          <div className="overflow-hidden rounded-2xl">
            <div className="relative h-40">
              <img src={preview.image} alt="" className="size-full object-cover" />
              <span
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${bannerTheme(preview.theme).from}dd, ${bannerTheme(preview.theme).to}22)`,
                }}
              />
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="text-[17px] font-extrabold">{preview.title}</p>
                {preview.subtitle && <p className="text-[12px] opacity-90">{preview.subtitle}</p>}
              </div>
            </div>
            <p className="p-3 text-center text-[11.5px] text-gray-500">
              هكذا سيظهر البانر داخل التطبيق (عرض 480px على الجوال).
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف البانر"
        message={`سيتم حذف البانر "${pendingDelete?.title ?? ''}".`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) banners.remove(pendingDelete.id)
          setPendingDelete(null)
          showToast('تم حذف البانر.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

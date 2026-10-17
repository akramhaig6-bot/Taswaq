import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Save, Trash2, X } from 'lucide-react'
import type { OptionType, Product, ProductKind, ProductOption, ProductStatus, ProductVariant, Specification } from '@/types'
import { cn, dateInputValue, formatNumber, uid } from '@/lib/utils'
import { AdminPage, Card, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip } from '@/components/ui'
import { Checkbox, Input, Select, Textarea, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { MultiImagePicker } from '@/components/ui/ImageUploader'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

const OPTION_TYPES: Array<{ value: OptionType; label: string }> = [
  { value: 'color', label: 'اللون' },
  { value: 'storage', label: 'السعة التخزينية' },
  { value: 'size', label: 'المقاس' },
  { value: 'custom', label: 'خيار مخصص' },
]

function emptyProduct(threshold: number): Product {
  return {
    id: uid('p'),
    kind: 'physical',
    requiresShipping: true,
    name: '',
    sku: `SWQ-${Math.floor(Math.random() * 9000 + 1000)}`,
    shortDescription: '',
    description: '',
    images: [],
    price: 0,
    stock: 0,
    trackStock: true,
    lowStockThreshold: threshold,
    allowBackorder: false,
    categoryIds: [],
    tags: [],
    options: [],
    variants: [],
    specifications: [],
    relatedIds: [],
    status: 'published',
    rating: 0,
    reviewCount: 0,
    sales: 0,
    createdAt: new Date().toISOString(),
  }
}

function buildVariants(options: ProductOption[], basePrice: number): ProductVariant[] {
  if (options.length === 0) return []
  const [first, second] = options
  const variants: ProductVariant[] = []
  ;(first?.values ?? []).forEach((valueA) => {
    const listB = second?.values ?? [undefined]
    listB.forEach((valueB) => {
      const combination: Record<string, string> = { [first.id]: valueA.id }
      if (valueB) combination[second.id] = valueB.id
      variants.push({
        id: `var-${valueA.id}-${valueB?.id ?? 'x'}`,
        combination,
        sku: `SKU-${valueA.id}-${valueB?.id ?? 'x'}`.toUpperCase(),
        price: basePrice + (valueA.priceDelta ?? 0) + (valueB?.priceDelta ?? 0),
        stock: Math.min(valueA.stock ?? 6, valueB?.stock ?? 6),
      })
    })
  })
  return variants
}

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, categories, brands, settings } = useAppData()
  const { showToast } = useToast()

  const isNew = !id || id === 'new'
  const existing = isNew ? undefined : products.items.find((product) => product.id === id)

  const [form, setForm] = useState<Product>(() => existing ?? emptyProduct(settings.lowStockThreshold))
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [optionModal, setOptionModal] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [optionDraft, setOptionDraft] = useState<{ type: OptionType; label: string; values: string }>({
    type: 'color',
    label: '',
    values: '',
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (existing) {
      setForm(existing)
      setDirty(false)
    }
  }, [existing])

  const set = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const updateKind = (kind: ProductKind) => {
    setForm((prev) => ({
      ...prev,
      kind,
      requiresShipping: kind === 'physical',
      trackStock: kind === 'physical' ? prev.trackStock : false,
    }))
    setDirty(true)
  }

  const rootCategories = categories.items.filter((category) => !category.parentId)
  const childCategories = categories.items.filter((category) => category.parentId)

  const relatedOptions = useMemo(
    () => products.items.filter((product) => product.id !== form.id).slice(0, 60),
    [products.items, form.id],
  )

  const validate = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 3) next.name = 'يرجى إدخال اسم المنتج (3 أحرف على الأقل).'
    if (!form.price || form.price <= 0) next.price = 'يرجى إدخال سعر صحيح.'
    if (form.categoryIds.length === 0) next.categoryIds = 'يرجى اختيار قسم واحد على الأقل.'
    if (form.images.length === 0) next.images = 'يرجى إضافة صورة واحدة على الأقل.'
    if (form.kind === 'digital' && !form.deliveryInstructions?.trim()) next.deliveryInstructions = 'أدخل المحتوى أو تعليمات التسليم الرقمي.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = (status: ProductStatus) => {
    if (status !== 'draft' && !validate()) {
      showToast('يرجى تعبئة الحقول الإلزامية.', { type: 'error' })
      return
    }
    const payload: Product = {
      ...form,
      status,
      variants: buildVariants(form.options, form.price),
      tags: form.tags.filter(Boolean),
    }
    if (isNew) products.add(payload)
    else products.update(payload.id, payload)
    setDirty(false)
    showToast(status === 'draft' ? 'تم حفظ المنتج كمسودة.' : 'تم حفظ المنتج ونشره بنجاح.', { type: 'success' })
    if (isNew) navigate(`/admin/products/${payload.id}/edit`, { replace: true })
  }

  const addOption = () => {
    const values = optionDraft.values
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    if (values.length === 0) {
      showToast('يرجى إدخال قيمة واحدة على الأقل.', { type: 'error' })
      return
    }
    const label =
      optionDraft.label.trim() || OPTION_TYPES.find((type) => type.value === optionDraft.type)?.label || 'خيار'
    const option: ProductOption = {
      id: uid('opt'),
      type: optionDraft.type,
      label,
      values: values.map((value) => ({
        id: uid('val'),
        label: value,
        hex: optionDraft.type === 'color' ? '#94a3b8' : undefined,
        priceDelta: 0,
        stock: 10,
        available: true,
      })),
    }
    set('options', [...form.options, option])
    setOptionDraft({ type: 'color', label: '', values: '' })
    setOptionModal(false)
  }

  const updateOptionValue = (optionId: string, valueId: string, patch: Partial<ProductOption['values'][number]>) => {
    set(
      'options',
      form.options.map((option) =>
        option.id !== optionId
          ? option
          : { ...option, values: option.values.map((value) => (value.id === valueId ? { ...value, ...patch } : value)) },
      ),
    )
  }

  return (
    <AdminPage
      title={isNew ? 'إضافة منتج جديد' : `تعديل: ${form.name}`}
      subtitle={isNew ? 'املأ بيانات المنتج ثم احفظه كمسودة أو انشره' : `SKU: ${form.sku}`}
      breadcrumbs={['لوحة الإدارة', 'المنتجات', isNew ? 'إضافة منتج' : 'تعديل']}
      actions={
        <>
          <Button variant="ghost" onClick={() => (dirty ? setCancelConfirm(true) : navigate('/admin/products'))}>
            إلغاء
          </Button>
          <Button variant="outline" onClick={() => save('draft')}>
            حفظ كمسودة
          </Button>
          <Button icon={<Save className="size-4" />} onClick={() => save('published')}>
            حفظ ونشر
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ------------------------- العمود الرئيسي ------------------------- */}
        <div className="space-y-4 xl:col-span-2">
          <Card title="المعلومات الأساسية">
            <div className="space-y-3">
              <Input
                label="اسم المنتج"
                required
                value={form.name}
                error={errors.name}
                onChange={(event) => set('name', event.target.value)}
              />
              <Toolbar>
                <Input
                  label="SKU"
                  value={form.sku}
                  onChange={(event) => set('sku', event.target.value)}
                  wrapperClassName="min-w-40"
                />
                <Input
                  label="الرابط (Slug)"
                  value={form.seo?.slug ?? ''}
                  placeholder="product-slug"
                  onChange={(event) => set('seo', { ...form.seo, slug: event.target.value })}
                  wrapperClassName="min-w-40"
                />
              </Toolbar>
              <Select
                label="نوع المنتج أو العرض"
                value={form.kind ?? 'physical'}
                onChange={(event) => updateKind(event.target.value as ProductKind)}
                options={[
                  { value: 'physical', label: 'منتج مادي — مخزون وشحن' },
                  { value: 'digital', label: 'منتج رقمي — تسليم إلكتروني' },
                  { value: 'service', label: 'خدمة — حجز أو تنفيذ' },
                ]}
                hint="يحدد النوع طريقة التسليم ومتطلبات عنوان الشحن عند إتمام الطلب."
              />
              {(form.kind === 'digital' || form.kind === 'service') && (
                <Textarea
                  label={form.kind === 'digital' ? 'المحتوى الرقمي أو تعليمات التسليم' : 'تفاصيل تنفيذ الخدمة'}
                  rows={5}
                  value={form.deliveryInstructions ?? ''}
                  error={errors.deliveryInstructions}
                  onChange={(event) => set('deliveryInstructions', event.target.value)}
                  hint={form.kind === 'digital' ? 'يُحفظ هذا المحتوى داخل الطلب ولا يظهر للعميل إلا بعد تأكيد الدفع.' : 'يمكن إضافة تعليمات أو معلومات تظهر للعميل ضمن تفاصيل طلبه.'}
                />
              )}
              <Textarea
                label="الوصف المختصر"
                rows={2}
                value={form.shortDescription ?? ''}
                onChange={(event) => set('shortDescription', event.target.value)}
              />
              <Textarea
                label="الوصف الكامل"
                rows={6}
                value={form.description}
                onChange={(event) => set('description', event.target.value)}
                hint="يدعم **عريض** و *مائل* والقوائم التي تبدأ بـ - أو •"
              />
            </div>
          </Card>

          <Card title="الصور" subtitle="أول صورة تُعرض كصورة رئيسية">
            <MultiImagePicker values={form.images} onChange={(values) => set('images', values)} max={6} />
            {errors.images && <p className="mt-1 text-[12px] font-semibold text-danger">{errors.images}</p>}
          </Card>

          <Card title="التسعير">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="السعر الأساسي"
                required
                type="number"
                value={String(form.price)}
                error={errors.price}
                onChange={(event) => set('price', Number(event.target.value))}
              />
              <Input
                label="السعر قبل الخصم"
                type="number"
                value={form.compareAtPrice ? String(form.compareAtPrice) : ''}
                onChange={(event) => set('compareAtPrice', event.target.value ? Number(event.target.value) : undefined)}
              />
              <Input
                label="بداية الخصم"
                type="date"
                value={dateInputValue(form.discountStart)}
                onChange={(event) => set('discountStart', event.target.value ? new Date(event.target.value).toISOString() : undefined)}
              />
              <Input
                label="نهاية الخصم"
                type="date"
                value={dateInputValue(form.discountEnd)}
                onChange={(event) => set('discountEnd', event.target.value ? new Date(event.target.value).toISOString() : undefined)}
              />
              <Input
                label="التكلفة (للتقارير فقط)"
                type="number"
                value={form.cost ? String(form.cost) : ''}
                onChange={(event) => set('cost', event.target.value ? Number(event.target.value) : undefined)}
              />
            </div>
          </Card>

          <Card title="المخزون">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="الكمية / السعة المتوفرة"
                type="number"
                min={0}
                disabled={!form.trackStock}
                value={String(form.stock)}
                onChange={(event) => set('stock', Number(event.target.value))}
              />
              <Input
                label="حد التنبيه"
                type="number"
                value={String(form.lowStockThreshold)}
                onChange={(event) => set('lowStockThreshold', Number(event.target.value))}
              />
            </div>
            <div className="mt-3 space-y-3">
              <Toggle
                checked={form.trackStock}
                onChange={(checked) => set('trackStock', checked)}
                label={form.kind === 'service' ? 'تتبع السعة أو عدد الحجوزات' : form.kind === 'digital' ? 'تتبع عدد التراخيص المتاحة' : 'تتبع المخزون'}
                hint="عند إيقافه يبقى العرض متاحًا دون حد للكمية."
              />
              <Toggle
                checked={form.allowBackorder}
                onChange={(checked) => set('allowBackorder', checked)}
                label="السماح بالطلب عند نفاد المخزون"
              />
              <Toggle
                checked={form.requiresShipping ?? (form.kind ?? 'physical') === 'physical'}
                onChange={(checked) => set('requiresShipping', checked)}
                label="يتطلب عنوانًا وتوصيلًا"
                hint="فعّله للخدمات الميدانية أو المنتجات التي تحتاج عنوان استلام."
              />
            </div>
          </Card>

          <Card
            title="الخيارات (Variants)"
            subtitle="اللون، السعة، المقاس، أو أي خيار مخصص"
            actions={
              <Button size="sm" variant="outline" icon={<Plus className="size-3.5" />} onClick={() => setOptionModal(true)}>
                إضافة خيار
              </Button>
            }
          >
            {form.options.length === 0 ? (
              <p className="py-4 text-center text-[12.5px] text-gray-400">لا توجد خيارات لهذا المنتج.</p>
            ) : (
              <div className="space-y-4">
                {form.options.map((option) => (
                  <div key={option.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-bold text-gray-800">
                        {option.label}
                        <Badge tone="gray" className="ms-2">
                          {option.type === 'color' ? 'لون' : option.type === 'storage' ? 'سعة' : option.type === 'size' ? 'مقاس' : 'مخصص'}
                        </Badge>
                      </p>
                      <button
                        type="button"
                        onClick={() => set('options', form.options.filter((item) => item.id !== option.id))}
                        className="flex size-7 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {option.values.map((value) => (
                        <li key={value.id} className="flex flex-wrap items-center gap-2">
                          {option.type === 'color' && (
                            <input
                              type="color"
                              value={value.hex ?? '#94a3b8'}
                              onChange={(event) => updateOptionValue(option.id, value.id, { hex: event.target.value })}
                              className="size-8 cursor-pointer rounded-lg border border-gray-200"
                            />
                          )}
                          <input
                            value={value.label}
                            onChange={(event) => updateOptionValue(option.id, value.id, { label: event.target.value })}
                            className="h-9 min-w-28 flex-1 rounded-lg border border-gray-200 px-2 text-[12.5px]"
                          />
                          <input
                            type="number"
                            value={String(value.priceDelta ?? 0)}
                            onChange={(event) =>
                              updateOptionValue(option.id, value.id, { priceDelta: Number(event.target.value) })
                            }
                            className="h-9 w-24 rounded-lg border border-gray-200 px-2 text-[12.5px]"
                            placeholder="فرق السعر"
                            title="فرق السعر"
                          />
                          <input
                            type="number"
                            value={String(value.stock ?? 0)}
                            onChange={(event) => updateOptionValue(option.id, value.id, { stock: Number(event.target.value) })}
                            className="h-9 w-20 rounded-lg border border-gray-200 px-2 text-[12.5px]"
                            placeholder="المخزون"
                            title="المخزون"
                          />
                          <label className="flex items-center gap-1.5 text-[11.5px] text-gray-600">
                            <input
                              type="checkbox"
                              checked={value.available}
                              onChange={(event) => updateOptionValue(option.id, value.id, { available: event.target.checked })}
                            />
                            متاح
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              set(
                                'options',
                                form.options.map((item) =>
                                  item.id !== option.id
                                    ? item
                                    : { ...item, values: item.values.filter((v) => v.id !== value.id) },
                                ),
                              )
                            }
                            className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div>
                  <p className="mb-2 text-[12.5px] font-bold text-gray-700">
                    جدول التركيبات ({buildVariants(form.options, form.price).length})
                  </p>
                  <div className="thin-scroll max-h-56 overflow-y-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[420px] text-[12px]">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-start">التركيبة</th>
                          <th className="px-3 py-2 text-start">SKU</th>
                          <th className="px-3 py-2 text-start">السعر</th>
                          <th className="px-3 py-2 text-start">المخزون</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buildVariants(form.options, form.price).map((variant) => (
                          <tr key={variant.id} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-700">
                              {Object.values(variant.combination)
                                .map((valueId) =>
                                  form.options.flatMap((option) => option.values).find((value) => value.id === valueId)?.label,
                                )
                                .filter(Boolean)
                                .join(' / ')}
                            </td>
                            <td className="px-3 py-2 text-gray-400">{variant.sku}</td>
                            <td className="px-3 py-2 font-semibold text-gray-800">{formatNumber(variant.price)}</td>
                            <td className="px-3 py-2 text-gray-700">{formatNumber(variant.stock)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card
            title="المواصفات"
            actions={
              <Button
                size="sm"
                variant="outline"
                icon={<Plus className="size-3.5" />}
                onClick={() =>
                  set('specifications', [...form.specifications, { id: uid('sp'), key: '', value: '' } as Specification])
                }
              >
                إضافة مواصفة
              </Button>
            }
          >
            {form.specifications.length === 0 ? (
              <p className="py-4 text-center text-[12.5px] text-gray-400">لا توجد مواصفات.</p>
            ) : (
              <ul className="space-y-2">
                {form.specifications.map((spec) => (
                  <li key={spec.id} className="flex items-center gap-2">
                    <input
                      value={spec.key}
                      placeholder="اسم المواصفة (مثلًا: الشاشة)"
                      onChange={(event) =>
                        set(
                          'specifications',
                          form.specifications.map((item) =>
                            item.id === spec.id ? { ...item, key: event.target.value } : item,
                          ),
                        )
                      }
                      className="h-9 min-w-32 flex-1 rounded-lg border border-gray-200 px-2 text-[12.5px]"
                    />
                    <input
                      value={spec.value}
                      placeholder="القيمة"
                      onChange={(event) =>
                        set(
                          'specifications',
                          form.specifications.map((item) =>
                            item.id === spec.id ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                      className="h-9 min-w-32 flex-[2] rounded-lg border border-gray-200 px-2 text-[12.5px]"
                    />
                    <button
                      type="button"
                      onClick={() => set('specifications', form.specifications.filter((item) => item.id !== spec.id))}
                      className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="SEO">
            <div className="space-y-3">
              <Input
                label="عنوان SEO"
                value={form.seo?.title ?? ''}
                onChange={(event) => set('seo', { ...form.seo, title: event.target.value })}
              />
              <Textarea
                label="وصف SEO"
                rows={2}
                value={form.seo?.description ?? ''}
                onChange={(event) => set('seo', { ...form.seo, description: event.target.value })}
              />
              <Input
                label="الكلمات المفتاحية"
                placeholder="جوال, آيفون, ذكي"
                value={form.seo?.keywords ?? ''}
                onChange={(event) => set('seo', { ...form.seo, keywords: event.target.value })}
              />
            </div>
          </Card>
        </div>

        {/* ------------------------- العمود الجانبي ------------------------- */}
        <div className="space-y-4">
          <Card title="الحالة والنشر">
            <Select
              label="الحالة"
              value={form.status}
              onChange={(event) => set('status', event.target.value as ProductStatus)}
              options={[
                { value: 'published', label: 'منشور' },
                { value: 'draft', label: 'مسودة' },
                { value: 'hidden', label: 'مخفي' },
              ]}
            />
            <div className="mt-3 space-y-2">
              <Checkbox checked={Boolean(form.isNew)} onChange={(checked) => set('isNew', checked)} label="شارة: جديد" />
              <Checkbox
                checked={Boolean(form.isBestSeller)}
                onChange={(checked) => set('isBestSeller', checked)}
                label="شارة: الأكثر مبيعًا"
              />
              <Checkbox
                checked={Boolean(form.isFeatured)}
                onChange={(checked) => set('isFeatured', checked)}
                label="شارة: مميز"
              />
            </div>
          </Card>

          <Card title="التصنيف">
            <p className="mb-1.5 text-[12.5px] font-semibold text-gray-700">
              الأقسام <span className="text-danger">*</span>
            </p>
            <div className="thin-scroll max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-gray-200 p-2.5">
              {rootCategories.map((category) => (
                <div key={category.id}>
                  <Checkbox
                    checked={form.categoryIds.includes(category.id)}
                    onChange={(checked) =>
                      set(
                        'categoryIds',
                        checked
                          ? [...form.categoryIds, category.id]
                          : form.categoryIds.filter((categoryId) => categoryId !== category.id),
                      )
                    }
                    label={<span className="font-semibold">{category.name}</span>}
                  />
                  <div className="ms-4 mt-1 space-y-1">
                    {childCategories
                      .filter((child) => child.parentId === category.id)
                      .map((child) => (
                        <Checkbox
                          key={child.id}
                          checked={form.categoryIds.includes(child.id)}
                          onChange={(checked) =>
                            set(
                              'categoryIds',
                              checked
                                ? [...form.categoryIds, child.id]
                                : form.categoryIds.filter((categoryId) => categoryId !== child.id),
                            )
                          }
                          label={child.name}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.categoryIds && <p className="mt-1 text-[12px] font-semibold text-danger">{errors.categoryIds}</p>}

            <div className="mt-3">
              <Select
                label="العلامة التجارية"
                value={form.brandId ?? ''}
                onChange={(event) => set('brandId', event.target.value || undefined)}
                placeholder="بدون علامة"
                options={brands.items.map((brand) => ({ value: brand.id, label: brand.name }))}
              />
            </div>
          </Card>

          <Card title="الوسوم">
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && tagInput.trim()) {
                    event.preventDefault()
                    set('tags', [...new Set([...form.tags, tagInput.trim()])])
                    setTagInput('')
                  }
                }}
                placeholder="أضف وسمًا ثم اضغط Enter"
                className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-[12.5px]"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!tagInput.trim()) return
                  set('tags', [...new Set([...form.tags, tagInput.trim()])])
                  setTagInput('')
                }}
              >
                إضافة
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <Chip key={tag} onRemove={() => set('tags', form.tags.filter((item) => item !== tag))}>
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </Card>

          <Card title="شحن المنتج">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="الوزن (كجم)"
                type="number"
                value={form.weight ? String(form.weight) : ''}
                onChange={(event) => set('weight', event.target.value ? Number(event.target.value) : undefined)}
              />
              <Input
                label="الأبعاد"
                placeholder="16 × 8 × 2 سم"
                value={form.dimensions ?? ''}
                onChange={(event) => set('dimensions', event.target.value)}
              />
            </div>
          </Card>

          <Card title="منتجات ذات صلة" subtitle="تظهر في قسم (منتجات قد تعجبك)">
            <div className="thin-scroll max-h-56 space-y-1.5 overflow-y-auto pe-1">
              {relatedOptions.map((product) => (
                <Checkbox
                  key={product.id}
                  checked={form.relatedIds.includes(product.id)}
                  onChange={(checked) =>
                    set(
                      'relatedIds',
                      checked
                        ? [...form.relatedIds, product.id]
                        : form.relatedIds.filter((relatedId) => relatedId !== product.id),
                    )
                  }
                  label={<span className="line-clamp-1">{product.name}</span>}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={optionModal}
        onClose={() => setOptionModal(false)}
        title="إضافة خيار للمنتج"
        footer={
          <Button fullWidth onClick={addOption}>
            إضافة الخيار
          </Button>
        }
      >
        <div className="space-y-3">
          <Select
            label="نوع الخيار"
            value={optionDraft.type}
            onChange={(event) => setOptionDraft({ ...optionDraft, type: event.target.value as OptionType })}
            options={OPTION_TYPES}
          />
          <Input
            label="اسم الخيار (إذا كان مخصصًا)"
            placeholder="مثلًا: الحجم، اللون"
            value={optionDraft.label}
            onChange={(event) => setOptionDraft({ ...optionDraft, label: event.target.value })}
          />
          <Textarea
            label="القيم"
            placeholder="مثال: أسود, أبيض, أزرق (افصل بينها بفاصلة)"
            rows={2}
            value={optionDraft.values}
            onChange={(event) => setOptionDraft({ ...optionDraft, values: event.target.value })}
          />
          <p className="rounded-xl bg-brand-soft p-2.5 text-[11.5px] text-gray-600">
            للخيارات الملونة سيتم إنشاء دوائر ألوان تلقائيًا، ويمكنك تعديل لون كل قيمة من القائمة.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelConfirm}
        title="إلغاء التعديلات"
        message="هل تريد الخروج؟ ستفقد التغييرات غير المحفوظة."
        confirmLabel="خروج"
        cancelLabel="البقاء"
        danger
        onCancel={() => setCancelConfirm(false)}
        onConfirm={() => navigate('/admin/products')}
      />

      <div className={cn('pb-6 text-center text-[11.5px] text-gray-400', !dirty && 'opacity-70')}>
        {dirty ? 'لديك تغييرات غير محفوظة' : 'تم حفظ جميع التغييرات'}
      </div>
    </AdminPage>
  )
}

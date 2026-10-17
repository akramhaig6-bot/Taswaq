import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Download, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import type { Product, ProductKind, ProductStatus } from '@/types'
import { isOutOfStock } from '@/lib/pricing'
import { downloadCsv, formatNumber, formatPrice, uid } from '@/lib/utils'
import { AdminPage, Card, DataTable, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip, Rating } from '@/components/ui'
import { Input, Select } from '@/components/ui/form'
import { ConfirmDialog, Dropdown, MenuItem } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'
import { productImage } from '@/lib/artwork'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const input = text.replace(/^\uFEFF/, '')
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        cell += '"'
        index += 1
      } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1
      row.push(cell.trim())
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      cell = ''
    } else cell += character
  }
  row.push(cell.trim())
  if (row.some((value) => value.length > 0)) rows.push(row)
  return rows
}

function importedKind(value: string): ProductKind {
  const normalized = value.trim().toLowerCase()
  if (normalized.includes('digital') || normalized.includes('رقمي') || normalized.includes('الكتروني')) return 'digital'
  if (normalized.includes('service') || normalized.includes('خدمة') || normalized.includes('حجز')) return 'service'
  return 'physical'
}

function expandCategories(categories: Array<{ id: string; parentId: string | null }>, selected: string[]) {
  const result = new Set(selected)
  const visited = new Set<string>()
  const visit = (parentId: string) => categories.filter((category) => category.parentId === parentId).forEach((category) => {
    result.add(category.id)
    if (visited.has(category.id)) return
    visited.add(category.id)
    visit(category.id)
  })
  selected.forEach(visit)
  return result
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const { products, categories, brands, settings, getCategory, categoryProductCount } = useAppData()
  const { showToast } = useToast()

  const fileRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ProductStatus>('all')
  const [kind, setKind] = useState<'all' | ProductKind>('all')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [brandIds, setBrandIds] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low'>('all')
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [discountFor, setDiscountFor] = useState<string[] | null>(null)
  const [discountValue, setDiscountValue] = useState('10')
  const [categoryFor, setCategoryFor] = useState<string[] | null>(null)
  const [targetCategory, setTargetCategory] = useState(categories.items[0]?.id ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const expandedCategoryIds = expandCategories(categories.items, categoryIds)
    return products.items.filter((product) => {
      if (status !== 'all' && product.status !== status) return false
      if (kind !== 'all' && (product.kind ?? 'physical') !== kind) return false
      if (categoryIds.length && !product.categoryIds.some((id) => expandedCategoryIds.has(id))) return false
      if (brandIds.length && (!product.brandId || !brandIds.includes(product.brandId))) return false
      if (minPrice && product.price < Number(minPrice)) return false
      if (maxPrice && product.price > Number(maxPrice)) return false
      if (stockFilter === 'out' && !isOutOfStock(product)) return false
      if (stockFilter === 'low' && !(product.trackStock && product.stock > 0 && product.stock <= product.lowStockThreshold)) return false
      if (q && !product.name.toLowerCase().includes(q) && !product.sku.toLowerCase().includes(q)) return false
      return true
    })
  }, [products.items, categories.items, query, status, kind, categoryIds, brandIds, minPrice, maxPrice, stockFilter])

  const rootCategories = categories.items.filter((category) => !category.parentId)

  const exportCsv = () => {
    downloadCsv('products.csv', [
      ['الاسم', 'SKU', 'النوع', 'القسم', 'العلامة التجارية', 'السعر', 'المخزون', 'يتطلب شحنًا', 'تعليمات التسليم', 'الحالة', 'المبيعات', 'التقييم'],
      ...filtered.map((product) => [
        product.name,
        product.sku,
        product.kind === 'digital' ? 'رقمي' : product.kind === 'service' ? 'خدمة' : 'مادي',
        product.categoryIds.map((id) => getCategory(id)?.name ?? '').join('; '),
        brands.items.find((brand) => brand.id === product.brandId)?.name ?? '',
        product.price,
        product.stock,
        (product.requiresShipping ?? (product.kind ?? 'physical') === 'physical') ? 'نعم' : 'لا',
        product.deliveryInstructions ?? '',
        product.status === 'published' ? 'متاح' : product.status === 'draft' ? 'مسودة' : 'مخفي',
        product.sales,
        product.rating,
      ]),
    ])
  }

  const importCsv = async (file?: File | null) => {
    if (!file) return
    try {
      const rows = parseCsv(await file.text())
      if (rows.length < 2) {
        showToast('الملف فارغ أو غير صالح.', { type: 'error' })
        return
      }
      const header = rows[0].map((cell) => cell.trim().toLowerCase())
      const findColumn = (...terms: string[]) => header.findIndex((cell) => terms.some((term) => cell.includes(term)))
      const nameIndex = findColumn('name', 'اسم')
      const priceIndex = findColumn('price', 'سعر')
      if (nameIndex === -1 || priceIndex === -1) {
        showToast('يجب أن يحتوي الملف على عمودين على الأقل: الاسم والسعر.', { type: 'error' })
        return
      }
      const skuIndex = findColumn('sku', 'رمز المنتج')
      const stockIndex = findColumn('stock', 'المخزون', 'كمية')
      const kindIndex = findColumn('kind', 'type', 'النوع')
      const categoryIndex = findColumn('category', 'قسم')
      const brandIndex = findColumn('brand', 'علامة')
      const tagsIndex = findColumn('tag', 'وسم')
      const shippingIndex = findColumn('shipping', 'شحن')
      const deliveryIndex = findColumn('delivery', 'instruction', 'تعليمات التسليم', 'محتوى التسليم')
      const usedSkus = new Set(products.items.map((product) => product.sku.toLowerCase()))
      const created: Product[] = []
      let skipped = 0

      for (const [rowIndex, cells] of rows.slice(1).entries()) {
        const valueAt = (index: number) => index >= 0 ? cells[index]?.trim() ?? '' : ''
        const name = valueAt(nameIndex)
        const price = Number(valueAt(priceIndex).replace(/[\s,]/g, ''))
        if (!name || !Number.isFinite(price) || price <= 0) {
          skipped += 1
          continue
        }
        const kind = importedKind(valueAt(kindIndex))
        const enteredSku = valueAt(skuIndex)
        let sku = enteredSku || `IMP-${Date.now().toString(36)}-${rowIndex + 1}`
        if (usedSkus.has(sku.toLowerCase())) {
          skipped += 1
          continue
        }
        usedSkus.add(sku.toLowerCase())
        const categoryIds = valueAt(categoryIndex)
          .split(/[;|]/)
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => categories.items.find((category) => category.id === value || category.name.toLowerCase() === value.toLowerCase())?.id)
          .filter((value): value is string => Boolean(value))
        const brandId = brands.items.find((brand) => brand.id === valueAt(brandIndex) || brand.name.toLowerCase() === valueAt(brandIndex).toLowerCase())?.id
        const stock = Math.max(0, Number(valueAt(stockIndex).replace(/[\s,]/g, '')) || 0)
        const shippingValue = valueAt(shippingIndex).toLowerCase()
        const requiresDelivery = shippingIndex >= 0 && shippingValue
          ? !['no', 'false', '0', 'لا', 'كلا'].includes(shippingValue)
          : kind === 'physical'
        created.push({
          id: uid('p'),
          kind,
          requiresShipping: requiresDelivery,
          deliveryInstructions: valueAt(deliveryIndex),
          name,
          sku,
          shortDescription: '',
          description: '',
          images: [productImage('box', rowIndex + 500)],
          price,
          stock,
          trackStock: kind === 'physical',
          lowStockThreshold: settings.lowStockThreshold,
          allowBackorder: false,
          categoryIds: [...new Set(categoryIds)],
          brandId,
          tags: valueAt(tagsIndex).split(/[;|]/).map((tag) => tag.trim()).filter(Boolean),
          options: [],
          variants: [],
          specifications: [],
          relatedIds: [],
          status: 'draft',
          rating: 0,
          reviewCount: 0,
          sales: 0,
          createdAt: new Date().toISOString(),
        })
      }
      if (!created.length) {
        showToast(skipped ? 'لم تتضمن البيانات منتجات صالحة للاستيراد؛ تحقق من الاسم والسعر.' : 'لا توجد صفوف منتجات في الملف.', { type: 'error' })
        return
      }
      products.addMany(created)
      showToast(`تم استيراد ${created.length} منتج كمسودة${skipped ? `، وتجاوز ${skipped} صفًا غير صالح أو مكررًا` : ''}.`, { type: 'success' })
    } catch {
      showToast('تعذر قراءة الملف. تحقق من صيغة CSV وحاول مرة أخرى.', { type: 'error' })
    }
  }

  const duplicate = (product: Product) => {
    const copy: Product = {
      ...product,
      id: uid('p'),
      name: `${product.name} - نسخة`,
      sku: `${product.sku}-COPY`,
      status: 'draft',
      sales: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }
    products.add(copy)
    showToast('تم إنشاء نسخة من المنتج.', { type: 'success' })
  }

  return (
    <AdminPage
      title="المنتجات"
      subtitle={`${formatNumber(filtered.length)} من ${formatNumber(products.items.length)} منتج`}
      breadcrumbs={['لوحة الإدارة', 'المنتجات']}
      actions={
        <>
          <Button icon={<Plus className="size-4" />} onClick={() => navigate('/admin/products/new')}>
            إضافة منتج جديد
          </Button>
          <Button variant="outline" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
            استيراد CSV
          </Button>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>
            تصدير إلى Excel/CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              void importCsv(file)
            }}
          />
        </>
      }
    >
      <Card>
        <Toolbar>
          <Input
            placeholder="ابحث باسم المنتج، رقم SKU..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 min-w-56 flex-1"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | ProductStatus)}
            options={[
              { value: 'all', label: 'كل الحالات' },
              { value: 'published', label: 'متاح' },
              { value: 'draft', label: 'مسودة' },
              { value: 'hidden', label: 'مخفي' },
            ]}
            className="h-10 w-36"
          />
          <Select
            value={kind}
            onChange={(event) => setKind(event.target.value as 'all' | ProductKind)}
            options={[
              { value: 'all', label: 'كل أنواع العروض' },
              { value: 'physical', label: 'منتجات مادية' },
              { value: 'digital', label: 'منتجات رقمية' },
              { value: 'service', label: 'خدمات' },
            ]}
            className="h-10 w-40"
          />
          <Select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as 'all' | 'out' | 'low')}
            options={[
              { value: 'all', label: 'كل المخزون' },
              { value: 'out', label: 'نفذ المخزون' },
              { value: 'low', label: 'مخزون منخفض' },
            ]}
            className="h-10 w-40"
          />
          <Input
            type="number"
            placeholder="من سعر"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-10 w-28"
          />
          <Input
            type="number"
            placeholder="إلى سعر"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-10 w-28"
          />
        </Toolbar>

        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-500">الأقسام:</span>
            {rootCategories.map((category) => (
              <Chip
                key={category.id}
                active={categoryIds.includes(category.id)}
                onClick={() =>
                  setCategoryIds((prev) =>
                    prev.includes(category.id) ? prev.filter((id) => id !== category.id) : [...prev, category.id],
                  )
                }
              >
                {category.name} ({categoryProductCount(category.id)})
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-500">العلامات:</span>
            {brands.items.filter((brand) => brand.active).map((brand) => (
              <Chip
                key={brand.id}
                active={brandIds.includes(brand.id)}
                onClick={() =>
                  setBrandIds((prev) => (prev.includes(brand.id) ? prev.filter((id) => id !== brand.id) : [...prev, brand.id]))
                }
              >
                {brand.name}
              </Chip>
            ))}
            {(query || status !== 'all' || kind !== 'all' || categoryIds.length || brandIds.length || minPrice || maxPrice || stockFilter !== 'all') && (
              <button
                type="button"
                className="text-[12px] font-bold text-danger"
                onClick={() => {
                  setQuery('')
                  setStatus('all')
                  setKind('all')
                  setCategoryIds([])
                  setBrandIds([])
                  setMinPrice('')
                  setMaxPrice('')
                  setStockFilter('all')
                }}
              >
                إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4">
          <DataTable<Product>
            rows={filtered}
            selectable
            emptyText="لا توجد منتجات مطابقة للفلاتر الحالية."
            renderCard={(product) => (
              <div className="flex items-start gap-3">
                <img
                  src={product.images[0]}
                  alt=""
                  className="size-14 shrink-0 rounded-xl border border-gray-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12.5px] font-semibold text-gray-800">{product.name}</p>
                  <p className="text-[11px] text-gray-400">{product.sku}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {product.kind === 'digital' && <Badge tone="brand">رقمي</Badge>}
                    {product.kind === 'service' && <Badge tone="warning">خدمة</Badge>}
                    {product.status === 'published' ? (
                      <Badge tone="success">متاح</Badge>
                    ) : product.status === 'draft' ? (
                      <Badge tone="gray">مسودة</Badge>
                    ) : (
                      <Badge tone="warning">مخفي</Badge>
                    )}
                    {isOutOfStock(product) ? (
                      <Badge tone="danger">نفذ</Badge>
                    ) : product.trackStock && product.stock <= product.lowStockThreshold ? (
                      <Badge tone="warning">متبقٍ {formatNumber(product.stock)}</Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-bold text-gray-900">
                      {formatPrice(product.price, settings.currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button size="xs" variant="ghost" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                        تعديل
                      </Button>
                      <Button size="xs" variant="ghost" onClick={() => duplicate(product)}>
                        نسخ
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            bulkActions={(ids, clear) => (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    ids.forEach((id) => products.remove(id))
                    showToast(`تم حذف ${ids.length} منتج.`, { type: 'success' })
                    clear()
                  }}
                >
                  حذف المحدد
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    ids.forEach((id) => products.update(id, { status: 'hidden' }))
                    showToast('تم إخفاء المنتجات المحددة.', { type: 'success' })
                    clear()
                  }}
                >
                  إخفاء المحدد
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDiscountFor(ids)}>
                  تطبيق خصم
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCategoryFor(ids)}>
                  تغيير القسم
                </Button>
              </>
            )}
            columns={[
              {
                key: 'image',
                header: 'الصورة',
                render: (product) => (
                  <img src={product.images[0]} alt="" className="size-10 rounded-lg border border-gray-100 object-cover" />
                ),
              },
              {
                key: 'name',
                header: 'المنتج',
                render: (product) => (
                  <div className="max-w-56">
                    <p className="truncate font-semibold text-gray-800">{product.name}</p>
                    <p className="text-[11px] text-gray-400">{product.sku} · {product.kind === 'digital' ? 'رقمي' : product.kind === 'service' ? 'خدمة' : 'مادي'}</p>
                  </div>
                ),
              },
              {
                key: 'category',
                header: 'القسم',
                render: (product) => (
                  <span className="text-[11.5px] text-gray-600">
                    {product.categoryIds.map((id) => getCategory(id)?.name).filter(Boolean).join(' / ') || '—'}
                  </span>
                ),
              },
              {
                key: 'price',
                header: 'السعر',
                render: (product) => (
                  <div>
                    <p className="font-bold text-gray-900">{formatPrice(product.price, settings.currency)}</p>
                    {product.compareAtPrice && (
                      <p className="text-[11px] text-gray-400 line-through">
                        {formatPrice(product.compareAtPrice, settings.currency)}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'stock',
                header: 'المخزون',
                render: (product) =>
                  isOutOfStock(product) ? (
                    <Badge tone="danger">نفذ</Badge>
                  ) : product.trackStock && product.stock <= product.lowStockThreshold ? (
                    <Badge tone="warning">{formatNumber(product.stock)}</Badge>
                  ) : (
                    <span className="text-gray-700">{product.trackStock ? formatNumber(product.stock) : '∞'}</span>
                  ),
              },
              {
                key: 'status',
                header: 'الحالة',
                render: (product) =>
                  product.status === 'published' ? (
                    <Badge tone="success">متاح</Badge>
                  ) : product.status === 'draft' ? (
                    <Badge tone="gray">مسودة</Badge>
                  ) : (
                    <Badge tone="warning">مخفي</Badge>
                  ),
              },
              { key: 'sales', header: 'المبيعات', render: (product) => formatNumber(product.sales) },
              { key: 'rating', header: 'التقييم', render: (product) => <Rating value={product.rating} size={12} /> },
              {
                key: 'actions',
                header: 'الإجراءات',
                render: (product) => (
                  <Dropdown
                    trigger={({ toggle }) => (
                      <Button size="xs" variant="ghost" onClick={toggle}>
                        ⋮
                      </Button>
                    )}
                  >
                    <MenuItem icon={<Eye className="size-3.5" />} onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                      عرض في التطبيق
                    </MenuItem>
                    <MenuItem icon={<Pencil className="size-3.5" />} onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                      تعديل
                    </MenuItem>
                    <MenuItem icon={<Copy className="size-3.5" />} onClick={() => duplicate(product)}>
                      نسخ المنتج
                    </MenuItem>
                    <MenuItem
                      icon={product.status === 'hidden' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      onClick={() =>
                        products.update(product.id, { status: product.status === 'hidden' ? 'published' : 'hidden' })
                      }
                    >
                      {product.status === 'hidden' ? 'إظهار' : 'إخفاء'}
                    </MenuItem>
                    <MenuItem icon={<Trash2 className="size-3.5" />} danger onClick={() => setPendingDelete(product)}>
                      حذف
                    </MenuItem>
                  </Dropdown>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف المنتج"
        message={`هل تريد حذف المنتج "${pendingDelete?.name ?? ''}"؟ لا يمكن التراجع.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) products.remove(pendingDelete.id)
          setPendingDelete(null)
          showToast('تم حذف المنتج.', { type: 'success' })
        }}
      />

      <ConfirmDialog
        open={Boolean(discountFor)}
        title="تطبيق خصم على المنتجات المحددة"
        confirmLabel="تطبيق الخصم"
        onCancel={() => setDiscountFor(null)}
        onConfirm={() => {
          const percent = Math.min(90, Math.max(5, Number(discountValue) || 10))
          discountFor?.forEach((id) => {
            const product = products.items.find((item) => item.id === id)
            if (product) {
              products.update(id, {
                compareAtPrice: Math.round(product.price / (1 - percent / 100)),
                discountStart: new Date().toISOString(),
                discountEnd: new Date(Date.now() + 7 * 86400000).toISOString(),
              })
            }
          })
          showToast(`تم تطبيق خصم ${percent}% على ${discountFor?.length} منتج.`, { type: 'success' })
          setDiscountFor(null)
        }}
      >
        <Input
          label="نسبة الخصم %"
          type="number"
          value={discountValue}
          onChange={(event) => setDiscountValue(event.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(categoryFor)}
        title="تغيير قسم المنتجات المحددة"
        confirmLabel="تغيير القسم"
        onCancel={() => setCategoryFor(null)}
        onConfirm={() => {
          categoryFor?.forEach((id) => products.update(id, { categoryIds: [targetCategory] }))
          showToast('تم تغيير القسم للمنتجات المحددة.', { type: 'success' })
          setCategoryFor(null)
        }}
      >
        <Select
          label="القسم الجديد"
          value={targetCategory}
          onChange={(event) => setTargetCategory(event.target.value)}
          options={categories.items.map((category) => ({ value: category.id, label: category.name }))}
        />
      </ConfirmDialog>
    </AdminPage>
  )
}

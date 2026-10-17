import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Download, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import type { Product, ProductStatus } from '@/types'
import { isOutOfStock } from '@/lib/pricing'
import { downloadCsv, formatNumber, formatPrice, uid } from '@/lib/utils'
import { AdminPage, Card, DataTable, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip, Rating } from '@/components/ui'
import { Input, Select } from '@/components/ui/form'
import { ConfirmDialog, Dropdown, MenuItem } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminProducts() {
  const navigate = useNavigate()
  const { products, categories, brands, settings, getCategory, categoryProductCount } = useAppData()
  const { showToast } = useToast()

  const fileRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ProductStatus>('all')
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
    return products.items.filter((product) => {
      if (status !== 'all' && product.status !== status) return false
      if (categoryIds.length && !product.categoryIds.some((id) => categoryIds.includes(id))) return false
      if (brandIds.length && (!product.brandId || !brandIds.includes(product.brandId))) return false
      if (minPrice && product.price < Number(minPrice)) return false
      if (maxPrice && product.price > Number(maxPrice)) return false
      if (stockFilter === 'out' && !isOutOfStock(product)) return false
      if (stockFilter === 'low' && !(product.trackStock && product.stock > 0 && product.stock <= product.lowStockThreshold)) return false
      if (q && !product.name.toLowerCase().includes(q) && !product.sku.toLowerCase().includes(q)) return false
      return true
    })
  }, [products.items, query, status, categoryIds, brandIds, minPrice, maxPrice, stockFilter])

  const rootCategories = categories.items.filter((category) => !category.parentId)

  const exportCsv = () => {
    downloadCsv('products.csv', [
      ['الاسم', 'SKU', 'القسم', 'العلامة التجارية', 'السعر', 'المخزون', 'الحالة', 'المبيعات', 'التقييم'],
      ...filtered.map((product) => [
        product.name,
        product.sku,
        product.categoryIds.map((id) => getCategory(id)?.name ?? '').join(' / '),
        brands.items.find((brand) => brand.id === product.brandId)?.name ?? '',
        product.price,
        product.stock,
        product.status === 'published' ? 'متاح' : product.status === 'draft' ? 'مسودة' : 'مخفي',
        product.sales,
        product.rating,
      ]),
    ])
  }

  const importCsv = async (file?: File | null) => {
    if (!file) return
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())
    if (lines.length < 2) {
      showToast('الملف فارغ أو غير صالح.', { type: 'error' })
      return
    }
    const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase())
    const nameIndex = header.findIndex((cell) => cell.includes('name') || cell.includes('اسم'))
    const priceIndex = header.findIndex((cell) => cell.includes('price') || cell.includes('سعر'))
    const stockIndex = header.findIndex((cell) => cell.includes('stock') || cell.includes('مخزون'))
    if (nameIndex === -1 || priceIndex === -1) {
      showToast('يجب أن يحتوي الملف على أعمدة الاسم والسعر.', { type: 'error' })
      return
    }
    const created: Product[] = lines.slice(1).map((line) => {
      const cells = line.split(',').map((cell) => cell.replace(/"/g, '').trim())
      return {
        id: uid('p'),
        name: cells[nameIndex] || 'منتج مستورد',
        sku: `IMP-${Math.floor(Math.random() * 9000 + 1000)}`,
        description: '',
        images: [],
        price: Number(cells[priceIndex]) || 0,
        stock: stockIndex >= 0 ? Number(cells[stockIndex]) || 0 : 0,
        trackStock: true,
        lowStockThreshold: settings.lowStockThreshold,
        allowBackorder: false,
        categoryIds: [],
        tags: [],
        options: [],
        variants: [],
        specifications: [],
        relatedIds: [],
        status: 'draft' as ProductStatus,
        rating: 0,
        reviewCount: 0,
        sales: 0,
        createdAt: new Date().toISOString(),
      }
    })
    products.addMany(created)
    showToast(`تم استيراد ${created.length} منتج كمسودة.`, { type: 'success' })
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
            استيراد من Excel/CSV
          </Button>
          <Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>
            تصدير إلى Excel/CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => void importCsv(event.target.files?.[0])}
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
            {(query || status !== 'all' || categoryIds.length || brandIds.length || minPrice || maxPrice || stockFilter !== 'all') && (
              <button
                type="button"
                className="text-[12px] font-bold text-danger"
                onClick={() => {
                  setQuery('')
                  setStatus('all')
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
                    <p className="text-[11px] text-gray-400">{product.sku}</p>
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

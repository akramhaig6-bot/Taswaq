import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Brand } from '@/types'
import { brandLogo } from '@/lib/artwork'
import { formatNumber, uid } from '@/lib/utils'
import { AdminPage, Card, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, EmptyState } from '@/components/ui'
import { Input, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { ImagePicker } from '@/components/ui/ImageUploader'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminBrands() {
  const { brands, products } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<Partial<Brand> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return brands.items.filter((brand) => !q || brand.name.toLowerCase().includes(q)).sort((a, b) => a.order - b.order)
  }, [brands.items, query])

  const productCount = (brandId: string) => products.items.filter((product) => product.brandId === brandId).length

  const save = () => {
    if (!draft) return
    const name = (draft.name ?? '').trim()
    const next: Record<string, string> = {}
    if (name.length < 2) next.name = 'يرجى إدخال اسم العلامة التجارية.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      name,
      logo: draft.logo || brandLogo(name),
      active: draft.active ?? true,
    }
    if (draft.id) {
      brands.update(draft.id, payload)
      showToast('تم تحديث العلامة التجارية.', { type: 'success' })
    } else {
      brands.add({ id: uid('b'), order: brands.items.length + 1, ...payload })
      showToast('تم إضافة العلامة التجارية.', { type: 'success' })
    }
    setDraft(null)
  }

  const move = (brand: Brand, direction: -1 | 1) => {
    const index = list.findIndex((item) => item.id === brand.id)
    const target = list[index + direction]
    if (!target) return
    brands.update(brand.id, { order: target.order })
    brands.update(target.id, { order: brand.order })
  }

  return (
    <AdminPage
      title="العلامات التجارية"
      subtitle={`${formatNumber(brands.items.length)} علامة تجارية`}
      breadcrumbs={['لوحة الإدارة', 'العلامات التجارية']}
      actions={
        <Button icon={<Plus className="size-4" />} onClick={() => setDraft({ active: true })}>
          علامة تجارية جديدة
        </Button>
      }
    >
      <Card padded={false} className="overflow-visible">
        <div className="p-4">
          <Toolbar>
            <Input
              placeholder="ابحث عن علامة تجارية..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-56 flex-1"
            />
          </Toolbar>
        </div>
        {list.length === 0 ? (
          <EmptyState title="لا توجد علامات تجارية" body="أضف أول علامة تجارية لمتجرك." className="py-16" />
        ) : (
          <div className="grid grid-cols-1 gap-3 border-t border-gray-100 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((brand) => (
              <div key={brand.id} className="rounded-2xl border border-gray-200 p-3">
                <div className="flex items-center gap-3">
                  <img src={brand.logo} alt="" className="size-12 rounded-xl bg-gray-50 p-1.5 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-gray-800">{brand.name}</p>
                    <p className="text-[11.5px] text-gray-400">
                      {formatNumber(productCount(brand.id))} منتج {brand.active ? '' : '• مخفية'}
                    </p>
                  </div>
                  {!brand.active && <Badge tone="gray">مخفية</Badge>}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <Button size="xs" variant="ghost" onClick={() => move(brand, -1)}>
                    ↑
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => move(brand, 1)}>
                    ↓
                  </Button>
                  <Button size="xs" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => setDraft(brand)}>
                    تعديل
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-danger"
                    icon={<Trash2 className="size-3.5" />}
                    onClick={() => setPendingDelete(brand)}
                  >
                    حذف
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="ms-auto"
                    onClick={() => brands.update(brand.id, { active: !brand.active })}
                  >
                    {brand.active ? 'إخفاء' : 'إظهار'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'تعديل علامة تجارية' : 'إضافة علامة تجارية'}
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button fullWidth onClick={save}>
              {draft?.id ? 'حفظ' : 'إضافة'}
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
              label="اسم العلامة التجارية"
              required
              value={draft.name ?? ''}
              error={errors.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <ImagePicker label="الشعار" value={draft.logo ?? ''} onChange={(value) => setDraft({ ...draft, logo: value })} />
            <p className="rounded-xl bg-gray-50 p-3 text-[11.5px] leading-5 text-gray-500">
              إذا لم ترفع شعارًا سيُولَّد شعار نصي تلقائي بنفس هوية المتجر.
            </p>
            <Toggle
              checked={draft.active ?? true}
              onChange={(checked) => setDraft({ ...draft, active: checked })}
              label="ظاهرة في التطبيق"
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف العلامة التجارية"
        message={`سيتم حذف "${pendingDelete?.name ?? ''}" وفصلها عن المنتجات المرتبطة.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          products.items.forEach((product) => {
            if (product.brandId === pendingDelete.id) products.update(product.id, { brandId: undefined })
          })
          brands.remove(pendingDelete.id)
          setPendingDelete(null)
          showToast('تم حذف العلامة التجارية.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Category } from '@/types'
import { categoryImage, GLYPH_KINDS, isGlyphKind } from '@/lib/artwork'
import { cn, formatNumber, uid } from '@/lib/utils'
import { AdminPage, Card } from '@/components/admin/AdminUI'
import { Badge, Button, EmptyState } from '@/components/ui'
import { Input, Select, Textarea, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { ImagePicker } from '@/components/ui/ImageUploader'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

interface Draft {
  id?: string
  name: string
  nameEn: string
  description: string
  image: string
  icon: string
  emoji: string
  parentId: string | null
  active: boolean
}

const blankDraft = (parentId: string | null = null): Draft => ({
  name: '',
  nameEn: '',
  description: '',
  image: '',
  icon: 'phone',
  emoji: '',
  parentId,
  active: true,
})

export default function AdminCategories() {
  const { categories, products, categoryProductCount } = useAppData()
  const { showToast } = useToast()

  const [expanded, setExpanded] = useState<string[]>([])
  const [dragging, setDragging] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const roots = useMemo(
    () => categories.items.filter((category) => !category.parentId).sort((a, b) => a.order - b.order),
    [categories.items],
  )
  const childrenOf = (parentId: string) =>
    categories.items.filter((category) => category.parentId === parentId).sort((a, b) => a.order - b.order)

  const save = () => {
    if (!draft) return
    const next: Record<string, string> = {}
    if (draft.name.trim().length < 2) next.name = 'يرجى إدخال اسم القسم.'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      name: draft.name.trim(),
      nameEn: draft.nameEn.trim() || undefined,
      description: draft.description.trim() || undefined,
      image: draft.image || categoryImage(isGlyphKind(draft.icon) ? draft.icon : 'phone'),
      icon: draft.icon,
      emoji: draft.emoji.trim() || undefined,
      parentId: draft.parentId,
      active: draft.active,
    }
    if (draft.id) {
      categories.update(draft.id, payload)
      showToast('تم تحديث القسم.', { type: 'success' })
    } else {
      categories.add({
        id: uid('c'),
        order: categories.items.filter((category) => category.parentId === draft.parentId).length + 1,
        ...payload,
      })
      if (draft.parentId && !expanded.includes(draft.parentId)) setExpanded((prev) => [...prev, draft.parentId as string])
      showToast('تم إضافة القسم.', { type: 'success' })
    }
    setDraft(null)
  }

  /** لإعادة الترتيب بالسحب والإفلات: يُنقل القسم قبل/بعد القسم الهدف */
  const reorder = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    const source = categories.items.find((category) => category.id === sourceId)
    const target = categories.items.find((category) => category.id === targetId)
    if (!source || !target) return
    if (source.parentId === target.id || target.parentId === source.id) {
      showToast('لا يمكن نقل قسم إلى أحد أقسامه الفرعية.', { type: 'error' })
      return
    }
    const siblings = categories.items
      .filter((category) => category.parentId === target.parentId && category.id !== source.id)
      .sort((a, b) => a.order - b.order)
    const targetIndex = siblings.findIndex((category) => category.id === target.id)
    const ordered = [...siblings]
    ordered.splice(targetIndex, 0, { ...source, parentId: target.parentId })
    ordered.forEach((category, index) => categories.update(category.id, { order: index + 1, parentId: target.parentId }))
    showToast('تم تحديث ترتيب الأقسام.', { type: 'success' })
  }

  const move = (category: Category, direction: -1 | 1) => {
    const siblings = categories.items
      .filter((item) => item.parentId === category.parentId)
      .sort((a, b) => a.order - b.order)
    const index = siblings.findIndex((item) => item.id === category.id)
    const target = siblings[index + direction]
    if (!target) return
    categories.update(category.id, { order: target.order })
    categories.update(target.id, { order: category.order })
  }

  const renderRow = (category: Category, depth = 0) => {
    const children = childrenOf(category.id)
    const isExpanded = expanded.includes(category.id)
    const count = categoryProductCount(category.id)
    return (
      <div key={category.id}>
        <div
          draggable
          onDragStart={() => setDragging(category.id)}
          onDragEnd={() => {
            setDragging(null)
            setDropTarget(null)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDropTarget(category.id)
          }}
          onDrop={() => {
            if (dragging) reorder(dragging, category.id)
            setDragging(null)
            setDropTarget(null)
          }}
          className={cn(
            'flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-2.5 last:border-0',
            dragging === category.id && 'opacity-40',
            dropTarget === category.id && dragging !== category.id && 'bg-brand-soft',
            depth > 0 && 'bg-gray-50/60',
          )}
          style={{ paddingInlineStart: 12 + depth * 24 }}
        >
          <GripVertical className="size-4 shrink-0 cursor-grab text-gray-300" />
          <button
            type="button"
            onClick={() =>
              children.length &&
              setExpanded((prev) => (prev.includes(category.id) ? prev.filter((id) => id !== category.id) : [...prev, category.id]))
            }
            className={cn('flex size-6 items-center justify-center rounded-lg text-gray-400', !children.length && 'invisible')}
          >
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
          <img src={category.image} alt="" className="size-10 rounded-lg border border-gray-100 object-cover" />
          <div className="min-w-40 flex-1">
            <p className="text-[13px] font-bold text-gray-800">
              {category.emoji ? <span className="ms-1">{category.emoji}</span> : null}
              {category.name}
              {!category.active && (
                <Badge tone="gray" className="ms-2">
                  مخفي
                </Badge>
              )}
            </p>
            <p className="text-[11px] text-gray-400">
              {category.nameEn || '—'} • {formatNumber(count)} منتج
              {children.length > 0 && ` • ${formatNumber(children.length)} قسم فرعي`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => move(category, -1)}
              className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              title="تحريك للأعلى"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => move(category, 1)}
              className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              title="تحريك للأسفل"
            >
              <ChevronDown className="size-4" />
            </button>
            <Button size="xs" variant="ghost" icon={<Plus className="size-3.5" />} onClick={() => setDraft(blankDraft(category.id))}>
              فرعي
            </Button>
            <Button
              size="xs"
              variant="ghost"
              icon={<Pencil className="size-3.5" />}
              onClick={() =>
                setDraft({
                  id: category.id,
                  name: category.name,
                  nameEn: category.nameEn ?? '',
                  description: category.description ?? '',
                  image: category.image,
                  icon: category.icon ?? 'phone',
                  emoji: category.emoji ?? '',
                  parentId: category.parentId,
                  active: category.active,
                })
              }
            >
              تعديل
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="text-danger"
              icon={<Trash2 className="size-3.5" />}
              onClick={() => setPendingDelete(category)}
            >
              حذف
            </Button>
          </div>
        </div>
        {isExpanded && children.map((child) => renderRow(child, depth + 1))}
      </div>
    )
  }

  return (
    <AdminPage
      title="الأقسام"
      subtitle={`${formatNumber(categories.items.length)} قسم — اسحب وأفلت لإعادة الترتيب`}
      breadcrumbs={['لوحة الإدارة', 'الأقسام']}
      actions={
        <>
          <Button icon={<Plus className="size-4" />} onClick={() => setDraft(blankDraft(null))}>
            قسم رئيسي جديد
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpanded(expanded.length ? [] : roots.map((category) => category.id))}
          >
            {expanded.length ? 'طي الكل' : 'توسيع الكل'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false} title="شجرة الأقسام">
          {roots.length === 0 ? (
            <EmptyState title="لا توجد أقسام" body="ابدأ بإضافة قسم رئيسي." className="py-16" />
          ) : (
            roots.map((category) => renderRow(category))
          )}
        </Card>

        <Card title="إحصائيات الأقسام">
          <ul className="space-y-2.5">
            {roots.slice(0, 8).map((category) => {
              const count = categoryProductCount(category.id)
              const max = Math.max(1, ...roots.map((item) => categoryProductCount(item.id)))
              return (
                <li key={category.id}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-gray-700">{category.name}</span>
                    <span className="text-gray-500">{formatNumber(count)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-[11.5px] leading-5 text-gray-500">
            إجمالي المنتجات غير المرتبطة بأي قسم:{' '}
            <strong className="text-gray-700">{formatNumber(products.items.filter((p) => p.categoryIds.length === 0).length)}</strong>
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'تعديل القسم' : draft?.parentId ? 'إضافة قسم فرعي' : 'إضافة قسم رئيسي'}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button fullWidth onClick={save}>
              {draft?.id ? 'حفظ التعديلات' : 'إضافة القسم'}
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
              label="اسم القسم"
              required
              value={draft.name}
              error={errors.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
            <Input
              label="الاسم بالإنجليزية (اختياري)"
              value={draft.nameEn}
              onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })}
            />
            <Input
              label="رمز تعبيري (إيموجي) — اختياري"
              value={draft.emoji}
              placeholder="مثال: 📱"
              onChange={(event) => setDraft({ ...draft, emoji: event.target.value })}
            />
            <Textarea
              label="الوصف"
              rows={2}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
            <div>
              <p className="mb-1.5 text-[12.5px] font-semibold text-gray-700">أيقونة القسم</p>
              <div className="flex flex-wrap gap-2">
                {GLYPH_KINDS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setDraft({ ...draft, icon: kind, image: categoryImage(kind) })}
                    className={cn(
                      'size-14 overflow-hidden rounded-xl border-2',
                      draft.icon === kind ? 'border-brand' : 'border-transparent hover:border-gray-200',
                    )}
                  >
                    <img src={categoryImage(kind)} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <ImagePicker label="أو ارفع صورة للقسم" value={draft.image} onChange={(value) => setDraft({ ...draft, image: value })} />
            <Select
              label="القسم الأب"
              value={draft.parentId ?? ''}
              onChange={(event) => setDraft({ ...draft, parentId: event.target.value || null })}
              placeholder="بدون (قسم رئيسي)"
              options={roots
                .filter((category) => category.id !== draft.id)
                .map((category) => ({ value: category.id, label: category.name }))}
            />
            <Toggle
              checked={draft.active}
              onChange={(checked) => setDraft({ ...draft, active: checked })}
              label="القسم ظاهر في التطبيق"
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف القسم"
        message={`سيتم حذف "${pendingDelete?.name ?? ''}"، وستُزال ارتباطاته بالمنتجات.`}
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          const parentId = pendingDelete.parentId
          categories.remove(pendingDelete.id)
          products.items.forEach((product) => {
            if (product.categoryIds.includes(pendingDelete.id)) {
              products.update(product.id, { categoryIds: product.categoryIds.filter((id) => id !== pendingDelete.id) })
            }
          })
          categories.items
            .filter((category) => category.parentId === pendingDelete.id)
            .forEach((category) => categories.update(category.id, { parentId }))
          setPendingDelete(null)
          showToast('تم حذف القسم.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

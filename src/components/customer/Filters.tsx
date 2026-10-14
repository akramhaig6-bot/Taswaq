import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { Brand, Category } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { SORT_OPTIONS, type SortKey } from '@/lib/query'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, RadioGroup, SearchInput, Toggle } from '@/components/ui/form'
import { BottomSheet } from '@/components/ui/overlay'
import { Chip, Rating } from '@/components/ui/display'

export interface FilterState {
  minPrice: number
  maxPrice: number
  categoryIds: string[]
  brandIds: string[]
  minRating: number
  availableOnly: boolean
}

export function emptyFilters(bounds: [number, number]): FilterState {
  return { minPrice: bounds[0], maxPrice: bounds[1], categoryIds: [], brandIds: [], minRating: 0, availableOnly: false }
}

export function countActiveFilters(filters: FilterState, bounds: [number, number]): number {
  let count = 0
  if (filters.minPrice > bounds[0] || filters.maxPrice < bounds[1]) count += 1
  if (filters.categoryIds.length) count += 1
  if (filters.brandIds.length) count += 1
  if (filters.minRating > 0) count += 1
  if (filters.availableOnly) count += 1
  return count
}

export function FilterSheet({
  open,
  onClose,
  value,
  onApply,
  bounds,
  categories,
  brands,
  currency,
  lockCategory = false,
}: {
  open: boolean
  onClose: () => void
  value: FilterState
  onApply: (value: FilterState) => void
  bounds: [number, number]
  categories: Category[]
  brands: Brand[]
  currency: string
  lockCategory?: boolean
}) {
  const [draft, setDraft] = useState<FilterState>(value)
  const [brandQuery, setBrandQuery] = useState('')

  useEffect(() => {
    if (open) {
      setDraft(value)
      setBrandQuery('')
    }
  }, [open, value])

  const filteredBrands = useMemo(
    () => brands.filter((brand) => brand.name.toLowerCase().includes(brandQuery.trim().toLowerCase())),
    [brands, brandQuery],
  )

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="فلترة النتائج"
      footer={
        <div className="flex gap-2">
          <Button fullWidth onClick={() => onApply(draft)}>
            تطبيق
          </Button>
          <Button variant="ghost" onClick={() => setDraft(emptyFilters(bounds))}>
            إعادة تعيين
          </Button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        {/* السعر */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[13px] font-bold text-gray-800">السعر</h4>
            <span className="text-[11.5px] text-gray-500">
              من {formatPrice(draft.minPrice, currency)} إلى {formatPrice(draft.maxPrice, currency)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={String(draft.minPrice)}
              onChange={(event) => setDraft({ ...draft, minPrice: Number(event.target.value) || 0 })}
              className="h-10 text-[13px]"
            />
            <span className="text-gray-400">—</span>
            <Input
              type="number"
              value={String(draft.maxPrice)}
              onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) || bounds[1] })}
              className="h-10 text-[13px]"
            />
          </div>
          <input
            type="range"
            min={bounds[0]}
            max={bounds[1]}
            value={draft.minPrice}
            onChange={(event) => setDraft({ ...draft, minPrice: Math.min(Number(event.target.value), draft.maxPrice) })}
            className="mt-3 w-full accent-[var(--c-brand)]"
          />
          <input
            type="range"
            min={bounds[0]}
            max={bounds[1]}
            value={draft.maxPrice}
            onChange={(event) => setDraft({ ...draft, maxPrice: Math.max(Number(event.target.value), draft.minPrice) })}
            className="w-full accent-[var(--c-brand)]"
          />
        </section>

        {/* الأقسام */}
        {!lockCategory && (
          <section>
            <h4 className="mb-2 text-[13px] font-bold text-gray-800">القسم</h4>
            <div className="thin-scroll max-h-44 space-y-2 overflow-y-auto pe-1">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  checked={draft.categoryIds.includes(category.id)}
                  onChange={() => setDraft({ ...draft, categoryIds: toggle(draft.categoryIds, category.id) })}
                  label={category.name}
                />
              ))}
            </div>
          </section>
        )}

        {/* العلامات التجارية */}
        <section>
          <h4 className="mb-2 text-[13px] font-bold text-gray-800">العلامة التجارية</h4>
          {brands.length > 10 && (
            <SearchInput
              value={brandQuery}
              onChange={(event) => setBrandQuery(event.target.value)}
              placeholder="ابحث عن علامة تجارية"
              className="mb-2 h-9 text-[13px]"
            />
          )}
          <div className="thin-scroll max-h-44 space-y-2 overflow-y-auto pe-1">
            {filteredBrands.map((brand) => (
              <Checkbox
                key={brand.id}
                checked={draft.brandIds.includes(brand.id)}
                onChange={() => setDraft({ ...draft, brandIds: toggle(draft.brandIds, brand.id) })}
                label={brand.name}
              />
            ))}
            {filteredBrands.length === 0 && <p className="text-[12px] text-gray-400">لا توجد نتائج</p>}
          </div>
        </section>

        {/* التقييم */}
        <section>
          <h4 className="mb-2 text-[13px] font-bold text-gray-800">التقييم</h4>
          <div className="flex flex-col gap-2">
            {[4, 3, 2, 0].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setDraft({ ...draft, minRating: rating })}
                className={cn(
                  'flex items-center gap-2 rounded-xl border p-2.5 text-start transition-colors',
                  draft.minRating === rating ? 'border-brand bg-brand-soft/60' : 'border-gray-200',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 items-center justify-center rounded-full border',
                    draft.minRating === rating ? 'border-brand' : 'border-gray-300',
                  )}
                >
                  {draft.minRating === rating && <span className="size-2 rounded-full bg-brand" />}
                </span>
                {rating === 0 ? (
                  <span className="text-[13px] text-gray-700">الكل</span>
                ) : (
                  <>
                    <Rating value={rating} size={13} />
                    <span className="text-[12.5px] text-gray-600">فأعلى</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* التوفر */}
        <section className="rounded-xl border border-gray-200 p-3">
          <Toggle
            checked={draft.availableOnly}
            onChange={(checked) => setDraft({ ...draft, availableOnly: checked })}
            label="المتوفر فقط"
            hint="إخفاء المنتجات غير المتوفرة من النتائج"
          />
        </section>
      </div>
    </BottomSheet>
  )
}

export function SortSheet({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean
  onClose: () => void
  value: SortKey
  onChange: (value: SortKey) => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="ترتيب النتائج">
      <RadioGroup
        value={value}
        onChange={(next) => {
          onChange(next)
          onClose()
        }}
        options={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
      />
    </BottomSheet>
  )
}

export function FilterBar({
  onOpenFilters,
  onOpenSort,
  filters,
  bounds,
  categories,
  brands,
  onChange,
  sort,
}: {
  onOpenFilters: () => void
  onOpenSort: () => void
  filters: FilterState
  bounds: [number, number]
  categories: Category[]
  brands: Brand[]
  onChange: (value: FilterState) => void
  sort: SortKey
}) {
  const active = countActiveFilters(filters, bounds)
  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'ترتيب'

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = []
  if (filters.minPrice > bounds[0] || filters.maxPrice < bounds[1]) {
    chips.push({
      key: 'price',
      label: `السعر: ${filters.minPrice} - ${filters.maxPrice}`,
      onRemove: () => onChange({ ...filters, minPrice: bounds[0], maxPrice: bounds[1] }),
    })
  }
  filters.categoryIds.forEach((id) => {
    const category = categories.find((c) => c.id === id)
    if (category)
      chips.push({
        key: id,
        label: category.name,
        onRemove: () => onChange({ ...filters, categoryIds: filters.categoryIds.filter((item) => item !== id) }),
      })
  })
  filters.brandIds.forEach((id) => {
    const brand = brands.find((b) => b.id === id)
    if (brand)
      chips.push({
        key: id,
        label: brand.name,
        onRemove: () => onChange({ ...filters, brandIds: filters.brandIds.filter((item) => item !== id) }),
      })
  })
  if (filters.minRating > 0)
    chips.push({ key: 'rating', label: `${filters.minRating} نجوم فأعلى`, onRemove: () => onChange({ ...filters, minRating: 0 }) })
  if (filters.availableOnly)
    chips.push({ key: 'available', label: 'المتوفر فقط', onRemove: () => onChange({ ...filters, availableOnly: false }) })

  return (
    <div className="border-b border-gray-100 bg-white px-4 py-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(
            'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-bold transition-colors',
            active > 0 ? 'border-brand bg-brand-soft text-brand' : 'border-gray-200 text-gray-600',
          )}
        >
          <SlidersHorizontal className="size-4" />
          فلتر
          {active > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] text-white">{active}</span>}
        </button>
        <button
          type="button"
          onClick={onOpenSort}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-[12.5px] font-bold text-gray-600"
        >
          <ArrowUpDown className="size-4" />
          {sortLabel}
        </button>
      </div>
      {chips.length > 0 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {chips.map((chip) => (
            <Chip key={chip.key} onRemove={chip.onRemove}>
              {chip.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => onChange(emptyFilters(bounds))}
            className="shrink-0 px-1 text-[12px] font-bold text-danger"
          >
            مسح الكل
          </button>
        </div>
      )}
    </div>
  )
}

export function BrandSearchField({
  value,
  onChange,
  placeholder = 'ابحث في العلامات التجارية',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <SearchInput
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      icon={<Search className="size-4" />}
    />
  )
}

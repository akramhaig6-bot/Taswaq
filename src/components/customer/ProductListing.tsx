import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PackageSearch, Search as SearchIcon, X } from 'lucide-react'
import type { Product } from '@/types'
import { filterProducts, priceBounds, sortProducts, type SortKey } from '@/lib/query'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { FilterBar, FilterSheet, SortSheet, emptyFilters, type FilterState } from '@/components/customer/Filters'
import { ProductGrid } from '@/components/customer/product'
import { EmptyState } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'

/** قائمة منتجات قابلة للفلترة والترتيب والبحث (تُستخدم في الأقسام والعلامات والعروض) */
export function ProductListing({
  title,
  subtitle,
  products,
  backTo,
  lockedCategoryId,
  extendFilters,
  emptyTitle = 'لا توجد منتجات في هذا القسم حاليًا.',
  emptyBody,
  emptyAction,
  headerActions,
}: {
  title: string
  subtitle?: string
  products: Product[]
  backTo?: string | number
  lockedCategoryId?: string
  extendFilters?: Partial<FilterState>
  emptyTitle?: string
  emptyBody?: string
  emptyAction?: ReactNode
  headerActions?: ReactNode
}) {
  const { categories, brands, settings, brandName, categoryNames } = useAppData()
  const bounds = useMemo(() => priceBounds(products), [products])

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...emptyFilters(bounds),
    categoryIds: lockedCategoryId ? [lockedCategoryId] : [],
  }))
  const [sort, setSort] = useState<SortKey>('relevance')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFilters({ ...emptyFilters(priceBounds(products)), categoryIds: lockedCategoryId ? [lockedCategoryId] : [] })
  }, [products, lockedCategoryId])

  const results = useMemo(() => {
    const merged = { ...filters, ...(extendFilters ?? {}), q: query.trim() || undefined }
    const list = filterProducts(products, merged, { brandName, categoryNames })
    return sortProducts(list, sort)
  }, [products, filters, extendFilters, sort, query, brandName, categoryNames])

  const header = (
    <PageHeader
      title={title}
      subtitle={subtitle}
      backTo={backTo}
      actions={
        <>
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            aria-label="بحث"
          >
            {searchOpen ? <X className="size-5" /> : <SearchIcon className="size-5" />}
          </button>
          {headerActions}
        </>
      }
    >
      {searchOpen && (
        <div className="px-3 pb-2">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`ابحث داخل ${title}...`}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-[13px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>
      )}
    </PageHeader>
  )

  return (
    <Screen header={header}>
      <FilterBar
        onOpenFilters={() => setShowFilter(true)}
        onOpenSort={() => setShowSort(true)}
        filters={filters}
        bounds={bounds}
        categories={categories.items.filter((category) => !category.parentId)}
        brands={brands.items.filter((brand) => brand.active)}
        onChange={(value) => {
          setFilters(value)
          setLoading(true)
          window.setTimeout(() => setLoading(false), 300)
        }}
        sort={sort}
      />
      <div className="p-4">
        <p className="mb-3 text-[12.5px] text-gray-500">({results.length} منتج)</p>
        <ProductGrid
          products={results}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<PackageSearch className="size-9" />}
              title={emptyTitle}
              body={emptyBody}
              action={emptyAction}
            />
          }
        />
      </div>
      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        value={filters}
        onApply={(value) => {
          setFilters(value)
          setShowFilter(false)
          setLoading(true)
          window.setTimeout(() => setLoading(false), 300)
        }}
        bounds={bounds}
        categories={categories.items.filter((category) => !category.parentId)}
        brands={brands.items.filter((brand) => brand.active)}
        currency={settings.currency}
        lockCategory={Boolean(lockedCategoryId)}
      />
      <SortSheet open={showSort} onClose={() => setShowSort(false)} value={sort} onChange={setSort} />
    </Screen>
  )
}

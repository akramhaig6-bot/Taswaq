import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, PackageSearch, Search as SearchIcon, TrendingUp, X } from 'lucide-react'
import { filterProducts, priceBounds, sortProducts, suggestProducts, type SortKey } from '@/lib/query'
import { Screen } from '@/components/layout/Screen'
import { FilterBar, FilterSheet, SortSheet, emptyFilters, type FilterState } from '@/components/customer/Filters'
import { ProductGrid } from '@/components/customer/product'
import { Button } from '@/components/ui/Button'
import { Chip, EmptyState } from '@/components/ui/display'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'
import { readStorage, writeStorage } from '@/store/persist'

export default function Search() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [params] = useSearchParams()
  const { products, categories, brands, settings, brandName, categoryNames } = useAppData()

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [submitted, setSubmitted] = useState(params.get('q')?.trim() ?? '')
  const [recents, setRecents] = useState<string[]>(() => readStorage<string[]>('search.recent', []))
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [sort, setSort] = useState<SortKey>('relevance')

  const bounds = useMemo(() => priceBounds(products.items), [products.items])
  const [filters, setFilters] = useState<FilterState>(() => emptyFilters(bounds))

  const onlyNew = params.get('new') === '1'
  const onlyBest = params.get('best') === '1'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const next = priceBounds(products.items)
    setFilters((prev) => ({ ...prev, minPrice: next[0], maxPrice: next[1] }))
  }, [products.items])

  /* الاقتراحات التلقائية (Debounce 300ms) */
  const [suggestions, setSuggestions] = useState<string[]>([])
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      return
    }
    const timer = window.setTimeout(() => {
      const matches = suggestProducts(products.items, trimmed, 6)
      setSuggestions(matches.map((product) => product.name))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query, products.items])

  const runSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setSubmitted(trimmed)
    setSuggestions([])
    const next = [trimmed, ...recents.filter((item) => item !== trimmed)].slice(0, 8)
    setRecents(next)
    writeStorage('search.recent', next)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 450)
  }

  const results = useMemo(() => {
    const list = filterProducts(
      products.items,
      {
        q: submitted,
        categoryIds: filters.categoryIds,
        brandIds: filters.brandIds,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minRating: filters.minRating || undefined,
        availableOnly: filters.availableOnly,
        onlyNew,
        onlyBestSellers: onlyBest,
      },
      { brandName, categoryNames },
    )
    return sortProducts(list, sort)
  }, [products.items, submitted, filters, sort, onlyNew, onlyBest, brandName, categoryNames])

  const clearHistory = () => {
    setRecents([])
    writeStorage('search.recent', [])
    setClearConfirm(false)
  }

  const header = (
    <header className="sticky top-0 z-30 shrink-0 border-b border-gray-100 bg-white px-2 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 px-1 text-[13px] font-bold text-brand"
        >
          إلغاء
        </button>
        <div className="relative flex flex-1 items-center">
          <SearchIcon className="pointer-events-none absolute start-3 size-4 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch(query)
            }}
            placeholder={t('topbar.searchPlaceholder', 'ابحث عن منتجات...')}
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-8 text-[13px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
              }}
              className="absolute end-2 flex size-6 items-center justify-center rounded-full text-gray-400"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )

  const showIdleState = suggestions.length === 0

  return (
    <Screen header={header}>
      {suggestions.length > 0 && !submitted && (
        <ul className="divide-y divide-gray-100 bg-white">
          {suggestions.map((suggestion) => {
            const index = suggestion.toLowerCase().indexOf(query.trim().toLowerCase())
            const before = suggestion.slice(0, index)
            const match = suggestion.slice(index, index + query.trim().length)
            const after = suggestion.slice(index + query.trim().length)
            return (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => runSearch(suggestion)}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-start"
                >
                  <SearchIcon className="size-4 shrink-0 text-gray-400" />
                  <span className="text-[13px] text-gray-700">
                    {index >= 0 ? (
                      <>
                        {before}
                        <strong className="font-extrabold text-gray-900">{match}</strong>
                        {after}
                      </>
                    ) : (
                      suggestion
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {showIdleState && !submitted && (
        <div className="space-y-6 p-4">
          {recents.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13.5px] font-extrabold text-gray-900">
                  {t('search.recent', 'عمليات البحث الأخيرة')}
                </h3>
                <button
                  type="button"
                  onClick={() => setClearConfirm(true)}
                  className="text-[12px] font-bold text-danger"
                >
                  {t('search.clearAll', 'مسح الكل')}
                </button>
              </div>
              <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                {recents.map((item) => (
                  <li key={item} className="flex items-center gap-2 px-3 py-2.5">
                    <Clock className="size-4 shrink-0 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => runSearch(item)}
                      className="min-w-0 flex-1 truncate text-start text-[13px] text-gray-700"
                    >
                      {item}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = recents.filter((value) => value !== item)
                        setRecents(next)
                        writeStorage('search.recent', next)
                      }}
                      className="flex size-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {settings.popularSearches.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[13.5px] font-extrabold text-gray-900">
                <TrendingUp className="size-4 text-brand" />
                {t('search.popular', 'الأكثر بحثًا')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings.popularSearches.map((item) => (
                  <Chip key={item} onClick={() => runSearch(item)}>
                    {item}
                  </Chip>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {submitted && (
        <>
          <FilterBar
            onOpenFilters={() => setShowFilter(true)}
            onOpenSort={() => setShowSort(true)}
            filters={filters}
            bounds={bounds}
            categories={categories.items}
            brands={brands.items.filter((brand) => brand.active)}
            onChange={setFilters}
            sort={sort}
          />
          <div className="p-4">
            <p className="mb-3 text-[12.5px] text-gray-500">
              {t('results.for', 'نتائج البحث عن:')} <span className="font-bold text-gray-800">{submitted}</span>{' '}
              <span className="text-gray-400">({results.length} منتج)</span>
            </p>
            <ProductGrid
              products={results}
              loading={loading}
              highlight={submitted}
              emptyState={
                <EmptyState
                  icon={<PackageSearch className="size-9" />}
                  title={`لم نجد نتائج لـ "${submitted}"`}
                  body={t('empty.search.body', 'حاول البحث بكلمات مختلفة أو تصفح الأقسام.')}
                  action={<Button onClick={() => navigate('/categories')}>{t('empty.search.cta', 'تصفح الأقسام')}</Button>}
                />
              }
            />
          </div>
        </>
      )}

      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        value={filters}
        onApply={(value) => {
          setFilters(value)
          setShowFilter(false)
          setLoading(true)
          window.setTimeout(() => setLoading(false), 350)
        }}
        bounds={bounds}
        categories={categories.items.filter((category) => !category.parentId)}
        brands={brands.items.filter((brand) => brand.active)}
        currency={settings.currency}
      />
      <SortSheet open={showSort} onClose={() => setShowSort(false)} value={sort} onChange={setSort} />
      <ConfirmDialog
        open={clearConfirm}
        title="مسح سجل البحث"
        message={t('search.clearConfirm', 'هل تريد مسح سجل البحث بالكامل؟')}
        confirmLabel="مسح"
        danger
        onConfirm={clearHistory}
        onCancel={() => setClearConfirm(false)}
      />
    </Screen>
  )
}

/* ==========================================================================
   البحث والفلترة والترتيب
   ========================================================================== */
import type { Product } from '@/types'
import { discountPercent, isDiscountActive, isOutOfStock } from '@/lib/pricing'

export interface ProductFilters {
  q?: string
  categoryIds?: string[]
  brandIds?: string[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  availableOnly?: boolean
  onlyDiscounted?: boolean
  onlyNew?: boolean
  onlyBestSellers?: boolean
  excludeIds?: string[]
}

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'best' | 'rating'

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'relevance', label: 'الأكثر صلة' },
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'best', label: 'الأكثر مبيعًا' },
  { value: 'rating', label: 'التقييم الأعلى' },
]

export function matchesQuery(product: Product, query: string, brandName = '', categoryNames = ''): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [product.name, product.sku, product.shortDescription, product.description, brandName, categoryNames, ...product.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).some((word) => haystack.includes(word))
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  helpers?: { brandName?: (id?: string) => string; categoryNames?: (ids: string[]) => string },
): Product[] {
  const visible = products.filter((p) => p.status === 'published')
  return visible.filter((product) => {
    if (filters.excludeIds?.includes(product.id)) return false
    if (filters.q && !matchesQuery(product, filters.q, helpers?.brandName?.(product.brandId), helpers?.categoryNames?.(product.categoryIds))) return false
    if (filters.categoryIds?.length && !product.categoryIds.some((id) => filters.categoryIds!.includes(id))) return false
    if (filters.brandIds?.length && (!product.brandId || !filters.brandIds.includes(product.brandId))) return false
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false
    if (filters.minRating !== undefined && product.rating < filters.minRating) return false
    if (filters.availableOnly && isOutOfStock(product)) return false
    if (filters.onlyDiscounted && !isDiscountActive(product)) return false
    if (filters.onlyNew && !product.isNew) return false
    if (filters.onlyBestSellers && !product.isBestSeller) return false
    return true
  })
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'newest':
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'best':
      return list.sort((a, b) => b.sales - a.sales)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    default:
      return list.sort((a, b) => {
        const scoreA = (a.isFeatured ? 2 : 0) + (a.isBestSeller ? 1 : 0) + discountPercent(a) / 100
        const scoreB = (b.isFeatured ? 2 : 0) + (b.isBestSeller ? 1 : 0) + discountPercent(b) / 100
        return scoreB - scoreA
      })
  }
}

/** اقتراحات البحث التلقائية */
export function suggestProducts(products: Product[], query: string, limit = 6): Product[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const starts: Product[] = []
  const contains: Product[] = []
  products.forEach((product) => {
    if (product.status !== 'published') return
    const name = product.name.toLowerCase()
    if (name.startsWith(q)) starts.push(product)
    else if (name.includes(q) || product.tags.some((t) => t.toLowerCase().includes(q))) contains.push(product)
  })
  return [...starts, ...contains].slice(0, limit)
}

export function priceBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 10000]
  const prices = products.filter((p) => p.status === 'published').map((p) => p.price)
  if (prices.length === 0) return [0, 10000]
  return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
}

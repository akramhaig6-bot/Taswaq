import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent, Sparkles } from 'lucide-react'
import { filterProducts, sortProducts } from '@/lib/query'
import { discountPercent, isDiscountActive } from '@/lib/pricing'
import { formatNumber } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { TopBar } from '@/components/layout/TopBar'
import { BannerCarousel } from '@/components/customer/BannerCarousel'
import { CountdownTimer } from '@/components/customer/CountdownTimer'
import { ProductCard, ProductCarousel } from '@/components/customer/product'
import { Chip, SectionHeader } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'
import type { Product } from '@/types'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { settings, products, banners, categories, brands, brandName, categoryNames } = useAppData()

  const published = useMemo(() => products.items.filter((product) => product.status === 'published'), [products.items])

  const activeBanners = useMemo(
    () =>
      banners.items
        .filter((banner) => {
          if (!banner.active) return false
          const now = Date.now()
          if (banner.startDate && new Date(banner.startDate).getTime() > now) return false
          if (banner.endDate && new Date(banner.endDate).getTime() < now) return false
          return true
        })
        .sort((a, b) => a.order - b.order),
    [banners.items],
  )

  const rootCategories = useMemo(
    () => categories.items.filter((c) => !c.parentId && c.active).sort((a, b) => a.order - b.order),
    [categories.items],
  )

  const dealProducts = useMemo(
    () =>
      published
        .filter((product) => isDiscountActive(product))
        .sort((a, b) => discountPercent(b) - discountPercent(a))
        .slice(0, settings.sections.find((s) => s.kind === 'deals')?.limit ?? 8),
    [published, settings.sections],
  )

  const bestProducts = useMemo(
    () =>
      sortProducts(
        published.filter((product) => product.isBestSeller),
        'best',
      ).slice(0, settings.sections.find((s) => s.kind === 'best')?.limit ?? 6),
    [published, settings.sections],
  )

  const newProducts = useMemo(
    () =>
      sortProducts(
        published.filter((product) => product.isNew),
        'newest',
      ).slice(0, settings.sections.find((s) => s.kind === 'new')?.limit ?? 8),
    [published, settings.sections],
  )

  const dealsExpired = new Date(settings.deals.end).getTime() < Date.now()

  const sections = useMemo(
    () => settings.sections.filter((section) => section.enabled).sort((a, b) => a.order - b.order),
    [settings.sections],
  )

  const renderProducts = (list: Product[], layout: 'row' | 'grid') => {
    if (list.length === 0) return null
    return layout === 'grid' ? (
      <div className="grid grid-cols-2 gap-3">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <ProductCarousel products={list} />
    )
  }

  return (
    <Screen header={<TopBar />}>
      <div className="space-y-6 px-4 pb-6 pt-3">
        {sections.map((section) => {
          if (section.kind === 'banners') {
            if (activeBanners.length === 0) return null
            return <BannerCarousel key={section.id} banners={activeBanners} />
          }

          if (section.kind === 'categories') {
            if (rootCategories.length === 0) return null
            return (
              <section key={section.id}>
                <SectionHeader
                  title={t('home.shopByCategory', section.title || 'تسوق حسب القسم')}
                  actionLabel={t('common.viewAll', 'عرض الكل')}
                  onAction={() => navigate('/categories')}
                />
                <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                  {rootCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => navigate(`/category/${category.id}`)}
                      className="flex w-20 shrink-0 flex-col items-center gap-1.5"
                    >
                      <span className="size-[68px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                        <img src={category.image} alt={category.name} className="size-full object-cover" />
                      </span>
                      <span className="line-clamp-2 text-center text-[11.5px] font-semibold text-gray-700">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }

          if (section.kind === 'deals') {
            if (dealProducts.length === 0) return null
            if (dealsExpired && settings.deals.hideWhenExpired) return null
            return (
              <section key={section.id} className="rounded-2xl bg-gradient-to-l from-danger/5 to-warning/5 p-3">
                <SectionHeader
                  title={t('home.deals', section.title || 'عروض اليوم')}
                  actionLabel={t('common.viewAll', 'عرض الكل')}
                  onAction={() => navigate('/offers')}
                  extra={
                    !dealsExpired ? (
                      <CountdownTimer end={settings.deals.end} size="sm" />
                    ) : (
                      <Chip>
                        <Percent className="size-3" /> انتهى العرض
                      </Chip>
                    )
                  }
                />
                <ProductCarousel products={dealProducts} />
              </section>
            )
          }

          if (section.kind === 'best') {
            if (bestProducts.length === 0) return null
            return (
              <section key={section.id}>
                <SectionHeader
                  title={t('home.best', section.title || 'الأكثر مبيعًا')}
                  actionLabel={t('common.viewAll', 'عرض الكل')}
                  onAction={() => navigate('/search?best=1')}
                />
                {renderProducts(bestProducts, section.layout)}
              </section>
            )
          }

          if (section.kind === 'new') {
            if (newProducts.length === 0) return null
            return (
              <section key={section.id}>
                <SectionHeader
                  title={t('home.new', section.title || 'وصل حديثًا')}
                  actionLabel={t('common.viewAll', 'عرض الكل')}
                  onAction={() => navigate('/search?new=1')}
                  extra={<Sparkles className="size-4 text-gold" />}
                />
                {renderProducts(newProducts, section.layout)}
              </section>
            )
          }

          if (section.kind === 'brands') {
            const activeBrands = brands.items.filter((brand) => brand.active).sort((a, b) => a.order - b.order)
            if (activeBrands.length === 0) return null
            return (
              <section key={section.id}>
                <SectionHeader title={t('home.brands', section.title || 'تسوق حسب العلامة التجارية')} />
                <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
                  {activeBrands.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => navigate(`/brand/${brand.id}`)}
                      className="flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-2.5 transition-colors hover:border-brand"
                    >
                      <img src={brand.logo} alt={brand.name} className="h-9 w-full object-contain" />
                      <span className="text-[11px] font-semibold text-gray-600">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )
          }

          /* أقسام مخصصة */
          const customList = section.productIds?.length
            ? section.productIds
                .map((id) => published.find((product) => product.id === id))
                .filter(Boolean) as Product[]
            : filterProducts(
                published,
                {
                  categoryIds: section.filter?.categoryIds,
                  brandIds: section.filter?.brandIds,
                  minPrice: section.filter?.minPrice,
                  maxPrice: section.filter?.maxPrice,
                  minRating: section.filter?.minRating,
                  onlyDiscounted: section.filter?.onlyDiscounted,
                  onlyNew: section.filter?.onlyNew,
                  onlyBestSellers: section.filter?.bestSellers,
                },
                { brandName, categoryNames },
              ).slice(0, section.limit ?? 8)

          if (customList.length === 0) return null
          return (
            <section key={section.id}>
              <SectionHeader
                title={section.title}
                actionLabel={t('common.viewAll', 'عرض الكل')}
                onAction={() =>
                  navigate(
                    section.filter?.categoryIds?.length
                      ? `/category/${section.filter.categoryIds[0]}/products`
                      : '/search',
                  )
                }
              />
              {renderProducts(customList, section.layout)}
            </section>
          )
        })}

        <footer className="pt-2 pb-4 text-center">
          <p className="text-[11.5px] text-gray-400">{settings.copyright}</p>
          <p className="mt-1 text-[10.5px] text-gray-300">
            {formatNumber(published.length)} منتج متاح الآن
          </p>
        </footer>
      </div>
    </Screen>
  )
}

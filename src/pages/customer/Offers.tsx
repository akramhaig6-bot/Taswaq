import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent, Tag } from 'lucide-react'
import { discountPercent, isDiscountActive } from '@/lib/pricing'
import { Screen } from '@/components/layout/Screen'
import { TopBar } from '@/components/layout/TopBar'
import { BannerCarousel } from '@/components/customer/BannerCarousel'
import { CountdownTimer } from '@/components/customer/CountdownTimer'
import { ProductGrid } from '@/components/customer/product'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, SectionHeader } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'

export default function Offers() {
  const navigate = useNavigate()
  const { products, banners, categories, settings } = useAppData()

  const discounted = useMemo(
    () => products.items.filter((product) => product.status === 'published' && isDiscountActive(product)),
    [products.items],
  )

  const dealBanners = useMemo(
    () => banners.items.filter((banner) => banner.active && banner.target.type === 'offer').sort((a, b) => a.order - b.order),
    [banners.items],
  )

  const categoryDeals = useMemo(() => {
    const rows = categories.items
      .filter((category) => !category.parentId)
      .map((category) => {
        const childIds = categories.items.filter((child) => child.parentId === category.id).map((child) => child.id)
        const ids = [category.id, ...childIds]
        const list = discounted.filter((product) => product.categoryIds.some((id) => ids.includes(id)))
        const max = list.reduce((value, product) => Math.max(value, discountPercent(product)), 0)
        return { category, count: list.length, max }
      })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.max - a.max)
    return rows
  }, [categories.items, discounted])

  const expired = new Date(settings.deals.end).getTime() < Date.now()

  return (
    <Screen header={<TopBar showSearch={false} />}>
      <div className="space-y-6 p-4">
        <h1 className="text-[17px] font-extrabold text-gray-900">العروض والتخفيضات</h1>

        {discounted.length === 0 ? (
          <EmptyState
            icon={<Tag className="size-9" />}
            title="لا توجد عروض حاليًا."
            body="تابعنا للحصول على أحدث العروض والتخفيضات."
            action={<Button onClick={() => navigate('/')}>تصفح المنتجات</Button>}
          />
        ) : (
          <>
            {dealBanners.length > 0 && <BannerCarousel banners={dealBanners} />}

            <section className="rounded-2xl bg-gradient-to-l from-danger/5 to-warning/5 p-3">
              <SectionHeader
                title="عروض محدودة"
                extra={!expired ? <CountdownTimer end={settings.deals.end} size="sm" /> : undefined}
              />
              <ProductGrid products={discounted} pageSize={6} />
            </section>

            <section>
              <SectionHeader title="خصومات حسب القسم" />
              <div className="grid grid-cols-2 gap-3">
                {categoryDeals.slice(0, 6).map(({ category, count, max }) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => navigate(`/category/${category.id}/products`)}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 text-start transition-colors hover:border-brand"
                  >
                    <img src={category.image} alt={category.name} className="size-11 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold text-gray-800">{category.name}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <Badge tone="danger">
                          <Percent className="size-3" /> حتى {max}%
                        </Badge>
                        <span className="text-[10.5px] text-gray-400">{count} منتج</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </Screen>
  )
}

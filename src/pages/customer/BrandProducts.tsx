import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Store } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/ui/display'
import { ProductListing } from '@/components/customer/ProductListing'
import { useAppData } from '@/store/AppDataContext'

export default function BrandProducts() {
  const { id = '' } = useParams()
  const { getBrand, products } = useAppData()
  const brand = getBrand(id)

  const list = useMemo(
    () => products.items.filter((product) => product.brandId === id),
    [products.items, id],
  )

  if (!brand) {
    return (
      <Screen header={<PageHeader title="العلامة التجارية" backTo="/" />}>
        <EmptyState icon={<Store className="size-9" />} title="هذه العلامة التجارية غير متاحة." />
      </Screen>
    )
  }

  return (
    <ProductListing
      title={brand.name}
      subtitle={`جميع منتجات ${brand.name}`}
      products={list}
      backTo={-1}
      lockedCategoryId={undefined}
      emptyTitle={`لا توجد منتجات من ${brand.name} حاليًا.`}
    />
  )
}

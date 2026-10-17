import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, FolderOpen } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { TopBar, PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'
import { ProductListing } from '@/components/customer/ProductListing'
import { useAppData } from '@/store/AppDataContext'

/** شاشة الأقسام الرئيسية */
export default function Categories() {
  const navigate = useNavigate()
  const { categories, categoryProductCount } = useAppData()
  const roots = useMemo(
    () => categories.items.filter((category) => !category.parentId && category.active).sort((a, b) => a.order - b.order),
    [categories.items],
  )

  if (roots.length === 0) {
    return (
      <Screen header={<TopBar showSearch={false} />}>
        <EmptyState icon={<FolderOpen className="size-9" />} title="لا توجد أقسام حاليًا." />
      </Screen>
    )
  }

  return (
    <Screen header={<TopBar showSearch={false} />}>
      <div className="p-4">
        <h1 className="mb-3 text-[17px] font-extrabold text-gray-900">الأقسام</h1>
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {roots.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => navigate(`/category/${category.id}`)}
                className="flex w-full items-center gap-3 p-3 text-start transition-colors hover:bg-gray-50"
              >
                <span className="relative size-12 shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="size-12 rounded-xl border border-gray-100 object-cover"
                  />
                  {category.emoji ? (
                    <span className="absolute -bottom-1.5 start-[-6px] flex size-6 items-center justify-center rounded-full border-2 border-white bg-white text-[12px] leading-none shadow-sm">
                      {category.emoji}
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-gray-800">{category.name}</span>
                  <span className="mt-0.5 block text-[11.5px] text-gray-500">
                    ({categoryProductCount(category.id)} منتج)
                  </span>
                </span>
                <ChevronLeft className="size-5 shrink-0 text-gray-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  )
}

/** شاشة القسم: أقسام فرعية إن وُجدت، وإلا قائمة المنتجات */
export function CategoryView() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getCategory, childCategories, products, categoryProductCount } = useAppData()

  const category = getCategory(id)
  const children = childCategories(id)
  const categoryProducts = useMemo(
    () => products.items.filter((product) => product.categoryIds.includes(id)),
    [products.items, id],
  )

  if (!category) {
    return (
      <Screen header={<PageHeader title="القسم غير موجود" backTo="/categories" />}>
        <EmptyState icon={<FolderOpen className="size-9" />} title="هذا القسم غير متاح." />
      </Screen>
    )
  }

  if (children.length > 0) {
    return (
      <Screen header={<PageHeader title={category.name} subtitle={category.description} backTo="/categories" />}>
        <div className="space-y-3 p-4">
          <Button variant="outline" fullWidth onClick={() => navigate(`/category/${category.id}/products`)}>
            عرض جميع منتجات {category.name} ({categoryProductCount(category.id)})
          </Button>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/category/${child.id}/products`)}
                  className="flex w-full items-center gap-3 p-3 text-start transition-colors hover:bg-gray-50"
                >
                  <span className="relative size-11 shrink-0">
                    <img src={child.image} alt={child.name} className="size-11 rounded-xl border border-gray-100 object-cover" />
                    {child.emoji ? (
                      <span className="absolute -bottom-1.5 start-[-6px] flex size-5 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] leading-none shadow-sm">
                        {child.emoji}
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-gray-800">{child.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-gray-500">
                      ({categoryProductCount(child.id)} منتج)
                    </span>
                  </span>
                  <ChevronLeft className="size-5 text-gray-300" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Screen>
    )
  }

  return (
    <ProductListing
      title={category.name}
      subtitle={category.description}
      products={categoryProducts}
      backTo="/categories"
      lockedCategoryId={category.id}
      emptyTitle="لا توجد منتجات في هذا القسم حاليًا."
      emptyAction={
        <Button onClick={() => navigate('/categories')}>تصفح أقسام أخرى</Button>
      }
    />
  )
}

/** منتجات قسم محدد (بما فيها الأقسام الفرعية) */
export function CategoryProducts() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getCategory, childCategories, products } = useAppData()

  const category = getCategory(id)
  const ids = useMemo(() => [id, ...childCategories(id).map((child) => child.id)], [id, childCategories])

  const list = useMemo(
    () => products.items.filter((product) => product.categoryIds.some((categoryId) => ids.includes(categoryId))),
    [products.items, ids],
  )

  return (
    <ProductListing
      title={category?.name ?? 'القسم'}
      subtitle={category?.description}
      products={list}
      backTo={childCategories(id).length > 0 ? `/category/${id}` : '/categories'}
      lockedCategoryId={id}
      emptyTitle="لا توجد منتجات في هذا القسم حاليًا."
      emptyAction={<Button onClick={() => navigate('/categories')}>تصفح أقسام أخرى</Button>}
    />
  )
}

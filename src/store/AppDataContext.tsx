import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type {
  AppNotification,
  Banner,
  Brand,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  Review,
  Settings,
  StaticPage,
  TextOverride,
} from '@/types'
import {
  seedAdmin,
  seedBanners,
  seedBrands,
  seedCategories,
  seedCoupons,
  seedCustomers,
  seedNotifications,
  seedOrders,
  seedPages,
  seedProducts,
  seedReviews,
  seedSettings,
} from '@/data/seed'
import { TEXT_REGISTRY } from '@/lib/i18n'

/** النصوص القابلة للتعديل + معرّف للتخزين (نفس المفتاح) */
export type TextOverrideRow = TextOverride & { id: string }
import { uid } from '@/lib/utils'
import { resetAppData, useCollection, usePersistedState } from '@/store/persist'

interface CollectionApi<T extends { id: string }> {
  items: T[]
  add: (item: T) => void
  addMany: (list: T[]) => void
  update: (id: string, patch: Partial<T>) => void
  remove: (id: string) => void
  find: (id: string) => T | undefined
  set: Dispatch<SetStateAction<T[]>>
}

type Collection<T extends { id: string }> = CollectionApi<T>

interface AppDataValue {
  categories: Collection<Category>
  brands: Collection<Brand>
  products: Collection<Product>
  reviews: Collection<Review>
  customers: Collection<Customer>
  orders: Collection<Order>
  coupons: Collection<Coupon>
  banners: Collection<Banner>
  notifications: Collection<AppNotification>
  pages: Collection<StaticPage>
  overrides: Collection<TextOverrideRow>
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  adminUser: { name: string; email: string; password: string }
  updateAdmin: (patch: Partial<{ name: string; email: string; password: string }>) => void
  /* مساعدات */
  getProduct: (id?: string) => Product | undefined
  getCategory: (id?: string) => Category | undefined
  getBrand: (id?: string) => Brand | undefined
  brandName: (id?: string) => string
  categoryNames: (ids: string[]) => string
  rootCategories: Category[]
  childCategories: (parentId: string) => Category[]
  categoryProductCount: (categoryId: string) => number
  addReview: (review: Review) => void
  recomputeRating: (productId: string) => void
  pushNotification: (notification: Partial<AppNotification> & { title: string; body: string }) => void
  resetAll: () => void
}

/** مدة نافذة «عروض اليوم» بالمللي ثانية (26 ساعة) */
const DEALS_WINDOW_MS = 26 * 3_600_000

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const categories = useCollection<Category>('categories', seedCategories)
  const brands = useCollection<Brand>('brands', seedBrands)
  const products = useCollection<Product>('products', seedProducts)
  const reviews = useCollection<Review>('reviews', seedReviews)
  const customers = useCollection<Customer>('customers', seedCustomers)
  const orders = useCollection<Order>('orders', seedOrders)
  const coupons = useCollection<Coupon>('coupons', seedCoupons)
  const banners = useCollection<Banner>('banners', seedBanners)
  const notifications = useCollection<AppNotification>('notifications', seedNotifications)
  const pages = useCollection<StaticPage>('pages', seedPages)
  const overrides = useCollection<TextOverrideRow>(
    'overrides',
    TEXT_REGISTRY.map((entry) => ({ ...entry, id: entry.key })),
  )

  const [settings, setSettings] = usePersistedState<Settings>('settings', seedSettings)
  const [adminUser, setAdminUser] = usePersistedState('admin', seedAdmin)

  /*
   * تدوير حملة «عروض اليوم»:
   * مثل أي متجر حقيقي، تنتهي نافذة العروض وتبدأ نافذة جديدة تلقائيًا،
   * فلا تبقى الشاشة الرئيسية على حملة منتهية إلى الأبد.
   */
  useEffect(() => {
    const end = new Date(settings.deals.end).getTime()
    if (!Number.isFinite(end) || end > Date.now()) return
    const now = Date.now()
    setSettings((prev) => ({
      ...prev,
      deals: {
        ...prev.deals,
        start: new Date(now - 3 * 86_400_000).toISOString(),
        end: new Date(now + DEALS_WINDOW_MS).toISOString(),
      },
    }))
    /* نعتمد على القيمة الحالية فقط عند انتهاء النافذة — لا نعيد الجدولة أثناءها */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.deals.end])

  /* ---------------------------- مساعدات ---------------------------- */
  const getProduct = useCallback((id?: string) => (id ? products.items.find((p) => p.id === id) : undefined), [products.items])
  const getCategory = useCallback((id?: string) => (id ? categories.items.find((c) => c.id === id) : undefined), [categories.items])
  const getBrand = useCallback((id?: string) => (id ? brands.items.find((b) => b.id === id) : undefined), [brands.items])

  const brandName = useCallback((id?: string) => getBrand(id)?.name ?? '', [getBrand])
  const categoryNames = useCallback(
    (ids: string[]) => ids.map((id) => getCategory(id)?.name ?? '').join(' '),
    [getCategory],
  )

  const rootCategories = useMemo(
    () => categories.items.filter((c) => !c.parentId && c.active).sort((a, b) => a.order - b.order),
    [categories.items],
  )

  const childCategories = useCallback(
    (parentId: string) => categories.items.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order),
    [categories.items],
  )

  const categoryProductCount = useCallback(
    (categoryId: string) => {
      const children = categories.items.filter((c) => c.parentId === categoryId).map((c) => c.id)
      const ids = [categoryId, ...children]
      return products.items.filter((p) => p.status === 'published' && p.categoryIds.some((c) => ids.includes(c))).length
    },
    [categories.items, products.items],
  )

  const recomputeRating = useCallback(
    (productId: string) => {
      const list = reviews.items.filter((r) => r.productId === productId && r.status === 'published')
      const rating = list.length ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10 : 0
      products.update(productId, { rating, reviewCount: list.length })
    },
    [products, reviews.items],
  )

  const pushNotification = useCallback(
    (notification: Partial<AppNotification> & { title: string; body: string }) => {
      notifications.add({
        id: uid('n'),
        type: notification.type ?? 'info',
        title: notification.title,
        body: notification.body,
        createdAt: new Date().toISOString(),
        read: false,
        target: notification.target,
        forAdmin: notification.forAdmin,
      })
    },
    [notifications],
  )

  const addReview = useCallback(
    (review: Review) => {
      reviews.add(review)
      pushNotification({
        type: 'info',
        title: 'تقييم جديد',
        body: `أضاف ${review.userName} تقييمًا بمعدل ${review.rating} نجوم.`,
        forAdmin: true,
        target: '/admin/reviews',
      })
      window.setTimeout(() => recomputeRating(review.productId), 0)
    },
    [reviews, pushNotification, recomputeRating],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })), [setSettings])

  const updateAdmin = useCallback(
    (patch: Partial<{ name: string; email: string; password: string }>) => {
      setAdminUser((prev) => ({ ...prev, ...patch }))
    },
    [setAdminUser],
  )

  const [, forceRefresh] = useState(0)
  const resetAll = useCallback(() => {
    forceRefresh((n) => n + 1)
    resetAppData()
  }, [])

  const value = useMemo<AppDataValue>(
    () => ({
      categories,
      brands,
      products,
      reviews,
      customers,
      orders,
      coupons,
      banners,
      notifications,
      pages,
      overrides,
      settings,
      updateSettings,
      adminUser,
      updateAdmin,
      getProduct,
      getCategory,
      getBrand,
      brandName,
      categoryNames,
      rootCategories,
      childCategories,
      categoryProductCount,
      addReview,
      recomputeRating,
      pushNotification,
      resetAll,
    }),
    [
      categories,
      brands,
      products,
      reviews,
      customers,
      orders,
      coupons,
      banners,
      notifications,
      pages,
      overrides,
      settings,
      updateSettings,
      adminUser,
      updateAdmin,
      getProduct,
      getCategory,
      getBrand,
      brandName,
      categoryNames,
      rootCategories,
      childCategories,
      categoryProductCount,
      addReview,
      recomputeRating,
      pushNotification,
      resetAll,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider')
  return ctx
}

import { useEffect, useRef, useState } from 'react'
import { Heart, PackageSearch, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { cn, formatPrice, highlightParts } from '@/lib/utils'
import { discountPercent, isDiscountActive, isOutOfStock } from '@/lib/pricing'
import { Badge, DiscountBadge, EmptyState, ProductGridSkeleton, Rating } from '@/components/ui/display'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/store/CartContext'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'
import { useToast } from '@/store/ToastContext'
import { useAuth } from '@/store/AuthContext'
import { useWishlist } from '@/store/WishlistContext'

export function ProductCard({
  product,
  compact = false,
  highlight,
}: {
  product: Product
  compact?: boolean
  /** كلمة البحث لإبرازها بخط عريض في اسم المنتج */
  highlight?: string
}) {
  const navigate = useNavigate()
  const { t } = useLang()
  const { settings } = useAppData()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const wishlist = useWishlist()

  const outOfStock = isOutOfStock(product)
  const hasDiscount = isDiscountActive(product)
  const percent = hasDiscount ? discountPercent(product) : 0
  const [pulse, setPulse] = useState(false)
  const isFav = wishlist.has(product.id)

  const openProduct = () => navigate(`/product/${product.id}`)

  const onAdd = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (outOfStock) return
    if (product.options.length > 0) {
      showToast('هذا المنتج له خيارات، اخترها أولًا', { type: 'info' })
      openProduct()
      return
    }
    addToCart(product, 1, {})
    showToast(`${t('toast.addedToCart', 'تمت الإضافة إلى السلة')}`, {
      type: 'success',
      action: { label: 'عرض السلة', onClick: () => navigate('/cart') },
    })
  }

  const onToggleWishlist = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/wishlist' } })
      return
    }
    const added = wishlist.toggle(product.id)
    setPulse(true)
    window.setTimeout(() => setPulse(false), 450)
    if (added) {
      showToast(t('toast.addedToWishlist', 'تمت الإضافة إلى المفضلة'), { type: 'success' })
      return
    }
    /* الوثيقة (16): إزالة من المفضلة + Toast مع زر «تراجع» (5 ثوانٍ) */
    showToast(t('toast.removedFromWishlist', 'تمت الإزالة من المفضلة'), {
      type: 'info',
      action: { label: 'تراجع', onClick: () => wishlist.toggle(product.id) },
    })
  }

  return (
    <article
      onClick={openProduct}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all',
        'hover:border-gray-200 hover:shadow-sm active:scale-[.99]',
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
          <div className="flex flex-col gap-1">
            {hasDiscount && <DiscountBadge percent={percent} />}
            {product.isNew && <Badge tone="success">جديد</Badge>}
            {outOfStock && <Badge tone="danger">{t('common.outOfStock', 'غير متوفر')}</Badge>}
          </div>
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label="المفضلة"
            className={cn(
              'flex size-8 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur transition-colors',
              isFav ? 'text-danger' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Heart className={cn('size-4', isFav && 'fill-danger', pulse && 'animate-heart')} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="line-clamp-2 min-h-9 text-[13px] font-semibold leading-[18px] text-gray-800">
          {highlight
            ? highlightParts(product.name, highlight).map((part, index) =>
                part.match ? (
                  <strong key={index} className="font-extrabold text-gray-900">
                    {part.text}
                  </strong>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )
            : product.name}
        </h3>
        {!compact && product.reviewCount > 0 && <Rating value={product.rating} count={product.reviewCount} size={12} />}
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className={cn('text-[15px] font-extrabold', hasDiscount ? 'text-danger' : 'text-gray-900')}>
              {formatPrice(product.price, settings.currency)}
            </span>
            {hasDiscount && (
              <span className="text-[11.5px] text-gray-400 line-through">
                {formatPrice(product.compareAtPrice as number, settings.currency)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={outOfStock ? 'ghost' : 'soft'}
            disabled={outOfStock}
            onClick={onAdd}
            className="mt-0.5 w-full"
            icon={<ShoppingCart className="size-3.5" />}
          >
            {outOfStock ? t('common.outOfStock', 'غير متوفر') : t('common.add', 'أضف')}
          </Button>
        </div>
      </div>
    </article>
  )
}

/** مشبك منتجات مع تحميل تدريجي (Infinite Scroll) */
export function ProductGrid({
  products,
  loading = false,
  emptyState,
  pageSize = 8,
  highlight,
}: {
  products: Product[]
  loading?: boolean
  emptyState?: React.ReactNode
  pageSize?: number
  /** كلمة البحث لإبرازها في أسماء المنتجات */
  highlight?: string
}) {
  const { t } = useLang()
  const [visible, setVisible] = useState(pageSize)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisible(pageSize)
  }, [products, pageSize])

  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((value) => (value < products.length ? value + pageSize : value))
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [products.length, pageSize])

  if (loading) return <ProductGridSkeleton count={6} />
  if (products.length === 0)
    return (
      emptyState ?? (
        <EmptyState
          icon={<PackageSearch className="size-9" />}
          title={t('empty.categoryProducts', 'لا توجد منتجات في هذا القسم حاليًا.')}
        />
      )
    )

  const shown = products.slice(0, visible)
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} highlight={highlight} />
        ))}
      </div>
      <div ref={sentinel} className="h-8" />
      {visible >= products.length ? (
        <p className="py-4 text-center text-[12px] text-gray-400">{t('common.noMore', 'لا توجد منتجات أخرى')}</p>
      ) : (
        <div className="px-1 pb-2">
          <Button variant="outline" fullWidth onClick={() => setVisible((value) => value + pageSize)}>
            {t('common.more', 'عرض المزيد')}
          </Button>
        </div>
      )}
    </div>
  )
}

/** شريط منتجات أفقي */
export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  if (products.length === 0) return null
  return (
    <div ref={scrollRef} className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {products.map((product) => (
        <div key={product.id} className="w-[46%] shrink-0 sm:w-[180px]">
          <ProductCard product={product} compact />
        </div>
      ))}
    </div>
  )
}

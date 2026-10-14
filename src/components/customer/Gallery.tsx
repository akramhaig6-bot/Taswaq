import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Share2, X, ZoomIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { discountPercent, isDiscountActive, isOutOfStock } from '@/lib/pricing'
import { Badge, DiscountBadge } from '@/components/ui/display'
import { IconButton } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/TopBar'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import { useWishlist } from '@/store/WishlistContext'
import { useCart } from '@/store/CartContext'

/** معرض صور المنتج + عارض ملء الشاشة */
export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const [viewer, setViewer] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const startX = useRef<number | null>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const wishlist = useWishlist()
  const { count } = useCart()

  const images = product.images.length ? product.images : ['']
  const hasDiscount = isDiscountActive(product)
  const isFav = wishlist.has(product.id)

  const go = (direction: 1 | -1) => setIndex((value) => (value + direction + images.length) % images.length)

  useEffect(() => {
    if (!viewer) setZoom(false)
  }, [viewer])

  const share = async () => {
    const url = `${window.location.origin}/product/${product.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: product.shortDescription, url })
        return
      } catch {
        /* المستخدم أغلق نافذة المشاركة */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('تم نسخ رابط المنتج.', { type: 'success' })
    } catch {
      showToast('تعذّر نسخ الرابط.', { type: 'error' })
    }
  }

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${product.id}` } })
      return
    }
    const added = wishlist.toggle(product.id)
    setFavorite(true)
    window.setTimeout(() => setFavorite(false), 450)
    showToast(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة', { type: added ? 'success' : 'info' })
  }

  return (
    <>
      <PageHeader
        title={product.name}
        backTo={-1}
        actions={
          <>
            <IconButton onClick={share} aria-label="مشاركة">
              <Share2 className="size-5" />
            </IconButton>
            <IconButton onClick={() => navigate('/cart')} badge={count} aria-label="السلة">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
                <path d="M2.5 3h2.2l2.4 12.2h11.3l2.1-8.4H6.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </>
        }
      />

      <div className="relative bg-gray-50">
        <div
          className="relative aspect-square w-full overflow-hidden"
          onTouchStart={(event) => {
            startX.current = event.touches[0].clientX
          }}
          onTouchEnd={(event) => {
            if (startX.current === null) return
            const delta = event.changedTouches[0].clientX - startX.current
            if (Math.abs(delta) > 45) go(delta < 0 ? -1 : 1)
            startX.current = null
          }}
          onClick={() => setViewer(true)}
        >
          <img src={images[index]} alt={product.name} className="size-full object-cover" />
        </div>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              toggleFavorite()
            }}
            className={cn(
              'flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors',
              isFav ? 'text-danger' : 'text-gray-500',
            )}
            aria-label="المفضلة"
          >
            <Heart className={cn('size-[18px]', isFav && 'fill-danger', favorite && 'animate-heart')} />
          </button>
          <div className="flex flex-col items-end gap-1">
            {hasDiscount && <DiscountBadge percent={discountPercent(product)} />}
            {product.isNew && <Badge tone="success">جديد</Badge>}
            {isOutOfStock(product) && <Badge tone="danger">غير متوفر</Badge>}
          </div>
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {images.map((image, i) => (
              <button
                key={`${image.slice(0, 16)}-${i}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setIndex(i)
                }}
                aria-label={`صورة ${i + 1}`}
                className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-brand' : 'w-1.5 bg-gray-400/60')}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto bg-gray-50 px-4 py-2">
          {images.map((image, i) => (
            <button
              key={`${image.slice(0, 16)}-thumb-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'size-12 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === index ? 'border-brand' : 'border-transparent',
              )}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 animate-fade-in">
          <div className="flex items-center justify-between p-3 text-white">
            <button
              type="button"
              onClick={() => setViewer(false)}
              className="flex size-9 items-center justify-center rounded-full bg-white/10"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>
            <span className="text-[12.5px] text-white/70">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setZoom((value) => !value)}
              className="flex size-9 items-center justify-center rounded-full bg-white/10"
              aria-label="تكبير"
            >
              <ZoomIn className="size-5" />
            </button>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onTouchStart={(event) => {
              startX.current = event.touches[0].clientX
            }}
            onTouchEnd={(event) => {
              if (startX.current === null) return
              const delta = event.changedTouches[0].clientX - startX.current
              if (Math.abs(delta) > 45) go(delta < 0 ? -1 : 1)
              startX.current = null
            }}
          >
            <img
              src={images[index]}
              alt={product.name}
              onClick={() => setZoom((value) => !value)}
              className={cn('max-h-full max-w-full object-contain transition-transform duration-300', zoom && 'scale-150')}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute inset-y-0 start-0 flex w-14 items-center justify-center text-white/70"
                  aria-label="السابق"
                >
                  <ChevronRight className="size-7" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute inset-y-0 end-0 flex w-14 items-center justify-center text-white/70"
                  aria-label="التالي"
                >
                  <ChevronLeft className="size-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Check, Download, PackageSearch, ShoppingCart, X } from 'lucide-react'
import type { Product, ProductOption } from '@/types'
import { cn, formatNumber, formatPrice } from '@/lib/utils'
import { discountPercent, isDiscountActive, isOutOfStock, optionsLabel, requiresShipping, unitPrice } from '@/lib/pricing'
import { openWhatsApp } from '@/lib/whatsapp'
import { Screen } from '@/components/layout/Screen'
import { ProductGallery } from '@/components/customer/Gallery'
import { ReviewsSection } from '@/components/customer/Reviews'
import { ProductCarousel } from '@/components/customer/product'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, ExpandableText, PriceTag, QuantityStepper, Rating, SectionHeader, Skeleton } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'

function DetailSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-2/5" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}

export default function ProductDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getProduct, getBrand, products, settings, reviews } = useAppData()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const product = getProduct(id)
  const brand = getBrand(product?.brandId)

  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelected({})
    setQuantity(1)
    setErrors({})
    const timer = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(timer)
  }, [id])

  const reviewList = useMemo(
    () => reviews.items.filter((review) => review.productId === id && review.status === 'published'),
    [reviews.items, id],
  )

  const related = useMemo(() => {
    if (!product) return []
    const manual = product.relatedIds
      .map((relatedId) => products.items.find((item) => item.id === relatedId))
      .filter((item): item is Product => Boolean(item) && item!.status === 'published')
    if (manual.length >= 4) return manual.slice(0, 8)
    const fallback = products.items.filter(
      (item) =>
        item.id !== product.id &&
        item.status === 'published' &&
        (item.categoryIds.some((categoryId) => product.categoryIds.includes(categoryId)) ||
          item.brandId === product.brandId),
    )
    const merged = [...manual, ...fallback.filter((item) => !manual.some((m) => m.id === item.id))]
    return merged.slice(0, 8)
  }, [product, products.items])

  if (!product) {
    return (
      <Screen>
        <div className="flex h-full flex-col items-center justify-center">
          <EmptyState
            icon={<PackageSearch className="size-9" />}
            title="المنتج غير موجود"
            body="ربما تم حذف هذا المنتج أو تغيّر رابطه."
            action={<Button onClick={() => navigate('/')}>تصفح المنتجات</Button>}
          />
        </div>
      </Screen>
    )
  }

  if (loading) {
    return (
      <Screen>
        <DetailSkeleton />
      </Screen>
    )
  }

  const outOfStock = isOutOfStock(product)
  const hasDiscount = isDiscountActive(product)
  const percent = discountPercent(product)
  const price = unitPrice(product, selected)

  const valueAvailability = (option: ProductOption, valueId: string) => {
    const value = option.values.find((item) => item.id === valueId)
    if (!value) return false
    if (!value.available) return false
    if (value.stock !== undefined && value.stock <= 0) return false
    return true
  }

  const selectedStock = product.options.reduce((stock, option) => {
    const value = option.values.find((item) => item.id === selected[option.id])
    if (value?.stock !== undefined) return Math.min(stock, value.stock)
    return stock
  }, product.stock)

  const maxQuantity = product.trackStock ? Math.max(1, selectedStock) : 99

  const validate = () => {
    const next: Record<string, string> = {}
    product.options.forEach((option) => {
      if (!selected[option.id]) next[option.id] = `يرجى اختيار ${option.label}`
    })
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(`option-${Object.keys(next)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  const doAdd = (silent = false) => {
    addToCart(product, quantity, selected)
    if (!silent) {
      setAdding(true)
      window.setTimeout(() => {
        setAdding(false)
        setAdded(true)
        window.setTimeout(() => setAdded(false), 1500)
      }, 450)
      showToast(`تمت إضافة ${product.name} إلى السلة`, {
        type: 'success',
        action: { label: 'عرض السلة', onClick: () => navigate('/cart') },
      })
    }
  }

  const onAddToCart = () => {
    if (outOfStock || adding) return
    if (!validate()) return
    doAdd()
  }

  /** «اشترِ الآن» يفتح واتساب المتجر مباشرة برسالة جاهزة — دون عرض الرقم */
  const onBuyNow = () => {
    if (outOfStock) return
    if (!validate()) return
    const choices = optionsLabel(product, selected)
    const message = [
      `مرحبًا، أرغب في شراء هذا المنتج من ${settings.storeName}:`,
      `• المنتج: ${product.name}`,
      choices ? `• الخيارات: ${choices}` : '',
      `• الكمية: ${quantity}`,
      `• السعر: ${formatPrice(price * quantity, settings.currency)}`,
      `• الرابط: ${window.location.href}`,
    ]
      .filter(Boolean)
      .join('\n')
    showToast('جارٍ فتح واتساب لإتمام الطلب...', { type: 'success' })
    openWhatsApp(message, settings.contact.whatsapp)
  }

  const stockBadge = () => {
    if (outOfStock) return <Badge tone="danger"><X className="size-3" /> غير متوفر حاليًا</Badge>
    const threshold = product.lowStockThreshold || settings.lowStockThreshold
    if (product.trackStock && product.stock <= threshold)
      return <Badge tone="warning">بقي {formatNumber(product.stock)} فقط!</Badge>
    return <Badge tone="success"><Check className="size-3" /> {product.kind === 'service' ? 'متاح للحجز' : product.kind === 'digital' ? 'متاح للتسليم الرقمي' : 'متوفر'}</Badge>
  }

  const kindIcon = product.kind === 'service' ? <CalendarDays className="size-4" /> : product.kind === 'digital' ? <Download className="size-4" /> : <ShoppingCart className="size-4" />
  const primaryAction = product.kind === 'service' ? 'احجز الخدمة' : product.kind === 'digital' ? 'أضف إلى السلة' : 'أضف للسلة'

  return (
    <Screen
      footer={
        <div className="shrink-0 border-t border-gray-100 bg-white p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="flex items-stretch gap-2">
            <Button
              size="lg"
              className="flex-[2]"
              variant={outOfStock ? 'ghost' : 'primary'}
              disabled={outOfStock}
              loading={adding}
              onClick={onAddToCart}
              icon={!adding && (added ? <Check className="size-4" /> : kindIcon)}
            >
              {outOfStock ? 'غير متوفر' : added ? 'تمت الإضافة' : primaryAction}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={outOfStock}
              onClick={onBuyNow}
            >
              {product.kind === 'service' ? 'احجز الآن' : product.kind === 'digital' ? 'اشترِ الآن' : 'اشترِ الآن'}
            </Button>
          </div>
        </div>
      }
    >
      <ProductGallery product={product} />

      <div className="space-y-4 p-4">
        {/* المعلومات الأساسية */}
        <section>
          <h1 className="text-[17px] font-extrabold leading-7 text-gray-900">{product.name}</h1>
          {brand && (
            <button
              type="button"
              onClick={() => navigate(`/brand/${brand.id}`)}
              className="mt-1 text-[12.5px] font-bold text-brand hover:underline"
            >
              {brand.name}
            </button>
          )}
          {product.kind && product.kind !== 'physical' && (
            <div className="mt-2 rounded-xl border border-brand/10 bg-brand-soft/50 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[12.5px] font-bold text-brand">
                {product.kind === 'service' ? <CalendarDays className="size-4" /> : <Download className="size-4" />}
                {product.kind === 'service' ? 'خدمة قابلة للحجز' : 'منتج رقمي'}
              </div>
              <p className="mt-1 text-[11.5px] leading-5 text-gray-600">
                {product.kind === 'digital'
                  ? 'يتم تسليم الوصول أو الملف الرقمي ضمن تفاصيل الطلب بعد إتمام الشراء.'
                  : requiresShipping(product)
                    ? 'يتطلب إدخال عنوان الخدمة، وسيتم تنسيق موعد التنفيذ بعد تأكيد الطلب.'
                    : 'يتم تنسيق تفاصيل تنفيذ الخدمة عن بُعد ضمن متابعة الطلب.'}
              </p>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Rating
              value={product.rating}
              count={product.reviewCount}
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            />
            {stockBadge()}
          </div>
        </section>

        {/* السعر */}
        <section className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
          <PriceTag
            price={price}
            compareAtPrice={hasDiscount ? (product.compareAtPrice as number) : undefined}
            currency={settings.currency}
            size="xl"
            showSavings
          />
          {percent > 0 && (
            <p className="mt-1 text-[11.5px] text-gray-500">
              العرض ساري {product.discountEnd ? `حتى ${new Date(product.discountEnd).toLocaleDateString('en-GB')}` : 'لفترة محدودة'}
            </p>
          )}
        </section>

        {/* الخيارات */}
        {product.options.map((option) => {
          const selectedValue = option.values.find((value) => value.id === selected[option.id])
          return (
            <section key={option.id} id={`option-${option.id}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-800">
                  {option.label}
                  {selectedValue && <span className="ms-1 text-gray-500">: {selectedValue.label}</span>}
                </h3>
                {option.type !== 'color' && selectedValue?.priceDelta ? (
                  <span className="text-[11.5px] font-semibold text-gray-500">
                    +{formatNumber(selectedValue.priceDelta)} {settings.currency}
                  </span>
                ) : null}
              </div>

              {option.type === 'color' ? (
                <div className="flex flex-wrap gap-2.5">
                  {option.values.map((value) => {
                    const available = valueAvailability(option, value.id)
                    const active = selected[option.id] === value.id
                    return (
                      <button
                        key={value.id}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setSelected((prev) => ({ ...prev, [option.id]: value.id }))
                          setErrors((prev) => ({ ...prev, [option.id]: '' }))
                        }}
                        title={value.label}
                        className={cn(
                          'relative flex size-9 items-center justify-center rounded-full border-2 transition-all',
                          active ? 'border-brand ring-2 ring-brand/25' : 'border-gray-200',
                          !available && 'opacity-40',
                        )}
                      >
                        <span className="size-6 rounded-full border border-black/5" style={{ background: value.hex ?? '#e5e7eb' }} />
                        {!available && <span className="absolute h-0.5 w-9 rotate-45 rounded bg-danger" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const available = valueAvailability(option, value.id)
                    const active = selected[option.id] === value.id
                    return (
                      <button
                        key={value.id}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setSelected((prev) => ({ ...prev, [option.id]: value.id }))
                          setErrors((prev) => ({ ...prev, [option.id]: '' }))
                        }}
                        className={cn(
                          'relative rounded-xl border px-3 py-2 text-[12.5px] font-bold transition-all',
                          active ? 'border-brand bg-brand text-white' : 'border-gray-200 bg-white text-gray-700',
                          !available && 'cursor-not-allowed bg-gray-50 text-gray-400',
                        )}
                      >
                        {value.label}
                        {!available && <span className="absolute inset-x-2 top-1/2 h-0.5 -rotate-6 bg-gray-300" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {errors[option.id] && <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors[option.id]}</p>}
            </section>
          )
        })}

        {/* الكمية */}
        <section>
          <h3 className="mb-2 text-[13px] font-bold text-gray-800">الكمية</h3>
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            onExceedMax={(max) => showToast(`الكمية المتوفرة ${formatNumber(max)} فقط`, { type: 'warning' })}
          />
          <p className="mt-1.5 text-[11.5px] text-gray-500">الحد الأقصى المتوفر: {formatNumber(maxQuantity)}</p>
        </section>

        {/* الوصف */}
        {product.description && (
          <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
            <h3 className="mb-2 text-[15px] font-extrabold text-gray-900">وصف المنتج</h3>
            <ExpandableText text={product.description} />
          </section>
        )}

        {/* المواصفات */}
        {product.specifications.length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
            <h3 className="mb-2 text-[15px] font-extrabold text-gray-900">المواصفات</h3>
            <ul className="overflow-hidden rounded-xl border border-gray-100">
              {product.specifications.map((spec, index) => (
                <li
                  key={spec.id}
                  className={cn('flex items-center justify-between gap-3 px-3 py-2.5', index % 2 === 0 ? 'bg-gray-50' : 'bg-white')}
                >
                  <span className="text-[12.5px] font-semibold text-gray-600">{spec.key}</span>
                  <span className="text-end text-[12.5px] text-gray-800">{spec.value}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* التقييمات */}
        <div id="reviews">
          <ReviewsSection product={product} />
        </div>
        {reviewList.length > 0 && (
          <p className="text-center text-[11.5px] text-gray-400">
            {formatNumber(reviewList.length)} مراجعة من عملاء سوقلي
          </p>
        )}

        {/* منتجات ذات صلة */}
        {related.length > 0 && (
          <section>
            <SectionHeader title="منتجات قد تعجبك" />
            <ProductCarousel products={related} />
          </section>
        )}
      </div>
    </Screen>
  )
}

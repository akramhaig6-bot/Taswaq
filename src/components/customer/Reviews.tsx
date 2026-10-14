import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Review } from '@/types'
import { formatDate, formatNumber, initials, colorFromString, truncate } from '@/lib/utils'
import { Avatar, Badge, Button, ProgressBar, Rating, RatingInput, RowSkeleton } from '@/components/ui'
import { Input, Textarea } from '@/components/ui/form'
import { Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

export function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
  }))
  const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3.5">
      <div className="flex w-24 shrink-0 flex-col items-center gap-1">
        <span className="text-3xl font-extrabold text-gray-900">{average ? average.toFixed(1) : '0'}</span>
        <Rating value={average} size={13} />
        <span className="text-[11.5px] text-gray-500">بناءً على {formatNumber(total)} تقييم</span>
      </div>
      <div className="flex-1 space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-3 text-[11px] font-bold text-gray-500">{star}</span>
            <ProgressBar value={total ? (count / total) * 100 : 0} barClassName="bg-gold" className="h-1.5" />
            <span className="w-6 text-[11px] text-gray-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReviewItem({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const long = (review.body?.length ?? 0) > 180
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-start gap-2.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
          style={{ background: colorFromString(review.userName) }}
        >
          {initials(review.userName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-bold text-gray-800">{review.userName}</span>
            <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Rating value={review.rating} size={12} />
            {review.title && <span className="text-[13px] font-bold text-gray-800">{review.title}</span>}
          </div>
          {review.body && (
            <p className="mt-1 text-[12.5px] leading-6 text-gray-600">
              {expanded || !long ? review.body : truncate(review.body, 180)}
              {long && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="ms-1 font-bold text-brand"
                >
                  {expanded ? 'عرض أقل' : 'عرض المزيد'}
                </button>
              )}
            </p>
          )}
          {review.reply && (
            <div className="mt-2 rounded-xl bg-brand-soft p-2.5">
              <p className="text-[11.5px] font-bold text-brand">رد المتجر</p>
              <p className="mt-0.5 text-[12px] leading-6 text-gray-600">{review.reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReviewsSection({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { reviews, settings } = useAppData()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  const productReviews = useMemo(
    () => reviews.items.filter((review) => review.productId === product.id && review.status === 'published'),
    [reviews.items, product.id],
  )
  const myReview = user ? productReviews.find((review) => review.userName === user.name) : undefined

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-extrabold text-gray-900">التقييمات والمراجعات</h3>
        {settings.technical.enableReviews && (
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: `/product/${product.id}` } })
                return
              }
              setOpen(true)
            }}
            className="text-[12.5px] font-bold text-brand hover:underline"
          >
            {myReview ? 'تعديل تقييمك' : 'أضف تقييمك'}
          </button>
        )}
      </div>

      <RatingDistribution reviews={productReviews} />

      <div className="mt-2">
        {productReviews.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-gray-500">لا توجد تقييمات بعد. كن أول من يُقيّم هذا المنتج!</p>
        ) : (
          <>
            {productReviews.slice(0, 3).map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
            {productReviews.length > 3 && (
              <Button
                variant="outline"
                fullWidth
                className="mt-3"
                onClick={() => navigate(`/product/${product.id}/reviews`)}
              >
                عرض جميع المراجعات ({formatNumber(productReviews.length)})
              </Button>
            )}
          </>
        )}
      </div>

      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        product={product}
        existing={myReview}
      />
    </section>
  )
}

export function ReviewModal({
  open,
  onClose,
  product,
  existing,
}: {
  open: boolean
  onClose: () => void
  product: Product
  existing?: Review
}) {
  const { addReview, reviews } = useAppData()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const dirty = rating !== (existing?.rating ?? 0) || title !== (existing?.title ?? '') || body !== (existing?.body ?? '')

  const submit = () => {
    if (rating === 0) {
      setError('يرجى اختيار تقييم بالنجوم.')
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      if (existing) {
        reviews.update(existing.id, { rating, title, body: body || undefined })
        showToast('تم تحديث تقييمك بنجاح.', { type: 'success' })
      } else {
        addReview({
          id: `r-${product.id}-${Date.now()}`,
          productId: product.id,
          customerId: user?.id,
          userName: user?.name ?? 'عميل سوقلي',
          rating,
          title: title || undefined,
          body: body || undefined,
          createdAt: new Date().toISOString(),
          status: 'published',
        })
        showToast('شكرًا! تم إرسال تقييمك بنجاح.', { type: 'success' })
      }
      setSubmitting(false)
      onClose()
    }, 700)
  }

  const attemptClose = () => {
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={attemptClose}
        title={existing ? 'تعديل تقييمك' : 'أضف تقييمك'}
        footer={
          <Button fullWidth size="lg" loading={submitting} disabled={rating === 0} onClick={submit}>
            {existing ? 'تحديث التقييم' : 'إرسال التقييم'}
          </Button>
        }
      >
        <div className="space-y-4">
          {error && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-[12.5px] font-semibold text-danger">{error}</p>
          )}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 line-clamp-1 text-[12.5px] font-bold text-gray-700">{product.name}</p>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <Input
            label="عنوان المراجعة (اختياري)"
            placeholder="عنوان مراجعتك"
            maxLength={100}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            label="نص المراجعة (اختياري)"
            placeholder="شاركنا تجربتك مع هذا المنتج..."
            maxLength={1000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
          />
        </div>
      </Modal>

      <Modal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="تجاهل التقييم؟"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setConfirmDiscard(false)
                onClose()
              }}
            >
              تجاهل
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setConfirmDiscard(false)}>
              متابعة الكتابة
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-6 text-gray-600">هل تريد تجاهل التقييم؟ سيتم فقدان ما كتبته.</p>
      </Modal>
    </>
  )
}

export function ReviewsListSkeleton() {
  return <RowSkeleton count={3} />
}

export function ReviewSummaryBadge({ value }: { value: number }) {
  return (
    <Badge tone="gold">
      <Rating value={value} size={11} />
    </Badge>
  )
}

export function CustomerAvatar({ name }: { name: string }) {
  return <Avatar name={name} size={32} />
}

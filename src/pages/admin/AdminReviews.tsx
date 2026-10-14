import { useMemo, useState } from 'react'
import { Eye, EyeOff, MessageSquareReply, Star, Trash2 } from 'lucide-react'
import type { Review, ReviewStatus } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { AdminPage, Card, DataTable, StatCard, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip, Rating } from '@/components/ui'
import { Input, Select, Textarea } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

export default function AdminReviews() {
  const { reviews, getProduct, pushNotification, recomputeRating } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ReviewStatus>('all')
  const [rating, setRating] = useState('all')
  const [replyFor, setReplyFor] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reviews.items
      .filter((review) => {
        if (status !== 'all' && review.status !== status) return false
        if (rating !== 'all' && Math.round(review.rating) !== Number(rating)) return false
        if (q) {
          const productName = getProduct(review.productId)?.name?.toLowerCase() ?? ''
          if (
            !review.userName.toLowerCase().includes(q) &&
            !(review.body ?? '').toLowerCase().includes(q) &&
            !productName.includes(q)
          )
            return false
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reviews.items, query, status, rating, getProduct])

  const average = reviews.items.length
    ? reviews.items.reduce((sum, review) => sum + review.rating, 0) / reviews.items.length
    : 0

  const setStatusFor = (review: Review, next: ReviewStatus) => {
    reviews.update(review.id, { status: next })
    recomputeRating(review.productId)
    showToast(next === 'hidden' ? 'تم إخفاء المراجعة.' : 'تم نشر المراجعة.', { type: 'success' })
  }

  return (
    <AdminPage
      title="المراجعات"
      subtitle="مراجعة تقييمات العملاء والرد عليها"
      breadcrumbs={['لوحة الإدارة', 'المراجعات']}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المراجعات" value={String(reviews.items.length)} icon={<MessageSquareReply className="size-4" />} />
        <StatCard label="متوسط التقييم" value={average.toFixed(1)} icon={<Star className="size-4" />} hint="من 5" />
        <StatCard
          label="بانتظار المراجعة"
          value={String(reviews.items.filter((review) => review.status === 'pending').length)}
          icon="⏳"
        />
        <StatCard
          label="مراجعات مخفية"
          value={String(reviews.items.filter((review) => review.status === 'hidden').length)}
          icon="🙈"
        />
      </div>

      <Card>
        <Toolbar>
          <Input
            placeholder="ابحث باسم العميل، نص المراجعة، أو المنتج..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 min-w-56 flex-1"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | ReviewStatus)}
            options={[
              { value: 'all', label: 'كل الحالات' },
              { value: 'published', label: 'منشورة' },
              { value: 'pending', label: 'بانتظار المراجعة' },
              { value: 'hidden', label: 'مخفية' },
            ]}
            className="h-10 w-44"
          />
          <Select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            options={[
              { value: 'all', label: 'كل التقييمات' },
              ...[5, 4, 3, 2, 1].map((value) => ({ value: String(value), label: `${value} نجوم` })),
            ]}
            className="h-10 w-36"
          />
        </Toolbar>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['all', 'published', 'pending', 'hidden'] as const).map((value) => (
            <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
              {value === 'all' ? 'الكل' : value === 'published' ? 'منشورة' : value === 'pending' ? 'معلّقة' : 'مخفية'}
            </Chip>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4">
          <DataTable<Review>
            rows={list}
            emptyText="لا توجد مراجعات مطابقة."
            columns={[
              {
                key: 'product',
                header: 'المنتج',
                render: (review) => (
                  <div className="flex items-center gap-2">
                    {getProduct(review.productId)?.images[0] && (
                      <img src={getProduct(review.productId)?.images[0]} alt="" className="size-9 rounded-lg object-cover" />
                    )}
                    <p className="line-clamp-2 max-w-40 text-[12px] font-semibold text-gray-700">
                      {getProduct(review.productId)?.name ?? 'منتج محذوف'}
                    </p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'العميل',
                render: (review) => (
                  <div>
                    <p className="font-semibold text-gray-800">{review.userName}</p>
                    <p className="text-[11px] text-gray-400">{formatDateTime(review.createdAt)}</p>
                  </div>
                ),
              },
              { key: 'rating', header: 'التقييم', render: (review) => <Rating value={review.rating} size={13} /> },
              {
                key: 'body',
                header: 'المراجعة',
                render: (review) => (
                  <div className="max-w-72">
                    {review.title && <p className="text-[12px] font-bold text-gray-800">{review.title}</p>}
                    <p className="line-clamp-2 text-[12px] text-gray-600">{review.body}</p>
                    {review.reply && (
                      <p className="mt-1 rounded-lg bg-brand-soft px-2 py-1 text-[11px] text-gray-600">
                        ردّ المتجر: {review.reply}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'الحالة',
                render: (review) =>
                  review.status === 'published' ? (
                    <Badge tone="success">منشورة</Badge>
                  ) : review.status === 'pending' ? (
                    <Badge tone="warning">معلّقة</Badge>
                  ) : (
                    <Badge tone="gray">مخفية</Badge>
                  ),
              },
              {
                key: 'actions',
                header: 'الإجراءات',
                render: (review) => (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<MessageSquareReply className="size-3.5" />}
                      onClick={() => {
                        setReplyFor(review)
                        setReplyText(review.reply ?? '')
                      }}
                    >
                      رد
                    </Button>
                    {review.status === 'hidden' ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-success"
                        icon={<Eye className="size-3.5" />}
                        onClick={() => setStatusFor(review, 'published')}
                      >
                        نشر
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={<EyeOff className="size-3.5" />}
                        onClick={() => setStatusFor(review, 'hidden')}
                      >
                        إخفاء
                      </Button>
                    )}
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-danger"
                      icon={<Trash2 className="size-3.5" />}
                      onClick={() => setPendingDelete(review)}
                    >
                      حذف
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(replyFor)}
        onClose={() => setReplyFor(null)}
        title="الرد على المراجعة"
        size="md"
        footer={
          <div className="flex gap-2">
            <Button
              fullWidth
              onClick={() => {
                if (!replyFor) return
                if (replyText.trim().length < 2) {
                  showToast('يرجى كتابة نص الرد.', { type: 'error' })
                  return
                }
                reviews.update(replyFor.id, { reply: replyText.trim(), status: 'published' })
                pushNotification({
                  type: 'info',
                  title: 'ردّ المتجر على مراجعتك',
                  body: replyText.trim(),
                  target: `/product/${replyFor.productId}/reviews`,
                })
                recomputeRating(replyFor.productId)
                setReplyFor(null)
                showToast('تم إرسال الرد.', { type: 'success' })
              }}
            >
              إرسال الرد
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setReplyFor(null)}>
              إلغاء
            </Button>
          </div>
        }
      >
        {replyFor && (
          <div className="space-y-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-bold text-gray-800">{replyFor.userName}</span>
                <Rating value={replyFor.rating} size={12} />
              </div>
              <p className="mt-1 text-[12px] leading-6 text-gray-600">{replyFor.body}</p>
            </div>
            <Textarea
              label="نص الرد"
              rows={3}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="شكرًا لتقييمك، يسعدنا خدمتك دائمًا..."
            />
            <Select
              label="عرض القوالب السريعة"
              value=""
              placeholder="اختر قالبًا"
              onChange={(event) => setReplyText(event.target.value)}
              options={[
                { value: 'شكرًا لك على تقييمك! يسعدنا أن المنتج نال إعجابك.', label: 'شكر وتقدير' },
                { value: 'نعتذر عن التجربة، تواصل معنا وسنعالج الأمر فورًا.', label: 'اعتذار' },
                { value: 'تم إرسال الملاحظة لفريق التطوير، شكرًا لك.', label: 'ملاحظة للفريق' },
              ]}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف المراجعة"
        message="سيتم حذف المراجعة نهائيًا وإعادة حساب تقييم المنتج."
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          const productId = pendingDelete.productId
          reviews.remove(pendingDelete.id)
          recomputeRating(productId)
          setPendingDelete(null)
          showToast('تم حذف المراجعة.', { type: 'success' })
        }}
      />
    </AdminPage>
  )
}

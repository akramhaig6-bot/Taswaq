import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { RatingDistribution, ReviewItem } from '@/components/customer/Reviews'
import { Button } from '@/components/ui/Button'
import { EmptyState, Tabs } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'

type RatingTab = 'all' | '5' | '4' | '3' | '2' | '1'

export default function AllReviews() {
  const { id = '' } = useParams()
  const { getProduct, reviews } = useAppData()
  const product = getProduct(id)

  const [tab, setTab] = useState<RatingTab>('all')
  const [visible, setVisible] = useState(10)

  const all = useMemo(
    () =>
      reviews.items
        .filter((review) => review.productId === id && review.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews.items, id],
  )

  const filtered = tab === 'all' ? all : all.filter((review) => Math.round(review.rating) === Number(tab))
  const shown = filtered.slice(0, visible)

  return (
    <Screen header={<PageHeader title={`جميع المراجعات (${all.length})`} subtitle={product?.name} backTo={`/product/${id}`} />}>
      <div className="space-y-3 p-4">
        <RatingDistribution reviews={all} />

        <Tabs
          value={tab}
          onChange={(value) => {
            setTab(value)
            setVisible(10)
          }}
          items={[
            { value: 'all', label: 'الكل', count: all.length },
            { value: '5', label: '5 نجوم', count: all.filter((review) => Math.round(review.rating) === 5).length },
            { value: '4', label: '4 نجوم', count: all.filter((review) => Math.round(review.rating) === 4).length },
            { value: '3', label: '3 نجوم', count: all.filter((review) => Math.round(review.rating) === 3).length },
            { value: '2', label: '2 نجوم', count: all.filter((review) => Math.round(review.rating) === 2).length },
            { value: '1', label: '1 نجمة', count: all.filter((review) => Math.round(review.rating) === 1).length },
          ]}
        />

        <div className="rounded-2xl border border-gray-100 bg-white p-3.5">
          {shown.length === 0 ? (
            <EmptyState title="لا توجد مراجعات بهذا التقييم." />
          ) : (
            shown.map((review) => <ReviewItem key={review.id} review={review} />)
          )}
        </div>

        {visible < filtered.length && (
          <Button variant="outline" fullWidth onClick={() => setVisible((value) => value + 10)}>
            عرض المزيد
          </Button>
        )}
        {filtered.length > 0 && visible >= filtered.length && (
          <p className="text-center text-[12px] text-gray-400">لا توجد مراجعات أخرى</p>
        )}
      </div>
    </Screen>
  )
}

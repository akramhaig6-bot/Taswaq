import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Package } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { ORDER_STATUS_TABS } from '@/lib/orders'
import { Screen } from '@/components/layout/Screen'
import { TopBar } from '@/components/layout/TopBar'
import { OrderCard } from '@/components/customer/OrderCard'
import { Button } from '@/components/ui/Button'
import { EmptyState, RowSkeleton, Tabs } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LanguageContext'

export default function Orders() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { orders } = useAppData()
  const { user } = useAuth()
  const [tab, setTab] = useState<'all' | OrderStatus>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const myOrders = useMemo(
    () =>
      orders.items
        .filter((order) => (user ? order.customerId === user.id : true))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders.items, user],
  )

  const filtered = tab === 'all' ? myOrders : myOrders.filter((order) => order.status === tab)

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: myOrders.length }
    ORDER_STATUS_TABS.forEach((item) => {
      if (item.value !== 'all') map[item.value] = myOrders.filter((order) => order.status === item.value).length
    })
    return map
  }, [myOrders])

  return (
    <Screen header={<TopBar showSearch={false} />}>
      <div className="p-4">
        <h1 className="mb-3 text-[17px] font-extrabold text-gray-900">طلباتي</h1>

        <Tabs
          variant="underline"
          value={tab}
          onChange={setTab}
          items={ORDER_STATUS_TABS.map((item) => ({
            value: item.value,
            label: item.value === 'all' ? t('order.all', 'الكل') : item.label,
            count: counts[item.value],
          }))}
        />

        <div className="mt-3 space-y-3">
          {loading ? (
            <RowSkeleton count={3} />
          ) : myOrders.length === 0 ? (
            <EmptyState
              icon={<Package className="size-9" />}
              title={t('empty.orders.title', 'لا توجد طلبات بعد.')}
              body={t('empty.orders.body', 'ابدأ التسوق واستمتع بتجربة شراء رائعة.')}
              action={<Button onClick={() => navigate('/')}>{t('empty.orders.cta', 'تصفح المنتجات')}</Button>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-7" />}
              title={`لا توجد طلبات ${ORDER_STATUS_TABS.find((item) => item.value === tab)?.label ?? ''}.`}
            />
          ) : (
            filtered.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </Screen>
  )
}

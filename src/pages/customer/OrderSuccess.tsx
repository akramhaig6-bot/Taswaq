import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Copy, Package } from 'lucide-react'
import { formatDate, formatPrice, copyToClipboard } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'
import { useToast } from '@/store/ToastContext'

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${1.8 + Math.random() * 1.2}s`,
        color: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'][index % 5],
        dx: `${(Math.random() - 0.5) * 120}px`,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={
            {
              left: piece.left,
              background: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
              '--dx': piece.dx,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default function OrderSuccess() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const { orders, settings } = useAppData()
  const { showToast } = useToast()

  const order = orders.items.find((item) => item.id === id)

  /* زر الرجوع في المتصفح يعود للشاشة الرئيسية بدلًا من شاشة الدفع */
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const onPop = () => navigate('/', { replace: true })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [navigate])

  if (!order) {
    return (
      <Screen header={<PageHeader title="تأكيد الطلب" backTo="/" />}>
        <EmptyState icon={<Package className="size-9" />} title="لم يتم العثور على الطلب" />
      </Screen>
    )
  }

  return (
    <Screen header={<PageHeader title="تأكيد الطلب" onBack={() => navigate('/', { replace: true })} />}>
      <div className="relative px-4 pb-8 pt-6">
        <Confetti />

        <div className="relative flex flex-col items-center gap-3 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-success text-white shadow-lg animate-pop">
            <Check className="size-10" strokeWidth={3} />
          </span>
          <h1 className="text-[19px] font-extrabold text-gray-900">
            {t('order.success.title', 'تم استلام طلبك بنجاح!')}
          </h1>
          <p className="max-w-xs text-[13px] leading-6 text-gray-500">
            {t('order.success.body', 'شكرًا لتسوقك معنا. سنعمل على تجهيز طلبك في أقرب وقت.')}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-gray-50 p-3.5">
          <div>
            <p className="text-[11.5px] text-gray-500">رقم الطلب</p>
            <p className="text-[15px] font-extrabold text-gray-900">#{order.number}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Copy className="size-3.5" />}
            onClick={async () => {
              const ok = await copyToClipboard(order.number)
              showToast(ok ? 'تم نسخ رقم الطلب.' : 'تعذّر النسخ.', { type: ok ? 'success' : 'error' })
            }}
          >
            نسخ
          </Button>
        </div>

        <dl className="mt-3 space-y-2 rounded-2xl border border-gray-100 p-3.5 text-[12.5px]">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">المبلغ الإجمالي</dt>
            <dd className="font-extrabold text-gray-900">{formatPrice(order.total, settings.currency)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">طريقة الدفع</dt>
            <dd className="font-semibold text-gray-800">{order.paymentMethodName}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-gray-500">عنوان التوصيل</dt>
            <dd className="truncate text-end font-semibold text-gray-800">
              {order.address.city}، {order.address.district}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">التوصيل المتوقع</dt>
            <dd className="font-semibold text-gray-800">{formatDate(order.expectedDelivery)}</dd>
          </div>
        </dl>

        <div className="mt-5 space-y-2">
          <Button fullWidth size="lg" onClick={() => navigate(`/orders/${order.id}`)}>
            تتبع الطلب
          </Button>
          <Button fullWidth size="lg" variant="outline" onClick={() => navigate('/', { replace: true })}>
            متابعة التسوق
          </Button>
        </div>
      </div>
    </Screen>
  )
}

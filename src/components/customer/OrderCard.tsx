import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import type { Order, Product } from '@/types'
import { formatDate, formatNumber, formatPrice } from '@/lib/utils'
import { Button, StatusBadge } from '@/components/ui'
import { useAppData } from '@/store/AppDataContext'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'

export function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate()
  const { settings, products } = useAppData()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const reorder = () => {
    let added = 0
    let missing = 0
    order.items.forEach((item) => {
      const product: Product | undefined = products.items.find((p) => p.id === item.productId)
      if (product && product.status === 'published' && (product.stock > 0 || !product.trackStock)) {
        addToCart(product, item.quantity, {})
        added += item.quantity
      } else {
        missing += 1
      }
    })
    if (added) {
      showToast(
        missing
          ? `تمت إضافة ${formatNumber(added)} منتجات. ${missing} منتجات غير متوفرة.`
          : `تمت إضافة ${formatNumber(added)} منتجات إلى السلة.`,
        { type: missing ? 'warning' : 'success', action: { label: 'عرض السلة', onClick: () => navigate('/cart') } },
      )
      navigate('/cart')
    } else {
      showToast('المنتجات غير متوفرة حاليًا.', { type: 'error' })
    }
  }

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-3.5 transition-colors hover:border-gray-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13.5px] font-extrabold text-gray-900">#{order.number}</p>
          <p className="mt-0.5 text-[11.5px] text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center">
          {order.items.slice(0, 3).map((item, index) => (
            <img
              key={item.id}
              src={item.image}
              alt={item.name}
              className="size-11 rounded-xl border-2 border-white object-cover shadow-xs"
              style={{ marginInlineStart: index === 0 ? 0 : -14 }}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] text-gray-600">{order.items.length} منتجات</p>
          <p className="text-[13.5px] font-extrabold text-gray-900">{formatPrice(order.total, settings.currency)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/orders/${order.id}`)
          }}
          className="text-[12.5px] font-bold text-brand hover:underline"
        >
          عرض التفاصيل
        </button>
        {(order.status === 'delivered' || order.status === 'cancelled') && (
          <Button
            size="sm"
            variant="outline"
            icon={<RotateCcw className="size-3.5" />}
            onClick={(event) => {
              event.stopPropagation()
              reorder()
            }}
          >
            إعادة الطلب
          </Button>
        )}
      </div>
    </div>
  )
}

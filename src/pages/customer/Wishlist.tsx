import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { ProductCard } from '@/components/customer/product'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'
import { useToast } from '@/store/ToastContext'
import { useWishlist } from '@/store/WishlistContext'

export default function Wishlist() {
  const navigate = useNavigate()
  const { t } = useLang()
  const { products } = useAppData()
  const wishlist = useWishlist()
  const { showToast } = useToast()

  const items = useMemo(
    () =>
      wishlist.ids
        .map((id) => products.items.find((product) => product.id === id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product) && product!.status === 'published'),
    [wishlist.ids, products.items],
  )

  return (
    <Screen header={<PageHeader title={`${t('nav.wishlist', 'المفضلة')} (${items.length})`} backTo={-1} />}>
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-9" />}
          title={t('empty.wishlist.title', 'قائمة المفضلة فارغة.')}
          body={t('empty.wishlist.body', 'أضف منتجاتك المفضلة لتجدها هنا بسهولة.')}
          action={<Button onClick={() => navigate('/')}>{t('empty.cart.cta', 'تصفح المنتجات')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {items.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => {
                  wishlist.remove(product.id)
                  showToast('تمت الإزالة من المفضلة', {
                    type: 'info',
                    action: {
                      label: 'تراجع',
                      onClick: () => {
                        wishlist.toggle(product.id)
                      },
                    },
                  })
                }}
                className="absolute -top-1.5 -start-1.5 z-10 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10.5px] font-bold text-danger shadow-sm"
              >
                <Heart className="size-3 fill-danger" /> إزالة
              </button>
            </div>
          ))}
        </div>
      )}
    </Screen>
  )
}

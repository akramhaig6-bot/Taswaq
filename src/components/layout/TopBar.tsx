import type { ReactNode } from 'react'
import { ArrowRight, Heart, Search, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/Button'
import { useAppData } from '@/store/AppDataContext'
import { useCart } from '@/store/CartContext'
import { useLang } from '@/store/LanguageContext'

/** الشريط العلوي العام: الشعار + البحث + المفضلة + السلة */
export function TopBar({ showSearch = true }: { showSearch?: boolean }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const { count } = useCart()
  const { settings } = useAppData()

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="shrink-0 text-[19px] font-extrabold leading-none text-brand"
          aria-label={settings.storeName}
        >
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-7 w-auto object-contain" />
          ) : (
            settings.storeName
          )}
        </button>

        {showSearch && (
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="mx-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-gray-100 px-3 text-start text-[13px] text-gray-500"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">{t('topbar.searchPlaceholder', 'ابحث عن منتجات...')}</span>
          </button>
        )}
        {!showSearch && <span className="flex-1" />}

        <IconButton onClick={() => navigate('/wishlist')} aria-label="المفضلة">
          <Heart className="size-5" />
        </IconButton>
        <IconButton onClick={() => navigate('/cart')} badge={count} aria-label="السلة">
          <ShoppingCart className="size-5" />
        </IconButton>
      </div>
    </header>
  )
}

/** رأس شاشة داخلي: زر رجوع + عنوان + إجراءات */
export function PageHeader({
  title,
  subtitle,
  onBack,
  backTo,
  actions,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  onBack?: () => void
  backTo?: string | number
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const navigate = useNavigate()

  const goBack = () => {
    if (onBack) return onBack()
    if (backTo === undefined) return navigate(-1)
    if (typeof backTo === 'number') return navigate(backTo)
    return navigate(backTo)
  }

  return (
    <header className={cn('sticky top-0 z-30 shrink-0 border-b border-gray-100 bg-white', className)}>
      <div className="flex items-center gap-2 px-2 py-2">
        <IconButton onClick={goBack} aria-label="رجوع">
          <ArrowRight className="size-5" />
        </IconButton>
        <div className="min-w-0 flex-1">
          {title && <h1 className="truncate text-[15px] font-extrabold text-gray-900">{title}</h1>}
          {subtitle && <p className="truncate text-[11.5px] text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {children}
    </header>
  )
}

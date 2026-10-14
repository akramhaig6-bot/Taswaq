import { Home, LayoutGrid, Package, Percent, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LanguageContext'

const ITEMS = [
  { to: '/', label: 'الرئيسية', key: 'nav.home', icon: Home, end: true },
  { to: '/categories', label: 'الأقسام', key: 'nav.categories', icon: LayoutGrid },
  { to: '/offers', label: 'العروض', key: 'nav.offers', icon: Percent },
  { to: '/orders', label: 'طلباتي', key: 'nav.orders', icon: Package, auth: true },
  { to: '/account', label: 'حسابي', key: 'nav.account', icon: User, auth: true },
]

export function BottomNav() {
  const { t } = useLang()
  const { isAuthenticated } = useAuth()

  return (
    <nav
      className="relative z-30 shrink-0 border-t border-gray-100 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch">
        {ITEMS.map((item) => {
          const needsAuth = Boolean(item.auth) && !isAuthenticated
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={needsAuth ? '/login' : item.to}
                end={item.end}
                state={needsAuth ? { from: item.to } : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors active:scale-95',
                    isActive ? 'text-brand' : 'text-gray-500',
                  )
                }
              >
                <item.icon className="size-5" />
                <span>{t(item.key, item.label)}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

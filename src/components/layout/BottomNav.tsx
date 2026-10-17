import { Circle, Home, LayoutGrid, Package, Percent, User, Search } from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import type { StoreNavIcon } from '@/types'
import { cn } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'

const ICONS: Record<StoreNavIcon, ComponentType<{ className?: string }>> = {
  home: Home,
  categories: LayoutGrid,
  offers: Percent,
  orders: Package,
  account: User,
  search: Search,
  custom: Circle,
}

export function BottomNav() {
  const { settings } = useAppData()
  const { isAuthenticated } = useAuth()
  const items = (settings.navigationItems ?? []).filter((item) => item.enabled)
  if (items.length === 0) return null

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="relative z-30 shrink-0 border-t border-gray-100 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const needsAuth = Boolean(item.requiresAuth) && !isAuthenticated
          const Icon = ICONS[item.icon] ?? Circle
          return (
            <li key={item.id} className="min-w-[66px] flex-1">
              <NavLink
                to={needsAuth ? '/login' : item.path}
                end={item.path === '/'}
                state={needsAuth ? { from: item.path } : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex h-full min-h-[58px] flex-col items-center justify-center gap-1 px-2 py-2.5 text-[11px] font-bold transition-colors active:scale-95',
                    isActive ? 'text-brand' : 'text-gray-500',
                  )
                }
              >
                <Icon className="size-5 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

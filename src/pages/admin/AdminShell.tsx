import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  ExternalLink,
  FileText,
  Grid2x2,
  Image as ImageIcon,
  Landmark,
  LayoutGrid,
  LogOut,
  MapPinned,
  Menu,
  Package,
  Palette,
  Percent,
  Search,
  Settings as SettingsIcon,
  Sliders,
  Star,
  Store,
  Tags,
  Ticket,
  Truck,
  Trees,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { cn, truncate } from '@/lib/utils'
import { Avatar, Badge } from '@/components/ui/display'
import { Dropdown, MenuItem } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: typeof Package
  badge?: number
}

const SETTINGS_LINKS = [
  { to: '/admin/settings/general', label: 'الإعدادات العامة', icon: Sliders },
  { to: '/admin/settings/payments', label: 'طرق الدفع', icon: Wallet },
  { to: '/admin/settings/shipping', label: 'طرق الشحن', icon: Truck },
  { to: '/admin/settings/cities', label: 'المدن المدعومة', icon: MapPinned },
  { to: '/admin/settings/tax', label: 'الضرائب والرسوم', icon: Percent },
  { to: '/admin/settings/pages', label: 'الصفحات', icon: FileText },
  { to: '/admin/settings/languages', label: 'اللغات', icon: Landmark },
  { to: '/admin/settings/appearance', label: 'تخصيص واجهة التطبيق', icon: Palette },
  { to: '/admin/settings/technical', label: 'الإعدادات التقنية', icon: SettingsIcon },
]

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: 'لوحة الإدارة',
  dashboard: 'الرئيسية',
  orders: 'الطلبات',
  products: 'المنتجات',
  new: 'إضافة منتج',
  edit: 'تعديل',
  categories: 'الأقسام',
  brands: 'العلامات التجارية',
  customers: 'العملاء',
  reviews: 'التقييمات',
  coupons: 'كوبونات الخصم',
  banners: 'البانرات والعروض',
  reports: 'التقارير والإحصائيات',
  notifications: 'الإشعارات',
  settings: 'الإعدادات',
  general: 'الإعدادات العامة',
  payments: 'طرق الدفع',
  shipping: 'طرق الشحن',
  cities: 'المدن المدعومة',
  tax: 'الضرائب والرسوم',
  pages: 'الصفحات',
  languages: 'اللغات',
  appearance: 'تخصيص الواجهة',
  technical: 'الإعدادات التقنية',
  profile: 'الملف الشخصي',
}

export function AdminShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, orders, notifications, products, customers, adminUser, pushNotification: _pushNotification } = useAppData()
  const { adminLogout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/admin/settings'))
  const [quickSearch, setQuickSearch] = useState('')

  const newOrders = orders.items.filter((order) => order.status === 'processing').length
  const adminNotifications = notifications.items
    .filter((item) => item.forAdmin)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const navItems: NavItem[] = [
    { to: '/admin/dashboard', label: 'الرئيسية', icon: LayoutGrid },
    { to: '/admin/orders', label: 'الطلبات', icon: Package, badge: newOrders },
    { to: '/admin/products', label: 'المنتجات', icon: Store },
    { to: '/admin/categories', label: 'الأقسام', icon: Trees },
    { to: '/admin/brands', label: 'العلامات التجارية', icon: Tags },
    { to: '/admin/customers', label: 'العملاء', icon: Users },
    { to: '/admin/reviews', label: 'التقييمات', icon: Star },
    { to: '/admin/coupons', label: 'كوبونات الخصم', icon: Ticket },
    { to: '/admin/banners', label: 'البانرات والعروض', icon: ImageIcon },
    { to: '/admin/reports', label: 'التقارير والإحصائيات', icon: Grid2x2 },
    { to: '/admin/notifications', label: 'الإشعارات', icon: Bell, badge: adminNotifications.filter((item) => !item.read).length },
  ]

  const breadcrumbs = useMemo(
    () =>
      location.pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => BREADCRUMB_LABELS[segment] ?? segment),
    [location.pathname],
  )

  const searchResults = useMemo(() => {
    const query = quickSearch.trim().toLowerCase()
    if (query.length < 2) return null
    return {
      products: products.items.filter((product) => product.name.toLowerCase().includes(query)).slice(0, 4),
      orders: orders.items.filter((order) => order.number.includes(query) || order.customerName.toLowerCase().includes(query)).slice(0, 4),
      customers: customers.items.filter((customer) => customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query)).slice(0, 4),
    }
  }, [quickSearch, products.items, orders.items, customers.items])

  return (
    <div className="min-h-dvh bg-page">
      {/* الشريط الجانبي */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-ink text-white transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-[100%]',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-lg font-extrabold">{settings.storeName}</p>
            <p className="text-[11px] text-white/60">لوحة الإدارة</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="thin-scroll flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
                      isActive ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-danger px-1.5 text-[10px] font-bold">{item.badge}</span>
                  ) : null}
                </NavLink>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={() => setSettingsOpen((value) => !value)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white',
                  settingsOpen && 'text-white',
                )}
              >
                <SettingsIcon className="size-4 shrink-0" />
                <span className="flex-1 text-start">الإعدادات</span>
                <ChevronDown className={cn('size-3.5 transition-transform', settingsOpen && 'rotate-180')} />
              </button>
              {settingsOpen && (
                <ul className="mt-0.5 space-y-0.5 ps-3">
                  {SETTINGS_LINKS.map((link) => (
                    <li key={link.to}>
                      <NavLink
                        to={link.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors',
                            isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white',
                          )
                        }
                      >
                        <link.icon className="size-3.5" />
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
            <Avatar name={adminUser.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold">{adminUser.name}</p>
              <p className="truncate text-[10.5px] text-white/60">{adminUser.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              adminLogout()
              navigate('/admin', { replace: true })
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-danger hover:bg-danger/15"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى */}
      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2 px-3 py-2.5 lg:px-5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <nav className="hidden min-w-0 flex-1 items-center gap-1.5 text-[12px] text-gray-400 md:flex">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronDown className="size-3 -rotate-90" />}
                  <span className={index === breadcrumbs.length - 1 ? 'font-bold text-gray-700' : ''}>{crumb}</span>
                </span>
              ))}
            </nav>

            <div className="relative min-w-0 flex-1 md:max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
                placeholder="ابحث عن منتج، طلب، عميل..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 ps-9 pe-3 text-[12.5px] outline-none focus:border-brand focus:bg-white"
              />
              {searchResults && (
                <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  {searchResults.products.length === 0 &&
                    searchResults.orders.length === 0 &&
                    searchResults.customers.length === 0 && (
                      <p className="p-3 text-center text-[12px] text-gray-400">لا توجد نتائج</p>
                    )}
                  {searchResults.products.length > 0 && (
                    <>
                      <p className="px-2 py-1 text-[11px] font-bold text-gray-400">منتجات</p>
                      {searchResults.products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setQuickSearch('')
                            navigate(`/admin/products/${product.id}/edit`)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-gray-100"
                        >
                          <img src={product.images[0]} alt="" className="size-8 rounded-md object-cover" />
                          <span className="truncate text-[12.5px] text-gray-700">{truncate(product.name, 40)}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.orders.length > 0 && (
                    <>
                      <p className="px-2 py-1 text-[11px] font-bold text-gray-400">طلبات</p>
                      {searchResults.orders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => {
                            setQuickSearch('')
                            navigate(`/admin/orders/${order.id}`)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-gray-100"
                        >
                          <Package className="size-4 text-gray-400" />
                          <span className="text-[12.5px] text-gray-700">#{order.number}</span>
                          <span className="truncate text-[11.5px] text-gray-400">{order.customerName}</span>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults.customers.length > 0 && (
                    <>
                      <p className="px-2 py-1 text-[11px] font-bold text-gray-400">عملاء</p>
                      {searchResults.customers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            setQuickSearch('')
                            navigate(`/admin/customers?focus=${customer.id}`)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-gray-100"
                        >
                          <Users className="size-4 text-gray-400" />
                          <span className="text-[12.5px] text-gray-700">{customer.name}</span>
                          <span className="truncate text-[11.5px] text-gray-400">{customer.email}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.open('/', '_blank', 'noopener')}
              className="hidden size-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 sm:flex"
              title="عرض التطبيق"
            >
              <ExternalLink className="size-5" />
            </button>

            <Dropdown
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  className="relative flex size-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  <Bell className="size-5" />
                  {adminNotifications.some((item) => !item.read) && (
                    <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-danger" />
                  )}
                </button>
              )}
            >
              <div className="max-h-80 w-72 overflow-y-auto">
                <p className="px-2.5 py-1.5 text-[12px] font-bold text-gray-700">الإشعارات</p>
                {adminNotifications.length === 0 && (
                  <p className="px-2.5 py-3 text-center text-[12px] text-gray-400">لا توجد إشعارات</p>
                )}
                {adminNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.target ?? '/admin/dashboard')}
                    className="block w-full rounded-lg px-2.5 py-2 text-start hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[12.5px] font-semibold text-gray-800">{item.title}</span>
                      {!item.read && <span className="size-1.5 rounded-full bg-brand" />}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[11.5px] text-gray-500">{item.body}</span>
                  </button>
                ))}
                <MenuItem onClick={() => navigate('/admin/notifications')} icon={<Bell className="size-4" />}>
                  عرض كل الإشعارات
                </MenuItem>
              </div>
            </Dropdown>

            <Dropdown
              trigger={({ toggle }) => (
                <button type="button" onClick={toggle} className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100">
                  <Avatar name={adminUser.name} size={32} />
                  <ChevronDown className="hidden size-3.5 text-gray-400 sm:block" />
                </button>
              )}
            >
              <div className="px-2.5 py-1.5">
                <p className="text-[12.5px] font-bold text-gray-800">{adminUser.name}</p>
                <p className="text-[11px] text-gray-500">{adminUser.email}</p>
                <Badge tone="brand" className="mt-1">مسؤول</Badge>
              </div>
              <MenuItem icon={<Users className="size-4" />} onClick={() => navigate('/admin/profile')}>
                الملف الشخصي
              </MenuItem>
              <MenuItem icon={<SettingsIcon className="size-4" />} onClick={() => navigate('/admin/settings/general')}>
                الإعدادات
              </MenuItem>
              <MenuItem
                icon={<LogOut className="size-4" />}
                danger
                onClick={() => {
                  adminLogout()
                  navigate('/admin', { replace: true })
                }}
              >
                تسجيل الخروج
              </MenuItem>
            </Dropdown>
          </div>
        </header>

        <main className="thin-scroll p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProviders, useAppData, useAuth } from '@/store'
import { BootScreen } from '@/components/layout/BootScreen'
import { AppShell } from '@/components/layout/AppShell'
import { ToastViewport } from '@/components/ui/Toast'
import { PageLoader } from '@/components/ui/display'

/* ---------------------------- شاشات العميل ---------------------------- */
import Home from '@/pages/customer/Home'
import Search from '@/pages/customer/Search'
import Categories, { CategoryProducts, CategoryView } from '@/pages/customer/Categories'
import BrandProducts from '@/pages/customer/BrandProducts'
import ProductDetail from '@/pages/customer/ProductDetail'  // مسار حرج — يُحمّل فورًا
import Cart from '@/pages/customer/Cart'
import Auth from '@/pages/customer/Auth'

const AllReviews = lazy(() => import('@/pages/customer/AllReviews'))
const Checkout = lazy(() => import('@/pages/customer/Checkout'))
const OrderSuccess = lazy(() => import('@/pages/customer/OrderSuccess'))
const Orders = lazy(() => import('@/pages/customer/Orders'))
const OrderDetail = lazy(() => import('@/pages/customer/OrderDetail'))
const Wishlist = lazy(() => import('@/pages/customer/Wishlist'))
const Account = lazy(() => import('@/pages/customer/Account'))
const EditProfile = lazy(() => import('@/pages/customer/EditProfile'))
const Addresses = lazy(() => import('@/pages/customer/Addresses'))
const PaymentMethods = lazy(() => import('@/pages/customer/PaymentMethods'))
const Notifications = lazy(() => import('@/pages/customer/Notifications'))
const Offers = lazy(() => import('@/pages/customer/Offers'))
const ForgotPassword = lazy(() => import('@/pages/customer/ForgotPassword'))
const StaticPageView = lazy(() => import('@/pages/customer/StaticPageView'))
const NotFound = lazy(() => import('@/pages/customer/NotFound'))

/* ---------------------------- لوحة الإدارة ---------------------------- */
/* كل شاشات لوحة الإدارة تُحمّل عند الطلب (Code Splitting) — لا تؤثر على سرعة المتجر */
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminShell = lazy(() => import('@/pages/admin/AdminShell').then((module) => ({ default: module.AdminShell })))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'))
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'))
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons'))
const AdminBanners = lazy(() => import('@/pages/admin/AdminBanners'))
const AdminCMS = lazy(() => import('@/pages/admin/AdminCMS'))
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'))
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'))

/** يطبّق ألوان المتجر القادمة من إعدادات لوحة الإدارة */
/** يغمّق لونًا سداسيًا بنسبة معيّنة (لحالة التحويم Hover) */
function darken(hex: string, amount = 0.14): string {
  const value = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return hex
  const number = Number.parseInt(value, 16)
  const mix = (channel: number) => Math.max(0, Math.round(channel * (1 - amount)))
  const r = mix((number >> 16) & 255)
  const g = mix((number >> 8) & 255)
  const b = mix(number & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function ThemeVars({ splashActive }: { splashActive: boolean }) {
  const { settings } = useAppData()
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--c-brand', settings.colors.primary)
    root.style.setProperty('--c-brand-dark', darken(settings.colors.primary))
    root.style.setProperty('--c-secondary', settings.colors.secondary)
    root.style.setProperty('--c-success', settings.colors.success)
    root.style.setProperty('--c-danger', settings.colors.danger)
    root.style.setProperty('--c-brand-soft', `${settings.colors.primary}1a`)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', splashActive ? '#0A1628' : settings.colors.primary)
    /* أيقونة التطبيق المرفوعة من الإعدادات العامة */
    if (settings.favicon) {
      document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((node) => {
        node.setAttribute('href', settings.favicon as string)
      })
    }
    document.title = `${settings.storeName} — ${settings.storeName === 'سوقلي' ? 'Sawqli' : 'Store'}`
  }, [settings.colors, settings.storeName, settings.favicon, splashActive])
  return null
}

/** التمرير للأعلى عند تغيير المسار */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Protected({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

function ProtectedAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/admin" replace />
  return <>{children}</>
}

/** شاشة تحميل مؤقتة أثناء تحميل حزمة الشاشة (Code Splitting) */
function RouteFallback() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <PageLoader label="جارٍ تحميل لوحة الإدارة..." />
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh justify-center bg-page">
      <div className="app-frame flex h-dvh flex-col overflow-hidden">
        <PageLoader />
      </div>
    </div>
  )
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const finishBoot = useCallback(() => setBooting(false), [])

  return (
    <AppProviders>
      <ThemeVars splashActive={booting} />
      {booting && <BootScreen onReady={finishBoot} />}
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ------------------------- واجهة التطبيق ------------------------- */}
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="categories" element={<Categories />} />
            <Route path="category/:id" element={<CategoryView />} />
            <Route path="category/:id/products" element={<CategoryProducts />} />
            <Route path="brand/:id" element={<BrandProducts />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="product/:id/reviews" element={<AllReviews />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />
            <Route
              path="orders"
              element={
                <Protected>
                  <Orders />
                </Protected>
              }
            />
            <Route
              path="orders/:id"
              element={
                <Protected>
                  <OrderDetail />
                </Protected>
              }
            />
            <Route
              path="wishlist"
              element={
                <Protected>
                  <Wishlist />
                </Protected>
              }
            />
            <Route path="account" element={<Account />} />
            <Route
              path="account/edit"
              element={
                <Protected>
                  <EditProfile />
                </Protected>
              }
            />
            <Route
              path="account/addresses"
              element={
                <Protected>
                  <Addresses />
                </Protected>
              }
            />
            <Route
              path="account/payment-methods"
              element={
                <Protected>
                  <PaymentMethods />
                </Protected>
              }
            />
            <Route path="account/notifications" element={<Notifications />} />
            <Route path="offers" element={<Offers />} />
            <Route path="login" element={<Auth />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="pages/:slug" element={<StaticPageView />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ------------------------- لوحة الإدارة ------------------------- */}
          {/*
            نُبقي تسجيل دخول الإدارة كـ index route تحت /admin
            لتجنّب أي التباس مع مسارات /admin/* المحمية.
          */}
          <Route path="/admin">
            <Route index element={<AdminLogin />} />
            <Route
              element={
                <ProtectedAdmin>
                  <AdminShell />
                </ProtectedAdmin>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings/:section" element={<AdminSettings />} />
              <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
        </Suspense>
        <ToastViewport />
      </BrowserRouter>
    </AppProviders>
  )
}

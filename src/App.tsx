import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppProviders, useAppData, useAuth } from '@/store'
import { BootScreen } from '@/components/layout/BootScreen'
import { AppShell } from '@/components/layout/AppShell'
import { ToastViewport } from '@/components/ui/Toast'

/* ---------------------------- شاشات العميل ---------------------------- */
import Home from '@/pages/customer/Home'
import Search from '@/pages/customer/Search'
import Categories, { CategoryProducts, CategoryView } from '@/pages/customer/Categories'
import BrandProducts from '@/pages/customer/BrandProducts'
import ProductDetail from '@/pages/customer/ProductDetail'
import AllReviews from '@/pages/customer/AllReviews'
import Cart from '@/pages/customer/Cart'
import Checkout from '@/pages/customer/Checkout'
import OrderSuccess from '@/pages/customer/OrderSuccess'
import Orders from '@/pages/customer/Orders'
import OrderDetail from '@/pages/customer/OrderDetail'
import Wishlist from '@/pages/customer/Wishlist'
import Account from '@/pages/customer/Account'
import EditProfile from '@/pages/customer/EditProfile'
import Addresses from '@/pages/customer/Addresses'
import PaymentMethods from '@/pages/customer/PaymentMethods'
import Notifications from '@/pages/customer/Notifications'
import Offers from '@/pages/customer/Offers'
import Auth from '@/pages/customer/Auth'
import ForgotPassword from '@/pages/customer/ForgotPassword'
import StaticPageView from '@/pages/customer/StaticPageView'
import NotFound from '@/pages/customer/NotFound'

/* ---------------------------- لوحة الإدارة ---------------------------- */
import AdminLogin from '@/pages/admin/AdminLogin'
import { AdminShell } from '@/pages/admin/AdminShell'
import Dashboard from '@/pages/admin/Dashboard'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminProductForm from '@/pages/admin/AdminProductForm'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminBrands from '@/pages/admin/AdminBrands'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminReviews from '@/pages/admin/AdminReviews'
import AdminCoupons from '@/pages/admin/AdminCoupons'
import AdminBanners from '@/pages/admin/AdminBanners'
import AdminReports from '@/pages/admin/AdminReports'
import AdminNotifications from '@/pages/admin/AdminNotifications'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminProfile from '@/pages/admin/AdminProfile'

/** يطبّق ألوان المتجر القادمة من إعدادات لوحة الإدارة */
function ThemeVars() {
  const { settings } = useAppData()
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--c-brand', settings.colors.primary)
    root.style.setProperty('--c-brand-dark', settings.colors.primary)
    root.style.setProperty('--c-secondary', settings.colors.secondary)
    root.style.setProperty('--c-success', settings.colors.success)
    root.style.setProperty('--c-danger', settings.colors.danger)
    root.style.setProperty('--c-brand-soft', `${settings.colors.primary}1a`)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', settings.colors.primary)
    document.title = `${settings.storeName} — ${settings.storeName === 'سوقلي' ? 'Sawqli' : 'Store'}`
  }, [settings.colors, settings.storeName])
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

export default function App() {
  const [booting, setBooting] = useState(true)

  return (
    <AppProviders>
      <ThemeVars />
      {booting && <BootScreen onReady={() => setBooting(false)} />}
      <BrowserRouter>
        <ScrollToTop />
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
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdmin>
                <AdminShell />
              </ProtectedAdmin>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings/:section" element={<AdminSettings />} />
            <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
        <ToastViewport />
      </BrowserRouter>
    </AppProviders>
  )
}

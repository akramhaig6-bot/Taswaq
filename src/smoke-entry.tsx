/**
 * مدخل خاص باختبار الدخان (scripts/smoke.mjs) — يُصيّر مسارًا واحدًا عبر SSR.
 * لا يُستخدم في التطبيق الفعلي.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/store'
import Home from '@/pages/customer/Home'
import Search from '@/pages/customer/Search'
import Categories, { CategoryProducts } from '@/pages/customer/Categories'
import Offers from '@/pages/customer/Offers'
import BrandProducts from '@/pages/customer/BrandProducts'
import ProductDetail from '@/pages/customer/ProductDetail'
import AllReviews from '@/pages/customer/AllReviews'
import Cart from '@/pages/customer/Cart'
import Checkout from '@/pages/customer/Checkout'
import OrderSuccess from '@/pages/customer/OrderSuccess'
import Orders from '@/pages/customer/Orders'
import OrderDetail from '@/pages/customer/OrderDetail'
import Wishlist from '@/pages/customer/Wishlist'
import Auth from '@/pages/customer/Auth'
import ForgotPassword from '@/pages/customer/ForgotPassword'
import Account from '@/pages/customer/Account'
import EditProfile from '@/pages/customer/EditProfile'
import Addresses from '@/pages/customer/Addresses'
import PaymentMethods from '@/pages/customer/PaymentMethods'
import Notifications from '@/pages/customer/Notifications'
import StaticPageView from '@/pages/customer/StaticPageView'
import NotFound from '@/pages/customer/NotFound'
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

export function renderRoute(path: string): string {
  return renderToString(
    <StrictMode>
      <AppProviders>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:id" element={<Categories />} />
            <Route path="/category/:id/products" element={<CategoryProducts />} />
            <Route path="/brand/:id" element={<BrandProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/reviews" element={<AllReviews />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/edit" element={<EditProfile />} />
            <Route path="/account/addresses" element={<Addresses />} />
            <Route path="/account/payment-methods" element={<PaymentMethods />} />
            <Route path="/account/notifications" element={<Notifications />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/pages/:slug" element={<StaticPageView />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminShell />}>
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
              <Route path="settings" element={<AdminSettings />} />
              <Route path="settings/:section" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MemoryRouter>
      </AppProviders>
    </StrictMode>,
  )
}

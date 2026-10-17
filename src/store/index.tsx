import type { ReactNode } from 'react'
import { AppDataProvider } from '@/store/AppDataContext'
import { AuthProvider } from '@/store/AuthContext'
import { CartProvider } from '@/store/CartContext'
import { LanguageProvider } from '@/store/LanguageContext'
import { ServiceProvider } from '@/store/ServiceContext'
import { ToastProvider } from '@/store/ToastContext'
import { WishlistProvider } from '@/store/WishlistContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppDataProvider>
        <ServiceProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>{children}</WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ServiceProvider>
      </AppDataProvider>
    </ToastProvider>
  )
}

export { useAppData } from '@/store/AppDataContext'
export { useAuth } from '@/store/AuthContext'
export { useCart } from '@/store/CartContext'
export { useLang } from '@/store/LanguageContext'
export { useService } from '@/store/ServiceContext'
export { useToast } from '@/store/ToastContext'
export { useWishlist } from '@/store/WishlistContext'

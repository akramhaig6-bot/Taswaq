import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/store/AuthContext'
import { usePersistedState } from '@/store/persist'

interface WishlistValue {
  ids: string[]
  count: number
  has: (productId: string) => boolean
  toggle: (productId: string) => boolean
  remove: (productId: string) => void
  clear: () => void
}

const WishlistContext = createContext<WishlistValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [store, setStore] = usePersistedState<Record<string, string[]>>('wishlist', {})
  const key = user?.id ?? 'guest'
  const ids = useMemo(() => store[key] ?? [], [store, key])

  const save = useCallback(
    (next: string[]) => setStore((prev) => ({ ...prev, [key]: next })),
    [key, setStore],
  )

  const has = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggle = useCallback(
    (productId: string) => {
      const exists = ids.includes(productId)
      save(exists ? ids.filter((id) => id !== productId) : [productId, ...ids])
      return !exists
    },
    [ids, save],
  )

  const remove = useCallback((productId: string) => save(ids.filter((id) => id !== productId)), [ids, save])
  const clear = useCallback(() => save([]), [save])

  const value = useMemo<WishlistValue>(
    () => ({ ids, count: ids.length, has, toggle, remove, clear }),
    [ids, has, toggle, remove, clear],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}

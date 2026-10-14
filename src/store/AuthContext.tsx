import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Address, Customer, SavedCard } from '@/types'
import { isEmail, isPhone, normalizePhone, uid } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'
import { usePersistedState } from '@/store/persist'

interface AuthResult {
  ok: boolean
  error?: string
}

interface AuthValue {
  user: Customer | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => AuthResult
  register: (input: { name: string; email: string; phone: string; password: string }) => AuthResult
  logout: () => void
  updateProfile: (patch: Partial<Customer>) => void
  deleteAccount: () => void
  addAddress: (address: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => Address
  updateAddress: (id: string, patch: Partial<Address>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  addCard: (card: Omit<SavedCard, 'id'>) => void
  removeCard: (id: string) => void
  setDefaultCard: (id: string) => void
  isAdmin: boolean
  adminLogin: (email: string, password: string) => AuthResult
  adminLogout: () => void
  /** حالة انتهاء الجلسة (تظهر Modal في واجهة العميل) */
  sessionExpired: boolean
  /** إنهاء الجلسة الحالية فورًا */
  expireSessionNow: () => void
  /** إغلاق تنبيه انتهاء الجلسة + تسجيل الخروج */
  acknowledgeSessionExpired: () => void
}

/** مدة صلاحية جلسة العميل (30 دقيقة) */
const SESSION_TTL_MS = 30 * 60 * 1000

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { customers, adminUser } = useAppData()
  const [customerId, setCustomerId] = usePersistedState<string | null>('session.customer', null)
  const [isAdmin, setIsAdmin] = usePersistedState<boolean>('session.admin', false)
  const [expiresAt, setExpiresAt] = usePersistedState<number | null>('session.expiresAt', null)
  const [sessionExpired, setSessionExpired] = useState(false)

  /** نتحقق من صلاحية الجلسة دوريًا أثناء استخدام التطبيق */
  useEffect(() => {
    if (!customerId || !expiresAt) return
    const check = () => {
      if (Date.now() >= expiresAt) setSessionExpired(true)
    }
    check()
    const timer = window.setInterval(check, 15000)
    return () => window.clearInterval(timer)
  }, [customerId, expiresAt])

  const user = useMemo(() => customers.items.find((c) => c.id === customerId) ?? null, [customers.items, customerId])

  const login = useCallback<AuthValue['login']>(
    (identifier, password) => {
      const value = identifier.trim()
      const customer = customers.items.find((c) => {
        const emailMatch = isEmail(value) && c.email.toLowerCase() === value.toLowerCase()
        const phoneMatch = isPhone(value) && normalizePhone(c.phone) === normalizePhone(value)
        return emailMatch || phoneMatch
      })
      if (!customer || customer.password !== password) {
        return { ok: false, error: 'البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة.' }
      }
      if (customer.blocked) return { ok: false, error: 'تم إيقاف هذا الحساب. يرجى التواصل مع خدمة العملاء.' }
      setCustomerId(customer.id)
      setExpiresAt(Date.now() + SESSION_TTL_MS)
      return { ok: true }
    },
    [customers.items, setCustomerId],
  )

  const register = useCallback<AuthValue['register']>(
    ({ name, email, phone, password }) => {
      const exists = customers.items.some((c) => c.email.toLowerCase() === email.trim().toLowerCase())
      if (exists) return { ok: false, error: 'هذا البريد الإلكتروني مسجل مسبقًا. يمكنك تسجيل الدخول.' }
      const customer: Customer = {
        id: uid('u'),
        name: name.trim(),
        email: email.trim(),
        phone: normalizePhone(phone),
        password,
        addresses: [],
        savedCards: [],
        blocked: false,
        createdAt: new Date().toISOString(),
      }
      customers.add(customer)
      setCustomerId(customer.id)
      setExpiresAt(Date.now() + SESSION_TTL_MS)
      return { ok: true }
    },
    [customers, setCustomerId],
  )

  const logout = useCallback(() => {
    setCustomerId(null)
    setExpiresAt(null)
    setSessionExpired(false)
  }, [setCustomerId, setExpiresAt])

  const expireSessionNow = useCallback(() => {
    setExpiresAt(Date.now() - 1000)
    setSessionExpired(true)
  }, [setExpiresAt])

  const acknowledgeSessionExpired = useCallback(() => {
    setSessionExpired(false)
    setCustomerId(null)
    setExpiresAt(null)
  }, [setCustomerId, setExpiresAt])

  const updateProfile = useCallback<AuthValue['updateProfile']>(
    (patch) => {
      if (!user) return
      customers.update(user.id, patch)
    },
    [customers, user],
  )

  const deleteAccount = useCallback(() => {
    if (!user) return
    customers.remove(user.id)
    setCustomerId(null)
  }, [customers, setCustomerId, user])

  const addAddress = useCallback<AuthValue['addAddress']>(
    (address) => {
      const newAddress: Address = { ...address, id: uid('a') }
      if (!user) return newAddress
      const addresses = address.isDefault
        ? user.addresses.map((a): Address => ({ ...a, isDefault: false })).concat(newAddress)
        : user.addresses.length === 0
          ? [...user.addresses, { ...newAddress, isDefault: true }]
          : [...user.addresses, newAddress]
      customers.update(user.id, { addresses })
      return newAddress
    },
    [customers, user],
  )

  const updateAddress = useCallback<AuthValue['updateAddress']>(
    (id, patch) => {
      if (!user) return
      const addresses = user.addresses.map((a) => {
        if (a.id === id) return { ...a, ...patch }
        return patch.isDefault ? { ...a, isDefault: false } : a
      })
      customers.update(user.id, { addresses })
    },
    [customers, user],
  )

  const removeAddress = useCallback<AuthValue['removeAddress']>(
    (id) => {
      if (!user) return
      const addresses = user.addresses.filter((a) => a.id !== id)
      if (addresses.length && !addresses.some((a) => a.isDefault)) addresses[0] = { ...addresses[0], isDefault: true }
      customers.update(user.id, { addresses })
    },
    [customers, user],
  )

  const setDefaultAddress = useCallback<AuthValue['setDefaultAddress']>(
    (id) => {
      if (!user) return
      customers.update(user.id, { addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === id })) })
    },
    [customers, user],
  )

  const addCard = useCallback<AuthValue['addCard']>(
    (card) => {
      if (!user) return
      const newCard: SavedCard = { ...card, id: uid('card') }
      const cards = user.savedCards.length === 0 ? [{ ...newCard, isDefault: true }] : [...user.savedCards, newCard]
      customers.update(user.id, { savedCards: cards })
    },
    [customers, user],
  )

  const removeCard = useCallback<AuthValue['removeCard']>(
    (id) => {
      if (!user) return
      const cards = user.savedCards.filter((c) => c.id !== id)
      if (cards.length && !cards.some((c) => c.isDefault)) cards[0] = { ...cards[0], isDefault: true }
      customers.update(user.id, { savedCards: cards })
    },
    [customers, user],
  )

  const setDefaultCard = useCallback<AuthValue['setDefaultCard']>(
    (id) => {
      if (!user) return
      customers.update(user.id, { savedCards: user.savedCards.map((c) => ({ ...c, isDefault: c.id === id })) })
    },
    [customers, user],
  )

  const adminLogin = useCallback<AuthValue['adminLogin']>(
    (email, password) => {
      if (email.trim().toLowerCase() !== adminUser.email.toLowerCase() || password !== adminUser.password) {
        return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }
      }
      setIsAdmin(true)
      return { ok: true }
    },
    [adminUser, setIsAdmin],
  )

  const adminLogout = useCallback(() => setIsAdmin(false), [setIsAdmin])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      deleteAccount,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addCard,
      removeCard,
      setDefaultCard,
      isAdmin,
      adminLogin,
      adminLogout,
      sessionExpired,
      expireSessionNow,
      acknowledgeSessionExpired,
    }),
    [
      user,
      login,
      register,
      logout,
      updateProfile,
      deleteAccount,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addCard,
      removeCard,
      setDefaultCard,
      isAdmin,
      adminLogin,
      adminLogout,
      sessionExpired,
      expireSessionNow,
      acknowledgeSessionExpired,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

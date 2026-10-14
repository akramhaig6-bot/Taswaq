import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

/**
 * تنقل يتطلب تسجيل الدخول:
 * إذا لم يكن المستخدم مسجلًا ينتقل إلى شاشة تسجيل الدخول/إنشاء حساب
 * مع حفظ الوجهة ليتم الرجوع إليها بعد النجاح.
 */
export function useRequireAuth() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return useCallback(
    (to: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
      if (isAuthenticated) {
        navigate(to, options)
        return true
      }
      navigate('/login', { state: { from: to, ...(options?.state ?? {}) } })
      return false
    },
    [isAuthenticated, navigate],
  )
}

export function useBack() {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (fallback = '/') => {
      const state = location.state as { from?: string } | null
      if (state?.from) {
        navigate(state.from)
        return
      }
      if (window.history.length > 1) navigate(-1)
      else navigate(fallback)
    },
    [location.state, navigate],
  )
}

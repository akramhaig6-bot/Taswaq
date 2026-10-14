import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, X } from 'lucide-react'
import { isEmail } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/form'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { settings } = useAppData()
  const { adminLogin, isAdmin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    if (isAdmin) navigate('/admin/dashboard', { replace: true })
  }, [isAdmin, navigate])

  const submit = () => {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'يرجى إدخال البريد الإلكتروني.'
    else if (!isEmail(email)) next.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    if (!password) next.password = 'يرجى إدخال كلمة المرور.'
    setErrors(next)
    setGeneralError('')
    if (Object.keys(next).length) return

    setLoading(true)
    window.setTimeout(() => {
      const result = adminLogin(email, password)
      setLoading(false)
      if (!result.ok) {
        setGeneralError(result.error ?? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.')
        return
      }
      navigate('/admin/dashboard', { replace: true })
    }, 800)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-ink via-[#111c33] to-[#1e2a4a] p-4">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-2xl font-extrabold text-brand">{settings.storeName}</span>
            <h1 className="text-[15px] font-bold text-gray-600">لوحة الإدارة</h1>
          </div>

          {generalError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-danger/10 p-3">
              <X className="mt-0.5 size-4 shrink-0 text-danger" />
              <p className="text-[12.5px] font-semibold leading-6 text-danger">{generalError}</p>
            </div>
          )}

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              error={errors.email}
              autoComplete="username"
              onChange={(event) => {
                setEmail(event.target.value)
                setGeneralError('')
              }}
            />
            <div className="relative">
              <Input
                label="كلمة المرور"
                type={reveal ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                error={errors.password}
                autoComplete="current-password"
                className="pe-11"
                onChange={(event) => {
                  setPassword(event.target.value)
                  setGeneralError('')
                }}
              />
              <button
                type="button"
                onClick={() => setReveal((value) => !value)}
                className="absolute end-2 top-[34px] flex size-9 items-center justify-center text-gray-400"
                aria-label={reveal ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!email || !password}
            >
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-[11.5px] font-bold text-gray-600">بيانات الدخول</p>
            <p className="mt-0.5 text-[11.5px] text-gray-500">haiderhajjah@gmail.com — 2009</p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-white/60">{settings.copyright}</p>
      </div>
    </div>
  )
}

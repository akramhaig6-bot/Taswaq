import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { isEmail, isPhone } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, PasswordStrengthBar } from '@/components/ui/form'
import { Tabs } from '@/components/ui/display'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

type Tab = 'login' | 'register'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const { settings } = useAppData()
  const { showToast } = useToast()
  const from = (location.state as { from?: string } | null)?.from

  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  /* تسجيل الدخول */
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})

  /* إنشاء الحساب */
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    agree: false,
  })
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})

  const goAfterAuth = () => {
    if (from) navigate(from, { replace: true })
    else navigate(-1)
  }

  const submitLogin = async () => {
    const next: Record<string, string> = {}
    if (!loginForm.identifier.trim()) next.identifier = 'يرجى إدخال البريد الإلكتروني أو رقم الجوال.'
    else if (!isEmail(loginForm.identifier) && !isPhone(loginForm.identifier))
      next.identifier = 'يرجى إدخال بريد إلكتروني أو رقم جوال صحيح.'
    if (!loginForm.password) next.password = 'يرجى إدخال كلمة المرور.'
    setLoginErrors(next)
    setGeneralError('')
    if (Object.keys(next).length) return

    setLoading(true)
    const result = await login(loginForm.identifier, loginForm.password)
    setLoading(false)
    if (!result.ok) {
      setGeneralError(result.error ?? 'حدث خطأ. يرجى المحاولة لاحقًا.')
      return
    }
    showToast('تم تسجيل الدخول بنجاح.', { type: 'success' })
    goAfterAuth()
  }

  const submitRegister = async () => {
    const next: Record<string, string> = {}
    if (!registerForm.name.trim()) next.name = 'يرجى إدخال الاسم.'
    else if (registerForm.name.trim().length < 3) next.name = 'الاسم يجب أن يكون 3 أحرف على الأقل.'
    if (!registerForm.email.trim()) next.email = 'يرجى إدخال البريد الإلكتروني.'
    else if (!isEmail(registerForm.email)) next.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    if (!registerForm.phone.trim()) next.phone = 'يرجى إدخال رقم الجوال.'
    else if (!isPhone(registerForm.phone)) next.phone = 'يرجى إدخال رقم جوال صحيح.'
    if (!registerForm.password) next.password = 'يرجى إدخال كلمة المرور.'
    else if (registerForm.password.length < 6) next.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
    if (registerForm.confirm !== registerForm.password) next.confirm = 'كلمتا المرور غير متطابقتين.'
    if (!registerForm.agree) next.agree = 'يرجى الموافقة على الشروط والأحكام.'
    setRegisterErrors(next)
    setGeneralError('')
    if (Object.keys(next).length) return

    setLoading(true)
    const result = await register({
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
    })
    setLoading(false)
    if (!result.ok) {
      if (result.error?.includes('مسجل')) setRegisterErrors((prev) => ({ ...prev, email: result.error! }))
      else setGeneralError(result.error ?? 'حدث خطأ. يرجى المحاولة لاحقًا.')
      return
    }
    showToast(`تم إنشاء حسابك بنجاح! مرحبًا ${registerForm.name}.`, { type: 'success' })
    goAfterAuth()
  }

  return (
    <Screen header={<PageHeader title={tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'} backTo={-1} />}>
      <div className="p-4">
        <div className="mb-4 flex justify-center">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-extrabold text-brand">{settings.storeName}</span>
          )}
        </div>

        <Tabs
          value={tab}
          onChange={(value: Tab) => {
            setTab(value)
            setGeneralError('')
          }}
          items={[
            { value: 'login', label: 'تسجيل الدخول' },
            { value: 'register', label: 'إنشاء حساب' },
          ]}
          className="mb-4 w-full"
        />

        {generalError && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-danger/10 p-3">
            <X className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-[12.5px] font-semibold leading-6 text-danger">{generalError}</p>
          </div>
        )}

        {tab === 'login' ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              submitLogin()
            }}
          >
            <Input
              label="البريد الإلكتروني أو رقم الجوال"
              placeholder="example@email.com أو 05XXXXXXXX"
              value={loginForm.identifier}
              error={loginErrors.identifier}
              onChange={(event) => {
                setLoginForm({ ...loginForm, identifier: event.target.value })
                setGeneralError('')
              }}
            />
            <Input
              label="كلمة المرور"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={loginForm.password}
              error={loginErrors.password}
              onChange={(event) => {
                setLoginForm({ ...loginForm, password: event.target.value })
                setGeneralError('')
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[12.5px] font-bold text-brand hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={!loginForm.identifier || !loginForm.password}
            >
              تسجيل الدخول
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              submitRegister()
            }}
          >
            <Input
              label="الاسم الكامل"
              placeholder="أدخل اسمك الكامل"
              value={registerForm.name}
              error={registerErrors.name}
              onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="example@email.com"
              value={registerForm.email}
              error={registerErrors.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
            />
            <Input
              label="رقم الجوال"
              type="tel"
              placeholder="05XXXXXXXX"
              value={registerForm.phone}
              error={registerErrors.phone}
              onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
            />
            <div>
              <Input
                label="كلمة المرور"
                type="password"
                placeholder="أنشئ كلمة مرور"
                value={registerForm.password}
                error={registerErrors.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              />
              <div className="mt-1.5">
                <PasswordStrengthBar value={registerForm.password} />
              </div>
            </div>
            <Input
              label="تأكيد كلمة المرور"
              type="password"
              placeholder="أعد إدخال كلمة المرور"
              value={registerForm.confirm}
              error={registerErrors.confirm}
              onChange={(event) => setRegisterForm({ ...registerForm, confirm: event.target.value })}
            />
            <Checkbox
              checked={registerForm.agree}
              onChange={(checked) => setRegisterForm({ ...registerForm, agree: checked })}
              error={registerErrors.agree}
              label={
                <span>
                  أوافق على{' '}
                  <button type="button" onClick={() => navigate('/pages/terms')} className="font-bold text-brand underline">
                    شروط الاستخدام
                  </button>{' '}
                  و{' '}
                  <button type="button" onClick={() => navigate('/pages/privacy')} className="font-bold text-brand underline">
                    سياسة الخصوصية
                  </button>
                </span>
              }
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              إنشاء حساب
            </Button>
          </form>
        )}
      </div>
    </Screen>
  )
}

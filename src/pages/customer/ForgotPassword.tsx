import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { isEmail } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/form'
import { useService } from '@/store/ServiceContext'
import { useToast } from '@/store/ToastContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const service = useService()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setInterval(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [countdown])

  const submit = async () => {
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني.')
      return
    }
    if (!isEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح.')
      return
    }
    setLoading(true)
    const result = await service.requestPasswordReset(email)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? 'حدث خطأ. يرجى المحاولة لاحقًا.')
      return
    }
    setError('')
    setSent(true)
    setCountdown(30)
  }

  if (sent) {
    return (
      <Screen header={<PageHeader title="استعادة كلمة المرور" backTo="/login" />}>
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-fade-in">
          <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
            <MailCheck className="size-9" />
          </span>
          <h1 className="text-[16px] font-extrabold text-gray-900">تم إرسال رابط الاستعادة</h1>
          <p className="text-[13px] leading-6 text-gray-600">تم إرسال رابط الاستعادة إلى {email}.</p>
          <p className="text-[12px] text-gray-400">تحقق من صندوق البريد الوارد أو مجلد البريد العشوائي.</p>

          {countdown > 0 ? (
            <p className="text-[12px] text-gray-400">إعادة الإرسال بعد {countdown} ثانية</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCountdown(30)
                showToast('تم إعادة الإرسال.', { type: 'success' })
              }}
              className="text-[12.5px] font-bold text-brand hover:underline"
            >
              لم تستلم الرسالة؟ إعادة الإرسال
            </button>
          )}

          <Button variant="outline" onClick={() => navigate('/login')}>
            العودة لتسجيل الدخول
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen header={<PageHeader title="استعادة كلمة المرور" backTo="/login" />}>
      <div className="space-y-4 p-5">
        <p className="text-[13px] leading-7 text-gray-600">
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور.
        </p>
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@email.com"
          value={email}
          error={error}
          onChange={(event) => {
            setEmail(event.target.value)
            setError('')
          }}
        />
        <Button fullWidth size="lg" loading={loading} onClick={submit}>
          إرسال رابط الاستعادة
        </Button>
        <p className="text-[11.5px] leading-6 text-gray-400">
          سيصلك رابط الاستعادة على بريدك الإلكتروني إن كان مسجلًا لدينا.
        </p>
      </div>
    </Screen>
  )
}

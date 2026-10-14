import { useNavigate } from 'react-router-dom'
import { LogIn, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/store/AuthContext'

/**
 * حالة الجلسة المنتهية (القسم 33.2 في الوثيقة):
 * Modal: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى." + زر "تسجيل الدخول".
 */
export function ExpiredSessionModal() {
  const navigate = useNavigate()
  const { sessionExpired, acknowledgeSessionExpired } = useAuth()

  if (!sessionExpired) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 animate-fade-in" />
      <div className="relative w-full max-w-[350px] overflow-hidden rounded-2xl bg-white p-5 text-center shadow-xl animate-slide-up">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-warning/15 text-warning">
          <ShieldAlert className="size-7" />
        </span>
        <h2 className="text-[15px] font-extrabold text-gray-900">انتهت جلستك</h2>
        <p className="mt-1.5 text-[13px] leading-6 text-gray-600">انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            fullWidth
            icon={<LogIn className="size-4" />}
            onClick={() => {
              acknowledgeSessionExpired()
              navigate('/login', { state: { from: '/' } })
            }}
          >
            تسجيل الدخول
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              acknowledgeSessionExpired()
              navigate('/')
            }}
          >
            متابعة كزائر
          </Button>
        </div>
      </div>
    </div>
  )
}

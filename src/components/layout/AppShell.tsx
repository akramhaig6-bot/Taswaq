import { useEffect, useState } from 'react'
import { ArrowLeft, CloudOff, Wifi, WifiOff, X } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/layout/BottomNav'
import { Button } from '@/components/ui/Button'
import { ExpiredSessionModal } from '@/components/layout/ExpiredSessionModal'
import { useAppData } from '@/store/AppDataContext'

/** شريط حالة الاتصال بالإنترنت */
function OfflineBar() {
  const [online, setOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      setShowRestored(true)
      window.setTimeout(() => setShowRestored(false), 2000)
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online && !showRestored) return null

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center gap-2 py-1.5 text-[11.5px] font-bold text-white transition-colors',
        online ? 'bg-success' : 'bg-danger',
      )}
    >
      {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
      <span>{online ? 'تم استعادة الاتصال' : 'لا يوجد اتصال بالإنترنت'}</span>
    </div>
  )
}

/** شاشة وضع الصيانة (تُفعّل من لوحة الإدارة) */
function MaintenanceScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
        <CloudOff className="size-9" />
      </span>
      <h1 className="text-lg font-extrabold text-gray-900">التطبيق تحت الصيانة</h1>
      <p className="text-[13px] leading-6 text-gray-500">
        نقوم حاليًا بتحسينات على المتجر. سنعود قريبًا بإذن الله، شكرًا لصبرك.
      </p>
    </div>
  )
}

export function AppShell() {
  const { settings } = useAppData()
  const location = useLocation()
  const [announcementDismissed, setAnnouncementDismissed] = useState(false)
  const announcement = settings.announcementBar
  const showAnnouncement = Boolean(announcement?.enabled && announcement.text.trim() && !announcementDismissed && !location.pathname.startsWith('/admin'))

  if (settings.technical.maintenanceMode) {
    return (
      <div className="flex min-h-dvh justify-center bg-page">
        <div className="app-frame flex h-dvh flex-col overflow-hidden">
          <MaintenanceScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh justify-center bg-page">
      <div className="app-frame flex h-dvh flex-col overflow-hidden">
        <OfflineBar />
        {showAnnouncement && announcement && (
          <div className="relative flex shrink-0 items-center justify-center gap-2 px-10 py-2 text-center text-[11.5px] font-bold leading-5" style={{ backgroundColor: announcement.background, color: announcement.foreground }}>
            {announcement.target?.startsWith('/') ? (
              <Link to={announcement.target} className="flex min-w-0 items-center justify-center gap-1.5">
                <span>{announcement.text}</span><ArrowLeft className="size-3.5 shrink-0" />
              </Link>
            ) : <span>{announcement.text}</span>}
            <button type="button" aria-label="إغلاق الإعلان" onClick={() => setAnnouncementDismissed(true)} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-80 hover:opacity-100">
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <ExpiredSessionModal />
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}

/** شاشة عامة داخل إطار التطبيق (شاشات بدون شريط سفلي مثل الأخطاء) */
export function PlainFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-page">
      <div className="app-frame flex h-dvh flex-col overflow-hidden">{children}</div>
    </div>
  )
}

export function RetryPanel({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-danger/10 text-danger">
        <CloudOff className="size-9" />
      </span>
      <p className="text-[13.5px] leading-6 text-gray-600">
        {message ?? 'تعذر الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'}
      </p>
      <Button onClick={onRetry}>إعادة المحاولة</Button>
    </div>
  )
}

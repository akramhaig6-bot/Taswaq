import { useMemo, useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  FileText,
  Globe,
  Heart,
  Info,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  RotateCcw,
  Shield,
  Star,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar, Badge, EmptyState } from '@/components/ui/display'
import { Button } from '@/components/ui/Button'
import { BottomSheet, ConfirmDialog } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LanguageContext'
import { useToast } from '@/store/ToastContext'
import { useWishlist } from '@/store/WishlistContext'
import { openWhatsApp } from '@/lib/whatsapp'

type AccountRow = {
  key: string
  label: string
  icon: ComponentType<{ className?: string }>
  to?: string
  action?: () => void
  hint?: string
  auth?: boolean
}

export default function Account() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useLang()
  const { settings, orders, notifications, pages } = useAppData()
  const { user, isAuthenticated, logout } = useAuth()
  const wishlist = useWishlist()
  const { showToast } = useToast()

  const [langSheet, setLangSheet] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [rateConfirm, setRateConfirm] = useState(false)

  const myOrders = useMemo(
    () => (user ? orders.items.filter((order) => order.customerId === user.id) : []),
    [orders.items, user],
  )
  const unread = notifications.items.filter((item) => !item.forAdmin && !item.read).length

  const activeLanguages = settings.languages.filter((language) => language.active)

  const rows: AccountRow[] = [
    { key: 'orders', label: 'طلباتي', icon: Package, to: '/orders', hint: myOrders.length ? `${myOrders.length} طلب` : undefined, auth: true },
    { key: 'wishlist', label: 'المفضلة', icon: Heart, to: '/wishlist', hint: wishlist.count ? `${wishlist.count} منتج` : undefined, auth: true },
    { key: 'addresses', label: 'عناويني', icon: MapPin, to: '/account/addresses', hint: user?.addresses.length ? `${user.addresses.length}` : undefined, auth: true },
    { key: 'whatsapp', label: 'تواصل عبر واتساب', icon: MessageCircle, action: () => openWhatsApp(`مرحبًا، أحتاج إلى مساعدة من خدمة عملاء ${settings.storeName}.`, settings.contact.whatsapp), hint: '24 ساعة' },
    { key: 'notifications', label: 'الإشعارات', icon: Bell, to: '/account/notifications', hint: unread ? `${unread} جديد` : undefined },
    { key: 'language', label: 'اللغة', icon: Globe, action: () => setLangSheet(true), hint: lang === 'ar' ? 'العربية' : 'English' },
    ...pages.items
      .filter((page) => page.active)
      .map((page) => ({
        key: page.slug,
        label: page.title,
        icon:
          page.slug === 'about'
            ? Info
            : page.slug === 'terms'
              ? FileText
              : page.slug === 'privacy'
                ? Shield
                : page.slug === 'returns'
                  ? RotateCcw
                  : page.slug === 'contact'
                    ? Phone
                    : Star,
        to: `/pages/${page.slug}`,
        auth: false,
      })),
    { key: 'rate', label: 'تقييم التطبيق', icon: Star, action: () => setRateConfirm(true), auth: false },
  ]

  return (
    <Screen header={<TopBar showSearch={false} />}>
      <div className="p-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3.5">
            <Avatar name={user.name} src={user.avatar} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-extrabold text-gray-900">{user.name}</p>
              <p className="truncate text-[12px] text-gray-500">{user.email}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">عضو منذ {formatDate(user.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/account/edit')}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"
              aria-label="تعديل الملف الشخصي"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
            <p className="text-[13.5px] font-bold text-gray-800">سجّل دخولك للاستفادة من كامل مزايا سوقلي.</p>
            <p className="mt-1 text-[12px] text-gray-500">تتبّع طلباتك، احفظ مفضلاتك وعناوينك، وأكمل الشراء أسرع.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/login', { state: { tab: 'register' } })}>
                ليس لديك حساب؟ أنشئ حسابًا
              </Button>
            </div>
          </div>
        )}

        <ul className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {rows
            .filter((row) => !row.auth || isAuthenticated)
            .map((row) => (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() => (row.action ? row.action() : navigate(row.to as string))}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-start transition-colors hover:bg-gray-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <row.icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] font-semibold text-gray-800">{row.label}</span>
                  {row.hint && <Badge tone="brand">{row.hint}</Badge>}
                  <ChevronLeft className="size-4 shrink-0 text-gray-300" />
                </button>
              </li>
            ))}
        </ul>

        {isAuthenticated && (
          <Button
            variant="outline"
            fullWidth
            className="mt-3 border-danger text-danger"
            icon={<LogOut className="size-4" />}
            onClick={() => setLogoutConfirm(true)}
          >
            تسجيل الخروج
          </Button>
        )}

        <p className="mt-6 text-center text-[11.5px] text-gray-400">{settings.copyright}</p>
        <p className="mt-1 text-center text-[10.5px] text-gray-300">الإصدار {settings.version}</p>
      </div>

      <BottomSheet open={langSheet} onClose={() => setLangSheet(false)} title="اختر اللغة">
        <div className="space-y-2 pb-2">
          {activeLanguages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => {
                setLang(language.code)
                setLangSheet(false)
                showToast('تم تغيير اللغة.', { type: 'success' })
              }}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-start"
            >
              <span className="text-[13.5px] font-semibold text-gray-800">{language.name}</span>
              {lang === language.code && <Badge tone="brand">مفعّلة</Badge>}
            </button>
          ))}
          {activeLanguages.length === 0 && <EmptyState title="لا توجد لغات مفعّلة." />}
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={logoutConfirm}
        title="تسجيل الخروج"
        message="هل تريد تسجيل الخروج؟"
        confirmLabel="تسجيل الخروج"
        danger
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={() => {
          logout()
          setLogoutConfirm(false)
          showToast(t('toast.loggedOut', 'تم تسجيل الخروج.'), { type: 'success' })
          navigate('/')
        }}
      />

      <ConfirmDialog
        open={rateConfirm}
        title="تقييم التطبيق"
        message="شكرًا لك! تقييمك يساعدنا على تحسين تجربتك في سوقلي."
        confirmLabel="تم، شكرًا"
        cancelLabel="لاحقًا"
        onCancel={() => setRateConfirm(false)}
        onConfirm={() => {
          setRateConfirm(false)
          showToast('تم تسجيل تقييمك، شكرًا لك!', { type: 'success' })
        }}
      />
    </Screen>
  )
}

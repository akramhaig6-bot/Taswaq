import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react'
import { whatsappUrl } from '@/lib/whatsapp'
import { useAppData } from '@/store/AppDataContext'

/**
 * بطاقة التواصل الرسمية (صفحة «تواصل معنا» ونافذة الدعم).
 * لا تعرض رقم واتساب إطلاقًا — الزر يفتح المحادثة مباشرة.
 */
export function ContactPanel({ compact = false }: { compact?: boolean }) {
  const { settings } = useAppData()
  const { contact } = settings
  const message = `مرحبًا، تواصلت معكم من تطبيق ${settings.storeName} وأحتاج إلى مساعدة.`
  const href = whatsappUrl(message, contact.whatsapp)

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-2xl border border-success/20 bg-white">
        <div className="bg-success/5 px-4 py-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
            <MessageCircle className="size-7" />
          </span>
          <h2 className="mt-2.5 text-[15px] font-extrabold text-gray-900">تواصل معنا عبر واتساب</h2>
          <p className="mx-auto mt-1 max-w-xs text-[12px] leading-6 text-gray-500">
            فريق خدمة العملاء جاهز للرد على استفساراتك ومساعدتك في طلبك.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-[15px] font-semibold text-white shadow-xs transition-all duration-150 hover:brightness-95 active:scale-[.98]"
          >
            <MessageCircle className="size-5" />
            فتح محادثة واتساب
          </a>
          <p className="mt-2.5 inline-flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-success">
            <Clock className="size-3.5" />
            متاحون 24 ساعة طوال أيام الأسبوع
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-gray-50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <Mail className="size-4" />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <span className="block text-[11.5px] text-gray-500">البريد الإلكتروني</span>
              <span className="block truncate text-[13px] font-semibold text-gray-800">{contact.email}</span>
            </span>
          </a>
          <div className="flex items-center gap-3 px-3.5 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
              <MapPin className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] text-gray-500">العنوان</span>
              <span className="block text-[13px] font-semibold text-gray-800">{contact.address}</span>
            </span>
          </div>
        </div>
      </section>

      {!compact && (
        <p className="rounded-2xl bg-gray-50 px-3.5 py-3 text-center text-[11.5px] leading-6 text-gray-500">
          أوامر الشراء والاستفسارات تُستقبل على مدار الساعة، ونرد على رسائلكم في أقرب وقت.
        </p>
      )}
    </div>
  )
}

import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings } = useAppData()
  const { contact } = settings
  const whatsapp = contact.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '966')

  const rows = [
    { icon: Phone, label: 'رقم الجوال', value: contact.phone, href: `tel:${contact.phone}` },
    { icon: MessageCircle, label: 'واتساب', value: contact.whatsapp, href: `https://wa.me/${whatsapp}` },
    { icon: Mail, label: 'البريد الإلكتروني', value: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, label: 'العنوان', value: contact.address, href: undefined },
  ]

  return (
    <Modal open={open} onClose={onClose} title="تواصل مع الدعم" size="sm">
      <p className="mb-3 text-[12.5px] leading-6 text-gray-500">
        فريق خدمة العملاء متاح لمساعدتك من الأحد إلى الخميس، 9 صباحًا حتى 6 مساءً.
      </p>
      <div className="space-y-2">
        {rows.map((row) => (
          <a
            key={row.label}
            href={row.href}
            target={row.href?.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:border-brand"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
              <row.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] text-gray-500">{row.label}</span>
              <span className="block text-[13px] font-semibold text-gray-800">{row.value}</span>
            </span>
          </a>
        ))}
      </div>
    </Modal>
  )
}

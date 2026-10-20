import { Modal } from '@/components/ui/overlay'
import { ContactPanel } from '@/components/customer/ContactPanel'

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="تواصل مع الدعم" size="sm">
      <p className="mb-3 text-[12.5px] leading-6 text-gray-500">
        فريق خدمة العملاء متاح لمساعدتك على مدار الساعة، طوال أيام الأسبوع.
      </p>
      <ContactPanel compact />
    </Modal>
  )
}

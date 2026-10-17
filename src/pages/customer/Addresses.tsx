import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import type { Address } from '@/types'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { AddressCard, AddressFormModal } from '@/components/customer/AddressModals'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'
import { ConfirmDialog } from '@/components/ui/overlay'
import { useAuth } from '@/store/AuthContext'
import { useService } from '@/store/ServiceContext'
import { useToast } from '@/store/ToastContext'

export default function Addresses() {
  const { user } = useAuth()
  const service = useService()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null)

  return (
    <Screen
      header={
        <PageHeader
          title="عناويني"
          backTo="/account"
          actions={
            <Button
              size="sm"
              variant="soft"
              icon={<Plus className="size-3.5" />}
              onClick={() => {
                setEditing(null)
                setModalOpen(true)
              }}
            >
              إضافة
            </Button>
          }
        />
      }
    >
      <div className="space-y-3 p-4">
        {user?.addresses.length ? (
          user.addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => {
                setEditing(address)
                setModalOpen(true)
              }}
              onDelete={() => setPendingDelete(address)}
              onSetDefault={async () => {
                if (!user) return
                const result = await service.setDefaultAddress(user.id, address.id)
                if (result.ok) showToast('تم تعيين العنوان الافتراضي.', { type: 'success' })
                else showToast(result.error ?? 'تعذّر تعيين العنوان.', { type: 'error' })
              }}
            />
          ))
        ) : (
          <EmptyState
            icon={<MapPin className="size-9" />}
            title="لم تضف أي عنوان بعد."
            action={
              <Button
                onClick={() => {
                  setEditing(null)
                  setModalOpen(true)
                }}
              >
                + إضافة عنوانك الأول
              </Button>
            }
          />
        )}
      </div>

      <AddressFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        address={editing}
        onSave={async (value) => {
          if (!user) return
          const result = await service.saveAddress(user.id, value)
          if (!result.ok) {
            showToast(result.error ?? 'تعذّر حفظ العنوان. حاول مرة أخرى.', { type: 'error' })
            throw new Error(result.error)
          }
          showToast('تم حفظ العنوان بنجاح.', { type: 'success' })
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف العنوان"
        message="هل تريد حذف هذا العنوان؟"
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete || !user) return
          const result = await service.removeAddress(user.id, pendingDelete.id)
          setPendingDelete(null)
          if (result.ok) showToast('تم حذف العنوان.', { type: 'info' })
          else showToast(result.error ?? 'تعذّر حذف العنوان.', { type: 'error' })
        }}
      />
    </Screen>
  )
}

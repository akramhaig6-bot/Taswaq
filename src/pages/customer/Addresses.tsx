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
import { useToast } from '@/store/ToastContext'

export default function Addresses() {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuth()
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
              onSetDefault={() => {
                setDefaultAddress(address.id)
                showToast('تم تعيين العنوان الافتراضي.', { type: 'success' })
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
        onSave={(value) => {
          if (value.id) updateAddress(value.id, value)
          else addAddress({ ...value })
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
        onConfirm={() => {
          if (pendingDelete) removeAddress(pendingDelete.id)
          setPendingDelete(null)
          showToast('تم حذف العنوان.', { type: 'info' })
        }}
      />
    </Screen>
  )
}

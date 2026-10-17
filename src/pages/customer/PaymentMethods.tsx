import { useState } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import type { SavedCard } from '@/types'
import { cn } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Badge, EmptyState } from '@/components/ui/display'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { useAuth } from '@/store/AuthContext'
import { useService } from '@/store/ServiceContext'
import { useToast } from '@/store/ToastContext'

function detectBrand(number: string): SavedCard['brand'] {
  const digits = number.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  if (/^(5|6)/.test(digits)) return 'mada'
  return 'unknown'
}

export default function PaymentMethods() {
  const { user } = useAuth()
  const service = useService()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<SavedCard | null>(null)
  const [form, setForm] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const cards = user?.savedCards ?? []

  const save = async () => {
    const next: Record<string, string> = {}
    const digits = form.number.replace(/\s/g, '')
    if (digits.length !== 16) next.number = 'رقم البطاقة يجب أن يكون 16 رقمًا.'
    if (form.holder.trim().length < 3) next.holder = 'يرجى إدخال اسم حامل البطاقة.'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) next.expiry = 'تاريخ الانتهاء بصيغة MM/YY.'
    if (form.cvv.length < 3) next.cvv = 'رمز CVV غير صحيح.'
    setErrors(next)
    if (Object.keys(next).length) return
    if (!user) return
    setSaving(true)
    const result = await service.saveCard(user.id, {
      brand: detectBrand(form.number),
      last4: digits.slice(-4),
      expiry: form.expiry,
      holder: form.holder.toUpperCase(),
    })
    setSaving(false)
    if (!result.ok) {
      showToast(result.error ?? 'تعذّر حفظ البطاقة. حاول مرة أخرى.', { type: 'error' })
      return
    }
    setOpen(false)
    setForm({ number: '', holder: '', expiry: '', cvv: '' })
    showToast('تمت إضافة البطاقة.', { type: 'success' })
  }

  return (
    <Screen
      header={
        <PageHeader
          title="طرق الدفع المحفوظة"
          backTo="/account"
          actions={
            <Button size="sm" variant="soft" icon={<Plus className="size-3.5" />} onClick={() => setOpen(true)}>
              إضافة
            </Button>
          }
        />
      }
    >
      <div className="space-y-3 p-4">
        {cards.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="size-9" />}
            title="لم تضف أي بطاقة بعد."
            action={<Button onClick={() => setOpen(true)}>+ إضافة بطاقة جديدة</Button>}
          />
        ) : (
          cards.map((card) => (
            <div key={card.id} className={cn('rounded-2xl border bg-white p-3.5', card.isDefault ? 'border-brand' : 'border-gray-200')}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                  <CreditCard className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-bold text-gray-800">
                    {card.brand === 'visa' ? 'Visa' : card.brand === 'mastercard' ? 'Mastercard' : card.brand === 'mada' ? 'مدى' : 'بطاقة'}
                    {card.isDefault && <Badge tone="brand">افتراضية</Badge>}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    **** **** **** {card.last4} — {card.expiry}
                  </p>
                  <p className="text-[11px] text-gray-400">{card.holder}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(card)}
                  className="flex size-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {!card.isDefault && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!user) return
                    const result = await service.setDefaultCard(user.id, card.id)
                    if (result.ok) showToast('تم تعيين البطاقة الافتراضية.', { type: 'success' })
                    else showToast(result.error ?? 'تعذّر تعيين البطاقة.', { type: 'error' })
                  }}
                  className="mt-2 text-[12px] font-bold text-brand hover:underline"
                >
                  تعيين كافتراضية
                </button>
              )}
            </div>
          ))
        )}

        <p className="text-[11.5px] leading-6 text-gray-400">
          بيانات بطاقتك محمية ومشفّرة، ولا تُحفظ أرقام البطاقة كاملة.
        </p>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="إضافة بطاقة جديدة"
        footer={
          <Button fullWidth loading={saving} onClick={save}>
            حفظ البطاقة
          </Button>
        }
      >
        <div className="space-y-3">
          <Input
            label="رقم البطاقة"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={form.number}
            error={errors.number}
            onChange={(event) =>
              setForm({
                ...form,
                number: event.target.value
                  .replace(/\D/g, '')
                  .slice(0, 16)
                  .replace(/(.{4})/g, '$1 ')
                  .trim(),
              })
            }
          />
          <Input
            label="اسم حامل البطاقة"
            value={form.holder}
            error={errors.holder}
            onChange={(event) => setForm({ ...form, holder: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="تاريخ الانتهاء"
              placeholder="MM/YY"
              value={form.expiry}
              error={errors.expiry}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, 4)
                setForm({ ...form, expiry: digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits })
              }}
            />
            <Input
              label="CVV"
              inputMode="numeric"
              maxLength={4}
              value={form.cvv}
              error={errors.cvv}
              onChange={(event) => setForm({ ...form, cvv: event.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف البطاقة"
        message="هل تريد حذف هذه البطاقة؟"
        confirmLabel="حذف"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete || !user) return
          const result = await service.removeCard(user.id, pendingDelete.id)
          setPendingDelete(null)
          if (result.ok) showToast('تم حذف البطاقة.', { type: 'info' })
          else showToast(result.error ?? 'تعذّر حذف البطاقة.', { type: 'error' })
        }}
      />
    </Screen>
  )
}

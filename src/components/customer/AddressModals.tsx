import { useEffect, useState } from 'react'
import { MapPin, Pencil, Trash2 } from 'lucide-react'
import type { Address } from '@/types'
import { cn, isPhone } from '@/lib/utils'
import { Badge, Button } from '@/components/ui'
import { Checkbox, Input, Select, Textarea } from '@/components/ui/form'
import { Modal } from '@/components/ui/overlay'
import { useAppData } from '@/store/AppDataContext'

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSetDefault?: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'rounded-2xl border bg-white p-3.5 transition-colors',
        selected ? 'border-brand ring-2 ring-brand/15' : 'border-gray-200',
        onSelect && 'cursor-pointer',
      )}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
              selected ? 'border-brand' : 'border-gray-300',
            )}
          >
            {selected && <span className="size-2.5 rounded-full bg-brand" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[13px] font-bold text-gray-800">
              <MapPin className="size-3.5 text-brand" />
              {address.label}
            </span>
            {address.isDefault && <Badge tone="brand">افتراضي</Badge>}
          </div>
          <p className="mt-1 text-[12.5px] text-gray-600">{address.fullName} — {address.phone}</p>
          <p className="text-[12px] leading-6 text-gray-500">
            {address.city}، {address.district}، {address.street}
            {address.building ? `، مبنى ${address.building}` : ''}
            {address.postalCode ? `، الرمز البريدي ${address.postalCode}` : ''}
          </p>
          {address.notes && <p className="mt-1 text-[11.5px] text-gray-400">ملاحظات: {address.notes}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {onEdit && (
            <button type="button" onClick={onEdit} className="flex size-7 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <Pencil className="size-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex size-7 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      {onSetDefault && !address.isDefault && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSetDefault()
          }}
          className="mt-2 text-[12px] font-bold text-brand hover:underline"
        >
          تعيين كافتراضي
        </button>
      )}
    </div>
  )
}

const emptyAddress = {
  label: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  street: '',
  building: '',
  postalCode: '',
  notes: '',
  isDefault: false,
}

export function AddressFormModal({
  open,
  onClose,
  address,
  onSave,
}: {
  open: boolean
  onClose: () => void
  address?: Address | null
  onSave: (value: Omit<Address, 'id'> & { id?: string }) => void
}) {
  const { settings } = useAppData()
  const [form, setForm] = useState({ ...emptyAddress })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setForm(
      address
        ? {
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            city: address.city,
            district: address.district,
            street: address.street,
            building: address.building ?? '',
            postalCode: address.postalCode ?? '',
            notes: address.notes ?? '',
            isDefault: Boolean(address.isDefault),
          }
        : { ...emptyAddress, fullName: '', phone: '' },
    )
    setErrors({})
  }, [open, address])

  const set = (key: keyof typeof form, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = () => {
    const next: Record<string, string> = {}
    if (!form.label.trim()) next.label = 'يرجى إدخال اسم العنوان.'
    if (!form.fullName.trim()) next.fullName = 'يرجى إدخال اسم المستلم.'
    if (!form.phone.trim()) next.phone = 'يرجى إدخال رقم الجوال.'
    else if (!isPhone(form.phone)) next.phone = 'يرجى إدخال رقم جوال صحيح.'
    if (!form.city) next.city = 'يرجى اختيار المدينة.'
    if (!form.district.trim()) next.district = 'يرجى إدخال الحي.'
    if (!form.street.trim()) next.street = 'يرجى إدخال تفاصيل العنوان.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ ...form, id: address?.id })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={address ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
      size="lg"
      footer={
        <Button fullWidth size="lg" onClick={submit}>
          حفظ العنوان
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="اسم العنوان"
          required
          placeholder="مثلًا: المنزل، العمل"
          value={form.label}
          error={errors.label}
          onChange={(event) => set('label', event.target.value)}
        />
        <Input
          label="اسم المستلم"
          required
          placeholder="الاسم الكامل"
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => set('fullName', event.target.value)}
        />
        <Input
          label="رقم الجوال"
          required
          type="tel"
          placeholder="05XXXXXXXX"
          value={form.phone}
          error={errors.phone}
          onChange={(event) => set('phone', event.target.value)}
        />
        <Select
          label="المدينة"
          required
          placeholder="اختر المدينة"
          value={form.city}
          error={errors.city}
          onChange={(event) => set('city', event.target.value)}
          options={settings.cities.map((city) => ({ value: city.name, label: city.name }))}
        />
        <Input
          label="الحي / المنطقة"
          required
          value={form.district}
          error={errors.district}
          onChange={(event) => set('district', event.target.value)}
        />
        <Input
          label="رقم المبنى / الشقة"
          value={form.building}
          onChange={(event) => set('building', event.target.value)}
        />
        <Input
          label="الرمز البريدي"
          value={form.postalCode}
          onChange={(event) => set('postalCode', event.target.value)}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="الشارع / تفاصيل العنوان"
            required
            rows={3}
            value={form.street}
            error={errors.street}
            onChange={(event) => set('street', event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="ملاحظات التوصيل"
            rows={2}
            placeholder="مثلًا: اطرق الباب بقوة، اتصل قبل الوصول..."
            value={form.notes}
            onChange={(event) => set('notes', event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Checkbox
            checked={form.isDefault}
            onChange={(checked) => set('isDefault', checked)}
            label="تعيين كعنوان افتراضي"
          />
        </div>
      </div>
    </Modal>
  )
}

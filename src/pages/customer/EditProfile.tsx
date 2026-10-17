import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Trash2 } from 'lucide-react'
import { isEmail, isPhone, readImageFile } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Avatar, Badge } from '@/components/ui/display'
import { Button } from '@/components/ui/Button'
import { Input, RadioGroup } from '@/components/ui/form'
import { BottomSheet, Modal } from '@/components/ui/overlay'
import { useAuth } from '@/store/AuthContext'
import { useService } from '@/store/ServiceContext'
import { useToast } from '@/store/ToastContext'

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, deleteAccount } = useAuth()
  const service = useService()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    birthday: user?.birthday ?? '',
    gender: (user?.gender ?? 'undisclosed') as 'male' | 'female' | 'undisclosed',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sheet, setSheet] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <Screen header={<PageHeader title="تعديل الملف الشخصي" backTo="/account" />}>
        <div className="p-6 text-center text-[13px] text-gray-500">يرجى تسجيل الدخول أولًا.</div>
      </Screen>
    )
  }

  const dirty =
    form.name !== user.name ||
    form.email !== user.email ||
    form.phone !== user.phone ||
    form.birthday !== (user.birthday ?? '') ||
    form.gender !== (user.gender ?? 'undisclosed')

  const save = async () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 3) next.name = 'الاسم يجب أن يكون 3 أحرف على الأقل.'
    if (!isEmail(form.email)) next.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    if (!isPhone(form.phone)) next.phone = 'يرجى إدخال رقم جوال صحيح.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const result = await service.updateProfile(user.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      birthday: form.birthday || undefined,
      gender: form.gender,
    })
    setSaving(false)
    if (!result.ok) {
      showToast(result.error ?? 'تعذّر حفظ التغييرات. حاول مرة أخرى.', { type: 'error' })
      return
    }
    showToast('تم حفظ التغييرات بنجاح.', { type: 'success' })
  }

  const changePassword = async () => {
    const next: Record<string, string> = {}
    if (passwords.current !== user.password) next.current = 'كلمة المرور الحالية غير صحيحة.'
    if (passwords.next.length < 6) next.next = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
    if (passwords.next !== passwords.confirm) next.confirm = 'كلمتا المرور غير متطابقتين.'
    setPasswordErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    const result = await service.updateProfile(user.id, { password: passwords.next })
    setSaving(false)
    if (!result.ok) {
      showToast(result.error ?? 'تعذّر تحديث كلمة المرور. حاول مرة أخرى.', { type: 'error' })
      return
    }
    setPasswordOpen(false)
    setPasswords({ current: '', next: '', confirm: '' })
    showToast('تم تحديث كلمة المرور.', { type: 'success' })
  }

  const uploadAvatar = async (file?: File | null) => {
    if (!file) return
    const dataUrl = await readImageFile(file, 400)
    const result = await service.updateProfile(user.id, { avatar: dataUrl })
    if (!result.ok) {
      showToast(result.error ?? 'تعذّر تحديث الصورة الشخصية.', { type: 'error' })
      return
    }
    setSheet(false)
    showToast('تم تحديث الصورة الشخصية.', { type: 'success' })
  }

  return (
    <Screen
      header={
        <PageHeader
          title="تعديل الملف الشخصي"
          backTo="/account"
          actions={dirty ? (
            <Button size="sm" loading={saving} onClick={save}>
              حفظ
            </Button>
          ) : undefined}
        />
      }
    >
      <div className="space-y-4 p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar name={user.name} src={user.avatar} size={88} />
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="absolute -bottom-1 -start-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-white"
            >
              <Camera className="size-4" />
            </button>
          </div>
          {user.avatar && <Badge tone="brand">صورة مخصصة</Badge>}
        </div>

        <Input label="الاسم الكامل" value={form.name} error={errors.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          hint="قد يُطلب تأكيد عند تغيير البريد"
        />
        <Input
          label="رقم الجوال"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <Input
          label="تاريخ الميلاد (اختياري)"
          type="date"
          value={form.birthday}
          onChange={(event) => setForm({ ...form, birthday: event.target.value })}
        />
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-gray-700">الجنس (اختياري)</p>
          <RadioGroup
            direction="row"
            value={form.gender}
            onChange={(value) => setForm({ ...form, gender: value })}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
              { value: 'undisclosed', label: 'تفضل عدم الإفصاح' },
            ]}
          />
        </div>

        <Button variant="outline" fullWidth onClick={() => setPasswordOpen(true)}>
          تغيير كلمة المرور
        </Button>

        <Button
          variant="ghost"
          fullWidth
          className="text-danger"
          icon={<Trash2 className="size-4" />}
          onClick={() => setDeleteOpen(true)}
        >
          حذف الحساب
        </Button>

        <Button variant="primary" fullWidth size="lg" loading={saving} disabled={!dirty} onClick={save}>
          حفظ التغييرات
        </Button>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="صورة الملف الشخصي">
        <div className="space-y-2 pb-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
            <Camera className="size-4 text-gray-500" />
            <span className="text-[13px] font-semibold text-gray-700">التقاط صورة أو اختيار من المعرض</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void uploadAvatar(event.target.files?.[0])}
            />
          </label>
          {user.avatar && (
            <button
              type="button"
              onClick={async () => {
                const result = await service.updateProfile(user.id, { avatar: undefined })
                if (!result.ok) {
                  showToast(result.error ?? 'تعذّر إزالة الصورة.', { type: 'error' })
                  return
                }
                setSheet(false)
                showToast('تم إزالة الصورة.', { type: 'info' })
              }}
              className="w-full rounded-xl border border-gray-200 p-3 text-start text-[13px] font-semibold text-danger"
            >
              إزالة الصورة الحالية
            </button>
          )}
          <Button variant="ghost" fullWidth onClick={() => setSheet(false)}>
            إلغاء
          </Button>
        </div>
      </BottomSheet>

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="تغيير كلمة المرور"
        footer={
          <Button fullWidth onClick={changePassword}>
            تحديث كلمة المرور
          </Button>
        }
      >
        <div className="space-y-3">
          <Input
            label="كلمة المرور الحالية"
            type="password"
            value={passwords.current}
            error={passwordErrors.current}
            onChange={(event) => setPasswords({ ...passwords, current: event.target.value })}
          />
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            value={passwords.next}
            error={passwordErrors.next}
            onChange={(event) => setPasswords({ ...passwords, next: event.target.value })}
          />
          <Input
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            value={passwords.confirm}
            error={passwordErrors.confirm}
            onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف الحساب"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button
              variant="danger"
              fullWidth
              disabled={deleteText.trim() !== 'حذف'}
              onClick={() => {
                deleteAccount()
                setDeleteOpen(false)
                showToast('تم حذف الحساب.', { type: 'success' })
                navigate('/')
              }}
            >
              حذف الحساب نهائيًا
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setDeleteOpen(false)}>
              إلغاء
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-6 text-gray-600">
          هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك نهائيًا.
        </p>
        <div className="mt-3">
          <Input
            label="اكتب 'حذف' للتأكيد"
            value={deleteText}
            onChange={(event) => setDeleteText(event.target.value)}
          />
        </div>
      </Modal>
    </Screen>
  )
}

import { useState } from 'react'
import { KeyRound, LogOut, Mail, Save, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '@/store/AuthContext'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'
import { formatNumber, formatDateTime } from '@/lib/utils'
import { AdminPage, Card, FieldRow, StatCard } from '@/components/admin/AdminUI'
import { Avatar, Badge, Button } from '@/components/ui'
import { Input, PasswordStrengthBar } from '@/components/ui/form'
import { useNavigate } from 'react-router-dom'

export default function AdminProfile() {
  const navigate = useNavigate()
  const { adminUser, updateAdmin, products } = useAppData()
  const { adminLogout } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ name: adminUser.name, email: adminUser.email, phone: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const saveProfile = () => {
    const next: Record<string, string> = {}
    if (form.name.trim().length < 3) next.name = 'يرجى إدخال الاسم الكامل.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'يرجى إدخال بريد إلكتروني صحيح.'
    setErrors(next)
    if (Object.keys(next).length) return
    updateAdmin({ name: form.name.trim(), email: form.email.trim() })
    showToast('تم حفظ بيانات الحساب.', { type: 'success' })
  }

  const changePassword = () => {
    const next: Record<string, string> = {}
    if (passwords.current !== adminUser.password) next.current = 'كلمة المرور الحالية غير صحيحة.'
    if (passwords.next.length < 6) next.next = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.'
    if (passwords.next !== passwords.confirm) next.confirm = 'كلمتا المرور غير متطابقتين.'
    setPasswordErrors(next)
    if (Object.keys(next).length) return
    updateAdmin({ password: passwords.next })
    setPasswords({ current: '', next: '', confirm: '' })
    showToast('تم تغيير كلمة المرور.', { type: 'success' })
  }

  return (
    <AdminPage
      title="الملف الشخصي للإدارة"
      subtitle="بيانات حساب المدير والأمان"
      breadcrumbs={['لوحة الإدارة', 'الملف الشخصي']}
      actions={
        <>
          <Button variant="outline" icon={<LogOut className="size-4" />} onClick={() => adminLogout()}>
            تسجيل الخروج
          </Button>
          <Button icon={<Save className="size-4" />} onClick={saveProfile}>
            حفظ التغييرات
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title="بيانات الحساب">
            <div className="mb-4 flex items-center gap-4">
              <Avatar name={adminUser.name} size={64} />
              <div>
                <p className="text-[15px] font-extrabold text-gray-900">{adminUser.name}</p>
                <p className="text-[12px] text-gray-500">{adminUser.email}</p>
                <Badge tone="brand" className="mt-1">
                  <ShieldCheck className="size-3" /> مدير النظام
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="الاسم الكامل"
                required
                icon={<User className="size-4" />}
                value={form.name}
                error={errors.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                label="البريد الإلكتروني"
                required
                type="email"
                icon={<Mail className="size-4" />}
                value={form.email}
                error={errors.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <Input
                label="رقم الجوال"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
              <Input label="الدور" value="مدير النظام" disabled />
            </div>
          </Card>

          <Card title="تغيير كلمة المرور" actions={<KeyRound className="size-4 text-gray-400" />}>
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
              <PasswordStrengthBar value={passwords.next} />
              <Input
                label="تأكيد كلمة المرور الجديدة"
                type="password"
                value={passwords.confirm}
                error={passwordErrors.confirm}
                onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
              />
              <Button fullWidth icon={<KeyRound className="size-4" />} onClick={changePassword}>
                تحديث كلمة المرور
              </Button>
            </div>
          </Card>

          <Card title="جلسات الأجهزة" subtitle="الأجهزة المسجّل الدخول منها">
            <ul className="space-y-2">
              <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-800">
                    هذا الجهاز <Badge tone="success">الجلسة الحالية</Badge>
                  </p>
                  <p className="text-[11px] text-gray-400">جلسة إدارة نشطة الآن</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="ملخص الحساب">
            <FieldRow label="الدور" value="مدير النظام (Full Access)" />
            <FieldRow label="البريد الحالي" value={adminUser.email} />
            <FieldRow label="عدد الأذونات" value={formatNumber(12)} />
            <FieldRow label="آخر تحديث للبيانات" value={formatDateTime(new Date().toISOString())} />
          </Card>

          <Card title="نشاط سريع">
            <div className="space-y-3">
              <StatCard label="المنتجات المُدارة" value={formatNumber(products.items.length)} />
            </div>
          </Card>

          <Card title="أمان الحساب">
            <ul className="space-y-2 text-[12px] text-gray-600">
              <li className="flex items-center gap-2">✅ كلمة مرور قوية</li>
              <li className="flex items-center gap-2">⚠️ التحقق بخطوتين غير مفعّل</li>
              <li className="flex items-center gap-2">✅ حفظ آمن لبيانات المتجر</li>
            </ul>
            <Button className="mt-3" variant="outline" fullWidth onClick={() => navigate('/admin/settings/technical')}>
              إعدادات الأمان والبيانات
            </Button>
          </Card>
        </div>
      </div>
    </AdminPage>
  )
}

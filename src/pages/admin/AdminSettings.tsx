import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Globe, RotateCcw, Save, Trash2, Truck, Wallet } from 'lucide-react'
import type { PaymentMethodSetting, ShippingMethodSetting, StaticPage } from '@/types'
import { cn, formatNumber, uid } from '@/lib/utils'
import { TEXT_REGISTRY } from '@/lib/i18n'
import { resetAppData } from '@/store/persist'
import { AdminPage, Card, FieldRow, Toolbar } from '@/components/admin/AdminUI'
import { Badge, Button, Chip, EmptyState } from '@/components/ui'
import { Checkbox, Input, Select, Textarea, Toggle } from '@/components/ui/form'
import { ConfirmDialog, Modal } from '@/components/ui/overlay'
import { ImagePicker } from '@/components/ui/ImageUploader'
import { useAppData } from '@/store/AppDataContext'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

const SECTIONS = [
  { slug: 'general', label: 'الإعدادات العامة' },
  { slug: 'brand', label: 'هوية المتجر' },
  { slug: 'currency', label: 'العملة والضرائب' },
  { slug: 'payment', label: 'طرق الدفع' },
  { slug: 'shipping', label: 'الشحن والمدن' },
  { slug: 'pages', label: 'الصفحات' },
  { slug: 'languages', label: 'اللغات' },
  { slug: 'ui', label: 'تخصيص الواجهة' },
  { slug: 'technical', label: 'إعدادات تقنية' },
] as const

const COLOR_PRESETS = [
  { name: 'بنفسجي (الافتراضي في التصميم)', primary: '#7c3aed', secondary: '#2563eb', success: '#16a34a', danger: '#dc2626' },
  { name: 'أزرق تقني', primary: '#2563eb', secondary: '#7c3aed', success: '#16a34a', danger: '#dc2626' },
  { name: 'أخضر متجر', primary: '#059669', secondary: '#0ea5e9', success: '#16a34a', danger: '#dc2626' },
  { name: 'برتقالي حراري', primary: '#ea580c', secondary: '#7c3aed', success: '#16a34a', danger: '#dc2626' },
  { name: 'أسود فخم', primary: '#111827', secondary: '#7c3aed', success: '#16a34a', danger: '#dc2626' },
]

export default function AdminSettings() {
  const params = useParams()
  const section = (params.section ?? 'general') as (typeof SECTIONS)[number]['slug']
  const navigate = useNavigate()
  const { settings, updateSettings, pages, overrides, customers, products, orders, resetAll } = useAppData()
  const { isAuthenticated, expireSessionNow } = useAuth()
  const { showToast } = useToast()

  const [pageDraft, setPageDraft] = useState<Partial<StaticPage> | null>(null)
  const [overrideQuery, setOverrideQuery] = useState('')
  const [cityDraft, setCityDraft] = useState('')
  const [cityFee, setCityFee] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [paymentDraft, setPaymentDraft] = useState<Partial<PaymentMethodSetting> | null>(null)
  const [shippingDraft, setShippingDraft] = useState<Partial<ShippingMethodSetting> | null>(null)

  const activeLabel = SECTIONS.find((item) => item.slug === section)?.label ?? 'الإعدادات'
  const overrideScreens = useMemo(
    () => Array.from(new Set(overrides.items.map((item) => item.screen))),
    [overrides.items],
  )

  const groupedOverrides = useMemo(() => {
    const q = overrideQuery.trim().toLowerCase()
    const items = overrides.items.filter((item) => {
      if (!q) return true
      if (item.screen === overrideQuery) return true
      return (
        item.value.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.screen.toLowerCase().includes(q)
      )
    })
    const screens = Array.from(new Set(items.map((item) => item.screen)))
    return screens.map((screen) => ({ screen, items: items.filter((item) => item.screen === screen) }))
  }, [overrides.items, overrideQuery])

  const paymentKinds = useMemo(
    () => [
      { value: 'cod', label: 'الدفع عند الاستلام' },
      { value: 'card', label: 'بطاقة بنكية' },
      { value: 'wallet', label: 'محفظة إلكترونية' },
      { value: 'bank', label: 'تحويل بنكي' },
    ],
    [],
  )

  return (
    <AdminPage
      title={activeLabel}
      subtitle="جميع التغييرات تُحفظ مباشرة في بيانات المتجر التجريبية"
      breadcrumbs={['لوحة الإدارة', 'الإعدادات', activeLabel]}
      actions={
        <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={() => setResetOpen(true)}>
          استعادة البيانات التجريبية
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <Chip key={item.slug} active={section === item.slug} onClick={() => navigate(`/admin/settings/${item.slug}`)}>
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {section === 'general' && (
            <>
              <Card title="بيانات المتجر">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="اسم المتجر"
                    value={settings.storeName}
                    onChange={(event) => updateSettings({ storeName: event.target.value })}
                  />
                  <Input
                    label="نص الشعار"
                    value={settings.logoText}
                    onChange={(event) => updateSettings({ logoText: event.target.value })}
                  />
                  <Input
                    label="رقم الإصدار"
                    value={settings.version}
                    onChange={(event) => updateSettings({ version: event.target.value })}
                  />
                  <Input
                    label="نص حقوق النشر"
                    value={settings.copyright}
                    onChange={(event) => updateSettings({ copyright: event.target.value })}
                  />
                </div>
              </Card>

              <Card title="شعار المتجر وأيقونة التطبيق" subtitle="تظهر في الشريط العلوي للتطبيق وداخل لوحة الإدارة">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <ImagePicker
                      label="شعار المتجر (PNG/SVG بخلفية شفافة)"
                      aspect="logo"
                      value={settings.logo ?? ''}
                      onChange={(value) => updateSettings({ logo: value || undefined })}
                    />
                    {settings.logo && (
                      <button
                        type="button"
                        className="mt-2 text-[12px] font-bold text-danger"
                        onClick={() => updateSettings({ logo: undefined })}
                      >
                        إزالة الشعار (استخدام النص)
                      </button>
                    )}
                  </div>
                  <div>
                    <ImagePicker
                      label="أيقونة التطبيق Favicon (مربعة 512×512)"
                      aspect="square"
                      value={settings.favicon ?? ''}
                      onChange={(value) => updateSettings({ favicon: value || undefined })}
                    />
                    {settings.favicon && (
                      <button
                        type="button"
                        className="mt-2 text-[12px] font-bold text-danger"
                        onClick={() => updateSettings({ favicon: undefined })}
                      >
                        إزالة الأيقونة
                      </button>
                    )}
                    <p className="mt-2 text-[11.5px] leading-5 text-gray-500">
                      تُطبَّق الأيقونة فورًا على تبويب المتصفح. إن لم ترفع شعارًا سيُعرض النص «{settings.logoText}».
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="معلومات التواصل">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="رقم الهاتف"
                    value={settings.contact.phone}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, phone: event.target.value } })}
                  />
                  <Input
                    label="واتساب"
                    value={settings.contact.whatsapp}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, whatsapp: event.target.value } })}
                  />
                  <Input
                    label="البريد الإلكتروني"
                    value={settings.contact.email}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, email: event.target.value } })}
                  />
                  <Input
                    label="العنوان"
                    value={settings.contact.address}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, address: event.target.value } })}
                  />
                  <Input
                    label="فيسبوك"
                    value={settings.contact.facebook ?? ''}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, facebook: event.target.value } })}
                  />
                  <Input
                    label="إنستغرام"
                    value={settings.contact.instagram ?? ''}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, instagram: event.target.value } })}
                  />
                  <Input
                    label="تويتر / X"
                    value={settings.contact.twitter ?? ''}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, twitter: event.target.value } })}
                  />
                  <Input
                    label="تيك توك"
                    value={settings.contact.tiktok ?? ''}
                    onChange={(event) => updateSettings({ contact: { ...settings.contact, tiktok: event.target.value } })}
                  />
                </div>
              </Card>

              <Card title="البحث الشائع" subtitle="تظهر كاقتراحات في شاشة البحث">
                <Toolbar>
                  <Input
                    placeholder="أضف كلمة بحث شائعة"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    className="h-10 flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (!searchDraft.trim()) return
                      updateSettings({ popularSearches: [...new Set([...settings.popularSearches, searchDraft.trim()])] })
                      setSearchDraft('')
                      showToast('تم إضافة الكلمة.', { type: 'success' })
                    }}
                  >
                    إضافة
                  </Button>
                </Toolbar>
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.popularSearches.map((item) => (
                    <Chip
                      key={item}
                      onRemove={() =>
                        updateSettings({ popularSearches: settings.popularSearches.filter((value) => value !== item) })
                      }
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === 'brand' && (
            <>
              <Card title="ألوان المتجر" subtitle="تُطبَّق فورًا على التطبيق ولوحة الإدارة">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(['primary', 'secondary', 'success', 'danger'] as const).map((key) => (
                    <div key={key}>
                      <p className="mb-1.5 text-[12px] font-semibold text-gray-700">
                        {key === 'primary' ? 'اللون الأساسي' : key === 'secondary' ? 'اللون الثانوي' : key === 'success' ? 'النجاح' : 'الخطر'}
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.colors[key]}
                          onChange={(event) => updateSettings({ colors: { ...settings.colors, [key]: event.target.value } })}
                          className="size-10 cursor-pointer rounded-xl border border-gray-200"
                        />
                        <Input
                          value={settings.colors[key]}
                          onChange={(event) => updateSettings({ colors: { ...settings.colors, [key]: event.target.value } })}
                          className="h-10 flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="أنظمة ألوان جاهزة">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {COLOR_PRESETS.map((preset) => {
                    const active = settings.colors.primary.toLowerCase() === preset.primary.toLowerCase()
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          updateSettings({
                            colors: { primary: preset.primary, secondary: preset.secondary, success: preset.success, danger: preset.danger },
                          })
                        }
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3 text-start transition-all',
                          active ? 'border-brand bg-brand-soft' : 'border-gray-200 hover:border-gray-300',
                        )}
                      >
                        <span className="flex gap-1">
                          {[preset.primary, preset.secondary, preset.success, preset.danger].map((color) => (
                            <span key={color} className="size-5 rounded-full" style={{ background: color }} />
                          ))}
                        </span>
                        <span className="flex-1 text-[12.5px] font-semibold text-gray-700">{preset.name}</span>
                        {active && <Check className="size-4 text-brand" />}
                      </button>
                    )
                  })}
                </div>
              </Card>

              <Card title="معاينة الهوية">
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 p-4">
                  <span
                    className="flex size-12 items-center justify-center rounded-2xl text-[20px] font-extrabold text-white"
                    style={{ background: settings.colors.primary }}
                  >
                    {settings.logoText.slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-[15px] font-extrabold text-gray-900">{settings.storeName}</p>
                    <p className="text-[12px] text-gray-500">{settings.copyright}</p>
                  </div>
                  <span className="ms-auto flex gap-2">
                    <Badge tone="brand">أساسي</Badge>
                    <span className="h-6 w-16 rounded-lg" style={{ background: settings.colors.primary }} />
                    <span className="h-6 w-16 rounded-lg" style={{ background: settings.colors.secondary }} />
                  </span>
                </div>
              </Card>
            </>
          )}

          {section === 'currency' && (
            <>
              <Card title="العملة">
                <Toolbar>
                  <Select
                    value={settings.currency}
                    onChange={(event) => updateSettings({ currency: event.target.value })}
                    options={[
                      { value: 'ر.س', label: 'ريال سعودي (ر.س)' },
                      { value: 'AED', label: 'درهم إماراتي (AED)' },
                      { value: 'KWD', label: 'دينار كويتي (KWD)' },
                      { value: 'EGP', label: 'جنيه مصري (EGP)' },
                      { value: '$', label: 'دولار أمريكي ($)' },
                    ]}
                    className="h-11 w-56"
                  />
                  <Input
                    label="رمز مخصص"
                    value={settings.currency}
                    onChange={(event) => updateSettings({ currency: event.target.value })}
                    wrapperClassName="w-40"
                  />
                </Toolbar>
                <p className="mt-3 text-[12px] text-gray-500">
                  عملة العرض الحالية: <strong>{settings.currency}</strong> — تُستخدم في كل شاشات التطبيق.
                </p>
              </Card>

              <Card title="الضريبة (VAT)">
                <div className="space-y-3">
                  <Toggle
                    checked={settings.tax.enabled}
                    onChange={(checked) => updateSettings({ tax: { ...settings.tax, enabled: checked } })}
                    label="تفعيل الضريبة"
                  />
                  <Input
                    label="نسبة الضريبة %"
                    type="number"
                    value={String(settings.tax.rate)}
                    onChange={(event) => updateSettings({ tax: { ...settings.tax, rate: Number(event.target.value) } })}
                  />
                  <Checkbox
                    checked={settings.tax.inclusive}
                    onChange={(checked) => updateSettings({ tax: { ...settings.tax, inclusive: checked } })}
                    label="الأسعار تشمل الضريبة (Inclusive)"
                  />
                </div>
              </Card>

              <Card title="رسوم الدفع عند الاستلام">
                <Input
                  label={`رسوم إضافية (${settings.currency})`}
                  type="number"
                  value={String(settings.codFee)}
                  onChange={(event) => updateSettings({ codFee: Number(event.target.value) })}
                />
                <p className="mt-2 text-[11.5px] text-gray-500">
                  تُضاف هذه الرسوم تلقائيًا على الطلبات التي تُدفع عند الاستلام.
                </p>
              </Card>
            </>
          )}

          {section === 'payment' && (
            <Card
              title="طرق الدفع"
              subtitle={`${settings.paymentMethods.filter((method) => method.enabled).length} طريقة مفعّلة`}
              actions={<Wallet className="size-4 text-gray-400" />}
            >
              <ul className="space-y-3">
                {settings.paymentMethods.map((method) => (
                  <li key={method.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-40 flex-1">
                        <Input
                          value={method.name}
                          onChange={(event) =>
                            updateSettings({
                              paymentMethods: settings.paymentMethods.map((item) =>
                                item.id === method.id ? { ...item, name: event.target.value } : item,
                              ),
                            })
                          }
                          className="h-10"
                        />
                      </div>
                      <Input
                        type="number"
                        value={String(method.extraFee ?? 0)}
                        onChange={(event) =>
                          updateSettings({
                            paymentMethods: settings.paymentMethods.map((item) =>
                              item.id === method.id ? { ...item, extraFee: Number(event.target.value) } : item,
                            ),
                          })
                        }
                        className="h-10 w-28"
                        placeholder="رسوم"
                      />
                      <Toggle
                        checked={method.enabled}
                        onChange={(checked) =>
                          updateSettings({
                            paymentMethods: settings.paymentMethods.map((item) =>
                              item.id === method.id ? { ...item, enabled: checked } : item,
                            ),
                          })
                        }
                        label=""
                      />
                      <Button size="xs" variant="ghost" onClick={() => setPaymentDraft(method)}>
                        تفاصيل
                      </Button>
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-gray-400">
                      {method.description || '—'} • النوع:{' '}
                      {paymentKinds.find((kind) => kind.value === method.kind)?.label ?? method.kind}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === 'shipping' && (
            <>
              <Card title="إعدادات الشحن" actions={<Truck className="size-4 text-gray-400" />}>
                <Input
                  label={`الشحن المجاني للطلبات فوق (${settings.currency})`}
                  type="number"
                  value={String(settings.shipping.freeOver)}
                  onChange={(event) => updateSettings({ shipping: { ...settings.shipping, freeOver: Number(event.target.value) } })}
                />
              </Card>

              <Card title="طرق الشحن">
                <ul className="space-y-3">
                  {settings.shipping.methods.map((method) => (
                    <li key={method.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
                      <Input
                        value={method.name}
                        onChange={(event) =>
                          updateSettings({
                            shipping: {
                              ...settings.shipping,
                              methods: settings.shipping.methods.map((item) =>
                                item.id === method.id ? { ...item, name: event.target.value } : item,
                              ),
                            },
                          })
                        }
                        className="h-10 min-w-36 flex-1"
                      />
                      <Input
                        type="number"
                        value={String(method.fee)}
                        onChange={(event) =>
                          updateSettings({
                            shipping: {
                              ...settings.shipping,
                              methods: settings.shipping.methods.map((item) =>
                                item.id === method.id ? { ...item, fee: Number(event.target.value) } : item,
                              ),
                            },
                          })
                        }
                        className="h-10 w-24"
                        placeholder="الرسوم"
                      />
                      <Input
                        value={method.eta ?? ''}
                        onChange={(event) =>
                          updateSettings({
                            shipping: {
                              ...settings.shipping,
                              methods: settings.shipping.methods.map((item) =>
                                item.id === method.id ? { ...item, eta: event.target.value } : item,
                              ),
                            },
                          })
                        }
                        className="h-10 w-32"
                        placeholder="٢-٤ أيام"
                      />
                      <Toggle
                        checked={method.enabled}
                        onChange={(checked) =>
                          updateSettings({
                            shipping: {
                              ...settings.shipping,
                              methods: settings.shipping.methods.map((item) =>
                                item.id === method.id ? { ...item, enabled: checked } : item,
                              ),
                            },
                          })
                        }
                        label=""
                      />
                      <Button size="xs" variant="ghost" onClick={() => setShippingDraft(method)}>
                        ملاحظات
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="المدن المتاحة">
                <Toolbar>
                  <Input
                    placeholder="اسم المدينة"
                    value={cityDraft}
                    onChange={(event) => setCityDraft(event.target.value)}
                    className="h-10 flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="رسوم خاصة"
                    value={cityFee}
                    onChange={(event) => setCityFee(event.target.value)}
                    className="h-10 w-32"
                  />
                  <Button
                    onClick={() => {
                      if (!cityDraft.trim()) {
                        showToast('يرجى إدخال اسم المدينة.', { type: 'error' })
                        return
                      }
                      updateSettings({
                        cities: [...settings.cities, { id: uid('city'), name: cityDraft.trim(), fee: cityFee ? Number(cityFee) : undefined }],
                      })
                      setCityDraft('')
                      setCityFee('')
                      showToast('تم إضافة المدينة.', { type: 'success' })
                    }}
                  >
                    إضافة مدينة
                  </Button>
                </Toolbar>
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.cities.map((city) => (
                    <Chip
                      key={city.id}
                      onRemove={() => updateSettings({ cities: settings.cities.filter((item) => item.id !== city.id) })}
                    >
                      {city.name}
                      {city.fee !== undefined ? ` (${city.fee})` : ''}
                    </Chip>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === 'pages' && (
            <Card
              title="الصفحات الثابتة"
              subtitle="من نحن، السياسات، الشروط..."
              actions={
                <Button size="sm" variant="outline" onClick={() => setPageDraft({ title: '', slug: '', content: '', active: true })}>
                  صفحة جديدة
                </Button>
              }
              padded={false}
            >
              <ul className="divide-y divide-gray-100">
                {pages.items.map((page) => (
                  <li key={page.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-40 flex-1">
                      <p className="text-[13px] font-bold text-gray-800">
                        {page.title} {!page.active && <Badge tone="gray">معطلة</Badge>}
                      </p>
                      <p className="text-[11px] text-gray-400">/pages/{page.slug}</p>
                    </div>
                    <span className="line-clamp-1 max-w-64 text-[11.5px] text-gray-500">{page.content}</span>
                    <Button size="xs" variant="ghost" onClick={() => setPageDraft(page)}>
                      تعديل
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-danger"
                      icon={<Trash2 className="size-3.5" />}
                      onClick={() => {
                        pages.remove(page.id)
                        showToast('تم حذف الصفحة.', { type: 'success' })
                      }}
                    >
                      حذف
                    </Button>
                  </li>
                ))}
                {pages.items.length === 0 && <EmptyState title="لا توجد صفحات" className="py-12" />}
              </ul>
            </Card>
          )}

          {section === 'languages' && (
            <>
              <Card title="اللغات" subtitle="اللغة الثانية هي الإنجليزية بحسب ملاحظات التصميم" actions={<Globe className="size-4 text-gray-400" />}>
                <ul className="space-y-3">
                  {settings.languages.map((language) => (
                    <li key={language.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
                      <div className="min-w-32 flex-1">
                        <p className="text-[13px] font-bold text-gray-800">{language.name}</p>
                        <p className="text-[11px] text-gray-400">الرمز: {language.code}</p>
                      </div>
                      {language.isDefault ? (
                        <Badge tone="brand">الافتراضية</Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            updateSettings({
                              defaultLanguage: language.code,
                              languages: settings.languages.map((item) => ({ ...item, isDefault: item.code === language.code })),
                            })
                          }
                        >
                          تعيين كافتراضية
                        </Button>
                      )}
                      <Toggle
                        checked={language.active}
                        onChange={(checked) =>
                          updateSettings({
                            languages: settings.languages.map((item) =>
                              item.code === language.code ? { ...item, active: checked } : item,
                            ),
                          })
                        }
                        label=""
                      />
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="الترجمة">
                <FieldRow
                  label="عدد النصوص القابلة للتعديل"
                  value={`${formatNumber(overrides.items.length)} نص — يمكن تعديلها من قسم «تخصيص الواجهة»`}
                />
                <p className="mt-2 text-[11.5px] leading-5 text-gray-500">
                  عند اختيار اللغة الإنجليزية تُستخدم الترجمة المدمجة، وعند غياب أي نص يرجع التطبيق للعربية تلقائيًا.
                </p>
              </Card>
            </>
          )}

          {section === 'ui' && (
            <>
              <Card
                title="نصوص الواجهة (Overrides)"
                subtitle="كل نصوص التطبيق مجمعة حسب الشاشة — التعديل فوري"
                padded={false}
              >
                <div className="space-y-3 p-4">
                  <Input
                    placeholder="ابحث عن نص أو مفتاح أو شاشة..."
                    value={overrideQuery}
                    onChange={(event) => setOverrideQuery(event.target.value)}
                    className="h-10"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Chip active={!overrideQuery} onClick={() => setOverrideQuery('')}>
                      كل النصوص ({formatNumber(overrides.items.length)})
                    </Chip>
                    {overrideScreens.map((screen) => (
                      <Chip key={screen} active={overrideQuery === screen} onClick={() => setOverrideQuery(screen)}>
                        {screen}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="thin-scroll max-h-[460px] space-y-4 overflow-y-auto border-t border-gray-100 p-4">
                  {groupedOverrides.map((group) => (
                    <div key={group.screen}>
                      <p className="mb-2 flex items-center gap-2 text-[12.5px] font-extrabold text-gray-800">
                        {group.screen}
                        <Badge tone="gray">{formatNumber(group.items.length)}</Badge>
                      </p>
                      <div className="space-y-2">
                        {group.items.map((override) => (
                          <div key={override.key} className="rounded-xl border border-gray-200 p-3">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <p className="text-[12px] font-semibold text-gray-700">{override.label}</p>
                              <button
                                type="button"
                                className="text-[11px] font-bold text-brand"
                                onClick={() => {
                                  const seed = TEXT_REGISTRY.find((entry) => entry.key === override.key)
                                  if (seed) overrides.update(override.key, { value: seed.value })
                                  showToast('تمت استعادة النص الأصلي.', { type: 'success' })
                                }}
                              >
                                استعادة الأصلي
                              </button>
                            </div>
                            <Input
                              value={override.value}
                              onChange={(event) => overrides.update(override.key, { value: event.target.value })}
                              className="h-10"
                            />
                            <p className="mt-1 text-[10.5px] text-gray-400">{override.key}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {groupedOverrides.length === 0 && <p className="py-8 text-center text-[12.5px] text-gray-400">لا توجد نتائج.</p>}
                </div>
                <div className="border-t border-gray-100 p-4">
                  <Button
                    variant="outline"
                    icon={<Save className="size-4" />}
                    onClick={() => showToast('تُحفظ النصوص تلقائيًا أثناء الكتابة.', { type: 'success' })}
                  >
                    النصوص محفوظة تلقائيًا
                  </Button>
                </div>
              </Card>

              <Card title="ترتيب أقسام الصفحة الرئيسية">
                <p className="text-[12.5px] leading-6 text-gray-600">
                  يمكنك التحكم في ترتيب الأقسام وإظهارها من صفحة{' '}
                  <button type="button" className="font-bold text-brand" onClick={() => navigate('/admin/banners')}>
                    البانرات والأقسام
                  </button>
                  .
                </p>
                <ul className="mt-3 space-y-2">
                  {[...settings.sections]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <li key={item.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                        <span className="text-[12.5px] font-semibold text-gray-700">
                          {item.order}. {item.title}
                        </span>
                        <Badge tone={item.enabled ? 'success' : 'gray'}>{item.enabled ? 'ظاهر' : 'مخفي'}</Badge>
                      </li>
                    ))}
                </ul>
              </Card>
            </>
          )}

          {section === 'technical' && (
            <>
              <Card title="إعدادات تقنية">
                <div className="space-y-4">
                  <Toggle
                    checked={settings.technical.maintenanceMode}
                    onChange={(checked) => updateSettings({ technical: { ...settings.technical, maintenanceMode: checked } })}
                    label="وضع الصيانة"
                    hint="يظهر للعملاء شاشة «نعود قريبًا» بدلًا من المتجر"
                  />
                  <Toggle
                    checked={settings.technical.enableReviews}
                    onChange={(checked) => updateSettings({ technical: { ...settings.technical, enableReviews: checked } })}
                    label="السماح بمراجعات المنتجات"
                  />
                  <Input
                    label="رقم الدعم الفني"
                    value={settings.technical.supportPhone}
                    onChange={(event) => updateSettings({ technical: { ...settings.technical, supportPhone: event.target.value } })}
                  />
                  <Input
                    label="معرّف التحليلات (Analytics ID)"
                    value={settings.technical.analyticsId ?? ''}
                    onChange={(event) => updateSettings({ technical: { ...settings.technical, analyticsId: event.target.value } })}
                    placeholder="G-XXXXXXX"
                  />
                  <Input
                    label="حد تنبيه المخزون المنخفض"
                    type="number"
                    value={String(settings.lowStockThreshold)}
                    onChange={(event) => updateSettings({ lowStockThreshold: Number(event.target.value) })}
                  />
                </div>
              </Card>

              <Card title="اختبار حالات الواجهة">
                <p className="mb-3 text-[12.5px] leading-6 text-gray-600">
                  لمعاينة حالة «انتهت الجلسة» في تطبيق العميل (القسم 33.2 من الوثيقة) يمكن إنهاء جلسة العميل الحالية
                  فورًا ثم فتح المتجر.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!isAuthenticated) {
                        showToast('لا يوجد عميل مسجّل دخول حاليًا.', { type: 'warning' })
                        return
                      }
                      expireSessionNow()
                      showToast('تم إنهاء الجلسة — افتح المتجر لرؤية التنبيه.', { type: 'success' })
                    }}
                  >
                    محاكاة انتهاء جلسة العميل
                  </Button>
                  <Button variant="ghost" onClick={() => window.open('/', '_blank')}>
                    فتح المتجر
                  </Button>
                </div>
              </Card>

              <Card title="بيانات المتجر" subtitle="حجم البيانات التجريبية المحفوظة محليًا">
                <FieldRow label="المنتجات" value={formatNumber(products.items.length)} />
                <FieldRow label="الطلبات" value={formatNumber(orders.items.length)} />
                <FieldRow label="العملاء" value={formatNumber(customers.items.length)} />
                <FieldRow label="الصفحات" value={formatNumber(pages.items.length)} />
                <FieldRow label="النصوص المعدّلة" value={formatNumber(overrides.items.length)} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetAll()
                      showToast('تم إرجاع البيانات لحالتها الأصلية.', { type: 'success' })
                    }}
                  >
                    إعادة تعيين البيانات (بدون إعادة تحميل)
                  </Button>
                  <Button variant="danger" onClick={() => setResetOpen(true)}>
                    مسح كل البيانات وإعادة التحميل
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-4">
          <Card title="ملخص الإعدادات">
            <FieldRow label="اسم المتجر" value={settings.storeName} />
            <FieldRow label="العملة" value={settings.currency} />
            <FieldRow label="اللغة الافتراضية" value={settings.defaultLanguage === 'ar' ? 'العربية' : 'English'} />
            <FieldRow label="الضريبة" value={settings.tax.enabled ? `${settings.tax.rate}%` : 'معطلة'} />
            <FieldRow label="طرق الدفع المفعّلة" value={`${settings.paymentMethods.filter((method) => method.enabled).length}`} />
            <FieldRow label="طرق الشحن المفعّلة" value={`${settings.shipping.methods.filter((method) => method.enabled).length}`} />
            <FieldRow label="المدن" value={`${settings.cities.length}`} />
            <FieldRow label="وضع الصيانة" value={settings.technical.maintenanceMode ? 'مفعّل' : 'معطّل'} />
          </Card>

          <Card title="اللون الأساسي الحالي">
            <div className="flex items-center gap-3">
              <span className="size-12 rounded-2xl border border-gray-200" style={{ background: settings.colors.primary }} />
              <div>
                <p className="text-[13px] font-bold text-gray-800">{settings.colors.primary}</p>
                <p className="text-[11.5px] text-gray-500">يُطبَّق على الأزرار والعناصر المميزة</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={Boolean(pageDraft)}
        onClose={() => setPageDraft(null)}
        title={pageDraft?.id ? 'تعديل الصفحة' : 'إضافة صفحة'}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button
              fullWidth
              onClick={() => {
                if (!pageDraft) return
                if (!pageDraft.title?.trim() || !pageDraft.slug?.trim()) {
                  showToast('يرجى إدخال عنوان الصفحة والرابط.', { type: 'error' })
                  return
                }
                const payload = {
                  title: pageDraft.title.trim(),
                  slug: pageDraft.slug.trim().replace(/\s+/g, '-').toLowerCase(),
                  content: pageDraft.content ?? '',
                  active: pageDraft.active ?? true,
                }
                if (pageDraft.id) {
                  pages.update(pageDraft.id, payload)
                  showToast('تم تحديث الصفحة.', { type: 'success' })
                } else {
                  pages.add({ id: uid('pg'), ...payload })
                  showToast('تم إضافة الصفحة.', { type: 'success' })
                }
                setPageDraft(null)
              }}
            >
              حفظ الصفحة
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setPageDraft(null)}>
              إلغاء
            </Button>
          </div>
        }
      >
        {pageDraft && (
          <div className="space-y-3">
            <Input
              label="عنوان الصفحة"
              required
              value={pageDraft.title ?? ''}
              onChange={(event) => setPageDraft({ ...pageDraft, title: event.target.value })}
            />
            <Input
              label="الرابط (Slug)"
              required
              value={pageDraft.slug ?? ''}
              onChange={(event) => setPageDraft({ ...pageDraft, slug: event.target.value })}
              hint="مثال: about — سيظهر على /pages/about"
            />
            <Textarea
              label="المحتوى"
              rows={8}
              value={pageDraft.content ?? ''}
              onChange={(event) => setPageDraft({ ...pageDraft, content: event.target.value })}
              hint="يدعم **عريض** و *مائل* والقوائم التي تبدأ بـ -"
            />
            <Toggle
              checked={pageDraft.active ?? true}
              onChange={(checked) => setPageDraft({ ...pageDraft, active: checked })}
              label="الصفحة مفعّلة"
            />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(paymentDraft)}
        onClose={() => setPaymentDraft(null)}
        title="تفاصيل طريقة الدفع"
        size="md"
        footer={
          <Button
            fullWidth
            onClick={() => {
              if (!paymentDraft) return
              updateSettings({
                paymentMethods: settings.paymentMethods.map((item) => (item.id === paymentDraft.id ? { ...item, ...paymentDraft } : item)),
              })
              setPaymentDraft(null)
              showToast('تم حفظ تفاصيل طريقة الدفع.', { type: 'success' })
            }}
          >
            حفظ
          </Button>
        }
      >
        {paymentDraft && (
          <div className="space-y-3">
            <Input
              label="الوصف"
              value={paymentDraft.description ?? ''}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, description: event.target.value })}
            />
            {paymentDraft.kind === 'bank' && (
              <Textarea
                label="بيانات الحساب البنكي"
                rows={3}
                value={paymentDraft.bankDetails ?? ''}
                onChange={(event) => setPaymentDraft({ ...paymentDraft, bankDetails: event.target.value })}
              />
            )}
            <Textarea
              label="تعليمات للعميل"
              rows={2}
              value={paymentDraft.instructions ?? ''}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, instructions: event.target.value })}
            />
            <Select
              label="نوع طريقة الدفع"
              value={paymentDraft.kind ?? 'cod'}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, kind: event.target.value as PaymentMethodSetting['kind'] })}
              options={paymentKinds}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(shippingDraft)}
        onClose={() => setShippingDraft(null)}
        title="تفاصيل طريقة الشحن"
        size="sm"
        footer={
          <Button
            fullWidth
            onClick={() => {
              if (!shippingDraft) return
              updateSettings({
                shipping: {
                  ...settings.shipping,
                  methods: settings.shipping.methods.map((item) =>
                    item.id === shippingDraft.id ? { ...item, ...shippingDraft } : item,
                  ),
                },
              })
              setShippingDraft(null)
              showToast('تم الحفظ.', { type: 'success' })
            }}
          >
            حفظ
          </Button>
        }
      >
        {shippingDraft && (
          <div className="space-y-3">
            <Input
              label="مدة التوصيل المتوقعة"
              value={shippingDraft.eta ?? ''}
              onChange={(event) => setShippingDraft({ ...shippingDraft, eta: event.target.value })}
              placeholder="٢-٤ أيام عمل"
            />
            <Input
              label="الرسوم"
              type="number"
              value={String(shippingDraft.fee ?? 0)}
              onChange={(event) => setShippingDraft({ ...shippingDraft, fee: Number(event.target.value) })}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        title="استعادة البيانات التجريبية"
        message="سيتم حذف كل التعديلات والطلبات والبيانات المحفوظة محليًا والعودة لبيانات البداية."
        confirmLabel="استعادة"
        danger
        onCancel={() => setResetOpen(false)}
        onConfirm={resetAppData}
      />
    </AdminPage>
  )
}

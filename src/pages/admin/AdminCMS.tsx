import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Blocks,
  FileText,
  Globe2,
  LayoutTemplate,
  Link2,
  Palette,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  Type,
} from 'lucide-react'
import type { FooterLink, HomeSection, StaticPage, StoreNavIcon, StoreNavigationItem } from '@/types'
import { AdminPage, Card, StatCard } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, Select, Textarea, Toggle } from '@/components/ui/form'
import { Modal } from '@/components/ui/overlay'
import { ImagePicker } from '@/components/ui/ImageUploader'
import { uid } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: Blocks },
  { id: 'pages', label: 'الصفحات', icon: FileText },
  { id: 'home', label: 'الصفحة الرئيسية', icon: LayoutTemplate },
  { id: 'navigation', label: 'التنقل والروابط', icon: Link2 },
  { id: 'appearance', label: 'الهوية والإعلان', icon: Palette },
  { id: 'content', label: 'نصوص الواجهة', icon: Type },
] as const

type TabId = (typeof TABS)[number]['id']

const PATH_PRESETS = [
  { value: '/', label: 'الرئيسية' },
  { value: '/categories', label: 'الأقسام' },
  { value: '/search', label: 'البحث' },
  { value: '/offers', label: 'العروض' },
  { value: '/cart', label: 'السلة' },
  { value: '/orders', label: 'طلباتي' },
  { value: '/wishlist', label: 'المفضلة' },
  { value: '/account', label: 'حسابي' },
]

const ICON_OPTIONS: Array<{ value: StoreNavIcon; label: string }> = [
  { value: 'home', label: 'الرئيسية' },
  { value: 'categories', label: 'الأقسام' },
  { value: 'offers', label: 'العروض' },
  { value: 'orders', label: 'الطلبات' },
  { value: 'account', label: 'الحساب' },
  { value: 'search', label: 'البحث' },
  { value: 'custom', label: 'أيقونة عامة' },
]

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06ff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function pathOptions(pages: StaticPage[]) {
  return [
    ...PATH_PRESETS,
    ...pages.map((page) => ({ value: `/pages/${page.slug}`, label: `صفحة: ${page.title}` })),
  ].filter((option, index, list) => list.findIndex((item) => item.value === option.value) === index)
}

export default function AdminCMS() {
  const { settings, updateSettings, pages, overrides, categories, products } = useAppData()
  const [tab, setTab] = useState<TabId>('overview')
  const [notice, setNotice] = useState('')
  const [pageDraft, setPageDraft] = useState<StaticPage | null>(null)
  const [sectionDraft, setSectionDraft] = useState<HomeSection | null>(null)
  const [sectionCategories, setSectionCategories] = useState<string[]>([])
  const [manualProducts, setManualProducts] = useState<string[]>([])
  const [useManualProducts, setUseManualProducts] = useState(false)
  const [navDraft, setNavDraft] = useState<StoreNavigationItem | null>(null)
  const [footerDraft, setFooterDraft] = useState<FooterLink | null>(null)
  const [searchText, setSearchText] = useState('')

  const sortedSections = useMemo(
    () => [...settings.sections].sort((a, b) => a.order - b.order),
    [settings.sections],
  )
  const activeCategories = useMemo(
    () => categories.items.filter((category) => category.active).sort((a, b) => a.order - b.order),
    [categories.items],
  )
  const availableProducts = useMemo(
    () => products.items.filter((product) => product.status === 'published').sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [products.items],
  )
  const pathChoices = useMemo(() => pathOptions(pages.items), [pages.items])

  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  const openPage = (page?: StaticPage) => {
    setPageDraft(page ? { ...page } : {
      id: '', slug: '', title: '', content: '', active: true, seoTitle: '', seoDescription: '',
    })
  }

  const savePage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!pageDraft) return
    const title = pageDraft.title.trim()
    const slug = slugify(pageDraft.slug || title)
    if (!title || !slug) return announce('أدخل عنوانًا ورابطًا صالحًا للصفحة.')
    const duplicate = pages.items.some((page) => page.slug === slug && page.id !== pageDraft.id)
    if (duplicate) return announce('هذا الرابط مستخدم بالفعل؛ اختر رابطًا مختلفًا.')
    const value: StaticPage = {
      ...pageDraft,
      id: pageDraft.id || uid('page'),
      title,
      slug,
      content: pageDraft.content.trim(),
      seoTitle: pageDraft.seoTitle?.trim() || title,
      seoDescription: pageDraft.seoDescription?.trim() || '',
    }
    const existing = pages.items.some((page) => page.id === value.id)
    if (existing) pages.update(value.id, value)
    else pages.add(value)
    setPageDraft(null)
    announce(existing ? 'تم تحديث الصفحة.' : 'تم إنشاء الصفحة.')
  }

  const deletePage = (page: StaticPage) => {
    if (!window.confirm(`حذف صفحة «${page.title}»؟`)) return
    pages.remove(page.id)
    updateSettings({ footerLinks: (settings.footerLinks ?? []).filter((link) => link.path !== `/pages/${page.slug}`) })
    announce('تم حذف الصفحة وروابطها من التذييل.')
  }

  const openSection = (section?: HomeSection) => {
    const draft = section ? { ...section, filter: { ...section.filter } } : {
      id: uid('sec'), kind: 'custom' as const, title: '', layout: 'row' as const,
      enabled: true, order: sortedSections.length + 1, limit: 8, filter: {},
    }
    setSectionDraft(draft)
    setSectionCategories(draft.filter?.categoryIds ?? [])
    setManualProducts(draft.productIds ?? [])
    setUseManualProducts(Boolean(draft.productIds?.length))
  }

  const saveSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sectionDraft?.title.trim()) return announce('أدخل عنوان القسم أولًا.')
    if (useManualProducts && manualProducts.length === 0) return announce('اختر منتجًا واحدًا على الأقل لهذا القسم.')
    const nextSection: HomeSection = {
      ...sectionDraft,
      title: sectionDraft.title.trim(),
      order: sectionDraft.order || sortedSections.length + 1,
      limit: Math.min(24, Math.max(1, Number(sectionDraft.limit) || 8)),
      filter: {
        ...sectionDraft.filter,
        categoryIds: sectionCategories.length ? sectionCategories : undefined,
      },
      productIds: useManualProducts ? manualProducts : undefined,
    }
    const exists = settings.sections.some((section) => section.id === nextSection.id)
    const next = exists
      ? settings.sections.map((section) => section.id === nextSection.id ? nextSection : section)
      : [...settings.sections, nextSection]
    updateSettings({ sections: next.map((section, index) => ({ ...section, order: index + 1 })) })
    setSectionDraft(null)
    announce(exists ? 'تم تحديث القسم الرئيسي.' : 'تمت إضافة القسم الرئيسي.')
  }

  const reorderSection = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= sortedSections.length) return
    const next = [...sortedSections]
    const [moving] = next.splice(index, 1)
    next.splice(target, 0, moving)
    updateSettings({ sections: next.map((section, position) => ({ ...section, order: position + 1 })) })
  }

  const removeSection = (section: HomeSection) => {
    if (!window.confirm(`إزالة قسم «${section.title}» من الصفحة الرئيسية؟`)) return
    updateSettings({ sections: sortedSections.filter((item) => item.id !== section.id).map((item, index) => ({ ...item, order: index + 1 })) })
    announce('تمت إزالة القسم من الصفحة الرئيسية.')
  }

  const openNav = (item?: StoreNavigationItem) => setNavDraft(item ? { ...item } : {
    id: uid('nav'), label: '', path: '/categories', icon: 'categories', enabled: true,
  })

  const saveNav = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!navDraft?.label.trim() || !navDraft.path.startsWith('/')) return announce('أدخل اسمًا ومسارًا داخليًا صالحًا.')
    if (navDraft.path.startsWith('/admin')) return announce('لا يمكن إضافة مسار لوحة الإدارة إلى واجهة المتجر.')
    const next = settings.navigationItems ?? []
    const exists = next.some((item) => item.id === navDraft.id)
    updateSettings({ navigationItems: exists ? next.map((item) => item.id === navDraft.id ? { ...navDraft, label: navDraft.label.trim() } : item) : [...next, { ...navDraft, label: navDraft.label.trim() }] })
    setNavDraft(null)
    announce(exists ? 'تم تحديث رابط التنقل.' : 'تمت إضافة رابط التنقل.')
  }

  const openFooterLink = (link?: FooterLink) => setFooterDraft(link ? { ...link } : {
    id: uid('footer'), label: '', path: '/pages/about', enabled: true,
  })

  const saveFooterLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!footerDraft?.label.trim() || !footerDraft.path.startsWith('/')) return announce('أدخل اسم الرابط ومساره.')
    const next = settings.footerLinks ?? []
    const exists = next.some((item) => item.id === footerDraft.id)
    updateSettings({ footerLinks: exists ? next.map((item) => item.id === footerDraft.id ? { ...footerDraft, label: footerDraft.label.trim() } : item) : [...next, { ...footerDraft, label: footerDraft.label.trim() }] })
    setFooterDraft(null)
    announce(exists ? 'تم تحديث رابط التذييل.' : 'تمت إضافة رابط التذييل.')
  }

  const changeColor = (key: keyof typeof settings.colors, value: string) => {
    updateSettings({ colors: { ...settings.colors, [key]: value } })
  }

  const filteredOverrides = overrides.items.filter((item) => {
    const query = searchText.trim().toLowerCase()
    return !query || `${item.label} ${item.screen} ${item.key}`.toLowerCase().includes(query)
  })

  return (
    <AdminPage
      title="مركز إدارة المحتوى"
      subtitle="أدر صفحات المتجر وأقسامه وروابطه ومظهره ونصوصه من مكان واحد."
      actions={<Button size="sm" variant="outline" icon={<Settings2 className="size-4" />} onClick={() => window.location.assign('/admin/settings/general')}>إعدادات المتجر</Button>}
    >
      {notice && <div role="status" className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-[13px] font-semibold text-success">{notice}</div>}

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-bold transition-colors ${tab === id ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="صفحات المتجر" value={`${pages.items.length}`} icon={<FileText className="size-4" />} onClick={() => setTab('pages')} hint={`${pages.items.filter((page) => page.active).length} منشورة`} />
            <StatCard label="أقسام الرئيسية" value={`${settings.sections.length}`} icon={<LayoutTemplate className="size-4" />} onClick={() => setTab('home')} hint={`${settings.sections.filter((section) => section.enabled).length} ظاهرة`} />
            <StatCard label="روابط التنقل" value={`${(settings.navigationItems ?? []).filter((item) => item.enabled).length}`} icon={<Link2 className="size-4" />} onClick={() => setTab('navigation')} hint="في واجهة المتجر" />
            <StatCard label="نصوص قابلة للتعديل" value={`${overrides.items.length}`} icon={<Type className="size-4" />} onClick={() => setTab('content')} hint="رسائل وعناوين الواجهة" />
          </div>
          <Card title="مساحة إدارة المتجر" subtitle="تنعكس التغييرات مباشرة على واجهة المتجر وتحفظ تلقائيًا على هذا الجهاز.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TABS.filter((item) => item.id !== 'overview').map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setTab(id)} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 text-start hover:border-brand/40 hover:bg-brand-soft/40">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon className="size-5" /></span>
                  <span><b className="block text-[13px] text-gray-800">{label}</b><small className="text-[11px] text-gray-500">إدارة وتحديث المحتوى</small></span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'pages' && (
        <Card title="صفحات المتجر" subtitle="أنشئ صفحات المعلومات والسياسات وحدّث محتواها وروابطها."
          actions={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => openPage()}>صفحة جديدة</Button>}>
          {pages.items.length === 0 ? <p className="py-5 text-center text-sm text-gray-500">لا توجد صفحات بعد. أنشئ أول صفحة للمتجر.</p> :
            <div className="space-y-2">
              {[...pages.items].sort((a, b) => a.title.localeCompare(b.title, 'ar')).map((page) => (
                <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><b className="text-[13px] text-gray-800">{page.title}</b><span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${page.active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>{page.active ? 'منشورة' : 'مخفية'}</span></div>
                    <p className="mt-1 truncate text-[11.5px] text-gray-500">/pages/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => openPage(page)}>تعديل</Button><Button size="sm" variant="ghost" className="text-danger" icon={<Trash2 className="size-4" />} aria-label={`حذف ${page.title}`} onClick={() => deletePage(page)} /></div>
                </div>
              ))}
            </div>
          }
        </Card>
      )}

      {tab === 'home' && (
        <div className="space-y-4">
          <Card title="ترتيب أقسام الصفحة الرئيسية" subtitle="غيّر ترتيب الظهور، أوقف القسم مؤقتًا أو افتح تفاصيله للتعديل."
            actions={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => openSection()}>إضافة قسم</Button>}>
            {sortedSections.length === 0 ? <p className="py-5 text-center text-sm text-gray-500">لم تتم إضافة أقسام للواجهة الرئيسية.</p> :
              <div className="space-y-2">
                {sortedSections.map((section, index) => (
                  <div key={section.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <div className="flex flex-col gap-1">
                      <button type="button" aria-label="تحريك لأعلى" disabled={index === 0} onClick={() => reorderSection(index, -1)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                      <button type="button" aria-label="تحريك لأسفل" disabled={index === sortedSections.length - 1} onClick={() => reorderSection(index, 1)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                    </div>
                    <div className="min-w-0 flex-1"><b className="block truncate text-[13px] text-gray-800">{section.title}</b><span className="text-[11px] text-gray-500">{section.kind === 'custom' ? 'قسم مخصص' : section.kind} · {section.layout === 'row' ? 'عرض أفقي' : 'شبكة'}</span></div>
                    <Toggle checked={section.enabled} onChange={(enabled) => updateSettings({ sections: settings.sections.map((item) => item.id === section.id ? { ...item, enabled } : item) })} label={section.enabled ? 'ظاهر' : 'مخفي'} />
                    <Button size="sm" variant="outline" onClick={() => openSection(section)}>تعديل</Button>
                    <Button size="sm" variant="ghost" className="text-danger" icon={<Trash2 className="size-4" />} aria-label="إزالة القسم" onClick={() => removeSection(section)} />
                  </div>
                ))}
              </div>
            }
          </Card>
          <Card title="معاينة ترتيب العرض" subtitle="سيعرض المتجر الأقسام المفعّلة حسب هذا الترتيب.">
            <div className="flex flex-wrap gap-2">{sortedSections.filter((section) => section.enabled).map((section, index) => <span key={section.id} className="rounded-full bg-brand-soft px-3 py-1.5 text-[11.5px] font-semibold text-brand">{index + 1}. {section.title}</span>)}</div>
          </Card>
        </div>
      )}

      {tab === 'navigation' && (
        <div className="space-y-4">
          <Card title="التنقل السفلي" subtitle="تحكم بروابط وأسماء وأيقونات القائمة الرئيسية في واجهة المتجر."
            actions={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => openNav()}>إضافة رابط</Button>}>
            <div className="space-y-2">
              {(settings.navigationItems ?? []).map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand"><Globe2 className="size-4" /></span>
                  <div className="min-w-0 flex-1"><b className="block text-[13px] text-gray-800">{item.label}</b><span className="text-[11px] text-gray-500">{item.path} · {ICON_OPTIONS.find((icon) => icon.value === item.icon)?.label ?? 'أيقونة عامة'}</span></div>
                  <Toggle checked={item.enabled} onChange={(enabled) => updateSettings({ navigationItems: (settings.navigationItems ?? []).map((row) => row.id === item.id ? { ...row, enabled } : row) })} label={item.enabled ? 'ظاهر' : 'مخفي'} />
                  <Button size="sm" variant="outline" onClick={() => openNav(item)}>تعديل</Button>
                  <Button size="sm" variant="ghost" className="text-danger" icon={<Trash2 className="size-4" />} aria-label="حذف رابط التنقل" onClick={() => { if (window.confirm(`حذف الرابط «${item.label}»؟`)) updateSettings({ navigationItems: (settings.navigationItems ?? []).filter((row) => row.id !== item.id) }) }} />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-gray-500">يمكن ربط عناصر التنقل بصفحات المتجر أو الصفحات التي تنشئها في هذا المركز.</p>
          </Card>

          <Card title="روابط التذييل" subtitle="روابط السياسات والمعلومات التي تظهر أسفل الصفحة الرئيسية."
            actions={<Button size="sm" variant="outline" icon={<Plus className="size-4" />} onClick={() => openFooterLink()}>إضافة رابط</Button>}>
            <div className="space-y-2">
              {(settings.footerLinks ?? []).map((link) => (
                <div key={link.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0 flex-1"><b className="block text-[13px] text-gray-800">{link.label}</b><span className="text-[11px] text-gray-500">{link.path}</span></div>
                  <Toggle checked={link.enabled} onChange={(enabled) => updateSettings({ footerLinks: (settings.footerLinks ?? []).map((row) => row.id === link.id ? { ...row, enabled } : row) })} label={link.enabled ? 'ظاهر' : 'مخفي'} />
                  <Button size="sm" variant="outline" onClick={() => openFooterLink(link)}>تعديل</Button>
                  <Button size="sm" variant="ghost" className="text-danger" icon={<Trash2 className="size-4" />} aria-label="حذف رابط التذييل" onClick={() => updateSettings({ footerLinks: (settings.footerLinks ?? []).filter((row) => row.id !== link.id) })} />
                </div>
              ))}
              {(settings.footerLinks ?? []).length === 0 && <p className="py-3 text-center text-sm text-gray-500">لا توجد روابط في التذييل.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="space-y-4">
          <Card title="هوية المتجر" subtitle="خصص الاسم والشعار والألوان التي تظهر في واجهة التسوق.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="اسم المتجر" value={settings.storeName} onChange={(event) => updateSettings({ storeName: event.target.value })} />
              <Input label="النص البديل للشعار" value={settings.logoText} onChange={(event) => updateSettings({ logoText: event.target.value })} />
              <ImagePicker label="شعار المتجر" value={settings.logo} aspect="logo" onChange={(logo) => updateSettings({ logo })} hint="يفضل استخدام صورة بخلفية شفافة." />
              <ImagePicker label="أيقونة المتجر" value={settings.favicon} aspect="square" onChange={(favicon) => updateSettings({ favicon })} hint="تظهر في تبويب المتصفح وعلى الأجهزة المدعومة." />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {([
                ['primary', 'اللون الرئيسي'], ['secondary', 'اللون الثانوي'], ['success', 'لون النجاح'], ['danger', 'لون التنبيه'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 p-3 text-[12px] font-semibold text-gray-700">
                  {label}<input type="color" aria-label={label} value={settings.colors[key]} onChange={(event) => changeColor(key, event.target.value)} className="size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                </label>
              ))}
            </div>
          </Card>

          <Card title="شريط الإعلان" subtitle="أضف إعلانًا مختصرًا ورابطًا يظهر أعلى واجهة المتجر.">
            <div className="space-y-4">
              <Toggle checked={Boolean(settings.announcementBar?.enabled)} onChange={(enabled) => updateSettings({ announcementBar: { ...settings.announcementBar!, enabled } })} label="عرض شريط الإعلان" />
              <Textarea label="نص الإعلان" rows={2} value={settings.announcementBar?.text ?? ''} onChange={(event) => updateSettings({ announcementBar: { ...settings.announcementBar!, text: event.target.value } })} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="الرابط الداخلي" placeholder="/offers أو /pages/contact" value={settings.announcementBar?.target ?? ''} onChange={(event) => updateSettings({ announcementBar: { ...settings.announcementBar!, target: event.target.value } })} />
                <label className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 p-3 text-[12px] font-semibold text-gray-700">خلفية الإعلان<input type="color" value={settings.announcementBar?.background ?? '#7c3aed'} onChange={(event) => updateSettings({ announcementBar: { ...settings.announcementBar!, background: event.target.value } })} className="size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" /></label>
                <label className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 p-3 text-[12px] font-semibold text-gray-700">لون النص<input type="color" value={settings.announcementBar?.foreground ?? '#ffffff'} onChange={(event) => updateSettings({ announcementBar: { ...settings.announcementBar!, foreground: event.target.value } })} className="size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" /></label>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-100"><div className="px-4 py-2 text-center text-[12px] font-bold" style={{ backgroundColor: settings.announcementBar?.background, color: settings.announcementBar?.foreground }}>{settings.announcementBar?.text || 'معاينة شريط الإعلان'}</div></div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'content' && (
        <Card title="نصوص الواجهة" subtitle="حدّث العناوين والرسائل والأزرار دون تعديل ملفات التطبيق."
          actions={<div className="w-56"><Input aria-label="بحث في النصوص" placeholder="ابحث عن نص أو صفحة" icon={<Search className="size-4" />} value={searchText} onChange={(event) => setSearchText(event.target.value)} /></div>}>
          <div className="space-y-3">
            {filteredOverrides.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-xl border border-gray-100 p-3 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
                <div><b className="block text-[12.5px] text-gray-800">{item.label}</b><span className="text-[11px] text-gray-500">{item.screen}</span></div>
                <Input aria-label={item.label} value={item.value} onChange={(event) => overrides.update(item.id, { value: event.target.value })} />
              </div>
            ))}
            {filteredOverrides.length === 0 && <p className="py-8 text-center text-sm text-gray-500">لا توجد نصوص تطابق البحث.</p>}
          </div>
        </Card>
      )}

      <Modal open={Boolean(pageDraft)} onClose={() => setPageDraft(null)} title={pageDraft?.id ? 'تعديل صفحة' : 'إنشاء صفحة'} size="xl"
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPageDraft(null)}>إلغاء</Button><Button form="cms-page-form" type="submit" icon={<Save className="size-4" />}>حفظ الصفحة</Button></div>}>
        {pageDraft && <form id="cms-page-form" onSubmit={savePage} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="عنوان الصفحة" required value={pageDraft.title} onChange={(event) => setPageDraft({ ...pageDraft, title: event.target.value })} />
            <Input label="الرابط المختصر" required value={pageDraft.slug} onChange={(event) => setPageDraft({ ...pageDraft, slug: slugify(event.target.value) })} hint="يقبل العربية والإنجليزية والشرطة فقط." />
          </div>
          <Textarea label="محتوى الصفحة" required rows={12} value={pageDraft.content} onChange={(event) => setPageDraft({ ...pageDraft, content: event.target.value })} hint="افصل الفقرات بسطر فارغ. يمكن استخدام النقاط والأسطر لتنسيق المحتوى." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="عنوان نتائج البحث (اختياري)" value={pageDraft.seoTitle ?? ''} onChange={(event) => setPageDraft({ ...pageDraft, seoTitle: event.target.value })} />
            <Input label="وصف نتائج البحث (اختياري)" value={pageDraft.seoDescription ?? ''} onChange={(event) => setPageDraft({ ...pageDraft, seoDescription: event.target.value })} />
          </div>
          <Toggle checked={pageDraft.active} onChange={(active) => setPageDraft({ ...pageDraft, active })} label="إظهار الصفحة للزوار" />
        </form>}
      </Modal>

      <Modal open={Boolean(sectionDraft)} onClose={() => setSectionDraft(null)} title={sectionDraft?.title ? `تعديل قسم: ${sectionDraft.title}` : 'إضافة قسم رئيسي'} size="xl"
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setSectionDraft(null)}>إلغاء</Button><Button form="cms-section-form" type="submit" icon={<Save className="size-4" />}>حفظ القسم</Button></div>}>
        {sectionDraft && <form id="cms-section-form" onSubmit={saveSection} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="عنوان القسم" required value={sectionDraft.title} onChange={(event) => setSectionDraft({ ...sectionDraft, title: event.target.value })} />
            <Select label="طريقة العرض" value={sectionDraft.layout} onChange={(event) => setSectionDraft({ ...sectionDraft, layout: event.target.value as HomeSection['layout'] })} options={[{ value: 'row', label: 'شريط أفقي' }, { value: 'grid', label: 'شبكة منتجات' }]} />
            <Input label="عدد المنتجات" type="number" min={1} max={24} value={sectionDraft.limit ?? 8} onChange={(event) => setSectionDraft({ ...sectionDraft, limit: Number(event.target.value) })} />
          </div>
          <Toggle checked={sectionDraft.enabled} onChange={(enabled) => setSectionDraft({ ...sectionDraft, enabled })} label="إظهار القسم في الصفحة الرئيسية" />
          <div className="rounded-xl border border-gray-100 p-3">
            <p className="mb-2 text-[12.5px] font-bold text-gray-700">تصفية المنتجات حسب الأقسام</p>
            <div className="grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
              {activeCategories.map((category) => <Checkbox key={category.id} checked={sectionCategories.includes(category.id)} onChange={(checked) => setSectionCategories((prev) => checked ? [...prev, category.id] : prev.filter((id) => id !== category.id))} label={category.name} />)}
            </div>
            {activeCategories.length === 0 && <p className="text-[12px] text-gray-500">أضف أقسامًا للمتجر لاستخدامها في التصفية.</p>}
          </div>
          <div className="rounded-xl border border-gray-100 p-3">
            <Checkbox checked={useManualProducts} onChange={(checked) => setUseManualProducts(checked)} label="اختيار منتجات محددة يدويًا بدل التصفية" />
            {useManualProducts && <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
              {availableProducts.map((product) => <Checkbox key={product.id} checked={manualProducts.includes(product.id)} onChange={(checked) => setManualProducts((prev) => checked ? [...prev, product.id] : prev.filter((id) => id !== product.id))} label={<span className="flex min-w-0 items-center justify-between gap-2"><span className="truncate">{product.name}</span><small className="shrink-0 text-gray-400">{product.price} ر.س</small></span>} />)}
              {availableProducts.length === 0 && <p className="text-[12px] text-gray-500">لا توجد منتجات منشورة للاختيار.</p>}
            </div>}
          </div>
        </form>}
      </Modal>

      <Modal open={Boolean(navDraft)} onClose={() => setNavDraft(null)} title={navDraft?.id ? 'تعديل رابط التنقل' : 'إضافة رابط تنقل'} size="md"
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setNavDraft(null)}>إلغاء</Button><Button form="cms-nav-form" type="submit">حفظ الرابط</Button></div>}>
        {navDraft && <form id="cms-nav-form" onSubmit={saveNav} className="space-y-4">
          <Input label="اسم الرابط" required value={navDraft.label} onChange={(event) => setNavDraft({ ...navDraft, label: event.target.value })} />
          <Select label="صفحة الوجهة" value={navDraft.path} onChange={(event) => setNavDraft({ ...navDraft, path: event.target.value })} options={pathChoices} />
          <Select label="الأيقونة" value={navDraft.icon} onChange={(event) => setNavDraft({ ...navDraft, icon: event.target.value as StoreNavIcon })} options={ICON_OPTIONS} />
          <Toggle checked={Boolean(navDraft.requiresAuth)} onChange={(requiresAuth) => setNavDraft({ ...navDraft, requiresAuth })} label="تتطلب تسجيل الدخول" />
          <Toggle checked={navDraft.enabled} onChange={(enabled) => setNavDraft({ ...navDraft, enabled })} label="إظهار الرابط" />
        </form>}
      </Modal>

      <Modal open={Boolean(footerDraft)} onClose={() => setFooterDraft(null)} title={footerDraft?.id ? 'تعديل رابط التذييل' : 'إضافة رابط للتذييل'} size="md"
        footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setFooterDraft(null)}>إلغاء</Button><Button form="cms-footer-form" type="submit">حفظ الرابط</Button></div>}>
        {footerDraft && <form id="cms-footer-form" onSubmit={saveFooterLink} className="space-y-4">
          <Input label="اسم الرابط" required value={footerDraft.label} onChange={(event) => setFooterDraft({ ...footerDraft, label: event.target.value })} />
          <Select label="صفحة الوجهة" value={footerDraft.path} onChange={(event) => setFooterDraft({ ...footerDraft, path: event.target.value })} options={pathChoices} />
          <Toggle checked={footerDraft.enabled} onChange={(enabled) => setFooterDraft({ ...footerDraft, enabled })} label="إظهار الرابط في التذييل" />
        </form>}
      </Modal>
    </AdminPage>
  )
}

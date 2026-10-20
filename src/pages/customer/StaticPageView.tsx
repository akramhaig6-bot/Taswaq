import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { EmptyState, renderRich } from '@/components/ui/display'
import { ContactPanel } from '@/components/customer/ContactPanel'
import { useAppData } from '@/store/AppDataContext'
import { useLang } from '@/store/LanguageContext'

export default function StaticPageView() {
  const { slug = '' } = useParams()
  const { t } = useLang()
  const { pages, settings } = useAppData()
  const page = pages.items.find((item) => item.slug === slug && item.active)
  const isContact = page?.slug === 'contact'

  useEffect(() => {
    document.title = page ? `${page.seoTitle || page.title} — ${settings.storeName}` : settings.storeName
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = page?.seoDescription || page?.content.slice(0, 155) || ''
  }, [page?.content, page?.seoDescription, page?.seoTitle, page?.title, settings.storeName])

  if (!page) {
    return (
      <Screen header={<PageHeader title="الصفحة" backTo="/account" />}>
        <EmptyState
          icon={<FileQuestion className="size-9" />}
          title={t('notFound.title', 'الصفحة غير موجودة')}
          body="قد تكون هذه الصفحة مخفية أو تم حذفها."
        />
      </Screen>
    )
  }

  if (isContact) {
    return (
      <Screen header={<PageHeader title={page.title} backTo="/account" />}>
        <div className="p-4">
          <h1 className="mb-1 text-[17px] font-extrabold text-gray-900">{page.title}</h1>
          <p className="mb-3 text-[12.5px] leading-6 text-gray-500">
            نسعد بخدمتك في أي وقت. اختر وسيلة التواصل الأنسب لك.
          </p>
          <ContactPanel />
          <p className="mt-6 border-t border-gray-100 pt-4 text-center text-[11.5px] text-gray-400">
            {settings.copyright}
          </p>
        </div>
      </Screen>
    )
  }

  return (
    <Screen header={<PageHeader title={page.title} backTo="/account" />}>
      <article className="p-4">
        <h1 className="mb-3 text-[17px] font-extrabold text-gray-900">{page.title}</h1>
        <div className="rich-text text-[13.5px] text-gray-600" dangerouslySetInnerHTML={{ __html: renderRich(page.content) }} />
        <p className="mt-8 border-t border-gray-100 pt-4 text-center text-[11.5px] text-gray-400">{settings.copyright}</p>
      </article>
    </Screen>
  )
}

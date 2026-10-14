import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/display'
import { useLang } from '@/store/LanguageContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useLang()
  return (
    <Screen header={<TopBar showSearch={false} />}>
      <EmptyState
        icon={<Compass className="size-10" />}
        title={t('notFound.title', 'الصفحة غير موجودة')}
        body="الرابط الذي تبحث عنه غير متاح أو تم نقله."
        action={<Button onClick={() => navigate('/')}>{t('notFound.cta', 'العودة للرئيسية')}</Button>}
      />
    </Screen>
  )
}

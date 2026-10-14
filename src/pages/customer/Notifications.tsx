import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, CheckCheck, Info, Package, Percent, Trash2 } from 'lucide-react'
import { Screen } from '@/components/layout/Screen'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { EmptyState, TimeAgo } from '@/components/ui/display'
import { ConfirmDialog, Dropdown, MenuItem } from '@/components/ui/overlay'
import { cn } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'
import { useToast } from '@/store/ToastContext'

const ICONS = { order: Package, offer: Percent, reminder: BellRing, info: Info }

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications } = useAppData()
  const { showToast } = useToast()
  const [confirmClear, setConfirmClear] = useState(false)

  const list = useMemo(
    () =>
      notifications.items
        .filter((item) => !item.forAdmin)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications.items],
  )

  const unread = list.filter((item) => !item.read).length

  const removeAll = () => {
    list.forEach((item) => notifications.remove(item.id))
    setConfirmClear(false)
    showToast('تم مسح جميع الإشعارات.', { type: 'info' })
  }

  return (
    <Screen
      header={
        <PageHeader
          title="الإشعارات"
          subtitle={unread ? `${unread} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
          backTo="/account"
          actions={
            <Dropdown
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  className="flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                >
                  ⋮
                </button>
              )}
            >
              <MenuItem
                icon={<CheckCheck className="size-4" />}
                onClick={() => {
                  notifications.set(list.map((item) => ({ ...item, read: true })))
                  showToast('تم تعيين الكل كمقروء.', { type: 'success' })
                }}
              >
                تعيين الكل كمقروء
              </MenuItem>
              <MenuItem icon={<Trash2 className="size-4" />} danger onClick={() => setConfirmClear(true)}>
                مسح الكل
              </MenuItem>
            </Dropdown>
          }
        />
      }
    >
      {list.length === 0 ? (
        <EmptyState icon={<Bell className="size-9" />} title="لا توجد إشعارات حاليًا." />
      ) : (
        <ul className="divide-y divide-gray-100">
          {list.map((item) => {
            const Icon = ICONS[item.type]
            return (
              <li key={item.id} className={cn('relative flex gap-3 p-4', !item.read && 'bg-brand-soft/40')}>
                <button
                  type="button"
                  onClick={() => {
                    notifications.update(item.id, { read: true })
                    if (item.target) navigate(item.target)
                  }}
                  className="flex min-w-0 flex-1 gap-3 text-start"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-xs">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-bold text-gray-800">{item.title}</span>
                      {!item.read && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-6 text-gray-600">{item.body}</span>
                    <TimeAgo iso={item.createdAt} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => notifications.remove(item.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger"
                  aria-label="حذف"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="p-4">
        <Button variant="outline" fullWidth onClick={() => navigate('/account')}>
          العودة لحسابي
        </Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="مسح الإشعارات"
        message="هل تريد مسح جميع الإشعارات؟"
        confirmLabel="مسح الكل"
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={removeAll}
      />
    </Screen>
  )
}

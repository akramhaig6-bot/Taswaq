import { useRef, useState } from 'react'
import { ImagePlus, Star, Trash2, Upload } from 'lucide-react'
import { cn, readImageFile } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function ImagePicker({
  value,
  onChange,
  label,
  hint,
  aspect = 'banner',
  className,
}: {
  value?: string
  onChange: (value: string) => void
  label?: string
  hint?: string
  aspect?: 'banner' | 'square' | 'logo'
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file?: File | null) => {
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await readImageFile(file, aspect === 'banner' ? 1200 : 600)
      onChange(dataUrl)
    } finally {
      setBusy(false)
    }
  }

  const ratio = { banner: 'aspect-[16/7]', square: 'aspect-square', logo: 'aspect-[3/2]' }[aspect]

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="mb-1.5 text-[13px] font-semibold text-gray-700">{label}</p>}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void pick(event.dataTransfer.files?.[0])
        }}
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50',
          ratio,
        )}
      >
        {value ? (
          <img src={value} alt="معاينة" className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <Upload className="size-6" />
            <span className="text-[12px]">اسحب صورة هنا أو اختر ملفًا</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={busy}
          icon={<ImagePlus className="size-4" />}
          onClick={() => inputRef.current?.click()}
        >
          اختيار صورة
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange('')}>
            إزالة
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void pick(event.target.files?.[0])}
        />
      </div>
      {hint && <p className="mt-1 text-[11.5px] text-gray-500">{hint}</p>}
    </div>
  )
}

export function MultiImagePicker({
  values,
  onChange,
  label,
  max = 5,
}: {
  values: string[]
  onChange: (values: string[]) => void
  label?: string
  max?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const add = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      const next: string[] = []
      for (const file of Array.from(files).slice(0, max - values.length)) {
        next.push(await readImageFile(file, 900))
      }
      onChange([...values, ...next])
    } finally {
      setBusy(false)
    }
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= values.length) return
    const next = [...values]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-[13px] font-semibold text-gray-700">{label}</p>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((src, index) => (
          <div key={`${src.slice(0, 24)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200">
            <img src={src} alt={`صورة ${index + 1}`} className="size-full object-cover" />
            {index === 0 && (
              <span className="absolute top-1 start-1 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                رئيسية
              </span>
            )}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="flex size-6 items-center justify-center rounded-md bg-white/90 text-[11px] font-bold text-gray-700 shadow-xs"
                  title="تقديم"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="flex size-6 items-center justify-center rounded-md bg-white/90 text-[11px] font-bold text-gray-700 shadow-xs"
                  title="تأخير"
                >
                  ‹
                </button>
              </div>
              <div className="flex gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...values]
                      const [item] = next.splice(index, 1)
                      next.unshift(item)
                      onChange(next)
                    }}
                    className="flex size-6 items-center justify-center rounded-md bg-white/90 text-gold shadow-xs"
                    title="تعيين كرئيسية"
                  >
                    <Star className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChange(values.filter((_, i) => i !== index))}
                  className="flex size-6 items-center justify-center rounded-md bg-white/90 text-danger shadow-xs"
                  title="حذف"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-brand hover:text-brand"
          >
            <ImagePlus className="size-5" />
            <span className="text-[11px]">{busy ? 'جارٍ الرفع' : 'إضافة صورة'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void add(event.target.files)}
      />
      <p className="mt-1.5 text-[11.5px] text-gray-500">
        أول صورة تُستخدم كصورة رئيسية. الحد الأقصى {max} صور.
      </p>
    </div>
  )
}

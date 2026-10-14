import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Banner } from '@/types'
import { bannerImage } from '@/lib/artwork'
import { cn } from '@/lib/utils'

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = window.setInterval(() => {
      if (paused.current) return
      setIndex((value) => (value + 1) % banners.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const open = (banner: Banner) => {
    const { type, value } = banner.target
    if (type === 'product' && value) navigate(`/product/${value}`)
    else if (type === 'category' && value) navigate(`/category/${value}`)
    else if (type === 'offer') navigate('/offers')
    else if (type === 'external' && value) window.open(value, '_blank', 'noopener')
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onTouchStart={() => {
        paused.current = true
      }}
      onTouchEnd={() => {
        window.setTimeout(() => {
          paused.current = false
        }, 1200)
      }}
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => open(banner)}
            className="relative aspect-[2/1] w-full shrink-0 overflow-hidden text-start"
          >
            <img
              src={banner.image || bannerImage(banner.theme, banner.order + 1)}
              alt={banner.title ?? 'عرض'}
              className="size-full object-cover"
            />
            {(banner.title || banner.subtitle) && (
              <span className="absolute inset-0 flex flex-col justify-center gap-1.5 bg-gradient-to-l from-black/45 via-black/15 to-transparent p-5">
                {banner.title && (
                  <span className="text-lg font-extrabold leading-7 text-white drop-shadow-sm">{banner.title}</span>
                )}
                {banner.subtitle && <span className="text-[12.5px] font-medium text-white/90">{banner.subtitle}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`بانر ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

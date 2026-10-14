/**
 * Smoke test: يُصيّر كل شاشات التطبيق على الخادم (SSR) بشكل مصطنع
 * للتأكد من عدم وجود أخطاء وقت التشغيل (render-time errors) في أي مسار.
 *
 * التشغيل: node scripts/smoke.mjs  (يحتاج jsdom في devDependencies)
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
})

const { window } = dom
globalThis.window = window
globalThis.document = window.document
const define = (key, value) => {
  try {
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
  } catch {
    /* بعض الخصائص للقراءة فقط في Node — نتجاهلها */
  }
}

define('navigator', window.navigator)
define('location', window.location)
define('history', window.history)
globalThis.localStorage = window.localStorage
globalThis.sessionStorage = window.sessionStorage
globalThis.HTMLElement = window.HTMLElement
globalThis.Element = window.Element
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.CustomEvent = window.CustomEvent
globalThis.MouseEvent = window.MouseEvent
globalThis.getComputedStyle = window.getComputedStyle
globalThis.requestAnimationFrame = (cb) => window.setTimeout(() => cb(Date.now()), 16)
globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id)
globalThis.matchMedia =
  window.matchMedia ??
  (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))
window.matchMedia = globalThis.matchMedia
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.scrollTo = () => {}
window.scrollTo = () => {}

/* جلسات مُهيّأة مسبقًا حتى تُصيَّر شاشات لوحة الإدارة والعميل */
localStorage.setItem('sawqli.v1.session.admin', 'true')
localStorage.setItem('sawqli.v1.session.customer', '"u-1"')

const { createServer } = await import('vite')
const server = await createServer({
  root: process.cwd(),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
})

const routes = [
  '/',
  '/search',
  '/categories',
  '/category/c-phones',
  '/category/c-phones/products',
  '/brand/b-samsung',
  '/product/p-1',
  '/product/p-1/reviews',
  '/cart',
  '/checkout',
  '/order-success/o-1',
  '/orders',
  '/orders/o-1',
  '/wishlist',
  '/account',
  '/account/edit',
  '/account/addresses',
  '/account/payment-methods',
  '/account/notifications',
  '/offers',
  '/login',
  '/forgot-password',
  '/pages/about',
  '/pages/does-not-exist',
  '/definitely-not-a-route',
  '/admin',
  '/admin/dashboard',
  '/admin/orders',
  '/admin/orders/o-1',
  '/admin/products',
  '/admin/products/new',
  '/admin/products/p-1/edit',
  '/admin/categories',
  '/admin/brands',
  '/admin/customers',
  '/admin/reviews',
  '/admin/coupons',
  '/admin/banners',
  '/admin/reports',
  '/admin/notifications',
  '/admin/settings',
  '/admin/settings/general',
  '/admin/settings/brand',
  '/admin/settings/currency',
  '/admin/settings/payment',
  '/admin/settings/shipping',
  '/admin/settings/pages',
  '/admin/settings/languages',
  '/admin/settings/ui',
  '/admin/settings/technical',
  '/admin/profile',
]

let failures = 0

for (const route of routes) {
  try {
    const mod = await server.ssrLoadModule('/src/smoke-entry.tsx')
    const html = mod.renderRoute(route)
    const length = html.length
    if (length < 200) {
      failures++
      console.log(`✗ ${route} — ناتج قصير جدًا (${length} حرفًا)`)
      continue
    }
    console.log(`✓ ${route} — ${length} حرفًا`)
  } catch (error) {
    failures++
    console.log(`✗ ${route} — ${error?.message ?? error}`)
    if (process.env.SMOKE_TRACE) console.log(String(error?.stack ?? '').split('\n').slice(1, 8).join('\n'))
  }
}

await server.close()
console.log(failures === 0 ? '\nكل المسارات نجحت ✅' : `\nفشل ${failures} مسار ❌`)
process.exit(failures === 0 ? 0 : 1)

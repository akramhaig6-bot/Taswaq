/**
 * اختبار تصيير (Smoke test) لكل مسارات التطبيق الحقيقية:
 * يُشغّل التطبيق فعليًا (React + BrowserRouter) داخل jsdom على كل مسار
 * ويتأكد من أن كل شاشة تُنتج محتوى بدون أخطاء وقت التشغيل.
 *
 * التشغيل: npm run smoke
 *
 * ملاحظة: قد يطبع jsdom تحذيرًا داخليًا من React DOM حول attachEvent (تحقق متصفحات
 * قديمة لا علاقة له بالتطبيق) — لا يؤثر على النتيجة.
 */
import { JSDOM } from 'jsdom'

/* كتم تحذيرات act المتكررة من jsdom لتوضيح النتائج */
const originalConsoleError = console.error
console.error = (...args) => {
  const message = String(args[0] ?? '')
  if (message.includes('not wrapped in act')) return
  originalConsoleError(...args)
}


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
  '/admin/unknown-section',
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function define(key, value) {
  try {
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
  } catch {
    /* خصائص للقراءة فقط — نتجاهلها */
  }
}

function setupDom(path, seed = {}) {
  const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body><div id="root"></div></body></html>', {
    url: `http://localhost:5173${path}`,
    pretendToBeVisual: true,
    beforeParse(window) {
      Object.entries(seed).forEach(([key, value]) => window.localStorage.setItem(key, value))
    },
  })
  const { window } = dom
  globalThis.window = window
  globalThis.document = window.document
  define('navigator', window.navigator)
  define('location', window.location)
  define('history', window.history)
  define('localStorage', window.localStorage)
  globalThis.HTMLElement = window.HTMLElement
  globalThis.HTMLInputElement = window.HTMLInputElement
  globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement
  globalThis.Element = window.Element
  globalThis.Node = window.Node
  globalThis.Event = window.Event
  globalThis.CustomEvent = window.CustomEvent
  globalThis.MouseEvent = window.MouseEvent
  globalThis.KeyboardEvent = window.KeyboardEvent
  globalThis.getComputedStyle = window.getComputedStyle
  globalThis.requestAnimationFrame = (cb) => window.setTimeout(() => cb(Date.now()), 16)
  globalThis.cancelAnimationFrame = (id) => window.clearTimeout(id)
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
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
  window.Element.prototype.scrollTo = function scrollTo() {}
  window.Element.prototype.scrollIntoView = function scrollIntoView() {}
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  return window
}

const { createServer } = await import('vite')
const server = await createServer({
  root: process.cwd(),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
})

const React = (await import('react')).default ?? (await import('react'))
const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const App = (await server.ssrLoadModule('/src/App.tsx')).default

let failures = 0

for (const route of routes) {
  const seed = {
    'sawqli.v1.session.expiresAt': String(Date.now() + 3600000),
    'sawqli.v1.cart': JSON.stringify([{ id: 'ci-smoke', productId: 'p-1', quantity: 1, options: {} }]),
  }
  if (route !== '/admin') {
    seed['sawqli.v1.session.customer'] = '"u-1"'
    seed['sawqli.v1.session.admin'] = 'true'
  }

  const window = setupDom(route, seed)
  const container = window.document.getElementById('root')
  const root = createRoot(container)
  let error = null

  try {
    await act(async () => {
      root.render(React.createElement(App))
    })
    await act(async () => {
      await sleep(1500)
    })
    const text = (window.document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
    if (text.length < 70) {
      error = `المحتوى قصير جدًا (${text.length} حرفًا) — ${text.slice(0, 60)}`
    } else {
      console.log(`✓ ${route} — ${text.length} حرفًا`)
    }
  } catch (thrown) {
    error = String(thrown?.message ?? thrown)
  }

  if (error) {
    failures++
    console.log(`✗ ${route} — ${error}`)
  }

  try {
    await act(async () => {
      root.unmount()
    })
  } catch {
    /* تجاهل */
  }
  window.close()
}

await server.close()
console.log(failures === 0 ? `\nكل المسارات (${routes.length}) نجحت ✅` : `\nفشل ${failures} مسار ❌`)
process.exit(failures === 0 ? 0 : 1)

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
import { readFileSync } from 'node:fs'

/* نقرأ إصدار التخزين من المصدر نفسه حتى لا تنحرف مفاتيح الاختبارات عن التطبيق */
const persistSource = readFileSync(new URL('../src/store/persist.ts', import.meta.url), 'utf8')
const STORAGE_VERSION = persistSource.match(/STORAGE_VERSION\s*=\s*'([^']+)'/)?.[1] ?? 'v1'

/* كتم تحذيرات act المتكررة من jsdom لتوضيح النتائج */
const originalConsoleError = console.error
console.error = (...args) => {
  const message = String(args[0] ?? '')
  if (message.includes('not wrapped in act')) return
  originalConsoleError(...args)
}



/* بيانات اختبار محلية لهذا الاختبار فقط — لا تُشحن مع التطبيق */
const TEST_PRODUCT = {
  id: 'p-1',
  name: 'جوال سامسونج جالاكسي للاختبار',
  sku: 'TEST-001',
  description: 'منتج اختبار يُحقن عبر localStorage داخل هذا الاختبار فقط.',
  images: ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'],
  price: 1000,
  stock: 10,
  trackStock: true,
  lowStockThreshold: 2,
  allowBackorder: false,
  categoryIds: ['c-phones'],
  brandId: 'b-samsung',
  tags: ['جوال', 'سامسونج'],
  options: [],
  variants: [],
  specifications: [],
  relatedIds: [],
  status: 'published',
  rating: 5,
  reviewCount: 0,
  sales: 0,
  createdAt: new Date().toISOString(),
}
const TEST_ADDRESS = {
  id: 'a-test',
  label: 'المنزل',
  fullName: 'عميل اختبار',
  phone: '0550000000',
  city: 'الرياض',
  district: 'حي الاختبار',
  street: 'شارع الاختبار',
  isDefault: true,
}
const TEST_CUSTOMER = {
  id: 'u-1',
  name: 'عميل اختبار',
  email: 'test@example.com',
  phone: '0550000000',
  password: '123456',
  addresses: [TEST_ADDRESS],
  savedCards: [],
  blocked: false,
  createdAt: new Date().toISOString(),
}
const TEST_ORDER = {
  id: 'o-1',
  number: '100001',
  customerId: 'u-1',
  customerName: 'عميل اختبار',
  customerEmail: 'test@example.com',
  customerPhone: '0550000000',
  items: [{ id: 'oi-1', productId: 'p-1', name: 'جوال سامسونج جالاكسي للاختبار', image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>', price: 1000, quantity: 1 }],
  address: TEST_ADDRESS,
  paymentMethodId: 'pm-card',
  paymentMethodName: 'بطاقة ائتمان أو مدى',
  paymentStatus: 'paid',
  shippingMethod: 'توصيل سريع',
  subtotal: 1000,
  discount: 0,
  shipping: 0,
  codFee: 0,
  tax: 150,
  total: 1150,
  status: 'delivered',
  createdAt: new Date().toISOString(),
  timeline: [],
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
    [`sawqli.${STORAGE_VERSION}.products`]: JSON.stringify([TEST_PRODUCT]),
    [`sawqli.${STORAGE_VERSION}.customers`]: JSON.stringify([TEST_CUSTOMER]),
    [`sawqli.${STORAGE_VERSION}.orders`]: JSON.stringify([TEST_ORDER]),
    [`sawqli.${STORAGE_VERSION}.session.expiresAt`]: String(Date.now() + 3600000),
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([{ id: 'ci-smoke', productId: 'p-1', quantity: 1, options: {} }]),
  }
  if (route !== '/admin') {
    seed[`sawqli.${STORAGE_VERSION}.session.customer`] = '"u-1"'
    seed[`sawqli.${STORAGE_VERSION}.session.admin`] = 'true'
  }

  const window = setupDom(route, seed)
  const container = window.document.getElementById('root')
  const root = createRoot(container)
  let error = null

  try {
    await act(async () => {
      root.render(React.createElement(App))
    })
    /* ننتظر انتهاء تحميل الحزمة الكسولة (Code Splitting) — يتوقف عند استقرار المحتوى */
    let text = ''
    for (let attempt = 0; attempt < 12; attempt++) {
      await act(async () => {
        await sleep(350)
      })
      const current = (window.document.body.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (current === text && current.length > 140) break
      text = current
    }
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

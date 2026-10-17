/**
 * اختبار تفاعلي (jsdom + React) للتحقق من المسارات والوظائف الحرجة:
 * تسجيل الدخول، إضافة المنتجات، البحث، السلة والكوبونات، إنشاء الطلبات، مركز المحتوى،
 * إعدادات الواجهة، والتسليم الرقمي دون عنوان أو رسوم شحن.
 *
 * التشغيل: node scripts/flows.mjs
 */
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'

/* نقرأ إصدار التخزين من المصدر نفسه حتى لا تنحرف مفاتيح الاختبارات عن التطبيق */
const persistSource = readFileSync(new URL('../src/store/persist.ts', import.meta.url), 'utf8')
const STORAGE_VERSION = persistSource.match(/STORAGE_VERSION\s*=\s*'([^']+)'/)?.[1] ?? 'v1'

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
  isNew: true,
  isBestSeller: true,
  status: 'published',
  rating: 5,
  reviewCount: 0,
  sales: 0,
  createdAt: new Date().toISOString(),
}
const TEST_CUSTOMER = {
  id: 'u-1',
  name: 'عميل اختبار',
  email: 'test@example.com',
  phone: '0550000000',
  password: '123456',
  addresses: [
    {
      id: 'a-test',
      label: 'المنزل',
      fullName: 'عميل اختبار',
      phone: '0550000000',
      city: 'الرياض',
      district: 'حي الاختبار',
      street: 'شارع الاختبار',
      isDefault: true,
    },
  ],
  savedCards: [],
  blocked: false,
  createdAt: new Date().toISOString(),
}
const testFixtures = () => ({
  [`sawqli.${STORAGE_VERSION}.products`]: JSON.stringify([TEST_PRODUCT]),
  [`sawqli.${STORAGE_VERSION}.customers`]: JSON.stringify([TEST_CUSTOMER]),
})

/* كتم تحذيرات act المتكررة من jsdom لتوضيح النتائج */
const originalConsoleError = console.error
console.error = (...args) => {
  const message = String(args[0] ?? '')
  if (message.includes('not wrapped in act')) return
  originalConsoleError(...args)
}


async function boot(path, seed = {}) {
  const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body><div id="root"></div></body></html>', {
    url: `http://localhost:5173${path}`,
    pretendToBeVisual: true,
    beforeParse(window) {
      Object.entries(seed).forEach(([key, value]) => window.localStorage.setItem(key, value))
    },
  })
  const { window } = dom
  const define = (key, value) => {
    try {
      Object.defineProperty(globalThis, key, { value, writable: true, configurable: true })
    } catch {
      /* تجاهل */
    }
  }
  globalThis.window = window
  globalThis.document = window.document
  define('navigator', window.navigator)
  define('location', window.location)
  define('history', window.history)
  globalThis.localStorage = window.localStorage
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
  /* jsdom لا يوفّر scrollTo/scrollIntoView على العناصر */
  window.Element.prototype.scrollTo = function scrollTo() {}
  window.Element.prototype.scrollIntoView = function scrollIntoView() {}
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

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
  const appModule = await server.ssrLoadModule('/src/App.tsx')
  const container = window.document.getElementById('root')
  const root = createRoot(container)

  await act(async () => {
    root.render(React.createElement(appModule.default))
  })
  /* انتظار انتهاء شاشة التحميل الأولية (900ms) */
  await act(async () => {
    await sleep(1200)
  })

  return { window, server, root, act, container, React }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function setValue(window, element, value) {
  const proto =
    element instanceof window.HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(element, value)
  element.dispatchEvent(new window.Event('input', { bubbles: true }))
}

function click(window, element) {
  element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
}

function findByText(window, text, tag = '*') {
  const nodes = Array.from(window.document.querySelectorAll(tag))
  return nodes.find((node) => (node.textContent ?? '').includes(text))
}

const results = []
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

/* ---------------------------- 1) دخول الإدارة ---------------------------- */
{
  const { window, server, act } = await boot('/admin')
  try {
    const email = window.document.querySelector('input[type="email"]')
    const password = window.document.querySelector('input[type="password"]')
    if (!email || !password) throw new Error('لم يتم العثور على حقول الدخول')
    await act(async () => {
      setValue(window, email, 'haiderhajjah@gmail.com')
      setValue(window, password, '2009')
    })
    const submit = findByText(window, 'دخول', 'button')
    if (!submit) throw new Error('لم يتم العثور على زر الدخول')
    await act(async () => {
      click(window, submit)
    })
    await act(async () => {
      await sleep(1000)
    })
    const path = window.location.pathname
    record('دخول لوحة الإدارة', path.startsWith('/admin/dashboard'), `المسار الحالي: ${path}`)
  } catch (error) {
    record('دخول لوحة الإدارة', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------------------------ 2) إضافة منتج إلى السلة ------------------------ */
{
  const { window, server, act } = await boot('/product/p-1', testFixtures())
  try {
    await act(async () => {
      await sleep(600)
    })
    let addButton = findByText(window, 'أضف للسلة', 'button')
    for (let attempt = 0; attempt < 10 && !addButton; attempt++) {
      await act(async () => {
        await sleep(300)
      })
      addButton = findByText(window, 'أضف للسلة', 'button')
    }
    if (!addButton) throw new Error('لم يتم العثور على زر أضف للسلة')

    /* اختيار أول قيمة متاحة من كل خيار (اللون/السعة) كما يفعل المستخدم */
    const sections = Array.from(window.document.querySelectorAll('[id^="option-"]'))
    const optionCount = sections.length
    await act(async () => {
      sections.forEach((section) => {
        const option = Array.from(section.querySelectorAll('button')).find((button) => !button.disabled)
        if (option) click(window, option)
      })
    })
    await act(async () => {
      await sleep(100)
    })
    await act(async () => {
      click(window, addButton)
    })
    await act(async () => {
      await sleep(1800)
    })
    const cart = window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.cart`) ?? ''
    record(
      'إضافة منتج إلى السلة',
      cart.includes('p-1'),
      `${optionCount} خيارات — ${cart ? cart.slice(0, 90) : 'السلة فارغة'}`,
    )
  } catch (error) {
    record('إضافة منتج إلى السلة', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* --------------------------- 3) شاشة الدفع للعميل المسجّل --------------------------- */
{
  const { window, server, act } = await boot('/checkout', {
    ...testFixtures(),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.session.expiresAt`]: String(Date.now() + 3600000),
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([{ id: 'ci-1', productId: 'p-1', quantity: 1, options: {} }]),
  })
  try {
    await act(async () => {
      await sleep(400)
    })
    const text = window.document.body.textContent ?? ''
    const onCheckout = window.location.pathname === '/checkout'
    const hasShipping = text.includes('الشحن') || text.includes('العنوان')
    record('فتح شاشة الدفع للعميل المسجّل', onCheckout && hasShipping, `المسار: ${window.location.pathname}`)

    const nextButton = findByText(window, 'التالي', 'button') ?? findByText(window, 'متابعة', 'button')
    if (!nextButton) throw new Error('لم يتم العثور على زر الخطوة التالية')
    await act(async () => {
      click(window, nextButton)
    })
    await act(async () => {
      await sleep(400)
    })
    const afterText = window.document.body.textContent ?? ''
    record('الانتقال للخطوة الثانية', afterText.includes('الدفع'), `طول الصفحة: ${afterText.length}`)
  } catch (error) {
    record('فتح شاشة الدفع للعميل المسجّل', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------------------- 4) البحث متعدد الكلمات + إبراز النص ------------------- */
{
  const { window, server, act } = await boot('/search', testFixtures())
  try {
    const input = window.document.querySelector(
      'input[placeholder*="ابحث"], input[placeholder*="ابحث عن"], input[type="search"]',
    )
    if (!input) throw new Error('لم يتم العثور على حقل البحث')

    await act(async () => {
      setValue(window, input, 'جوال سامسونج')
    })
    await act(async () => {
      await sleep(500)
    })
    await act(async () => {
      input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })
    await act(async () => {
      await sleep(800)
    })

    const text = window.document.body.textContent ?? ''
    const strongCount = window.document.querySelectorAll('strong').length
    const hasResultsHeader = text.includes('نتائج البحث عن')
    record(
      'البحث متعدد الكلمات + الإبراز',
      hasResultsHeader && strongCount > 0,
      `عناوين النتائج: ${hasResultsHeader} — عناصر <strong>: ${strongCount}`,
    )
  } catch (error) {
    record('البحث متعدد الكلمات + الإبراز', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------------- 5) تأكيد الإزالة عند خفض الكمية إلى صفر ------------- */
{
  const { window, server, act } = await boot('/cart', {
    ...testFixtures(),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([{ id: 'ci-1', productId: 'p-1', quantity: 1, options: {} }]),
  })
  try {
    const minus = window.document.querySelector('button[aria-label="تقليل الكمية"]')
    if (!minus) throw new Error('لم يتم العثور على زر تقليل الكمية')
    await act(async () => {
      click(window, minus)
    })
    await act(async () => {
      await sleep(150)
    })
    const text = window.document.body.textContent ?? ''
    record(
      'تأكيد الإزالة عند الكمية = 1',
      text.includes('هل تريد إزالة هذا المنتج من السلة'),
      text.includes('الكمية الحالية 1') ? 'ظهر نص التأكيد مع تنبيه الكمية' : 'ظهر نص التأكيد',
    )
  } catch (error) {
    record('تأكيد الإزالة عند الكمية = 1', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* --------------- 6) كتالوج البيانات الأولية يُحمّل تلقائيًا --------------- */
{
  const { window, server, act } = await boot('/')
  try {
    await act(async () => {
      await sleep(700)
    })
    const rawProducts = window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.products`)
    const rawCustomers = window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.customers`)
    const rawOrders = window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.orders`)
    const products = JSON.parse(rawProducts ?? '[]')
    const customers = JSON.parse(rawCustomers ?? '[]')
    const orders = JSON.parse(rawOrders ?? '[]')
    const text = window.document.body.textContent ?? ''
    /* الشاشة الرئيسية تعرض أقسامًا فعلية من الكتالوج */
    const showsCatalog = text.includes('تسوق حسب القسم')
    record(
      'تحميل الكتالوج الأولي',
      products.length >= 40 && customers.length >= 5 && orders.length >= 10 && showsCatalog,
      `${products.length} منتج — ${customers.length} عميل — ${orders.length} طلب`,
    )
  } catch (error) {
    record('تحميل الكتالوج الأولي', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------------- 7) تطبيق كود خصم صالح عبر طبقة الخدمات ------------- */
{
  const { window, server, act } = await boot('/cart', {
    ...testFixtures(),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([
      { id: 'ci-1', productId: 'p-1', quantity: 2, options: {} },
    ]),
    [`sawqli.${STORAGE_VERSION}.coupons`]: JSON.stringify([
      {
        id: 'cp-test',
        code: 'SAWQLI10',
        type: 'percent',
        value: 10,
        minOrder: 100,
        usageLimit: 100,
        usedCount: 0,
        active: true,
        audience: 'all',
      },
    ]),
  })
  try {
    await act(async () => {
      await sleep(600)
    })
    const input = Array.from(window.document.querySelectorAll('input')).find((node) =>
      (node.getAttribute('placeholder') ?? '').includes('كود الخصم'),
    )
    if (!input) throw new Error('لم يتم العثور على حقل كود الخصم')
    await act(async () => {
      setValue(window, input, 'SAWQLI10')
    })
    const apply = findByText(window, 'تطبيق', 'button')
    if (!apply) throw new Error('لم يتم العثور على زر تطبيق')
    await act(async () => {
      click(window, apply)
    })
    /* طبقة الخدمات تُحاكي زمن استجابة الشبكة قبل التحقق */
    await act(async () => {
      await sleep(1200)
    })
    const text = window.document.body.textContent ?? ''
    const applied = text.includes('تم تطبيق كود الخصم')
    record('تطبيق كود خصم صالح', applied, applied ? 'ظهر شريط الخصم المطبّق' : text.slice(0, 120))
  } catch (error) {
    record('تطبيق كود خصم صالح', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------------- 8) رفض كود خصم غير صالح عبر طبقة الخدمات ------------- */
{
  const { window, server, act } = await boot('/cart', {
    ...testFixtures(),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([
      { id: 'ci-1', productId: 'p-1', quantity: 1, options: {} },
    ]),
  })
  try {
    await act(async () => {
      await sleep(600)
    })
    const input = Array.from(window.document.querySelectorAll('input')).find((node) =>
      (node.getAttribute('placeholder') ?? '').includes('كود الخصم'),
    )
    if (!input) throw new Error('لم يتم العثور على حقل كود الخصم')
    await act(async () => {
      setValue(window, input, 'NOT-A-CODE')
    })
    const apply = findByText(window, 'تطبيق', 'button')
    if (!apply) throw new Error('لم يتم العثور على زر تطبيق')
    await act(async () => {
      click(window, apply)
    })
    await act(async () => {
      await sleep(1200)
    })
    const text = window.document.body.textContent ?? ''
    record('رفض كود خصم غير صالح', text.includes('كود الخصم غير صالح'), 'ظهرت رسالة الرفض')
  } catch (error) {
    record('رفض كود خصم غير صالح', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ------- 9) رحلة شراء كاملة: سلة → دفع → مراجعة → تأكيد الطلب ------- */
{
  const { window, server, act } = await boot('/checkout', {
    ...testFixtures(),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.session.expiresAt`]: String(Date.now() + 3_600_000),
    [`sawqli.${STORAGE_VERSION}.products`]: JSON.stringify([TEST_PRODUCT]),
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([
      { id: 'ci-1', productId: 'p-1', quantity: 2, options: {} },
    ]),
  })
  try {
    await act(async () => {
      await sleep(900)
    })

    const clickByText = async (label, wait = 500) => {
      const node = Array.from(window.document.querySelectorAll('button')).find((item) =>
        (item.textContent ?? '').trim().includes(label),
      )
      if (!node) throw new Error(`لم يتم العثور على زر «${label}»`)
      if (node.disabled) throw new Error(`زر «${label}» معطّل`)
      await act(async () => {
        click(window, node)
      })
      await act(async () => {
        await sleep(wait)
      })
      return node
    }

    /* الخطوة 1: العنوان (يُنتقى الافتراضي تلقائيًا) → الدفع */
    await clickByText('متابعة إلى الدفع')

    /* الخطوة 2: اختيار الدفع عند الاستلام لتجنّب حقول البطاقة */
    const cod = Array.from(window.document.querySelectorAll('button')).find((node) =>
      (node.textContent ?? '').includes('الدفع عند الاستلام'),
    )
    if (!cod) throw new Error('لم يتم العثور على طريقة «الدفع عند الاستلام»')
    await act(async () => {
      click(window, cod)
    })
    await act(async () => {
      await sleep(400)
    })
    await clickByText('متابعة إلى المراجعة')

    /* الخطوة 3: الموافقة على الشروط ثم التأكيد */
    const agreeBox = Array.from(window.document.querySelectorAll('button[role="checkbox"]')).find((node) =>
      (node.textContent ?? '').includes('أوافق على'),
    )
    if (!agreeBox) throw new Error('لم يتم العثور على مربع الموافقة على الشروط')
    await act(async () => {
      click(window, agreeBox)
    })
    await act(async () => {
      await sleep(300)
    })

    await clickByText('تأكيد الطلب')

    /* طبقة الخدمات تُحاكي زمن معالجة الدفع (700–1200ms) قبل إنشاء الطلب */
    await act(async () => {
      await sleep(2800)
    })

    const path = window.location.pathname
    const orders = JSON.parse(window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.orders`) ?? '[]')
    const stock = JSON.parse(window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.products`) ?? '[]')
    /* أحدث طلب في النظام هو الذي أنشأناه للتو */
    const placed = orders
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((order) => order.items.some((item) => item.productId === 'p-1'))
    const remainingCart = JSON.parse(window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.cart`) ?? '[]')
    const text = window.document.body.textContent ?? ''

    const ok =
      path.startsWith('/order-success') &&
      Boolean(placed) &&
      placed.total > 0 &&
      stock[0]?.stock === TEST_PRODUCT.stock - 2 &&
      remainingCart.length === 0

    record(
      'رحلة شراء كاملة حتى تأكيد الطلب',
      ok,
      ok
        ? `الطلب ${placed.number} — الكمية 2 — الإجمالي ${placed.total} ر.س (شامل الضريبة ${placed.tax}) — المخزون ${stock[0].stock} بعد خصم 2 — السلة فارغة — ${text.includes('تم استلام طلبك') ? 'شاشة النجاح ظاهرة' : 'شاشة النجاح'}`
        : `المسار ${path} — الطلب ${placed?.number ?? 'غير موجود'} — المخزون ${stock[0]?.stock} — السلة ${remainingCart.length}`,
    )
  } catch (error) {
    record('رحلة شراء كاملة حتى تأكيد الطلب', false, String(error?.message ?? error))
  }
  /* إتاحة وقت تحميل حزم الصفحات المؤجلة قبل إغلاق الخادم */
  await sleep(500)
  await server.close()
}

/* ----------------- 10) إنشاء صفحة من مركز إدارة المحتوى ----------------- */
{
  const { window, server, act } = await boot('/admin/cms', {
    [`sawqli.${STORAGE_VERSION}.session.admin`]: 'true',
  })
  try {
    let pagesTab = findByText(window, 'الصفحات', 'button')
    for (let attempt = 0; attempt < 8 && !pagesTab; attempt++) {
      await act(async () => sleep(350))
      pagesTab = findByText(window, 'الصفحات', 'button')
    }
    if (!pagesTab) throw new Error(`لم يتم العثور على تبويب الصفحات في مركز المحتوى: ${(window.document.body.textContent ?? '').slice(0, 220)}`)
    await act(async () => click(window, pagesTab))
    const addPage = findByText(window, 'صفحة جديدة', 'button')
    if (!addPage) throw new Error('لم يتم العثور على زر إنشاء صفحة')
    await act(async () => click(window, addPage))
    await act(async () => sleep(150))

    const controlByLabel = (tag, label) => {
      const matchingLabel = Array.from(window.document.querySelectorAll('label')).find((node) => (node.textContent ?? '').includes(label))
      return matchingLabel?.parentElement?.querySelector(tag) ?? null
    }
    const titleInput = controlByLabel('input', 'عنوان الصفحة')
    const slugInput = controlByLabel('input', 'الرابط المختصر')
    const contentInput = controlByLabel('textarea', 'محتوى الصفحة')
    if (!titleInput || !slugInput || !contentInput) throw new Error('لم يتم العثور على حقول الصفحة')
    await act(async () => {
      setValue(window, titleInput, 'دليل المتجر')
      setValue(window, slugInput, 'store-guide')
      setValue(window, contentInput, 'معلومات مهمة للعملاء.')
    })
    const save = findByText(window, 'حفظ الصفحة', 'button')
    if (!save) throw new Error('لم يتم العثور على زر حفظ الصفحة')
    await act(async () => click(window, save))
    await act(async () => sleep(300))
    const pages = JSON.parse(window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.pages`) ?? '[]')
    const created = pages.find((page) => page.slug === 'store-guide' && page.title === 'دليل المتجر')
    record('إنشاء صفحة من مركز إدارة المحتوى', Boolean(created), created ? `تم حفظ الصفحة /pages/${created.slug}` : 'لم تحفظ الصفحة')
  } catch (error) {
    record('إنشاء صفحة من مركز إدارة المحتوى', false, String(error?.message ?? error))
  }
  await sleep(300)
  await server.close()
}

/* ----------- 11) إتمام طلب منتج رقمي بلا عنوان أو رسوم شحن ----------- */
{
  const digitalProduct = {
    ...TEST_PRODUCT,
    id: 'p-digital-flow',
    name: 'ملف رقمي للاختبار',
    sku: 'DIGITAL-FLOW-01',
    kind: 'digital',
    requiresShipping: false,
    deliveryInstructions: 'محتوى تسليم رقمي للاختبار.',
    trackStock: false,
    stock: 0,
    price: 49,
    categoryIds: ['c-digital'],
  }
  const { window, server, act } = await boot('/checkout', {
    [`sawqli.${STORAGE_VERSION}.products`]: JSON.stringify([digitalProduct]),
    [`sawqli.${STORAGE_VERSION}.customers`]: JSON.stringify([TEST_CUSTOMER]),
    [`sawqli.${STORAGE_VERSION}.session.customer`]: '"u-1"',
    [`sawqli.${STORAGE_VERSION}.session.expiresAt`]: String(Date.now() + 3600000),
    [`sawqli.${STORAGE_VERSION}.cart`]: JSON.stringify([{ id: 'ci-digital', productId: 'p-digital-flow', quantity: 1, options: {} }]),
  })
  try {
    const text = window.document.body.textContent ?? ''
    if (!text.includes('التسليم الرقمي أو تنفيذ الخدمة')) throw new Error('لم تظهر خطوات التسليم الرقمي')
    const continueButton = findByText(window, 'متابعة إلى الدفع', 'button')
    if (!continueButton) throw new Error('لم يتم العثور على زر الانتقال للدفع')
    await act(async () => click(window, continueButton))
    await act(async () => sleep(350))
    const codButton = findByText(window, 'الدفع عند الاستلام', 'button')
    if (codButton) throw new Error('ظهرت طريقة الدفع عند الاستلام لطلب رقمي')
    const wallet = findByText(window, 'محفظة إلكترونية', 'button')
    if (!wallet) throw new Error('لم تتوفر وسيلة دفع إلكترونية')
    await act(async () => click(window, wallet))
    await act(async () => sleep(200))
    const review = findByText(window, 'متابعة إلى المراجعة', 'button')
    if (!review) throw new Error('لم يظهر زر مراجعة الطلب')
    await act(async () => click(window, review))
    await act(async () => sleep(250))
    const agree = Array.from(window.document.querySelectorAll('button[role="checkbox"]')).find((node) =>
      (node.textContent ?? '').includes('أوافق على'),
    )
    if (!agree) throw new Error('لم يظهر تأكيد الشروط')
    await act(async () => click(window, agree))
    const confirm = findByText(window, 'تأكيد الطلب', 'button')
    if (!confirm) throw new Error('لم يظهر زر تأكيد الطلب')
    await act(async () => click(window, confirm))
    for (let attempt = 0; attempt < 15 && !(window.document.body.textContent ?? '').includes('تم استلام طلبك'); attempt++) {
      await act(async () => sleep(400))
    }
    const orders = JSON.parse(window.localStorage.getItem(`sawqli.${STORAGE_VERSION}.orders`) ?? '[]')
    const placed = orders.find((order) => order.items?.some((item) => item.productId === 'p-digital-flow'))
    const contentSaved = placed?.items?.[0]?.deliveryInstructions === digitalProduct.deliveryInstructions
    const orderWithoutShipping = window.location.pathname.startsWith('/order-success') && placed && !placed.address && placed.shipping === 0 && placed.codFee === 0
    const trackButton = findByText(window, 'عرض تفاصيل الطلب', 'button') ?? findByText(window, 'تتبع الطلب', 'button')
    if (!trackButton) throw new Error(`تم إنشاء الطلب لكن لم يظهر زر تفاصيل الطلب. المحتوى: ${(window.document.body.textContent ?? '').slice(-420)}`)
    await act(async () => click(window, trackButton))
    await act(async () => sleep(700))
    const detailText = window.document.body.textContent ?? ''
    const contentVisible = detailText.includes(digitalProduct.deliveryInstructions) && detailText.includes('تنزيل ملف نصي')
    const ok = orderWithoutShipping && contentSaved && contentVisible
    record('طلب منتج رقمي دون شحن', Boolean(ok), ok ? `الطلب ${placed.number} — بلا عنوان أو رسوم شحن مع تسليم المحتوى` : `المسار ${window.location.pathname} — طلب ${placed ? 'مُنشأ' : 'غير موجود'} — محتوى محفوظ ${contentSaved} — محتوى ظاهر ${contentVisible} — شحن ${placed?.shipping} — COD ${placed?.codFee} — عنوان ${Boolean(placed?.address)}`)
  } catch (error) {
    record('طلب منتج رقمي دون شحن', false, String(error?.message ?? error))
  }
  await sleep(300)
  await server.close()
}

/* ----------- 12) إعدادات واجهة المتجر القابلة للتخصيص ----------- */
{
  const { window, server, act } = await boot('/', {
    [`sawqli.${STORAGE_VERSION}.settings`]: JSON.stringify({
      navigationItems: [{ id: 'nav-custom-flow', label: 'كتالوجي', path: '/search', icon: 'search', enabled: true }],
      announcementBar: { enabled: true, text: 'رسالة المتجر', target: '/offers', background: '#123456', foreground: '#ffffff' },
    }),
  })
  try {
    const customNav = window.document.querySelector('a[href="/search"]')
    const announcementVisible = (window.document.body.textContent ?? '').includes('رسالة المتجر')
    if (!customNav || !(customNav.textContent ?? '').includes('كتالوجي') || !announcementVisible)
      throw new Error('لم تُطبّق روابط التنقل أو شريط الإعلان من الإعدادات')
    const dismiss = window.document.querySelector('button[aria-label="إغلاق الإعلان"]')
    if (!dismiss) throw new Error('لم يظهر زر إغلاق الإعلان')
    await act(async () => click(window, dismiss))
    await act(async () => sleep(100))
    const dismissed = !(window.document.body.textContent ?? '').includes('رسالة المتجر')
    record('تخصيص التنقل والإعلان', dismissed, 'ظهر الرابط والإعلان، ثم اختفى الإعلان عند الإغلاق')
  } catch (error) {
    record('تخصيص التنقل والإعلان', false, String(error?.message ?? error))
  }
  await sleep(300)
  await server.close()
}

const failed = results.filter((item) => !item.ok).length
console.log(failed === 0 ? '\nكل التدفقات نجحت ✅' : `\nفشل ${failed} تدفق ❌`)
process.exit(failed === 0 ? 0 : 1)

# سوقلي — Sawqli

واجهة متجر إلكتروني عربية (RTL) للأجهزة الإلكترونية والكهربائية — **واجهة فقط (Frontend Only)** بدون أي API أو خادم.
كل البيانات تجريبية (Seed) وتُحفظ في `localStorage`، لذا يعمل التطبيق بالكامل بدون إنترنت.

مبنية حسب الوثيقة التنفيذية `design md` (تطبيق العميل + لوحة الإدارة).

## التقنيات

| العنصر | التقنية |
| --- | --- |
| اللغة | TypeScript |
| الواجهة | React 19 + Vite 8 |
| التنسيق | Tailwind CSS v4 (CSS-first، بدون ملفات إعداد) |
| التنقل | React Router 7 |
| الأيقونات | lucide-react |
| الخط | Cairo Variable (مضمّن محليًا عبر `@fontsource-variable/cairo`) |
| الصور | كل الصور SVG مولّدة داخليًا (`src/lib/artwork.ts`) — لا تحتاج شبكة |

## التشغيل

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # بناء للإنتاج إلى dist/
npm run preview    # معاينة بناء الإنتاج على 4173
npm run typecheck  # فحص أنواع TypeScript
npm run smoke      # اختبار تصيير لكل المسارات (SSR + jsdom)
```

## النشر على Vercel

- Framework Preset: **Vite** (أو Other) — أمر البناء `npm run build`، ومجلد الإخراج `dist`.
- ملف `vercel.json` يحتوي على إعادة توجيه SPA لكل المسارات إلى `index.html` + ترويسات تخزين مؤقت للأصول.

## الحسابات التجريبية

| نوع الحساب | بيانات الدخول |
| --- | --- |
| لوحة الإدارة (`/admin`) | `haiderhajjah@gmail.com` / `2009` |
| عميل | `ahmed@example.com` / `123456` |
| عميل | `noura@example.com` / `123456` |
| عميل | `sultan@example.com` / `123456` |

## المسارات الرئيسية

- **تطبيق العميل:** `/`، `/search`، `/categories`، `/category/:id`، `/category/:id/products`، `/brand/:id`،
  `/product/:id`، `/product/:id/reviews`، `/cart`، `/checkout`، `/order-success/:id`، `/orders`، `/orders/:id`،
  `/wishlist`، `/offers`، `/pages/:slug`، `/login`، `/forgot-password`،
  `/account` (+ `/account/edit`، `/account/addresses`، `/account/payment-methods`، `/account/notifications`)، وصفحة 404.
- **لوحة الإدارة:** `/admin` (تسجيل دخول) و`/admin/dashboard`، `orders`، `orders/:id`، `products`، `products/new`،
  `products/:id/edit`، `categories`، `brands`، `customers`، `reviews`، `coupons`، `banners`، `reports`،
  `notifications`، `settings/:section` (9 أقسام)، `profile`.

## بنية المشروع

```
src/
  App.tsx                 # كل المسارات + الثيم + ScrollToTop + حماية المسارات
  main.tsx                # نقطة الدخول + الخط + إزالة شاشة التحميل الأولية
  index.css               # توكنات التصميم (@theme) والأنيميشن والأدوات
  types.ts                # نموذج البيانات الكامل
  data/seed.ts            # بيانات تجريبية كاملة (أقسام، منتجات، طلبات، كوبونات، صفحات...)
  lib/                    # utils، artwork (SVG)، i18n، pricing، query، orders
  store/                  # AppProviders: Toast → AppData → Language → Auth → Cart → Wishlist (localStorage)
  hooks/                  # useRequireAuth، useBack
  components/
    ui/                   # Button, form, overlay (Modal/BottomSheet/ConfirmDialog/Dropdown), display، Toast
    layout/               # AppShell, TopBar, BottomNav, Screen, BootScreen, ExpiredSessionModal
    customer/             # بطاقات المنتج، السلايدر، الفلاتر، المراجعات، المعرض، مودالات العناوين...
    admin/AdminUI.tsx     # عدة لوحة الإدارة: AdminPage, Card, StatCard, DataTable, LineChart, BarChart, DonutChart
  pages/                  # customer/ و admin/
scripts/smoke.mjs         # اختبار تصيير لكل المسارات (يستخدم src/smoke-entry.tsx)
```

## ملاحظات مهمة

- **لا يوجد خادم:** المصادقة، الطلبات، الكوبونات، الإشعارات... كلها محاكاة محلية. زر «استعادة البيانات التجريبية»
  في `الإعدادات → إعدادات تقنية` يعيد كل شيء لحالته الأولى.
- **حالات عامة مطبّقة:** شاشة تحميل مع انتقال لشاشة خطأ بعد 10 ثوانٍ، شريط انقطاع الاتصال (أحمر/أخضر)،
  تنبيه انتهاء الجلسة (يظهر بعد 30 دقيقة من تسجيل الدخول، ويمكن محاكاته من `الإعدادات → إعدادات تقنية`)،
  صفحة 404، وإشعارات Toast بأربعة أنواع (تختفي بعد 3 ثوانٍ، أو 5 مع زر إجراء).
- **تخصيص الهوية:** الألوان والنصوص قابلة للتعديل من لوحة الإدارة وتُطبَّق فورًا على التطبيق.

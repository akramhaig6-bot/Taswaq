/* ==========================================================================
   البيانات الأولية للمتجر — تُحمّل مرة واحدة عند أول تشغيل
   ========================================================================== */
import type {
  AppNotification,
  Banner,
  Brand,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  Review,
  Settings,
  StaticPage,
} from '@/types'
import { brandLogo, categoryImage } from '@/lib/artwork'
import { daysAgoIso } from '@/lib/utils'

/* ------------------------------ الأقسام ------------------------------ */
export const seedCategories: Category[] = [
  { id: 'c-phones', name: 'جوالات', nameEn: 'Phones', image: categoryImage('phone', '#4f46e5'), parentId: null, active: true, order: 1, description: 'أحدث الجوالات الذكية من جميع العلامات التجارية', icon: 'phone' },
  { id: 'c-laptops', name: 'لابتوبات', nameEn: 'Laptops', image: categoryImage('laptop', '#0284c7'), parentId: null, active: true, order: 2, description: 'لابتوبات للعمل والألعاب والدراسة', icon: 'laptop' },
  { id: 'c-home', name: 'أجهزة منزلية', nameEn: 'Home Appliances', image: categoryImage('fridge', '#059669'), parentId: null, active: true, order: 3, description: 'كل ما يحتاجه منزلك من أجهزة كهربائية', icon: 'fridge' },
  { id: 'c-tv', name: 'تلفزيونات', nameEn: 'TVs', image: categoryImage('tv', '#7c3aed'), parentId: null, active: true, order: 4, description: 'تلفزيونات ذكية بأحجام ودقات متعددة', icon: 'tv' },
  { id: 'c-audio', name: 'سماعات', nameEn: 'Headphones', image: categoryImage('headphones', '#db2777'), parentId: null, active: true, order: 5, description: 'سماعات لاسلكية وسلكية بجودة عالية', icon: 'headphones' },
  { id: 'c-cameras', name: 'كاميرات', nameEn: 'Cameras', image: categoryImage('camera', '#d97706'), parentId: null, active: true, order: 6, description: 'كاميرات احترافية وكاميرات مراقبة', icon: 'camera' },
  { id: 'c-gaming', name: 'أجهزة ألعاب', nameEn: 'Gaming', image: categoryImage('gamepad', '#dc2626'), parentId: null, active: true, order: 7, description: 'أجهزة وأذرع ألعاب وملحقاتها', icon: 'gamepad' },
  { id: 'c-printers', name: 'طابعات', nameEn: 'Printers', image: categoryImage('printer', '#475569'), parentId: null, active: true, order: 8, description: 'طابعات ليزر وحبرية للمنزل والمكتب', icon: 'printer' },
  { id: 'c-tools', name: 'أدوات كهربائية', nameEn: 'Electrical Tools', image: categoryImage('kettle', '#ea580c'), parentId: null, active: true, order: 9, description: 'أدوات ومستلزمات كهربائية متنوعة', icon: 'kettle' },
  /* أقسام فرعية */
  { id: 'c-phones-iphone', name: 'آيفون', image: categoryImage('phone', '#334155'), parentId: 'c-phones', active: true, order: 1 },
  { id: 'c-phones-android', name: 'جوالات أندرويد', image: categoryImage('phone', '#16a34a'), parentId: 'c-phones', active: true, order: 2 },
  { id: 'c-phones-accessories', name: 'إكسسوارات الجوال', image: categoryImage('watch', '#0891b2'), parentId: 'c-phones', active: true, order: 3 },
  { id: 'c-laptops-gaming', name: 'لابتوبات ألعاب', image: categoryImage('laptop', '#dc2626'), parentId: 'c-laptops', active: true, order: 1 },
  { id: 'c-laptops-pro', name: 'لابتوبات احترافية', image: categoryImage('monitor', '#4f46e5'), parentId: 'c-laptops', active: true, order: 2 },
  { id: 'c-home-washers', name: 'غسالات', image: categoryImage('washer', '#14b8a6'), parentId: 'c-home', active: true, order: 1 },
  { id: 'c-home-fridges', name: 'ثلاجات', image: categoryImage('fridge', '#22c55e'), parentId: 'c-home', active: true, order: 2 },
  { id: 'c-home-ac', name: 'مكيفات', image: categoryImage('ac', '#38bdf8'), parentId: 'c-home', active: true, order: 3 },
  { id: 'c-tools-kitchen', name: 'أدوات المطبخ', image: categoryImage('kettle', '#f97316'), parentId: 'c-tools', active: true, order: 1 },
]

/* --------------------------- العلامات التجارية --------------------------- */
const brandDefs: Array<[string, string]> = [
  ['Samsung', '#1e3a8a'],
  ['Apple', '#0f172a'],
  ['LG', '#a50034'],
  ['Sony', '#111827'],
  ['Xiaomi', '#f97316'],
  ['HP', '#0ea5e9'],
  ['Dell', '#0076ce'],
  ['Bosch', '#dc2626'],
  ['JBL', '#ea580c'],
  ['Canon', '#b91c1c'],
  ['Anker', '#0f766e'],
  ['Dyson', '#6d28d9'],
]

export const seedBrands: Brand[] = brandDefs.map(([name, color], i) => ({
  id: `b-${name.toLowerCase()}`,
  name,
  logo: brandLogo(name, color),
  active: true,
  order: i + 1,
}))

/* ------------------------------ المنتجات ------------------------------ */
/* يبدأ المتجر بدون منتجات — تُضاف المنتجات من لوحة الإدارة */
export const seedProducts: Product[] = []

/* ----------------------------- المراجعات ----------------------------- */
export const seedReviews: Review[] = []

/* ------------------------------ العملاء ------------------------------ */
/* يبدأ المتجر بدون عملاء — تُنشأ الحسابات من صفحة التسجيل */
export const seedCustomers: Customer[] = []

/* ------------------------------ الطلبات ------------------------------ */
export const seedOrders: Order[] = []

/* ------------------------------ الكوبونات ------------------------------ */
export const seedCoupons: Coupon[] = []

/* ------------------------------ البانرات ------------------------------ */
export const seedBanners: Banner[] = []

/* ------------------------------ الإشعارات ------------------------------ */
export const seedNotifications: AppNotification[] = []

/* ------------------------------ الصفحات ------------------------------ */
export const seedPages: StaticPage[] = [
  { id: 'pg-about', slug: 'about', title: 'عن التطبيق', active: true, content: 'سوقلي هو متجرك الإلكتروني الموثوق للأجهزة الإلكترونية والكهربائية في المملكة العربية السعودية.\n\nنوفّر تشكيلة واسعة من الجوالات واللابتوبات والأجهزة المنزلية والتلفزيونات والسماعات، مع ضمان الأصالة وخدمة توصيل سريعة لجميع المناطق.\n\nرؤيتنا: أن نكون الوجهة الأولى للتسوق الإلكتروني الموثوق، وأن نجعل تجربة الشراء بسيطة وممتعة لعملائنا.' },
  { id: 'pg-terms', slug: 'terms', title: 'الشروط والأحكام', active: true, content: 'مرحبًا بك في سوقلي. باستخدامك للتطبيق فإنك توافق على الشروط التالية:\n\n1. جميع الأسعار معروضة بالريال السعودي وتشمل ضريبة القيمة المضافة.\n2. يتم تأكيد الطلب بعد نجاح عملية الدفع أو تأكيد الدفع عند الاستلام.\n3. يحق للمتجر إلغاء الطلب في حال عدم توفّر المنتج، مع إعادة المبلغ كاملًا.\n4. الأسعار والعروض قابلة للتغيير دون إشعار مسبق.\n5. يُمنع استخدام التطبيق لأي أغراض غير قانونية أو مخالفة للأنظمة.' },
  { id: 'pg-privacy', slug: 'privacy', title: 'سياسة الخصوصية', active: true, content: 'نحن في سوقلي نحترم خصوصيتك ونحمي بياناتك.\n\n• نجمع البيانات اللازمة فقط لإتمام الطلب: الاسم، رقم الجوال، البريد الإلكتروني، وعنوان التوصيل.\n• لا نشارك بياناتك مع أي طرف ثالث خارج نطاق تنفيذ الطلب.\n• يتم تشفير بيانات الدفع ولا نحتفظ بأرقام البطاقات كاملة.\n• يمكنك طلب حذف حسابك وبياناتك في أي وقت من خلال صفحة تعديل الملف الشخصي.' },
  { id: 'pg-returns', slug: 'returns', title: 'سياسة الاسترجاع', active: true, content: 'نضمن لك تجربة شراء مريحة:\n\n• يمكن استرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية مع التغليف والملحقات.\n• لا يشمل الاسترجاع المنتجات التي تم استخدامها أو تعرّضت للتلف.\n• يتم تنفيذ الاسترجاع عبر خدمة العملاء من خلال صفحة "تواصل معنا".\n• تُعاد المبالغ إلى نفس وسيلة الدفع خلال 7 إلى 14 يوم عمل.' },
  { id: 'pg-contact', slug: 'contact', title: 'تواصل معنا', active: true, content: 'يسعدنا خدمتك في أي وقت:\n\n• الجوال: 0551234567\n• البريد الإلكتروني: support@sawqli.sa\n• واتساب: 0551234567\n• العنوان: الرياض — حي العليا — طريق الملك فهد\n\nأوقات العمل: من الأحد إلى الخميس، 9 صباحًا حتى 6 مساءً.' },
  { id: 'pg-faq', slug: 'faq', title: 'الأسئلة الشائعة', active: true, content: 'كم يستغرق التوصيل؟\nمن 1 إلى 3 أيام عمل داخل المدن الرئيسية، ومن 3 إلى 5 أيام لبقية المناطق.\n\nهل يمكنني الدفع عند الاستلام؟\nنعم، الدفع عند الاستلام متاح مع رسوم إضافية بسيطة.\n\nهل المنتجات أصلية؟\nجميع منتجاتنا أصلية ومضمونة ومستوردة عبر موزّعين معتمدين.' },
]

/* ------------------------------ الإعدادات ------------------------------ */
export const seedSettings: Settings = {
  storeName: 'سوقلي',
  logoText: 'سوقلي',
  copyright: '© 2026 سوقلي. جميع الحقوق محفوظة.',
  version: '1.0.0',
  currency: 'ر.س',
  colors: { primary: '#7c3aed', secondary: '#2563eb', success: '#16a34a', danger: '#dc2626' },
  contact: {
    phone: '0551234567',
    email: 'support@sawqli.sa',
    whatsapp: '0551234567',
    address: 'الرياض — حي العليا — طريق الملك فهد',
    facebook: 'https://facebook.com/sawqli',
    instagram: 'https://instagram.com/sawqli',
    twitter: 'https://x.com/sawqli',
    tiktok: '',
  },
  tax: { enabled: true, rate: 15, inclusive: false },
  shipping: {
    freeOver: 500,
    methods: [
      { id: 'sh-fast', name: 'توصيل سريع (24 ساعة)', fee: 25, enabled: true, eta: '24 ساعة' },
      { id: 'sh-normal', name: 'توصيل عادي', fee: 15, enabled: true, eta: '2 - 4 أيام' },
      { id: 'sh-pickup', name: 'استلام من الفرع', fee: 0, enabled: true, eta: 'خلال ساعة' },
    ],
  },
  codFee: 15,
  paymentMethods: [
    { id: 'pm-cod', kind: 'cod', name: 'الدفع عند الاستلام', description: 'ادفع نقدًا عند استلام طلبك.', enabled: true, extraFee: 15 },
    { id: 'pm-card', kind: 'card', name: 'بطاقة ائتمان أو مدى', description: 'فيزا، ماستركارد، ومدى.', enabled: true, extraFee: 0 },
    { id: 'pm-wallet', kind: 'wallet', name: 'محفظة إلكترونية', description: 'Apple Pay، STC Pay، وغيرها.', enabled: true, extraFee: 0 },
    { id: 'pm-bank', kind: 'bank', name: 'تحويل بنكي', description: 'التحويل على حساب المتجر البنكي.', enabled: true, extraFee: 0, bankDetails: 'مصرف الراجحي — IBAN: SA03 8000 0000 6080 1016 7519 — باسم: مؤسسة سوقلي التجارية', instructions: 'يرجى تحويل المبلغ ثم إرسال الإيصال على واتساب الدعم لإتمام الطلب.' },
  ],
  cities: [
    { id: 'city-riyadh', name: 'الرياض', fee: 0 },
    { id: 'city-jeddah', name: 'جدة', fee: 0 },
    { id: 'city-makkah', name: 'مكة المكرمة', fee: 10 },
    { id: 'city-madinah', name: 'المدينة المنورة', fee: 10 },
    { id: 'city-dammam', name: 'الدمام', fee: 0 },
    { id: 'city-khobar', name: 'الخبر', fee: 0 },
    { id: 'city-abha', name: 'أبها', fee: 20 },
    { id: 'city-tabuk', name: 'تبوك', fee: 20 },
    { id: 'city-hail', name: 'حائل', fee: 20 },
    { id: 'city-jazan', name: 'جازان', fee: 25 },
    { id: 'city-qassim', name: 'القصيم', fee: 15 },
    { id: 'city-najran', name: 'نجران', fee: 25 },
  ],
  languages: [
    { code: 'ar', name: 'العربية', active: true, isDefault: true },
    { code: 'en', name: 'English', active: true, isDefault: false },
  ],
  defaultLanguage: 'ar',
  popularSearches: ['آيفون', 'جوال سامسونج', 'لابتوب', 'سماعات لاسلكية', 'تلفزيون 4K', 'غسالة أوتوماتيك', 'مكيف إنفرتر', 'ساعة ذكية'],
  lowStockThreshold: 5,
  deals: {
    start: daysAgoIso(3),
    end: new Date(Date.now() + 26 * 3600000).toISOString(),
    hideWhenExpired: false,
  },
  sections: [
    { id: 'sec-banners', kind: 'banners', title: 'بانرات ترويجية', layout: 'row', enabled: true, order: 1 },
    { id: 'sec-categories', kind: 'categories', title: 'تسوق حسب القسم', layout: 'row', enabled: true, order: 2 },
    { id: 'sec-deals', kind: 'deals', title: 'عروض اليوم', layout: 'row', enabled: true, order: 3, limit: 8 },
    { id: 'sec-best', kind: 'best', title: 'الأكثر مبيعًا', layout: 'grid', enabled: true, order: 4, limit: 6 },
    { id: 'sec-new', kind: 'new', title: 'وصل حديثًا', layout: 'row', enabled: true, order: 5, limit: 8 },
    { id: 'sec-brands', kind: 'brands', title: 'تسوق حسب العلامة التجارية', layout: 'row', enabled: true, order: 6 },
    { id: 'sec-audio', kind: 'custom', title: 'سماعات وأجهزة صوتية', layout: 'row', enabled: true, order: 7, limit: 8, filter: { categoryIds: ['c-audio'] } },
  ],
  technical: {
    maintenanceMode: false,
    supportPhone: '0551234567',
    analyticsId: '',
    enableReviews: true,
  },
}

/* --------------------------- حساب مدير النظام --------------------------- */
export const seedAdmin = {
  name: 'هيدر حجاج',
  email: 'haiderhajjah@gmail.com',
  password: '2009',
}


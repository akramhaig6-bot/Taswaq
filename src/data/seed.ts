/* ==========================================================================
   بيانات تجريبية (Seed) — تُحمّل مرة واحدة في LocalStorage
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
  ProductOption,
  ProductVariant,
  Review,
  Settings,
  StaticPage,
} from '@/types'
import { brandLogo, categoryImage, productImage, type GlyphKind } from '@/lib/artwork'
import { daysAgoIso, uid } from '@/lib/utils'
import { buildTimeline } from '@/lib/orders'

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
type OptionPreset = 'phone' | 'laptop' | 'tv' | 'appliance' | 'none'

interface PDef {
  n: string
  k: GlyphKind
  b: string
  c: string
  price: number
  was?: number
  stock: number
  sp: Array<[string, string]>
  opts?: OptionPreset
  desc?: string
  isNew?: boolean
  best?: boolean
  feat?: boolean
  tags?: string[]
  sales?: number
  weight?: number
  dimensions?: string
}

const OPTION_PRESETS: Record<OptionPreset, () => ProductOption[]> = {
  phone: () => [
    {
      id: 'o-color',
      type: 'color',
      label: 'اللون',
      values: [
        { id: 'v-black', label: 'أسود', hex: '#111827', available: true },
        { id: 'v-white', label: 'أبيض', hex: '#f8fafc', available: true },
        { id: 'v-blue', label: 'أزرق', hex: '#2563eb', available: true },
        { id: 'v-gold', label: 'ذهبي', hex: '#d4a373', available: true },
        { id: 'v-purple', label: 'بنفسجي', hex: '#7c3aed', available: false },
      ],
    },
    {
      id: 'o-storage',
      type: 'storage',
      label: 'السعة التخزينية',
      values: [
        { id: 'v-128', label: '128GB', priceDelta: 0, stock: 12, available: true },
        { id: 'v-256', label: '256GB', priceDelta: 350, stock: 8, available: true },
        { id: 'v-512', label: '512GB', priceDelta: 900, stock: 4, available: true },
        { id: 'v-1tb', label: '1TB', priceDelta: 1700, stock: 0, available: false },
      ],
    },
  ],
  laptop: () => [
    {
      id: 'o-color',
      type: 'color',
      label: 'اللون',
      values: [
        { id: 'v-silver', label: 'فضي', hex: '#cbd5e1', available: true },
        { id: 'v-gray', label: 'رمادي', hex: '#475569', available: true },
        { id: 'v-black', label: 'أسود', hex: '#111827', available: true },
      ],
    },
    {
      id: 'o-storage',
      type: 'storage',
      label: 'مساحة التخزين',
      values: [
        { id: 'v-512', label: '512GB SSD', priceDelta: 0, stock: 9, available: true },
        { id: 'v-1tb', label: '1TB SSD', priceDelta: 600, stock: 5, available: true },
        { id: 'v-2tb', label: '2TB SSD', priceDelta: 1500, stock: 2, available: true },
      ],
    },
  ],
  tv: () => [
    {
      id: 'o-size',
      type: 'size',
      label: 'المقاس',
      values: [
        { id: 'v-43', label: '43 بوصة', priceDelta: 0, stock: 7, available: true },
        { id: 'v-55', label: '55 بوصة', priceDelta: 700, stock: 5, available: true },
        { id: 'v-65', label: '65 بوصة', priceDelta: 1600, stock: 3, available: true },
        { id: 'v-75', label: '75 بوصة', priceDelta: 3200, stock: 0, available: false },
      ],
    },
  ],
  appliance: () => [
    {
      id: 'o-size',
      type: 'size',
      label: 'الحجم',
      values: [
        { id: 'v-small', label: 'صغير', priceDelta: 0, stock: 6, available: true },
        { id: 'v-medium', label: 'متوسط', priceDelta: 450, stock: 4, available: true },
        { id: 'v-large', label: 'كبير', priceDelta: 1100, stock: 3, available: true },
      ],
    },
    {
      id: 'o-color',
      type: 'color',
      label: 'اللون',
      values: [
        { id: 'v-white', label: 'أبيض', hex: '#f8fafc', available: true },
        { id: 'v-silver', label: 'فضي', hex: '#cbd5e1', available: true },
        { id: 'v-black', label: 'أسود', hex: '#111827', available: false },
      ],
    },
  ],
  none: () => [],
}

function buildVariants(options: ProductOption[], basePrice: number): ProductVariant[] {
  if (options.length === 0) return []
  const [first, second] = options
  const variants: ProductVariant[] = []
  const valuesA = first?.values ?? []
  const valuesB = second?.values ?? [undefined]
  valuesA.forEach((a) => {
    valuesB.forEach((b) => {
      if (!a.available) return
      if (b && !b.available) return
      const combination: Record<string, string> = { [first.id]: a.id }
      if (b) combination[second.id] = b.id
      const price = basePrice + (a.priceDelta ?? 0) + (b?.priceDelta ?? 0)
      const stock = Math.min(a.stock ?? 6, b?.stock ?? 6)
      variants.push({
        id: `var-${a.id}-${b?.id ?? 'x'}`,
        combination,
        sku: `SKU-${a.id}-${b?.id ?? 'x'}`.toUpperCase(),
        price,
        stock,
      })
    })
  })
  return variants
}

const productDefs: PDef[] = [
  /* ---------------------------- جوالات ---------------------------- */
  {
    n: 'آيفون 16 برو ماكس', k: 'phone', b: 'Apple', c: 'c-phones-iphone', price: 5499, was: 5999, stock: 14,
    opts: 'phone', isNew: true, best: true, feat: true, sales: 320, tags: ['جوالات', 'آيفون', 'جديد'], weight: 0.23, dimensions: '16 × 7.7 × 0.8 سم',
    sp: [['الشاشة', '6.9 بوصة Super Retina XDR'], ['المعالج', 'Apple A18 Pro'], ['الكاميرا', '48 ميجابكسل ثلاثية'], ['البطارية', '4685 mAh'], ['النظام', 'iOS 18'], ['المقاومة', 'IP68 ضد الماء والغبار']],
    desc: 'آيفون 16 برو ماكس بتصميم من التيتانيوم وأداء استثنائي بمعالج A18 Pro. شاشة غاية في الوضوح بمعدل تحديث 120Hz، وكاميرا احترافية تصوّر فيديو بدقة 4K بمعدل 120 إطارًا في الثانية. البطارية تدوم لليوم كامل مع دعم الشحن السريع.',
  },
  {
    n: 'آيفون 15', k: 'phone', b: 'Apple', c: 'c-phones-iphone', price: 3299, was: 3699, stock: 22,
    opts: 'phone', best: true, sales: 410, tags: ['جوالات', 'آيفون'], weight: 0.17, dimensions: '14.7 × 7.1 × 0.7 سم',
    sp: [['الشاشة', '6.1 بوصة Super Retina XDR'], ['المعالج', 'Apple A16 Bionic'], ['الكاميرا', '48 ميجابكسل مزدوجة'], ['البطارية', '3349 mAh'], ['الشحن', 'USB-C']],
    desc: 'آيفون 15 بكاميرا بدقة 48 ميجابكسل ومنفذ USB-C لأول مرة. تصميم زجاجي متين وأداء سريع بمعالج A16 Bionic يناسب الاستخدام اليومي والتصوير الاحترافي.',
  },
  {
    n: 'سامسونج جالاكسي S24 ألترا', k: 'phone', b: 'Samsung', c: 'c-phones-android', price: 4899, was: 5299, stock: 9,
    opts: 'phone', isNew: true, best: true, feat: true, sales: 275, tags: ['جوالات', 'سامسونج', 'جديد'], weight: 0.23, dimensions: '16.2 × 7.9 × 0.9 سم',
    sp: [['الشاشة', '6.8 بوصة Dynamic AMOLED 2X'], ['المعالج', 'Snapdragon 8 Gen 3'], ['الكاميرا', '200 ميجابكسل رباعية'], ['البطارية', '5000 mAh'], ['الذاكرة', '12 جيجابايت رام'], ['القلم', 'S Pen مدمج']],
    desc: 'جالاكسي S24 ألترا مع قلم S Pen المدمج وشاشة AMOLED بمعدل 120Hz. كاميرا 200 ميجابكسل تلتقط أدق التفاصيل، ومعالج Snapdragon 8 Gen 3 يوفّر أداءً فائقًا لمهام الذكاء الاصطناعي على الجهاز.',
  },
  {
    n: 'شاومي ريدمي نوت 14 برو', k: 'phone', b: 'Xiaomi', c: 'c-phones-android', price: 1299, was: 1499, stock: 31,
    opts: 'phone', best: true, sales: 520, tags: ['جوالات', 'شاومي', 'اقتصادي'], weight: 0.19,
    sp: [['الشاشة', '6.67 بوصة AMOLED'], ['المعالج', 'Snapdragon 7s Gen 3'], ['الكاميرا', '200 ميجابكسل'], ['البطارية', '5110 mAh'], ['الشحن', '67 واط سريع']],
    desc: 'ريدمي نوت 14 برو يقدّم قيمة ممتازة مقابل السعر: شاشة AMOLED، كاميرا 200 ميجابكسل، وشحن سريع بقوة 67 واط. الخيار الأمثل لمن يبحث عن أداء قوي بسعر مناسب.',
  },
  {
    n: 'أوبو رينو 12', k: 'phone', b: 'Xiaomi', c: 'c-phones-android', price: 1899, stock: 17,
    opts: 'phone', isNew: true, sales: 130, tags: ['جوالات', 'أوبو'], weight: 0.18,
    sp: [['الشاشة', '6.7 بوصة AMOLED منحنية'], ['المعالج', 'Dimensity 8250'], ['الكاميرا', '50 ميجابكسل ثلاثية'], ['البطارية', '5000 mAh'], ['الشحن', '80 واط']],
    desc: 'أوبو رينو 12 بتصميم أنيق وخفيف، وكاميرا بورتريه احترافية. شحن سريع 80 واط يعبّئ البطارية في أقل من 45 دقيقة.',
  },
  {
    n: 'ساعة سامسونج جالاكسي واتش 7', k: 'watch', b: 'Samsung', c: 'c-phones-accessories', price: 1099, was: 1299, stock: 24,
    sales: 190, tags: ['إكسسوارات', 'ساعات ذكية'],
    sp: [['الشاشة', '1.5 بوصة Super AMOLED'], ['البطارية', '425 mAh'], ['المقاومة', '5ATM + IP68'], ['القياسات', 'معدل النبض، الأكسجين، النوم'], ['التوافق', 'Android / iOS']],
    desc: 'ساعة ذكية بتتبع دقيق للنشاط والصحة على مدار الساعة، مع قياس معدل النبض ونسبة الأكسجين وجودة النوم. مقاومة للماء حتى 50 متر.',
  },
  {
    n: 'شاحن أنكر السريع 65 واط', k: 'router', b: 'Anker', c: 'c-phones-accessories', price: 189, was: 249, stock: 60,
    sales: 640, tags: ['إكسسوارات', 'شواحن'],
    sp: [['القدرة', '65 واط'], ['المنافذ', '2 × USB-C + USB-A'], ['التقنية', 'GaN II'], ['التوافق', 'جميع الجوالات واللابتوبات']],
    desc: 'شاحن أنكر بتقنية GaN II بحجم صغير وقدرة 65 واط، يشحن اللابتوب والجوال في نفس الوقت بأمان تام.',
  },
  /* ---------------------------- لابتوبات ---------------------------- */
  {
    n: 'ماك بوك برو 14 بوصة M4', k: 'laptop', b: 'Apple', c: 'c-laptops-pro', price: 8499, was: 9299, stock: 6,
    opts: 'laptop', feat: true, best: true, sales: 95, tags: ['لابتوبات', 'آبل', 'احترافي'], weight: 1.55, dimensions: '31.2 × 22.1 × 1.5 سم',
    sp: [['المعالج', 'Apple M4 Pro 12 نواة'], ['الشاشة', '14.2 بوصة Liquid Retina XDR'], ['الذاكرة', '18 جيجابايت موحدة'], ['البطارية', 'حتى 18 ساعة'], ['المنافذ', '3 × Thunderbolt + HDMI + SD'], ['النظام', 'macOS Sequoia']],
    desc: 'ماك بوك برو 14 بمعالج M4 Pro وأداء مذهل لمونتاج الفيديو والبرمجة. شاشة Liquid Retina XDR بتقنية ProMotion، وبطارية تدوم حتى 18 ساعة متواصلة.',
  },
  {
    n: 'لابتوب ديل XPS 15', k: 'laptop', b: 'Dell', c: 'c-laptops-pro', price: 6899, was: 7599, stock: 8,
    opts: 'laptop', sales: 110, tags: ['لابتوبات', 'ديل'], weight: 1.86,
    sp: [['المعالج', 'Intel Core i7-13700H'], ['الشاشة', '15.6 بوصة OLED 3.5K'], ['الذاكرة', '16 جيجابايت DDR5'], ['كرت الرسوم', 'RTX 4050'], ['التخزين', '512GB SSD NVMe']],
    desc: 'ديل XPS 15 يجمع بين شاشة OLED مذهلة بأداء قوي في هيكل من الألومنيوم. مناسب للمصممين والمهندسين والباحثين عن لابتوب فاخر متعدد الاستخدامات.',
  },
  {
    n: 'لابتوب HP OmniBook 5', k: 'laptop', b: 'HP', c: 'c-laptops', price: 2499, was: 2899, stock: 19,
    opts: 'laptop', best: true, sales: 240, tags: ['لابتوبات', 'HP', 'دراسة'], weight: 1.4,
    sp: [['المعالج', 'Intel Core 5 120U'], ['الشاشة', '15.6 بوصة FHD'], ['الذاكرة', '8 جيجابايت DDR5'], ['التخزين', '512GB SSD'], ['البطارية', 'حتى 12 ساعة']],
    desc: 'لابتوب HP OmniBook 5 للاستخدام اليومي والدراسة والعمل المكتبي، ببطارية طويلة وكيبورد مريح وشاشة واضحة.',
  },
  {
    n: 'لابتوب ألعاب ASUS ROG Strix', k: 'laptop', b: 'Dell', c: 'c-laptops-gaming', price: 7999, was: 8799, stock: 4,
    opts: 'laptop', isNew: true, feat: true, sales: 60, tags: ['لابتوبات', 'ألعاب'], weight: 2.9,
    sp: [['المعالج', 'AMD Ryzen 9 7945HX'], ['كرت الرسوم', 'RTX 4070 8GB'], ['الشاشة', '16 بوصة 240Hz QHD'], ['الذاكرة', '32 جيجابايت DDR5'], ['التبريد', 'نظام تبريد سائل معدني']],
    desc: 'لابتوب ألعاب بمعدل تحديث 240Hz وبطاقة رسوميات RTX 4070، مصمم لتشغيل أحدث الألعاب بإعدادات عالية دون أي تهنيج.',
  },
  {
    n: 'شاشة سامسونج ذكية 27 بوصة', k: 'monitor', b: 'Samsung', c: 'c-laptops-pro', price: 1499, stock: 13,
    sales: 145, tags: ['شاشات'],
    sp: [['المقاس', '27 بوصة QHD'], ['معدل التحديث', '75Hz'], ['المنافذ', 'HDMI + USB-C'], ['الميزات', 'شاشة ذكية بنظام Tizen']],
    desc: 'شاشة ذكية بدقة QHD تدعم تطبيقات البث مباشرة دون الحاجة لجهاز إضافي، مع منفذ USB-C للشحن ونقل البيانات.',
  },
  /* --------------------------- أجهزة منزلية --------------------------- */
  {
    n: 'غسالة LG أوتوماتيك 9 كيلو', k: 'washer', b: 'LG', c: 'c-home-washers', price: 2299, was: 2699, stock: 11,
    opts: 'appliance', best: true, sales: 175, tags: ['أجهزة منزلية', 'غسالات'], weight: 62,
    sp: [['السعة', '9 كيلوجرام'], ['المحرك', 'Inverter Direct Drive'], ['السرعة', '1400 لفة/دقيقة'], ['البرامج', '14 برنامج غسيل'], ['الضمان', '10 سنوات على المحرك']],
    desc: 'غسالة أوتوماتيك بتقنية المحرك المباشر الهادئ وموفّرة للطاقة والماء. 14 برنامجًا للغسيل تناسب جميع أنواع الأقمشة.',
  },
  {
    n: 'غسالة Bosch 8 كيلو', k: 'washer', b: 'Bosch', c: 'c-home-washers', price: 2749, stock: 7,
    opts: 'appliance', sales: 90, tags: ['أجهزة منزلية', 'غسالات'],
    sp: [['السعة', '8 كيلوجرام'], ['التقنية', 'EcoSilence Drive'], ['مستوى الضجيج', '47 ديسيبل'], ['الضمان', '5 سنوات']],
    desc: 'غسالة بوش الألمانية بتقنية EcoSilence الهادئة جدًا وموفّرة للطاقة بدرجة A+++. مثالية للشقق ذات المساحات الصغيرة.',
  },
  {
    n: 'ثلاجة سامسونج بابين 620 لتر', k: 'fridge', b: 'Samsung', c: 'c-home-fridges', price: 3799, was: 4299, stock: 5,
    opts: 'appliance', feat: true, sales: 70, tags: ['أجهزة منزلية', 'ثلاجات'], weight: 96,
    sp: [['السعة', '620 لتر'], ['النوع', 'بابين مع فريزر سفلي'], ['التقنية', 'تبريد Twin Cooling Plus'], ['الميزات', 'موزّع ماء ومكعبات ثلج'], ['الكفاءة', 'A++']],
    desc: 'ثلاجة واسعة بتقنية التبريد المزدوج التي تحافظ على نضارة الأطعمة وتمنع اختلاط الروائح، مع موزّع ماء مبرد من الباب.',
  },
  {
    n: 'مكيف سبليت LG إنفرتر 18000 وحدة', k: 'ac', b: 'LG', c: 'c-home-ac', price: 2199, was: 2499, stock: 14,
    opts: 'appliance', best: true, sales: 210, tags: ['أجهزة منزلية', 'مكيفات'],
    sp: [['القدرة', '18000 وحدة'], ['التقنية', 'Dual Inverter Compressor'], ['التوفير', 'حتى 70% طاقة'], ['الفلاتر', 'فلتر مضاد للبكتيريا'], ['الغاز', 'R32 صديق للبيئة']],
    desc: 'مكيف إنفرتر موفّر للطاقة بضاغط Dual Inverter يعمل بهدوء تام، مع فلتر مضاد للبكتيريا ومبيد للحشرات لتنقية الهواء.',
  },
  {
    n: 'مكيف ميديا إنفرتر 24000 وحدة', k: 'ac', b: 'Bosch', c: 'c-home-ac', price: 3199, stock: 6,
    opts: 'appliance', sales: 55, tags: ['أجهزة منزلية', 'مكيفات'],
    sp: [['القدرة', '24000 وحدة'], ['التقنية', 'إنفرتر كامل'], ['التدفئة', 'تدفئة وتبريد'], ['الفلاتر', 'فلتر هواء متعدد الطبقات']],
    desc: 'مكيف بارد وساخن بقدرة 24000 وحدة للأماكن الواسعة، مع ضاغط إنفرتر يوفر استهلاك الكهرباء بشكل ملحوظ.',
  },
  {
    n: 'ميكروويف سامسونج 32 لتر', k: 'microwave', b: 'Samsung', c: 'c-home', price: 649, was: 799, stock: 26,
    opts: 'none', sales: 300, tags: ['أجهزة منزلية', 'مطبخ'],
    sp: [['السعة', '32 لتر'], ['القدرة', '900 واط'], ['الوظائف', 'شواء + تسخين'], ['الشاشة', 'ديجيتال'], ['الضمان', 'سنتان']],
    desc: 'ميكروويف بوظيفة الشواء والقدرة على طهي مجموعة متنوعة من الأطباق مع التحكم الرقمي السهل والتنظيف الميسّر.',
  },
  {
    n: 'مكنسة دايسون لاسلكية V12', k: 'vacuum', b: 'Dyson', c: 'c-home', price: 2799, was: 3199, stock: 9,
    opts: 'none', feat: true, sales: 120, tags: ['أجهزة منزلية', 'تنظيف'], weight: 2.2,
    sp: [['النوع', 'لاسلكية'], ['زمن التشغيل', 'حتى 60 دقيقة'], ['الشفط', 'قوة شفط عالية مع شاشة LCD'], ['الفلاتر', 'HEPA كامل'], ['الوزن', '2.2 كجم']],
    desc: 'مكنسة دايسون لاسلكية خفيفة الوزن بقوة شفط عالية وتقنية عرض الجزيئات بالليزر. تعمل حتى 60 دقيقة بشحنة واحدة.',
  },
  {
    n: 'غلاية ماء كهربائية 1.7 لتر', k: 'kettle', b: 'Bosch', c: 'c-tools-kitchen', price: 149, was: 199, stock: 48,
    opts: 'none', best: true, sales: 720, tags: ['أدوات كهربائية', 'مطبخ'],
    sp: [['السعة', '1.7 لتر'], ['القدرة', '2200 واط'], ['المادة', 'ستانلس ستيل'], ['الميزات', 'إطفاء تلقائي + مؤشر ضوئي']],
    desc: 'غلاية سريعة بقدرة 2200 واط تغلي الماء في دقائق، مع إطفاء تلقائي عند الغليان وقاعدة دوارة 360 درجة.',
  },
  {
    n: 'خلاط كهربائي 1200 واط', k: 'blender', b: 'Bosch', c: 'c-tools-kitchen', price: 399, was: 479, stock: 22,
    opts: 'none', sales: 260, tags: ['أدوات كهربائية', 'مطبخ'],
    sp: [['القدرة', '1200 واط'], ['السرعة', '5 سرعات + نبض'], ['الوعاء', 'زجاج 1.5 لتر'], ['الشفرة', 'ستانلس ستيل 4 شفرات']],
    desc: 'خلاط قوي بوعاء زجاجي يتحمل الحرارة، مثالي للعصائر والصلصات والمهروس مع 5 سرعات للتحكم الكامل.',
  },
  /* ---------------------------- تلفزيونات ---------------------------- */
  {
    n: 'تلفزيون سامسونج Neo QLED 4K', k: 'tv', b: 'Samsung', c: 'c-tv', price: 5299, was: 6299, stock: 8,
    opts: 'tv', best: true, feat: true, sales: 88, tags: ['تلفزيونات', '4K'], weight: 18,
    sp: [['الدقة', '4K UHD'], ['التقنية', 'Neo QLED مع Mini LED'], ['معدل التحديث', '120Hz'], ['النظام', 'Tizen Smart TV'], ['الصوت', 'صوت محيطي Dolby Atmos']],
    desc: 'تلفزيون Neo QLED بتقنية Mini LED لإضاءة دقيقة وتباين عميق. معدل تحديث 120Hz مثالي للأفلام والرياضة والألعاب.',
  },
  {
    n: 'تلفزيون LG OLED evo C4', k: 'tv', b: 'LG', c: 'c-tv', price: 6999, was: 7999, stock: 5,
    opts: 'tv', isNew: true, feat: true, sales: 62, tags: ['تلفزيونات', 'OLED'],
    sp: [['الدقة', '4K UHD'], ['التقنية', 'OLED evo'], ['المعالج', 'α9 الجيل السابع'], ['الميزات', 'G-SYNC + FreeSync'], ['النظام', 'webOS 24']],
    desc: 'تلفزيون OLED بألوان لا نهائية وأسود مطلق، مع دعم ألعاب بمعدل 144Hz وتقنيات منع التقطيع. تجربة سينمائية حقيقية في منزلك.',
  },
  {
    n: 'تلفزيون سوني Bravia 55 بوصة', k: 'tv', b: 'Sony', c: 'c-tv', price: 3499, stock: 12,
    opts: 'tv', sales: 140, tags: ['تلفزيونات', 'سوني'],
    sp: [['الدقة', '4K HDR'], ['المعالج', 'X1 4K HDR'], ['النظام', 'Google TV'], ['الصوت', 'صوت Acoustic Surface'], ['المنافذ', '4 × HDMI']],
    desc: 'تلفزيون سوني بنظام Google TV ومعالج X1 الذي يعزز تفاصيل الصورة. تجربة ذكية بمكتبة ضخمة من التطبيقات.',
  },
  /* ----------------------------- سماعات ----------------------------- */
  {
    n: 'سماعة سوني WH-1000XM5', k: 'headphones', b: 'Sony', c: 'c-audio', price: 1599, was: 1899, stock: 20,
    opts: 'none', best: true, feat: true, sales: 380, tags: ['سماعات', 'عزل ضوضاء'], weight: 0.25,
    sp: [['النوع', 'فوق الأذن لاسلكية'], ['عزل الضوضاء', '8 ميكروفونات NC'], ['البطارية', 'حتى 30 ساعة'], ['الشحن السريع', '3 دقائق = 3 ساعات'], ['الاتصال', 'Bluetooth 5.2 متعدد الأجهزة']],
    desc: 'سماعة سوني بأفضل تقنية عزل ضوضاء في فئتها، وصوت عالي الدقة مع بطارية تدوم 30 ساعة. مريحة للاستخدام الطويل في العمل والسفر.',
  },
  {
    n: 'سماعة JBL Tune 770NC', k: 'headphones', b: 'JBL', c: 'c-audio', price: 449, was: 549, stock: 35,
    opts: 'none', best: true, sales: 610, tags: ['سماعات', 'جيه بي إل'],
    sp: [['النوع', 'فوق الأذن'], ['عزل الضوضاء', 'نشط مع Smart Ambient'], ['البطارية', 'حتى 70 ساعة'], ['الصوت', 'JBL Pure Bass'], ['الطي', 'قابل للطي']],
    desc: 'سماعة JBL ببطارية استثنائية تصل إلى 70 ساعة وصوت باص قوي. خفيفة وقابلة للطي لسهولة الحمل.',
  },
  {
    n: 'إيربودز آبل AirPods Pro 2', k: 'headphones', b: 'Apple', c: 'c-audio', price: 1099, was: 1249, stock: 28,
    opts: 'none', feat: true, best: true, sales: 520, tags: ['سماعات', 'آبل'],
    sp: [['النوع', 'داخل الأذن'], ['المعالج', 'H2'], ['عزل الضوضاء', 'نشط متكيّف'], ['البطارية', 'حتى 6 ساعات + 30 مع العلبة'], ['المقاومة', 'IP54']],
    desc: 'إيربودز برو الجيل الثاني بعزل ضوضاء متكيّف وصوت مكاني ديناميكي. علبة شحن مقاومة للماء مع مكبر صوت للبحث عنها.',
  },
  {
    n: 'مكبر صوت JBL Charge 5', k: 'speaker', b: 'JBL', c: 'c-audio', price: 599, was: 699, stock: 25,
    opts: 'none', sales: 290, tags: ['سماعات', 'مكبرات صوت'],
    sp: [['القدرة', '40 واط'], ['البطارية', '20 ساعة'], ['المقاومة', 'IP67 مقاوم للماء والغبار'], ['الميزات', 'شحن الهاتف + PartyBoost']],
    desc: 'مكبر صوت محمول ببطارية 20 ساعة ومقاومة كاملة للماء والغبار، مع إمكانية شحن جوالك منه كمصدر طاقة احتياطي.',
  },
  /* ----------------------------- كاميرات ----------------------------- */
  {
    n: 'كاميرا كانون EOS R50', k: 'camera', b: 'Canon', c: 'c-cameras', price: 3299, was: 3699, stock: 10,
    opts: 'none', feat: true, isNew: true, sales: 85, tags: ['كاميرات', 'احترافية'],
    sp: [['المستشعر', 'APS-C 24.2 ميجابكسل'], ['الفيديو', '4K 30fps'], ['التركيز', 'Dual Pixel CMOS AF II'], ['الشاشة', 'دوارة تعمل باللمس'], ['الاتصال', 'Wi-Fi + Bluetooth']],
    desc: 'كاميرا كانون بدون مرآة خفيفة ومثالية لصنّاع المحتوى، بتركيز تلقائي ذكي يتبع العين وتصوير فيديو 4K.',
  },
  {
    n: 'كاميرا مراقبة ذكية 360 درجة', k: 'camera', b: 'Xiaomi', c: 'c-cameras', price: 249, was: 329, stock: 40,
    opts: 'none', best: true, sales: 480, tags: ['كاميرات', 'مراقبة'],
    sp: [['الدقة', '2K'], ['الدوران', '360 درجة أفقي'], ['الرؤية الليلية', 'أشعة تحت الحمراء'], ['الصوت', 'مستقبل ومكبر ثنائي'], ['التخزين', 'بطاقة ذاكرة + سحابي']],
    desc: 'كاميرا مراقبة منزلية بدقة 2K ودوران كامل 360 درجة مع رؤية ليلية واضحة. تتابع المنزل مباشرة من جوالك.',
  },
  /* -------------------------- أجهزة ألعاب -------------------------- */
  {
    n: 'بلايستيشن 5 برو', k: 'gamepad', b: 'Sony', c: 'c-gaming', price: 3499, was: 3799, stock: 7,
    opts: 'none', isNew: true, feat: true, best: true, sales: 150, tags: ['أجهزة ألعاب', 'سوني'],
    sp: [['المعالج', 'AMD Zen 2 مخصص'], ['الرسوميات', 'RDNA مع تتبع الأشعة'], ['التخزين', '2TB SSD'], ['الدقة', '8K + 4K 120fps'], ['الذراع', 'DualSense مرفق']],
    desc: 'بلايستيشن 5 برو بأداء أقوى وتخزين 2 تيرابايت، يدعم الألعاب بدقة 4K بمعدل 120 إطارًا في الثانية مع تحميل فوري.',
  },
  {
    n: 'ذراع ألعاب DualSense', k: 'gamepad', b: 'Sony', c: 'c-gaming', price: 349, was: 429, stock: 30,
    opts: 'none', sales: 520, tags: ['أجهزة ألعاب', 'ملحقات'],
    sp: [['الاستجابة', 'لمسات تفاعلية Haptic'], ['الزنادات', 'تكيفية'], ['الاتصال', 'لاسلكي + USB-C'], ['الميكروفون', 'مدمج']],
    desc: 'ذراع تحكم DualSense بردود فعل لمسية وصوتيات مدمجة، تجربة لعب غامرة بكل تفاصيلها.',
  },
  /* ----------------------------- طابعات ----------------------------- */
  {
    n: 'طابعة HP LaserJet Pro', k: 'printer', b: 'HP', c: 'c-printers', price: 899, was: 1099, stock: 18,
    opts: 'none', sales: 210, tags: ['طابعات', 'HP'],
    sp: [['النوع', 'ليزر أحادي'], ['السرعة', 'حتى 30 صفحة/دقيقة'], ['الاتصال', 'Wi-Fi + USB + إيثرنت'], ['الطباعة المتنقلة', 'HP Smart App'], ['الطباعة المزدوجة', 'تلقائية']],
    desc: 'طابعة ليزر سريعة واقتصادية للمنزل والمكتب الصغير، مع طباعة مزدوجة تلقائية واتصال كامل بالشبكة والجوال.',
  },
  {
    n: 'طابعة كانون حبرية ملونة', k: 'printer', b: 'Canon', c: 'c-printers', price: 429, stock: 23,
    opts: 'none', sales: 130, tags: ['طابعات', 'كانون'],
    sp: [['النوع', 'حبرية ملونة'], ['الوظائف', 'طباعة + نسخ + مسح ضوئي'], ['الاتصال', 'Wi-Fi'], ['الحبر', 'خزانات قابلة للتعبئة']],
    desc: 'طابعة ملونة متعددة الوظائف بخزانات حبر اقتصادية قابلة لإعادة التعبئة، مناسبة لطباعة المستندات والصور.',
  },
]

export const seedProducts: Product[] = productDefs.map((def, index) => {
  const options = OPTION_PRESETS[def.opts ?? 'none']()
  const brandId = `b-${def.b.toLowerCase()}`
  const sales = def.sales ?? 40 + index * 7
  return {
    id: `p-${index + 1}`,
    name: def.n,
    sku: `SWQ-${String(1000 + index + 1)}`,
    shortDescription: def.sp[0] ? `${def.sp[0][0]}: ${def.sp[0][1]}` : undefined,
    description: def.desc ?? '',
    images: [productImage(def.k, index + 1, 0), productImage(def.k, index + 1, 1), productImage(def.k, index + 1, 2)],
    price: def.price,
    compareAtPrice: def.was,
    discountStart: def.was ? daysAgoIso(6) : undefined,
    discountEnd: def.was ? new Date(Date.now() + ((index % 7) + 2) * 86400000).toISOString() : undefined,
    cost: Math.round(def.price * 0.72),
    stock: def.stock,
    trackStock: true,
    lowStockThreshold: 5,
    allowBackorder: false,
    categoryIds: [def.c, ...(seedCategories.find((c) => c.id === def.c)?.parentId ? [seedCategories.find((c) => c.id === def.c)!.parentId as string] : [])],
    brandId,
    tags: def.tags ?? [],
    options,
    variants: buildVariants(options, def.price),
    specifications: def.sp.map(([key, value], i) => ({ id: `sp-${index}-${i}`, key, value })),
    relatedIds: [],
    isNew: def.isNew,
    isBestSeller: def.best,
    isFeatured: def.feat,
    status: 'published',
    rating: 4 + ((index % 5) * 0.2 > 0.8 ? 0.5 : 0.2),
    reviewCount: 0,
    sales,
    weight: def.weight,
    dimensions: def.dimensions,
    createdAt: daysAgoIso(60 - index),
  }
})

/* ربط المنتجات ذات الصلة: منتجات من نفس القسم */
seedProducts.forEach((product) => {
  product.relatedIds = seedProducts
    .filter((p) => p.id !== product.id && p.categoryIds.some((c) => product.categoryIds.includes(c)))
    .slice(0, 6)
    .map((p) => p.id)
})

/* ----------------------------- المراجعات ----------------------------- */
const reviewNames = ['عبدالله السالم', 'نورة القحطاني', 'محمد الشهري', 'سارة العتيبي', 'فهد الدوسري', 'ريم الحربي', 'خالد المطيري', 'هند الزهراني', 'يوسف العمري', 'لمى الغامدي', 'طلال البلوي', 'أمل الجهني']
const reviewTitles = ['جودة ممتازة', 'يستحق السعر', 'أفضل مما توقعت', 'توصيل سريع', 'منتج رائع', 'تجربة جيدة', 'أنصح به بشدة', 'جيد لكن السعر مرتفع']
const reviewBodies = [
  'المنتج وصل بسرعة والجودة أعلى من المتوقع. التغليف كان ممتازًا والمنتج أصلي 100%. أنصح بالشراء من سوقلي.',
  'استخدمته لأكثر من أسبوع والنتيجة ممتازة، الأداء ثابت ولا يوجد أي مشاكل. السعر مناسب مقارنة بالسوق.',
  'التصميم أنيق والاستخدام سهل جدًا. أعجبني الاهتمام بالتفاصيل وسرعة الاستجابة.',
  'قيمة جيدة مقابل السعر، لكن كنت أتمنى أن تكون البطارية أطول قليلًا. عدا ذلك المنتج ممتاز.',
  'خدمة العملاء ساعدتني في الاختيار وأجابت على كل أسئلتي. المنتج مطابق للوصف تمامًا.',
  'جربت منتجات مشابهة كثيرة وهذا الأفضل حتى الآن من ناحية الجودة والسعر.',
  'المقاس مضبوط والمواد المستخدمة ذات جودة عالية. سأشتري منتجات أخرى من المتجر.',
  'طلبته كهدية وكان الاختيار موفقًا، الجميع أعجبهم. شكرًا سوقلي.',
]

let reviewSeed = 7
function pseudoRandom(): number {
  reviewSeed = (reviewSeed * 9301 + 49297) % 233280
  return reviewSeed / 233280
}

export const seedReviews: Review[] = (() => {
  const reviews: Review[] = []
  seedProducts.forEach((product, pIndex) => {
    const count = 2 + (pIndex % 4)
    for (let i = 0; i < count; i += 1) {
      const rand = pseudoRandom()
      const rating = rand > 0.72 ? 5 : rand > 0.42 ? 4 : rand > 0.2 ? 3 : 2
      reviews.push({
        id: `r-${product.id}-${i}`,
        productId: product.id,
        userName: reviewNames[(pIndex + i * 3) % reviewNames.length],
        rating,
        title: reviewTitles[(pIndex + i) % reviewTitles.length],
        body: reviewBodies[(pIndex + i * 2) % reviewBodies.length],
        createdAt: daysAgoIso(3 + ((pIndex * 5 + i * 11) % 120)),
        status: 'published',
        reply: i === 0 && pIndex % 5 === 0 ? 'شكرًا لتقييمك! سعداء بخدمتك دائمًا — فريق سوقلي' : undefined,
      })
    }
  })
  return reviews
})()

/* تحديث تقييمات المنتجات بناءً على المراجعات */
seedProducts.forEach((product) => {
  const list = seedReviews.filter((r) => r.productId === product.id)
  product.reviewCount = list.length
  product.rating = list.length ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10 : 0
})

/* ------------------------------ العملاء ------------------------------ */
export const seedCustomers: Customer[] = [
  {
    id: 'u-1',
    name: 'أحمد الغامدي',
    email: 'ahmed@example.com',
    phone: '0551234567',
    password: '123456',
    gender: 'male',
    birthday: '1994-04-18',
    addresses: [
      { id: 'a-1', label: 'المنزل', fullName: 'أحمد الغامدي', phone: '0551234567', city: 'الرياض', district: 'حي النرجس', street: 'شارع الأمير سلطان، مبنى 24', building: '24', postalCode: '13327', isDefault: true },
      { id: 'a-2', label: 'العمل', fullName: 'أحمد الغامدي', phone: '0551234567', city: 'الرياض', district: 'حي العليا', street: 'طريق الملك فهد، برج المملكة، الدور 12', building: '1204' },
    ],
    savedCards: [{ id: 'card-1', brand: 'mada', last4: '4421', expiry: '09/28', holder: 'AHMED ALGHAMDI', isDefault: true }],
    blocked: false,
    createdAt: daysAgoIso(210),
  },
  {
    id: 'u-2',
    name: 'نورة العتيبي',
    email: 'noura@example.com',
    phone: '0567891234',
    password: '123456',
    gender: 'female',
    addresses: [
      { id: 'a-3', label: 'المنزل', fullName: 'نورة العتيبي', phone: '0567891234', city: 'جدة', district: 'حي الشاطئ', street: 'شارع الكورنيش، فيلا 8', isDefault: true },
    ],
    savedCards: [],
    blocked: false,
    createdAt: daysAgoIso(120),
  },
  {
    id: 'u-3',
    name: 'سلطان المالكي',
    email: 'sultan@example.com',
    phone: '0509876543',
    password: '123456',
    addresses: [{ id: 'a-4', label: 'المنزل', fullName: 'سلطان المالكي', phone: '0509876543', city: 'الدمام', district: 'حي الفيصلية', street: 'شارع 12، مبنى 5', isDefault: true }],
    savedCards: [{ id: 'card-2', brand: 'visa', last4: '7788', expiry: '03/27', holder: 'SULTAN ALMALKI' }],
    blocked: false,
    createdAt: daysAgoIso(60),
  },
]

/* ------------------------------ الطلبات ------------------------------ */
const orderDefs: Array<{
  customer: number
  items: Array<[string, number]>
  status: Order['status']
  days: number
  payment: [string, string]
}> = [
  { customer: 0, items: [['p-1', 1], ['p-7', 1]], status: 'delivered', days: 22, payment: ['pm-card', 'بطاقة ائتمان أو مدى'] },
  { customer: 0, items: [['p-8', 1]], status: 'shipping', days: 5, payment: ['pm-cod', 'الدفع عند الاستلام'] },
  { customer: 1, items: [['p-24', 1], ['p-25', 1], ['p-31', 1]], status: 'processing', days: 2, payment: ['pm-card', 'بطاقة ائتمان أو مدى'] },
  { customer: 1, items: [['p-14', 1]], status: 'delivered', days: 40, payment: ['pm-wallet', 'محفظة إلكترونية'] },
  { customer: 2, items: [['p-3', 1], ['p-9', 2]], status: 'delivered', days: 15, payment: ['pm-card', 'بطاقة ائتمان أو مدى'] },
  { customer: 2, items: [['p-17', 1]], status: 'cancelled', days: 9, payment: ['pm-cod', 'الدفع عند الاستلام'] },
  { customer: 0, items: [['p-20', 2]], status: 'delivered', days: 60, payment: ['pm-cod', 'الدفع عند الاستلام'] },
  { customer: 1, items: [['p-11', 1], ['p-27', 1]], status: 'shipping', days: 3, payment: ['pm-card', 'بطاقة ائتمان أو مدى'] },
  { customer: 2, items: [['p-5', 1]], status: 'processing', days: 1, payment: ['pm-wallet', 'محفظة إلكترونية'] },
  { customer: 0, items: [['p-32', 1], ['p-33', 1]], status: 'delivered', days: 33, payment: ['pm-card', 'بطاقة ائتمان أو مدى'] },
]

export const seedOrders: Order[] = orderDefs.map((def, i) => {
  const customer = seedCustomers[def.customer]
  const createdAt = daysAgoIso(def.days)
  const items = def.items
    .map(([pid, qty]) => {
      const product = seedProducts.find((p) => p.id === pid)
      if (!product) return null
      return {
        id: uid('oi'),
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: qty,
        optionsLabel: product.options.length ? 'اللون: أسود | السعة: 256GB' : undefined,
      }
    })
    .filter(Boolean) as Order['items']
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = i % 4 === 0 ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal > 500 ? 0 : 25
  const codFee = def.payment[0] === 'pm-cod' ? 15 : 0
  const tax = Math.round((subtotal - discount) * 0.15)
  const total = subtotal - discount + shipping + codFee + tax
  return {
    id: `o-${i + 1}`,
    number: String(100145 + i * 7),
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    items,
    address: customer.addresses[0],
    paymentMethodId: def.payment[0],
    paymentMethodName: def.payment[1],
    paymentStatus: def.payment[0] === 'pm-cod' ? 'pending' : 'paid',
    shippingMethod: 'توصيل سريع',
    subtotal,
    discount,
    couponCode: discount ? 'SAVE10' : undefined,
    shipping,
    codFee,
    tax,
    total,
    status: def.status,
    trackNumber: def.status === 'shipping' || def.status === 'delivered' ? `SWQ${400000 + i * 137}` : undefined,
    shippingCompany: def.status === 'shipping' || def.status === 'delivered' ? 'أرامكس' : undefined,
    expectedDelivery: new Date(new Date(createdAt).getTime() + 5 * 86400000).toISOString(),
    note: i === 2 ? 'الرجاء الاتصال قبل التوصيل' : undefined,
    createdAt,
    timeline: buildTimeline(def.status, createdAt),
  }
})

/* ------------------------------ الكوبونات ------------------------------ */
export const seedCoupons: Coupon[] = [
  { id: 'cp-1', code: 'SAVE10', type: 'percent', value: 10, minOrder: 200, maxDiscount: 300, usageLimit: 100, perCustomerLimit: 2, usedCount: 34, startDate: daysAgoIso(30), endDate: new Date(Date.now() + 30 * 86400000).toISOString(), active: true, audience: 'all' },
  { id: 'cp-2', code: 'WELCOME50', type: 'fixed', value: 50, minOrder: 300, usageLimit: 500, perCustomerLimit: 1, usedCount: 128, startDate: daysAgoIso(90), endDate: new Date(Date.now() + 90 * 86400000).toISOString(), active: true, audience: 'new' },
  { id: 'cp-3', code: 'TECH15', type: 'percent', value: 15, minOrder: 1000, maxDiscount: 800, usageLimit: 50, perCustomerLimit: 1, usedCount: 50, startDate: daysAgoIso(120), endDate: daysAgoIso(10), active: false, audience: 'all' },
  { id: 'cp-4', code: 'FREESHIP', type: 'fixed', value: 25, minOrder: 100, usageLimit: 1000, perCustomerLimit: 5, usedCount: 412, active: true, audience: 'all' },
]

/* ------------------------------ البانرات ------------------------------ */
export const seedBanners: Banner[] = [
  { id: 'bn-1', title: 'خصومات تصل إلى 40%', subtitle: 'على الجوالات واللابتوبات — لفترة محدودة', image: '', theme: 'ocean', target: { type: 'offer' }, order: 1, active: true },
  { id: 'bn-2', title: 'وصل حديثًا: بلايستيشن 5 برو', subtitle: 'تجربة لعب من الجيل القادم', image: '', theme: 'violet', target: { type: 'product', value: 'p-31' }, order: 2, active: true },
  { id: 'bn-3', title: 'أجهزة منزلية بأسعار مريحة', subtitle: 'غسالات، ثلاجات، ومكيفات مع تركيب مجاني', image: '', theme: 'forest', target: { type: 'category', value: 'c-home' }, order: 3, active: true },
]

/* ------------------------------ الإشعارات ------------------------------ */
export const seedNotifications: AppNotification[] = [
  { id: 'n-1', type: 'order', title: 'تم شحن طلبك', body: 'طلبك رقم #100152 في الطريق إليك. يمكنك تتبع الشحنة من صفحة تفاصيل الطلب.', createdAt: daysAgoIso(0.1), read: false, target: '/orders/o-2' },
  { id: 'n-2', type: 'offer', title: 'عرض اليوم: خصم 25%', body: 'خصم 25% على السماعات اللاسلكية لمدة 24 ساعة فقط.', createdAt: daysAgoIso(0.5), read: false, target: '/offers' },
  { id: 'n-3', type: 'reminder', title: 'سلتك تنتظرك', body: 'لديك منتجات في سلة التسوق ولم تُكمل الطلب بعد.', createdAt: daysAgoIso(1.2), read: true, target: '/cart' },
  { id: 'n-4', type: 'info', title: 'مرحبًا بك في سوقلي', body: 'استمتع بتجربة تسوق سهلة مع توصيل سريع لجميع مناطق المملكة.', createdAt: daysAgoIso(3), read: true, target: '/' },
  { id: 'n-5', type: 'order', title: 'طلب جديد', body: 'وصل طلب جديد من العميل أحمد الغامدي بقيمة 2,049 ر.س.', createdAt: daysAgoIso(0.05), read: false, forAdmin: true, target: '/admin/orders/o-9' },
  { id: 'n-6', type: 'info', title: 'تقييم جديد', body: 'أضافت نورة العتيبي تقييمًا جديدًا على منتج إيربودز آبل AirPods Pro 2.', createdAt: daysAgoIso(0.4), read: false, forAdmin: true, target: '/admin/reviews' },
]

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

/* --------------------------- بيانات إضافية للوحة --------------------------- */
export const seedAdmin = {
  name: 'هيدر حجاج',
  email: 'haiderhajjah@gmail.com',
  password: '2009',
}

export const seedSalesSeries = [4200, 5100, 4800, 6300, 7200, 5900, 8100, 9600, 8800, 10200, 11400, 9800]

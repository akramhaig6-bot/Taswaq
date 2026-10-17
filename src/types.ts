/* ==========================================================================
   سوقلي — الأنواع (TypeScript Types)
   ========================================================================== */

export type ID = string

/* ------------------------------- الأقسام ------------------------------- */
export interface Category {
  id: ID
  name: string
  nameEn?: string
  description?: string
  image: string
  parentId: ID | null
  active: boolean
  order: number
  /** أيقونة SVG داخلية (اسم الرمز) */
  icon?: string
}

/* --------------------------- العلامات التجارية -------------------------- */
export interface Brand {
  id: ID
  name: string
  logo: string
  active: boolean
  order: number
}

/* ------------------------------ المنتجات ------------------------------- */
export type OptionType = 'color' | 'storage' | 'size' | 'custom'

export interface OptionValue {
  id: ID
  label: string
  hex?: string
  priceDelta?: number
  stock?: number
  available: boolean
}

export interface ProductOption {
  id: ID
  type: OptionType
  label: string
  values: OptionValue[]
}

export interface ProductVariant {
  id: ID
  combination: Record<string, ID>
  sku?: string
  price: number
  stock: number
}

export interface Specification {
  id: ID
  key: string
  value: string
}

export type ProductStatus = 'published' | 'draft' | 'hidden'
/** Nature of fulfilment for an online offer. */
export type ProductKind = 'physical' | 'digital' | 'service'

export interface Product {
  id: ID
  /** Missing legacy values are treated as physical products. */
  kind?: ProductKind
  /** Content or instructions delivered with a digital item or service. */
  deliveryInstructions?: string
  /** Override default fulfilment (physical=true, digital/service=false). */
  requiresShipping?: boolean
  name: string
  sku: string
  shortDescription?: string
  description: string
  images: string[]
  price: number
  compareAtPrice?: number
  discountStart?: string
  discountEnd?: string
  cost?: number
  stock: number
  trackStock: boolean
  lowStockThreshold: number
  allowBackorder: boolean
  categoryIds: ID[]
  brandId?: ID
  tags: string[]
  options: ProductOption[]
  variants: ProductVariant[]
  specifications: Specification[]
  relatedIds: ID[]
  isNew?: boolean
  isBestSeller?: boolean
  isFeatured?: boolean
  status: ProductStatus
  rating: number
  reviewCount: number
  sales: number
  weight?: number
  dimensions?: string
  seo?: { title?: string; description?: string; keywords?: string; slug?: string }
  createdAt: string
}

/* ------------------------------ المراجعات ------------------------------ */
export type ReviewStatus = 'published' | 'hidden' | 'pending'

export interface Review {
  id: ID
  productId: ID
  customerId?: ID
  userName: string
  rating: number
  title?: string
  body?: string
  createdAt: string
  status: ReviewStatus
  reply?: string
}

/* ------------------------------- العناوين ------------------------------- */
export interface Address {
  id: ID
  label: string
  fullName: string
  phone: string
  city: string
  district: string
  street: string
  building?: string
  postalCode?: string
  notes?: string
  isDefault?: boolean
}

export interface SavedCard {
  id: ID
  brand: 'visa' | 'mastercard' | 'mada' | 'unknown'
  last4: string
  expiry: string
  holder: string
  isDefault?: boolean
}

/* ------------------------------- العملاء ------------------------------- */
export interface Customer {
  id: ID
  name: string
  email: string
  phone: string
  password: string
  avatar?: string
  gender?: 'male' | 'female' | 'undisclosed'
  birthday?: string
  addresses: Address[]
  savedCards: SavedCard[]
  blocked: boolean
  notes?: string
  createdAt: string
}

/* -------------------------------- السلة -------------------------------- */
export interface CartItem {
  id: ID
  productId: ID
  quantity: number
  /** optionId -> valueId */
  options: Record<string, ID>
}

/* ------------------------------- الطلبات ------------------------------- */
export type OrderStatus = 'processing' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: ID
  productId: ID
  kind?: ProductKind
  deliveryInstructions?: string
  name: string
  image: string
  price: number
  quantity: number
  optionsLabel?: string
}

export interface TimelineStep {
  key: string
  label: string
  at?: string
  done: boolean
}

export interface Order {
  id: ID
  number: string
  customerId?: ID
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  /** Digital-only orders do not need a delivery address. */
  address?: Address
  paymentMethodId: string
  paymentMethodName: string
  paymentStatus: 'paid' | 'pending' | 'refunded'
  shippingMethod?: string
  subtotal: number
  discount: number
  couponCode?: string
  shipping: number
  codFee: number
  tax: number
  total: number
  status: OrderStatus
  trackNumber?: string
  shippingCompany?: string
  expectedDelivery?: string
  note?: string
  internalNote?: string
  cancelReason?: string
  createdAt: string
  timeline: TimelineStep[]
}

/* ------------------------------- الكوبونات ------------------------------ */
export interface Coupon {
  id: ID
  code: string
  type: 'percent' | 'fixed'
  value: number
  minOrder?: number
  maxDiscount?: number
  usageLimit?: number
  perCustomerLimit?: number
  usedCount: number
  startDate?: string
  endDate?: string
  active: boolean
  categoryIds?: ID[]
  audience: 'all' | 'new' | 'list'
}

/* ------------------------------- البانرات ------------------------------- */
export type BannerTargetType = 'none' | 'product' | 'category' | 'offer' | 'external'

export interface Banner {
  id: ID
  title?: string
  subtitle?: string
  image: string
  /** تدرج موحّد يُستخدم عند عدم رفع صورة */
  theme: string
  target: { type: BannerTargetType; value?: string }
  startDate?: string
  endDate?: string
  order: number
  active: boolean
}

/* --------------------------- أقسام الشاشة الرئيسية --------------------------- */
export type SectionKind = 'banners' | 'categories' | 'deals' | 'best' | 'new' | 'brands' | 'custom'

export interface SectionFilter {
  categoryIds?: ID[]
  brandIds?: ID[]
  minPrice?: number
  maxPrice?: number
  onlyDiscounted?: boolean
  onlyNew?: boolean
  bestSellers?: boolean
  minRating?: number
}

export interface HomeSection {
  id: ID
  kind: SectionKind
  title: string
  layout: 'row' | 'grid'
  enabled: boolean
  order: number
  productIds?: ID[]
  filter?: SectionFilter
  limit?: number
}

/* ------------------------------ الإشعارات ------------------------------ */
export interface AppNotification {
  id: ID
  type: 'order' | 'offer' | 'reminder' | 'info'
  title: string
  body: string
  createdAt: string
  read: boolean
  target?: string
  forAdmin?: boolean
}

/* ------------------------------- الصفحات ------------------------------- */
export interface StaticPage {
  id: ID
  slug: string
  title: string
  content: string
  active: boolean
  seoTitle?: string
  seoDescription?: string
  showInFooter?: boolean
}

/* ---------------------------- الإعدادات ---------------------------- */
export interface PaymentMethodSetting {
  id: ID
  kind: 'cod' | 'card' | 'wallet' | 'bank'
  name: string
  description?: string
  enabled: boolean
  extraFee?: number
  bankDetails?: string
  instructions?: string
  icon?: string
}

export interface ShippingMethodSetting {
  id: ID
  name: string
  fee: number
  enabled: boolean
  eta?: string
}

export interface CitySetting {
  id: ID
  name: string
  fee?: number
}

export interface LanguageSetting {
  code: 'ar' | 'en'
  name: string
  active: boolean
  isDefault: boolean
}

export type StoreNavIcon = 'home' | 'categories' | 'offers' | 'orders' | 'account' | 'search' | 'custom'

export interface StoreNavigationItem {
  id: ID
  label: string
  path: string
  icon: StoreNavIcon
  enabled: boolean
  requiresAuth?: boolean
}

export interface AnnouncementBarSettings {
  enabled: boolean
  text: string
  target?: string
  background: string
  foreground: string
}

export interface FooterLink {
  id: ID
  label: string
  path: string
  enabled: boolean
}

export interface Settings {
  /** Local data-seed schema migration marker. */
  schemaVersion?: number
  storeName: string
  logoText: string
  /** شعار المتجر (صورة مرفوعة) — إن لم تُحدَّد يُعرض النص logoText */
  logo?: string
  /** أيقونة التطبيق Favicon (صورة مرفوعة) */
  favicon?: string
  copyright: string
  version: string
  currency: string
  colors: {
    primary: string
    secondary: string
    success: string
    danger: string
  }
  contact: {
    phone: string
    email: string
    whatsapp: string
    address: string
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
  }
  tax: { enabled: boolean; rate: number; inclusive: boolean }
  shipping: { freeOver: number; methods: ShippingMethodSetting[] }
  codFee: number
  paymentMethods: PaymentMethodSetting[]
  cities: CitySetting[]
  languages: LanguageSetting[]
  defaultLanguage: 'ar' | 'en'
  popularSearches: string[]
  lowStockThreshold: number
  deals: { start: string; end: string; hideWhenExpired: boolean }
  sections: HomeSection[]
  /** Editable storefront chrome managed through the CMS. */
  announcementBar?: AnnouncementBarSettings
  navigationItems?: StoreNavigationItem[]
  footerLinks?: FooterLink[]
  technical: {
    maintenanceMode: boolean
    supportPhone: string
    analyticsId?: string
    enableReviews: boolean
  }
}

/* --------------------------- نصوص الواجهة --------------------------- */
export interface TextOverride {
  key: string
  label: string
  screen: string
  value: string
}

/* ------------------------------ الأدمن ------------------------------ */
export interface AdminUser {
  name: string
  email: string
  password: string
}

export interface DashboardPoint {
  label: string
  value: number
}

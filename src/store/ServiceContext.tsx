/* ==========================================================================
   طبقة الخدمات (Context) — البوابة الموحّدة لكل عمليات المتجر
   --------------------------------------------------------------------------
   تعالج: المصادقة، الطلبات، المراجعات، الكوبونات، والملف الشخصي.
   كل عملية تتحقق من صحتها، تستهلك زمن استجابة، وتحدّث البيانات مع
   الآثار الجانبية المرتبطة (المخزون، المبيعات، الإشعارات، سجل الكوبونات).
   ========================================================================== */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type { Address, CartItem, Coupon, Customer, Order, Product, Review, SavedCard } from '@/types'
import {
  assertOnline,
  daysSince,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  nextOrderNumber,
  serviceFail,
  serviceOk,
  wait,
  type ServiceResult,
} from '@/lib/service'
import { buildTimeline } from '@/lib/orders'
import { computeTotals, optionsLabel, requiresShipping, unitPrice } from '@/lib/pricing'
import { normalizePhone, uid } from '@/lib/utils'
import { useAppData } from '@/store/AppDataContext'

export interface ServiceValue {
  /** تسجيل الدخول برقم الجوال أو البريد */
  login: (identifier: string, password: string) => Promise<ServiceResult<Customer>>
  /** إنشاء حساب عميل جديد */
  register: (input: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<ServiceResult<Customer>>
  /** تسجيل دخول لوحة الإدارة */
  adminLogin: (email: string, password: string) => Promise<ServiceResult>
  /** إرسال رابط استعادة كلمة المرور */
  requestPasswordReset: (email: string) => Promise<ServiceResult>
  /** التحقق من كود الخصم مقابل قيمة السلة والعميل */
  validateCoupon: (code: string, subtotal: number, customerId?: string) => Promise<ServiceResult<Coupon>>
  /** إنشاء طلب جديد مع تحديث المخزون والمبيعات وسجل الكوبون */
  placeOrder: (draft: OrderDraft) => Promise<ServiceResult<Order>>
  /** إلغاء طلب من قبل العميل مع إعادة الكميات للمخزون */
  cancelOrder: (orderId: string, reason: string) => Promise<ServiceResult<Order>>
  /** تحديث حالة الطلب من لوحة الإدارة */
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    patch?: Partial<Order>,
  ) => Promise<ServiceResult<Order>>
  /** إرسال تقييم جديد أو تعديل تقييم سابق */
  submitReview: (input: {
    productId: string
    customerId?: string
    userName: string
    rating: number
    title?: string
    body?: string
  }) => Promise<ServiceResult<Review>>
  /** تحديث بيانات الملف الشخصي */
  updateProfile: (customerId: string, patch: Partial<Customer>) => Promise<ServiceResult<Customer>>
  /** العناوين المحفوظة */
  saveAddress: (customerId: string, address: Omit<Address, 'id'> & { id?: string }) => Promise<ServiceResult<Address>>
  removeAddress: (customerId: string, addressId: string) => Promise<ServiceResult>
  setDefaultAddress: (customerId: string, addressId: string) => Promise<ServiceResult>
  /** بطاقات الدفع المحفوظة */
  saveCard: (customerId: string, card: Omit<SavedCard, 'id'>) => Promise<ServiceResult<SavedCard>>
  removeCard: (customerId: string, cardId: string) => Promise<ServiceResult>
  setDefaultCard: (customerId: string, cardId: string) => Promise<ServiceResult>
}

export interface OrderDraft {
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: CartItem[]
  address?: Address
  paymentMethodId: string
  shippingMethodId?: string
  couponCode?: string
  note?: string
  cardNumber?: string
}

const ServiceContext = createContext<ServiceValue | null>(null)

export function ServiceProvider({ children }: { children: ReactNode }) {
  const {
    products,
    orders,
    customers,
    coupons,
    reviews,
    settings,
    adminUser,
    pushNotification,
    addReview,
    recomputeRating,
  } = useAppData()

  /* ------------------------------ المصادقة ------------------------------ */
  const login = useCallback<ServiceValue['login']>(
    async (identifier, password) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Customer>(online.error!, online.code)
      await wait()
      const value = identifier.trim()
      const customer = customers.items.find((item) => {
        const emailMatch = isValidEmail(value) && item.email.toLowerCase() === value.toLowerCase()
        const phoneMatch = isValidPhone(value) && normalizePhone(item.phone) === normalizePhone(value)
        return emailMatch || phoneMatch
      })
      if (!customer || customer.password !== password) {
        return serviceFail<Customer>(
          'البريد الإلكتروني/رقم الجوال أو كلمة المرور غير صحيحة.',
          'AUTH_FAILED',
        )
      }
      if (customer.blocked) {
        return serviceFail<Customer>(
          'تم إيقاف هذا الحساب. يرجى التواصل مع خدمة العملاء.',
          'ACCOUNT_BLOCKED',
        )
      }
      return serviceOk(customer)
    },
    [customers.items],
  )

  const register = useCallback<ServiceValue['register']>(
    async ({ name, email, phone, password }) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Customer>(online.error!, online.code)
      await wait(180, 420)
      if (name.trim().length < 3) {
        return serviceFail<Customer>('الاسم يجب أن يكون 3 أحرف على الأقل.', 'INVALID_NAME')
      }
      if (!isValidEmail(email)) {
        return serviceFail<Customer>('يرجى إدخال بريد إلكتروني صحيح.', 'INVALID_EMAIL')
      }
      if (!isValidPhone(phone)) {
        return serviceFail<Customer>('يرجى إدخال رقم جوال صحيح.', 'INVALID_PHONE')
      }
      if (!isValidPassword(password)) {
        return serviceFail<Customer>('كلمة المرور يجب أن تكون 6 أحرف على الأقل.', 'INVALID_PASSWORD')
      }
      const exists = customers.items.some(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (exists) {
        return serviceFail<Customer>(
          'هذا البريد الإلكتروني مسجل مسبقًا. يمكنك تسجيل الدخول.',
          'EMAIL_TAKEN',
        )
      }
      const customer: Customer = {
        id: uid('u'),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizePhone(phone),
        password,
        addresses: [],
        savedCards: [],
        blocked: false,
        createdAt: new Date().toISOString(),
      }
      customers.add(customer)
      pushNotification({
        type: 'info',
        title: 'عميل جديد',
        body: `انضم ${customer.name} إلى متجر سوقلي.`,
        forAdmin: true,
        target: '/admin/customers',
      })
      return serviceOk(customer)
    },
    [customers, pushNotification],
  )

  const adminLogin = useCallback<ServiceValue['adminLogin']>(
    async (email, password) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(160, 360)
      if (
        email.trim().toLowerCase() !== adminUser.email.toLowerCase() ||
        password !== adminUser.password
      ) {
        return serviceFail('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'AUTH_FAILED')
      }
      return serviceOk()
    },
    [adminUser],
  )

  const requestPasswordReset = useCallback<ServiceValue['requestPasswordReset']>(
    async (email) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(400, 700)
      const exists = customers.items.some(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!exists) {
        return serviceFail(
          'لم نجد حسابًا مرتبطًا بهذا البريد الإلكتروني.',
          'EMAIL_NOT_FOUND',
        )
      }
      return serviceOk()
    },
    [customers.items],
  )

  /* ------------------------------ الكوبونات ------------------------------ */
  const validateCoupon = useCallback<ServiceValue['validateCoupon']>(
    async (code, subtotal, customerId) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Coupon>(online.error!, online.code)
      await wait(280, 520)
      const found = coupons.items.find(
        (item) => item.code.toLowerCase() === code.trim().toLowerCase(),
      )
      if (!found) {
        return serviceFail<Coupon>('كود الخصم غير صالح أو منتهي الصلاحية.', 'COUPON_INVALID')
      }
      const now = Date.now()
      if (!found.active) {
        return serviceFail<Coupon>('كود الخصم غير صالح أو منتهي الصلاحية.', 'COUPON_INACTIVE')
      }
      if (found.startDate && new Date(found.startDate).getTime() > now) {
        return serviceFail<Coupon>('كود الخصم غير صالح أو منتهي الصلاحية.', 'COUPON_NOT_STARTED')
      }
      if (found.endDate && new Date(found.endDate).getTime() < now) {
        return serviceFail<Coupon>('كود الخصم غير صالح أو منتهي الصلاحية.', 'COUPON_EXPIRED')
      }
      if (found.usageLimit && found.usedCount >= found.usageLimit) {
        return serviceFail<Coupon>('تم استنفاد هذا الكود بالكامل.', 'COUPON_EXHAUSTED')
      }
      if (found.minOrder && subtotal < found.minOrder) {
        return serviceFail<Coupon>(
          `الحد الأدنى لاستخدام الكود هو ${found.minOrder} ${settings.currency}`,
          'COUPON_MIN_ORDER',
        )
      }
      if (found.audience === 'new' && customerId) {
        const customer = customers.items.find((item) => item.id === customerId)
        if (customer && daysSince(customer.createdAt) > 30) {
          return serviceFail<Coupon>(
            'هذا الكود مخصص للحسابات الجديدة فقط.',
            'COUPON_AUDIENCE',
          )
        }
      }
      if (found.perCustomerLimit && customerId) {
        const used = orders.items.filter(
          (order) => order.customerId === customerId && order.couponCode === found.code,
        ).length
        if (used >= found.perCustomerLimit) {
          return serviceFail<Coupon>(
            'تم استخدام هذا الكود بالحد المسموح لحسابك.',
            'COUPON_LIMIT',
          )
        }
      }
      return serviceOk(found)
    },
    [coupons.items, customers.items, orders.items, settings.currency],
  )

  /* ------------------------------ الطلبات ------------------------------ */
  const placeOrder = useCallback<ServiceValue['placeOrder']>(
    async (draft) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Order>(online.error!, online.code)
      if (draft.items.length === 0) {
        return serviceFail<Order>('السلة فارغة. أضف منتجات قبل إتمام الطلب.', 'EMPTY_CART')
      }
      const payment = settings.paymentMethods.find((item) => item.id === draft.paymentMethodId)
      if (!payment || !payment.enabled) {
        return serviceFail<Order>('طريقة الدفع غير متاحة حاليًا. اختر طريقة أخرى.', 'PAYMENT_UNAVAILABLE')
      }

      /* التحقق من توفر الكميات قبل خصم المخزون */
      const lines = draft.items.map((item) => {
        const product = products.items.find((p) => p.id === item.productId)
        return { item, product }
      })
      const hasShippableItems = lines.some(({ product }) => Boolean(product && requiresShipping(product)))
      if (hasShippableItems && !draft.address) {
        return serviceFail<Order>('أدخل عنوان التوصيل لإكمال الطلب.', 'ADDRESS_REQUIRED')
      }
      const shipping = hasShippableItems
        ? settings.shipping.methods.find((item) => item.id === draft.shippingMethodId && item.enabled)
        : undefined
      if (hasShippableItems && !shipping) {
        return serviceFail<Order>('طريقة الشحن غير متاحة حاليًا. اختر طريقة أخرى.', 'SHIPPING_UNAVAILABLE')
      }
      if (!hasShippableItems && payment.kind === 'cod') {
        return serviceFail<Order>('اختر طريقة دفع إلكترونية لهذا الطلب.', 'PAYMENT_UNAVAILABLE')
      }
      const missing = lines.find(
        ({ item, product }) =>
          !product || product.status !== 'published' || (product.trackStock && product.stock < item.quantity),
      )
      if (missing) {
        return serviceFail<Order>(
          'بعض المنتجات لم تعد متوفرة. يرجى مراجعة السلة قبل إتمام الطلب.',
          'OUT_OF_STOCK',
        )
      }

      await wait(700, 1200)

      /* محاكاة رفض عملية الدفع لبطاقات الاختبار */
      if (payment.kind === 'card' && draft.cardNumber?.replace(/\s/g, '').startsWith('4000')) {
        return serviceFail<Order>(
          'فشلت عملية الدفع. تحقق من بيانات البطاقة وحاول مرة أخرى.',
          'PAYMENT_DECLINED',
        )
      }

      const coupon = draft.couponCode
        ? coupons.items.find((item) => item.code.toLowerCase() === draft.couponCode!.toLowerCase())
        : undefined

      const totals = computeTotals({
        items: draft.items,
        products: products.items,
        coupon,
        settings,
        shippingMethodId: draft.shippingMethodId,
        paymentMethodId: draft.paymentMethodId,
      })

      const orderItems = lines
        .filter((line): line is { item: CartItem; product: Product } => Boolean(line.product))
        .map(({ item, product }) => ({
          id: `oi-${item.id}`,
          productId: product.id,
          kind: product.kind ?? 'physical',
          deliveryInstructions: product.deliveryInstructions?.trim() || undefined,
          name: product.name,
          image: product.images[0],
          price: unitPrice(product, item.options),
          quantity: item.quantity,
          optionsLabel: optionsLabel(product, item.options) || undefined,
        }))

      const createdAt = new Date().toISOString()
      const order: Order = {
        id: `o-${Date.now().toString(36)}`,
        number: nextOrderNumber(orders.items.map((item) => item.number)),
        customerId: draft.customerId,
        customerName: draft.address?.fullName || draft.customerName,
        customerEmail: draft.customerEmail,
        customerPhone: draft.address?.phone || draft.customerPhone,
        items: orderItems,
        address: draft.address,
        paymentMethodId: payment.id,
        paymentMethodName: payment.name,
        paymentStatus: payment.kind === 'cod' || payment.kind === 'bank' ? 'pending' : 'paid',
        shippingMethod: shipping?.name ?? 'تسليم رقمي / تنفيذ الخدمة',
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: coupon?.code,
        shipping: totals.shipping,
        codFee: totals.codFee,
        tax: totals.tax,
        total: totals.total,
        status: 'processing',
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        note: draft.note || undefined,
        createdAt,
        timeline: buildTimeline('processing', createdAt),
      }

      orders.add(order)

      /* خصم المخزون وزيادة المبيعات */
      lines.forEach(({ item, product }) => {
        if (!product?.trackStock) return
        products.update(product.id, {
          stock: Math.max(0, product.stock - item.quantity),
          sales: product.sales + item.quantity,
        })
      })

      if (coupon) coupons.update(coupon.id, { usedCount: coupon.usedCount + 1 })

      pushNotification({
        type: 'order',
        title: 'تم استلام طلبك',
        body: `تم استلام طلبك رقم #${order.number} وسنبدأ بتجهيزه.`,
        target: `/orders/${order.id}`,
      })
      pushNotification({
        type: 'order',
        title: `طلب جديد #${order.number}`,
        body: `طلب جديد من ${order.customerName} بقيمة ${order.total} ${settings.currency}.`,
        forAdmin: true,
        target: `/admin/orders/${order.id}`,
      })

      return serviceOk(order)
    },
    [coupons, orders, products, pushNotification, settings],
  )

  const cancelOrder = useCallback<ServiceValue['cancelOrder']>(
    async (orderId, reason) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Order>(online.error!, online.code)
      const order = orders.items.find((item) => item.id === orderId)
      if (!order) return serviceFail<Order>('الطلب غير موجود.', 'ORDER_NOT_FOUND')
      if (order.status === 'cancelled') {
        return serviceFail<Order>('هذا الطلب ملغى بالفعل.', 'ALREADY_CANCELLED')
      }
      if (order.status === 'delivered') {
        return serviceFail<Order>(
          'لا يمكن إلغاء طلب تم تسليمه. تواصل مع خدمة العملاء للاسترجاع.',
          'ALREADY_DELIVERED',
        )
      }
      await wait(420, 760)

      const cancelledAt = new Date().toISOString()
      const timeline = [
        ...order.timeline.filter((step) => step.key !== 'cancelled'),
        { key: 'cancelled', label: 'تم إلغاء الطلب', at: cancelledAt, done: true },
      ]
      const updated: Order = {
        ...order,
        status: 'cancelled',
        cancelReason: reason,
        timeline,
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
      }
      orders.update(orderId, updated)

      /* إعادة الكميات إلى المخزون */
      order.items.forEach((item) => {
        const product = products.items.find((p) => p.id === item.productId)
        if (!product?.trackStock) return
        products.update(product.id, {
          stock: product.stock + item.quantity,
          sales: Math.max(0, product.sales - item.quantity),
        })
      })

      if (order.couponCode) {
        const coupon = coupons.items.find((item) => item.code === order.couponCode)
        if (coupon) coupons.update(coupon.id, { usedCount: Math.max(0, coupon.usedCount - 1) })
      }

      pushNotification({
        type: 'order',
        title: 'تم إلغاء الطلب',
        body: `تم إلغاء الطلب #${order.number}.`,
        target: `/orders/${order.id}`,
      })
      pushNotification({
        type: 'order',
        title: 'إلغاء طلب',
        body: `ألغى العميل ${order.customerName} الطلب #${order.number}.`,
        forAdmin: true,
        target: `/admin/orders/${order.id}`,
      })

      return serviceOk(updated)
    },
    [coupons, orders, products, pushNotification],
  )

  const updateOrderStatus = useCallback<ServiceValue['updateOrderStatus']>(
    async (orderId, status, patch) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Order>(online.error!, online.code)
      const order = orders.items.find((item) => item.id === orderId)
      if (!order) return serviceFail<Order>('الطلب غير موجود.', 'ORDER_NOT_FOUND')
      await wait(320, 620)

      const createdAt = order.createdAt
      const timeline = buildTimeline(status, createdAt)
      const updated: Order = {
        ...order,
        ...patch,
        status,
        timeline,
        paymentStatus:
          status === 'delivered' && order.paymentMethodId !== 'pm-cod'
            ? 'paid'
            : patch?.paymentStatus ?? order.paymentStatus,
      }
      orders.update(orderId, updated)

      const labels: Record<Order['status'], string> = {
        processing: 'قيد المعالجة',
        shipping: 'قيد الشحن',
        delivered: 'تم التوصيل',
        cancelled: 'ملغاة',
      }
      pushNotification({
        type: 'order',
        title: `تحديث حالة الطلب #${order.number}`,
        body: `حالة طلبك الآن: ${labels[status]}.`,
        target: `/orders/${order.id}`,
      })

      return serviceOk(updated)
    },
    [orders, pushNotification],
  )

  /* ------------------------------ المراجعات ------------------------------ */
  const submitReview = useCallback<ServiceValue['submitReview']>(
    async (input) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Review>(online.error!, online.code)
      if (!input.rating || input.rating < 1 || input.rating > 5) {
        return serviceFail<Review>('يرجى اختيار عدد النجوم قبل الإرسال.', 'RATING_REQUIRED')
      }
      const product = products.items.find((item) => item.id === input.productId)
      if (!product) return serviceFail<Review>('المنتج غير موجود.', 'PRODUCT_NOT_FOUND')
      await wait(420, 780)

      const existing = input.customerId
        ? reviews.items.find(
            (item) => item.customerId === input.customerId && item.productId === input.productId,
          )
        : undefined

      if (existing) {
        const updated: Review = {
          ...existing,
          rating: input.rating,
          title: input.title,
          body: input.body,
          createdAt: new Date().toISOString(),
        }
        reviews.update(existing.id, updated)
        recomputeRating(input.productId)
        return serviceOk(updated)
      }

      const review: Review = {
        id: uid('r'),
        productId: input.productId,
        customerId: input.customerId,
        userName: input.userName,
        rating: input.rating,
        title: input.title,
        body: input.body,
        createdAt: new Date().toISOString(),
        status: 'published',
      }
      addReview(review)
      return serviceOk(review)
    },
    [addReview, products.items, recomputeRating, reviews],
  )

  /* ---------------------------- الملف الشخصي ---------------------------- */
  const updateProfile = useCallback<ServiceValue['updateProfile']>(
    async (customerId, patch) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Customer>(online.error!, online.code)
      await wait(240, 480)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail<Customer>('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      if (patch.email) {
        const taken = customers.items.some(
          (item) => item.id !== customerId && item.email.toLowerCase() === patch.email!.toLowerCase(),
        )
        if (taken) {
          return serviceFail<Customer>('هذا البريد الإلكتروني مسجل مسبقًا.', 'EMAIL_TAKEN')
        }
      }
      customers.update(customerId, patch)
      return serviceOk({ ...customer, ...patch })
    },
    [customers],
  )

  const saveAddress = useCallback<ServiceValue['saveAddress']>(
    async (customerId, address) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<Address>(online.error!, online.code)
      await wait(280, 520)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail<Address>('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      if (address.id) {
        const exists = customer.addresses.some((item) => item.id === address.id)
        if (!exists) return serviceFail<Address>('العنوان غير موجود.', 'ADDRESS_NOT_FOUND')
        const addresses = customer.addresses.map((item) => {
          if (item.id === address.id) return { ...item, ...address, id: item.id }
          return address.isDefault ? { ...item, isDefault: false } : item
        })
        customers.update(customerId, { addresses })
        return serviceOk({ ...address, id: address.id! })
      }
      const created: Address = { ...address, id: uid('a') }
      const addresses = address.isDefault
        ? customer.addresses.map((item): Address => ({ ...item, isDefault: false })).concat(created)
        : customer.addresses.length === 0
          ? [...customer.addresses, { ...created, isDefault: true }]
          : [...customer.addresses, created]
      customers.update(customerId, { addresses })
      return serviceOk(created)
    },
    [customers],
  )

  const removeAddress = useCallback<ServiceValue['removeAddress']>(
    async (customerId, addressId) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(220, 420)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      const addresses = customer.addresses.filter((item) => item.id !== addressId)
      if (addresses.length && !addresses.some((item) => item.isDefault)) {
        addresses[0] = { ...addresses[0], isDefault: true }
      }
      customers.update(customerId, { addresses })
      return serviceOk()
    },
    [customers],
  )

  const setDefaultAddress = useCallback<ServiceValue['setDefaultAddress']>(
    async (customerId, addressId) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(200, 380)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      customers.update(customerId, {
        addresses: customer.addresses.map((item) => ({ ...item, isDefault: item.id === addressId })),
      })
      return serviceOk()
    },
    [customers],
  )

  const saveCard = useCallback<ServiceValue['saveCard']>(
    async (customerId, card) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail<SavedCard>(online.error!, online.code)
      await wait(260, 480)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail<SavedCard>('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      const created: SavedCard = { ...card, id: uid('card') }
      const savedCards =
        customer.savedCards.length === 0
          ? [{ ...created, isDefault: true }]
          : [...customer.savedCards, created]
      customers.update(customerId, { savedCards })
      return serviceOk(created)
    },
    [customers],
  )

  const removeCard = useCallback<ServiceValue['removeCard']>(
    async (customerId, cardId) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(200, 380)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      const savedCards = customer.savedCards.filter((item) => item.id !== cardId)
      if (savedCards.length && !savedCards.some((item) => item.isDefault)) {
        savedCards[0] = { ...savedCards[0], isDefault: true }
      }
      customers.update(customerId, { savedCards })
      return serviceOk()
    },
    [customers],
  )

  const setDefaultCard = useCallback<ServiceValue['setDefaultCard']>(
    async (customerId, cardId) => {
      const online = assertOnline()
      if (!online.ok) return serviceFail(online.error!, online.code)
      await wait(200, 360)
      const customer = customers.items.find((item) => item.id === customerId)
      if (!customer) return serviceFail('الحساب غير موجود.', 'CUSTOMER_NOT_FOUND')
      customers.update(customerId, {
        savedCards: customer.savedCards.map((item) => ({ ...item, isDefault: item.id === cardId })),
      })
      return serviceOk()
    },
    [customers],
  )

  const value = useMemo<ServiceValue>(
    () => ({
      login,
      register,
      adminLogin,
      requestPasswordReset,
      validateCoupon,
      placeOrder,
      cancelOrder,
      updateOrderStatus,
      submitReview,
      updateProfile,
      saveAddress,
      removeAddress,
      setDefaultAddress,
      saveCard,
      removeCard,
      setDefaultCard,
    }),
    [
      login,
      register,
      adminLogin,
      requestPasswordReset,
      validateCoupon,
      placeOrder,
      cancelOrder,
      updateOrderStatus,
      submitReview,
      updateProfile,
      saveAddress,
      removeAddress,
      setDefaultAddress,
      saveCard,
      removeCard,
      setDefaultCard,
    ],
  )

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
}

export function useService(): ServiceValue {
  const ctx = useContext(ServiceContext)
  if (!ctx) throw new Error('useService must be used inside ServiceProvider')
  return ctx
}

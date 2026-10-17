import type { Product, ProductKind } from '@/types'
import { productImage, type GlyphKind } from '@/lib/artwork'

interface ExpandedProductSeed {
  id: string
  name: string
  sku: string
  brandId: string
  categoryIds: string[]
  price: number
  compareAtPrice?: number
  stock?: number
  sales: number
  glyph: GlyphKind
  kind?: ProductKind
  requiresShipping?: boolean
  deliveryInstructions?: string
  short: string
  description: string
  tags: string[]
  isNew?: boolean
  isBestSeller?: boolean
  daysAgo: number
}

const seeds: ExpandedProductSeed[] = [
  // قطع غيار وصيانة السيارات
  { id: 'p-toyota-brake-pads', name: 'طقم فحمات فرامل أمامية تويوتا كامري', sku: 'TOY-BRK-CAM-24', brandId: 'b-toyota', categoryIds: ['c-auto-parts', 'c-auto-brakes'], price: 245, compareAtPrice: 289, stock: 38, sales: 146, glyph: 'car', short: 'فحمات أصلية بمقاومة عالية للحرارة وتوافق موديلات كامري المحددة.', description: 'طقم فحمات أمامية للاستخدام اليومي، مصمم لتقليل الضجيج والغبار وتحقيق استجابة فرملة متوازنة.\n\n• يشمل فحمات المحور الأمامي\n• يلزم مطابقة رقم الهيكل قبل التركيب\n• يوصى بالتركيب لدى فني مختص', tags: ['سيارات', 'تويوتا', 'فرامل', 'كامري'], isBestSeller: true, daysAgo: 32 },
  { id: 'p-ngk-spark-plugs', name: 'طقم شمعات إشعال NGK إيريديوم — 4 قطع', sku: 'NGK-IR-4P', brandId: 'b-ngk', categoryIds: ['c-auto-parts', 'c-auto-engine'], price: 185, stock: 52, sales: 91, glyph: 'tools', short: 'شمعات إيريديوم لأداء ثابت وكفاءة احتراق محسّنة.', description: 'طقم من أربع شمعات إيريديوم، مناسب لعدد من محركات البنزين. يرجى التحقق من رقم القطعة وموديل المركبة قبل الشراء.', tags: ['سيارات', 'بواجي', 'NGK', 'محرك'], daysAgo: 44 },
  { id: 'p-bosch-oil-filter', name: 'فلتر زيت بوش عالي الكفاءة', sku: 'BOS-OIL-FLT-01', brandId: 'b-bosch', categoryIds: ['c-auto-parts', 'c-auto-filters'], price: 49, stock: 86, sales: 240, glyph: 'tools', short: 'ترشيح موثوق لحماية المحرك بين مواعيد تغيير الزيت.', description: 'فلتر زيت متعدد الطبقات لالتقاط الشوائب الدقيقة. تختلف الملاءمة حسب سنة الصنع وسعة المحرك؛ راجع كتيب المركبة قبل الطلب.', tags: ['سيارات', 'فلتر زيت', 'بوش', 'صيانة دورية'], isBestSeller: true, daysAgo: 68 },
  { id: 'p-michelin-primacy-tire', name: 'إطار ميشلان Primacy 4 مقاس 205/55R16', sku: 'MIC-PR4-2055516', brandId: 'b-michelin', categoryIds: ['c-auto-parts', 'c-auto-tires'], price: 429, compareAtPrice: 479, stock: 24, sales: 62, glyph: 'car', short: 'إطار مريح بتماسك موثوق على الطرق الجافة والمبللة.', description: 'إطار سياحي بتصميم يوازن بين الراحة والثبات. يباع الإطار الواحد؛ اختر مركز تركيب مناسبًا وتحقق من المقاس الموصى به لمركبتك.', tags: ['سيارات', 'إطارات', 'ميشلان', '205/55R16'], daysAgo: 22 },
  { id: 'p-castrol-edge-oil', name: 'زيت محرك كاسترول EDGE 5W-30 — 4 لتر', sku: 'CAS-EDGE-5W30-4L', brandId: 'b-castrol', categoryIds: ['c-auto-parts', 'c-auto-oils'], price: 159, stock: 61, sales: 118, glyph: 'beauty', short: 'زيت تخليقي بالكامل لحماية المحرك في ظروف القيادة اليومية.', description: 'زيت محرك تخليقي بالكامل بدرجة لزوجة 5W-30. تحقق من مواصفات الشركة المصنعة للمركبة قبل الاستخدام.', tags: ['زيت سيارات', 'كاسترول', 'صيانة', 'محرك'], isNew: true, daysAgo: 16 },
  { id: 'p-car-battery-bosch', name: 'بطارية سيارة بوش S4 سعة 70 أمبير', sku: 'BOS-BAT-S4-70', brandId: 'b-bosch', categoryIds: ['c-auto-parts', 'c-auto-electrical'], price: 389, stock: 18, sales: 42, glyph: 'car', short: 'بطارية بدء تشغيل موثوقة مع ضمان محلي.', description: 'بطارية 12 فولت للسيارات المتوافقة. تختلف الأبعاد والقطبية من مركبة لأخرى؛ تحقق من البطارية الحالية قبل الطلب.', tags: ['سيارات', 'بطارية', 'بوش', 'كهرباء'], daysAgo: 55 },
  { id: 'p-car-led-lamps', name: 'مصابيح LED أمامية للسيارة — زوج', sku: 'AUTO-LED-H7-PAIR', brandId: 'b-toyota', categoryIds: ['c-auto-parts', 'c-auto-electrical'], price: 129, stock: 40, sales: 73, glyph: 'car', short: 'إضاءة بيضاء واضحة مع قواعد متعددة للاختيار.', description: 'زوج مصابيح LED أمامية. تأكد من نوع القاعدة النظامية المناسبة لمركبتك، واحرص على ضبط ارتفاع الإضاءة بعد التركيب.', tags: ['سيارات', 'إضاءة', 'LED', 'اكسسوارات'], daysAgo: 28 },
  { id: 'p-car-floor-mats', name: 'فرش أرضية سيارة مطاطي قابل للقص — طقم كامل', sku: 'AUTO-MAT-SET-01', brandId: 'b-toyota', categoryIds: ['c-auto-accessories'], price: 99, stock: 74, sales: 133, glyph: 'car', short: 'حماية عملية للأرضية من الغبار والرطوبة.', description: 'طقم فرش مطاطي مرن قابل للقص والتعديل ليناسب مقاسات متعددة. يقاس قبل القص للحصول على أفضل تغطية.', tags: ['سيارات', 'فرش', 'اكسسوارات', 'تنظيم'], daysAgo: 73 },
  // الأزياء والملابس
  { id: 'p-nike-running-shoes', name: 'حذاء نايكي Pegasus للجري — رجالي', sku: 'NIK-PEG-M-42', brandId: 'b-nike', categoryIds: ['c-fashion', 'c-fashion-shoes'], price: 449, compareAtPrice: 529, stock: 16, sales: 87, glyph: 'sports', short: 'حذاء خفيف للجري اليومي بوسادة مريحة ومقاسات متعددة.', description: 'حذاء رياضي بتهوية جيدة ونعل مرن للجري والمشي. اختر المقاس المعتاد، ويمكن الرجوع إلى دليل المقاسات قبل إتمام الطلب.', tags: ['أزياء', 'نايكي', 'حذاء رياضي', 'رجالي'], isBestSeller: true, daysAgo: 20 },
  { id: 'p-adidas-backpack', name: 'حقيبة ظهر أديداس Essentials — 24 لتر', sku: 'ADI-ESS-BAG-24', brandId: 'b-adidas', categoryIds: ['c-fashion', 'c-fashion-accessories'], price: 179, stock: 34, sales: 102, glyph: 'shirt', short: 'حقيبة يومية بجيب مبطن وحمالات قابلة للتعديل.', description: 'حقيبة خفيفة للجامعة والعمل والرحلات القصيرة، مع مساحة رئيسية واسعة وجيب أمامي سريع الوصول.', tags: ['أزياء', 'أديداس', 'حقيبة', 'إكسسوارات'], daysAgo: 41 },
  { id: 'p-zara-linen-shirt', name: 'قميص زارا كتان بأكمام طويلة — رجالي', sku: 'ZAR-LIN-M-L', brandId: 'b-zara', categoryIds: ['c-fashion', 'c-fashion-men'], price: 189, stock: 22, sales: 55, glyph: 'shirt', short: 'قميص كتان بقصة مريحة مناسب للاستخدام اليومي.', description: 'قميص بملمس كتان خفيف وأزرار أمامية. راجع دليل المقاسات لاختيار القياس الأنسب، ويغسل حسب تعليمات بطاقة العناية.', tags: ['أزياء', 'قميص', 'كتان', 'رجالي'], isNew: true, daysAgo: 12 },
  { id: 'p-hm-dress', name: 'فستان H&M ميدي بطبعة زهرية — نسائي', sku: 'HM-MIDI-FLORAL', brandId: 'b-hm', categoryIds: ['c-fashion', 'c-fashion-women'], price: 229, stock: 18, sales: 48, glyph: 'shirt', short: 'فستان ميدي خفيف بقصة يومية وأكمام قصيرة.', description: 'فستان ميدي بطبعة زهرية وقصة مريحة. تتوفر قياسات مختلفة؛ راجعي جدول المقاسات قبل الشراء.', tags: ['أزياء', 'فستان', 'نسائي', 'H&M'], daysAgo: 26 },
  { id: 'p-nike-sports-hijab', name: 'حجاب رياضي نايكي Dri-FIT', sku: 'NIK-DRIFIT-HIJAB', brandId: 'b-nike', categoryIds: ['c-fashion', 'c-fashion-women', 'c-fashion-accessories'], price: 139, stock: 29, sales: 32, glyph: 'shirt', short: 'خامة خفيفة سريعة الجفاف للتمارين والحركة.', description: 'حجاب رياضي بملمس ناعم وتهوية مناسبة للأنشطة اليومية. يغسل بدرجة حرارة منخفضة للحفاظ على الخامة.', tags: ['أزياء', 'حجاب رياضي', 'نايكي', 'نسائي'], daysAgo: 31 },
  { id: 'p-adidas-kids-sneakers', name: 'حذاء أطفال أديداس Tensaur — مقاسات متعددة', sku: 'ADI-TEN-KIDS-30', brandId: 'b-adidas', categoryIds: ['c-fashion', 'c-fashion-shoes'], price: 199, stock: 21, sales: 38, glyph: 'sports', short: 'حذاء يومي متين بإغلاق عملي للأطفال.', description: 'حذاء خفيف للمدرسة والأنشطة اليومية، بنعل مرن وإغلاق سهل. اختر المقاس حسب طول القدم.', tags: ['أزياء', 'أطفال', 'حذاء', 'أديداس'], isNew: true, daysAgo: 9 },
  { id: 'p-zara-leather-belt', name: 'حزام جلد طبيعي كلاسيكي — لون بني', sku: 'ZAR-BELT-LEATHER-BR', brandId: 'b-zara', categoryIds: ['c-fashion', 'c-fashion-accessories'], price: 119, stock: 35, sales: 71, glyph: 'shirt', short: 'حزام رسمي بسن معدني ومقاس قابل للقص.', description: 'إكسسوار يومي من الجلد الطبيعي بتصميم بسيط يناسب الملابس الرسمية والكاجوال.', tags: ['أزياء', 'حزام', 'جلد', 'إكسسوارات'], daysAgo: 63 },
  // الأدوات والمعدات
  { id: 'p-makita-drill-kit', name: 'مثقاب ماكيتا لاسلكي 18 فولت — طقم بطاريتين', sku: 'MAK-DHP-18V-KIT', brandId: 'b-makita', categoryIds: ['c-industrial-tools', 'c-tools-power'], price: 799, compareAtPrice: 899, stock: 14, sales: 43, glyph: 'tools', short: 'مثقاب ومفك احترافي مع حقيبة وبطاريتين.', description: 'عدة حفر وربط لاسلكية مناسبة لورش الصيانة والأعمال المنزلية الثقيلة. تتضمن البطاريات والشاحن وحقيبة النقل.', tags: ['أدوات', 'ماكيتا', 'مثقاب', '18 فولت'], daysAgo: 29 },
  { id: 'p-dewalt-impact-driver', name: 'مفك صدمات ديوالت 20 فولت — بدون بطارية', sku: 'DEW-IMP-20V', brandId: 'b-dewalt', categoryIds: ['c-industrial-tools', 'c-tools-power'], price: 549, stock: 12, sales: 25, glyph: 'tools', short: 'مفك صدمات مدمج للأعمال المتكررة والتركيب.', description: 'مفك صدمات لاسلكي بهيكل مدمج وتحكم تدريجي بالسرعة. يباع بدون بطارية أو شاحن؛ تحقق من توافق منصة البطاريات لديك.', tags: ['أدوات', 'ديوالت', 'مفك صدمات', 'ورشة'], daysAgo: 47 },
  { id: 'p-wera-tool-set', name: 'طقم مفكات ويرّا Kraftform — 7 قطع', sku: 'WER-KRAFT-7P', brandId: 'b-wera', categoryIds: ['c-industrial-tools', 'c-tools-hand'], price: 169, stock: 32, sales: 67, glyph: 'tools', short: 'مقابض مريحة ورؤوس متعددة للاستخدام اليومي.', description: 'مجموعة مفكات يدوية بمقابض مريحة ومقاسات شائعة تناسب أعمال الصيانة المنزلية والاحترافية.', tags: ['أدوات', 'ويرّا', 'مفكات', 'صيانة'], daysAgo: 38 },
  { id: 'p-dewalt-safety-kit', name: 'طقم حماية ورشة ديوالت — نظارات وقفازات', sku: 'DEW-SAFE-KIT', brandId: 'b-dewalt', categoryIds: ['c-industrial-tools', 'c-tools-safety'], price: 89, stock: 60, sales: 104, glyph: 'tools', short: 'وسائل حماية أساسية للأعمال المنزلية والورش.', description: 'طقم يتضمن نظارات حماية وقفازات عمل متعددة الاستخدامات. اختر معدات الحماية المناسبة لطبيعة العمل واتبع تعليمات السلامة.', tags: ['أدوات', 'سلامة', 'نظارات', 'قفازات'], daysAgo: 52 },
  { id: 'p-milwaukee-toolbox', name: 'صندوق عدة ميلووكي Packout صغير', sku: 'MIL-PACKOUT-SM', brandId: 'b-milwaukee', categoryIds: ['c-industrial-tools', 'c-tools-storage'], price: 249, stock: 18, sales: 29, glyph: 'tools', short: 'صندوق متين لترتيب ونقل معدات الورشة.', description: 'صندوق تخزين قابل للتكديس لمستلزمات الصيانة، مع قفل عملي ومقبض نقل مريح.', tags: ['أدوات', 'ميلووكي', 'صندوق عدة', 'تخزين'], daysAgo: 24 },
  { id: 'p-laser-level', name: 'ميزان ليزر ذاتي التسوية 3 خطوط', sku: 'TOOL-LASER-3L', brandId: 'b-dewalt', categoryIds: ['c-industrial-tools', 'c-tools-measuring'], price: 329, stock: 17, sales: 21, glyph: 'tools', short: 'خطوط مرئية لأعمال التركيب والمحاذاة الداخلية.', description: 'ميزان ليزر بثلاثة خطوط أفقية ورأسية مع حقيبة حمل. يستخدم داخل الأماكن المغلقة وتراعى تعليمات حماية العين.', tags: ['أدوات', 'قياس', 'ليزر', 'تركيب'], daysAgo: 15 },
  // المنزل والمعيشة
  { id: 'p-ikea-desk-lamp', name: 'مصباح مكتب إيكيا LED قابل للتوجيه', sku: 'IKE-LAMP-LED-01', brandId: 'b-ikea', categoryIds: ['c-home-living', 'c-home-lighting'], price: 129, stock: 26, sales: 58, glyph: 'beauty', short: 'إضاءة مكتبية مريحة مع ذراع قابل للتعديل.', description: 'مصباح LED موفر للطاقة بذراع مرن يسمح بتوجيه الإضاءة نحو منطقة العمل أو القراءة.', tags: ['منزل', 'إضاءة', 'مكتب', 'إيكيا'], daysAgo: 46 },
  { id: 'p-ikea-storage-boxes', name: 'طقم صناديق تخزين إيكيا — 3 أحجام', sku: 'IKE-STOR-BOX-3', brandId: 'b-ikea', categoryIds: ['c-home-living', 'c-home-storage'], price: 79, stock: 48, sales: 111, glyph: 'box', short: 'حل عملي لترتيب الخزائن والأرفف وغرف الأطفال.', description: 'ثلاثة صناديق تخزين قابلة للتكديس، مناسبة لتنظيم الملابس والألعاب والمستلزمات المنزلية.', tags: ['منزل', 'تخزين', 'تنظيم', 'إيكيا'], daysAgo: 66 },
  // الجمال والعناية الشخصية
  { id: 'p-loreal-face-serum', name: 'سيروم لوريال Revitalift بحمض الهيالورونيك', sku: 'LOR-REV-SERUM-30', brandId: 'b-loreal', categoryIds: ['c-beauty', 'c-beauty-skincare'], price: 99, stock: 43, sales: 152, glyph: 'beauty', short: 'سيروم ترطيب يومي بتركيبة خفيفة سريعة الامتصاص.', description: 'سيروم عناية بالبشرة للاستخدام الخارجي وفق تعليمات العبوة. يوصى باختبار الحساسية واتباع إرشادات الشركة المصنعة.', tags: ['جمال', 'عناية بالبشرة', 'لوريال', 'ترطيب'], isBestSeller: true, daysAgo: 34 },
  { id: 'p-philips-hair-dryer', name: 'مجفف شعر فيليبس 2100 واط مع موزع هواء', sku: 'PHI-DRY-2100', brandId: 'b-philips', categoryIds: ['c-beauty', 'c-beauty-personal-care'], price: 159, stock: 31, sales: 86, glyph: 'beauty', short: 'تجفيف سريع مع إعدادات حرارة وسرعة متعددة.', description: 'مجفف شعر منزلي مع موزع هواء وملحق تركيز. يستخدم وفق إرشادات السلامة وبعيدًا عن مصادر الماء.', tags: ['جمال', 'عناية شخصية', 'فيليبس', 'شعر'], daysAgo: 49 },
  { id: 'p-nivea-sun-care', name: 'واقي شمس نيفيا SPF 50 — 200 مل', sku: 'NIV-SUN-SPF50-200', brandId: 'b-nivea', categoryIds: ['c-beauty', 'c-beauty-skincare'], price: 45, stock: 65, sales: 183, glyph: 'beauty', short: 'حماية يومية من أشعة الشمس مع تركيبة مقاومة للماء.', description: 'واقي شمس للاستخدام الخارجي. يعاد تطبيقه حسب إرشادات العبوة، ولا يغني عن تجنب التعرض المباشر للشمس.', tags: ['جمال', 'عناية بالبشرة', 'واقي شمس', 'نيفيا'], daysAgo: 19 },
  // منتجات رقمية وخدمات قابلة للحجز
  { id: 'p-digital-home-guide', name: 'دليل رقمي: صيانة المنزل خطوة بخطوة', sku: 'DIG-HOME-GUIDE-01', brandId: 'b-sawqli-digital', categoryIds: ['c-digital', 'c-digital-downloads'], kind: 'digital', requiresShipping: false, deliveryInstructions: 'دليل صيانة المنزل — إصدار سوقلي 1.0\n\nقبل أي صيانة: افصل الجهاز عن مصدر الكهرباء والماء، واتبع تعليمات الشركة المصنّعة.\n\nجدول العناية المقترح:\n• نظّف فتحات التهوية شهريًا.\n• افحص الأسلاك والوصلات دوريًا.\n• لا تفتح الأجهزة ذات الجهد العالي بنفسك؛ استعِن بفني مختص.\n\nاحتفظ بهذه النسخة الرقمية للرجوع إليها.', price: 29, stock: 0, sales: 39, glyph: 'book', short: 'ملف رقمي قابل للتنزيل بعد إتمام الطلب.', description: 'دليل إلكتروني منظم يشرح أساسيات العناية بالأجهزة المنزلية واكتشاف الأعطال الشائعة بأمان.\n\n• تسليم رقمي مرتبط بالطلب\n• محتوى عربي\n• لا حاجة إلى عنوان شحن', tags: ['رقمي', 'كتاب إلكتروني', 'منزل', 'دليل'], isNew: true, daysAgo: 8 },
  { id: 'p-digital-design-kit', name: 'حزمة قوالب تصميم متجر إلكتروني', sku: 'DIG-DESIGN-KIT-01', brandId: 'b-sawqli-digital', categoryIds: ['c-digital', 'c-digital-downloads'], kind: 'digital', requiresShipping: false, deliveryInstructions: 'حزمة قوالب المتجر — نسخة الاستخدام التجاري\n\nيمكنك نسخ النصوص والقوالب وتنظيمها لتناسب نشاطك التجاري.\n\nترخيص الاستخدام: يسمح بتعديل النسخة المشتراة واستخدامها في متجر واحد. لا يُسمح بإعادة بيع الملفات الأصلية أو إعادة توزيعها كما هي.\n\nللاحتفاظ بها، انسخ هذا المحتوى أو استخدم زر تنزيل المحتوى في تفاصيل طلبك.', price: 79, stock: 0, sales: 18, glyph: 'book', short: 'قوالب رقمية قابلة للتنزيل للاستخدام التجاري.', description: 'مجموعة قوالب تصميم وأفكار تخطيطية لتنظيم واجهات المتاجر. تسليم رقمي بعد تأكيد الطلب.', tags: ['رقمي', 'قوالب', 'تصميم', 'أعمال'], daysAgo: 17 },
  { id: 'p-online-language-course', name: 'دورة لغة إنجليزية للمبتدئين — وصول رقمي', sku: 'SRV-EN-COURSE-01', brandId: 'b-sawqli-services', categoryIds: ['c-services', 'c-services-online'], kind: 'service', requiresShipping: false, deliveryInstructions: 'سيتم إرسال بيانات بدء الدورة وموعد الجلسة الأولى إلى البريد الإلكتروني المسجل بعد تأكيد الطلب.\n\nيرجى متابعة تفاصيل الطلب للتنسيق مع فريق التدريب.', price: 199, stock: 0, sales: 24, glyph: 'book', short: 'برنامج تدريبي عن بعد مع مواد تعليمية رقمية.', description: 'خدمة تعليمية عن بعد تتضمن محتوى تدريبيًا وتمارين. تفاصيل بدء الخدمة وتفعيل الوصول تُرسل ضمن تفاصيل الطلب.', tags: ['خدمة', 'تعليم', 'دورة', 'عن بعد'], isNew: true, daysAgo: 11 },
  { id: 'p-home-appliance-install', name: 'خدمة تركيب جهاز منزلي — موعد يحدده العميل', sku: 'SRV-HOME-INSTALL-01', brandId: 'b-sawqli-services', categoryIds: ['c-services', 'c-services-home'], kind: 'service', requiresShipping: true, deliveryInstructions: 'تم استلام طلب تركيب الجهاز. سيُنسق فريق الخدمة معك عبر رقم الجوال المسجل لتأكيد نوع الجهاز والموعد قبل الزيارة.\n\nيرجى تجهيز الجهاز وملحقاته ومكان التركيب.', price: 149, sales: 43, glyph: 'tools', short: 'حجز زيارة فني لتركيب جهاز منزلي في المدينة المدعومة.', description: 'خدمة تركيب منزلية تشمل زيارة فني بعد التنسيق مع العميل. يلزم إدخال عنوان الخدمة واختيار موعد مناسب عند تأكيد الطلب.', tags: ['خدمة', 'تركيب', 'أجهزة منزلية', 'فني'], daysAgo: 28 },
  { id: 'p-car-inspection-service', name: 'فحص مركبة شامل قبل الشراء', sku: 'SRV-AUTO-CHECK-01', brandId: 'b-sawqli-services', categoryIds: ['c-services', 'c-services-auto'], kind: 'service', requiresShipping: true, deliveryInstructions: 'طلب الفحص قيد التنسيق. سيُتواصل معك فريق الخدمة لتأكيد موقع المركبة والوقت المناسب، ثم يُسلّم التقرير بعد انتهاء الفحص.', price: 249, sales: 31, glyph: 'car', short: 'موعد فحص ميداني مع تقرير حالة واضح للمركبة.', description: 'خدمة فحص قبل الشراء تتطلب عنوان المركبة أو موقعها ورقم تواصل. يتم تنسيق الموعد ضمن ملاحظات الطلب.', tags: ['خدمة سيارات', 'فحص مركبة', 'موعد', 'تقرير'], isBestSeller: true, daysAgo: 13 },
  { id: 'p-phone-screen-repair', name: 'خدمة صيانة شاشة جوال — استقبال في مركز الخدمة', sku: 'SRV-PHONE-REPAIR-01', brandId: 'b-sawqli-services', categoryIds: ['c-services', 'c-services-repair'], kind: 'service', requiresShipping: false, deliveryInstructions: 'تم استلام طلب الصيانة. يرجى الاحتفاظ برقم الطلب وإضافة طراز الجهاز ووصف المشكلة في ملاحظاته. سيُرسل لك فريق الدعم خطوات استقبال الجهاز وتأكيد نطاق الخدمة.', price: 349, sales: 18, glyph: 'phone', short: 'طلب حجز صيانة شاشة مع توضيح طراز الجهاز في الملاحظات.', description: 'خدمة إصلاح تتطلب فحص الجهاز وتأكيد التوافق قبل التنفيذ. أضف طراز الجهاز ووصف المشكلة في ملاحظة الطلب.', tags: ['خدمة', 'صيانة', 'جوال', 'إصلاح'], daysAgo: 21 },
  // رياضة وحيوانات أليفة
  { id: 'p-yoga-mat', name: 'بساط يوغا مانع للانزلاق — 6 مم', sku: 'FIT-YOGA-MAT-6', brandId: 'b-fitlife', categoryIds: ['c-sports', 'c-sports-fitness'], price: 79, stock: 37, sales: 74, glyph: 'sports', short: 'سطح مريح للتمارين المنزلية والتمدد.', description: 'بساط خفيف سهل اللف والتنظيف، مناسب لليوغا وتمارين التمدد في المنزل أو النادي.', tags: ['رياضة', 'يوغا', 'لياقة', 'تمارين'], daysAgo: 42 },
  { id: 'p-dumbbell-set', name: 'مجموعة أوزان يدوية قابلة للتعديل — 20 كجم', sku: 'FIT-DMB-ADJ-20', brandId: 'b-fitlife', categoryIds: ['c-sports', 'c-sports-fitness'], price: 299, stock: 15, sales: 39, glyph: 'sports', short: 'مجموعة منزلية لتدريبات القوة مع حوامل تخزين.', description: 'أوزان قابلة للتعديل لمستويات تدريب مختلفة. تأكد من تثبيت الأقراص جيدًا واستخدمها على سطح مستوٍ.', tags: ['رياضة', 'أوزان', 'لياقة', 'تمارين منزلية'], daysAgo: 35 },
  { id: 'p-pet-travel-carrier', name: 'حقيبة نقل للحيوانات الأليفة — مقاس متوسط', sku: 'PET-CARRIER-M', brandId: 'b-petcare', categoryIds: ['c-pets', 'c-pets-travel'], price: 119, stock: 16, sales: 27, glyph: 'pet', short: 'حقيبة تهوية جيدة للتنقل والزيارات البيطرية.', description: 'حقيبة خفيفة بفتحات تهوية وقاعدة قابلة للإزالة. تحقق من وزن وأبعاد الحيوان قبل اختيار المقاس.', tags: ['حيوانات أليفة', 'حقيبة نقل', 'قطط', 'كلاب'], daysAgo: 23 },
  { id: 'p-pet-food-bowl', name: 'وعاء طعام وماء مزدوج للحيوانات الأليفة', sku: 'PET-BOWL-DBL', brandId: 'b-petcare', categoryIds: ['c-pets', 'c-pets-feeding'], price: 39, stock: 52, sales: 96, glyph: 'pet', short: 'وعاء مزدوج سهل التنظيف بقاعدة ثابتة.', description: 'وعاء عملي للطعام والماء بقاعدة مانعة للانزلاق. يغسل بانتظام للحفاظ على النظافة.', tags: ['حيوانات أليفة', 'طعام', 'وعاء', 'منزل'], daysAgo: 61 },
]

function buildProduct(seed: ExpandedProductSeed): Product {
  const kind = seed.kind ?? 'physical'
  return {
    id: seed.id,
    name: seed.name,
    sku: seed.sku,
    shortDescription: seed.short,
    description: seed.description,
    images: [0, 1, 2].map((variant) => productImage(seed.glyph, 300 + seed.id.length, variant)),
    price: seed.price,
    compareAtPrice: seed.compareAtPrice,
    cost: Math.round(seed.price * 0.7),
    stock: seed.stock ?? 0,
    trackStock: kind === 'physical',
    lowStockThreshold: 5,
    allowBackorder: false,
    categoryIds: seed.categoryIds,
    brandId: seed.brandId,
    tags: seed.tags,
    options: [],
    variants: [],
    specifications: [],
    relatedIds: [],
    isNew: Boolean(seed.isNew),
    isBestSeller: Boolean(seed.isBestSeller),
    isFeatured: false,
    status: 'published',
    rating: 0,
    reviewCount: 0,
    sales: seed.sales,
    weight: kind === 'physical' ? 0.5 : undefined,
    createdAt: new Date(Date.now() - seed.daysAgo * 86_400_000).toISOString(),
    kind,
    requiresShipping: seed.requiresShipping ?? kind === 'physical',
    deliveryInstructions: seed.deliveryInstructions,
  }
}

export const expandedCatalogProducts: Product[] = seeds.map(buildProduct)

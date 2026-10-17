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
  OrderItem,
  Product,
  Review,
  Settings,
  StaticPage,
} from '@/types'
import { brandLogo, categoryImage } from '@/lib/artwork'
import { daysAgoIso } from '@/lib/utils'
import { catalogProductsWithRelations } from '@/data/catalog'

/* ------------------------------ الأقسام ------------------------------ */
export const seedCategories: Category[] = [
  { id: 'c-phones', name: 'جوالات', nameEn: 'Phones', image: categoryImage('phone', '#4f46e5'), parentId: null, active: true, order: 1, description: 'أحدث الجوالات الذكية من جميع العلامات التجارية', icon: 'phone' },
  { id: 'c-laptops', name: 'لابتوبات', nameEn: 'Laptops', image: categoryImage('laptop', '#0284c7'), parentId: null, active: true, order: 2, description: 'لابتوبات للعمل والألعاب والدراسة', icon: 'laptop' },
  { id: 'c-home', name: 'أجهزة منزلية', nameEn: 'Home Appliances', image: categoryImage('fridge', '#059669'), parentId: null, active: true, order: 3, description: 'كل ما يحتاجه منزلك من أجهزة كهربائية', icon: 'fridge' },
  { id: 'c-tv', name: 'تلفزيونات', nameEn: 'TVs', image: categoryImage('tv', '#7c3aed'), parentId: null, active: true, order: 4, description: 'تلفزيونات ذكية بأحجام ودقات متعددة', icon: 'tv' },
  { id: 'c-audio', name: 'سماعات', nameEn: 'Audio', image: categoryImage('headphones', '#db2777'), parentId: null, active: true, order: 5, description: 'سماعات لاسلكية وسلكية ومكبرات صوت', icon: 'headphones' },
  { id: 'c-cameras', name: 'كاميرات', nameEn: 'Cameras', image: categoryImage('camera', '#d97706'), parentId: null, active: true, order: 6, description: 'كاميرات احترافية وكاميرات مراقبة', icon: 'camera' },
  { id: 'c-gaming', name: 'أجهزة ألعاب', nameEn: 'Gaming', image: categoryImage('gamepad', '#dc2626'), parentId: null, active: true, order: 7, description: 'أجهزة وأذرع ألعاب وملحقاتها', icon: 'gamepad' },
  { id: 'c-printers', name: 'طابعات', nameEn: 'Printers', image: categoryImage('printer', '#475569'), parentId: null, active: true, order: 8, description: 'طابعات ليزر وحبرية للمنزل والمكتب', icon: 'printer' },
  { id: 'c-tools', name: 'أدوات كهربائية', nameEn: 'Electrical Tools', image: categoryImage('kettle', '#ea580c'), parentId: null, active: true, order: 9, description: 'أدوات ومستلزمات كهربائية متنوعة', icon: 'kettle' },
  { id: 'c-tablets', name: 'أجهزة لوحية', nameEn: 'Tablets', image: categoryImage('tablet', '#4f46e5'), parentId: null, active: true, order: 10, description: 'أجهزة لوحية للعمل والدراسة والترفيه', icon: 'tablet' },
  /* أقسام فرعية */
  { id: 'c-phones-iphone', name: 'آيفون', image: categoryImage('phone', '#334155'), parentId: 'c-phones', active: true, order: 1 },
  { id: 'c-phones-android', name: 'جوالات أندرويد', image: categoryImage('phone', '#16a34a'), parentId: 'c-phones', active: true, order: 2 },
  { id: 'c-phones-accessories', name: 'إكسسوارات الجوال', image: categoryImage('watch', '#0891b2'), parentId: 'c-phones', active: true, order: 3 },
  { id: 'c-laptops-gaming', name: 'لابتوبات ألعاب', image: categoryImage('laptop', '#dc2626'), parentId: 'c-laptops', active: true, order: 1 },
  { id: 'c-laptops-pro', name: 'لابتوبات احترافية', image: categoryImage('monitor', '#4f46e5'), parentId: 'c-laptops', active: true, order: 2 },
  { id: 'c-home-washers', name: 'غسالات', image: categoryImage('washer', '#14b8a6'), parentId: 'c-home', active: true, order: 1 },
  { id: 'c-home-fridges', name: 'ثلاجات', image: categoryImage('fridge', '#22c55e'), parentId: 'c-home', active: true, order: 2 },
  { id: 'c-home-ac', name: 'مكيفات', image: categoryImage('ac', '#38bdf8'), parentId: 'c-home', active: true, order: 3 },
  { id: 'c-home-cleaning', name: 'أجهزة التنظيف', image: categoryImage('vacuum', '#a855f7'), parentId: 'c-home', active: true, order: 4 },
  { id: 'c-audio-headphones', name: 'سماعات رأس', image: categoryImage('headphones', '#ec4899'), parentId: 'c-audio', active: true, order: 1 },
  { id: 'c-audio-speakers', name: 'مكبرات صوت', image: categoryImage('speaker', '#0891b2'), parentId: 'c-audio', active: true, order: 2 },
  { id: 'c-gaming-consoles', name: 'أجهزة الألعاب', image: categoryImage('gamepad', '#ef4444'), parentId: 'c-gaming', active: true, order: 1 },
  { id: 'c-gaming-accessories', name: 'ملحقات الألعاب', image: categoryImage('keyboard', '#475569'), parentId: 'c-gaming', active: true, order: 2 },
  { id: 'c-printers-laser', name: 'طابعات ليزر', image: categoryImage('printer', '#334155'), parentId: 'c-printers', active: true, order: 1 },
  { id: 'c-printers-ink', name: 'طابعات حبر', image: categoryImage('printer', '#0f766e'), parentId: 'c-printers', active: true, order: 2 },
  { id: 'c-tools-kitchen', name: 'أدوات المطبخ', image: categoryImage('kettle', '#f97316'), parentId: 'c-tools', active: true, order: 1 },
]

/* --------------------------- العلامات التجارية --------------------------- */
const brandDefs: Array<[string, string]> = [
  ['Samsung', '#1e3a8a'],
  ['Apple', '#0f172a'],
  ['Google', '#4285f4'],
  ['Huawei', '#c00b1e'],
  ['Xiaomi', '#f97316'],
  ['Sony', '#111827'],
  ['LG', '#a50034'],
  ['HP', '#0ea5e9'],
  ['Dell', '#0076ce'],
  ['Asus', '#00539b'],
  ['Lenovo', '#e2231a'],
  ['Bosch', '#dc2626'],
  ['Dyson', '#6d28d9'],
  ['Philips', '#0b5cab'],
  ['Panasonic', '#0c3b77'],
  ['JBL', '#ea580c'],
  ['Canon', '#b91c1c'],
  ['Anker', '#0f766e'],
  ['Logitech', '#111827'],
  ['TCL', '#1f2937'],
  ['DJI', '#111827'],
  ['Microsoft', '#5e5e5e'],
  ['Nintendo', '#e60012'],
]

export const seedBrands: Brand[] = brandDefs.map(([name, color], i) => ({
  id: `b-${name.toLowerCase()}`,
  name,
  logo: brandLogo(name, color),
  active: true,
  order: i + 1,
}))

/* ------------------------------ المنتجات ------------------------------ */
/* (يتم تصدير seedProducts بعد احتساب التقييمات في الأسفل) */

/* ----------------------------- المراجعات ----------------------------- */
interface ReviewSeed {
  productId: string
  userName: string
  rating: number
  title: string
  body: string
  daysAgo: number
  reply?: string
}

const reviewSeeds: ReviewSeed[] = [
  { productId: 'p-galaxy-s24-ultra', userName: 'عبدالله المطيري', rating: 5, title: 'يستحق كل ريال', body: 'وصلني خلال يومين والتغليف ممتاز. الكاميرا الليلية ممتازة والقلم مريح جدًا للملاحظات في العمل.', daysAgo: 26, reply: 'شكرًا لك عبدالله، سعداء بتجربتك. نتمنى لك تجربة رائعة دائمًا!' },
  { productId: 'p-galaxy-s24-ultra', userName: 'نورة القحطاني', rating: 4, title: 'ممتاز مع ملاحظة بسيطة', body: 'الجوال قوي والبطارية تدوم يومًا كاملًا مع الاستخدام الكثيف. أتمنى لو كان الشاحن الأصلي أسرع.', daysAgo: 19 },
  { productId: 'p-galaxy-s24-ultra', userName: 'تركي الحربي', rating: 5, title: 'ما شاء الله', body: 'أفضل جوال جرّبته. الكاميرا الليلية تتفوق على جوالات أغلى منه.', daysAgo: 11 },
  { productId: 'p-iphone-15-pro-max', userName: 'سارة الدوسري', rating: 5, title: 'تجربة أبل الكاملة', body: 'التصوير احترافي والزر الجديد للكاميرا سهل جدًا. البطارية أقوى من جوالاتي السابقة.', daysAgo: 34 },
  { productId: 'p-iphone-15-pro-max', userName: 'ريم الزهراني', rating: 5, title: 'راضٍ تمامًا', body: 'التوصيل كان سريعًا والتغليف محكمًا. الجهاز ثقيل قليلًا لكن جودة البناء تبرر.', daysAgo: 22 },
  { productId: 'p-iphone-15-pro-max', userName: 'ماجد الشمري', rating: 4, title: 'ممتاز لكن السعر مرتفع', body: 'الجهاز ممتاز بلا منازع، فقط أتمنى لو فيه عروض أكثر على الإصدارات الرقمية.', daysAgo: 9 },
  { productId: 'p-iphone-15', userName: 'فهد العتيبي', rating: 4, title: 'سعر ممتاز مقابل المواصفات', body: 'أخذته بعد العرض والكاميرا 48 ميجابكسل ممتازة للاستخدام اليومي.', daysAgo: 28 },
  { productId: 'p-iphone-15', userName: 'منال الغامدي', rating: 5, title: 'أفضل شراء هذا العام', body: 'الخامة رائعة والبطارية تتحمل يومين بسهولة.', daysAgo: 15 },
  { productId: 'p-redmi-note-13', userName: 'منال الغامدي', rating: 5, title: 'قيمة مقابل السعر ممتازة', body: 'لا أنصح بأكثر. الكاميرا 200 ميجابكسل والشحن 67 واط سريع جدًا، والسعر مستحيل.', daysAgo: 30 },
  { productId: 'p-redmi-note-13', userName: 'عبدالله المطيري', rating: 4, title: 'ممتاز للاستخدام اليومي', body: 'الشاشة واضحة والكاميرا جيدة في النهار. مكبر الصوت قوي قليلًا لكنه مقبول.', daysAgo: 17 },
  { productId: 'p-xperia-10-vi', userName: 'تركي الحربي', rating: 4, title: 'تصميم مريح', body: 'حجم مثالي للاستخدام بيد واحدة والكاميرا متقنة في الألوان.', daysAgo: 12 },
  { productId: 'p-oneplus-12t', userName: 'سارة الدوسري', rating: 5, title: 'شحن خرافي', body: 'امتلأ الجهاز بالكامل في 25 دقيقة. الأداء ممتاز في الألعاب.', daysAgo: 8 },
  { productId: 'p-galaxy-a55', userName: 'نورة القحطاني', rating: 4, title: 'ممتاز بسعر معقول', body: 'خامات جيدة وشاشة رائعة. التحديثات مضمونة لأربع سنوات وهذا مهم.', daysAgo: 21 },
  { productId: 'p-pixel-8-pro', userName: 'ريم الزهراني', rating: 5, title: 'الكاميرا ساحرة', body: 'أفضل صور ليلية جرّبتها بهاتف. أدوات الذكاء الاصطناعي مفيدة جدًا في المونتاج السريع.', daysAgo: 6 },
  { productId: 'p-macbook-pro-14', userName: 'فهد العتيبي', rating: 5, title: 'استثمار يستحق', body: 'أنجزت عليه مونتاج فيديو 4K بدون أي تهنيج. البطارية تكفي يوم عمل كامل.', daysAgo: 25 },
  { productId: 'p-macbook-pro-14', userName: 'عبدالله المطيري', rating: 5, title: 'سريع جدًا', body: 'شاشة رائعة وأداء خرافي، والتبريد هادئ أثناء العمل المكتبي.', daysAgo: 14 },
  { productId: 'p-macbook-pro-14', userName: 'ماجد الشمري', rating: 4, title: 'ممتاز مع السعر', body: 'جودة البناء لا تُضاهى. السعر مرتفع لكن الفرق واضح.', daysAgo: 7 },
  { productId: 'p-galaxy-book4-pro', userName: 'منال الغامدي', rating: 4, title: 'بديل ممتاز لابتوب العمل', body: 'الشاشة الرائعة والقلم المدمج عملي جدًا. الأداء جيد للمهام المتعددة.', daysAgo: 18 },
  { productId: 'p-hp-elitebook-840', userName: 'سارة الدوسري', rating: 4, title: 'متين وعملي', body: 'جودة البناء مناسبة للعمل المكتبي والبطارية ممتازة.', daysAgo: 24 },
  { productId: 'p-dell-xps-15', userName: 'تركي الحربي', rating: 5, title: 'شاشة OLED مذهلة', body: 'الألوان دقيقة والألمنيوم خفيف. أعجبني التصميم كثيرًا.', daysAgo: 16 },
  { productId: 'p-asus-rog-strix', userName: 'ماجد الشمري', rating: 5, title: 'أداء ألعاب ممتاز', body: 'يشغّل الألعاب على إعدادات عالية مع 120 إطار. التبريد جيد تحت الضغط.', daysAgo: 13 },
  { productId: 'p-asus-rog-strix', userName: 'ريم الزهراني', rating: 4, title: 'قيمة مقابل السعر', body: 'كارت RTX 4060 يكفي للألعاب الحديثة، والتبريد بصوت مسموع أثناء اللعب الطويل.', daysAgo: 10 },
  { productId: 'p-lenovo-legion-5', userName: 'نورة القحطاني', rating: 4, title: 'سعر ممتاز', body: 'أداء قريب من أغلى لابتوبات الألعاب بنصف السعر تقريبًا.', daysAgo: 5 },
  { productId: 'p-bosch-washer-9kg', userName: 'عبدالله المطيري', rating: 5, title: 'هادئة وفعّالة', body: 'الغسيل نظيف جدًا ولا يصدر صوتًا مزعجًا. نظام i-DOS وفّر عليّ وقتًا كبيرًا.', daysAgo: 27 },
  { productId: 'p-bosch-washer-9kg', userName: 'فهد العتيبي', rating: 4, title: 'ممتازة', body: 'برنامج 15 دقيقة مفيد جدًا والسعة مناسبة لعائلة من خمسة أشخاص.', daysAgo: 20 },
  { productId: 'p-lg-fridge-26', userName: 'سارة الدوسري', rating: 5, title: 'تبريد ممتاز', body: 'الأقسام مستقلة والثبات ممتاز. حجمها مناسب للمطبخ.', daysAgo: 23 },
  { productId: 'p-samsung-ac-24000', userName: 'ماجد الشمري', rating: 5, title: 'تبريد فوري بدون رياح', body: 'WindFree فعلًا يوزّع الهواء بدون أن يصيبك تيار بارد مباشر.', daysAgo: 15 },
  { productId: 'p-samsung-ac-24000', userName: 'منال الغامدي', rating: 4, title: 'راحة تامة', body: 'التبريد ممتاز والصوت هادئ، والتركيب تم بفريق مختص.', daysAgo: 4 },
  { productId: 'p-dyson-v15', userName: 'ريم الزهراني', rating: 5, title: 'تغيير كبير في التنظيف', body: 'قوة شفط تتفوق على مكانس أكبر حجمًا، والبطارية تكفي لجولة كاملة في المنزل.', daysAgo: 18 },
  { productId: 'p-bosch-oven', userName: 'تركي الحربي', rating: 4, title: 'ممتاز للمطبخ', body: 'التنظيف الذاتي وفّر عليّ وقتًا كبيرًا. التسليم والتركيب كانا ممتازين.', daysAgo: 12 },
  { productId: 'p-philips-dishwasher', userName: 'نورة القحطاني', rating: 4, title: 'توفير في المياه', body: 'استهلاكها منخفض مقارنة بغيرها وتخرج الأطباق نظيفة.', daysAgo: 9 },
  { productId: 'p-samsung-qled-55', userName: 'فهد العتيبي', rating: 5, title: 'ألوان رائعة', body: 'Quantum Dot يوضح الفرق. الصوت مع Dolby Atmos ممتاز للمشاهدة مع العائلة.', daysAgo: 20 },
  { productId: 'p-samsung-qled-55', userName: 'منال الغامدي', rating: 4, title: 'ممتاز', body: 'التحكم من الجوال مريح جدًا والواجهة سريعة.', daysAgo: 6 },
  { productId: 'p-lg-oled-65', userName: 'ماجد الشمري', rating: 5, title: 'أسود لا مثيل له', body: 'الأفلام تظهر بتفاصيل مذهلة في المشاهد الداكنة. السعر يستحق.', daysAgo: 14 },
  { productId: 'p-tcl-qled-50', userName: 'سارة الدوسري', rating: 4, title: 'أفضل سعر في فئتها', body: 'جودة الصورة ممتازة مقابل السعر، وDolby Vision يعمل بشكل جيد.', daysAgo: 8 },
  { productId: 'p-sony-bravia-43', userName: 'عبدالله المطيري', rating: 4, title: 'معالجة صور ذكية', body: 'المعالج يوضح التفاصيل في المحتوى، وحجم 43 بوصة مناسب لغرفة النوم.', daysAgo: 5 },
  { productId: 'p-philips-tv-50', userName: 'ريم الزهراني', rating: 5, title: 'Ambilight رائع', body: 'الإضاءة الخلفية تعطي تجربة مميزة جدًا في المساء.', daysAgo: 3 },
  { productId: 'p-jbl-tune-770nc', userName: 'تركي الحربي', rating: 5, title: 'صوت وقيمة ممتازة', body: 'عزل الضوضاء فعال في المواصلات، والبطارية تدوم أسبوعًا كاملًا.', daysAgo: 16 },
  { productId: 'p-jbl-tune-770nc', userName: 'فهد العتيبي', rating: 4, title: 'ممتاز', body: 'الجودة الصوتية JBL المعتادة والسعر مناسب.', daysAgo: 7 },
  { productId: 'p-sony-wh1000xm5', userName: 'سارة الدوسري', rating: 5, title: 'عزل ضوضاء يغيّر كل شيء', body: 'استخدمتها في الطيران ولم أسمع صوت المحرك إطلاقًا.', daysAgo: 13 },
  { productId: 'p-airpods-pro-2', userName: 'نورة القحطاني', rating: 5, title: 'مثالية مع الآيفون', body: 'الاقتران الفوري والوضع الشفاف ممتاز في المكتب.', daysAgo: 10 },
  { productId: 'p-anker-liberty-4nc', userName: 'ماجد الشمري', rating: 4, title: 'قيمة ممتازة', body: 'شاشة العرض على العلبة مفيدة، والشحن سريع جدًا.', daysAgo: 4 },
  { productId: 'p-logitech-g-pro-x', userName: 'ماجد الشمري', rating: 5, title: 'أفضل سماعة للألعاب', body: 'الصوت المحيطي ممتاز والميكروفون واضح جدًا في الدردشة.', daysAgo: 11 },
  { productId: 'p-jbl-charge-5', userName: 'منال الغامدي', rating: 5, title: 'مثالية للرحلات', body: 'صوت قوي ومقاومة الماء منعتني من القلق في الشاطئ.', daysAgo: 9 },
  { productId: 'p-canon-r50', userName: 'عبدالله المطيري', rating: 5, title: 'مثالية للمبتدئين', body: 'الوزن خفيف والواجهة سهلة، وجودة الصور ممتازة مع العدسة المرفقة.', daysAgo: 17 },
  { productId: 'p-sony-a6400', userName: 'ريم الزهراني', rating: 4, title: 'تركيز سريع جدًا', body: 'تتبع العين يعمل بدقة، وجودة الصور عمومًا ممتازة.', daysAgo: 12 },
  { productId: 'p-anker-eufy-cam', userName: 'تركي الحربي', rating: 4, title: 'تركيب سهل', body: 'الشحن يدوم شهور، وجودة 2K ممتازة لتأمين المنزل.', daysAgo: 6 },
  { productId: 'p-dji-mavic-3', userName: 'فهد العتيبي', rating: 5, title: 'تصوير جوي مذهل', body: 'استقرّبت فوق فيلا المنظر وخرجت صور رائعة، ونظام تجنّب العوائق يعمل بدقة.', daysAgo: 4 },
  { productId: 'p-ps5-slim', userName: 'سارة الدوسري', rating: 5, title: 'النسخة Slim أجمل', body: 'أصغر وأخف من النسخة الأولى، والتخزين كافٍ للألعاب.', daysAgo: 21 },
  { productId: 'p-ps5-digital', userName: 'ماجد الشمري', rating: 4, title: 'ممتازة', body: 'أفضل من القرص لأني اشتريت ألعاب مستعملة. المروحة بصوت مسموع قليلًا.', daysAgo: 15 },
  { productId: 'p-nintendo-switch-oled', userName: 'نورة القحطاني', rating: 5, title: 'ممتعة للعائلة', body: 'شاشة OLED يظهر الفرق واضحًا، والوضع المحمول عملي في السفر.', daysAgo: 8 },
  { productId: 'p-xbox-controller', userName: 'ماجد الشمري', rating: 4, title: 'جيد جدًا', body: 'الإحساس ممتاز والاهتزاز دقيق.', daysAgo: 5 },
  { productId: 'p-hp-laser-m429', userName: 'منال الغامدي', rating: 4, title: 'ممتازة للمكتب', body: 'الطباعة سريعة والفاكس يعمل بدون مشاكل، وإعداد الشبكة سهل.', daysAgo: 18 },
  { productId: 'p-canon-pixma-g3411', userName: 'ريم الزهراني', rating: 5, title: 'ألوان الصور رائعة', body: 'أفضل طابعة صور جربتها بهذا السعر، والحبر يكفي مدة طويلة.', daysAgo: 14 },
  { productId: 'p-hp-laser-107a', userName: 'عبدالله المطيري', rating: 4, title: 'بسيطة وفعّالة', body: 'تفي بالغرض للمكتبة المنزلية، وحجمها صغير.', daysAgo: 22 },
  { productId: 'p-bosch-drill-18v', userName: 'تركي الحربي', rating: 5, title: 'قوة احترافية', body: 'بطاريتان تكفيان لمدة عمل كاملة، والحقيبة منظمة.', daysAgo: 15 },
  { productId: 'p-philips-kettle', userName: 'سارة الدوسري', rating: 4, title: 'سريعة وأمان جيد', body: 'تغلي في أقل من دقيقتين، والإطفاء التلقائي يعمل بدقة.', daysAgo: 19 },
  { productId: 'p-philips-blender', userName: 'فهد العتيبي', rating: 4, title: 'قوية', body: 'السكين قوي والكميات الكبيرة لا تسبب مشكلة.', daysAgo: 3 },
  { productId: 'p-bosch-screwdriver', userName: 'عبدالله المطيري', rating: 5, title: 'خفيفة وعملية', body: 'أنفع ما في صندوق الأدوات، والرؤوس تغطي كل ما أحتاجه.', daysAgo: 9 },
  { productId: 'p-ipad-air-11', userName: 'منال الغامدي', rating: 5, title: 'خفيف وقوي', body: 'استخدمتها للعمل والسفر، والبطارية تكفي يومًا كاملًا.', daysAgo: 7 },
  { productId: 'p-galaxy-tab-s9', userName: 'نورة القحطاني', rating: 4, title: 'شاشة رائعة', body: 'مقاومة للماء عملية جدًا في المطبخ، والقلم مريح للملاحظات.', daysAgo: 11 },
  { productId: 'p-lenovo-tab-p12', userName: 'تركي الحربي', rating: 4, title: 'شاشة كبيرة ممتازة', body: 'أستخدمها للعمل المكتبي مع لوحة المفاتيح، والبطارية جيدة.', daysAgo: 13 },
  { productId: 'p-apple-watch-s9', userName: 'ريم الزهراني', rating: 5, title: 'متابعة النشاط ممتازة', body: 'مقاسات شاشة كبيرة وواضحة تحت الشمس، والنوم أدق.', daysAgo: 16 },
  { productId: 'p-galaxy-watch-6', userName: 'سارة الدوسري', rating: 4, title: 'مريحة في المعصم', body: 'خفيفة وسهلة الارتداء، ومستشعر الإجهاد مفيد يوميًا.', daysAgo: 10 },
  { productId: 'p-anker-charger-65w', userName: 'ماجد الشمري', rating: 5, title: 'شحن سريع وحجم صغير', body: 'يشحن اللابتوب والهاتف في نفس الوقت، وحجمه مناسب للسفر.', daysAgo: 6 },
  { productId: 'p-anker-charger-base', userName: 'فهد العتيبي', rating: 4, title: 'تثبيت مغناطيسي ممتاز', body: 'التماسك قوي والزاوية مريحة للمشاهدة.', daysAgo: 2 },
]

export const seedReviews: Review[] = reviewSeeds.map((seed, index) => ({
  id: `r-${index + 1}`,
  productId: seed.productId,
  userName: seed.userName,
  rating: seed.rating,
  title: seed.title,
  body: seed.body,
  createdAt: daysAgoIso(seed.daysAgo),
  status: 'published',
  reply: seed.reply,
}))

/* ------------------ احتساب متوسط التقييم من المراجعات ------------------ */
const ratingAggregates = seedReviews.reduce<Record<string, { total: number; count: number }>>((acc, review) => {
  const current = acc[review.productId] ?? { total: 0, count: 0 }
  current.total += review.rating
  current.count += 1
  acc[review.productId] = current
  return acc
}, {})

export const seedProducts: Product[] = catalogProductsWithRelations.map((product) => {
  const aggregate = ratingAggregates[product.id]
  if (!aggregate) return product
  return {
    ...product,
    rating: Math.round((aggregate.total / aggregate.count) * 10) / 10,
    reviewCount: aggregate.count,
  }
})

/* ------------------------------ العملاء ------------------------------ */
export const seedCustomers: Customer[] = [
  {
    id: 'u-1001',
    name: 'عبدالله المطيري',
    email: 'abdullah.almutairi@sawqli.sa',
    phone: '0551234567',
    password: '123456',
    gender: 'male',
    birthday: '1992-04-18',
    blocked: false,
    createdAt: daysAgoIso(210),
    addresses: [
      { id: 'a-1001', label: 'المنزل', fullName: 'عبدالله سالم المطيري', phone: '0551234567', city: 'الرياض', district: 'حي الملقا', street: 'شارع الأمير سلطان، مبنى 24', building: '24', postalCode: '13524', isDefault: true },
      { id: 'a-1002', label: 'العمل', fullName: 'عبدالله سالم المطيري', phone: '0551234567', city: 'الرياض', district: 'حي العليا', street: 'برج المملكة، الدور 12', building: 'طريق الملك فهد', notes: 'يرجى الاتصال قبل الوصول' },
    ],
    savedCards: [{ id: 'card-1001', brand: 'visa', last4: '4242', expiry: '09/28', holder: 'ABDULLAH ALMUTAIRI', isDefault: true }],
  },
  {
    id: 'u-1002',
    name: 'نورة القحطاني',
    email: 'noura.qahtani@sawqli.sa',
    phone: '0552345678',
    password: '123456',
    gender: 'female',
    birthday: '1995-09-02',
    blocked: false,
    createdAt: daysAgoIso(165),
    addresses: [
      { id: 'a-2001', label: 'المنزل', fullName: 'نورة فهد القحطاني', phone: '0552345678', city: 'جدة', district: 'حي الروضة', street: 'شارع الأمير سعود، عمارة 8', building: '8', postalCode: '23431', isDefault: true },
    ],
    savedCards: [{ id: 'card-2001', brand: 'mada', last4: '8891', expiry: '03/27', holder: 'NOURA QAHTANI', isDefault: true }],
  },
  {
    id: 'u-1003',
    name: 'فهد العتيبي',
    email: 'fahad.otaibi@sawqli.sa',
    phone: '0503456789',
    password: '123456',
    gender: 'male',
    birthday: '1988-12-11',
    blocked: false,
    createdAt: daysAgoIso(140),
    addresses: [
      { id: 'a-3001', label: 'المنزل', fullName: 'فهد ناصر العتيبي', phone: '0503456789', city: 'الدمام', district: 'حي الفيصلية', street: 'شارع الملك سعود، فيلا 17', building: '17', isDefault: true },
    ],
    savedCards: [],
  },
  {
    id: 'u-1004',
    name: 'سارة الدوسري',
    email: 'sara.dosari@sawqli.sa',
    phone: '0554567890',
    password: '123456',
    gender: 'female',
    birthday: '1997-06-25',
    blocked: false,
    createdAt: daysAgoIso(120),
    addresses: [
      { id: 'a-4001', label: 'المنزل', fullName: 'سارة ماجد الدوسري', phone: '0554567890', city: 'الرياض', district: 'حي النرجس', street: 'شارع عثمان بن عفان، مبنى 12', building: '12', isDefault: true },
      { id: 'a-4002', label: 'المستودع', fullName: 'سارة ماجد الدوسري', phone: '0554567890', city: 'الرياض', district: 'حي السلي', street: 'مستودع المستلزمات — مجمع المنطقة الصناعية', notes: 'الدخول من البوابة الخلفية' },
    ],
    savedCards: [{ id: 'card-4001', brand: 'mastercard', last4: '5210', expiry: '11/29', holder: 'SARA DOSARI', isDefault: true }],
  },
  {
    id: 'u-1005',
    name: 'ماجد الشمري',
    email: 'majed.shammari@sawqli.sa',
    phone: '0505678901',
    password: '123456',
    gender: 'male',
    birthday: '1991-02-08',
    blocked: false,
    createdAt: daysAgoIso(95),
    addresses: [
      { id: 'a-5001', label: 'المنزل', fullName: 'ماجد خالد الشمري', phone: '0505678901', city: 'الخبر', district: 'حي العقربية', street: 'شارع الملك فهد، عمارة 5', building: '5', isDefault: true },
    ],
    savedCards: [],
  },
  {
    id: 'u-1006',
    name: 'ريم الزهراني',
    email: 'reem.zahrani@sawqli.sa',
    phone: '0556789012',
    password: '123456',
    gender: 'female',
    birthday: '1999-08-30',
    blocked: false,
    createdAt: daysAgoIso(70),
    addresses: [
      { id: 'a-6001', label: 'المنزل', fullName: 'ريم عبدالعزيز الزهراني', phone: '0556789012', city: 'الرياض', district: 'حي حطين', street: 'شارع التخصصي، مبنى 33', building: '33', isDefault: true },
    ],
    savedCards: [{ id: 'card-6001', brand: 'visa', last4: '1134', expiry: '06/28', holder: 'REEM ZAHRANI' }],
  },
  {
    id: 'u-1007',
    name: 'تركي الحربي',
    email: 'turki.harbi@sawqli.sa',
    phone: '0507890123',
    password: '123456',
    gender: 'male',
    birthday: '1985-03-19',
    blocked: false,
    createdAt: daysAgoIso(52),
    addresses: [
      { id: 'a-7001', label: 'المنزل', fullName: 'تركي سعد الحربي', phone: '0507890123', city: 'أبها', district: 'حي المنسك', street: 'طريق الملك سعود، فيلا 9', building: '9', isDefault: true },
    ],
    savedCards: [],
  },
  {
    id: 'u-1008',
    name: 'منال الغامدي',
    email: 'manal.ghamdi@sawqli.sa',
    phone: '0558901234',
    password: '123456',
    gender: 'female',
    birthday: '1993-11-05',
    blocked: false,
    createdAt: daysAgoIso(28),
    addresses: [
      { id: 'a-8001', label: 'المنزل', fullName: 'منال صالح الغامدي', phone: '0558901234', city: 'الرياض', district: 'حي الياسمين', street: 'شارع أنس بن مالك، مبنى 41', building: '41', isDefault: true },
    ],
    savedCards: [{ id: 'card-8001', brand: 'mada', last4: '6620', expiry: '01/29', holder: 'MANAL GHAMDI', isDefault: true }],
  },
]

/* ------------------------------ الطلبات ------------------------------ */
const productById = (id: string) => catalogProductsWithRelations.find((product) => product.id === id)

function orderItem(productId: string, quantity: number, optionsLabel?: string): OrderItem {
  const product = productById(productId)
  return {
    id: `oi-${productId}-${quantity}`,
    productId,
    name: product?.name ?? 'منتج',
    image: product?.images[0] ?? '',
    price: product?.price ?? 0,
    quantity,
    optionsLabel,
  }
}

interface OrderSeed {
  id: string
  number: string
  customerId: string
  items: OrderItem[]
  addressId: string
  paymentMethodId: string
  paymentMethodName: string
  paymentStatus: 'paid' | 'pending' | 'refunded'
  shippingMethod: string
  couponCode?: string
  status: Order['status']
  daysAgo: number
  trackNumber?: string
  shippingCompany?: string
  note?: string
  internalNote?: string
  cancelReason?: string
}

const orderSeeds: OrderSeed[] = [
  {
    id: 'o-1001', number: 'SQ-100241', customerId: 'u-1001',
    items: [orderItem('p-galaxy-s24-ultra', 1, 'اللون: أسود تيتانيوم | السعة التخزينية: 256GB'), orderItem('p-anker-charger-65w', 1)],
    addressId: 'a-1001', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'paid',
    shippingMethod: 'توصيل سريع (24 ساعة)', status: 'delivered', daysAgo: 26, trackNumber: 'ARS-4492013', shippingCompany: 'أرامكس',
  },
  {
    id: 'o-1002', number: 'SQ-100242', customerId: 'u-1002',
    items: [orderItem('p-jbl-tune-770nc', 1, 'اللون: أسود'), orderItem('p-airpods-pro-2', 1)],
    addressId: 'a-2001', paymentMethodId: 'pm-cod', paymentMethodName: 'الدفع عند الاستلام', paymentStatus: 'pending',
    shippingMethod: 'توصيل عادي', status: 'shipping', daysAgo: 4, trackNumber: 'SMSA-7781200', shippingCompany: 'سمسا',
  },
  {
    id: 'o-1003', number: 'SQ-100243', customerId: 'u-1003',
    items: [orderItem('p-samsung-qled-55', 1, 'حجم الشاشة: 55 بوصة')],
    addressId: 'a-3001', paymentMethodId: 'pm-bank', paymentMethodName: 'تحويل بنكي', paymentStatus: 'paid',
    shippingMethod: 'توصيل عادي', couponCode: 'SAWQLI10', status: 'processing', daysAgo: 1,
    note: 'يرجى الاتصال قبل التوصيل بساعة.',
  },
  {
    id: 'o-1004', number: 'SQ-100244', customerId: 'u-1004',
    items: [orderItem('p-macbook-pro-14', 1, 'السعة التخزينية: 512GB')],
    addressId: 'a-4001', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'paid',
    shippingMethod: 'توصيل سريع (24 ساعة)', status: 'delivered', daysAgo: 33, trackNumber: 'ARS-4477881', shippingCompany: 'أرامكس',
    internalNote: 'تم التوصيل بخطاب المستلم. جهاز يُغلّف بالفقاعات فقط.',
  },
  {
    id: 'o-1005', number: 'SQ-100245', customerId: 'u-1005',
    items: [orderItem('p-asus-rog-strix', 1, 'اللون: رمادي'), orderItem('p-logitech-g-pro-x', 1)],
    addressId: 'a-5001', paymentMethodId: 'pm-cod', paymentMethodName: 'الدفع عند الاستلام', paymentStatus: 'pending',
    shippingMethod: 'توصيل عادي', status: 'processing', daysAgo: 2,
  },
  {
    id: 'o-1006', number: 'SQ-100246', customerId: 'u-1006',
    items: [orderItem('p-apple-watch-s9', 1, 'المقاس: 45mm'), orderItem('p-anker-charger-base', 1)],
    addressId: 'a-6001', paymentMethodId: 'pm-wallet', paymentMethodName: 'محفظة إلكترونية', paymentStatus: 'paid',
    shippingMethod: 'توصيل عادي', couponCode: 'WELCOME50', status: 'delivered', daysAgo: 12, trackNumber: 'SMSA-7700123', shippingCompany: 'سمسا',
  },
  {
    id: 'o-1007', number: 'SQ-100247', customerId: 'u-1007',
    items: [orderItem('p-bosch-washer-9kg', 1, 'سعة الغسيل: 9 كجم')],
    addressId: 'a-7001', paymentMethodId: 'pm-cod', paymentMethodName: 'الدفع عند الاستلام', paymentStatus: 'pending',
    shippingMethod: 'توصيل عادي', status: 'shipping', daysAgo: 3, trackNumber: 'NAR-9921004', shippingCompany: 'ناقل',
    note: 'المبنى بدون مصعد.',
  },
  {
    id: 'o-1008', number: 'SQ-100248', customerId: 'u-1008',
    items: [orderItem('p-redmi-note-13', 1, 'اللون: بنفسجي'), orderItem('p-anker-charger-65w', 1)],
    addressId: 'a-8001', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'paid',
    shippingMethod: 'توصيل سريع (24 ساعة)', status: 'delivered', daysAgo: 20, trackNumber: 'ARS-4499002', shippingCompany: 'أرامكس',
  },
  {
    id: 'o-1009', number: 'SQ-100249', customerId: 'u-1002',
    items: [orderItem('p-dyson-v15', 1)],
    addressId: 'a-2001', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'refunded',
    shippingMethod: 'توصيل عادي', status: 'cancelled', daysAgo: 18, cancelReason: 'تغيير الرأي',
  },
  {
    id: 'o-1010', number: 'SQ-100250', customerId: 'u-1003',
    items: [orderItem('p-hp-laser-m429', 1), orderItem('p-hp-laser-107a', 1)],
    addressId: 'a-3001', paymentMethodId: 'pm-bank', paymentMethodName: 'تحويل بنكي', paymentStatus: 'paid',
    shippingMethod: 'توصيل عادي', status: 'delivered', daysAgo: 45, trackNumber: 'SMSA-7655001', shippingCompany: 'سمسا',
  },
  {
    id: 'o-1011', number: 'SQ-100251', customerId: 'u-1001',
    items: [orderItem('p-jbl-charge-5', 1), orderItem('p-anker-liberty-4nc', 1)],
    addressId: 'a-1002', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'paid',
    shippingMethod: 'استلام من الفرع', status: 'delivered', daysAgo: 38, note: 'استلم من فرع العليا.',
  },
  {
    id: 'o-1012', number: 'SQ-100252', customerId: 'u-1004',
    items: [orderItem('p-ps5-slim', 1), orderItem('p-xbox-controller', 1, 'اللون: أبيض')],
    addressId: 'a-4001', paymentMethodId: 'pm-cod', paymentMethodName: 'الدفع عند الاستلام', paymentStatus: 'pending',
    shippingMethod: 'توصيل عادي', status: 'processing', daysAgo: 1, internalNote: 'العميل يفضّل التوصيل بعد العصر.',
  },
  {
    id: 'o-1013', number: 'SQ-100253', customerId: 'u-1006',
    items: [orderItem('p-ipad-air-11', 1, 'اللون: أزرق')],
    addressId: 'a-6001', paymentMethodId: 'pm-card', paymentMethodName: 'بطاقة ائتمان أو مدى', paymentStatus: 'paid',
    shippingMethod: 'توصيل سريع (24 ساعة)', status: 'shipping', daysAgo: 2, trackNumber: 'ARS-4501120', shippingCompany: 'أرامكس',
  },
  {
    id: 'o-1014', number: 'SQ-100254', customerId: 'u-1005',
    items: [orderItem('p-canon-r50', 1, 'السعة التخزينية: 128GB')],
    addressId: 'a-5001', paymentMethodId: 'pm-wallet', paymentMethodName: 'محفظة إلكترونية', paymentStatus: 'paid',
    shippingMethod: 'توصيل عادي', couponCode: 'TECH300', status: 'delivered', daysAgo: 52, trackNumber: 'SMSA-7699881', shippingCompany: 'سمسا',
  },
]

function buildOrder(seed: OrderSeed, customers: Customer[]): Order {
  const customer = customers.find((c) => c.id === seed.customerId)
  const address = customer?.addresses.find((a) => a.id === seed.addressId) ?? customer?.addresses[0]
  const subtotal = seed.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = seed.couponCode === 'SAWQLI10' ? Math.round(subtotal * 0.1) : seed.couponCode === 'WELCOME50' ? 50 : seed.couponCode === 'TECH300' ? 300 : 0
  const shipping = subtotal - discount >= 500 ? 0 : seed.shippingMethod.includes('سريع') ? 25 : seed.shippingMethod.includes('الفرع') ? 0 : 15
  const codFee = seed.paymentMethodId === 'pm-cod' ? 15 : 0
  const tax = Math.round((Math.max(0, subtotal - discount) * 15) / 100)
  const total = Math.max(0, subtotal - discount + shipping + codFee + tax)
  const createdAt = daysAgoIso(seed.daysAgo)
  const reached = seed.status === 'processing' ? 2 : seed.status === 'shipping' ? 4 : 5
  const steps = [
    { key: 'received', label: 'تم استلام الطلب' },
    { key: 'preparing', label: 'قيد التجهيز' },
    { key: 'shipped', label: 'تم الشحن' },
    { key: 'out', label: 'خرج للتوصيل' },
    { key: 'delivered', label: 'تم التوصيل' },
  ]
  return {
    id: seed.id,
    number: seed.number,
    customerId: seed.customerId,
    customerName: customer?.name ?? 'عميل',
    customerEmail: customer?.email ?? '',
    customerPhone: customer?.phone ?? '',
    items: seed.items,
    address: address ?? {
      id: 'a-default', label: 'المنزل', fullName: customer?.name ?? 'عميل', phone: customer?.phone ?? '',
      city: 'الرياض', district: 'حي الملقا', street: 'شارع رئيسي', isDefault: true,
    },
    paymentMethodId: seed.paymentMethodId,
    paymentMethodName: seed.paymentMethodName,
    paymentStatus: seed.paymentStatus,
    shippingMethod: seed.shippingMethod,
    subtotal,
    discount,
    couponCode: seed.couponCode,
    shipping,
    codFee,
    tax,
    total,
    status: seed.status,
    trackNumber: seed.trackNumber,
    shippingCompany: seed.shippingCompany,
    expectedDelivery: daysAgoIso(seed.daysAgo - 3),
    note: seed.note,
    internalNote: seed.internalNote,
    cancelReason: seed.cancelReason,
    createdAt,
    timeline: steps.map((step, index) => ({
      ...step,
      done: seed.status !== 'cancelled' && index < reached,
      at:
        seed.status !== 'cancelled' && index < reached
          ? new Date(new Date(createdAt).getTime() + index * 26 * 3600000).toISOString()
          : undefined,
    })),
  }
}

export const seedOrders: Order[] = orderSeeds.map((seed) => buildOrder(seed, seedCustomers))

/* ------------------------------ الكوبونات ------------------------------ */
export const seedCoupons: Coupon[] = [
  { id: 'cp-1', code: 'SAWQLI10', type: 'percent', value: 10, minOrder: 200, maxDiscount: 150, usageLimit: 500, perCustomerLimit: 2, usedCount: 86, startDate: daysAgoIso(20), endDate: daysAgoIso(-45), active: true, audience: 'all' },
  { id: 'cp-2', code: 'WELCOME50', type: 'fixed', value: 50, minOrder: 300, usageLimit: 1000, usedCount: 214, startDate: daysAgoIso(90), endDate: daysAgoIso(-120), active: true, audience: 'new' },
  { id: 'cp-3', code: 'TECH300', type: 'fixed', value: 300, minOrder: 1500, usageLimit: 200, usedCount: 31, startDate: daysAgoIso(10), endDate: daysAgoIso(-20), active: true, audience: 'all' },
  { id: 'cp-4', code: 'SHIPFREE', type: 'fixed', value: 25, minOrder: 100, usageLimit: 800, usedCount: 402, startDate: daysAgoIso(35), endDate: daysAgoIso(-30), active: true, audience: 'all' },
  { id: 'cp-5', code: 'SAWA2025', type: 'percent', value: 20, minOrder: 500, usageLimit: 300, usedCount: 300, startDate: daysAgoIso(300), endDate: daysAgoIso(240), active: false, audience: 'all' },
]

/* ------------------------------ البانرات ------------------------------ */
export const seedBanners: Banner[] = [
  { id: 'b-1', title: 'خصومات حتى 30% على الجوالات', subtitle: 'أحدث الإصدارات من سامسونج وآيفون', image: '', theme: 'violet', target: { type: 'category', value: 'c-phones' }, order: 1, active: true },
  { id: 'b-2', title: 'عروض اليوم على الأجهزة المنزلية', subtitle: 'غسالات ومكيفات بأسعار منافسة', image: '', theme: 'ocean', target: { type: 'offer' }, order: 2, active: true },
  { id: 'b-3', title: 'جالاكسي S24 ألترا وصل حديثًا', subtitle: 'كاميرا 200 ميجابكسل وقلم S Pen', image: '', theme: 'night', target: { type: 'product', value: 'p-galaxy-s24-ultra' }, order: 3, active: true },
  { id: 'b-4', title: 'شحن مجاني للطلبات فوق 500 ر.س', subtitle: 'توصيل خلال 24 ساعة داخل المدن الرئيسية', image: '', theme: 'forest', target: { type: 'none' }, order: 4, active: true },
  { id: 'b-5', title: 'عالم الألعاب في مكان واحد', subtitle: 'بلايستيشن 5 وسويتش وأدوات تحكم', image: '', theme: 'sunset', target: { type: 'category', value: 'c-gaming' }, order: 5, active: true },
]

/* ------------------------------ الإشعارات ------------------------------ */
export const seedNotifications: AppNotification[] = [
  { id: 'n-1', type: 'order', title: 'طلب جديد #SQ-100253', body: 'استقبلنا طلبًا جديدًا بقيمة 4,281 ر.س من العميل تركي الحربي.', createdAt: daysAgoIso(0), read: false, forAdmin: true, target: '/admin/orders' },
  { id: 'n-2', type: 'info', title: 'تقييم جديد', body: 'أضافت سارة الدوسري تقييمًا بمعدل 5 نجوم على سماعة JBL.', createdAt: daysAgoIso(1), read: false, forAdmin: true, target: '/admin/reviews' },
  { id: 'n-3', type: 'reminder', title: 'مخزون منخفض', body: 'كمية ثلاجة LG سايد باي سايد وصلت 8 قطع. يرجى إعادة التزويد.', createdAt: daysAgoIso(2), read: false, forAdmin: true, target: '/admin/products' },
  { id: 'n-4', type: 'offer', title: 'عرض خاص هذا الأسبوع', body: 'خصم 10% على كل الطلبات باستخدام الكود SAWQLI10.', createdAt: daysAgoIso(2), read: false, target: '/offers' },
  { id: 'n-5', type: 'info', title: 'تم استلام طلبك', body: 'تم استلام طلبك #SQ-100241 وجارٍ تجهيزه.', createdAt: daysAgoIso(3), read: true, target: '/orders' },
  { id: 'n-6', type: 'offer', title: 'وصل حديثًا: آيباد إير 11', body: 'أحدث جهاز لوحي من آبل متوفر الآن في سوقلي.', createdAt: daysAgoIso(4), read: false, target: '/product/p-ipad-air-11' },
  { id: 'n-7', type: 'info', title: 'تم شحن طلبك', body: 'طلبك #SQ-100250 في الطريق إليك عبر شركة سمسا.', createdAt: daysAgoIso(5), read: true, target: '/orders' },
  { id: 'n-8', type: 'reminder', title: 'رأس season جديدة', body: 'تشكيلة الخريف وصلت: تلفزيونات QLED وأجهزة تنظيف جديدة.', createdAt: daysAgoIso(6), read: true, target: '/search' },
]

/* ------------------------------ الصفحات ------------------------------ */
export const seedPages: StaticPage[] = [
  { id: 'pg-about', slug: 'about', title: 'عن التطبيق', active: true, content: 'سوقلي هو متجرك الإلكتروني الموثوق للأجهزة الإلكترونية والكهربائية في المملكة العربية السعودية.\n\nنوفّر تشكيلة واسعة من الجوالات واللابتوبات والأجهزة المنزلية والتلفزيونات والسماعات، مع ضمان الأصالة وخدمة توصيل سريعة لجميع المناطق.\n\n• أكثر من 50 منتج أصلي بضمان رسمي\n• توصيل خلال 24 ساعة داخل المدن الرئيسية\n• إمكانية الدفع عند الاستلام أو بالبطاقة أو التحويل البنكي\n• خدمة عملاء من الأحد إلى الخميس، 9 صباحًا حتى 6 مساءً\n\nرؤيتنا: أن نكون الوجهة الأولى للتسوق الإلكتروني الموثوق، وأن نجعل تجربة الشراء بسيطة وممتعة لعملائنا.' },
  { id: 'pg-terms', slug: 'terms', title: 'الشروط والأحكام', active: true, content: 'مرحبًا بك في سوقلي. باستخدامك للتطبيق فإنك توافق على الشروط التالية:\n\n1. جميع الأسعار معروضة بالريال السعودي وتشمل ضريبة القيمة المضافة.\n2. يتم تأكيد الطلب بعد نجاح عملية الدفع أو تأكيد الدفع عند الاستلام.\n3. يحق للمتجر إلغاء الطلب في حال عدم توفّر المنتج، مع إعادة المبلغ كاملًا.\n4. الأسعار والعروض قابلة للتغيير دون إشعار مسبق.\n5. يُمنع استخدام التطبيق لأي أغراض غير قانونية أو مخالفة للأنظمة.\n6. يحق للعميل طلب الاسترجاع خلال 7 أيام من الاستلام وفق سياسة الاسترجاع.\n7. البيانات الشخصية تُحفظ بشكل آمن ولا تُشارك مع أي طرف ثالث خارج نطاق تنفيذ الطلب.' },
  { id: 'pg-privacy', slug: 'privacy', title: 'سياسة الخصوصية', active: true, content: 'نحن في سوقلي نحترم خصوصيتك ونحمي بياناتك.\n\n• نجمع البيانات اللازمة فقط لإتمام الطلب: الاسم، رقم الجوال، البريد الإلكتروني، وعنوان التوصيل.\n• لا نشارك بياناتك مع أي طرف ثالث خارج نطاق تنفيذ الطلب.\n• يتم تشفير بيانات الدفع ولا نحتفظ بأرقام البطاقات كاملة.\n• يمكنك طلب حذف حسابك وبياناتك في أي وقت من خلال صفحة تعديل الملف الشخصي.\n• ملفات تعريف الارتباط تُستخدم لتحسين تجربة التصفح وقياس أداء المتجر.\n\nآخر تحديث: يناير 2026' },
  { id: 'pg-returns', slug: 'returns', title: 'سياسة الاسترجاع', active: true, content: 'نضمن لك تجربة شراء مريحة:\n\n• يمكن استرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية مع التغليف والملحقات.\n• لا يشمل الاسترجاع المنتجات التي تم استخدامها أو تعرّضت للتلف.\n• يتم تنفيذ الاسترجاع عبر خدمة العملاء من خلال صفحة "تواصل معنا".\n• تُعاد المبالغ إلى نفس وسيلة الدفع خلال 7 إلى 14 يوم عمل.\n• منتجات العروض والتخفيضات 最终 تُستثنى من الاسترجاع بعد مرور 3 أيام.' },
  { id: 'pg-contact', slug: 'contact', title: 'تواصل معنا', active: true, content: 'يسعدنا خدمتك في أي وقت:\n\n• الجوال: 0551234567\n• البريد الإلكتروني: support@sawqli.sa\n• واتساب: 0551234567\n• العنوان: الرياض — حي العليا — طريق الملك فهد\n\nأوقات العمل: من الأحد إلى الخميس، 9 صباحًا حتى 6 مساءً.\n\nنسعى للرد على جميع الاستفسارات خلال 24 ساعة كحد أقصى.' },
  { id: 'pg-faq', slug: 'faq', title: 'الأسئلة الشائعة', active: true, content: 'كم يستغرق التوصيل؟\nمن 1 إلى 3 أيام عمل داخل المدن الرئيسية، ومن 3 إلى 5 أيام لبقية المناطق.\n\nهل يمكنني الدفع عند الاستلام؟\nنعم، الدفع عند الاستلام متاح مع رسوم إضافية بسيطة.\n\nهل المنتجات أصلية؟\nجميع منتجاتنا أصلية ومضمونة ومستوردة عبر موزّعين معتمدين.\n\nهل يمكنني إرجاع المنتج؟\nنعم، خلال 7 أيام من الاستلام وبشرط أن يكون بحالته الأصلية.\n\nكيف أستخدم كود الخصم؟\nأدخل الكود في حقل "كود الخصم" داخل صفحة السلة ثم اضغط تطبيق.' },
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
    { id: 'sec-gaming', kind: 'custom', title: 'عالم الألعاب', layout: 'row', enabled: true, order: 8, limit: 6, filter: { categoryIds: ['c-gaming'] } },
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

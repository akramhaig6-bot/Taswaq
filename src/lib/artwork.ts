/* ==========================================================================
   مولّد الصور (SVG) — يعمل بدون إنترنت ولا يحتاج خادم صور
   كل الصور تُبنى كـ Data URI حتى يعمل الموقع بالكامل دون أي طلب خارجي
   ========================================================================== */

export type GlyphKind =
  | 'phone'
  | 'laptop'
  | 'tv'
  | 'headphones'
  | 'camera'
  | 'gamepad'
  | 'printer'
  | 'washer'
  | 'fridge'
  | 'microwave'
  | 'kettle'
  | 'vacuum'
  | 'speaker'
  | 'watch'
  | 'tablet'
  | 'monitor'
  | 'mouse'
  | 'keyboard'
  | 'router'
  | 'stove'
  | 'blender'
  | 'drone'
  | 'ac'
  | 'car'
  | 'shirt'
  | 'tools'
  | 'book'
  | 'beauty'
  | 'sports'
  | 'pet'
  | 'box'
  /* أقسام السوق الشامل */
  | 'baby'
  | 'shoe'
  | 'jewelry'
  | 'wearable'
  | 'chip'
  | 'sofa'
  | 'decor'
  | 'cookware'
  | 'garden'
  | 'cleaning'
  | 'makeup'
  | 'hygiene'
  | 'perfume'
  | 'pill'
  | 'medical'
  | 'toy'
  | 'blocks'
  | 'dice'
  | 'tent'
  | 'bike'
  | 'construction'
  | 'bulb'
  | 'security'
  | 'motorcycle'
  | 'pen'
  | 'briefcase'
  | 'palette'
  | 'gift'
  | 'antique'
  | 'card'
  | 'flask'
  | 'factory'
  | 'carton'
  | 'recycle'

const GLYPHS: Record<GlyphKind, string> = {
  phone:
    '<rect x="7" y="2" width="10" height="20" rx="2.6" fill="#fff" opacity=".95"/><rect x="8.6" y="4.2" width="6.8" height="13.6" rx="1" fill="#0f172a" opacity=".24"/><circle cx="12" cy="19.7" r=".9" fill="#0f172a" opacity=".3"/>',
  laptop:
    '<rect x="4" y="5" width="16" height="10.5" rx="1.6" fill="#fff" opacity=".95"/><rect x="5.8" y="6.8" width="12.4" height="6.9" rx=".8" fill="#0f172a" opacity=".22"/><rect x="2" y="16.4" width="20" height="2.2" rx="1.1" fill="#fff" opacity=".8"/>',
  tv: '<rect x="2" y="3.5" width="20" height="13" rx="1.8" fill="#fff" opacity=".95"/><rect x="3.8" y="5.3" width="16.4" height="9.4" rx=".8" fill="#0f172a" opacity=".22"/><rect x="10.5" y="17.5" width="3" height="3" fill="#fff" opacity=".8"/><rect x="7" y="20.2" width="10" height="1.5" rx=".75" fill="#fff" opacity=".8"/>',
  headphones:
    '<path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95"/><rect x="2" y="13.5" width="4.6" height="7" rx="2.3" fill="#fff" opacity=".95"/><rect x="17.4" y="13.5" width="4.6" height="7" rx="2.3" fill="#fff" opacity=".95"/>',
  camera:
    '<rect x="2.5" y="6.5" width="19" height="14" rx="2.4" fill="#fff" opacity=".95"/><circle cx="12" cy="13.5" r="4.4" fill="#0f172a" opacity=".28"/><circle cx="12" cy="13.5" r="2.1" fill="#fff" opacity=".9"/><rect x="8.5" y="3.2" width="5.5" height="3.2" rx="1.2" fill="#fff" opacity=".8"/>',
  gamepad:
    '<rect x="2" y="7.5" width="20" height="10" rx="5" fill="#fff" opacity=".95"/><circle cx="8.4" cy="12.5" r="2" fill="#0f172a" opacity=".28"/><circle cx="16" cy="11" r="1.5" fill="#0f172a" opacity=".28"/><circle cx="18.4" cy="13.6" r="1.5" fill="#0f172a" opacity=".28"/>',
  printer:
    '<rect x="4" y="9" width="16" height="8" rx="1.8" fill="#fff" opacity=".95"/><rect x="7" y="3.5" width="10" height="5.5" rx="1" fill="#fff" opacity=".75"/><rect x="7.5" y="14" width="9" height="6" rx="1" fill="#fff" opacity=".9"/><circle cx="17.4" cy="11.6" r=".9" fill="#0f172a" opacity=".4"/>',
  washer:
    '<rect x="3.5" y="2" width="17" height="20" rx="2.4" fill="#fff" opacity=".95"/><circle cx="12" cy="14" r="5" fill="#0f172a" opacity=".26"/><circle cx="12" cy="14" r="3" fill="#fff" opacity=".9"/><circle cx="7" cy="5.6" r="1" fill="#0f172a" opacity=".4"/><circle cx="10.4" cy="5.6" r="1" fill="#0f172a" opacity=".4"/>',
  fridge:
    '<rect x="5.5" y="2" width="13" height="20" rx="2.2" fill="#fff" opacity=".95"/><rect x="5.5" y="9.4" width="13" height="1" fill="#0f172a" opacity=".25"/><rect x="15.2" y="4.6" width="1.3" height="3.4" rx=".6" fill="#0f172a" opacity=".35"/><rect x="15.2" y="11.6" width="1.3" height="3.4" rx=".6" fill="#0f172a" opacity=".35"/>',
  microwave:
    '<rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" opacity=".95"/><rect x="3.6" y="6.6" width="12.4" height="10.8" rx="1.2" fill="#0f172a" opacity=".25"/><rect x="17.4" y="7.4" width="3.2" height="1" rx=".5" fill="#0f172a" opacity=".45"/><rect x="17.4" y="9.6" width="3.2" height="1" rx=".5" fill="#0f172a" opacity=".45"/>',
  kettle:
    '<path d="M7 8.5h8a2 2 0 0 1 2 2v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 17.5v-7a2 2 0 0 1 2-2Z" fill="#fff" opacity=".95"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/><path d="M17 12.5h3.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>',
  vacuum:
    '<circle cx="10" cy="14" r="6" fill="#fff" opacity=".95"/><circle cx="10" cy="14" r="2.4" fill="#0f172a" opacity=".28"/><path d="M14.5 10.5 18 4.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".9"/><rect x="16.4" y="2.2" width="5" height="3" rx="1.5" fill="#fff" opacity=".9"/>',
  speaker:
    '<rect x="6" y="2" width="12" height="20" rx="2.6" fill="#fff" opacity=".95"/><circle cx="12" cy="8" r="3" fill="#0f172a" opacity=".26"/><circle cx="12" cy="16.5" r="3.6" fill="#0f172a" opacity=".26"/>',
  watch:
    '<rect x="6.5" y="6" width="11" height="12" rx="3.2" fill="#fff" opacity=".95"/><rect x="8.6" y="7.8" width="6.8" height="8.4" rx="1.4" fill="#0f172a" opacity=".24"/><rect x="9.5" y="2" width="5" height="4.4" rx="1.6" fill="#fff" opacity=".75"/><rect x="9.5" y="17.6" width="5" height="4.4" rx="1.6" fill="#fff" opacity=".75"/>',
  tablet:
    '<rect x="4" y="2.5" width="16" height="19" rx="2.4" fill="#fff" opacity=".95"/><rect x="5.8" y="4.4" width="12.4" height="15.2" rx="1.2" fill="#0f172a" opacity=".22"/>',
  monitor:
    '<rect x="2" y="3.5" width="20" height="12.5" rx="1.8" fill="#fff" opacity=".95"/><rect x="3.8" y="5.3" width="16.4" height="8.9" rx=".8" fill="#0f172a" opacity=".22"/><rect x="10.8" y="16.5" width="2.4" height="3.6" fill="#fff" opacity=".8"/><rect x="7" y="19.8" width="10" height="1.5" rx=".75" fill="#fff" opacity=".8"/>',
  mouse:
    '<rect x="7" y="2.5" width="10" height="19" rx="5" fill="#fff" opacity=".95"/><rect x="11.3" y="5" width="1.4" height="4.5" rx=".7" fill="#0f172a" opacity=".35"/>',
  keyboard:
    '<rect x="2" y="7" width="20" height="10" rx="2" fill="#fff" opacity=".95"/><rect x="4" y="9" width="3" height="2" rx=".5" fill="#0f172a" opacity=".3"/><rect x="8" y="9" width="3" height="2" rx=".5" fill="#0f172a" opacity=".3"/><rect x="12" y="9" width="3" height="2" rx=".5" fill="#0f172a" opacity=".3"/><rect x="16" y="9" width="3" height="2" rx=".5" fill="#0f172a" opacity=".3"/><rect x="6" y="12.6" width="12" height="2.2" rx=".6" fill="#0f172a" opacity=".3"/>',
  router:
    '<rect x="3" y="12" width="18" height="7.5" rx="2" fill="#fff" opacity=".95"/><circle cx="7.4" cy="15.8" r="1" fill="#0f172a" opacity=".4"/><circle cx="11" cy="15.8" r="1" fill="#0f172a" opacity=".4"/><path d="M8 9.5 12 4l4 5.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/>',
  stove:
    '<rect x="3" y="3" width="18" height="18" rx="2.4" fill="#fff" opacity=".95"/><circle cx="8" cy="8.5" r="2.3" fill="#0f172a" opacity=".26"/><circle cx="16" cy="8.5" r="2.3" fill="#0f172a" opacity=".26"/><rect x="6" y="14" width="12" height="5.5" rx="1.2" fill="#0f172a" opacity=".22"/>',
  blender:
    '<path d="M8 2h8l-1.2 10H9.2L8 2Z" fill="#fff" opacity=".95"/><rect x="7" y="13" width="10" height="8.5" rx="2" fill="#fff" opacity=".8"/>',
  drone:
    '<circle cx="6" cy="6" r="3.4" fill="#fff" opacity=".8"/><circle cx="18" cy="6" r="3.4" fill="#fff" opacity=".8"/><circle cx="6" cy="18" r="3.4" fill="#fff" opacity=".8"/><circle cx="18" cy="18" r="3.4" fill="#fff" opacity=".8"/><rect x="9" y="9" width="6" height="6" rx="1.6" fill="#fff" opacity=".95"/>',
  ac: '<rect x="2" y="4" width="20" height="8" rx="2" fill="#fff" opacity=".95"/><rect x="4" y="6" width="16" height="4" rx="1" fill="#0f172a" opacity=".22"/><path d="M6 15c0 1.6 1.5 1.6 1.5 3.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/><path d="M11.5 15c0 1.6 1.5 1.6 1.5 3.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/><path d="M17 15c0 1.6 1.5 1.6 1.5 3.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".8"/>',
  car: '<path d="M4 14.5 6.4 8a2 2 0 0 1 1.9-1.3h7.4A2 2 0 0 1 17.6 8l2.4 6.5v4H4v-4Z" fill="#fff" opacity=".95"/><path d="M6.4 11h11.2l-1.2-3H7.6l-1.2 3Z" fill="#0f172a" opacity=".24"/><circle cx="7.2" cy="17" r="1.4" fill="#0f172a" opacity=".45"/><circle cx="16.8" cy="17" r="1.4" fill="#0f172a" opacity=".45"/>',
  shirt: '<path d="m8 3 4 2 4-2 5 4-3 4-2-1v12H8V10l-2 1-3-4 5-4Z" fill="#fff" opacity=".95"/><path d="M9 4.2 12 6l3-1.8" fill="none" stroke="#0f172a" stroke-width="1" opacity=".25"/>',
  tools: '<path d="M14.5 4.2a5.2 5.2 0 0 0-6.8 6.7L3.4 15.2a2.1 2.1 0 0 0 3 3l4.3-4.3a5.2 5.2 0 0 0 6.7-6.8l-3 3-3.1-3.1 3.2-2.8Z" fill="#fff" opacity=".95"/>',
  book: '<path d="M3 5.5c3.5-1.2 6.5-.5 9 1.2v13c-2.5-1.7-5.5-2.4-9-1.2v-13Zm18 0c-3.5-1.2-6.5-.5-9 1.2v13c2.5-1.7 5.5-2.4 9-1.2v-13Z" fill="#fff" opacity=".95"/>',
  beauty: '<path d="M9 3h6v4H9zM8 7h8l2 3v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V10l2-3Z" fill="#fff" opacity=".95"/><path d="M8 12h8" stroke="#0f172a" stroke-width="1.4" opacity=".3"/>',
  sports: '<circle cx="12" cy="12" r="9" fill="#fff" opacity=".95"/><path d="m8.5 3.7 2 4.2 4.8 1.5 3.2-2.3M3.3 9.2l4.6-1.3 3 4.1-1.1 5-3.8 2.1M20.7 10l-4.5.5-2.4 4.1 1.4 5" fill="none" stroke="#0f172a" stroke-width="1.2" opacity=".26"/>',
  pet: '<circle cx="6.5" cy="7" r="2.3" fill="#fff" opacity=".95"/><circle cx="12" cy="5.5" r="2.3" fill="#fff" opacity=".95"/><circle cx="17.5" cy="7" r="2.3" fill="#fff" opacity=".95"/><circle cx="4.5" cy="12" r="2" fill="#fff" opacity=".95"/><path d="M12 10c-3.2 0-6.5 4.1-6.5 7 0 2.2 1.8 3.2 3.5 2.5 1.8-.7 4.2-.7 6 0 1.7.7 3.5-.3 3.5-2.5 0-2.9-3.3-7-6.5-7Z" fill="#fff" opacity=".95"/>',
  box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" fill="#fff" opacity=".95"/><path d="m3.5 7.2 8.5 4 8.5-4M12 11.2V21" fill="none" stroke="#0f172a" stroke-width="1.2" opacity=".28"/>',
  /* ---- أقسام السوق الشامل ---- */
  baby:
    '<path d="M9 3h6a3 3 0 0 1 3 3v2.2a2 2 0 0 1-1 1.7V13a2 2 0 0 1-2 2h-1v6h-4v-6H9a2 2 0 0 1-2-2v-3.1a2 2 0 0 1-1-1.7V6a3 3 0 0 1 3-3Z" fill="#fff" opacity=".95"/><circle cx="12" cy="7.4" r="1.7" fill="#0f172a" opacity=".28"/>',
  shoe:
    '<path d="M3 15.5h13A3.5 3.5 0 0 0 19.5 12v-1.5L16 11.5 13.5 8h-3L8.5 11H3v4.5Z" fill="#fff" opacity=".95"/><rect x="3" y="15.5" width="18" height="3" rx="1.5" fill="#fff" opacity=".8"/><path d="m13 9 2.5 3" fill="none" stroke="#0f172a" stroke-width="1.2" opacity=".28"/>',
  jewelry:
    '<path d="M7 4h10l4 5-9 11L3 9l4-5Z" fill="#fff" opacity=".95"/><path d="m3 9 4-5M21 9l-4-5M12 20 7 9M12 20l5-11M7 9h10" fill="none" stroke="#0f172a" stroke-width="1.1" opacity=".3"/>',
  wearable:
    '<rect x="6.5" y="4.5" width="11" height="15" rx="3.6" fill="#fff" opacity=".95"/><rect x="8.6" y="6.6" width="6.8" height="10.8" rx="1.6" fill="#0f172a" opacity=".24"/><path d="M9.4 4.5V2.4h5.2v2.1M9.4 19.5v2.1h5.2v-2.1" fill="#fff" opacity=".8"/>',
  chip:
    '<rect x="6" y="6" width="12" height="12" rx="2" fill="#fff" opacity=".95"/><rect x="9" y="9" width="6" height="6" rx="1" fill="#0f172a" opacity=".26"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>',
  sofa:
    '<path d="M4.5 11.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2V18H4.5v-6.5Z" fill="#fff" opacity=".95"/><path d="M6.5 9.5V7.8A2.8 2.8 0 0 1 9.3 5h5.4a2.8 2.8 0 0 1 2.8 2.8v1.7" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><rect x="2.6" y="12" width="2.6" height="6" rx="1.3" fill="#fff" opacity=".85"/><rect x="18.8" y="12" width="2.6" height="6" rx="1.3" fill="#fff" opacity=".85"/>',
  decor:
    '<rect x="3" y="3" width="18" height="15" rx="2" fill="#fff" opacity=".95"/><rect x="5.4" y="5.4" width="13.2" height="10.2" rx="1" fill="#0f172a" opacity=".22"/><path d="m6 14 3.5-3.5 3 3 3-4 4.5 4.5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".9"/><path d="M8 21h8M12 18v3" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>',
  cookware:
    '<path d="M3.5 9.5h13v4a6.5 6.5 0 0 1-13 0v-4Z" fill="#fff" opacity=".95"/><path d="M16.8 11h3.4" stroke="#fff" stroke-width="1.9" stroke-linecap="round" opacity=".85"/><rect x="8.4" y="6" width="3.2" height="3.5" rx="1.2" fill="#fff" opacity=".75"/>',
  garden:
    '<path d="M12 13.5V4.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"/><path d="M12 8.6C9.5 8.6 7.5 6.8 7.5 4.6c2.5 0 4.5 1.8 4.5 4Z" fill="#fff" opacity=".9"/><path d="M12 10c2.4 0 4.4-1.8 4.4-4-2.4 0-4.4 1.8-4.4 4Z" fill="#fff" opacity=".8"/><path d="M7 13.5h10l-1.2 7.5H8.2L7 13.5Z" fill="#fff" opacity=".95"/>',
  cleaning:
    '<rect x="8" y="9.5" width="8" height="11.5" rx="2" fill="#fff" opacity=".95"/><path d="M9.6 9.5V6.8h4.8v2.7" fill="#fff" opacity=".8"/><rect x="9.4" y="3.4" width="5.2" height="3.4" rx="1.4" fill="#fff" opacity=".85"/><path d="M16.4 11.8h3.6M16.4 14.2h2.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>',
  makeup:
    '<path d="M9 9.5h6V21H9z" fill="#fff" opacity=".95"/><path d="M9.8 9.5V5.8a2.2 2.2 0 0 1 4.4 0v3.7" fill="#fff" opacity=".85"/><path d="M9 13.5h6" stroke="#0f172a" stroke-width="1.2" opacity=".25"/>',
  hygiene:
    '<rect x="4" y="10" width="13" height="9" rx="2.6" fill="#fff" opacity=".95"/><circle cx="7.6" cy="13.4" r="1.5" fill="#0f172a" opacity=".2"/><circle cx="12" cy="12.6" r="2" fill="#0f172a" opacity=".2"/><circle cx="19" cy="7" r="2.2" fill="#fff" opacity=".7"/><circle cx="15.4" cy="5.4" r="1.3" fill="#fff" opacity=".6"/>',
  perfume:
    '<rect x="8.5" y="10" width="7" height="11" rx="2" fill="#fff" opacity=".95"/><rect x="10.4" y="5" width="3.2" height="5" rx="1" fill="#fff" opacity=".8"/><rect x="9.4" y="2.6" width="5.2" height="2.6" rx="1.2" fill="#fff" opacity=".85"/><rect x="10" y="13" width="4" height="5" rx="1" fill="#0f172a" opacity=".2"/>',
  pill:
    '<g transform="rotate(-40 12 12)"><rect x="3" y="8" width="18" height="8" rx="4" fill="#fff" opacity=".95"/><rect x="3" y="8" width="9" height="8" rx="4" fill="#0f172a" opacity=".14"/><path d="M12 8v8" stroke="#0f172a" stroke-width="1.4" opacity=".28"/></g>',
  medical:
    '<rect x="2.5" y="6.5" width="19" height="13" rx="2.4" fill="#fff" opacity=".95"/><rect x="9.6" y="3.6" width="4.8" height="4" rx="1.6" fill="#fff" opacity=".8"/><path d="M12 10.4v5.8M9.1 13.3h5.8" stroke="#0f172a" stroke-width="2" stroke-linecap="round" opacity=".32"/>',
  toy:
    '<circle cx="7" cy="6.6" r="2.6" fill="#fff" opacity=".95"/><circle cx="17" cy="6.6" r="2.6" fill="#fff" opacity=".95"/><circle cx="12" cy="9.5" r="6.4" fill="#fff" opacity=".95"/><circle cx="9.6" cy="8.6" r="1" fill="#0f172a" opacity=".45"/><circle cx="14.4" cy="8.6" r="1" fill="#0f172a" opacity=".45"/><ellipse cx="12" cy="11.4" rx="2.2" ry="1.8" fill="#0f172a" opacity=".22"/>',
  blocks:
    '<rect x="3" y="13" width="7" height="7" rx="1.6" fill="#fff" opacity=".95"/><rect x="14" y="13" width="7" height="7" rx="1.6" fill="#fff" opacity=".95"/><rect x="8.5" y="4.5" width="7" height="7" rx="1.6" transform="rotate(-8 12 8)" fill="#fff" opacity=".85"/><circle cx="6.5" cy="16.5" r="1.3" fill="#0f172a" opacity=".3"/><circle cx="17.5" cy="16.5" r="1.3" fill="#0f172a" opacity=".3"/>',
  dice:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="3.6" fill="#fff" opacity=".95"/><circle cx="8.4" cy="8.4" r="1.35" fill="#0f172a" opacity=".4"/><circle cx="15.6" cy="8.4" r="1.35" fill="#0f172a" opacity=".4"/><circle cx="12" cy="12" r="1.35" fill="#0f172a" opacity=".4"/><circle cx="8.4" cy="15.6" r="1.35" fill="#0f172a" opacity=".4"/><circle cx="15.6" cy="15.6" r="1.35" fill="#0f172a" opacity=".4"/>',
  tent:
    '<path d="M12 3.5 21.5 20h-19L12 3.5Z" fill="#fff" opacity=".95"/><path d="M12 9.5 16 20H8l4-10.5Z" fill="#0f172a" opacity=".22"/>',
  bike:
    '<circle cx="6" cy="16.5" r="4.2" fill="none" stroke="#fff" stroke-width="1.8" opacity=".95"/><circle cx="18" cy="16.5" r="4.2" fill="none" stroke="#fff" stroke-width="1.8" opacity=".95"/><path d="M6 16.5l4-7h4l3.5 7M10 9.5h5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"/><circle cx="15.5" cy="6.4" r="1.1" fill="#fff" opacity=".9"/>',
  construction:
    '<rect x="2.5" y="5" width="19" height="6" rx="1" fill="#fff" opacity=".95"/><rect x="2.5" y="13" width="19" height="6" rx="1" fill="#fff" opacity=".95"/><path d="M2.5 8h19M9 5v6M16 5v6M5.5 13v6M12.5 13v6M19 13v6" stroke="#0f172a" stroke-width="1.1" opacity=".28"/>',
  bulb:
    '<path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3Z" fill="#fff" opacity=".95"/><path d="M9.6 19.4h4.8M10.2 21.4h3.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>',
  security:
    '<rect x="4.5" y="10" width="15" height="10.5" rx="2.6" fill="#fff" opacity=".95"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="#fff" stroke-width="2.2" opacity=".85"/><circle cx="12" cy="14.4" r="1.5" fill="#0f172a" opacity=".4"/><path d="M12 15.9v2.2" stroke="#0f172a" stroke-width="1.4" opacity=".4"/>',
  motorcycle:
    '<circle cx="5.4" cy="16.2" r="4.1" fill="none" stroke="#fff" stroke-width="1.8" opacity=".95"/><circle cx="18.6" cy="16.2" r="4.1" fill="none" stroke="#fff" stroke-width="1.8" opacity=".95"/><path d="m5.4 16.2 4.4-.6 3.6-6.4h3.4l1.8 7M9.8 9.2h3.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>',
  pen:
    '<path d="M4 20l1-4L16.2 4.8a2 2 0 0 1 2.8 2.8L7.8 18.8 4 20Z" fill="#fff" opacity=".95"/><path d="m15 6.6 2.4 2.4" stroke="#0f172a" stroke-width="1.2" opacity=".3"/>',
  briefcase:
    '<rect x="2.5" y="7" width="19" height="13" rx="2.2" fill="#fff" opacity=".95"/><path d="M9 7V5.2A1.7 1.7 0 0 1 10.7 3.5h2.6A1.7 1.7 0 0 1 15 5.2V7" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><path d="M2.5 12.5h19" stroke="#0f172a" stroke-width="1.2" opacity=".26"/>',
  palette:
    '<path d="M12 3.2c5.2 0 9.4 3.5 9.4 7.8 0 2.4-1.4 3.9-3.4 3.9-1.5 0-2.3-.9-2.3-2.1 0-1.3 1-2 1-2.9 0-1.1-1.1-1.8-2.8-1.8-2.9 0-5.3 2.5-5.3 5.7 0 3.4 2.7 5.7 6.3 5.7.8 0 1.5-.1 2.1-.3-.9.9-2.3 1.4-3.9 1.4-4.6 0-8.3-3.6-8.3-8C4.8 6.7 8 3.2 12 3.2Z" fill="#fff" opacity=".95"/><circle cx="8.4" cy="9.6" r="1.35" fill="#0f172a" opacity=".3"/><circle cx="11.8" cy="7.6" r="1.35" fill="#0f172a" opacity=".3"/><circle cx="15.8" cy="10.2" r="1.35" fill="#0f172a" opacity=".3"/>',
  gift:
    '<rect x="3" y="8.5" width="18" height="12.5" rx="2" fill="#fff" opacity=".95"/><path d="M3 12.5h18M12 8.5V21" stroke="#0f172a" stroke-width="1.3" opacity=".26"/><path d="M12 8.5S10.5 4 8.2 4a2.1 2.1 0 0 0 0 4.5H12Zm0 0s1.5-4.5 3.8-4.5a2.1 2.1 0 0 1 0 4.5H12Z" fill="#fff" opacity=".85"/>',
  antique:
    '<path d="M9 3h6v2.2c0 2 3 3.4 3 7.3 0 3.6-2.5 6.5-6 6.5s-6-2.9-6-6.5c0-3.9 3-5.3 3-7.3V3Z" fill="#fff" opacity=".95"/><path d="M6.6 12.5h10.8" stroke="#0f172a" stroke-width="1.3" opacity=".28"/>',
  card:
    '<rect x="2.5" y="5" width="19" height="14" rx="2.6" fill="#fff" opacity=".95"/><rect x="2.5" y="9" width="19" height="3.4" fill="#0f172a" opacity=".22"/><rect x="5.6" y="14.4" width="5" height="2.2" rx="1.1" fill="#0f172a" opacity=".28"/>',
  flask:
    '<path d="M9.4 3.2h5.2v5.6l4.2 7.9A2.4 2.4 0 0 1 16.9 20H7.1a2.4 2.4 0 0 1-1.9-3.3l4.2-7.9V3.2Z" fill="#fff" opacity=".95"/><path d="M9.4 3.2h5.2" stroke="#0f172a" stroke-width="1.2" opacity=".25"/><path d="M7.1 15.2h9.8" stroke="#0f172a" stroke-width="1.4" opacity=".3"/>',
  factory:
    '<path d="M3.2 21V10.6l5.6 3.2v-3.2l5.6 3.2V8.4h6.4V21H3.2Z" fill="#fff" opacity=".95"/><path d="M14.4 8.4V4.8h6.4v3.6" fill="#fff" opacity=".8"/><rect x="6" y="16.4" width="2.4" height="4.6" fill="#0f172a" opacity=".26"/><rect x="10.8" y="16.4" width="2.4" height="4.6" fill="#0f172a" opacity=".26"/><rect x="16.4" y="16.4" width="2.4" height="4.6" fill="#0f172a" opacity=".26"/>',
  carton:
    '<rect x="3" y="6" width="18" height="14" rx="1.6" fill="#fff" opacity=".95"/><path d="M3 9.4h18M12 6v14" stroke="#0f172a" stroke-width="1.3" opacity=".26"/><rect x="9.4" y="3.4" width="5.2" height="2.6" rx="1" fill="#fff" opacity=".8"/>',
  recycle:
    '<path d="M5.6 9.4A7 7 0 0 1 17.4 6.2l2.2 2.2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95"/><path d="M19.6 4v4.4h-4.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95"/><path d="M18.4 14.6A7 7 0 0 1 6.6 17.8l-2.2-2.2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95"/><path d="M4.4 20v-4.4h4.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".95"/>'
}

const PALETTE: Record<GlyphKind, [string, string]> = {
  phone: ['#6366f1', '#4338ca'],
  laptop: ['#0ea5e9', '#0369a1'],
  tv: ['#8b5cf6', '#6d28d9'],
  headphones: ['#ec4899', '#be185d'],
  camera: ['#f59e0b', '#b45309'],
  gamepad: ['#ef4444', '#b91c1c'],
  printer: ['#64748b', '#334155'],
  washer: ['#14b8a6', '#0f766e'],
  fridge: ['#22c55e', '#15803d'],
  microwave: ['#f97316', '#c2410c'],
  kettle: ['#06b6d4', '#0e7490'],
  vacuum: ['#a855f7', '#7e22ce'],
  speaker: ['#0891b2', '#155e75'],
  watch: ['#3b82f6', '#1d4ed8'],
  tablet: ['#818cf8', '#4f46e5'],
  monitor: ['#0284c7', '#0f172a'],
  mouse: ['#94a3b8', '#1e293b'],
  keyboard: ['#475569', '#0f172a'],
  router: ['#0ea5e9', '#0f172a'],
  stove: ['#71717a', '#3f3f46'],
  blender: ['#f43f5e', '#9f1239'],
  drone: ['#334155', '#0284c7'],
  ac: ['#38bdf8', '#0284c7'],
  car: ['#64748b', '#0f172a'],
  shirt: ['#db2777', '#7c3aed'],
  tools: ['#f97316', '#b45309'],
  book: ['#0ea5e9', '#1d4ed8'],
  beauty: ['#ec4899', '#be185d'],
  sports: ['#16a34a', '#0f766e'],
  pet: ['#f59e0b', '#c2410c'],
  box: ['#92400e', '#d97706'],
  baby: ['#fb7185', '#e11d48'],
  shoe: ['#a855f7', '#6d28d9'],
  jewelry: ['#22d3ee', '#0e7490'],
  wearable: ['#38bdf8', '#1d4ed8'],
  chip: ['#34d399', '#047857'],
  sofa: ['#f59e0b', '#b45309'],
  decor: ['#f472b6', '#be185d'],
  cookware: ['#fb923c', '#c2410c'],
  garden: ['#4ade80', '#15803d'],
  cleaning: ['#60a5fa', '#1d4ed8'],
  makeup: ['#f43f5e', '#9f1239'],
  hygiene: ['#2dd4bf', '#0f766e'],
  perfume: ['#c084fc', '#7e22ce'],
  pill: ['#fbbf24', '#d97706'],
  medical: ['#f87171', '#b91c1c'],
  toy: ['#fbbf24', '#f97316'],
  blocks: ['#818cf8', '#4338ca'],
  dice: ['#94a3b8', '#334155'],
  tent: ['#16a34a', '#0f766e'],
  bike: ['#0ea5e9', '#0369a1'],
  construction: ['#a8a29e', '#57534e'],
  bulb: ['#facc15', '#ca8a04'],
  security: ['#64748b', '#1e293b'],
  motorcycle: ['#ef4444', '#7f1d1d'],
  pen: ['#38bdf8', '#0284c7'],
  briefcase: ['#475569', '#0f172a'],
  palette: ['#fb7185', '#7c3aed'],
  gift: ['#f472b6', '#db2777'],
  antique: ['#d97706', '#78350f'],
  card: ['#22c55e', '#15803d'],
  flask: ['#2dd4bf', '#0e7490'],
  factory: ['#78716c', '#44403c'],
  carton: ['#d97706', '#92400e'],
  recycle: ['#34d399', '#059669'],
}

export const GLYPH_KINDS = Object.keys(GLYPHS) as GlyphKind[]

export function isGlyphKind(value: string): value is GlyphKind {
  return value in GLYPHS
}

function uri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}`
}

/** صورة منتج مربعة بتدرج لوني حسب نوع الجهاز */
export function productImage(kind: GlyphKind = 'phone', seed = 1, variant = 0): string {
  const [c1, c2] = PALETTE[kind] ?? PALETTE.phone
  const shift = ((seed * 37) % 90) - 45
  const glyph = GLYPHS[kind] ?? GLYPHS.phone
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="${310 + shift}" cy="${70 - shift / 2}" r="${88 + (seed % 4) * 6}" fill="#ffffff" opacity=".14"/>
    <circle cx="${64 - shift / 2}" cy="${330 + shift / 3}" r="${116 - (seed % 3) * 8}" fill="#ffffff" opacity=".10"/>
    <circle cx="${200 + shift}" cy="${200 + shift}" r="150" fill="#ffffff" opacity=".04"/>
    <g transform="translate(120 ${120 + variant * 2}) scale(6.6)">${glyph}</g>
  </svg>`
  return uri(svg)
}

/** صورة قسم (دائرية/مربعة) بخلفية ناعمة */
export function categoryImage(kind: GlyphKind = 'phone', color = '#2563eb'): string {
  const glyph = GLYPHS[kind] ?? GLYPHS.phone
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".18"/>
      <stop offset="1" stop-color="${color}" stop-opacity=".34"/>
    </linearGradient></defs>
    <rect width="200" height="200" fill="url(#cg)"/>
    <g transform="translate(58 58) scale(3.5)" style="color:${color}">
      <g transform="scale(1)">${glyph.replace(/#fff/g, color).replace(/#0f172a/g, '#ffffff')}</g>
    </g>
  </svg>`
  return uri(svg)
}

/** شعار علامة تجارية (اسم لاتيني) */
export function brandLogo(name: string, color = '#0f172a'): string {
  const text = name.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160">
    <rect width="240" height="160" fill="#ffffff"/>
    <text x="120" y="94" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="${color}" letter-spacing="1">${text}</text>
  </svg>`
  return uri(svg)
}

export interface BannerTheme {
  id: string
  name: string
  from: string
  to: string
}

export const BANNER_THEMES: BannerTheme[] = [
  { id: 'ocean', name: 'أزرق محيطي', from: '#2563eb', to: '#0ea5e9' },
  { id: 'violet', name: 'بنفسجي', from: '#7c3aed', to: '#c026d3' },
  { id: 'sunset', name: 'غروب', from: '#f97316', to: '#db2777' },
  { id: 'forest', name: 'أخضر', from: '#059669', to: '#14b8a6' },
  { id: 'night', name: 'ليلي', from: '#0f172a', to: '#334155' },
  { id: 'gold', name: 'ذهبي', from: '#d97706', to: '#f59e0b' },
  { id: 'rose', name: 'وردي', from: '#e11d48', to: '#f43f5e' },
  { id: 'indigo', name: 'نيلي', from: '#4f46e5', to: '#2563eb' },
]

export function bannerTheme(id?: string): BannerTheme {
  return BANNER_THEMES.find((t) => t.id === id) ?? BANNER_THEMES[0]
}

/** صورة بانر ترويجي */
export function bannerImage(themeId?: string, seed = 1): string {
  const theme = bannerTheme(themeId)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.from}"/><stop offset="1" stop-color="${theme.to}"/>
    </linearGradient></defs>
    <rect width="800" height="400" fill="url(#bg)"/>
    <circle cx="${640 + (seed % 3) * 20}" cy="90" r="150" fill="#ffffff" opacity=".12"/>
    <circle cx="${90 - (seed % 4) * 10}" cy="330" r="180" fill="#ffffff" opacity=".08"/>
    <circle cx="${420 + (seed % 5) * 25}" cy="${260 - (seed % 3) * 20}" r="60" fill="#ffffff" opacity=".10"/>
    <g opacity=".16" fill="#ffffff">
      <rect x="-40" y="300" width="900" height="16" rx="8" transform="rotate(-8 400 300)"/>
      <rect x="-40" y="340" width="900" height="16" rx="8" transform="rotate(-8 400 340)"/>
    </g>
  </svg>`
  return uri(svg)
}

/** صورة عامة بنسبة 16:9 لأي استخدام إداري */
export function plainImage(color = '#2563eb'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="${color}" opacity=".12"/>
    <circle cx="400" cy="225" r="90" fill="${color}" opacity=".25"/>
  </svg>`
  return uri(svg)
}

export type Locale = "ar" | "fr" | "en";

const ar = {
  brand: "Le Grand Baraka Grill",
  brandAr: "مطعم وشواية البركة الكبرى",
  tagline: "مذاق مغربي أصيل، مشاوي فالفحم، وتوصيل حتى للدار",
  nav: {
    home: "الرئيسية",
    menu: "المنيو",
    cart: "السلة",
    checkout: "إتمام الطلب",
    admin: "الإدارة",
    about: "من نحن",
    contact: "اتصل بنا",
  },
  cta: { viewMenu: "شوف المنيو", orderNow: "اطلب الآن", callUs: "اتصل بنا", addToCart: "أضف للسلة" },
  currency: "MAD",
  home: {
    heroTitle: "مطعم وشواية البركة الكبرى",
    heroSubtitle:
      "أكلات مغربية شعبية، مشاوي على الفحم، وطواجن يومية مع خدمة التوصيل",
    sectionsTitle: "أقسام الأكل",
    featuredTitle: "أطباق مميزة",
    deliveryTitle: "نوصلو لك حتى للدار",
    deliveryEta: "مدة التوصيل التقريبية: 30 إلى 60 دقيقة",
    reviewsTitle: "آراء الزبناء",
    mapTitle: "موقعنا",
  },
  menu: { search: "قلّب على طبق…", all: "الكل" },
  cart: {
    title: "السلة",
    empty: "السلة خاوية، زور المنيو باش تزيد أطباق.",
    subtotal: "المجموع الفرعي",
    delivery: "التوصيل",
    total: "المجموع",
    goCheckout: "كمّل الطلب",
    bandLabel: "منطقة التوصيل (لحساب المصاريف)",
    band0: "حتى 3 كم — 10 دراهم",
    band1: "3 إلى 6 كم — 15 درهم",
    band2: "أكثر من 6 كم — تأكيد بالهاتف (0 درهم هنا)",
    pickupHint: "أخذ من المطعم: ما كاينش مصاريف التوصيل.",
  },
  checkout: {
    title: "إتمام الطلب",
    summaryTitle: "ملخص الطلب",
    customerSectionTitle: "معلومات الزبون",
    orderMethodTitle: "طريقة الطلب",
    orderMethodBody:
      "بعد «تأكيد الطلب» نرسل الطلبية إلى نظام المطعم (جدول Google) ونتوجّهك لصفحة الشكر.",
    flowHint:
      "راجع الملخص، عمر معلوماتك، واضغط «تأكيد الطلب» باش نستلم الطلبية.",
    confirmOrder: "تأكيد الطلب",
    paymentSectionTitle: "طريقة الدفع",
    codCardTitle: "الدفع عند الاستلام COD",
    codCardShort: "أدفع عند توصلك بالطلب",
    onlineCardTitle: "الدفع أونلاين",
    onlineCardShort: "ادفع أونلاين — العنوان مطلوب قبل التأكيد",
    onlineUnavailableShort: "الدفع أونلاين سيكون متاحاً قريباً",
    addressSectionTitle: "عنوان التوصيل (للدفع أونلاين)",
    cod: "الدفع عند الاستلام",
    codHint: "خلص ملي يوصلك الطلب.",
    online: "الدفع أونلاين",
    onlineHint: "ادفع الآن باستعمال PayPal أو بطاقة بنكية حسب الوسيلة المتاحة.",
    submitCod: "تأكيد الطلب",
    submitOnline: "تأكيد الطلب",
    fields: {
      name: "الاسم الكامل",
      phone: "رقم الهاتف",
      whatsapp: "رقم الواتساب",
      city: "المدينة",
      area: "الحي / المنطقة",
      address: "العنوان الكامل",
      fullAddress: "العنوان الكامل (المدينة، الحي، الشارع، رقم المنزل)",
      maps: "رابط Google Maps (اختياري)",
      orderType: "نوع الطلب",
      delivery: "توصيل",
      pickup: "أخذ من المطعم",
      timing: "وقت الطلب",
      now: "الآن",
      later: "تحديد وقت لاحق",
      scheduledAt: "التاريخ والوقت",
      notes: "ملاحظات إضافية",
    },
  },
  success: {
    title: "تم استلام طلبك بنجاح",
    body: "سيتواصل معك فريق المطعم لتأكيد الطلب.",
    eta: "الوقت المتوقع للتوصيل",
  },
  paymentFailed: {
    title: "لم تتم عملية الدفع",
    body: "يمكنك إعادة المحاولة أو اختيار الدفع عند الاستلام.",
  },
  track: { title: "تتبع الطلب" },
} as const;

export type Messages = typeof ar;

type TopPatch = Partial<{
  brand: string;
  brandAr: string;
  tagline: string;
  nav: Partial<Record<keyof typeof ar.nav, string>>;
  cta: Partial<Record<keyof typeof ar.cta, string>>;
}>;

const frPartial: TopPatch = {
  brand: "Le Grand Baraka Grill",
  brandAr: "Le Grand Baraka — Grill",
  tagline: "Saveurs marocaines, grillades au feu de bois, livraison à domicile",
  nav: {
    home: "Accueil",
    menu: "Menu",
    cart: "Panier",
    checkout: "Commande",
    admin: "Admin",
    about: "À propos",
    contact: "Contact",
  },
  cta: { viewMenu: "Voir le menu", orderNow: "Commander", callUs: "Appeler", addToCart: "Ajouter" },
};

const enPartial: TopPatch = {
  brand: "Le Grand Baraka Grill",
  brandAr: "Le Grand Baraka Grill",
  tagline: "Authentic Moroccan flavors, charcoal grills, home delivery",
  nav: {
    home: "Home",
    menu: "Menu",
    cart: "Cart",
    checkout: "Checkout",
    admin: "Admin",
    about: "About",
    contact: "Contact",
  },
  cta: { viewMenu: "View menu", orderNow: "Order now", callUs: "Call us", addToCart: "Add to cart" },
};

function mergeMessages(locale: Locale): Messages {
  if (locale === "ar") return ar;
  const patch = locale === "fr" ? frPartial : enPartial;
  return {
    ...ar,
    ...patch,
    nav: { ...ar.nav, ...patch.nav },
    cta: { ...ar.cta, ...patch.cta },
  } as Messages;
}

export function getDictionary(locale: Locale): Messages {
  return mergeMessages(locale);
}

import type { Locale } from "@/types";

// ─── Class Merger (like clsx) ─────────────────────────────────────────────────

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Price Formatting ─────────────────────────────────────────────────────────

export function formatPrice(price: number, locale: Locale = "ar"): string {
  const formatted = price.toLocaleString(locale === "ar" ? "ar-EG" : "en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const unit = locale === "ar" ? "ج.م" : "EGP";
  return `${formatted} ${unit}`;
}

export function formatPriceNumber(price: number, locale: Locale = "ar"): string {
  return price.toLocaleString(locale === "ar" ? "ar-EG" : "en-EG");
}

// ─── Slug Generation ──────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(
  date: Date | { seconds: number; nanoseconds: number },
  locale: Locale = "ar"
): string {
  const d = "seconds" in date ? new Date(date.seconds * 1000) : date;
  return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Discount Calculation ─────────────────────────────────────────────────────

export function getDiscountPercentage(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}

// ─── Order Status Helpers ─────────────────────────────────────────────────────

export const orderStatusLabels: Record<string, { ar: string; en: string; color: string }> = {
  pending: { ar: "في الانتظار", en: "Pending", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { ar: "مؤكد", en: "Confirmed", color: "text-blue-600 bg-blue-50" },
  processing: { ar: "جاري المعالجة", en: "Processing", color: "text-purple-600 bg-purple-50" },
  shipped: { ar: "تم الشحن", en: "Shipped", color: "text-orange-600 bg-orange-50" },
  delivered: { ar: "تم التسليم", en: "Delivered", color: "text-green-600 bg-green-50" },
  cancelled: { ar: "ملغي", en: "Cancelled", color: "text-red-600 bg-red-50" },
};

export const paymentStatusLabels: Record<string, { ar: string; en: string; color: string }> = {
  pending: { ar: "في الانتظار", en: "Pending", color: "text-yellow-600 bg-yellow-50" },
  uploaded: { ar: "تم رفع الإيصال", en: "Receipt Uploaded", color: "text-blue-600 bg-blue-50" },
  confirmed: { ar: "مؤكد", en: "Confirmed", color: "text-green-600 bg-green-50" },
  rejected: { ar: "مرفوض", en: "Rejected", color: "text-red-600 bg-red-50" },
};

// ─── Shipping Method Labels ───────────────────────────────────────────────────

export const shippingMethodLabels: Record<string, { ar: string; en: string }> = {
  courier: { ar: "شركة شحن", en: "Courier" },
  pickup: { ar: "استلام من المقر", en: "Pickup from Company" },
  microbus: { ar: "ميكروباص (موقف)", en: "Microbus (Station)" },
};

// ─── Egyptian Governorates ────────────────────────────────────────────────────

export const governorates = [
  "القاهرة", "الإسكندرية", "الجيزة", "الشرقية", "الدقهلية",
  "البحيرة", "المنوفية", "القليوبية", "الغربية", "كفر الشيخ",
  "دمياط", "بورسعيد", "الإسماعيلية", "السويس", "شمال سيناء",
  "جنوب سيناء", "الفيوم", "بني سويف", "المنيا", "أسيوط",
  "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر",
  "الوادي الجديد", "مطروح",
];

export interface CityOption {
  ar: string;
  en: string;
}

export interface GovernorateDetail {
  nameAr: string;
  nameEn: string;
  cities: CityOption[];
}

export const EGYPT_GOVERNORATES: Record<string, GovernorateDetail> = {
  cairo: {
    nameAr: "القاهرة",
    nameEn: "Cairo",
    cities: [
      { ar: "مدينة نصر", en: "Nasr City" },
      { ar: "مصر الجديدة", en: "Heliopolis" },
      { ar: "التجمع الخامس", en: "Fifth Settlement" },
      { ar: "المعادي", en: "Maadi" },
      { ar: "شبرا", en: "Shubra" },
      { ar: "حلوان", en: "Helwan" },
      { ar: "وسط البلد", en: "Downtown" },
      { ar: "الزمالك", en: "Zamalek" },
      { ar: "المقطم", en: "Mokattam" },
      { ar: "الشروق", en: "Shorouk" },
      { ar: "مدينتي", en: "Madinaty" },
      { ar: "الرحاب", en: "Rehab" },
      { ar: "بدر", en: "Badr" },
      { ar: "عين شمس", en: "Ain Shams" },
      { ar: "المطرية", en: "Matareya" },
      { ar: "الأميرية", en: "Ameriya" },
      { ar: "الزيتون", en: "Zeitoun" },
      { ar: "حدائق القبة", en: "Hadayek El Kobba" },
      { ar: "العباسية", en: "Abbassia" },
      { ar: "السيدة زينب", en: "Sayeda Zeinab" },
      { ar: "المنيل", en: "Manyal" },
      { ar: "جاردن سيتي", en: "Garden City" },
      { ar: "البساتين", en: "Basatin" },
      { ar: "دار السلام", en: "Dar El Salam" },
      { ar: "التبين", en: "Tebin" },
      { ar: "15 مايو", en: "15th of May" }
    ]
  },
  giza: {
    nameAr: "الجيزة",
    nameEn: "Giza",
    cities: [
      { ar: "6 أكتوبر", en: "6th of October" },
      { ar: "الشيخ زايد", en: "Sheikh Zayed" },
      { ar: "المهندسين", en: "Mohandessin" },
      { ar: "الدقي", en: "Dokki" },
      { ar: "الهرم", en: "Haram" },
      { ar: "فيصل", en: "Faisal" },
      { ar: "العجوزة", en: "Agouza" },
      { ar: "العمرانية", en: "Omraneya" },
      { ar: "الجيزة (وسط المدينة)", en: "Giza (Downtown)" },
      { ar: "الوراق", en: "Warraq" },
      { ar: "إمبابة", en: "Imbaba" },
      { ar: "كرداسة", en: "Kerdasa" },
      { ar: "أبو النمرس", en: "Abu Nomros" },
      { ar: "البدرشين", en: "Badrashein" },
      { ar: "الحوامدية", en: "Hawamdeya" },
      { ar: "العياط", en: "Ayat" },
      { ar: "أطفيح", en: "Atfih" },
      { ar: "الواحات البحرية", en: "Bahariya Oasis" }
    ]
  },
  alexandria: {
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    cities: [
      { ar: "سموحة", en: "Smouha" },
      { ar: "ميامي", en: "Miami" },
      { ar: "سيدي بشر", en: "Sidi Bishr" },
      { ar: "العصافرة", en: "Asafra" },
      { ar: "لوران", en: "Laurent" },
      { ar: "جليم", en: "Glim" },
      { ar: "رشدي", en: "Roushdy" },
      { ar: "كفر عبده", en: "Kafr Abdo" },
      { ar: "الشاطبي", en: "Shatby" },
      { ar: "محرم بك", en: "Moharram Bek" },
      { ar: "العجمي", en: "Agamy" },
      { ar: "العامرية", en: "Amreya" },
      { ar: "برج العرب", en: "Borg El Arab" },
      { ar: "المنشية", en: "Mansheya" },
      { ar: "بحري", en: "Bahari" },
      { ar: "كليوباترا", en: "Cleopatra" },
      { ar: "سيدي جابر", en: "Sidi Gaber" },
      { ar: "المنتزة", en: "Montaza" },
      { ar: "المعمورة", en: "Maamoura" },
      { ar: "أبو قير", en: "Abu Qir" }
    ]
  },
  sharqia: {
    nameAr: "الشرقية",
    nameEn: "Sharqia",
    cities: [
      { ar: "الزقازيق", en: "Zagazig" },
      { ar: "العاشر من رمضان", en: "10th of Ramadan" },
      { ar: "بلبيس", en: "Belbeis" },
      { ar: "منيا القمح", en: "Minya El Qamh" },
      { ar: "أبو حماد", en: "Abu Hammad" },
      { ar: "فاقوس", en: "Fagus" },
      { ar: "الحسينية", en: "Huseiniya" },
      { ar: "أبو كبير", en: "Abu Kebir" },
      { ar: "كفر صقر", en: "Kafr Saqr" },
      { ar: "أولاد صقر", en: "Awlad Saqr" },
      { ar: "ههيا", en: "Hehia" },
      { ar: "ديرب نجم", en: "Dyarb Negm" },
      { ar: "مشتول السوق", en: "Mashtool El Souq" },
      { ar: "الإبراهيمية", en: "Ibrahimiya" },
      { ar: "القرين", en: "El Qurein" },
      { ar: "القنايات", en: "El Qanayat" },
      { ar: "صان الحجر", en: "San El Hagar" }
    ]
  },
  dakahlia: {
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    cities: [
      { ar: "المنصورة", en: "Mansoura" },
      { ar: "ميت غمر", en: "Mit Ghamr" },
      { ar: "السنبلاوين", en: "Senbellawein" },
      { ar: "دكرنس", en: "Dekernes" },
      { ar: "شربين", en: "Sherbin" },
      { ar: "المنزلة", en: "Manzala" },
      { ar: "طلخا", en: "Talkha" },
      { ar: "الجمالية", en: "Gamaliya" },
      { ar: "منية النصر", en: "Minyat El Nasr" },
      { ar: "أجا", en: "Aga" },
      { ar: "تمي الأمديد", en: "Tamy El Amdeed" },
      { ar: "بلقاس", en: "Belqas" },
      { ar: "بني عبيد", en: "Bani Ubayd" },
      { ar: "المطرية", en: "Matareya" },
      { ar: "الكردي", en: "El Kurdi" },
      { ar: "نبروه", en: "Nabarouh" },
      { ar: "جمصة", en: "Gamasa" }
    ]
  },
  beheira: {
    nameAr: "البحيرة",
    nameEn: "Beheira",
    cities: [
      { ar: "دمنهور", en: "Damanhour" },
      { ar: "كفر الدوار", en: "Kafr El Dawar" },
      { ar: "رشيد", en: "Rosetta (Rashid)" },
      { ar: "إدكو", en: "Edko" },
      { ar: "أبو حمص", en: "Abu Hummus" },
      { ar: "أبو المطامير", en: "Abu El Matamir" },
      { ar: "الدلنجات", en: "Delengat" },
      { ar: "كوم حمادة", en: "Kom Hamada" },
      { ar: "إيتاي البارود", en: "Itay El Baroud" },
      { ar: "شبراخيت", en: "Shubra Khit" },
      { ar: "الرحمانية", en: "Rahmaniya" },
      { ar: "المحمودية", en: "Mahmoudiya" },
      { ar: "وادي النطرون", en: "Wadi El Natrun" },
      { ar: "بدر", en: "Badr" },
      { ar: "غرب النوبارية", en: "West Noubaria" }
    ]
  },
  minya: {
    nameAr: "المنيا",
    nameEn: "Minya",
    cities: [
      { ar: "المنيا", en: "Minya" },
      { ar: "المنيا الجديدة", en: "New Minya" },
      { ar: "ملوي", en: "Mallawi" },
      { ar: "مغاغة", en: "Maghagha" },
      { ar: "بني مزار", en: "Bani Mazar" },
      { ar: "أبو قرقاص", en: "Abu Qurqas" },
      { ar: "سمالوط", en: "Samalut" },
      { ar: "مطاي", en: "Matai" },
      { ar: "العدوة", en: "Adwa" },
      { ar: "دير مواس", en: "Deir Mawas" }
    ]
  },
  sohag: {
    nameAr: "سوهاج",
    nameEn: "Sohag",
    cities: [
      { ar: "سوهاج", en: "Sohag" },
      { ar: "سوهاج الجديدة", en: "New Sohag" },
      { ar: "أخميم", en: "Akhmim" },
      { ar: "طهطا", en: "Tahta" },
      { ar: "جرجا", en: "Girga" },
      { ar: "البلينا", en: "Balyana" },
      { ar: "طهما", en: "Tma" },
      { ar: "المنشأة", en: "Monsha'a" },
      { ar: "المراغة", en: "Maragha" },
      { ar: "دار السلام", en: "Dar El Salam" },
      { ar: "جهينة", en: "Juhayna" },
      { ar: "ساقلتة", en: "Saqalta" }
    ]
  },
  qena: {
    nameAr: "قنا",
    nameEn: "Qena",
    cities: [
      { ar: "قنا", en: "Qena" },
      { ar: "نجع حمادي", en: "Nag Hammadi" },
      { ar: "دشنا", en: "Deshna" },
      { ar: "قوص", en: "Qus" },
      { ar: "أبو تشت", en: "Abu Tesht" },
      { ar: "فرشوط", en: "Farshoot" },
      { ar: "نقادة", en: "Naqada" },
      { ar: "الوقف", en: "Waqf" },
      { ar: "قفط", en: "Qift" }
    ]
  },
  assiut: {
    nameAr: "أسيوط",
    nameEn: "Asyut",
    cities: [
      { ar: "أسيوط", en: "Asyut" },
      { ar: "أسيوط الجديدة", en: "New Asyut" },
      { ar: "ديروط", en: "Dayrout" },
      { ar: "منفلوط", en: "Manfalut" },
      { ar: "القوصية", en: "Qusiya" },
      { ar: "أبنوب", en: "Abnoub" },
      { ar: "الفتح", en: "Fateh" },
      { ar: "أبوتيج", en: "Abu Tig" },
      { ar: "صدفا", en: "Sidfa" },
      { ar: "الغنايم", en: "Ghanayem" },
      { ar: "البداري", en: "Badari" },
      { ar: "ساحل سليم", en: "Sahel Selim" }
    ]
  },
  fayoum: {
    nameAr: "الفيوم",
    nameEn: "Fayoum",
    cities: [
      { ar: "الفيوم", en: "Fayoum" },
      { ar: "سنورس", en: "Senouris" },
      { ar: "طامية", en: "Tamiya" },
      { ar: "إطسا", en: "Itsa" },
      { ar: "أبشواي", en: "Ibshaway" },
      { ar: "يوسف الصديق", en: "Youssef El Sadek" },
      { ar: "الفيوم الجديدة", en: "New Fayoum" }
    ]
  },
  beni_suef: {
    nameAr: "بني سويف",
    nameEn: "Beni Suef",
    cities: [
      { ar: "بني سويف", en: "Beni Suef" },
      { ar: "ناصر", en: "Nasser" },
      { ar: "ببا", en: "Biba" },
      { ar: "الفشن", en: "Fashn" },
      { ar: "سمسطا", en: "Samasta" },
      { ar: "إهناسيا", en: "Ihnasya" },
      { ar: "الواسطى", en: "Wasta" },
      { ar: "بني سويف الجديدة", en: "New Beni Suef" }
    ]
  },
  menoufia: {
    nameAr: "المنوفية",
    nameEn: "Menoufia",
    cities: [
      { ar: "شبين الكوم", en: "Shibin El Kom" },
      { ar: "أشمون", en: "Ashmoun" },
      { ar: "منوف", en: "Menouf" },
      { ar: "مدينة السادات", en: "Sadat City" },
      { ar: "سرس الليان", en: "Sars El Layan" },
      { ar: "تلا", en: "Tala" },
      { ar: "الباجور", en: "Bagour" },
      { ar: "الشهداء", en: "Shohada" },
      { ar: "قويسنا", en: "Quwaysna" },
      { ar: "بركة السبع", en: "Berket El Sabe" }
    ]
  },
  kafr_el_sheikh: {
    nameAr: "كفر الشيخ",
    nameEn: "Kafr El Sheikh",
    cities: [
      { ar: "كفر الشيخ", en: "Kafr El Sheikh" },
      { ar: "دسوق", en: "Desouk" },
      { ar: "فوة", en: "Fowa" },
      { ar: "مطوبس", en: "Metoubes" },
      { ar: "قلين", en: "Qallin" },
      { ar: "سيدي سالم", en: "Sidi Salem" },
      { ar: "الرياض", en: "Riyadh" },
      { ar: "سيدي غازي", en: "Sidi Ghazi" },
      { ar: "بيلا", en: "Biyala" },
      { ar: "الحامول", en: "Hamoul" },
      { ar: "بلطيم", en: "Baltim" },
      { ar: "برج البرلس", en: "Baltim Resort" }
    ]
  },
  damietta: {
    nameAr: "دمياط",
    nameEn: "Damietta",
    cities: [
      { ar: "دمياط", en: "Damietta" },
      { ar: "دمياط الجديدة", en: "New Damietta" },
      { ar: "رأس البر", en: "Ras El Bar" },
      { ar: "فارسكور", en: "Faraskour" },
      { ar: "الزرقا", en: "Zarqa" },
      { ar: "كفر سعد", en: "Kafr Saad" },
      { ar: "كفر البطيخ", en: "Kafr El Batikh" },
      { ar: "عزبة البرج", en: "Ezbet El Borg" },
      { ar: "ميت أبو غالب", en: "Mit Abu Ghalib" },
      { ar: "الروضة", en: "Rawda" }
    ]
  },
  port_said: {
    nameAr: "بورسعيد",
    nameEn: "Port Said",
    cities: [
      { ar: "بورسعيد (حي الشرق)", en: "Port Said" },
      { ar: "بورفؤاد", en: "Port Fouad" },
      { ar: "حي الزهور", en: "Zohour District" },
      { ar: "حي الضواحي", en: "Dawahy District" },
      { ar: "حي المناخ", en: "Manakh District" },
      { ar: "حي العرب", en: "Arab District" },
      { ar: "حي الجنوب", en: "Ganoub District" },
      { ar: "حي الغرب", en: "Gharb District" }
    ]
  },
  ismailia: {
    nameAr: "الإسماعيلية",
    nameEn: "Ismailia",
    cities: [
      { ar: "الإسماعيلية", en: "Ismailia" },
      { ar: "التل الكبير", en: "Tell El Kebir" },
      { ar: "فايد", en: "Fayed" },
      { ar: "القنطرة شرق", en: "Qantara East" },
      { ar: "القنطرة غرب", en: "Qantara West" },
      { ar: "أبو صوير", en: "Abu Suwir" },
      { ar: "القصاصين", en: "Qassasin" }
    ]
  },
  suez: {
    nameAr: "السويس",
    nameEn: "Suez",
    cities: [
      { ar: "السويس (حي السويس)", en: "Suez" },
      { ar: "حي الأربعين", en: "Arbaeen District" },
      { ar: "حي عتاقة", en: "Ataqah District" },
      { ar: "حي الجناين", en: "Ganayen District" },
      { ar: "حي فيصل", en: "Faisal District" },
      { ar: "بورتوفيق", en: "Port Tawfiq" },
      { ar: "العين السخنة", en: "Ain Sokhna" }
    ]
  },
  north_sinai: {
    nameAr: "شمال سيناء",
    nameEn: "North Sinai",
    cities: [
      { ar: "العريش", en: "Arish" },
      { ar: "بئر العبد", en: "Bir Al-Abed" },
      { ar: "الشيخ زويد", en: "Sheikh Zuweid" },
      { ar: "رفح", en: "Rafah" },
      { ar: "الحسنة", en: "Hasana" },
      { ar: "النخل", en: "Nakhl" }
    ]
  },
  south_sinai: {
    nameAr: "جنوب سيناء",
    nameEn: "South Sinai",
    cities: [
      { ar: "شرم الشيخ", en: "Sharm El Sheikh" },
      { ar: "دهب", en: "Dahab" },
      { ar: "نويبع", en: "Nuweiba" },
      { ar: "طابا", en: "Taba" },
      { ar: "طور سيناء", en: "Tor Sinai" },
      { ar: "رأس سدر", en: "Ras Sudr" },
      { ar: "سانت كاترين", en: "St. Catherine" },
      { ar: "أبو رديس", en: "Abu Rudeis" },
      { ar: "أبو زنيمة", en: "Abu Zenima" }
    ]
  },
  red_sea: {
    nameAr: "البحر الأحمر",
    nameEn: "Red Sea",
    cities: [
      { ar: "الغردقة", en: "Hurghada" },
      { ar: "الجونة", en: "El Gouna" },
      { ar: "سفاجا", en: "Safaga" },
      { ar: "القصير", en: "Quseir" },
      { ar: "مرسى علم", en: "Marsa Alam" },
      { ar: "شلاتين", en: "Shalateen" },
      { ar: "حلايب", en: "Halayeb" },
      { ar: "رأس غارب", en: "Ras Gharib" }
    ]
  },
  new_valley: {
    nameAr: "الوادي الجديد",
    nameEn: "New Valley",
    cities: [
      { ar: "الخارجة", en: "Kharga" },
      { ar: "الداخلة", en: "Dakhla" },
      { ar: "الفرافرة", en: "Farafra" },
      { ar: "باريس", en: "Baris" },
      { ar: "بلاط", en: "Balat" }
    ]
  },
  matruh: {
    nameAr: "مطروح",
    nameEn: "Matruh",
    cities: [
      { ar: "مرسى مطروح", en: "Marsa Matrouh" },
      { ar: "الساحل الشمالي", en: "North Coast" },
      { ar: "مارينا", en: "Marina" },
      { ar: "العلمين", en: "Al Alamein" },
      { ar: "سيدي عبد الرحمن", en: "Sidi Abdel Rahman" },
      { ar: "الضبعة", en: "Dabaa" },
      { ar: "سيوة", en: "Siwa" },
      { ar: "الحمام", en: "Hamam" },
      { ar: "النجيلة", en: "Negaila" },
      { ar: "براني", en: "Barrani" },
      { ar: "السلوم", en: "Salloum" }
    ]
  },
  luxor: {
    nameAr: "الأقصر",
    nameEn: "Luxor",
    cities: [
      { ar: "الأقصر (وسط المدينة)", en: "Luxor" },
      { ar: "طيبة الجديدة", en: "New Tiba" },
      { ar: "إسنا", en: "Esna" },
      { ar: "أرمنت", en: "Armant" },
      { ar: "البياضية", en: "Bayadiya" },
      { ar: "القرنة", en: "Qurna" },
      { ar: "الطود", en: "Tod" }
    ]
  },
  aswan: {
    nameAr: "أسوان",
    nameEn: "Aswan",
    cities: [
      { ar: "أسوان", en: "Aswan" },
      { ar: "أسوان الجديدة", en: "New Aswan" },
      { ar: "كوم أمبو", en: "Kom Ombo" },
      { ar: "إدفو", en: "Edfu" },
      { ar: "نصر النوبة", en: "Nasr Nuba" },
      { ar: "دراو", en: "Daraw" },
      { ar: "أبو سمبل", en: "Abu Simbel" }
    ]
  },
  gharbia: {
    nameAr: "الغربية",
    nameEn: "Gharbia",
    cities: [
      { ar: "المحلة الكبرى", en: "Mahalla El Kubra" },
      { ar: "طنطا", en: "Tanta" },
      { ar: "كفر الزيات", en: "Kafr El Zayat" },
      { ar: "زفتى", en: "Zefta" },
      { ar: "السنطة", en: "Santa" },
      { ar: "قطور", en: "Qutur" },
      { ar: "بسيون", en: "Basyoun" },
      { ar: "سمنود", en: "Samanoud" },
      { ar: "الهياتم", en: "Hayatem" }
    ]
  },
  qalyubia: {
    nameAr: "القليوبية",
    nameEn: "Qalyubia",
    cities: [
      { ar: "بنها", en: "Banha" },
      { ar: "شبرا الخيمة", en: "Shubra El Kheima" },
      { ar: "قليوب", en: "Qalyub" },
      { ar: "الخانكة", en: "Khanka" },
      { ar: "القناطر الخيرية", en: "Qanater El Khayreya" },
      { ar: "شبين القناطر", en: "Shibin El Qanater" },
      { ar: "طوخ", en: "Toukh" },
      { ar: "قها", en: "Qaha" },
      { ar: "الخصوص", en: "Khusus" },
      { ar: "العبور", en: "Obour" },
      { ar: "كفر شكر", en: "Kafr Shukr" }
    ]
  }
};

export const shippingRates: Record<string, number> = {
  cairo: 50,
  giza: 50,
  alexandria: 60,
  sharqia: 65,
  dakahlia: 65,
  beheira: 65,
  gharbia: 65,
  qalyubia: 65,
  minya: 85,
  sohag: 90,
  qena: 95,
  assiut: 85,
  fayoum: 70,
  beni_suef: 75,
  menoufia: 65,
  kafr_el_sheikh: 65,
  damietta: 65,
  port_said: 65,
  ismailia: 65,
  suez: 65,
  north_sinai: 120,
  south_sinai: 120,
  red_sea: 120,
  new_valley: 130,
  matruh: 120,
  luxor: 100,
  aswan: 110,
};


// ─── Phone Formatting ─────────────────────────────────────────────────────────

export function formatPhone(phone: string, locale: Locale = "ar"): string {
  if (locale === "ar") {
    return phone.replace(/[0-9]/g, (d) =>
      "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]
    );
  }
  return phone;
}

// ─── Truncate Text ────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ─── Generate Order ID (display) ─────────────────────────────────────────────

export function formatOrderId(id: string): string {
  return `#RL-${id.slice(-6).toUpperCase()}`;
}

export function formatWhatsAppPhone(phone: string): string {
  let normalized = phone
    .replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
    
  let clean = normalized.replace(/\D/g, "");
  
  if (clean.startsWith("0020")) {
    clean = clean.slice(2);
  }
  
  if (clean.startsWith("01") && clean.length === 11) {
    return `2${clean}`;
  }
  
  if (clean.startsWith("1") && clean.length === 10) {
    return `20${clean}`;
  }
  
  if (clean.startsWith("201") && clean.length === 12) {
    return clean;
  }
  
  if (clean.startsWith("0")) {
    return `20${clean.slice(1)}`;
  }
  
  return clean;
}

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

export const shippingRates: Record<string, number> = {
  cairo: 50,
  giza: 50,
  alexandria: 60,
  sharqia: 65,
  dakahlia: 65,
  beheira: 65,
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

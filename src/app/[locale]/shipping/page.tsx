import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";
import { shippingRates, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "سياسة الشحن | روماد ليزر",
  description: "تعرف على أسعار ومواعيد الشحن لجميع محافظات مصر",
};

const governoratesAr: Record<string, string> = {
  cairo: "القاهرة",
  giza: "الجيزة",
  alexandria: "الإسكندرية",
  sharqia: "الشرقية",
  dakahlia: "الدقهلية",
  beheira: "البحيرة",
  gharbia: "الغربية",
  qalyubia: "القليوبية",
  minya: "المنيا",
  sohag: "سوهاج",
  qena: "قنا",
  assiut: "أسيوط",
  fayoum: "الفيوم",
  beni_suef: "بني سويف",
  menoufia: "المنوفية",
  kafr_el_sheikh: "كفر الشيخ",
  damietta: "دمياط",
  port_said: "بورسعيد",
  ismailia: "الإسماعيلية",
  suez: "السويس",
  north_sinai: "شمال سيناء",
  south_sinai: "جنوب سيناء",
  red_sea: "البحر الأحمر",
  new_valley: "الوادي الجديد",
  matruh: "مطروح",
  luxor: "الأقصر",
  aswan: "أسوان",
};

import { getShippingSettings } from "@/lib/firestore.server";

export default async function ShippingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const settings = await getShippingSettings();
  
  if (!settings) {
    return <div>Error loading shipping settings.</div>;
  }

  const { rates, freeShippingThreshold } = settings;

  return (
    <main className="container-romad py-16 lg:py-24">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">
          {isAr ? "سياسة الشحن والتوصيل" : "Shipping & Delivery Policy"}
        </h1>
        <p className="text-lg text-text-muted leading-relaxed">
          {isAr 
            ? "نحن نولي اهتماماً كبيراً بتوصيل منتجاتنا إليكم بأسرع وقت وأعلى معايير الأمان. نتعاون مع أفضل شركات الشحن لضمان وصول طلبكم في أفضل حالة."
            : "We take great care in delivering our products to you as quickly as possible and with the highest security standards."}
        </p>
      </div>

      {/* Highlights */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {[
          {
            icon: Clock,
            title: isAr ? "توصيل سريع" : "Fast Delivery",
            desc: isAr ? "خلال 2-5 أيام عمل" : "Within 2-5 business days",
          },
          {
            icon: ShieldCheck,
            title: isAr ? "تغليف آمن" : "Secure Packaging",
            desc: isAr ? "حماية كاملة للمنتجات" : "Full product protection",
          },
          {
            icon: Truck,
            title: isAr ? "شحن مجاني" : "Free Shipping",
            desc: isAr ? `للطلبات فوق ${formatPrice(freeShippingThreshold, "ar")}` : `Orders over ${formatPrice(freeShippingThreshold, "en")}`,
          },
          {
            icon: MapPin,
            title: isAr ? "تغطية شاملة" : "Full Coverage",
            desc: isAr ? "نشحن لجميع محافظات مصر" : "Shipping across Egypt",
          },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gold-pale flex items-center justify-center mx-auto mb-4">
              <item.icon size={24} className="text-gold" />
            </div>
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Shipping Rates Table */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Truck size={28} className="text-gold" />
          <h2 className="text-2xl font-black text-white">
            {isAr ? "تكلفة الشحن حسب المحافظة" : "Shipping Cost by Governorate"}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/5">
          <div className="grid grid-cols-2 bg-white/10 p-4 font-bold text-gold uppercase tracking-wider text-xs">
            <span>{isAr ? "المحافظة" : "Governorate"}</span>
            <span className="text-end">{isAr ? "سعر الشحن" : "Shipping Cost"}</span>
          </div>
          <div className="divide-y divide-white/5">
            {Object.entries(rates).map(([key, price]) => (
              <div key={key} className="grid grid-cols-2 p-4 hover:bg-white/5 transition-colors">
                <span className="text-white font-medium">
                  {isAr ? (governoratesAr[key] || key) : key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                </span>
                <span className="text-gold font-bold text-end">
                  {formatPrice(price as number, locale as any)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 rounded-3xl bg-gold/10 border border-gold/20">
          <p className="text-sm text-white leading-relaxed">
            <span className="font-bold text-gold">💡 {isAr ? "ملاحظة:" : "Note:"}</span>{" "}
            {isAr 
              ? "يتم حساب تكلفة الشحن تلقائياً عند إتمام الطلب بناءً على المحافظة المختارة. في حالة الطلبات كبيرة الحجم أو الماكينات، قد يتم التواصل معكم لتنسيق ترتيبات شحن خاصة."
              : "Shipping cost is automatically calculated at checkout. For large orders or machines, we may contact you for special arrangements."}
          </p>
        </div>
      </div>
    </main>
  );
}

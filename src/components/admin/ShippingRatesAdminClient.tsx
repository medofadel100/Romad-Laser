"use client";

import { useState } from "react";
import { Truck, Save, RefreshCw, AlertCircle, MapPin, CheckCircle2 } from "lucide-react";
import { updateShippingSettings } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice } from "@/lib/utils";

interface ShippingSettings {
  freeShippingThreshold: number;
  rates: Record<string, number>;
}

const governorateNamesAr: Record<string, string> = {
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

export default function ShippingRatesAdminClient({
  initialSettings,
  locale,
}: {
  initialSettings: ShippingSettings;
  locale: string;
}) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRateChange = (gov: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [gov]: numValue,
      },
    }));
  };

  const handleThresholdChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setSettings((prev) => ({
      ...prev,
      freeShippingThreshold: numValue,
    }));
  };

  const onSave = async () => {
    setIsSubmitting(true);
    try {
      await updateShippingSettings(settings);
      addToast("success", isAr ? "تم حفظ إعدادات الشحن بنجاح" : "Shipping settings saved successfully");
    } catch (error) {
      console.error("Error saving shipping settings:", error);
      addToast("error", isAr ? "حدث خطأ أثناء الحفظ" : "Error saving settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-gold/10 p-4 rounded-3xl">
            <Truck className="h-8 w-8 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-navy leading-none">
              {isAr ? "أسعار الشحن" : "Shipping Rates"}
            </h1>
            <p className="text-text-muted text-sm mt-2 font-bold uppercase tracking-wider">
              {isAr ? "المحافظات وحد الإعفاء" : "Governorates & Threshold"}
            </p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={isSubmitting}
          className="btn bg-gold text-navy hover:bg-navy hover:text-white border-none h-14 px-10 rounded-2xl font-black shadow-lg shadow-gold/20 flex items-center gap-3 transition-all"
        >
          {isSubmitting ? <RefreshCw className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
          {isAr ? "حفظ الإعدادات" : "Save Settings"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Sidebar: Free Shipping Threshold */}
        <aside className="space-y-6">
          <div className="bg-navy rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 bg-gold/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                </div>
                <h3 className="text-xl font-black">{isAr ? "الشحن المجاني" : "Free Shipping"}</h3>
              </div>
              
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                {isAr 
                  ? "حدد الحد الأدنى لقيمة الطلب التي يحصل عندها العميل على شحن مجاني تماماً." 
                  : "Set the minimum order value at which customers receive completely free shipping."}
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gold tracking-widest">
                  {isAr ? "الحد الأدنى (ج.م)" : "THRESHOLD (EGP)"}
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleThresholdChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 font-black text-2xl text-white outline-none focus:border-gold transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-black">
                    {isAr ? "ج.م" : "EGP"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-gold" />
              <h4 className="font-black text-navy text-sm uppercase tracking-wider">{isAr ? "ملاحظة" : "Note"}</h4>
            </div>
            <p className="text-text-muted text-xs leading-relaxed font-bold">
              {isAr 
                ? "تأكد من مراجعة الأسعار بانتظام مع شركات الشحن لضمان دقة التكاليف المطبقة على العملاء." 
                : "Make sure to review rates regularly with shipping companies to ensure accurate costs applied to customers."}
            </p>
          </div>
        </aside>

        {/* Main Content: Rates Table */}
        <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gold" />
              <h3 className="text-xl font-black text-navy italic uppercase tracking-tight">
                {isAr ? "توزيع المحافظات" : "Governorate Rates"}
              </h3>
            </div>
            <span className="bg-navy text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {Object.keys(governorateNamesAr).length} {isAr ? "محافظة" : "Governorates"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-x divide-y divide-gray-50 rtl:divide-x-reverse h-full">
            {Object.entries(governorateNamesAr).map(([key, name]) => (
              <div key={key} className="p-6 hover:bg-gray-50/50 transition-all group flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-navy group-hover:text-gold transition-colors truncate pr-2">
                    {isAr ? name : key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                  </label>
                  <div className="bg-gray-100 text-[10px] font-black text-text-muted px-2 py-0.5 rounded uppercase">
                    {isAr ? "ج.م" : "EGP"}
                  </div>
                </div>
                <div className="relative group/input">
                  <input
                    type="number"
                    value={settings.rates[key] || 0}
                    onChange={(e) => handleRateChange(key, e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 font-black text-navy text-lg focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

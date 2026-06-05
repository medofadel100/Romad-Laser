"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { 
  Wrench, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { createMaintenanceRequest } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface MaintenanceFormValues {
  customerName: string;
  customerPhone: string;
  workshopName: string;
  workshopAddress: string;
  description: string;
}

export default function MaintenanceRequestClient({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormValues>();

  const onSubmit = async (values: MaintenanceFormValues) => {
    setIsSubmitting(true);
    try {
      await createMaintenanceRequest({
        type: "diagnostic_visit",
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        workshopName: values.workshopName,
        workshopAddress: values.workshopAddress,
        description: values.description,
        status: "pending",
      });
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      addToast("error", isAr ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى." : "Error submitting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="container-romad py-20 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-xl w-full bg-white p-12 rounded-[40px] text-center shadow-xl border border-green-100">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-navy mb-4">
            {isAr ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
          </h1>
          <p className="text-lg text-text-muted mb-8 leading-relaxed">
            {isAr 
              ? "سيقوم فريق الدعم الفني بالتواصل معك هاتفياً في أقرب وقت لتحديد موعد زيارة المهندس وتأكيد التكلفة المبدئية." 
              : "Our technical support team will contact you shortly to schedule the engineer visit and confirm initial costs."}
          </p>
          <button 
            onClick={() => router.push(`/${locale}`)}
            className="w-full py-5 rounded-2xl bg-navy text-white font-bold hover:bg-navy-deep transition-all"
          >
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-romad py-16 lg:py-24">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-navy text-gold mb-6 shadow-2xl rotate-3">
            <Wrench size={40} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy mb-6 tracking-tight">
            {isAr ? "طلب زيارة هندسية لتشخيص الأعطال" : "Request Engineering Diagnostic Visit"}
          </h1>
          <p className="text-lg text-text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "مهندسونا المتخصصون جاهزون لزيارتك في موقعك وتشخيص أعطال ماكينات الليزر CO2 بدقة واحترافية." 
              : "Our specialized engineers are ready to visit your site to accurately diagnose and fix your Laser and CO2 machines."}
          </p>
        </div>

        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-5">
            
            {/* Sidebar Info */}
            <div className="md:col-span-2 bg-navy p-10 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
              
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-gold mb-2">{isAr ? "كيف تعمل الخدمة؟" : "How it works?"}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {isAr ? "نحن نقدم خدمة صيانة شاملة للماكينات. املأ النموذج وسنقوم بالتواصل معك." : "We offer comprehensive machine maintenance. Fill the form and we will contact you."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{isAr ? "استجابة سريعة" : "Fast Response"}</h4>
                      <p className="text-xs text-white/60">{isAr ? "نتواصل معك خلال 24 ساعة لتحديد الموعد." : "We contact you within 24h to schedule."}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <AlertCircle size={18} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{isAr ? "تشخيص دقيق" : "Accurate Diagnosis"}</h4>
                      <p className="text-xs text-white/60">{isAr ? "تحديد العطل بدقة واقتراح أفضل الحلول." : "Accurate fault detection and best solutions."}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Wrench size={18} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{isAr ? "صيانة معتمدة" : "Certified Maintenance"}</h4>
                      <p className="text-xs text-white/60">{isAr ? "تركيب قطع غيار أصلية مع ضمان." : "Original spare parts installation with warranty."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3 p-10 lg:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-sm font-bold text-navy mb-2 flex items-center gap-2"><User size={16}/> {isAr ? "الاسم الكريم" : "Your Name"} *</span>
                    <input
                      type="text"
                      {...register("customerName", { required: true })}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gold outline-none transition-all"
                    />
                  </label>
                  
                  <label className="block">
                    <span className="text-sm font-bold text-navy mb-2 flex items-center gap-2"><Phone size={16}/> {isAr ? "رقم الهاتف" : "Phone Number"} *</span>
                    <input
                      type="text"
                      dir="ltr"
                      {...register("customerPhone", { required: true })}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gold outline-none transition-all text-left"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 flex items-center gap-2"><Building2 size={16}/> {isAr ? "اسم الورشة أو المصنع (اختياري)" : "Workshop/Factory Name (Optional)"}</span>
                  <input
                    type="text"
                    {...register("workshopName")}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gold outline-none transition-all"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 flex items-center gap-2"><MapPin size={16}/> {isAr ? "العنوان بالتفصيل" : "Detailed Address"} *</span>
                  <input
                    type="text"
                    {...register("workshopAddress", { required: true })}
                    placeholder={isAr ? "المحافظة، المدينة، الشارع..." : "Governorate, City, Street..."}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gold outline-none transition-all"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "وصف العطل أو المشكلة باختصار" : "Describe the fault briefly"} *</span>
                  <textarea
                    rows={4}
                    {...register("description", { required: true })}
                    placeholder={isAr ? "مثال: الماكينة لا تقطع جيداً، أو يوجد صوت غير طبيعي..." : "e.g., Machine doesn't cut well, or abnormal noise..."}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-gold outline-none transition-all resize-none"
                  />
                </label>

                {Object.keys(errors).length > 0 && (
                  <p className="text-red-500 text-sm font-bold text-center">
                    {isAr ? "يرجى ملء جميع الحقول المطلوبة بشكل صحيح." : "Please fill all required fields correctly."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-5 text-xl font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 mt-8",
                    isSubmitting ? "bg-gray-300 text-gray-500" : "bg-gold text-navy hover:bg-yellow-400 hover:-translate-y-1"
                  )}
                >
                  <Wrench size={24} />
                  {isSubmitting ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "تأكيد الطلب الآن" : "Confirm Request Now")}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

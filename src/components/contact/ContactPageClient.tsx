"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Social Icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { createMaintenanceRequest } from "@/lib/firestore";

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  workshopName?: string;
  workshopAddress?: string;
}

export default function ContactPageClient({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ContactFormValues>({
    defaultValues: { subject: "inquiry" }
  });

  const subject = watch("subject");

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      if (data.subject === "maintenance") {
        await createMaintenanceRequest({
          type: "diagnostic_visit",
          customerName: data.name,
          customerPhone: data.phone,
          workshopName: data.workshopName || "",
          workshopAddress: data.workshopAddress || "",
          description: data.message,
          status: "pending",
        });
      } else {
        // Simulate API call for regular contact
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Contact form data:", data);
      }
      
      setIsSuccess(true);
      addToast("success", isAr ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
      reset();
    } catch (error) {
      addToast("error", isAr ? "حدث خطأ أثناء الإرسال" : "Error sending message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isAr ? "اتصل بنا" : "Call Us",
      value: "01229256173",
      href: "tel:+201229256173",
      color: "bg-blue-500",
    },
    {
      icon: MessageCircle,
      title: isAr ? "واتساب" : "WhatsApp",
      value: "201229256173",
      href: "https://wa.me/201229256173",
      color: "bg-green-500",
    },
    {
      icon: Mail,
      title: isAr ? "البريد الإلكتروني" : "Email",
      value: "info@romadlaser.com",
      href: "mailto:info@romadlaser.com",
      color: "bg-gold",
    },
    {
      icon: Clock,
      title: isAr ? "ساعات العمل" : "Working Hours",
      value: isAr ? "9 صباحاً - 6 مساءً" : "9 AM - 6 PM",
      color: "bg-navy",
    },
  ];

  return (
    <main className="container-romad py-16 lg:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-black text-navy mb-6">
            {isAr ? "تواصل معنا" : "Contact Us"}
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {isAr 
              ? "نحن هنا لمساعدتك. سواء كان لديك استفسار عن قطعة غيار أو طلب صيانة، فريقنا جاهز للرد عليك."
              : "We're here to help. Whether you have a question about a spare part or a maintenance request, our team is ready."}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          {/* Info Side */}
          <div className="space-y-8">
            <div className="grid gap-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", info.color)}>
                    <info.icon size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">{info.title}</p>
                    {info.href ? (
                      <a href={info.href} className="text-xl font-black text-navy hover:text-gold transition-colors" dir={info.icon === Phone ? "ltr" : undefined}>
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-xl font-black text-navy">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[40px] bg-navy text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-32 w-32 bg-gold/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500" />
              <h3 className="text-2xl font-black mb-4 relative z-10">{isAr ? "مقرنا الرئيسي" : "Our Office"}</h3>
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <MapPin className="text-gold flex-shrink-0 mt-1" />
                <p className="text-white/80 leading-relaxed">
                  {isAr 
                    ? "قرية الهياتم - مركز المحلة الكبرى، محافظة الغربية، مصر" 
                    : "Hayatem Village, Mahalla El Kubra, Gharbia Governorate, Egypt"}
                </p>
              </div>
              <div className="flex gap-4 relative z-10">
                <a href="https://facebook.com/Romadlaser1" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-navy transition-all">
                  <FacebookIcon />
                </a>
                <a href="https://youtube.com/@romadlaser3543" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 hover:bg-gold hover:text-navy transition-all">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="rounded-[40px] border border-gray-200 bg-white p-8 lg:p-12 shadow-xl">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                  <CheckCircle size={56} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-navy mb-2">{isAr ? "شكراً لتواصلك معنا!" : "Thank you for reaching out!"}</h2>
                  <p className="text-text-muted">{isAr ? "لقد استلمنا رسالتك وسنقوم بالرد عليك في أقرب وقت ممكن." : "We've received your message and will get back to you as soon as possible."}</p>
                </div>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="btn btn-primary px-8"
                >
                  {isAr ? "إرسال رسالة أخرى" : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "الاسم الكامل" : "Full Name"} *</span>
                    <input 
                      type="text" 
                      {...register("name", { required: isAr ? "الاسم مطلوب" : "Name is required" })}
                      className="input w-full p-4 rounded-2xl" 
                      placeholder={isAr ? "أدخل اسمك هنا" : "Enter your name"}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "البريد الإلكتروني" : "Email"} *</span>
                    <input 
                      type="email" 
                      {...register("email", { 
                        required: isAr ? "البريد الإلكتروني مطلوب" : "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: isAr ? "بريد إلكتروني غير صحيح" : "Invalid email" }
                      })}
                      className="input w-full p-4 rounded-2xl" 
                      placeholder="example@mail.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "رقم الهاتف" : "Phone Number"} *</span>
                    <input 
                      type="tel" 
                      {...register("phone", { required: isAr ? "رقم الهاتف مطلوب" : "Phone is required" })}
                      className="input w-full p-4 rounded-2xl" 
                      placeholder="01xxxxxxxxx"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone.message}</p>}
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "الموضوع" : "Subject"}</span>
                    <select 
                      {...register("subject")}
                      className="input w-full p-4 rounded-2xl"
                    >
                      <option value="inquiry">{isAr ? "استفسار عام" : "General Inquiry"}</option>
                      <option value="maintenance">{isAr ? "طلب صيانة" : "Maintenance Request"}</option>
                      <option value="parts">{isAr ? "طلب قطع غيار" : "Spare Parts Order"}</option>
                      <option value="complaint">{isAr ? "شكوى أو اقتراح" : "Complaint or Suggestion"}</option>
                    </select>
                  </label>
                </div>

                {subject === "maintenance" && (
                  <div className="grid gap-6 sm:grid-cols-2 p-4 bg-navy/5 rounded-2xl border border-navy/10">
                    <label className="block">
                      <span className="text-sm font-black text-navy mb-2 block">{isAr ? "اسم الورشة أو المكان" : "Workshop/Factory Name"}</span>
                      <input 
                        type="text" 
                        {...register("workshopName")}
                        className="input w-full p-4 rounded-2xl bg-white" 
                        placeholder={isAr ? "اختياري" : "Optional"}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-black text-navy mb-2 block">{isAr ? "العنوان بالتفصيل" : "Detailed Address"} *</span>
                      <input 
                        type="text" 
                        {...register("workshopAddress", { required: isAr ? "العنوان مطلوب لزيارة الصيانة" : "Address is required for maintenance visit" })}
                        className="input w-full p-4 rounded-2xl bg-white" 
                        placeholder={isAr ? "المحافظة، المدينة، الشارع..." : "Governorate, City, Street..."}
                      />
                      {errors.workshopAddress && <p className="text-red-500 text-xs mt-1 font-bold">{errors.workshopAddress.message}</p>}
                    </label>
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-black text-navy mb-2 block">{isAr ? "رسالتك" : "Your Message"} *</span>
                  <textarea 
                    rows={5} 
                    {...register("message", { required: isAr ? "يرجى كتابة رسالتك" : "Please enter your message" })}
                    className="input w-full p-4 rounded-2xl resize-none" 
                    placeholder={isAr ? "كيف يمكننا مساعدتك اليوم؟" : "How can we help you today?"}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1 font-bold">{errors.message.message}</p>}
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary w-full py-5 text-lg font-black rounded-2xl shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-3 group"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-navy border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {isAr ? "إرسال الرسالة" : "Send Message"}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

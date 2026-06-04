"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { registerWithEmail } from "@/lib/auth";
import { useUIStore } from "@/store/uiStore";
import { EGYPT_GOVERNORATES, cn } from "@/lib/utils";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workshopName: string;
  workshopAddress: string;
  password: string;
  role: "customer" | "technician" | "distributor";
  experienceYears?: number;
  companyAffiliated?: boolean;
}

export default function RegisterPage({ params }: { params: { locale?: string } }) {
  const { locale: routeLocale } = params;
  const locale = routeLocale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const router = useRouter();
  const [selectedGovs, setSelectedGovs] = useState<string[]>([]);
  const { register, handleSubmit, watch } = useForm<RegisterFormValues>({
    defaultValues: {
      role: "customer",
      companyAffiliated: false
    }
  });
  const selectedRole = watch("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUIStore();

  const handleGovToggle = (govKey: string) => {
    setSelectedGovs(prev => 
      prev.includes(govKey) 
        ? prev.filter(k => k !== govKey) 
        : [...prev, govKey]
    );
  };

  const onSubmit = async (values: RegisterFormValues) => {
    if (
      !values.password ||
      !values.firstName ||
      !values.lastName ||
      !values.phone ||
      (values.role === "customer" && (!values.workshopName || !values.workshopAddress))
    ) {
      addToast("error", isAr ? "يرجى إكمال جميع الحقول الإجبارية." : "Please complete all required fields.");
      return;
    }

    if (values.role !== "customer" && selectedGovs.length === 0) {
      addToast("error", isAr ? "يرجى اختيار محافظة واحدة على الأقل لنطاق العمل." : "Please select at least one governorate for work scope.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalEmail = values.email?.trim() || `${values.phone.replace(/[^0-9]/g, "")}@roma-user.com`;
      
      await registerWithEmail(
        `${values.firstName} ${values.lastName}`.trim(),
        finalEmail,
        values.password,
        values.phone,
        values.role === "customer" ? values.workshopName : "",
        values.role === "customer" ? values.workshopAddress : "",
        values.role,
        values.role !== "customer" ? Number(values.experienceYears || 0) : undefined,
        values.role !== "customer" ? selectedGovs : undefined,
        values.role === "technician" ? !!values.companyAffiliated : undefined
      );
      addToast("success", isAr ? "تم إنشاء الحساب بنجاح" : "Account created successfully");
      router.push(`/${locale}`);
    } catch (error) {
      addToast("error", isAr ? "فشل إنشاء الحساب. حاول مرة أخرى." : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container-romad py-20">
      <div className="mx-auto max-w-lg rounded-[32px] border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-gold-dark mb-2">{isAr ? "انضم إلى روما ليزر" : "Join Romaα Laser"}</p>
          <h1 className="text-3xl font-black text-navy">{isAr ? "إنشاء حساب جديد" : "Create account"}</h1>
          <p className="mt-3 text-text-muted">
            {isAr ? "أنشئ حسابك لتتبع الطلبات أو الانضمام كشريك نجاح معنا." : "Create your account to track orders or join us as a partner."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Account Type Selector */}
          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "نوع الحساب" : "Account Type"}</span>
            <select {...register("role")} className="input mt-2 w-full font-bold">
              <option value="customer">{isAr ? "عميل / صاحب مكينة" : "Customer / Machine Owner"}</option>
              <option value="technician">{isAr ? "فني صيانة وتركيب (شريك نجاح)" : "Maintenance Technician"}</option>
              <option value="distributor">{isAr ? "موزع معتمد (أسعار خاصة)" : "Authorized Distributor"}</option>
            </select>
          </label>

          {/* Partners Benefits Info Card */}
          {selectedRole !== "customer" && (
            <div className="p-5 rounded-2xl bg-gold/10 border-2 border-gold/20 text-navy text-sm font-bold leading-relaxed space-y-2">
              <p className="text-gold font-black text-base">💰 {isAr ? "أسعار خاصة وحصرية!" : "Exclusive Special Pricing!"}</p>
              <p>
                {isAr 
                  ? "بصفتك شريك نجاح (موزع أو فني)، ستحصل على خصومات حصرية وأسعار خاصة لجميع قطع غيار ماكينات الليزر ومستلزماتها."
                  : "As a partner (distributor or technician), you will receive exclusive discounts and special pricing on all laser machine parts and supplies."}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "الاسم الأول" : "First name"} *</span>
              <input type="text" {...register("firstName")} className="input mt-2 w-full" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "اسم العائلة" : "Last name"} *</span>
              <input type="text" {...register("lastName")} className="input mt-2 w-full" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</span>
            <input type="email" autoComplete="email" {...register("email")} className="input mt-2 w-full" placeholder="example@mail.com" />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} *</span>
            <input type="tel" autoComplete="tel" {...register("phone")} className="input mt-2 w-full" placeholder={isAr ? "01XXXXXXXXX" : "+201XXXXXXXXX"} />
          </label>

          {selectedRole === "customer" && (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-navy">{isAr ? "اسم المصنع/الورشة/المكتب" : "Factory / Workshop / Office name"} *</span>
                <input type="text" {...register("workshopName")} className="input mt-2 w-full" placeholder={isAr ? "اسم الورشة" : "Workshop name"} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-navy">{isAr ? "عنوان المصنع / الورشة بالتفصيل" : "Factory / Workshop detailed address"} *</span>
                <input type="text" {...register("workshopAddress")} className="input mt-2 w-full" placeholder={isAr ? "الحي، المدينة، المحافظة" : "District, City, Governorate"} />
              </label>
            </>
          )}

          {/* Dynamic Partner Fields */}
          {selectedRole !== "customer" && (
            <>
              <div className="grid gap-4 sm:grid-cols-1">
                <label className="block">
                  <span className="text-sm font-semibold text-navy">{isAr ? "عدد سنوات الخبرة في المجال" : "Years of Experience"} *</span>
                  <input type="number" min={0} {...register("experienceYears")} className="input mt-2 w-full" placeholder={isAr ? "مثال: 5" : "e.g., 5"} />
                </label>
              </div>

              <div className="block">
                <span className="text-sm font-semibold text-navy mb-2 block">{isAr ? "نطاق المحافظات التي تغطيها للعمل" : "Governorates Work Scope"} *</span>
                <div className="max-h-48 overflow-y-auto border-2 border-gray-100 rounded-2xl p-4 grid grid-cols-2 gap-2 bg-gray-50/50">
                  {Object.entries(EGYPT_GOVERNORATES).map(([key, gov]) => (
                    <label key={key} className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer hover:text-gold transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedGovs.includes(key)}
                        onChange={() => handleGovToggle(key)}
                        className="rounded text-gold focus:ring-gold"
                      />
                      <span>{isAr ? gov.nameAr : gov.nameEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Company Affiliate Opt-in for Technicians */}
          {selectedRole === "technician" && (
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-navy/5 border border-navy/10 cursor-pointer hover:bg-navy/10 transition-colors">
              <input type="checkbox" {...register("companyAffiliated")} className="rounded text-gold focus:ring-gold mt-1" />
              <div>
                <span className="text-sm font-bold text-navy">{isAr ? "التسجيل كفني معتمد لدى الشركة" : "Register as company-affiliated technician"}</span>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {isAr
                    ? "سنقوم بتكليفك بزيارات التركيب، الصيانة، والدعم الفني لعملاء روما ليزر في نطاق عملك، وتكون شريك نجاح معتمد معنا!"
                    : "We will assign you to installation, maintenance, and technical support visits for Romaα Laser customers in your work scope!"}
                </p>
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "كلمة المرور" : "Password"} *</span>
            <input type="password" autoComplete="new-password" {...register("password")} className="input mt-2 w-full" />
          </label>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3 text-lg font-black tracking-wide">
            {isSubmitting ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : isAr ? "إنشاء الحساب الآن" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link href={`/${locale}/auth/login`} className="font-semibold text-gold-dark hover:text-gold">
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </p>
      </div>
    </main>
  );
}

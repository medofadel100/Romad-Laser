"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { use, useState } from "react";
import { registerWithEmail } from "@/lib/auth";
import { useUIStore } from "@/store/uiStore";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  workshopName: string;
  workshopAddress: string;
  password: string;
}

export default function RegisterPage({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale: routeLocale } = use(params);
  const locale = routeLocale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const router = useRouter();
  const { register, handleSubmit } = useForm<RegisterFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUIStore();

  const onSubmit = async (values: RegisterFormValues) => {
    if (
      !values.password ||
      !values.firstName ||
      !values.lastName ||
      !values.phone ||
      !values.workshopName ||
      !values.workshopAddress
    ) {
      addToast("error", isAr ? "يرجى إكمال جميع الحقول الإجبارية." : "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use provided email or generate a fallback based on phone
      const finalEmail = values.email?.trim() || `${values.phone.replace(/[^0-9]/g, "")}@romad-user.com`;
      
      await registerWithEmail(
        `${values.firstName} ${values.lastName}`.trim(),
        finalEmail,
        values.password,
        values.phone,
        values.workshopName,
        values.workshopAddress
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
          <p className="text-sm font-semibold text-gold mb-2">{isAr ? "انضم إلى رماد ليزر" : "Join Romad Laser"}</p>
          <h1 className="text-3xl font-black text-navy">{isAr ? "إنشاء حساب" : "Create account"}</h1>
          <p className="mt-3 text-text-muted">
            {isAr ? "أنشئ حسابك لتتبع الطلبات وإدارة المفضلة." : "Create an account to track orders and manage your wishlist."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "الاسم الأول" : "First name"}</span>
              <input type="text" {...register("firstName")} className="input mt-2 w-full" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "اسم العائلة" : "Last name"}</span>
              <input type="text" {...register("lastName")} className="input mt-2 w-full" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</span>
            <input type="email" autoComplete="email" {...register("email")} className="input mt-2 w-full" placeholder="example@mail.com" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</span>
              <input type="tel" autoComplete="tel" {...register("phone")} className="input mt-2 w-full" placeholder={isAr ? "01XXXXXXXXX" : "+201XXXXXXXXX"} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-navy">{isAr ? "اسم المصنع/الورشة" : "Factory / Workshop name"}</span>
              <input type="text" {...register("workshopName")} className="input mt-2 w-full" placeholder={isAr ? "اسم الورشة" : "Workshop name"} />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "عنوان المصنع / الورشة" : "Factory / Workshop address"}</span>
            <input type="text" {...register("workshopAddress")} className="input mt-2 w-full" placeholder={isAr ? "الحي، المدينة، المحافظة" : "District, City, Governorate"} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "كلمة المرور" : "Password"}</span>
            <input type="password" autoComplete="new-password" {...register("password")} className="input mt-2 w-full" />
          </label>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
            {isSubmitting ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : isAr ? "إنشاء الحساب" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link href={`/${locale}/auth/login`} className="font-semibold text-gold hover:text-gold-dark">
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </p>
      </div>
    </main>
  );
}

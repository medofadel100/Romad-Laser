"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { use, useState } from "react";
import { sendPasswordReset } from "@/lib/auth";
import { useUIStore } from "@/store/uiStore";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage({ params }: { params: { locale?: string } }) {
  const { locale: routeLocale } = params;
  const locale = routeLocale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUIStore();

  const onSubmit = async (values: FormValues) => {
    if (!values.email) {
      addToast("error", isAr ? "من فضلك ادخل البريد" : "Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(values.email);
      addToast(
        "success",
        isAr ? "تم إرسال رابط إعادة تعيين كلمة المرور" : "Password reset email sent"
      );
      router.push(`/${locale}/auth/login`);
    } catch {
      addToast(
        "error",
        isAr ? "تعذر إرسال البريد. تحقق من البيانات" : "Failed to send email. Please check and try again"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container-romad py-20">
      <div className="mx-auto max-w-lg rounded-[32px] border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold text-gold mb-2">{isAr ? "نسيت كلمة المرور" : "Forgot Password"}</p>
          <h1 className="text-3xl font-black text-navy">{isAr ? "استرجاع الحساب" : "Reset your account"}</h1>
          <p className="mt-3 text-text-muted">
            {isAr
              ? "أدخل البريد الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور."
              : "Enter your email and we’ll send you a password reset link."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "البريد الإلكتروني" : "Email"}</span>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="input mt-2 w-full"
              placeholder={isAr ? "example@mail.com" : "example@mail.com"}
            />
          </label>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
            {isSubmitting
              ? isAr
                ? "جارٍ الإرسال..."
                : "Sending..."
              : isAr
              ? "إرسال الرابط"
              : "Send link"}
          </button>

          <Link
            href={`/${locale}/auth/login`}
            className="btn btn-outline w-full py-3 inline-flex items-center justify-center"
          >
            {isAr ? "عودة لتسجيل الدخول" : "Back to login"}
          </Link>
        </form>
      </div>
    </main>
  );
}


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { use, useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/lib/auth";
import { useUIStore } from "@/store/uiStore";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage({ params }: { params: { locale?: string } }) {
  const { locale: routeLocale } = params;
  const locale = routeLocale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useUIStore();

  const onSubmit = async (values: LoginFormValues) => {
    if (!values.email || !values.password) {
      addToast("error", isAr ? "يرجى إدخال البريد الإلكتروني وكلمة المرور." : "Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(values.email, values.password);
      addToast("success", isAr ? "تم تسجيل الدخول بنجاح" : "Signed in successfully");
      router.push(`/${locale}`);
    } catch (error) {
      addToast("error", isAr ? "فشل تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى." : "Sign in failed. Please check your credentials." );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      addToast("success", isAr ? "تم تسجيل الدخول عبر جوجل" : "Signed in with Google");
      router.push(`/${locale}`);
    } catch (error) {
      addToast("error", isAr ? "فشل تسجيل الدخول عبر جوجل." : "Google sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container-romad py-20">
      <div className="mx-auto max-w-lg rounded-[32px] border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-gold-dark mb-2">{isAr ? "مرحبا بعودتك" : "Welcome Back"}</p>
          <h1 className="text-3xl font-black text-navy">{isAr ? "تسجيل الدخول" : "Sign in"}</h1>
          <p className="mt-3 text-text-muted">
            {isAr ? "سجل دخولك لعرض طلباتك وتحديث حسابك." : "Sign in to view your orders and manage your account."}
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

          <label className="block">
            <span className="text-sm font-semibold text-navy">{isAr ? "كلمة المرور" : "Password"}</span>
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="input mt-2 w-full"
              placeholder={isAr ? "••••••••" : "••••••••"}
            />
          </label>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
            {isSubmitting ? (isAr ? "جارٍ المتابعة..." : "Signing in...") : isAr ? "تسجيل الدخول" : "Sign in"}
          </button>

          <button type="button" disabled={isSubmitting} onClick={handleGoogle} className="btn btn-outline w-full py-3">
            {isAr ? "الدخول عبر جوجل" : "Continue with Google"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted space-y-2">
          <p>
            {isAr ? "لا يوجد حساب؟" : "No account?"}{" "}
            <Link href={`/${locale}/auth/register`} className="font-semibold text-gold-dark hover:text-gold">
              {isAr ? "إنشاء حساب" : "Create one"}
            </Link>
          </p>
          <p>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="font-semibold text-gold-dark hover:text-gold"
            >
              {isAr ? "نسيت كلمة المرور؟" : "Forgot your password?"}
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

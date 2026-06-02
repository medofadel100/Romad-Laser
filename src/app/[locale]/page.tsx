import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyUs from "@/components/home/WhyUs";
import WhatsAppFloat from "@/components/home/WhatsAppFloat";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr
      ? "الرئيسية | رماد ليزر — قطع غيار ماكينات الليزر والـ CNC"
      : "Home | Romad Laser — Laser & CNC Machine Spare Parts",
    description: isAr
      ? "رماد ليزر — متخصصون في توفير قطع غيار ماكينات الليزر والـ CNC وخدمات الصيانة الاحترافية بأفضل الأسعار في مصر."
      : "Romad Laser — Specialists in laser and CNC machine spare parts and professional maintenance services at the best prices in Egypt.",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-navy focus:rounded-lg focus:font-bold"
      >
        {locale === "ar" ? "انتقل للمحتوى" : "Skip to content"}
      </a>

      <HeroSection locale={locale} />
      <CategoryShowcase locale={locale} />
      <FeaturedProducts locale={locale} />
      <WhyUs locale={locale} />
      <WhatsAppFloat />
    </>
  );
}

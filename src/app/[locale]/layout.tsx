import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import ToastContainer from "@/components/ui/Toast";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: {
      default: isAr
        ? "روما ليزر | قطع غيار ماكينات الليزر CO2"
        : "Romaα Laser | Laser & CO2 Machine Spare Parts",
      template: isAr ? "%s | روما ليزر" : "%s | Romaα Laser",
    },
    description: isAr
      ? "متخصصون في قطع غيار ماكينات الليزر CO2 وخدمات الصيانة الاحترافية. أفضل الأسعار وضمان الجودة في مصر."
      : "Specialists in laser and CO2 machine spare parts and professional maintenance services. Best prices and quality guarantee in Egypt.",
    keywords: isAr
      ? ["ليزر", "CO2", "قطع غيار", "صيانة", "مصر", "روما ليزر", "ماكينات"]
      : ["laser", "CO2", "spare parts", "maintenance", "Egypt", "Romaα Laser"],
    authors: [{ name: "Romaα Laser" }],
    creator: "Romaα Laser",
    metadataBase: new URL("https://romalaser.com"),
    openGraph: {
      type: "website",
      locale: isAr ? "ar_EG" : "en_US",
      url: "https://romalaser.com",
      siteName: "Romaα Laser | روما ليزر",
      title: isAr
        ? "روما ليزر | قطع غيار ماكينات الليزر CO2"
        : "Romaα Laser | Laser & CO2 Machine Spare Parts",
      description: isAr
        ? "متخصصون في قطع غيار ماكينات الليزر CO2 وخدمات الصيانة"
        : "Specialists in laser and CO2 machine spare parts and maintenance",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: locale === "ar" ? "/" : "/en",
      languages: {
        ar: "/",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!["ar", "en"].includes(locale)) {
    notFound();
  }

  // Load messages directly (bypasses next-intl plugin config detection)
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const isAr = locale === "ar";

  return (
    <div lang={locale} dir={isAr ? "rtl" : "ltr"} className={isAr ? "font-cairo" : "font-inter"}>
      <AuthProvider>
        <ToastContainer />
        <Header locale={locale} />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer locale={locale} />
        <MobileNav locale={locale} />
      </AuthProvider>
    </div>
  );
}

import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تواصل معنا | روما ليزر" : "Contact Us | Romaα Laser",
    description: isAr 
      ? "تواصل مع فريق روما ليزر للدعم الفني، الاستفسارات، أو طلبات الصيانة."
      : "Contact the Romaα Laser team for technical support, inquiries, or maintenance requests.",
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  
  return <ContactPageClient locale={locale} />;
}

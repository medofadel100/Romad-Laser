import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تواصل معنا | رماد ليزر" : "Contact Us | Romad Laser",
    description: isAr 
      ? "تواصل مع فريق رماد ليزر للدعم الفني، الاستفسارات، أو طلبات الصيانة."
      : "Contact the Romad Laser team for technical support, inquiries, or maintenance requests.",
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  
  return <ContactPageClient locale={locale} />;
}

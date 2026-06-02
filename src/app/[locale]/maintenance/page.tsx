import type { Metadata } from "next";
import MaintenanceRequestClient from "@/components/maintenance/MaintenanceRequestClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "طلب صيانة وزيارة هندسية | رماد ليزر" : "Request Maintenance Visit | Romad Laser",
    description: isAr 
      ? "اطلب زيارة مهندس مختص لتشخيص أعطال ماكينات الليزر والـ CNC وصيانتها بأفضل جودة."
      : "Request a specialist engineer visit for diagnosing and maintaining laser and CNC machines.",
  };
}

export default async function MaintenancePage({ params }: Props) {
  const { locale } = await params;
  return <MaintenanceRequestClient locale={locale} />;
}

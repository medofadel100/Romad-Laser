import type { Metadata } from "next";
import MaintenanceRequestClient from "@/components/maintenance/MaintenanceRequestClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "طلب صيانة وزيارة هندسية | روماد ليزر" : "Request Maintenance Visit | Romaα Laser",
    description: isAr 
      ? "اطلب زيارة مهندس مختص لتشخيص أعطال ماكينات الليزر CO2 وصيانتها بأفضل جودة."
      : "Request a specialist engineer visit for diagnosing and maintaining laser and CO2 machines.",
  };
}

export default async function MaintenancePage({ params }: Props) {
  const { locale } = await params;
  return <MaintenanceRequestClient locale={locale} />;
}

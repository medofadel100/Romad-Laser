import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "سجل مبيعات الصيانة" : "Maintenance Sales History",
    description: isAr ? "عرض مبيعات الصيانة حسب الفترة" : "View maintenance sales with date filtering",
  };
}

export default async function MaintenanceSalesHistoryPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";


  return (
    <main className="container-romad py-8 lg:py-10">
      <div className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-black text-navy">
          {isAr ? "سجل مبيعات الصيانة" : "Maintenance Sales"}
        </h1>
        <p className="text-text-muted mt-3">
          {isAr ? "placeholder: سيتم فلتر حسب الفترة وإظهار المنتجات المستخدمة" : "Placeholder: filter by date and show used items"}
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <Link href={`/${locale}/admin`} className="btn btn-outline">
          {isAr ? "رجوع" : "Back"}
        </Link>

        <div className="mt-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-text-muted">
          • {isAr ? "سيتضمن: Engineer + products + report" : "Will include: Engineer + products + report"}
        </div>
      </div>
    </main>
  );
}


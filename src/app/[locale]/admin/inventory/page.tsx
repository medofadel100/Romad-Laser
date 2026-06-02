import type { Metadata } from "next";
import type { Locale } from "@/types";
import InventoryAdminClient from "@/components/admin/InventoryAdminClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "المخزن" : "Inventory",
    description: isAr ? "أضف وأدِر منتجات المخزن بسهولة" : "Add and manage inventory products easily",
  };
}

export default async function InventoryAdminPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="container-romad py-8 lg:py-10">
      <InventoryAdminClient locale={locale} />
    </main>
  );
}


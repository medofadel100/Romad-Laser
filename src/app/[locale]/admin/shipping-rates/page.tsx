import { getShippingSettings } from "@/lib/firestore.server";
import ShippingRatesAdminClient from "@/components/admin/ShippingRatesAdminClient";

export const metadata = {
  title: "إدارة أسعار الشحن | لوحة الإدارة",
};

export default async function AdminShippingRatesPage({ params: { locale } }: { params: { locale: string } }) {
  const settings = await getShippingSettings();
  
  if (!settings) {
    return <div>Error loading shipping settings.</div>;
  }

  return (
    <div className="container-romad py-10">
      <ShippingRatesAdminClient 
        initialSettings={settings} 
        locale={locale} 
      />
    </div>
  );
}

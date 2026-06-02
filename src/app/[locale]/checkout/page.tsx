"use client";

import { use, useEffect, useState } from "react";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getShippingSettings } from "@/lib/firestore";

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getShippingSettings();
        setShippingSettings(settings);
      } catch (error) {
        console.error("Failed to fetch shipping settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="container-romad py-20 text-center font-black text-navy uppercase tracking-widest">
        {locale === "ar" ? "جارٍ التحميل..." : "Loading Checkout..."}
      </div>
    );
  }

  return (
    <CheckoutPageClient 
      locale={locale} 
      shippingSettings={shippingSettings} 
    />
  );
}

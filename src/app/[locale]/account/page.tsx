import type { Metadata } from "next";
import AccountProfileClient from "@/components/account/AccountProfileClient";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "حسابي | روماد ليزر" : "My Account | Romaα Laser",
    description: isAr
      ? "تصفح لوحة حسابك في روماد ليزر: تحديث بياناتك وطلباتي والمفضلة."
      : "Browse your Romaα Laser account dashboard: update your info, orders, and wishlist.",
    robots: { index: false },
  };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  return <AccountProfileClient locale={locale} />;
}

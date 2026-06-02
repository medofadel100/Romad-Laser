import type { Metadata } from "next";
import AccountProfileClient from "@/components/account/AccountProfileClient";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "حسابي | رماد ليزر" : "My Account | Romad Laser",
    description: isAr
      ? "تصفح لوحة حسابك في رماد ليزر: تحديث بياناتك وطلباتي والمفضلة."
      : "Browse your Romad Laser account dashboard: update your info, orders, and wishlist.",
    robots: { index: false },
  };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  return <AccountProfileClient locale={locale} />;
}

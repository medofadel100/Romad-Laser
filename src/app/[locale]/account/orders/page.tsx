import type { Metadata } from "next";
import AccountOrdersClient from "@/components/account/AccountOrdersClient";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "طلباتي | رماد ليزر" : "My Orders | Romad Laser",
    description: isAr
      ? "عرض وتتبع جميع طلباتك في رماد ليزر"
      : "View and track all your Romad Laser orders",
    robots: { index: false },
  };
}

export default async function AccountOrdersPage({ params }: Props) {
  const { locale } = await params;
  return <AccountOrdersClient locale={locale} />;
}

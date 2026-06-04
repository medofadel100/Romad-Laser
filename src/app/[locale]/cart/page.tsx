import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "السلة | روما ليزر" : "Cart | Romaα Laser",
    description: isAr ? "عرض محتوى سلة التسوق الخاصة بك." : "Review items in your shopping cart.",
  };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  return <CartPageClient locale={locale} />;
}

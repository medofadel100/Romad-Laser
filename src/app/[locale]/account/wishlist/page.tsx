"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWishlistStore } from "@/store/wishlistStore";
import { useMemo } from "react";

interface Props {
  params: { locale: string };
}

export default function WishlistPage({ params }: Props) {
  const isAr = params.locale === "ar";
  const locale = isAr ? "ar" : "en";
  const { user } = useAuth();
  const { items, removeItem, clearWishlist } = useWishlistStore();

  const title = isAr ? "المفضلة" : "Wishlist";
  const emptyMessage = isAr
    ? "قائمة المفضلة فارغة. أضف المنتجات التي تريد حفظها هنا." 
    : "Your wishlist is empty. Save the products you want to keep for later here.";

  const productList = useMemo(
    () =>
      items.map((item) => (
        <li key={item.productId} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={item.image} alt={isAr ? item.name_ar : item.name_en} className="h-20 w-20 rounded-2xl object-cover" />
            <div>
              <p className="text-white font-semibold">{isAr ? item.name_ar : item.name_en}</p>
              <p className="text-sm text-white/60">{item.price.toLocaleString(isAr ? "ar-EG" : "en-EG")} {isAr ? "جنيه" : "EGP"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/shop/product/${item.slug}`} className="btn btn-outline text-sm">
              {isAr ? "عرض" : "View"}
            </Link>
            <button
              onClick={() => removeItem(item.productId, user?.uid)}
              className="btn btn-primary text-sm"
            >
              {isAr ? "إزالة" : "Remove"}
            </button>
          </div>
        </li>
      )),
    [items, isAr, locale, removeItem, user?.uid]
  );

  return (
    <main className="container-romad py-20">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-navy/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl text-white">
          <h1 className="text-4xl font-black mb-3">{title}</h1>
          <p className="text-white/70 mb-6">
            {isAr
              ? "هنا ستجد المنتجات التي أضفتها للمفضلة لتتمكن من الوصول إليها بسرعة لاحقاً."
              : "Here you will find products you saved to your wishlist for fast access later."}
          </p>
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => clearWishlist()}
                className="btn btn-outline"
              >
                {isAr ? "مسح الكل" : "Clear all"}
              </button>
              <Link href={`/${locale}/shop`} className="btn btn-primary">
                {isAr ? "استكمال التسوق" : "Continue shopping"}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {items.length > 0 ? (
            <ul className="space-y-3">{productList}</ul>
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center text-white/70">
              <p className="text-xl font-semibold mb-4">{emptyMessage}</p>
              <Link href={`/${locale}/shop`} className="btn btn-primary">
                {isAr ? "اذهب إلى المتجر" : "Go to shop"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

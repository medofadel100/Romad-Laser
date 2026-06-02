"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface CartPageClientProps {
  locale: any;
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const isAr = locale === "ar";
  const { items, getSubtotal, getTotalItems, removeItem, updateQty, clearCart } = useCartStore();
  const subtotalValue = getSubtotal();
  const totalQuantityValue = getTotalItems();

  if (!items.length) {
    return (
      <main className="container-romad py-16 lg:py-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-2xl font-black text-navy mb-4">
            {isAr ? "سلة التسوق فارغة" : "Your cart is empty"}
          </p>
          <p className="text-text-muted mb-6">
            {isAr
              ? "أضف منتجات من المتجر للمتابعة نحو الدفع"
              : "Add products from the shop to continue to checkout."}
          </p>
          <Link href={`/${locale}/shop`} className="btn btn-primary">
            {isAr ? "تسوق الآن" : "Shop now"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gold font-semibold mb-2">{isAr ? "السلة" : "Shopping Cart"}</p>
          <h1 className="text-3xl lg:text-4xl font-black text-navy">
            {isAr ? "تحقق من منتجاتك" : "Review your items"}
          </h1>
        </div>
        <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-navy">
          <ArrowLeft size={16} />
          {isAr ? "العودة للمتجر" : "Continue shopping"}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-gray-200 bg-white p-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 rounded-3xl overflow-hidden bg-gray-100">
                <Image src={item.image} alt={isAr ? item.name_ar : item.name_en} fill className="object-cover" sizes="112px" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-navy">{isAr ? item.name_ar : item.name_en}</h2>
                <p className="text-sm text-text-muted">{isAr ? "الرقم التعريفي" : "SKU"}: {item.sku}</p>
                {item.size ? (
                  <p className="text-sm text-text-muted mt-1">
                    {isAr ? "المقاس" : "Size"}: {item.size}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                    className="btn btn-ghost rounded-full p-2"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="btn btn-ghost rounded-full p-2"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className="font-black text-gold">{formatPrice(item.salePrice ?? item.price, locale)}</span>
                <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 inline-flex items-center gap-2 text-sm">
                  <Trash2 size={16} />
                  {isAr ? "إزالة" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6">
          <div>
            <p className="text-text-muted">{isAr ? "عدد المنتجات" : "Items"}</p>
            <p className="text-2xl font-black text-navy">{totalQuantityValue}</p>
          </div>
          <div>
            <p className="text-text-muted">{isAr ? "إجمالي السلة" : "Subtotal"}</p>
            <p className="text-3xl font-black text-gold">{formatPrice(subtotalValue, locale)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-text-muted">{isAr ? "شامل الضريبة" : "Includes VAT"}</p>
            <p className="text-sm text-text-muted">
              {isAr ? "قد تختلف تكلفة الشحن حسب الموقع وحجم الشحنة." : "Shipping cost may vary by location and order size."}
            </p>
          </div>

          <Link href={`/${locale}/checkout`} className="btn btn-primary w-full py-3">
            {isAr ? "متابعة الدفع" : "Proceed to checkout"}
          </Link>

          <button type="button" onClick={clearCart} className="btn btn-outline w-full py-3">
            {isAr ? "تفريغ السلة" : "Clear cart"}
          </button>
        </aside>
      </div>
    </main>
  );
}

"use client";

import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  locale: any;
}

export default function CartDrawer({ locale }: CartDrawerProps) {
  const { items, isOpen, closeCart, removeItem, updateQty, getSubtotal, getTotalItems } = useCartStore();
  const { addToast } = useUIStore();

  if (!isOpen) return null;

  const isAr = locale === "ar";
  const subtotal = getSubtotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${isAr ? "left-0" : "right-0"} h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col cart-drawer-enter`}
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? "سلة التسوق" : "Shopping Cart"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-navy" />
            <h2 className="font-bold text-navy text-lg">
              {isAr ? "سلة التسوق" : "Shopping Cart"}
            </h2>
            {getTotalItems() > 0 && (
              <span className="badge badge-navy text-sm">
                {getTotalItems()}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label={isAr ? "إغلاق" : "Close"}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-navy"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart size={64} className="text-gray-200 mb-4" />
              <p className="text-text-muted text-lg font-medium">
                {isAr ? "سلتك فارغة" : "Your cart is empty"}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {isAr ? "أضف بعض المنتجات للبدء" : "Add some products to get started"}
              </p>
              <button
                onClick={closeCart}
                className="btn btn-primary mt-6"
              >
                {isAr ? "ابدأ التسوق" : "Start Shopping"}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name_ar}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${locale}/shop/product/${item.slug}`}
                    onClick={closeCart}
                    className="text-sm font-semibold text-navy hover:text-gold transition-colors line-clamp-2"
                  >
                    {isAr ? item.name_ar : item.name_en}
                  </Link>
                  {item.size ? (
                    <p className="text-xs text-text-muted mt-1">
                      {isAr ? "المقاس" : "Size"}: {item.size}
                    </p>
                  ) : null}
                  <p className="text-gold font-bold text-sm mt-1">
                    {formatPrice(item.salePrice ?? item.price, locale)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-gray-500"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-semibold text-navy w-6 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      disabled={item.qty >= item.stock}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gold hover:text-gold transition-colors text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => {
                    removeItem(item.id);
                    addToast("info", isAr ? "تم حذف المنتج من السلة" : "Item removed from cart");
                  }}
                  aria-label={isAr ? "حذف" : "Remove"}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">
                {isAr ? "المجموع الجزئي" : "Subtotal"}
              </span>
              <span className="font-bold text-navy text-lg">
                {formatPrice(subtotal, locale)}
              </span>
            </div>
            <p className="text-xs text-text-muted text-center">
              {isAr ? "يتم احتساب الشحن عند الدفع" : "Shipping calculated at checkout"}
            </p>
            <Link
              href={`/${locale}/checkout`}
              onClick={closeCart}
              className="btn btn-primary w-full text-center"
            >
              {isAr ? "إتمام الشراء" : "Proceed to Checkout"}
            </Link>
            <Link
              href={`/${locale}/cart`}
              onClick={closeCart}
              className="btn btn-ghost w-full text-center"
            >
              {isAr ? "عرض السلة" : "View Cart"}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  locale: string;
}

export default function MobileNav({ locale }: MobileNavProps) {
  const pathname = usePathname();
  const { getTotalItems, toggleCart } = useCartStore();
  const isAr = locale === "ar";
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const totalItems = isMounted ? getTotalItems() : 0;

  const navItems = [
    {
      href: `/${locale}`,
      label_ar: "الرئيسية",
      label_en: "Home",
      icon: Home,
      isExact: true,
    },
    {
      href: `/${locale}/shop`,
      label_ar: "المتجر",
      label_en: "Shop",
      icon: ShoppingBag,
      isExact: false,
    },
    {
      href: null, // Cart is a drawer, not a page
      label_ar: "السلة",
      label_en: "Cart",
      icon: ShoppingCart,
      isExact: false,
      isCart: true,
    },
    {
      href: `/${locale}/account`,
      label_ar: "حسابي",
      label_en: "Account",
      icon: User,
      isExact: false,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-lg"
      aria-label={isAr ? "التنقل السريع" : "Quick Navigation"}
    >
      {/* Safe area for notch */}
      <div className="flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href
            ? item.isExact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== `/${locale}`
            : false;

          if (item.isCart) {
            return (
              <button
                key="cart"
                onClick={toggleCart}
                aria-label={isAr ? `السلة (${totalItems} منتجات)` : `Cart (${totalItems} items)`}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative transition-colors text-text-muted hover:text-navy"
              >
                <div className="relative">
                  <Icon size={22} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-navy-deep text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{isAr ? item.label_ar : item.label_en}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
                isActive ? "text-navy" : "text-text-muted hover:text-navy"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-xs font-medium", isActive && "font-bold")}>
                {isAr ? item.label_ar : item.label_en}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

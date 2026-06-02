"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCardHome from "@/components/products/ProductCardHome";
import type { Product } from "@/types";

interface FeaturedProductsClientProps {
  locale: string;
  initialProducts: Product[];
}

// Skeleton loader
function ProductSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group">
      <div className="aspect-square bg-white/5 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
        <div className="h-10 bg-white/5 rounded-2xl w-full animate-pulse mt-4" />
      </div>
    </div>
  );
}

export default function FeaturedProductsClient({ locale, initialProducts }: FeaturedProductsClientProps) {
  const isAr = locale === "ar";
  const [products] = useState<Product[]>(initialProducts);

  if (products.length === 0) return null;

  return (
    <section className="bg-[#0A0F1A] py-20 lg:py-28 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-laser/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container-romad relative z-10">
        {/* Header - DRAMATIC RE-DESIGN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-2 w-2 rounded-full bg-laser animate-ping" />
              <div className="px-3 py-1 rounded-md bg-laser/10 border border-laser/20 text-laser text-[10px] font-black uppercase tracking-[0.2em]">
                {isAr ? "منتجات حصرية" : "Exclusive Drops"}
              </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              <span className="block text-white mb-2">{isAr ? "اكتشف" : "Discover"}</span>
              <span className="hero-title block drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                {isAr ? "اختياراتنا المميزة" : "Our Top Picks"}
              </span>
            </h2>
            
            <div className="flex items-center gap-4">
              <div className="h-1 w-20 bg-gradient-to-r from-gold to-transparent rounded-full" />
              <p className="text-white/50 text-sm font-medium tracking-wide">
                {isAr ? "أفضل ما نقدمه من جودة وأداء" : "The peak of quality and performance"}
              </p>
            </div>
          </div>

          <Link 
            href={`/${locale}/shop`} 
            className="group flex items-center gap-4 p-2 pe-6 rounded-full bg-white/5 border border-white/10 hover:border-gold/50 transition-all duration-500 hover:bg-white/10"
          >
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-navy shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
              <ArrowLeft size={20} className={isAr ? "rotate-180" : ""} />
            </div>
            <span className="text-white font-bold text-sm">{isAr ? "عرض كل المنتجات" : "View Full Catalog"}</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product) => (
            <ProductCardHome key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

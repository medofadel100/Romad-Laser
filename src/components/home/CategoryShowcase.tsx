"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/firestore";
import type { Category } from "@/types";

// Fallback categories if Firestore is empty
const fallbackCategories = [
  { id: "laser-machine", slug: "laser-machine", name_ar: "ماكينة الليزر", name_en: "Laser Machine", productCount: 0, parent: null, order: 1, image: undefined },
  { id: "cnc-machine", slug: "cnc-machine", name_ar: "ماكينة CNC", name_en: "CNC Machine", productCount: 0, parent: null, order: 2, image: undefined },
  { id: "spare-parts", slug: "spare-parts", name_ar: "قطع الغيار", name_en: "Spare Parts", productCount: 0, parent: null, order: 3, image: undefined },
  { id: "accessories", slug: "accessories", name_ar: "إكسسوارات", name_en: "Accessories", productCount: 0, parent: null, order: 4, image: undefined },
];

// Category gradient backgrounds for visual interest
const categoryColors = [
  "from-navy to-navy-light",
  "from-[#2D4A6E] to-navy",
  "from-navy-deep to-navy",
  "from-[#1E3A5F] to-navy-light",
];

interface CategoryShowcaseProps {
  locale: string;
}

export default function CategoryShowcase({ locale }: CategoryShowcaseProps) {
  const isAr = locale === "ar";
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats.filter((c) => !c.parent).slice(0, 6)))
      .catch(() => setCategories(fallbackCategories as Category[]));
  }, []);

  const displayCategories = categories.length > 0 ? categories : fallbackCategories as Category[];

  return (
    <section className="section-alt py-16 lg:py-20">
      <div className="container-romad">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gold-pale text-gold text-sm font-semibold mb-3">
            {isAr ? "تصفح حسب التصنيف" : "Browse by Category"}
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-navy mb-3">
            {isAr ? "اعثر على ما تحتاجه بسهولة" : "Find What You Need Easily"}
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            {isAr
              ? "تصفح منتجاتنا حسب التصنيف واعثر على قطع الغيار التي تناسب ماكينتك"
              : "Browse our products by category and find the spare parts that fit your machine"}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/${locale}/shop/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br text-white transition-transform duration-300 hover:-translate-y-1 product-card-hover"
              style={{ background: `linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)` }}
            >
              {/* Background Image if available */}
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={isAr ? cat.name_ar : cat.name_en}
                  fill
                  className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}

              {/* Laser accent line */}
              <div className="absolute top-0 start-0 end-0 h-0.5 bg-gradient-to-r from-transparent via-laser/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Gold corner accent */}
              <div className="absolute top-3 end-3 w-2 h-2 rounded-full bg-gold opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                  <span className="text-2xl" aria-hidden="true">
                    {i === 0 ? "⚡" : i === 1 ? "🔧" : i === 2 ? "⚙️" : "🔩"}
                  </span>
                </div>
                <h3 className="font-bold text-base lg:text-lg leading-tight mb-1">
                  {isAr ? cat.name_ar : cat.name_en}
                </h3>
                {cat.productCount > 0 && (
                  <span className="text-white/60 text-xs">
                    {cat.productCount} {isAr ? "منتج" : "products"}
                  </span>
                )}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 text-gold text-sm font-medium">
                  {isAr ? "تصفح" : "Browse"}
                  <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <Link href={`/${locale}/shop`} className="btn btn-ghost gap-2">
            {isAr ? "عرض جميع التصنيفات" : "View All Categories"}
            <ArrowLeft size={16} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>
      </div>
    </section>
  );
}

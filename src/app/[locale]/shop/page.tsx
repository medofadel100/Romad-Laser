import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories, getAllProducts } from "@/lib/firestore.server";
import type { Category } from "@/types";
import ShopFiltersClient from "@/components/shop/ShopFiltersClient";
import type { ProductPreview } from "@/components/products/ProductCard";

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "المتجر | رماد ليزر" : "Shop | Romad Laser",
    description: isAr
      ? "تصفح جميع منتجات الليزر وقطع الغيار والـ CNC في متجر رماد ليزر"
      : "Browse laser, CNC and spare parts in the Romad Laser shop.",
  };
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const categories = await getCategories();
  const products = (await getAllProducts()).map((product) => ({
    id: product.id,
    slug: product.slug,
    name_ar: product.name_ar,
    name_en: product.name_en,
    description_ar: product.description_ar,
    description_en: product.description_en,
    price: product.price,
    salePrice: product.salePrice,
    categories: product.categories,
    images: product.images,
    stock: product.stock,
    sku: product.sku,
    specs: product.specs,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    rating: product.rating,
    reviewCount: product.reviewCount,
    tags: product.tags,
    sizes: product.sizes,
  } as ProductPreview));

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="flex flex-col gap-3 mb-12">
        <Link href={`/${locale}`} className="text-sm text-text-muted hover:text-navy inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          {isAr ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <div>
          <p className="inline-block px-4 py-1 rounded-full bg-gold-pale text-gold text-sm font-semibold mb-3">
            {isAr ? "المتجر" : "Shop"}
          </p>
          <h1 className="text-3xl lg:text-4xl font-black text-navy">
            {isAr ? "اكتشف أفضل قطع الليزر وقطع الغيار" : "Discover the best laser and CNC spare parts"}
          </h1>
          <p className="text-text-muted max-w-2xl mt-3">
            {isAr
              ? "تصفح مجموعتنا الكاملة من المنتجات وفلتر حسب التصنيف للاختيار بسهولة."
              : "Browse our full catalog and filter by category to find the right product fast."}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <ShopFiltersClient locale={locale} categories={categories} products={products} />
      </div>
    </main>
  );
}

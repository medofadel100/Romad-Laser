import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/firestore.server";
import ProductCard, { ProductPreview } from "@/components/products/ProductCard";

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string };
  searchParams: { q?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "بحث المنتجات | روماد ليزر" : "Search products | Romaα Laser",
    description: isAr
      ? "ابحث عن جميع منتجات الليزر وقطع الغيار في متجر روماد ليزر"
      : "Search the full range of laser and CO2 products in the Romaα Laser shop.",
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sParams = await searchParams;
  const isAr = locale === "ar";
  const query = sParams.q?.trim() ?? "";
  const products = query ? (await searchProducts(query)).map((product) => ({
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
  } as ProductPreview)) : [];

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-navy mb-3">
          {isAr ? "نتائج البحث" : "Search Results"}
        </h1>
        <p className="text-text-muted max-w-2xl">
          {isAr
            ? query
              ? `نتائج البحث عن: ${query}`
              : "أدخل عبارة للبحث عن المنتجات"
            : query
            ? `Results for: ${query}`
            : "Enter a search phrase to find products."}
        </p>
      </div>

      {query ? (
        products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-navy">
              {isAr ? "لم يتم العثور على منتجات" : "No products found"}
            </p>
            <Link href={`/${locale}/shop`} className="mt-5 inline-flex btn btn-outline">
              {isAr ? "العودة إلى المتجر" : "Back to shop"}
            </Link>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-navy">
            {isAr ? "ابدأ البحث الآن" : "Start searching now"}
          </p>
          <p className="text-text-muted mt-2">
            {isAr ? "اكتب اسم المنتج أو الموديل للعثور عليه بسرعة" : "Type a product name or model to find it quickly."}
          </p>
        </div>
      )}
    </main>
  );
}

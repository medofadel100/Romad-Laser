import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategoryBySlug, getProducts } from "@/lib/firestore.server";
import ProductCard, { ProductPreview } from "@/components/products/ProductCard";
import type { Product } from "@/types";

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string; category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const isAr = locale === "ar";
  const category = await getCategoryBySlug(categorySlug);

  return {
    title: category
      ? isAr
        ? `${category.name_ar} | متجر روما ليزر`
        : `${category.name_en} | Romaα Laser Shop`
      : isAr
      ? "التصنيف | روما ليزر"
      : "Category | Romaα Laser",
  };
}

export default async function CategoryShopPage({ params }: Props) {
  const { locale, category: categorySlug } = await params;
  const isAr = locale === "ar";

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const products = (await getProducts(category.id)).products.map((product) => ({
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
  } as ProductPreview));

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="mb-10">
        <Link href={`/${locale}/shop`} className="text-sm text-text-muted hover:text-navy inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          {isAr ? "العودة إلى المتجر" : "Back to shop"}
        </Link>
      </div>

      <header className="mb-8">
        <p className="text-gold font-semibold mb-2">{isAr ? category.name_ar : category.name_en}</p>
        <h1 className="text-3xl lg:text-4xl font-black text-navy">
          {isAr
            ? `منتجات ${category.name_ar}`
            : `${category.name_en} Products`}
        </h1>
        <p className="max-w-2xl mt-3 text-text-muted">
          {isAr
            ? "اكتشف منتجات مختارة ضمن هذا التصنيف بعناية لتلبية احتياجات أعمال الليزر والـ CO2."
            : "Discover carefully selected products in this category for laser and CO2 applications."}
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </main>
  );
}

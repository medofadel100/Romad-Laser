import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/firestore.server";
import ProductDetailClient, { ProductPreview } from "@/components/products/ProductDetailClient";
import type { Product } from "@/types";

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  const isAr = locale === "ar";

  if (!product) {
    return {
      title: isAr ? "المنتج غير موجود | رماد ليزر" : "Product not found | Romad Laser",
    };
  }

  return {
    title: isAr ? product.name_ar : product.name_en,
    description: isAr ? product.description_ar : product.description_en,
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  // Fetch related products from the same category
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => 
      p.id !== product.id && 
      p.categories.some(catId => product.categories.includes(catId))
    )
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name_ar: p.name_ar,
      name_en: p.name_en,
      price: p.price,
      salePrice: p.salePrice,
      categories: p.categories,
      images: p.images,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      sizes: p.sizes,
    } as ProductPreview));

  const serializedProduct: ProductPreview = {
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
  };


  return <ProductDetailClient product={serializedProduct} relatedProducts={related} locale={locale} />;
}


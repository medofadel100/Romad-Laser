import FeaturedProductsClient from "@/components/home/FeaturedProductsClient";
import { getFeaturedProducts } from "@/lib/firestore.server";

interface FeaturedProductsProps {
  locale: string;
}

export default async function FeaturedProducts({ locale }: FeaturedProductsProps) {
  const products = await getFeaturedProducts(8);
  
  // Serialize products (handle Firestore Timestamps)
  const serializedProducts = products.map(p => ({
    ...p,
    createdAt: p.createdAt ? (typeof p.createdAt.toDate === 'function' ? p.createdAt.toDate().toISOString() : p.createdAt) : null,
    updatedAt: p.updatedAt ? (typeof p.updatedAt.toDate === 'function' ? p.updatedAt.toDate().toISOString() : p.updatedAt) : null,
  }));

  return (
    <FeaturedProductsClient 
      locale={locale} 
      initialProducts={serializedProducts as any} 
    />
  );
}

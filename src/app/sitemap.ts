import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/firestore.server";

const BASE_URL = "https://romadlaser.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    // Arabic (default)
    { url: `${BASE_URL}/ar`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/ar/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/ar/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/ar/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    // English
    { url: `${BASE_URL}/en`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/en/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/en/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/en/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const { products } = await getProducts();
    productPages = products.flatMap((product) => [
      {
        url: `${BASE_URL}/ar/shop/product/${product.slug}`,
        lastModified: product.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/en/shop/product/${product.slug}`,
        lastModified: product.updatedAt?.toDate?.() ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    const categories = await getCategories();
    categoryPages = categories.flatMap((cat) => [
      {
        url: `${BASE_URL}/ar/shop/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/en/shop/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ]);
  } catch {
    // Firebase not available during build — skip dynamic pages
  }

  return [...staticPages, ...categoryPages, ...productPages];
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Category } from "@/types";
import ProductCard, { ProductPreview } from "@/components/products/ProductCard";

interface ShopFiltersClientProps {
  locale: string;
  categories: Category[];
  products: ProductPreview[];
}

export default function ShopFiltersClient({ locale, categories, products }: ShopFiltersClientProps) {
  const isAr = locale === "ar";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setFeaturedOnly(false);
  };

  const priceBounds = useMemo(() => {
    const allPrices = products.map((product) => product.salePrice ?? product.price);
    return {
      min: allPrices.length ? Math.min(...allPrices) : 0,
      max: allPrices.length ? Math.max(...allPrices) : 0,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const min = Number(minPrice);
    const max = Number(maxPrice);

    return products.filter((product) => {
      const productPrice = product.salePrice ?? product.price;
      const matchesCategory =
        selectedCategories.length === 0 ||
        product.categories.some((id) => selectedCategories.includes(id));

      const matchesTerm =
        !term ||
        product.name_ar.toLowerCase().includes(term) ||
        product.name_en.toLowerCase().includes(term) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(term));

      const matchesPrice =
        (!minPrice || productPrice >= min) &&
        (!maxPrice || productPrice <= max);

      const matchesStock = !inStockOnly || product.stock > 0;
      const matchesSale = !onSaleOnly || Boolean(product.salePrice && product.salePrice < product.price);
      const matchesFeatured = !featuredOnly || product.isFeatured;

      return (
        matchesCategory &&
        matchesTerm &&
        matchesPrice &&
        matchesStock &&
        matchesSale &&
        matchesFeatured
      );
    });
  }, [products, selectedCategories, searchTerm, minPrice, maxPrice, inStockOnly, onSaleOnly, featuredOnly]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-navy">{isAr ? "فلتر المنتجات" : "Product filters"}</h2>
              <p className="text-sm text-text-muted mt-1">
                {isAr
                  ? "استخدم الفلاتر لتضييق البحث حسب السعر والكمية والعروض والتصنيفات."
                  : "Use filters to narrow the search by price, availability, sale items and categories."}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-navy"
            >
              {isAr ? "مسح الكل" : "Clear all"}
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={isAr ? "بحث في المنتجات..." : "Search products..."}
              className="input w-full"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-navy">{isAr ? "السعر الأدنى" : "Min price"}</span>
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder={isAr ? `من ${formatPrice(priceBounds.min, locale)}` : `From ${formatPrice(priceBounds.min, locale)}`}
                  className="input w-full"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-navy">{isAr ? "السعر الأقصى" : "Max price"}</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder={isAr ? `إلى ${formatPrice(priceBounds.max, locale)}` : `Up to ${formatPrice(priceBounds.max, locale)}`}
                  className="input w-full"
                />
              </label>
            </div>

            <div className="grid gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm cursor-pointer hover:bg-gold/5 transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => setInStockOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-navy font-bold">{isAr ? "المتوفر في المخزن فقط" : "In stock only"}</span>
              </label>
              
              <label className="flex items-center gap-3 rounded-2xl border-2 border-gold/30 bg-gold/5 px-4 py-3 text-sm cursor-pointer hover:bg-gold/10 transition-colors">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={(event) => setOnSaleOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-navy font-black">{isAr ? "الخصومات والعروض فقط" : "Discounts & Offers only"}</span>
              </label>
            </div>

            <div className="grid gap-2">
              {categories.map((category) => {
                return (
                  <Link
                    key={category.id}
                    href={`/${locale}/shop/${category.slug}`}
                    className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-bold text-navy transition-all hover:border-gold hover:bg-gold/5"
                  >
                    {isAr ? category.name_ar : category.name_en}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy mb-4">{isAr ? "التصنيفات المتاحة" : "Available categories"}</h3>
          <div className="grid gap-2 text-sm text-text-muted">
            {categories.map((category) => (
              <span key={category.id} className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2">
                {isAr ? category.name_ar : category.name_en}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-text-muted">
              {filteredProducts.length} {isAr ? "منتج" : "products"}
            </p>
            {selectedCategories.length > 0 && (
              <p className="text-sm text-navy">
                {isAr ? "مفلتر حسب:" : "Filtered by:"}{" "}
                {selectedCategories
                  .map((id) => categories.find((cat) => cat.id === id))
                  .filter(Boolean)
                  .map((cat) => (isAr ? cat!.name_ar : cat!.name_en))
                  .join(", ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((id) => {
              const category = categories.find((cat) => cat.id === id);
              if (!category) return null;
              return (
                <span key={id} className="rounded-full bg-gold-pale px-3 py-2 text-xs font-medium text-gold">
                  {isAr ? category.name_ar : category.name_en}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-text-muted">
              {isAr ? "لا توجد منتجات مطابقة." : "No matching products found."}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

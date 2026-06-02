"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, ArrowLeft, Layers } from "lucide-react";
import ProductCard from "./ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export type ProductPreview = Omit<Product, "createdAt" | "updatedAt">;

interface ProductDetailClientProps {
  product: ProductPreview;
  relatedProducts: ProductPreview[];
  locale: any;
}

export default function ProductDetailClient({ product, relatedProducts, locale }: ProductDetailClientProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const selectedSize = product.sizes?.[selectedSizeIndex];
  const displayPrice = selectedSize ? selectedSize.salePrice ?? selectedSize.price : product.salePrice ?? product.price;
  const originalPrice = selectedSize
    ? selectedSize.salePrice && selectedSize.salePrice < selectedSize.price
      ? selectedSize.price
      : undefined
    : product.salePrice && product.salePrice < product.price
    ? product.price
    : undefined;
  const isSizeDiscounted = Boolean(selectedSize?.salePrice && selectedSize.salePrice < selectedSize.price);
  const isDiscounted = isSizeDiscounted || Boolean(!selectedSize && product.salePrice && product.salePrice < product.price);
  const { addItem, clearCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addToast } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const inWishlist = isMounted ? isInWishlist(product.id) : false;
  const images = product.images.length ? product.images : [{ url: "/images/logo.png", publicId: "", alt: isAr ? product.name_ar : product.name_en }];

  const handleAddToCart = () => {
    const itemId = selectedSize?.label ? `${product.id}:${selectedSize.label}` : product.id;

    addItem({
      id: itemId,
      productId: product.id,
      size: selectedSize?.label,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: selectedSize?.price ?? product.price,
      salePrice: selectedSize?.salePrice ?? product.salePrice,
      image: images[activeImage].url,
      slug: product.slug,
      sku: product.sku,
      stock: product.stock,
      qty: 1,
    });
    addToast("success", isAr ? "تم إضافة المنتج للسلة ✓" : "Added to cart ✓");
  };

  const handleBuyNow = () => {
    const itemId = selectedSize?.label ? `${product.id}:${selectedSize.label}` : product.id;
    
    // Clear cart and add only this item for direct checkout
    clearCart();
    addItem({
      id: itemId,
      productId: product.id,
      size: selectedSize?.label,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: selectedSize?.price ?? product.price,
      salePrice: selectedSize?.salePrice ?? product.salePrice,
      image: images[activeImage].url,
      slug: product.slug,
      sku: product.sku,
      stock: product.stock,
      qty: 1,
    });
    
    router.push(`/${locale}/checkout`);
  };

  const handleWishlist = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
      addToast("info", isAr ? "تم الإزالة من المفضلة" : "Removed from wishlist");
      return;
    }

    await addToWishlist(
      {
        productId: product.id,
        name_ar: product.name_ar,
        name_en: product.name_en,
        price: product.price,
        salePrice: product.salePrice,
        image: images[0].url,
        slug: product.slug,
      },
      undefined
    );
    addToast("success", isAr ? "تم الإضافة للمفضلة ♥" : "Added to wishlist ♥");
  };

  return (
    <section className="container-romad py-16 lg:py-20">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={images[activeImage].url}
                alt={images[activeImage].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.map((img, index) => (
              <button
                key={img.url + index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`group rounded-2xl overflow-hidden border ${activeImage === index ? "border-gold" : "border-gray-200"} bg-white`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/shop`} className="text-sm text-text-muted hover:text-gold transition-colors inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              {isAr ? "العودة إلى المتجر" : "Back to shop"}
            </Link>

            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-white bg-gold-pale text-gold rounded-full px-3 py-1 font-semibold w-fit">
                {product.categories[0] || (isAr ? "عام" : "General")}
              </span>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                {isAr ? product.name_ar : product.name_en}
              </h1>
              <p className="text-text-muted leading-relaxed">
                {isAr ? product.description_ar : product.description_en}
              </p>

              <div className="flex items-center gap-3">
                <div className="text-4xl font-black text-gold">
                  {formatPrice(displayPrice, locale)}
                </div>
                {originalPrice && (
                  <div className="text-text-muted line-through">
                    {formatPrice(originalPrice, locale)}
                  </div>
                )}
              </div>
            </div>

            {product.sizes?.length ? (

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-2">
                <h2 className="font-bold text-white text-lg mb-4">
                  {isAr ? "المقاسات والأسعار المتاحة" : "Available Sizes & Prices"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.sizes.map((size, index) => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSelectedSizeIndex(index)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-300 ${
                        selectedSizeIndex === index
                          ? "border-gold bg-gold/10 ring-1 ring-gold"
                          : "border-white/10 bg-white/5 hover:border-gold/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-bold text-sm ${selectedSizeIndex === index ? "text-gold" : "text-white"}`}>
                          {size.label}
                        </p>
                        <div className="text-end">
                          <p className="font-black text-gold text-sm">
                            {formatPrice(size.salePrice ?? size.price, locale)}
                          </p>
                          {size.salePrice && size.salePrice < size.price && (
                            <p className="text-white/40 line-through text-[10px]">
                              {formatPrice(size.price, locale)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn btn-primary px-8 py-3.5 flex-1 sm:flex-none min-w-[160px]"
              >
                <Layers size={18} />
                {isAr ? "اشتري الآن" : "Buy Now"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn btn-secondary px-8 py-3.5 flex-1 sm:flex-none border-white/20 hover:border-gold transition-colors"
              >
                <ShoppingCart size={18} />
                {isAr ? "أضف للسلة" : "Add to cart"}
              </button>
              <button
                onClick={handleWishlist}
                type="button"
                className="btn btn-ghost-white p-3.5 rounded-2xl border border-white/10 hover:border-gold hover:bg-gold/10 transition-all"
              >
                <Heart size={20} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 bg-white border border-gray-200 rounded-3xl p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">{isAr ? "حالة المخزون" : "Stock Status"}</span>
              {product.stock > 0 ? (
                <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs">
                  {isAr ? `باقي آخر ${product.stock} قطع` : `Only ${product.stock} left`}
                </span>
              ) : (
                <span className="font-black text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs">
                  {isAr ? "نفد من المخزن" : "Out of stock"}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{isAr ? "SKU" : "SKU"}</span>
              <span>{product.sku}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{isAr ? "التقييم" : "Rating"}</span>
              <span className="inline-flex items-center gap-1">
                <Star size={14} className="text-gold" /> {product.rating || 0}
                <span className="text-xs text-text-muted">({product.reviewCount})</span>
              </span>
            </div>
          </div>


          <div className="bg-white border border-gray-200 rounded-3xl p-6">
            <h2 className="font-bold text-navy text-lg mb-4">
              {isAr ? "المواصفات" : "Specifications"}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              {product.specs || (isAr ? "لا توجد مواصفات فنية مضافة." : "No technical specifications added.")}
            </p>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gold-pale flex items-center justify-center">
              <Layers size={20} className="text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {isAr ? "منتجات ذات صلة" : "Related Products"}
              </h2>
              <p className="text-text-muted text-sm">
                {isAr ? "قد يعجبك أيضاً هذه المنتجات من نفس التصنيف" : "You might also like these products from the same category"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

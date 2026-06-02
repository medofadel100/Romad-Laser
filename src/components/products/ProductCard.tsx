"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types";

export type ProductPreview = Omit<Product, "createdAt" | "updatedAt">;

interface ProductCardProps {
  product: ProductPreview;
  locale: any;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const isAr = locale === "ar";
  const { addItem } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addToast } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  const inWishlist = isMounted ? isInWishlist(product.id) : false;
  const isDiscounted = Boolean(product.salePrice && product.salePrice < product.price);
  const mainImage = product.images[0]?.url || "/images/logo.png";

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price: product.price,
      salePrice: product.salePrice,
      image: mainImage,
      slug: product.slug,
      sku: product.sku,
      stock: product.stock,
      qty: 1,
    });
    addToast("success", isAr ? "تم إضافة المنتج للسلة ✓" : "Added to cart ✓");
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
        image: mainImage,
        slug: product.slug,
      },
      undefined
    );
    addToast("success", isAr ? "تم الإضافة للمفضلة ♥" : "Added to wishlist ♥");
  };

  return (
    <div className="card product-card-hover group relative flex flex-col">
      <Link
        href={`/${locale}/shop/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-50"
      >
        <Image
          src={mainImage}
          alt={isAr ? product.name_ar : product.name_en}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {isDiscounted && (
            <span className="badge badge-sale">
              -{getDiscountPercentage(product.price, product.salePrice!)}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-700 text-white text-xs">
              {isAr ? "نفد" : "Out"}
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-navy text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Eye size={14} />
            {isAr ? "عرض سريع" : "Quick View"}
          </span>
        </div>
      </Link>

      <button
        onClick={handleWishlist}
        aria-label={
          inWishlist
            ? isAr
              ? "إزالة من المفضلة"
              : "Remove from wishlist"
            : isAr
            ? "أضف للمفضلة"
            : "Add to wishlist"
        }
        className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <Heart
          size={15}
          className={inWishlist ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-400"}
        />
      </button>

      <div className="p-4 flex flex-col flex-1">
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={13} className="text-gold fill-gold" />
            <span className="text-sm font-medium text-white">{product.rating}</span>
            <span className="text-xs text-text-muted">({product.reviewCount})</span>
          </div>
        )}

        <Link href={`/${locale}/shop/product/${product.slug}`}>
          <h3 className="font-bold text-white text-sm leading-snug mb-2 line-clamp-2 hover:text-gold transition-colors">
            {isAr ? product.name_ar : product.name_en}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-auto mb-1">
          <span className="font-black text-gold text-base">
            {formatPrice(product.salePrice ?? product.price, locale)}
          </span>
          {isDiscounted && (
            <span className="text-text-muted text-xs line-through">
              {formatPrice(product.price, locale)}
            </span>
          )}
          {product.sizes && product.sizes.length > 1 && (
            <span className="ms-auto text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {isAr ? "خيارات متعددة" : "More Options"}
            </span>
          )}
        </div>

        {/* Stock Count Indicator */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-3 rounded-full ${i < (product.stock > 5 ? 5 : product.stock) ? 'bg-green-500' : 'bg-gray-700'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                {isAr ? `باقي آخر ${product.stock}` : `Only ${product.stock} left`}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
              {isAr ? "نفد من المخزن" : "Out of stock"}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn btn-primary w-full text-sm py-2.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {product.stock === 0
            ? isAr
              ? "نفد المخزون"
              : "Out of Stock"
            : isAr
            ? "أضف للسلة"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

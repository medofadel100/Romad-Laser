"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardHomeProps {
  product: Product;
  locale: string;
}

export default function ProductCardHome({ product, locale }: ProductCardHomeProps) {
  const isAr = locale === "ar";
  const { addItem } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addToast } = useUIStore();
  const inWishlist = isInWishlist(product.id);
  const isDiscounted = product.salePrice && product.salePrice < product.price;
  const mainImage = product.images[0]?.url || "/images/logo.png";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      addToast("info", isAr ? "تم الإزالة من المفضلة" : "Removed from wishlist");
    } else {
      addToWishlist({
        productId: product.id,
        name_ar: product.name_ar,
        name_en: product.name_en,
        price: product.price,
        salePrice: product.salePrice,
        image: mainImage,
        slug: product.slug,
      });
      addToast("success", isAr ? "تم الإضافة للمفضلة ♥" : "Added to wishlist ♥");
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group relative flex flex-col hover:border-gold/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {/* Image */}
      <Link href={`/${locale}/shop/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-navy-deep/50">
        <Image
          src={mainImage}
          alt={isAr ? product.name_ar : product.name_en}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-4 start-4 flex flex-col gap-2">
          {isDiscounted && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              -{getDiscountPercentage(product.price, product.salePrice!)}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-800/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
              {isAr ? "نفد" : "Out"}
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        type="button"
        onClick={handleWishlist}
        className="absolute top-4 end-4 w-9 h-9 rounded-full bg-navy/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all z-10 group/wish"
      >
        <Heart
          size={16}
          className={cn("transition-all", inWishlist ? "text-red-500 fill-red-500" : "text-white group-hover/wish:text-navy")}
        />
      </button>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={12} className="text-gold fill-gold" />
            <span className="text-xs font-bold text-white/90">{product.rating}</span>
          </div>
        )}

        {/* Name */}
        <Link href={`/${locale}/shop/product/${product.slug}`}>
          <h3 className="font-bold text-white text-sm leading-snug mb-3 line-clamp-2 hover:text-gold transition-colors min-h-[40px]">
            {isAr ? product.name_ar : product.name_en}
          </h3>
        </Link>

        {/* Price & Stock */}
        <div className="flex items-center justify-between gap-2 mt-auto mb-5">
          <div className="flex items-center gap-2">
            <span className="font-black text-gold text-lg">
              {formatPrice(product.salePrice ?? product.price, locale)}
            </span>
            {isDiscounted && (
              <span className="text-white/30 text-[10px] line-through">
                {formatPrice(product.price, locale)}
              </span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md animate-pulse">
              {isAr ? `باقي ${product.stock}` : `${product.stock} left`}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-gold hover:text-navy hover:border-gold transition-all duration-300 disabled:opacity-20"
        >
          <ShoppingCart size={14} />
          {product.stock === 0
            ? (isAr ? "نفد المخزون" : "Out of Stock")
            : (isAr ? "أضف للسلة" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}

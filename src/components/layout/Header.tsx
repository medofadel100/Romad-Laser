"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Search, Heart, User, Menu, X, Globe, LogOut, Settings, Package,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import CartDrawer from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label_ar: "الرئيسية", label_en: "Home" },
  { href: "/shop", label_ar: "المتجر", label_en: "Shop" },
  { href: "/maintenance", label_ar: "طلب صيانة", label_en: "Maintenance" },
  { href: "/about", label_ar: "من نحن", label_en: "About" },
  { href: "/contact", label_ar: "تواصل معنا", label_en: "Contact" },
];

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const safeLocale = locale === "en" ? "en" : "ar";
  const isAr = safeLocale === "ar";
  const router = useRouter();
  const { getTotalItems, toggleCart } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, addToast } = useUIStore();
  const { user, userData, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll detection (throttled to reduce re-renders)
  useEffect(() => {
    let rafId: number | null = null;
    let lastValue = false;

    const update = () => {
      rafId = null;
      const nextValue = window.scrollY > 20;
      if (nextValue !== lastValue) {
        lastValue = nextValue;
        setIsScrolled(nextValue);
      }
    };

    const handleScroll = () => {
      if (rafId == null) rafId = window.requestAnimationFrame(update);
    };

    // initialize
    update();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);


  // Click outside + keyboard to close user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${safeLocale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      closeMobileMenu();
    }
  };

  const pathname = usePathname();

  const handleLanguageToggle = () => {
    const newLocale = isAr ? "en" : "ar";

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    const currentPath = pathname || "/";
    const strippedPath = currentPath.replace(/^\/(?:ar|en)/, "");
    const normalizedPath = strippedPath
      .replace(/\/undefined\/|\/undefined$/g, "")
      .replace(/^\//, "");
    const targetPath = normalizedPath ? `/${newLocale}/${normalizedPath}` : `/${newLocale}`;

    router.push(targetPath);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast("success", isAr ? "تم تسجيل الخروج بنجاح" : "Signed out successfully");
      router.push(`/${safeLocale}`);
    } catch {
      addToast("error", isAr ? "حدث خطأ أثناء تسجيل الخروج" : "Sign out failed");
    }
    setIsUserMenuOpen(false);
  };

  const totalItems = getTotalItems();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          isScrolled
            ? "bg-navy shadow-lg shadow-navy-deep/20"
            : "bg-navy"
        }`}
      >
        <div className="container-romad">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo - Text instead of image */}
            <Link
              href={`/${safeLocale}`}
              className="flex items-center gap-2 flex-shrink-0"
              aria-label="Romaα Laser - الرئيسية"
            >
              <div className="relative">
                <div className="text-2xl lg:text-3xl font-black tracking-tight" style={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #00D9FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 30px rgba(0, 217, 255, 0.6)",
                  filter: "drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))"
                }}>
                  Roma<span style={{ color: "#00D9FF" }}>α</span>
                </div>
                <div className="text-xs font-bold text-laser mt-1">LASER</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${safeLocale}${link.href === "/" ? "" : link.href}`}
                  className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
                >
                  {isAr ? link.label_ar : link.label_en}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">

              {/* Search bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                  className="w-52 xl:w-64 bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold focus:bg-white/15 transition-all"
                  aria-label={isAr ? "بحث" : "Search"}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  aria-label={isAr ? "بحث" : "Search"}
                  className="absolute inset-y-0 end-3 flex items-center text-white/60 hover:text-gold transition-colors"
                >
                  <Search size={16} />
                </button>
              </form>

              {/* Language Toggle */}
              <button
                onClick={handleLanguageToggle}
                aria-label={isAr ? "Switch to English" : "التبديل للعربية"}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Globe size={16} />
                {isAr ? "EN" : "ع"}
              </button>

              {/* Wishlist */}
              <Link
                href={`/${safeLocale}/account/wishlist`}
                aria-label={isAr ? "المفضلة" : "Wishlist"}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <Heart size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                aria-label={isAr ? `السلة (${isMounted ? totalItems : 0})` : `Cart (${isMounted ? totalItems : 0})`}
                className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <ShoppingCart size={20} />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -end-1 bg-gold text-navy-deep text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label={isAr ? "حسابي" : "My Account"}
                  aria-expanded={isUserMenuOpen}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  <User size={18} />
                  <span className="text-sm font-medium hidden xl:block text-white/90">
                    {user
                      ? (userData?.name?.split(" ")[0] || (isAr ? "حسابي" : "Account"))
                      : (isAr ? "تسجيل الدخول" : "Sign In")}
                  </span>
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className={`absolute top-full mt-2 ${isAr ? "left-0" : "right-0"} w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50`}>
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-navy truncate">{userData?.name}</p>
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                        <Link
                          href={`/${safeLocale}/account`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-gold-pale hover:text-navy transition-colors"
                        >
                          <User size={15} />
                          {isAr ? "حسابي" : "My Account"}
                        </Link>
                        <Link
                          href={`/${safeLocale}/account/orders`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-gold-pale hover:text-navy transition-colors"
                        >
                          <Package size={15} />
                          {isAr ? "طلباتي" : "My Orders"}
                        </Link>
                        {isAdmin && (
                          <Link
                            href={`/${safeLocale}/admin`}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-navy font-medium hover:bg-gold-pale transition-colors"
                          >
                            <Settings size={15} />
                            {isAr ? "لوحة الإدارة" : "Admin Panel"}
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut size={15} />
                          {isAr ? "تسجيل الخروج" : "Sign Out"}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/${safeLocale}/auth/login`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-navy hover:bg-gold-pale hover:text-navy transition-colors font-medium"
                        >
                          {isAr ? "تسجيل الدخول" : "Sign In"}
                        </Link>
                        <Link
                          href={`/${safeLocale}/auth/register`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gold-dark hover:bg-gold-pale transition-colors font-medium"
                        >
                          {isAr ? "إنشاء حساب" : "Create Account"}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleCart}
                aria-label={isAr ? "السلة" : "Cart"}
                className="relative p-2 text-white"
              >
                <ShoppingCart size={22} />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-1 -end-1 bg-gold text-navy-deep text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? (isAr ? "إغلاق" : "Close") : (isAr ? "القائمة" : "Menu")}
                className="p-2 text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-navy-deep border-t border-white/10 py-4">
            <div className="container-romad space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                    className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                    aria-label={isAr ? "بحث" : "Search"}
                  />
                  <button type="submit" className="absolute inset-y-0 end-3 flex items-center text-white/60">
                    <Search size={16} />
                  </button>
                </div>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${safeLocale}${link.href === "/" ? "" : link.href}`}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  {isAr ? link.label_ar : link.label_en}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10 flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={handleLanguageToggle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
                >
                  <Globe size={15} />
                  {isAr ? "English" : "العربية"}
                </button>
                {user ? (
                  <Link href={`/${safeLocale}/account`} onClick={closeMobileMenu} className="flex items-center gap-1.5 px-3 py-2 text-white/80 hover:text-white text-sm">
                    <User size={15} />
                    {isAr ? "حسابي" : "Account"}
                  </Link>
                ) : (
                  <Link href={`/${safeLocale}/auth/login`} onClick={closeMobileMenu} className="flex items-center gap-1.5 px-3 py-2 text-gold font-medium text-sm">
                    {isAr ? "تسجيل الدخول" : "Sign In"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer locale={locale} />

      {/* Header spacer */}
      <div className="h-16 lg:h-18" />
    </>
  );
}

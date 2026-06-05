import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, ArrowLeft } from "lucide-react";

// Facebook icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// YouTube icon
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

// TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.02-8.72a8.27 8.27 0 0 0 4.84 1.55V4.69a4.85 4.85 0 0 1-1.05-.69Z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const footerLinks = {
  shop: [
    { href: "/shop", label_ar: "جميع المنتجات", label_en: "All Products" },
    { href: "/shop/laser-machine", label_ar: "ماكينة الليزر", label_en: "Laser Machine" },
    { href: "/shop/co2-machine", label_ar: "ماكينة CO2", label_en: "CO2 Machine" },
    { href: "/shop/spare-parts", label_ar: "قطع الغيار", label_en: "Spare Parts" },
  ],
  info: [
    { href: "/about", label_ar: "من نحن", label_en: "About Us" },
    { href: "/contact", label_ar: "تواصل معنا", label_en: "Contact" },
    { href: "/shipping", label_ar: "سياسة الشحن", label_en: "Shipping Policy" },
    { href: "/account/orders", label_ar: "تتبع طلبي", label_en: "Track Order" },
    { href: "/auth/login", label_ar: "تسجيل الدخول", label_en: "Sign In" },
  ],
};

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const isAr = locale === "ar";
  const currentYear = new Date().getFullYear();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phone1 = process.env.NEXT_PUBLIC_PHONE_1;
  const phone2 = process.env.NEXT_PUBLIC_PHONE_2;
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL;
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_URL;
  const youtube = process.env.NEXT_PUBLIC_YOUTUBE_URL;

  return (
    <footer className="navy-texture text-white mt-auto" dir={isAr ? "rtl" : "ltr"}>
      {/* Main Footer */}
      <div className="container-romad py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="relative h-10 w-36 mb-4">
              <Image
                src="/images/logo.png"
                alt="Romaα Laser روماد ليزر"
                fill
                className="object-contain"
                sizes="144px"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              {isAr
                ? "متخصصون في قطع غيار ماكينات الليزر CO2 وخدمات الصيانة الاحترافية في مصر"
                : "Specialists in laser and CO2 machine spare parts and professional maintenance services in Egypt"}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <FacebookIcon />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                  <YoutubeIcon />
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <TikTokIcon />
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors"
                >
                  <WhatsAppIcon />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">
              {isAr ? "المتجر" : "Shop"}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-white/65 hover:text-gold transition-colors text-sm flex items-center gap-1.5 group"
                  >
                    <ArrowLeft size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? "rotate-180" : ""}`} />
                    {isAr ? link.label_ar : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">
              {isAr ? "معلومات" : "Information"}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href}`}
                    className="text-white/65 hover:text-gold transition-colors text-sm flex items-center gap-1.5 group"
                  >
                    <ArrowLeft size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? "rotate-180" : ""}`} />
                    {isAr ? link.label_ar : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-4 text-base">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/65 text-sm">
                <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? "مركز المحلة الكبرى، الغربية"
                    : "Mahalla El Kubra, Gharbia"}
                </span>
              </li>
              {phone1 && (
                <li>
                  <a
                    href={`tel:+2${phone1}`}
                    className="flex items-center gap-2.5 text-white/65 hover:text-gold transition-colors text-sm"
                  >
                    <Phone size={15} className="text-gold flex-shrink-0" />
                    <span dir="ltr">{phone1}</span>
                  </a>
                </li>
              )}
              {phone2 && (
                <li>
                  <a
                    href={`tel:+2${phone2}`}
                    className="flex items-center gap-2.5 text-white/65 hover:text-gold transition-colors text-sm"
                  >
                    <Phone size={15} className="text-gold flex-shrink-0" />
                    <span dir="ltr">{phone2}</span>
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
                  >
                    <WhatsAppIcon />
                    {isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Laser Divider */}
      <div className="laser-beam opacity-60" />

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-romad py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-xs text-center sm:text-start">
            © {currentYear} روماد ليزر — Romaα Laser.{" "}
            {isAr ? "جميع الحقوق محفوظة" : "All Rights Reserved"}
          </p>
          <p className="text-white/30 text-xs">
            {isAr ? "صُنع بـ ❤️ في مصر" : "Made with ❤️ in Egypt"}
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201229256173";

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=مرحباً، أريد الاستفسار عن منتج`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-20 lg:bottom-6 start-4 z-20 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg whatsapp-pulse hover:scale-110 transition-transform"
    >
      <MessageCircle size={28} className="text-white fill-white" />

      {/* Tooltip */}
      <span className="absolute end-full me-2 bg-navy text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity shadow-md pointer-events-none">
        واتساب
        <span className="absolute top-1/2 -translate-y-1/2 start-full border-4 border-transparent border-s-navy" />
      </span>
    </a>
  );
}

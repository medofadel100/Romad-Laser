"use client";

import Link from "next/link";
import { ArrowLeft, Wrench, ShoppingBag } from "lucide-react";

const LaserLine = ({ delay = 0, duration = 8 }: { delay?: number; duration?: number }) => (
  <div
    className="absolute h-px w-full opacity-0"
    style={{
      background: "linear-gradient(90deg, transparent, rgba(0,217,255,0.6), transparent)",
      animation: `laser-beam ${duration}s ${delay}s infinite linear`,
      top: `${Math.random() * 100}%`,
    }}
    aria-hidden="true"
  />
);

interface HeroSectionProps {
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const isAr = locale === "ar";

  const stats = [
    { value: "500+", label_ar: "منتج متاح", label_en: "Products Available" },
    { value: "10+", label_ar: "سنوات خبرة", label_en: "Years Experience" },
    { value: "1000+", label_ar: "عميل راضٍ", label_en: "Happy Clients" },
  ];

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <style>{`
        @keyframes laser-beam {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .hero-title {
          background: linear-gradient(135deg, #FFFFFF 0%, #00D9FF 50%, #FF6B35 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s infinite;
          background-size: 1000px 100%;
        }
        .hero-orb {
          filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.6));
        }
        .gear-svg, .gear-small {
          animation: rotate-slow 30s linear infinite;
        }
        .gear-small {
          animation-duration: 22s;
          opacity: 0.85;
        }
        .hero-gear-glow {
          filter: drop-shadow(0 0 24px rgba(0, 217, 255, 0.35));
        }
      `}</style>

      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1220] via-[#111A31] to-[#0D1121]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />

        <div className="absolute top-14 left-8 hidden xl:block">
          <svg viewBox="0 0 120 120" className="w-32 h-32 gear-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="34" stroke="rgba(0,217,255,0.4)" strokeWidth="6" />
            <circle cx="60" cy="60" r="18" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            {[0,1,2,3,4,5,6,7].map((i) => {
              const angle = (i * 45) * (Math.PI/180);
              const x = 60 + Math.cos(angle) * 46;
              const y = 60 + Math.sin(angle) * 46;
              return <rect key={i} x={x-5} y={y-8} width="10" height="16" rx="3" fill="rgba(0,217,255,0.45)" transform={`rotate(${i*45} ${x} ${y})`} />;
            })}
          </svg>
        </div>

        <div className="absolute top-32 left-56 hidden lg:block">
          <svg viewBox="0 0 72 72" className="w-20 h-20 gear-small" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="18" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
            <circle cx="36" cy="36" r="8" stroke="rgba(0,217,255,0.5)" strokeWidth="3" />
            {[0,1,2,3,4,5,6,7].map((i) => {
              const angle = (i * 45) * (Math.PI/180);
              const x = 36 + Math.cos(angle) * 24;
              const y = 36 + Math.sin(angle) * 24;
              return <rect key={i} x={x-3} y={y-7} width="6" height="14" rx="2" fill="rgba(0,217,255,0.35)" transform={`rotate(${i*45} ${x} ${y})`} />;
            })}
          </svg>
        </div>

        <div className="absolute top-24 right-8 hidden lg:block">
          <div className="relative w-72 h-14 rounded-full border border-cyan-300/30 bg-[#0A0F1A]/95 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
            <div className="absolute inset-y-2 left-3 w-28 rounded-full bg-gradient-to-r from-cyan-400 to-transparent blur-sm" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-cyan-300/40 bg-[#0A0F1A]/90 shadow-[0_0_20px_rgba(0,217,255,0.35)]" />
            <div className="absolute inset-y-2 right-20 w-16 rounded-full bg-cyan-400/20" />
          </div>
          <div className="absolute right-16 top-4 w-16 h-16 rounded-full border border-cyan-400/20 bg-[#0A0F1A]/95 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
            <div className="absolute inset-3 rounded-full bg-[#0F1729] border border-cyan-300/40" />
            <div className="absolute inset-x-9 top-5 h-1 bg-cyan-300 rounded-full" />
            <div className="absolute left-1/2 top-1/2 w-1 h-10 bg-cyan-300 rounded-full origin-bottom rotate-45" />
          </div>
        </div>

        <div className="absolute bottom-24 left-10 hidden lg:block">
          <div className="relative w-52 h-28 rounded-[32px] border border-cyan-300/20 bg-[#0F1729]/80 shadow-[0_0_40px_rgba(0,217,255,0.18)]">
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-cyan-300/30 bg-[#0A0F1A]/90 shadow-[0_0_12px_rgba(0,217,255,0.35)]" />
            <div className="absolute top-4 left-24 w-20 h-12 rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/15 to-transparent" />
            <div className="absolute bottom-4 left-6 w-14 h-4 rounded-full bg-cyan-400/40" />
            <div className="absolute bottom-4 left-26 w-20 h-4 rounded-full bg-cyan-400/30" />
            <div className="absolute bottom-3 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300/60 to-transparent" />
          </div>
        </div>

        <div className="absolute bottom-16 right-8 hidden xl:block">
          <div className="w-72 rounded-[28px] border border-cyan-400/20 bg-[#08101F]/95 p-5 shadow-[0_0_50px_rgba(0,217,255,0.18)] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/75">{isAr ? "لوحة تحكم" : "Control Panel"}</p>
                <h3 className="text-lg font-black text-white/90 mt-1">{isAr ? "خدمة ماكينات" : "Machine Service"}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-300/20 flex items-center justify-center text-cyan-200 shadow-[0_0_16px_rgba(0,217,255,0.25)]">
                ⚙️
              </div>
            </div>

            <div className="space-y-3 text-sm text-white/70 mb-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-laser" />
                <span>{isAr ? "قطع غيار أصلية متوفرة" : "Original spare parts available"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-laser" />
                <span>{isAr ? "دعم فني وصيانة محترفة" : "Professional service support"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-laser" />
                <span>{isAr ? "توصيل سريع لكل المحافظات" : "Fast delivery across Egypt"}</span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div className="rounded-2xl bg-[#0F1729]/80 p-3 border border-cyan-300/15">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{isAr ? "أداء الليزر" : "Laser Power"}</p>
                <p className="text-sm font-semibold text-white/90 mt-1">100%</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-cyan-400/15 to-transparent p-3 border border-cyan-300/20">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{isAr ? "جاهزية" : "Ready"}</p>
                <p className="text-sm font-semibold text-cyan-200">{isAr ? "جاهز الآن" : "Online"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-romad relative z-10 py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* Brand Logo as Heading Intro - WITH SHIMMER EFFECT */}
          <div className="flex flex-col mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 group">
            <div className="hero-title text-5xl lg:text-6xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(0,217,255,0.3)]">
              Roma<span className="text-laser">α</span>
            </div>
            <div className="text-xs font-black text-white/40 tracking-[0.8em] ms-1 mt-1 uppercase relative overflow-hidden">
              <span className="relative z-10">LASER</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-laser/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>

          {/* Badge with animation */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-laser/20 to-gold/20 border border-laser/40 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm" style={{ animation: "glow-pulse 2s ease-in-out infinite" }}>
            <span className="w-2 h-2 rounded-full bg-laser animate-pulse" />
            {isAr ? "🇪🇬 التوصيل لجميع محافظات مصر" : "🇪🇬 Delivery to all Egyptian Governorates"}
          </div>

          {/* Main Title with Premium Styling */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6" style={{
            animation: "fadeInUp 1s ease-out"
          }}>
            <span className="block text-white drop-shadow-lg">
              {isAr ? "قطع الغيار" : "Spare Parts"}
            </span>
            <span className="block hero-title text-5xl sm:text-6xl lg:text-7xl xl:text-8xl drop-shadow-2xl mb-3">
              {isAr ? "والصيانة" : "& Maintenance"}
            </span>
            <span className="block text-laser text-3xl sm:text-4xl lg:text-5xl font-bold drop-shadow-lg" style={{
              textShadow: "0 0 20px rgba(0, 217, 255, 0.8)"
            }}>
              {isAr ? "ماكينات الليزر والـ CO2" : "Laser & CO2 Machines"}
            </span>
          </h1>

          {/* Description with fade animation */}
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl" style={{
            animation: "fadeInUp 1.2s ease-out"
          }}>
            {isAr
              ? "متخصصون في توفير قطع غيار ماكينات الليزر والـ CO2 وتقديم خدمات الصيانة الاحترافية. جودة مضمونة وأسعار تنافسية."
              : "Specialists in providing laser and CO2 machine spare parts and professional maintenance services. Guaranteed quality and competitive prices."}
          </p>

          {/* CTA Buttons with hover effects */}
          <div className="flex flex-wrap gap-4" style={{ animation: "fadeInUp 1.4s ease-out" }}>
            <Link
              href={`/${locale}/shop`}
              className="btn btn-primary gap-2 text-base px-8 py-3.5 shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)",
                boxShadow: "0 0 20px rgba(255, 107, 53, 0.5)"
              }}
            >
              <ShoppingBag size={20} />
              {isAr ? "تسوق الآن" : "Shop Now"}
              <ArrowLeft size={18} className={isAr ? "rotate-180" : ""} />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="btn gap-2 text-base px-8 py-3.5 border-2 border-laser text-laser hover:bg-laser/10 transition-all duration-300 hover:shadow-lg hover:shadow-laser/30"
            >
              <Wrench size={20} />
              {isAr ? "خدمة الصيانة" : "Maintenance Service"}
            </Link>
          </div>
        </div>

        {/* Animated Stats Bar */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-4 rounded-xl bg-gradient-to-br from-laser/10 to-gold/5 border border-laser/30 backdrop-blur-sm hover:border-laser/60 transition-all duration-300"
              style={{
                animation: `fadeInUp ${1.6 + i * 0.2}s ease-out`,
                animationFillMode: "both"
              }}
            >
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-laser to-gold bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-white/60 text-xs sm:text-sm">
                {isAr ? stat.label_ar : stat.label_en}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes translateY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}

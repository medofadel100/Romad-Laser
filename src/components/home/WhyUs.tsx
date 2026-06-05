import { Shield, Wrench, Truck, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title_ar: "جودة مضمونة",
    title_en: "Guaranteed Quality",
    desc_ar: "جميع منتجاتنا مختارة بعناية فائقة لضمان أعلى مستويات الجودة والأداء",
    desc_en: "All our products are carefully selected to ensure the highest levels of quality and performance",
    color: "text-gold bg-gold-pale",
    accent: "#C9973A",
  },
  {
    icon: Wrench,
    title_ar: "صيانة احترافية",
    title_en: "Professional Maintenance",
    desc_ar: "فريق متخصص من المهندسين لصيانة وإصلاح ماكينات الليزر CO2 في موقعك",
    desc_en: "Specialized engineering team for laser and CO2 machine maintenance and repair at your location",
    color: "text-navy bg-navy/5",
    accent: "#1B2A4A",
  },
  {
    icon: Truck,
    title_ar: "توصيل سريع",
    title_en: "Fast Delivery",
    desc_ar: "شحن سريع وآمن لجميع محافظات مصر بأسرع وقت ممكن وبأقل التكاليف",
    desc_en: "Fast and safe shipping to all Egyptian governorates as quickly as possible at minimal cost",
    color: "text-laser bg-laser/10",
    accent: "#4FC3F7",
  },
  {
    icon: HeadphonesIcon,
    title_ar: "دعم فني 24/7",
    title_en: "24/7 Technical Support",
    desc_ar: "فريق دعم فني متاح على مدار الساعة لمساعدتك عبر واتساب والهاتف",
    desc_en: "Technical support team available around the clock via WhatsApp and phone",
    color: "text-green-600 bg-green-50",
    accent: "#10B981",
  },
];

interface WhyUsProps {
  locale: string;
}

export default function WhyUs({ locale }: WhyUsProps) {
  const isAr = locale === "ar";

  return (
    <section className="navy-texture py-16 lg:py-24 relative overflow-hidden">
      {/* Decorative laser line */}
      <div className="absolute top-0 left-0 right-0 laser-beam opacity-40" />

      <div className="container-romad relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-semibold mb-3 border border-white/20">
            {isAr ? "لماذا روماد ليزر؟" : "Why Romaα Laser?"}
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-3">
            {isAr ? "ثق في الخبراء" : "Trust the Experts"}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {isAr
              ? "نقدم لك أفضل الحلول لقطع غيار ماكينات الليزر CO2 مع خدمة صيانة احترافية"
              : "We offer you the best solutions for laser and CO2 machine spare parts with professional maintenance service"}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <Icon size={24} />
                </div>

                <h3 className="font-bold text-white text-lg mb-2">
                  {isAr ? feature.title_ar : feature.title_en}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  {isAr ? feature.desc_ar : feature.desc_en}
                </p>

                {/* Bottom accent */}
                <div
                  className="h-0.5 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }}
                />
              </div>
            );
          })}
        </div>

        {/* Maintenance CTA Banner */}
        <div className="mt-14 p-8 rounded-2xl bg-gold/10 border border-gold/30 text-center">
          <Wrench size={40} className="text-gold mx-auto mb-4 animate-float" />
          <h3 className="text-2xl font-black text-white mb-3">
            {isAr ? "هل ماكينتك تحتاج صيانة؟" : "Does Your Machine Need Maintenance?"}
          </h3>
          <p className="text-white/70 mb-5 max-w-lg mx-auto">
            {isAr
              ? "تواصل معنا الآن وسيزورك مهندس متخصص في أقرب وقت للتشخيص والإصلاح"
              : "Contact us now and a specialized engineer will visit you as soon as possible for diagnosis and repair"}
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary gap-2 text-base inline-flex"
          >
            {isAr ? "📱 تواصل عبر واتساب" : "📱 Contact via WhatsApp"}
          </a>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 laser-beam opacity-40" />
    </section>
  );
}

import type { Metadata } from "next";
import { Users, Target, Award, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";

// Social Icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "من نحن | رماد ليزر" : "About Us | Romad Laser",
    description: isAr 
      ? "تعرف على رماد ليزر، شريكك الموثوق في قطع غيار ماكينات الليزر والـ CNC في مصر."
      : "Learn about Romad Laser, your trusted partner for Laser and CNC machine spare parts in Egypt.",
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const stats = [
    { label: isAr ? "عميل سعيد" : "Happy Clients", value: "5000+" },
    { label: isAr ? "قطعة غيار" : "Spare Parts", value: "1200+" },
    { label: isAr ? "سنة خبرة" : "Years Experience", value: "10+" },
    { label: isAr ? "محافظة" : "Governorates", value: "27" },
  ];

  const values = [
    {
      icon: Award,
      title: isAr ? "الجودة الأصلية" : "Original Quality",
      desc: isAr ? "نوفر فقط قطع الغيار الأصلية والموثوقة لضمان استمرارية عمل ماكيناتكم." : "We provide only original and reliable spare parts to ensure your machines keep running.",
    },
    {
      icon: ShieldCheck,
      title: isAr ? "الضمان والثقة" : "Warranty & Trust",
      desc: isAr ? "نقف خلف منتجاتنا بضمان حقيقي ودعم فني متواصل لعملائنا." : "We stand behind our products with real warranty and continuous technical support.",
    },
    {
      icon: Target,
      title: isAr ? "سرعة التوصيل" : "Fast Delivery",
      desc: isAr ? "ندرك قيمة الوقت في التصنيع، لذا نهتم بتوصيل طلباتكم في أسرع وقت ممكن." : "We know time is money in manufacturing, so we focus on rapid delivery.",
    },
    {
      icon: Users,
      title: isAr ? "دعم فني متخصص" : "Expert Support",
      desc: isAr ? "فريق من المهندسين والفنيين جاهز للرد على استفساراتكم وحل مشاكلكم." : "A team of engineers and technicians is ready to answer your questions and solve issues.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-navy">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#D4AF37_0%,transparent_50%)]" />
        </div>
        <div className="container-romad relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              {isAr ? (
                <>رؤيتنا هي تمكين <span className="text-gold">الصناعة الوطنية</span> بأفضل الحلول</>
              ) : (
                <>Our Vision is Empowering <span className="text-gold">National Industry</span> with Best Solutions</>
              )}
            </h1>
            <p className="text-xl text-white/70 leading-relaxed">
              {isAr 
                ? "رماد ليزر هي المؤسسة الرائدة في مصر المتخصصة في توريد وصيانة ماكينات الليزر والـ CNC، ملتزمون بتقديم أعلى جودة وأفضل خدمة ما بعد البيع."
                : "Romad Laser is Egypt's leading institution specializing in the supply and maintenance of Laser and CNC machines, committed to delivering peak quality and after-sales service."}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gold">
        <div className="container-romad">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl lg:text-5xl font-black text-navy mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-navy/60 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container-romad">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-navy overflow-hidden shadow-2xl">
                <img 
                  src="/images/full%20logo.jpeg" 
                  alt="Romad Laser Full Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-8 -right-8 lg:-right-12 w-48 h-48 bg-gold rounded-full flex items-center justify-center p-8 text-center shadow-xl rotate-12">
                <p className="font-black text-navy leading-tight">
                  {isAr ? "نحن نبني المستقبل" : "Building the Future"}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl lg:text-5xl font-black text-navy mb-8">
                {isAr ? "قصة بدأت بالشغف والالتزام" : "A Story Started with Passion & Commitment"}
              </h2>
              <div className="space-y-6 text-lg text-text-muted leading-relaxed">
                <p>
                  {isAr 
                    ? "بدأت رحلة رماد ليزر منذ أكثر من عقد من الزمان في مدينة المحلة الكبرى، قلب الصناعة المصرية. كان هدفنا منذ اليوم الأول هو سد الفجوة في سوق قطع غيار ماكينات الليزر وتوفير بدائل عالية الجودة بأسعار عادلة."
                    : "Romad Laser's journey began over a decade ago in Mahalla El Kubra, the heart of Egyptian industry. Our goal from day one was to bridge the gap in the laser spare parts market and provide high-quality alternatives at fair prices."}
                </p>
                <p>
                  {isAr
                    ? "اليوم، نفتخر بأننا نخدم آلاف الورش والمصانع على مستوى الجمهورية، ونوفر لهم ليس فقط قطع الغيار، بل الاستشارات الفنية والخبرة التي تساعدهم على النمو والتميز في مجالاتهم."
                    : "Today, we are proud to serve thousands of workshops and factories nationwide, providing them with not just spare parts, but the technical consulting and expertise that helps them grow and excel in their fields."}
                </p>
              </div>
              <div className="mt-10 grid sm:grid-cols-2 gap-6">
                {values.map((val, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gold-pale flex items-center justify-center">
                      <val.icon className="text-gold" size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-navy mb-1">{val.title}</h3>
                      <p className="text-sm text-text-muted">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-20 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-gold.svg')] opacity-5" />
        <div className="container-romad relative z-10">
          <div className="rounded-[48px] bg-gradient-to-r from-navy-deep to-navy border border-white/10 p-12 lg:p-20 text-center shadow-2xl">
            <h2 className="text-3xl lg:text-5xl font-black mb-8">
              {isAr ? "تواصل مع خبرائنا اليوم" : "Connect with Our Experts Today"}
            </h2>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-3">
                <MapPin className="text-gold" />
                <span className="font-bold">{isAr ? "المحلة الكبرى، الغربية" : "Mahalla El Kubra, Gharbia"}</span>
              </div>
              <div className="flex items-center gap-3 text-gold">
                <Phone />
                <span className="font-bold tracking-widest" dir="ltr">01229256173</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gold" />
                <span className="font-bold">info@romadlaser.com</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://wa.me/201229256173" target="_blank" rel="noopener noreferrer" className="btn btn-primary px-10 py-5 text-lg">
                {isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
              </a>
              <div className="flex items-center justify-center gap-4 px-6">
                <a href="https://facebook.com/Romadlaser1" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-gold hover:text-navy transition-all">
                  <FacebookIcon />
                </a>
                <a href="https://youtube.com/@romadlaser3543" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-gold hover:text-navy transition-all">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

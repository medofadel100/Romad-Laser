"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Copy, 
  Phone as PhoneIcon, 
  MessageCircle, 
  Wrench,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/lib/firestore";
import { formatPrice, cn, shippingRates } from "@/lib/utils";
import type { Order } from "@/types";

interface CheckoutFormValues {
  // Shipping
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  
  // Method & Payment
  shippingType: "courier" | "pickup" | "microbus";
  paymentMethod: "cod" | "instapay" | "wallet";
  engineerVisit: boolean;
  notes?: string;
}

export default function CheckoutPageClient({ 
  locale, 
  shippingSettings 
}: { 
  locale: any;
  shippingSettings: { freeShippingThreshold: number; rates: Record<string, number> };
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { user, userData } = useAuth();
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors } } = useForm<CheckoutFormValues>({
    defaultValues: {
      paymentMethod: "cod",
      shippingType: "courier",
      firstName: userData?.name?.split(" ")[0] || "",
      lastName: userData?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      engineerVisit: false,
    }
  });

  const paymentMethod = watch("paymentMethod");
  const shippingType = watch("shippingType");
  const selectedGovernorate = watch("governorate");

  // Auto-switch payment method if microbus is selected
  useEffect(() => {
    if (shippingType === "microbus" && paymentMethod === "cod") {
      setValue("paymentMethod", "instapay");
      addToast("info", isAr ? "تم تحويل طريقة الدفع إلى انستا باي لأن الميكروباص يتطلب دفعاً مسبقاً" : "Payment switched to Instapay as Microbus requires pre-payment");
    }
  }, [shippingType, paymentMethod, setValue, isAr, addToast]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/shop`);
    }
  }, [items.length, router, locale]);

  // Debugging: log whenever errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Current Form Errors:", errors);
    }
  }, [errors]);

  if (!items.length) {
    return null;
  }

  // Shipping cost logic
  const threshold = shippingSettings?.freeShippingThreshold || 1500;
  const rates = shippingSettings?.rates || shippingRates;
  
  let shippingCost = 0;
  if (shippingType === "courier") {
    shippingCost = (subtotal > threshold || !selectedGovernorate) ? 0 : (rates[selectedGovernorate] || 50);
  } else {
    shippingCost = 0; // Pickup and Microbus are 0 in system
  }

  const total = subtotal + shippingCost;

  const onSubmit = async (values: CheckoutFormValues) => {
    console.log("Submit clicked", values);
    
    setIsSubmitting(true);
    try {
      console.log("Preparing order data...");
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        userId: user?.uid || `guest_${Date.now()}`,
        items: items.map(item => ({
          productId: item.productId,
          name_ar: item.name_ar,
          name_en: item.name_en,
          price: item.salePrice ?? item.price,
          qty: item.qty,
          image: item.image,
          size: item.size,
        })),
        subtotal,
        discountAmount: 0,
        shippingCost,
        total,
        paymentMethod: values.paymentMethod,
        paymentStatus: "pending",
        shippingMethod: values.shippingType,
        shippingType: values.shippingType,
        shippingAddress: {
          name: `${values.firstName} ${values.lastName}`,
          phone: values.phone,
          governorate: values.governorate,
          city: values.city,
          details: values.shippingType === "courier" ? values.address : (values.shippingType === "pickup" ? "PICKUP" : "MICROBUS"),
        },
        status: "pending",
        engineerVisit: values.engineerVisit,
        notes: values.notes,
      };

      console.log("Sending order to Firestore...", orderData);
      const orderId = await createOrder(orderData);
      console.log("Order created with ID:", orderId);
      
      clearCart();
      addToast("success", isAr ? "تم إنشاء الطلب بنجاح!" : "Order created successfully!");
      router.push(`/${locale}/checkout/success?order=${orderId}`);

    } catch (error) {
      console.error("Checkout submission error:", error);
      addToast("error", isAr ? "حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى." : "Error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormError = (errors: any) => {
    console.warn("Checkout validation errors:", errors);
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstError = errorFields[0];
      const fieldNames: Record<string, string> = {
        firstName: isAr ? "الاسم الأول" : "First Name",
        lastName: isAr ? "اسم العائلة" : "Last Name",
        phone: isAr ? "رقم الهاتف" : "Phone Number",
        governorate: isAr ? "المحافظة" : "Governorate",
        city: isAr ? "المدينة/المركز" : "City",
        address: isAr ? "العنوان بالتفصيل" : "Detailed Address",
        paymentMethod: isAr ? "طريقة الدفع" : "Payment Method",
        shippingType: isAr ? "طريقة الاستلام" : "Shipping Method",
      };
      
      const fieldName = fieldNames[firstError] || firstError;
      const errorMsg = isAr 
        ? `يرجى إكمال الحقل المطلوب: ${fieldName}` 
        : `Please complete the required field: ${fieldName}`;
      
      addToast("error", errorMsg);
      // Forced alert for debugging
      window.alert(errorMsg);
    }
  };


  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="mb-10">
        <Link href={`/${locale}/cart`} className="text-sm font-black text-navy/60 hover:text-navy inline-flex items-center gap-2 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isAr ? "العودة لسلة المشتريات" : "Back to Cart"}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <form noValidate onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-8">
          
          {/* 1. Personal Info */}
          <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Truck size={24} className="text-gold" />
              </div>
              <h2 className="text-2xl font-black text-navy">
                {isAr ? "معلومات الشحن" : "Shipping Information"}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-navy mb-2 block">{isAr ? "الاسم الأول" : "First Name"} *</span>
                <input
                  type="text"
                  {...register("firstName", { required: isAr ? "الاسم الأول مطلوب" : "First name is required" })}
                  className="input w-full p-4 rounded-2xl"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.firstName.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-black text-navy mb-2 block">{isAr ? "اسم العائلة" : "Last Name"} *</span>
                <input
                  type="text"
                  {...register("lastName", { required: isAr ? "اسم العائلة مطلوب" : "Last name is required" })}
                  className="input w-full p-4 rounded-2xl"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lastName.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-black text-navy mb-2 block">{isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}</span>
                <input
                  type="email"
                  {...register("email", { 
                    required: false,
                    pattern: { 
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                      message: isAr ? "بريد إلكتروني غير صحيح" : "Invalid email" 
                    }
                  })}
                  className="input w-full p-4 rounded-2xl"
                  placeholder="example@mail.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-black text-navy mb-2 block">{isAr ? "رقم الهاتف" : "Phone"} *</span>
                <input
                  type="tel"
                  {...register("phone", { required: isAr ? "رقم الهاتف مطلوب" : "Phone is required" })}
                  className="input w-full p-4 rounded-2xl"
                  placeholder="01xxxxxxxxx"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone.message}</p>}
              </label>
            </div>
          </div>

          {/* 2. Shipping Method */}
          <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-black text-navy mb-6">
              {isAr ? "طريقة الاستلام" : "Shipping Method"}
            </h3>

            <div className="grid gap-4">
              <label className={cn(
                "relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all",
                shippingType === "courier" ? "border-gold bg-gold/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              )}>
                <div className="flex items-center gap-3">
                  <input type="radio" value="courier" {...register("shippingType")} className="w-5 h-5 text-gold focus:ring-gold" />
                  <span className="font-black text-navy text-lg">{isAr ? "شركة شحن (توصيل للمنزل)" : "Courier (Home Delivery)"}</span>
                </div>
                <p className="text-sm text-text-muted mt-1 ml-8 rtl:mr-8 rtl:ml-0">
                  {isAr ? "يتم التوصيل حتى باب المنزل خلال 2-5 أيام عمل" : "Delivery to your doorstep within 2-5 business days"}
                </p>
              </label>

              <label className={cn(
                "relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all",
                shippingType === "microbus" ? "border-gold bg-gold/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              )}>
                <div className="flex items-center gap-3">
                  <input type="radio" value="microbus" {...register("shippingType")} className="w-5 h-5 text-gold focus:ring-gold" />
                  <span className="font-black text-navy text-lg">{isAr ? "ميكروباص (موقف المحافظة)" : "Microbus (City Station)"}</span>
                </div>
                <p className="text-sm text-text-muted mt-1 ml-8 rtl:mr-8 rtl:ml-0">
                  {isAr ? "يتم إرسال الطلب مع ميكروباص وتستلمه من موقف سيارات محافظتك" : "Sent via microbus to be picked up from your city station"}
                </p>
              </label>

              <label className={cn(
                "relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all",
                shippingType === "pickup" ? "border-gold bg-gold/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
              )}>
                <div className="flex items-center gap-3">
                  <input type="radio" value="pickup" {...register("shippingType")} className="w-5 h-5 text-gold focus:ring-gold" />
                  <span className="font-black text-navy text-lg">{isAr ? "استلام من مقر الشركة" : "Pickup from Company"}</span>
                </div>
                <p className="text-sm text-text-muted mt-1 ml-8 rtl:mr-8 rtl:ml-0">
                  {isAr ? "تشرفنا بزيارتك في مقرنا للاستلام بنفسك" : "Visit our headquarters to pick up the order yourself"}
                </p>
              </label>
            </div>

            {/* Dynamic Address Fields */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              {shippingType === "pickup" ? (
                <div className="p-6 rounded-3xl bg-navy text-white space-y-3 border-2 border-gold shadow-xl">
                  <div className="flex items-center gap-2 text-gold">
                    <MapPin size={20} />
                    <p className="font-black text-sm uppercase tracking-widest">{isAr ? "عنوان مقر الشركة" : "Company Address"}</p>
                  </div>
                  <p className="font-black text-xl">
                    {isAr ? "قرية الهياتم - مركز المحلة الكبرى، الغربية" : "Hayatem Village, Mahalla El Kubra, Gharbia"}
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    {isAr 
                      ? "نحن بانتظارك! مواعيد العمل من 9 صباحاً حتى 6 مساءً." 
                      : "We are waiting for you! Business hours: 9 AM - 6 PM."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "المحافظة" : "Governorate"} *</span>
                    <select
                      {...register("governorate", { required: isAr ? "المحافظة مطلوبة" : "Governorate is required" })}
                      className="input w-full p-4 rounded-2xl"
                    >
                      <option value="">{isAr ? "اختر المحافظة" : "Select"}</option>
                      {Object.keys(rates).map(govKey => {
                        const govMap: Record<string, string> = {
                          cairo: "القاهرة",
                          giza: "الجيزة",
                          alexandria: "الإسكندرية",
                          sharqia: "الشرقية",
                          dakahlia: "الدقهلية",
                          beheira: "البحيرة",
                          minya: "المنيا",
                          sohag: "سوهاج",
                          qena: "قنا",
                          assiut: "أسيوط",
                          fayoum: "الفيوم",
                          beni_suef: "بني سويف",
                          menoufia: "المنوفية",
                          kafr_el_sheikh: "كفر الشيخ",
                          damietta: "دمياط",
                          port_said: "بورسعيد",
                          ismailia: "الإسماعيلية",
                          suez: "السويس",
                          north_sinai: "شمال سيناء",
                          south_sinai: "جنوب سيناء",
                          red_sea: "البحر الأحمر",
                          new_valley: "الوادي الجديد",
                          matruh: "مطروح",
                          luxor: "الأقصر",
                          aswan: "أسوان",
                        };
                        return (
                          <option key={govKey} value={govKey}>
                            {isAr ? (govMap[govKey] || govKey) : govKey.replace("_", " ").toUpperCase()}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-navy mb-2 block">{isAr ? "المدينة" : "City"} *</span>
                    <input
                      type="text"
                      {...register("city", { required: isAr ? "المدينة مطلوبة" : "City is required" })}
                      className="input w-full p-4 rounded-2xl"
                    />
                  </label>

                  {shippingType === "courier" && (
                    <label className="block sm:col-span-2">
                      <span className="text-sm font-black text-navy mb-2 block">{isAr ? "العنوان بالتفصيل" : "Detailed Address"} *</span>
                      <input
                        type="text"
                        {...register("address", { required: isAr ? "العنوان مطلوب" : "Address is required" })}
                        className="input w-full p-4 rounded-2xl"
                        placeholder={isAr ? "الشارع، المنطقة، رقم المبنى" : "Street, Area, Building..."}
                      />
                    </label>
                  )}

                  {shippingType === "microbus" && (
                    <div className="sm:col-span-2 p-5 rounded-2xl bg-gold/10 border-2 border-gold/20 flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-gold flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-black text-navy leading-relaxed">
                        {isAr 
                          ? "سيتم إرسال الطلب للموقف الخاص بمدينتك. سيقوم فريقنا بالتواصل معك هاتفياً لتنسيق موعد ومكان الاستلام بدقة." 
                          : "Order will be sent to your city's station. Our team will contact you to coordinate the exact time and place."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Additional Services - REFINED DESIGN */}
          <div className="rounded-[40px] border-4 border-gold bg-gradient-to-br from-gold/20 via-white to-gold/10 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-40 w-40 bg-gold/30 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-navy text-gold flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                    <Wrench size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-navy leading-none mb-2">{isAr ? "خدمات إضافية مميزة" : "Premium Additional Services"}</h2>
                    <p className="text-xs font-black text-gold uppercase tracking-widest">{isAr ? "دعم فني هندسي متكامل" : "INTEGRATED ENGINEERING SUPPORT"}</p>
                  </div>
                </div>
                <div className="bg-navy text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter self-start sm:self-center">
                  {isAr ? "خدمة اختيارية" : "Optional Service"}
                </div>
              </div>

              <label className={cn(
                "flex items-start gap-5 p-6 rounded-3xl border-2 transition-all duration-300 shadow-sm cursor-pointer",
                watch("engineerVisit") 
                  ? "bg-navy border-navy text-white shadow-gold/20" 
                  : "bg-white border-gold/30 text-navy hover:border-gold hover:shadow-md"
              )}>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    {...register("engineerVisit")} 
                    className="w-8 h-8 rounded-xl border-gray-300 text-gold focus:ring-gold cursor-pointer" 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={cn("font-black text-xl leading-tight", watch("engineerVisit") ? "text-gold" : "text-navy")}>
                      {isAr ? "طلب زيارة مهندس مختص" : "Request Expert Engineer Visit"}
                    </p>
                    {watch("engineerVisit") && <CheckCircle size={20} className="text-gold animate-in zoom-in" />}
                  </div>
                  <p className={cn("text-sm leading-relaxed", watch("engineerVisit") ? "text-white/70" : "text-navy/60")}>
                    {isAr 
                      ? "نوفر لك مهندساً مختصاً للتركيب، التدريب، أو الكشف عن الأعطال والصيانة في موقعك." 
                      : "We provide an expert engineer for installation, training, or diagnostics and maintenance at your location."}
                  </p>
                  <div className={cn("mt-3 py-1.5 px-3 rounded-lg text-[10px] font-bold inline-block", watch("engineerVisit") ? "bg-white/10 text-gold" : "bg-gold/10 text-gold")}>
                    {isAr ? "سيتم التواصل لتحديد تكلفة الزيارة حسب موقعك" : "We will contact you to determine visit cost based on location"}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Payment */}
          <div className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <CreditCard size={24} className="text-gold" />
                </div>
                <h2 className="text-2xl font-black text-navy">{isAr ? "طريقة الدفع" : "Payment Method"}</h2>
              </div>
              {shippingType === "microbus" && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black border border-red-100 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {isAr ? "الدفع المسبق مطلوب للميكروباص" : "Prepayment required for Microbus"}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid gap-4">
                {/* Cash on Delivery - Hidden for Microbus */}
                {shippingType !== "microbus" && (
                  <label className={cn(
                    "relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    paymentMethod === "cod" ? "border-gold bg-gold/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  )}>
                    <div className="flex items-center gap-3">
                      <input type="radio" value="cod" {...register("paymentMethod")} className="w-5 h-5 text-gold focus:ring-gold" />
                      <div className="flex-1">
                        <span className="font-black text-navy text-lg">{isAr ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                        <p className="text-xs text-text-muted">{isAr ? "ادفع نقداً عند استلام المنتج من مندوب الشحن" : "Pay cash when you receive the product from the courier"}</p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Pre-payment methods */}
                {["instapay", "wallet"].map((method) => (
                  <label key={method} className={cn(
                    "relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    paymentMethod === method ? "border-gold bg-gold/5" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  )}>
                    <div className="flex items-center gap-3">
                      <input type="radio" value={method} {...register("paymentMethod")} className="w-5 h-5 text-gold focus:ring-gold" />
                      <div className="flex-1">
                        <span className="font-black text-navy text-lg">
                          {method === "instapay" ? "Instapay (انستا باي)" : 
                           (isAr ? "محفظة إلكترونية (فودافون كاش / الخ)" : "Digital Wallet (Vodafone Cash, etc.)")}
                        </span>
                        <p className="text-xs text-text-muted">
                          {method === "instapay" 
                            ? (isAr ? "تحويل سريع عبر تطبيق انستا باي" : "Fast transfer via Instapay app")
                            : (isAr ? "تحويل للمحفظة من أي رقم أو ماكينة فوري" : "Transfer to wallet from any number or Fawry machine")}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* COD Restricted Notice */}
              {shippingType === "microbus" && paymentMethod === "cod" && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold animate-pulse">
                  {isAr 
                    ? "عذراً، خيار الدفع عند الاستلام غير متاح عند الشحن مع الميكروباص. يرجى اختيار وسيلة دفع إلكترونية." 
                    : "Sorry, Cash on Delivery is not available for Microbus shipping. Please select an electronic payment method."}
                </div>
              )}

              {/* Dynamic Payment Details */}
              {(paymentMethod === "instapay" || paymentMethod === "wallet") && (
                <div className="p-6 rounded-3xl bg-navy-deep text-white space-y-6 border border-white/10 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 text-gold">
                    <PhoneIcon size={20} />
                    <p className="font-black text-base uppercase tracking-widest">{isAr ? "بيانات التحويل" : "Transfer Details"}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-[10px] text-white/50 uppercase font-black mb-1">
                          {paymentMethod === "instapay" ? (isAr ? "عنوان انستا باي (IPA)" : "Instapay Address") : (isAr ? "الرقم" : "Number")}
                        </p>
                        <p className="font-black tracking-widest text-lg">
                          {paymentMethod === "instapay" ? "01200160031@instapay" : "01144599925"}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const text = paymentMethod === "instapay" ? "01200160031@instapay" : "01144599925";
                          navigator.clipboard.writeText(text);
                          alert(isAr ? "تم النسخ" : "Copied");
                        }} 
                        className="p-3 rounded-xl bg-white/10 hover:bg-white/20"
                      >
                        <Copy size={20} />
                      </button>
                    </div>

                    {paymentMethod === "instapay" && (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-black mb-1">{isAr ? "رقم الهاتف المرتبط" : "Linked Phone Number"}</p>
                          <p className="font-black tracking-widest text-lg">01200160031</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText("01200160031");
                            alert(isAr ? "تم النسخ" : "Copied");
                          }} 
                          className="p-3 rounded-xl bg-white/10 hover:bg-white/20"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm leading-relaxed text-white/70 mb-6">
                      {isAr ? "يرجى إرسال لقطة شاشة للتحويل عبر واتساب." : "Please send a screenshot of the transfer via WhatsApp."}
                    </p>
                    <a href={`https://wa.me/201229256173`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 transition-colors font-black text-base">
                      <MessageCircle size={24} /> {isAr ? "إرسال عبر واتساب" : "Send via WhatsApp"}
                    </a>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-black text-navy">{isAr ? "ملاحظات إضافية" : "Additional Notes"}</span>
                <textarea {...register("notes")} rows={3} className="input mt-3 w-full resize-none p-4 rounded-2xl" placeholder={isAr ? "تعليمات خاصة..." : "Special instructions..."} />
              </label>
            </div>
          </div>

          <div className="relative pt-4">
            <div className="absolute inset-0 bg-gold blur-3xl opacity-20 animate-pulse pointer-events-none" />
            <button 
              type="button" 
              onClick={async () => {
                const isValid = await trigger();
                if (!isValid) {
                  const currentErrors = Object.keys(errors).length > 0 ? errors : { _unknown: true };
                  console.warn("Manual validation failed:", currentErrors);
                  const firstError = Object.keys(currentErrors)[0];
                  
                  const fieldNames: Record<string, string> = {
                    firstName: isAr ? "الاسم الأول" : "First Name",
                    lastName: isAr ? "اسم العائلة" : "Last Name",
                    phone: isAr ? "رقم الهاتف" : "Phone Number",
                    governorate: isAr ? "المحافظة" : "Governorate",
                    city: isAr ? "المدينة/المركز" : "City",
                    address: isAr ? "العنوان بالتفصيل" : "Detailed Address",
                    paymentMethod: isAr ? "طريقة الدفع" : "Payment Method",
                    shippingType: isAr ? "طريقة الاستلام" : "Shipping Method",
                  };
                  
                  const fieldName = firstError !== "_unknown" ? (fieldNames[firstError] || firstError) : "";
                  const msg = isAr 
                    ? `يرجى إكمال الحقل المطلوب: ${fieldName}`
                    : `Please complete the required field: ${fieldName}`;
                  
                  window.alert(msg);
                  addToast("error", msg);
                } else {
                  handleSubmit(onSubmit)();
                }
              }}
              disabled={isSubmitting} 
              className={cn(
                "relative z-10 w-full py-7 text-2xl font-black rounded-[32px] transition-all bg-gold text-navy shadow-xl",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (isAr ? "جارٍ الإرسال..." : "Processing...") : (isAr ? "تأكيد الطلب وإرساله الآن" : "CONFIRM ORDER NOW")}
            </button>
            <p className="text-center text-xs font-bold text-navy/40 mt-4 uppercase tracking-widest">
              {isAr ? "بضغطك هنا، أنت توافق على شروط الخدمة" : "By clicking, you agree to terms of service"}
            </p>
          </div>
        </form>

        {/* Order Summary */}
        <aside className="space-y-6">
          <div className="rounded-[40px] border border-gray-200 bg-white p-8 shadow-sm sticky top-24">
            <h3 className="text-2xl font-black text-navy mb-8 italic uppercase tracking-tight">{isAr ? "ملخص الطلب" : "Order Summary"}</h3>
            <div className="space-y-5 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-50 group-hover:border-gold transition-colors">
                    <img src={item.image} alt={isAr ? item.name_ar : item.name_en} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-navy text-sm truncate leading-tight mb-1">{isAr ? item.name_ar : item.name_en}</p>
                    <div className="text-[10px] font-bold text-text-muted uppercase">
                      {isAr ? "الكمية" : "Qty"}: {item.qty} {item.size && `| ${isAr ? "المقاس" : "Size"}: ${item.size}`}
                    </div>
                  </div>
                  <p className="font-black text-gold text-sm">{formatPrice((item.salePrice ?? item.price) * item.qty, locale)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-bold">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-black text-navy">{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted font-bold">{isAr ? "الشحن" : "Shipping"}</span>
                <span className="font-black text-navy">{shippingCost === 0 ? (isAr ? "مجاني" : "Free") : formatPrice(shippingCost, locale)}</span>
              </div>
              <div className="border-t-2 border-gray-50 pt-4 flex justify-between items-end">
                <span className="text-navy font-black text-xl italic uppercase">{isAr ? "الإجمالي" : "Total"}</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-gold leading-none">{formatPrice(total, locale)}</p>
                  <p className="text-[10px] font-black text-text-muted mt-1 uppercase">{isAr ? "شامل الضريبة" : "VAT Included"}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

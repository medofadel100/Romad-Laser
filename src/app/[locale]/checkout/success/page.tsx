import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, Phone, Mail } from "lucide-react";
import { getOrderById } from "@/lib/firestore.server";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: { locale: string };
  searchParams: { order?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sParams = await searchParams;
  const isAr = locale === "ar";
  const orderId = sParams.order;

  return {
    title: orderId
      ? isAr
        ? `تم الطلب #${orderId} | رماد ليزر`
        : `Order #${orderId} Confirmed | Romad Laser`
      : isAr
      ? "تم الطلب | رماد ليزر"
      : "Order Confirmed | Romad Laser",
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sParams = await searchParams;
  const isAr = locale === "ar";
  const orderId = sParams.order;

  if (!orderId) {
    notFound();
  }

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const phone1 = process.env.NEXT_PUBLIC_PHONE_1;
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@romadlaser.com";

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-white mb-4">
          {isAr ? "تم تأكيد طلبك!" : "Order Confirmed!"}
        </h1>

        <p className="text-lg text-text-muted mb-8">
          {isAr
            ? "شكرًا لك على طلبك. سنتصل بك قريبًا لتأكيد التفاصيل."
            : "Thank you for your order. We'll contact you soon to confirm details."}
        </p>

        {/* Order Details */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-8 text-start">
          <div className="flex items-center gap-3 mb-6">
            <Package size={24} className="text-gold" />
            <h2 className="text-xl font-bold text-white">
              {isAr ? "تفاصيل الطلب" : "Order Details"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted">{isAr ? "رقم الطلب" : "Order Number"}</span>
              <span className="font-semibold text-navy">#{orderId}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted">{isAr ? "تاريخ الطلب" : "Order Date"}</span>
              <span className="font-semibold text-navy">
                {new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleDateString(
                  isAr ? "ar-EG" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted">{isAr ? "حالة الطلب" : "Order Status"}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                {isAr ? "قيد المراجعة" : "Under Review"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted">{isAr ? "طريقة الدفع" : "Payment Method"}</span>
              <span className="font-semibold text-navy">
                {order.paymentMethod === "cod"
                  ? (isAr ? "الدفع عند الاستلام" : "Cash on Delivery")
                  : order.paymentMethod === "instapay"
                  ? "Instapay"
                  : order.paymentMethod === "wallet"
                  ? (isAr ? "محفظة إلكترونية" : "Digital Wallet")
                  : (isAr ? "غير محدد" : "Other")}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted">{isAr ? "إجمالي الطلب" : "Order Total"}</span>
              <span className="font-black text-gold text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-8 text-start">
          <div className="flex items-center gap-3 mb-6">
            <Truck size={24} className="text-gold" />
            <h2 className="text-xl font-bold text-white">
              {isAr ? "معلومات الشحن" : "Shipping Information"}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-text-muted">{isAr ? "الاسم" : "Name"}</p>
              <p className="font-semibold text-navy">{order.shippingAddress.name}</p>
            </div>
            <div>
              <p className="text-text-muted">{isAr ? "البريد الإلكتروني" : "Email"}</p>
              <p className="font-semibold text-navy">{order.guestInfo?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-text-muted">{isAr ? "الهاتف" : "Phone"}</p>
              <p className="font-semibold text-navy" dir="ltr">{order.shippingAddress.phone}</p>
            </div>
            <div>
              <p className="text-text-muted">{isAr ? "المدينة" : "City"}</p>
              <p className="font-semibold text-navy">{order.shippingAddress.city}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-text-muted">{isAr ? "العنوان" : "Address"}</p>
              <p className="font-semibold text-navy">{order.shippingAddress.details}</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            {isAr ? "الخطوات التالية" : "Next Steps"}
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>
                {isAr
                  ? "سنراجع طلبك ونؤكد التوفر والأسعار خلال 24 ساعة"
                  : "We'll review your order and confirm availability and pricing within 24 hours"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>
                {isAr
                  ? "سنتصل بك لتأكيد تفاصيل الشحن والدفع"
                  : "We'll contact you to confirm shipping and payment details"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>
                {isAr
                  ? "سيتم شحن طلبك خلال 3-5 أيام عمل بعد التأكيد"
                  : "Your order will be shipped within 3-5 business days after confirmation"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 mb-8">
          <h3 className="text-lg font-bold text-navy mb-4">
            {isAr ? "تواصل معنا" : "Contact Us"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {phone1 && (
              <a
                href={`tel:+2${phone1}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Phone size={20} className="text-gold" />
                <div>
                  <p className="font-semibold text-navy text-sm">{isAr ? "الهاتف" : "Phone"}</p>
                  <p className="text-text-muted text-sm" dir="ltr">{phone1}</p>
                </div>
              </a>
            )}
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Mail size={20} className="text-gold" />
              <div>
                <p className="font-semibold text-navy text-sm">{isAr ? "البريد الإلكتروني" : "Email"}</p>
                <p className="text-text-muted text-sm">{email}</p>
              </div>
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors sm:col-span-2"
              >
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">{isAr ? "واتساب" : "WhatsApp"}</p>
                  <p className="text-text-muted text-sm">{isAr ? "تواصل سريع" : "Quick contact"}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/shop`} className="btn btn-outline">
            {isAr ? "متابعة التسوق" : "Continue Shopping"}
          </Link>
          <Link href={`/${locale}/account/orders`} className="btn btn-primary">
            {isAr ? "تتبع الطلبات" : "Track Orders"}
          </Link>
        </div>
      </div>
    </main>
  );
}

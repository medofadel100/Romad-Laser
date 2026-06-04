"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Printer, 
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Building2,
  Layers
} from "lucide-react";
import { formatPrice, cn, formatWhatsAppPhone } from "@/lib/utils";
import type { Order, AppUser, OrderStatus } from "@/types";
import { updateOrder } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";

interface OrderDetailClientProps {
  locale: any;
  order: Order;
  customerUser: AppUser | null;
}

const statusMap: Record<OrderStatus, { label_ar: string; label_en: string; color: string; icon: any }> = {
  pending: { label_ar: "قيد المراجعة", label_en: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  confirmed: { label_ar: "تم التأكيد", label_en: "Confirmed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2 },
  processing: { label_ar: "جاري التجهيز", label_en: "Processing", color: "text-purple-600 bg-purple-50 border-purple-200", icon: Package },
  shipped: { label_ar: "تم الشحن", label_en: "Shipped", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Truck },
  delivered: { label_ar: "تم التوصيل", label_en: "Delivered", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  cancelled: { label_ar: "ملغي", label_en: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
};

export default function OrderDetailClient({ locale, order, customerUser }: OrderDetailClientProps) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateOrder(order.id, { status: newStatus });
      setCurrentStatus(newStatus);
      addToast("success", isAr ? "تم تحديث حالة الطلب بنجاح" : "Order status updated successfully");
    } catch (error) {
      addToast("error", isAr ? "فشل تحديث الحالة" : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const generateFullOrderMessage = (statusText?: string) => {
    // Brand Intro
    const intro = isAr 
      ? `*شركة روما ليزر - Romaα Laser* 🛠️\nمرحباً أ/ ${order.shippingAddress.name}، نتشرف بالتواصل معك بخصوص طلبك رقم #${order.id}\n\n`
      : `*Romaα Laser Company* 🛠️\nHello ${order.shippingAddress.name}, we are contacting you regarding your order #${order.id}\n\n`;

    // Status or CTA
    const header = statusText ? `*${statusText}*\n\n` : "";

    // Items Summary
    const itemsList = order.items.map(item => 
      `• ${isAr ? item.name_ar : item.name_en} ${item.size ? `(المقاس: ${item.size})` : ""} [x${item.qty}]`
    ).join("\n");
    
    const summary = isAr
      ? `*تفاصيل الطلب:*\n${itemsList}\n*الإجمالي الكلي:* ${formatPrice(order.total, locale)}\n\n`
      : `*Order Details:*\n${itemsList}\n*Grand Total:* ${formatPrice(order.total, locale)}\n\n`;

    // Payment Info
    const payment = isAr
      ? `*بيانات التحويل لتأكيد الطلب:* 💳\n- انستا باي (InstaPay): 01200160031\n- محفظة فودافون كاش: 01144599925\n\n`
      : `*Transfer Details for Confirmation:* 💳\n- InstaPay: 01200160031\n- Vodafone Cash: 01144599925\n\n`;

    // Contact Info
    const contact = isAr
      ? `*لأي استفسار يمكنك التواصل معنا:* 📞\n01229256173 - 01144599925\n\n*شكراً لثقتك في روما ليزر.*`
      : `*For inquiries, contact us:* 📞\n01229256173 - 01144599925\n\n*Thank you for choosing Romaα Laser.*`;

    return intro + header + summary + payment + contact;
  };

  const getWhatsAppLink = (customMessage?: string) => {
    const formattedPhone = formatWhatsAppPhone(order.shippingAddress.phone);
    const fullMessage = customMessage || generateFullOrderMessage();
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(fullMessage)}`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 text-gold font-bold text-sm mb-2 uppercase tracking-widest">
            <span className="w-8 h-[2px] bg-gold rounded-full" />
            {isAr ? "إدارة الطلب" : "Manage Order"}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-navy flex items-center gap-4">
            #{order.id}
            {(() => {
              const StatusIcon = statusMap[currentStatus].icon;
              return (
                <span className={cn(
                  "text-xs px-4 py-1.5 rounded-full border font-bold flex items-center gap-2",
                  statusMap[currentStatus].color
                )}>
                  {StatusIcon && <StatusIcon size={14} />}
                  {isAr ? statusMap[currentStatus].label_ar : statusMap[currentStatus].label_en}
                </span>
              );
            })()}
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            {new Date(order.createdAt as any).toLocaleString(isAr ? "ar-EG" : "en-US", {
              dateStyle: "full",
              timeStyle: "short"
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="btn btn-outline h-12 px-6 rounded-2xl flex items-center gap-2 border-gray-200 text-navy hover:bg-gray-50"
          >
            <Printer size={18} />
            {isAr ? "طباعة" : "Print"}
          </button>
          
          <div className="relative group">
            <button className={cn(
              "btn h-12 px-6 rounded-2xl flex items-center gap-2 font-bold transition-all",
              isUpdating ? "bg-gray-100 text-gray-400" : "bg-navy text-white hover:bg-navy-deep shadow-lg shadow-navy/20"
            )}>
              {isAr ? "تحديث الحالة" : "Update Status"}
              <ChevronRight size={18} className="rotate-90 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <div className="absolute top-full end-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {(Object.keys(statusMap) as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={cn(
                    "w-full text-start px-5 py-3.5 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-between",
                    currentStatus === status ? "text-gold" : "text-navy"
                  )}
                >
                  {isAr ? statusMap[status].label_ar : statusMap[status].label_en}
                  {currentStatus === status && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>

          <a 
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn h-12 px-6 rounded-2xl bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 font-bold"
          >
            <MessageSquare size={18} />
            {isAr ? "واتساب" : "WhatsApp"}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Content & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy flex items-center gap-3">
                <Package className="text-gold" size={22} />
                {isAr ? "المنتجات" : "Products"}
                <span className="text-xs bg-navy text-white px-2 py-0.5 rounded-lg">{order.items.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="p-6 flex items-center gap-4 group">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img src={item.image} alt={isAr ? item.name_ar : item.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy truncate hover:text-gold transition-colors cursor-default">
                      {isAr ? item.name_ar : item.name_en}
                    </h3>
                    
                    {/* ULTRA-PROMINENT Option/Size Display */}
                    {item.size ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="bg-navy text-gold px-3 py-1.5 rounded-lg border border-gold/40 flex items-center gap-2 shadow-lg">
                          <Layers size={16} />
                          <span className="text-xs font-black uppercase tracking-tight">
                            {isAr ? "المقاس/النوع المختار:" : "SELECTED OPTION:"}
                          </span>
                          <span className="text-sm font-black text-white bg-white/20 px-2.5 py-0.5 rounded">
                            {item.size}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted font-bold italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <AlertCircle size={12} />
                        {isAr 
                          ? "لا يوجد اختيار مسجل (قد يكون طلب قديم أو منتج بدون مقاسات)" 
                          : "No option recorded (Old order or product without variations)"}
                      </div>
                    )}

                    <p className="text-text-muted text-sm mt-3 font-medium flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-navy font-bold">{item.qty}x</span>
                      {formatPrice(item.price, locale)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-black text-navy">{formatPrice(item.price * item.qty, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="p-8 bg-navy text-white">
              <div className="space-y-3">
                <div className="flex justify-between text-white/60">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{formatPrice(order.subtotal, locale)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>{isAr ? "الخصم" : "Discount"} {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-{formatPrice(order.discountAmount, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>{isAr ? "مصاريف الشحن" : "Shipping Cost"}</span>
                  <span>{formatPrice(order.shippingCost, locale)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-lg font-bold">{isAr ? "الإجمالي الكلي" : "Grand Total"}</span>
                  <span className="text-3xl font-black text-gold">{formatPrice(order.total, locale)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Update Log / History Placeholder */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy flex items-center gap-3">
                <MessageSquare className="text-gold" size={22} />
                {isAr ? "تحديثات التواصل" : "Communication Updates"}
              </h2>
              <a 
                href={getWhatsAppLink(generateFullOrderMessage(isAr 
                  ? `تحديث: حالة طلبك أصبحت الآن [ ${statusMap[currentStatus].label_ar} ] ✅` 
                  : `Update: Your order status is now [ ${statusMap[currentStatus].label_en} ] ✅`
                ))}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold text-sm font-bold hover:underline"
              >
                {isAr ? "إرسال تحديث بالحالة الحالية" : "Send update with current status"}
              </a>
            </div>
            
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900 leading-relaxed">
                <p className="font-bold mb-1">{isAr ? "نصيحة إدارية" : "Admin Tip"}</p>
                {isAr 
                  ? "ننصح دائماً بإرسال رسالة واتساب للعميل عند تغيير حالة الطلب لضمان تجربة مستخدم ممتازة." 
                  : "We always recommend sending a WhatsApp message to the customer when changing order status for an excellent UX."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping Info */}
        <div className="space-y-8">
          {/* Customer Profile */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-3">
              <User className="text-gold" size={22} />
              {isAr ? "بيانات العميل" : "Customer Data"}
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-navy border border-gray-100">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{isAr ? "الاسم" : "Name"}</p>
                  <p className="font-bold text-navy text-lg">{order.shippingAddress.name}</p>
                </div>
              </div>

              {customerUser?.workshopName && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/5 flex items-center justify-center text-gold border border-gold/10">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{isAr ? "اسم الورشة/المكان" : "Workshop/Location"}</p>
                    <p className="font-bold text-navy text-lg">{customerUser.workshopName}</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gold" />
                  <span className="text-navy font-bold" dir="ltr">{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User size={16} className="text-gold" />
                  <span className="text-navy">{order.guestInfo?.email || customerUser?.email || "No Email"}</span>
                </div>
              </div>

              <a 
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-navy text-white font-bold hover:bg-navy-deep transition-all flex items-center justify-center gap-2"
              >
                {isAr ? "تواصل مباشر" : "Direct Contact"}
                <ArrowRight size={18} className={isAr ? "rotate-180" : ""} />
              </a>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-3">
              <Truck className="text-gold" size={22} />
              {isAr ? "معلومات الشحن" : "Shipping Info"}
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">{isAr ? "طريقة الشحن" : "Shipping Method"}</p>
                <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-navy inline-block">
                  {order.shippingType === "microbus" ? (isAr ? "ميكروباص (موقف)" : "Microbus") : 
                   order.shippingType === "pickup" ? (isAr ? "استلام من المقر" : "Pickup") : (isAr ? "شركة شحن" : "Courier")}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gold mt-1" />
                <div>
                  <p className="font-bold text-navy">{order.shippingAddress.governorate}, {order.shippingAddress.city}</p>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">{order.shippingAddress.details}</p>
                </div>
              </div>

              {order.notes && (
                <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
                  <p className="text-xs text-yellow-800 font-bold uppercase tracking-wider mb-1">{isAr ? "ملاحظات العميل" : "Customer Notes"}</p>
                  <p className="text-sm text-yellow-900">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-3">
              <Clock className="text-gold" size={22} />
              {isAr ? "بيانات الدفع" : "Payment Details"}
            </h2>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">{isAr ? "الوسيلة" : "Method"}</span>
                <span className="font-bold text-navy uppercase">
                  {order.paymentMethod === "instapay" ? "Instapay" : 
                   order.paymentMethod === "wallet" ? (isAr ? "محفظة إلكترونية" : "E-Wallet") : 
                   (isAr ? "دفع عند الاستلام" : "Cash on Delivery")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">{isAr ? "حالة الدفع" : "Status"}</span>
                <span className={cn(
                  "font-bold px-3 py-1 rounded-lg text-[10px] uppercase",
                  order.paymentStatus === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                  {isAr ? (order.paymentStatus === "confirmed" ? "مؤكد" : "قيد المراجعة") : order.paymentStatus}
                </span>
              </div>
              
              {/* Confirm Payment Button (Only if not already confirmed and not COD) */}
              {order.paymentMethod !== "cod" && order.paymentStatus !== "confirmed" && (
                <button
                  onClick={async () => {
                    if (window.confirm(isAr ? "هل أنت متأكد من تأكيد استلام المبلغ؟" : "Are you sure you want to confirm payment receipt?")) {
                      setIsUpdating(true);
                      try {
                        await updateOrder(order.id, { paymentStatus: "confirmed" });
                        addToast("success", isAr ? "تم تأكيد الدفع بنجاح" : "Payment confirmed successfully");
                        window.location.reload();
                      } catch (error) {
                        addToast("error", isAr ? "فشل تأكيد الدفع" : "Failed to confirm payment");
                      } finally {
                        setIsUpdating(false);
                      }
                    }
                  }}
                  disabled={isUpdating}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {isAr ? "تأكيد استلام المبلغ" : "Confirm Payment"}
                </button>
              )}

              {/* Request Payment Screenshot via WhatsApp (If not confirmed and not COD) */}
              {order.paymentMethod !== "cod" && order.paymentStatus !== "confirmed" && (
                <a
                  href={getWhatsAppLink(generateFullOrderMessage(isAr 
                    ? "⚠️ يرجى إرسال صورة إيصال التحويل (سكرين شوت) لتأكيد الطلب وبدء التجهيز في أسرع وقت."
                    : "⚠️ Please send a screenshot of the transfer receipt to confirm your order and start processing."
                  ))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 font-bold text-sm hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  {isAr ? "طلب إيصال التحويل" : "Request Receipt"}
                </a>
              )}
              
              {order.paymentScreenshot && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">{isAr ? "إيصال التحويل المرفوع" : "Uploaded Receipt"}</p>
                  <a 
                    href={order.paymentScreenshot} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl border border-gray-100 hover:opacity-80 transition-opacity bg-gray-50"
                  >
                    <img src={order.paymentScreenshot} alt="Payment" className="w-full h-auto max-h-60 object-contain mx-auto" />
                    <div className="p-3 text-center text-xs font-bold text-navy">
                      {isAr ? "عرض الإيصال بالحجم الكامل" : "View Full Receipt"}
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

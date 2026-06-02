"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Truck, 
  MapPin, 
  Phone,
  CheckCircle,
  Clock,
  MessageCircle,
  MoreVertical,
  ShoppingBag,
  FileText
} from "lucide-react";
import { updateOrder } from "@/lib/firestore";
import { formatPrice, cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import type { Order, OrderStatus } from "@/types";

interface ShipmentsAdminClientProps {
  initialOrders: Order[];
  locale: any;
}

const statusMap: Record<OrderStatus, { label_ar: string; label_en: string; color: string; icon: any }> = {
  pending: { label_ar: "قيد الانتظار", label_en: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label_ar: "تم التأكيد", label_en: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  processing: { label_ar: "جاري التجهيز", label_en: "Processing", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: ShoppingBag },
  shipped: { label_ar: "في الطريق (تم الشحن)", label_en: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label_ar: "تم التوصيل", label_en: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { label_ar: "ملغي", label_en: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: Clock },
};

export default function ShipmentsAdminClient({ initialOrders, locale }: ShipmentsAdminClientProps) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      await updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      addToast("success", isAr ? "تم تحديث حالة الشحنة بنجاح" : "Shipment status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      addToast("error", isAr ? "فشل تحديث الحالة" : "Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  const openWhatsApp = (phone: string, orderId: string, name: string) => {
    const formattedPhone = phone.startsWith("0") ? `+2${phone}` : phone;
    const msg = isAr 
      ? `أهلاً بك أستاذ/ة ${name} من رماد ليزر، بخصوص طلبك رقم #${orderId.slice(-6).toUpperCase()}...`
      : `Hello ${name} from Romad Laser, regarding your order #${orderId.slice(-6).toUpperCase()}...`;
    window.open(`https://wa.me/${formattedPhone.replace(/\+/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="container-romad py-8 lg:py-12 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-purple-100">
              <Truck size={32} />
            </div>
            <h1 className="text-3xl font-black text-navy tracking-tight mb-2">
              {isAr ? "إدارة الشحنات واللوجستيات" : "Shipments & Logistics"}
            </h1>
            <p className="text-text-muted font-bold">
              {isAr ? "متابعة الطلبات الجاري تجهيزها وشحنها للعملاء" : "Track orders being processed and shipped to customers"}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-3xl font-black text-indigo-600 mb-1">
                {orders.filter(o => o.status === "processing" || o.status === "confirmed").length}
              </p>
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest">{isAr ? "قيد التجهيز" : "Processing"}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-3xl font-black text-purple-600 mb-1">
                {orders.filter(o => o.status === "shipped").length}
              </p>
              <p className="text-xs font-bold text-purple-800 uppercase tracking-widest">{isAr ? "في الطريق" : "In Transit"}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={isAr ? "بحث برقم الطلب، اسم العميل، المحافظة..." : "Search by ID, name, governorate..."}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none transition-colors font-bold text-sm bg-white text-navy"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-12 px-6 rounded-2xl border-2 border-gray-100 bg-white font-bold text-navy outline-none focus:border-gold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">{isAr ? "كل الشحنات" : "All Shipments"}</option>
            <option value="processing">{isAr ? "جاري التجهيز" : "Processing"}</option>
            <option value="shipped">{isAr ? "تم الشحن" : "Shipped"}</option>
            <option value="delivered">{isAr ? "تم التوصيل" : "Delivered"}</option>
          </select>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => {
            const status = statusMap[order.status] || statusMap.pending;
            const StatusIcon = status.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 justify-between lg:items-center hover:border-gold/30 transition-colors">
                
                {/* Info Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-navy/5 text-navy rounded-lg text-xs font-black uppercase tracking-widest">
                        #{order.id.slice(-6)}
                      </span>
                      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border", status.color)}>
                        <StatusIcon size={12} />
                        {isAr ? status.label_ar : status.label_en}
                      </span>
                    </div>
                    <p className="text-xl font-black text-navy">{order.shippingAddress.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => openWhatsApp(order.shippingAddress.phone, order.id, order.shippingAddress.name)}
                        className="flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <MessageCircle size={14} /> {order.shippingAddress.phone}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin size={14} /> {isAr ? "عنوان الشحن" : "Shipping Address"}
                    </p>
                    <p className="font-bold text-navy">{order.shippingAddress.governorate}</p>
                    <p className="text-sm text-text-muted mt-1 truncate max-w-xs" title={order.shippingAddress.details}>
                      {order.shippingAddress.city}, {order.shippingAddress.details}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1 flex items-center gap-1">
                      <ShoppingBag size={14} /> {isAr ? "تفاصيل الشحنة" : "Shipment Details"}
                    </p>
                    <p className="font-black text-gold">{formatPrice(order.total, locale)}</p>
                    <p className="text-sm text-text-muted font-bold mt-1">
                      {order.items.length} {isAr ? "عنصر" : "items"} • {isAr ? (order.shippingType === "courier" ? "شحن شركة" : "ميكروباص") : order.shippingType}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-s border-gray-100 pt-4 lg:pt-0 lg:ps-6">
                  {order.status !== "shipped" && order.status !== "delivered" && (
                    <button 
                      onClick={() => handleStatusUpdate(order.id, "shipped")}
                      disabled={isUpdating === order.id}
                      className="btn w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> {isAr ? "تحديد كـ (تم الشحن)" : "Mark Shipped"}
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button 
                      onClick={() => handleStatusUpdate(order.id, "delivered")}
                      disabled={isUpdating === order.id}
                      className="btn w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> {isAr ? "تحديد كـ (مُسلمة)" : "Mark Delivered"}
                    </button>
                  )}
                  
                  <Link 
                    href={`/${locale}/admin/orders/${order.id}`}
                    className="btn btn-outline w-full py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <FileText size={16} /> {isAr ? "التفاصيل والملاحظات" : "Details & Notes"}
                  </Link>
                </div>

              </div>
            );
          }) : (
            <div className="bg-white p-16 rounded-[32px] border border-gray-100 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Truck size={48} />
              </div>
              <h3 className="text-xl font-black text-navy mb-2">{isAr ? "لا توجد شحنات" : "No Shipments Found"}</h3>
              <p className="text-text-muted font-bold max-w-sm">
                {isAr ? "لم نتمكن من العثور على أي شحنات تطابق بحثك الحالي." : "We couldn't find any shipments matching your current filters."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  MoreVertical,
  Calendar,
  User,
  Phone,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { updateOrder } from "@/lib/firestore";
import { formatPrice, cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import type { Order, OrderStatus } from "@/types";

interface OrdersAdminClientProps {
  initialOrders: Order[];
  locale: any;
}

const statusMap: Record<OrderStatus, { label_ar: string; label_en: string; color: string; icon: any }> = {
  pending: { label_ar: "قيد الانتظار", label_en: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  confirmed: { label_ar: "تم التأكيد", label_en: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  processing: { label_ar: "قيد التحضير", label_en: "Processing", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: ShoppingBag },
  shipped: { label_ar: "تم الشحن", label_en: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label_ar: "تم التوصيل", label_en: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { label_ar: "ملغي", label_en: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function OrdersAdminClient({ initialOrders, locale }: OrdersAdminClientProps) {
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
      addToast("success", isAr ? "تم تحديث حالة الطلب" : "Order status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      addToast("error", isAr ? "فشل تحديث الحالة" : "Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <main className="container-romad py-8 lg:py-12 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-gold">
              <Link href={`/${locale}/admin`} className="hover:underline flex items-center gap-1 text-sm font-bold">
                {isAr ? "لوحة التحكم" : "Dashboard"}
              </Link>
              <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
              <span className="text-sm font-bold opacity-60">{isAr ? "الطلبات" : "Orders"}</span>
            </div>
            <h1 className="text-4xl font-black text-navy">{isAr ? "إدارة الطلبات" : "Order Management"}</h1>
            <p className="text-text-muted mt-2">{isAr ? `لديك ${orders.length} طلب إجمالي` : `You have ${orders.length} total orders`}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder={isAr ? "بحث بالاسم، الرقم، أو الكود..." : "Search by name, phone, ID..."}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-gold outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-navy outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
              {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>{isAr ? value.label_ar : value.label_en}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table/List */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest">{isAr ? "الطلب" : "Order"}</th>
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest">{isAr ? "العميل" : "Customer"}</th>
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-5 text-xs font-black text-navy uppercase tracking-widest text-center">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                  const status = statusMap[order.status];
                  const StatusIcon = status.icon;
                  const date = order.createdAt ? (order.createdAt as any).toDate?.() || new Date(order.createdAt as any) : new Date();

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-navy">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] text-text-muted font-bold">{order.items.length} {isAr ? "قطع" : "items"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-navy truncate max-w-[150px]">{order.shippingAddress.name}</span>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Phone size={10} /> {order.shippingAddress.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-navy">{date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                          <span className="text-[10px] text-text-muted uppercase">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-black text-gold">{formatPrice(order.total, locale)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-tighter", status.color)}>
                          <StatusIcon size={12} />
                          {isAr ? status.label_ar : status.label_en}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/${locale}/admin/orders/${order.id}`}
                            className="p-2.5 rounded-xl bg-white border border-gray-200 text-navy hover:bg-gold hover:border-gold hover:text-navy transition-all shadow-sm"
                            title={isAr ? "عرض التفاصيل" : "View Details"}
                          >
                            <Eye size={18} />
                          </Link>
                          
                          <div className="relative group">
                            <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-navy hover:bg-navy hover:text-white transition-all shadow-sm">
                              {isUpdating === order.id ? (
                                <div className="w-4.5 h-4.5 border-2 border-gray-300 border-t-navy animate-spin rounded-full" />
                              ) : (
                                <MoreVertical size={18} />
                              )}
                            </button>
                            
                            {/* Simple Status Dropdown */}
                            <div className="absolute right-0 rtl:left-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                              <div className="p-2 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-text-muted tracking-widest text-center">
                                {isAr ? "تغيير الحالة" : "Change Status"}
                              </div>
                              {Object.entries(statusMap).map(([key, value]) => (
                                <button
                                  key={key}
                                  onClick={() => handleStatusUpdate(order.id, key as OrderStatus)}
                                  className={cn(
                                    "w-full px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                    order.status === key ? "text-gold bg-gold/5" : "text-navy"
                                  )}
                                >
                                  <value.icon size={14} />
                                  {isAr ? value.label_ar : value.label_en}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                          <ShoppingBag size={40} />
                        </div>
                        <p className="text-text-muted font-bold">{isAr ? "لا يوجد طلبات تطابق بحثك" : "No orders found matching your search"}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

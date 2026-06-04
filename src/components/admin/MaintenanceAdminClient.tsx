"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Wrench, 
  Settings, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  Search,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle
} from "lucide-react";
import { formatPrice, cn, EGYPT_GOVERNORATES } from "@/lib/utils";
import type { MaintenanceRequest, Order } from "@/types";
import { useUIStore } from "@/store/uiStore";

interface MaintenanceAdminClientProps {
  initialRequests: MaintenanceRequest[];
  orderRequests: Order[];
  locale: string;
}

export default function MaintenanceAdminClient({ initialRequests, orderRequests, locale }: MaintenanceAdminClientProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"orders" | "standalone">("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredOrderRequests = orderRequests.filter(order => {
    const isCompleted = order.adminNotes && order.adminNotes.includes("[تم إنشاء تقرير صيانة:");
    if (statusFilter === "pending" && isCompleted) return false;
    if (statusFilter === "completed" && !isCompleted) return false;

    return order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.phone.includes(searchTerm);
  });

  const filteredStandaloneRequests = initialRequests.filter(req => {
    const isCompleted = req.status === "completed";
    if (statusFilter === "pending" && isCompleted) return false;
    if (statusFilter === "completed" && !isCompleted) return false;

    return req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerPhone.includes(searchTerm);
  });

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-navy text-gold flex items-center justify-center mb-6 shadow-xl">
            <Wrench size={32} />
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight mb-2">
            {isAr ? "إدارة الصيانة والزيارات" : "Maintenance & Visits"}
          </h1>
          <p className="text-text-muted font-bold">
            {isAr ? "متابعة طلبات الصيانة وتعيين المهندسين" : "Track maintenance requests and assign engineers"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href={`/${locale}/admin/maintenance/new`} className="px-6 py-4 rounded-2xl bg-gold text-navy font-black hover:bg-yellow-400 transition-colors shadow-lg hover:-translate-y-1 flex items-center gap-2">
            <FileText size={20} />
            {isAr ? "إنشاء تقرير مباشر" : "Create Direct Report"}
          </Link>
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-orange-600 mb-1">{filteredStandaloneRequests.length}</p>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">{isAr ? "طلبات مباشرة" : "Direct Req"}</p>
          </div>
          <div className="bg-navy/5 border border-navy/10 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-navy mb-1">{filteredOrderRequests.length}</p>
            <p className="text-xs font-bold text-navy/80 uppercase tracking-widest">{isAr ? "صيانة طلبات" : "Order Req"}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === "orders" 
                ? "bg-navy text-white shadow-md" 
                : "text-text-muted hover:text-navy hover:bg-gray-50"
            )}
          >
            <Settings size={18} />
            {isAr ? "زيارات مع الطلبات" : "Order Visits"}
          </button>
          <button
            onClick={() => setActiveTab("standalone")}
            className={cn(
              "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === "standalone" 
                ? "bg-navy text-white shadow-md" 
                : "text-text-muted hover:text-navy hover:bg-gray-50"
            )}
          >
            <AlertCircle size={18} />
            {isAr ? "طلبات الصيانة المباشرة" : "Direct Requests"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn("px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap", statusFilter === "all" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
            >
              {isAr ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={cn("px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-1 whitespace-nowrap", statusFilter === "pending" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
            >
              <AlertCircle size={14} /> {isAr ? "بحاجة للصيانة" : "Needs Maint."}
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={cn("px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-1 whitespace-nowrap", statusFilter === "completed" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
            >
              <CheckCircle2 size={14} /> {isAr ? "تمت الصيانة" : "Completed"}
            </button>
          </div>
          <div className="relative w-full sm:w-80 shrink-0">
            <input
              type="text"
              placeholder={isAr ? "بحث بالاسم، رقم الطلب، الهاتف..." : "Search name, order ID, phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none transition-colors font-bold text-sm bg-white text-navy"
              dir={isAr ? "rtl" : "ltr"}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === "orders" ? (
          <div className="divide-y divide-gray-50">
            {filteredOrderRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-bold">
                {isAr ? "لا توجد زيارات مرتبطة بطلبات" : "No order visits found"}
              </div>
            ) : (
              filteredOrderRequests.map(order => (
                <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black uppercase tracking-widest">
                        {order.id.slice(-6)}
                      </span>
                      <span className="text-sm font-bold text-text-muted flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(order.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                      {order.adminNotes && order.adminNotes.includes("[تم إنشاء تقرير صيانة:") && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black flex items-center gap-1">
                          <CheckCircle2 size={14} /> {isAr ? "تمت الصيانة" : "Completed"}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-black text-navy text-lg">{order.shippingAddress.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-muted font-bold">
                        <span className="flex items-center gap-1"><Phone size={14} className="text-gold" /> {order.shippingAddress.phone}</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gold" />{" "}
                          {(() => {
                            const govKey = order.shippingAddress.governorate.toLowerCase();
                            const govData = EGYPT_GOVERNORATES[govKey];
                            return govData ? (isAr ? govData.nameAr : govData.nameEn) : order.shippingAddress.governorate;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    <div className="text-sm font-bold bg-gray-100 px-4 py-2 rounded-xl text-navy w-full sm:w-auto text-center">
                      {isAr ? "مرتبط بطلب بيع" : "Linked to Sale Order"}
                    </div>
                    <Link 
                      href={`/${locale}/admin/maintenance/${order.id}`}
                      className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-deep transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <FileText size={16} />
                      {isAr ? "كتابة/عرض التقرير" : "Write/View Report"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredStandaloneRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-bold">
                {isAr ? "لا توجد طلبات صيانة مباشرة" : "No direct maintenance requests"}
              </div>
            ) : (
              filteredStandaloneRequests.map(req => (
                <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black uppercase tracking-widest">
                        {req.id.slice(-6)}
                      </span>
                      <span className="text-sm font-bold text-text-muted flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(req.createdAt as any).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                      {req.status === "completed" && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black flex items-center gap-1">
                          <CheckCircle2 size={14} /> {isAr ? "تمت الصيانة" : "Completed"}
                        </span>
                      )}
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                        req.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        req.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                        req.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div>
                      <p className="font-black text-navy text-lg">{req.customerName}</p>
                      {req.workshopName && <p className="text-sm font-bold text-gold">{req.workshopName}</p>}
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-muted font-bold">
                        <span className="flex items-center gap-1"><Phone size={14} className="text-gold" /> {req.customerPhone}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-gold" /> {req.workshopAddress}</span>
                      </div>
                      {req.description && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    <Link 
                      href={`/${locale}/admin/maintenance/${req.id}`}
                      className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-deep transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <FileText size={16} />
                      {isAr ? "كتابة التقرير" : "Write Report"}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

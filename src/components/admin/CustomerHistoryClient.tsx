"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Wrench, 
  Calendar,
  FileText
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

export default function CustomerHistoryClient({ customer, orders, reports, locale }: any) {
  const isAr = locale === "ar";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/admin/staff`} className="text-sm font-bold text-navy/60 hover:text-navy inline-flex items-center gap-2 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isAr ? "العودة للعملاء/الموظفين" : "Back to Staff/Customers"}
        </Link>
      </div>

      <div className="bg-navy p-8 rounded-[32px] text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <User className="text-gold" size={32} />
            {customer.name}
          </h1>
          {customer.workshopName && <p className="text-gold font-bold text-lg mb-4">{customer.workshopName}</p>}
          
          <div className="flex flex-wrap gap-4 text-sm font-medium text-white/80">
            {customer.phone && <span className="flex items-center gap-1"><Phone size={14}/> <span dir="ltr">{customer.phone}</span></span>}
            {customer.email && <span className="flex items-center gap-1"><Mail size={14}/> {customer.email}</span>}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/5 min-w-[100px]">
            <p className="text-3xl font-black text-white">{orders.length}</p>
            <p className="text-xs font-bold text-gold uppercase tracking-widest">{isAr ? "طلبات شراء" : "Orders"}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/5 min-w-[100px]">
            <p className="text-3xl font-black text-white">{reports.length}</p>
            <p className="text-xs font-bold text-gold uppercase tracking-widest">{isAr ? "تقارير صيانة" : "Reports"}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Maintenance Reports */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-navy flex items-center gap-2">
            <Wrench className="text-gold" />
            {isAr ? "سجل الصيانة" : "Maintenance History"}
          </h2>
          
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
            {reports.length === 0 ? (
              <p className="text-center text-gray-400 font-bold py-8">{isAr ? "لا توجد تقارير صيانة" : "No maintenance reports"}</p>
            ) : (
              reports.map((report: any) => (
                <div key={report.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                    <div>
                      <span className="text-xs font-black text-purple-600 bg-purple-100 px-2 py-1 rounded-md uppercase tracking-widest block w-max mb-1">
                        {report.id.slice(-6)}
                      </span>
                      <span className="text-sm font-bold text-navy flex items-center gap-1">
                        <Calendar size={14} /> 
                        {new Date(report.reportDate || report.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500">{isAr ? "تكلفة الزيارة" : "Visit Cost"}</p>
                      <p className="text-lg font-black text-gold">{formatPrice(report.totalCost || 0, locale)}</p>
                    </div>
                  </div>

                  {report.machineSpecs && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 block mb-1">{isAr ? "الماكينة" : "Machine"}</span>
                      <p className="text-sm font-medium text-navy">{report.machineSpecs}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1">{isAr ? "التشخيص والإجراء" : "Diagnosis & Action"}</span>
                    <p className="text-sm font-medium text-navy bg-white p-3 rounded-xl border border-gray-100">{report.diagnosis}</p>
                  </div>

                  {report.partsUsed && report.partsUsed.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 block mb-1">{isAr ? "قطع الغيار" : "Parts Used"}</span>
                      <div className="flex flex-wrap gap-2">
                        {report.partsUsed.map((p: any, i: number) => (
                          <span key={i} className="text-xs font-bold bg-navy text-white px-2 py-1 rounded-md">
                            {p.qty}x {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-navy flex items-center gap-2">
            <ShoppingBag className="text-gold" />
            {isAr ? "طلبات الشراء" : "Purchase Orders"}
          </h2>

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 font-bold py-8">{isAr ? "لا توجد طلبات شراء" : "No purchase orders"}</p>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md uppercase tracking-widest block">
                        #{order.id.slice(-6)}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-black uppercase tracking-widest",
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <Link href={`/${locale}/admin/orders/${order.id}`} className="text-xs font-bold text-navy hover:text-gold flex items-center gap-1 transition-colors">
                      <FileText size={14}/>
                      {isAr ? "تفاصيل الطلب" : "View Order"}
                    </Link>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-gray-500 block mb-1">{isAr ? "التاريخ" : "Date"}</span>
                      <span className="text-sm font-bold text-navy flex items-center gap-1">
                        <Calendar size={14} /> 
                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-500 block mb-1">{isAr ? "الإجمالي" : "Total"}</span>
                      <span className="text-lg font-black text-navy">{formatPrice(order.total, locale)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-100">
                    {order.items?.map((item: any, i: number) => (
                      <span key={i} className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded-md">
                        {item.qty}x {isAr ? item.name_ar : item.name_en}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

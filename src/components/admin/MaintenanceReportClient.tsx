"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Printer,
  History,
  User,
  Tool
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { createMaintenanceReport, updateMaintenanceRequest, updateOrder } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";

interface PartUsed {
  name: string;
  qty: number;
  price: number;
}

export default function MaintenanceReportClient({ requestData, isOrder, users, products, staffMembers, locale }: any) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState(requestData.userId || "");
  const [machineSpecs, setMachineSpecs] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [parts, setParts] = useState<PartUsed[]>([]);
  const [visitCost, setVisitCost] = useState<number>(300); // Default visit cost
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [markOrderAsPaid, setMarkOrderAsPaid] = useState(false);

  // Flatten products and their sizes into a selectable list
  const availableParts = products?.flatMap((p: any) => {
    if (p.sizes && p.sizes.length > 0) {
      return p.sizes.map((s: any) => ({
        name: `${isAr ? p.name_ar : p.name_en} - ${s.label}`,
        price: s.salePrice || s.price
      }));
    }
    return [{
      name: isAr ? p.name_ar : p.name_en,
      price: p.salePrice || p.price
    }];
  }) || [];

  const [engineerId, setEngineerId] = useState("");

  const totalPartsCost = parts.reduce((sum, p) => sum + (p.price * p.qty), 0);
  const totalCost = totalPartsCost + visitCost + (markOrderAsPaid ? (requestData.total || 0) : 0);

  const addPart = () => setParts([...parts, { name: "", qty: 1, price: 0 }]);
  const updatePart = (index: number, field: keyof PartUsed, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));

  const handleSaveReport = async () => {
    if (!diagnosis || !actionsTaken) {
      addToast("error", isAr ? "يرجى كتابة التشخيص والإجراءات المتخذة" : "Please fill diagnosis and actions");
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        requestId: requestData.id,
        customerId: customerId || "guest",
        machineSpecs,
        diagnosis,
        actionsTaken,
        partsUsed: parts,
        totalPartsCost,
        visitCost,
        totalCost,
        reportDate,
        engineerId,
        notes,
      };

      const reportId = await createMaintenanceReport(reportData);

      // Update status to completed
      if (isOrder) {
        const orderUpdates: any = {
          adminNotes: (requestData.adminNotes || "") + `\n[تم إنشاء تقرير صيانة: ${reportId}]` 
        };
        if (markOrderAsPaid) {
          orderUpdates.paymentStatus = "paid";
          orderUpdates.adminNotes += `\n[تم تحصيل مبلغ الطلب نقداً خلال الزيارة]`;
        }
        await updateOrder(requestData.id, orderUpdates);
      } else {
        await updateMaintenanceRequest(requestData.id, { status: "completed" });
      }

      addToast("success", isAr ? "تم حفظ التقرير وإصدار الفاتورة بنجاح" : "Report and invoice saved successfully");
      router.push(`/${locale}/admin/maintenance`);
    } catch (error) {
      console.error(error);
      addToast("error", isAr ? "حدث خطأ أثناء الحفظ" : "Error saving report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href={`/${locale}/admin/maintenance`} className="text-sm font-bold text-navy/60 hover:text-navy inline-flex items-center gap-2 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isAr ? "العودة للزيارات" : "Back to Visits"}
        </Link>
        <div className="bg-navy text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
          {isOrder ? "زيارة طلب بيع" : "طلب تشخيص أعطال"}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h1 className="text-2xl font-black text-navy mb-8 flex items-center gap-3">
              <FileText className="text-gold" size={28} />
              {isAr ? "تقرير الزيارة الهندسية" : "Engineering Visit Report"}
            </h1>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Link */}
                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "ربط بملف العميل (للتاريخ/History)" : "Link to Customer"}</span>
                  <select 
                    value={customerId} 
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-white"
                  >
                    <option value="" className="text-gray-500 font-medium">{isAr ? "زائر (بدون تاريخ)" : "Guest (No History)"}</option>
                    {users.map((u: any) => (
                      <option key={u.uid} value={u.uid} className="text-navy font-bold">
                        {u.name} {u.workshopName ? `- ${u.workshopName}` : ""} {u.phone ? `(${u.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Report Date */}
                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "تاريخ التقرير/الزيارة" : "Visit/Report Date"}</span>
                  <input 
                    type="date"
                    value={reportDate} 
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-white"
                  />
                </label>
                {/* Engineer Selection */}
                <label className="block col-span-2 sm:col-span-1">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "اسم المهندس" : "Engineer Name"}</span>
                  <select 
                    value={engineerId} 
                    onChange={(e) => setEngineerId(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-white"
                  >
                    <option value="" className="text-gray-500 font-medium">{isAr ? "اختر المهندس..." : "Select Engineer..."}</option>
                    {staffMembers?.map((staff: any) => (
                      <option key={staff.uid} value={staff.uid} className="text-navy font-bold">
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "مواصفات الماكينة (الموديل، القوة، نوع الكنترول)" : "Machine Specs"}</span>
                <input 
                  type="text" 
                  value={machineSpecs} 
                  onChange={(e) => setMachineSpecs(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none text-navy bg-white"
                  placeholder="e.g. Ruida 6445G, 130W Reci"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "تشخيص العطل (المشكلة)" : "Diagnosis"} *</span>
                <textarea 
                  rows={3}
                  value={diagnosis} 
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none resize-none text-navy bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "الإجراءات المتخذة (الحل)" : "Actions Taken"} *</span>
                <textarea 
                  rows={4}
                  value={actionsTaken} 
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none resize-none text-navy bg-white"
                />
              </label>

              {/* Order Items (Read-only) */}
              {isOrder && requestData.items && requestData.items.length > 0 && (
                <div className="pt-6 border-t border-gray-100 mb-6">
                  <div className="flex flex-col gap-2 mb-4">
                    <h3 className="text-lg font-black text-navy">{isAr ? "المنتجات المشمولة في الطلب الأساسي" : "Products in Original Order"}</h3>
                    <div className="flex items-center gap-4 text-sm font-bold">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                        {isAr ? "طريقة الدفع: " : "Payment Method: "} {requestData.paymentMethod}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-lg",
                        requestData.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      )}>
                        {isAr ? "حالة الدفع: " : "Payment Status: "} {requestData.paymentStatus === "paid" ? (isAr ? "مدفوع" : "Paid") : (isAr ? "غير مدفوع" : "Unpaid")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {requestData.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1 w-full">
                          <p className="font-bold text-navy">{isAr ? item.name_ar : item.name_en}</p>
                          {item.size && <p className="text-sm font-bold text-gray-500">{item.size}</p>}
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                          <div className="text-center">
                            <span className="text-xs text-gray-500 block mb-1">{isAr ? "الكمية" : "Qty"}</span>
                            <span className="font-bold text-navy">{item.qty}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-gray-500 block mb-1">{isAr ? "السعر" : "Price"}</span>
                            <span className="font-bold text-gold">{formatPrice(item.price, locale)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-navy/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{isAr ? "إجمالي الطلب الأساسي" : "Original Order Total"}</p>
                      <p className="text-2xl font-black text-navy">{formatPrice(requestData.total || 0, locale)}</p>
                    </div>
                    
                    {requestData.paymentStatus !== "paid" && (
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-gray-200 hover:border-gold transition-colors">
                        <input 
                          type="checkbox" 
                          checked={markOrderAsPaid}
                          onChange={(e) => setMarkOrderAsPaid(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-navy focus:ring-gold"
                        />
                        <span className="text-sm font-bold text-navy select-none">
                          {isAr ? "تم الدفع نقداً خلال الزيارة" : "Paid in cash during visit"}
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Parts Used */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-navy">{isAr ? "قطع الغيار المستخدمة" : "Parts Used"}</h3>
                  <button onClick={addPart} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-navy text-sm font-bold rounded-xl flex items-center gap-2 transition-colors">
                    <Plus size={16} /> {isAr ? "إضافة قطعة" : "Add Part"}
                  </button>
                </div>
                
                {parts.length === 0 ? (
                  <p className="text-sm text-gray-400 font-bold p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 border-dashed">
                    {isAr ? "لم يتم استخدام قطع غيار جديدة" : "No new parts used"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {parts.map((part, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="block flex-1 w-full">
                          <span className="text-xs font-bold text-gray-500 mb-1 block">{isAr ? "الاسم / المنتج" : "Part / Product"}</span>
                          <select 
                            value={part.name} 
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const selectedPartInfo = availableParts.find((p: any) => p.name === selectedName);
                              const newParts = [...parts];
                              newParts[idx].name = selectedName;
                              // Auto-update price if it's a known product from the store
                              if (selectedPartInfo) {
                                newParts[idx].price = selectedPartInfo.price;
                              }
                              setParts(newParts);
                            }} 
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gold text-navy bg-white font-bold"
                          >
                            {/* If it's a pre-filled item not exactly matching store name, just show it as an option */}
                            {part.name && !availableParts.find((p: any) => p.name === part.name) && (
                              <option value={part.name}>{part.name}</option>
                            )}
                            <option value="">{isAr ? "اختر منتجاً..." : "Select a product..."}</option>
                            {availableParts.map((p: any) => (
                              <option key={p.name} value={p.name}>{p.name} ({formatPrice(p.price, locale)})</option>
                            ))}
                          </select>
                        </label>
                        <label className="block w-full sm:w-24">
                          <span className="text-xs font-bold text-gray-500 mb-1 block">{isAr ? "الكمية" : "Qty"}</span>
                          <input type="number" min="1" value={part.qty} onChange={(e) => updatePart(idx, "qty", Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gold text-center text-navy bg-white font-bold" />
                        </label>
                        <label className="block w-full sm:w-32">
                          <span className="text-xs font-bold text-gray-500 mb-1 block">{isAr ? "السعر للقطعة" : "Unit Price"}</span>
                          <input type="number" min="0" value={part.price} onChange={(e) => updatePart(idx, "price", Number(e.target.value))} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gold text-center text-navy bg-white font-bold" />
                        </label>
                        <button onClick={() => removePart(idx)} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shrink-0">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "تكلفة الزيارة/المصنعية" : "Labor/Visit Cost"}</span>
                  <input 
                    type="number" 
                    value={visitCost} 
                    onChange={(e) => setVisitCost(Number(e.target.value))}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-black text-xl text-center text-navy bg-white"
                  />
                </label>
                <div className="bg-gold/10 p-4 rounded-2xl border-2 border-gold/20 flex flex-col justify-center items-center text-center">
                  <span className="text-sm font-bold text-navy mb-1">{isAr ? "الإجمالي المستحق" : "Total Due"}</span>
                  <span className="text-2xl font-black text-gold">{formatPrice(totalCost, locale)}</span>
                  {markOrderAsPaid && (
                    <span className="text-xs font-bold text-navy/60 mt-2 block">
                      {isAr ? `(يشتمل على مبلغ الطلب الأساسي: ${formatPrice(requestData.total || 0, locale)})` : `(Includes Order Total: ${formatPrice(requestData.total || 0, locale)})`}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-navy text-white p-8 rounded-[32px] shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-gold">
              <User size={20} /> {isAr ? "بيانات العميل" : "Customer Data"}
            </h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between border-b border-white/10 pb-3 items-center">
                <span className="text-white/60">{isAr ? "الاسم" : "Name"}</span>
                {customerId ? (
                  <Link href={`/${locale}/admin/customers/${customerId}`} className="text-gold font-bold hover:underline hover:text-yellow-400 flex items-center gap-1">
                    {isOrder ? requestData.shippingAddress?.name : requestData.customerName}
                    <History size={14} />
                  </Link>
                ) : (
                  <span>{isOrder ? requestData.shippingAddress?.name : requestData.customerName}</span>
                )}
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/60">{isAr ? "الهاتف" : "Phone"}</span>
                <span dir="ltr">{isOrder ? requestData.shippingAddress?.phone : requestData.customerPhone}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/60">{isAr ? "العنوان بالتفصيل" : "Detailed Address"}</span>
                <span className="text-right max-w-[60%]">{isOrder ? `${requestData.shippingAddress?.governorate}, ${requestData.shippingAddress?.city}, ${requestData.shippingAddress?.details}` : requestData.workshopAddress}</span>
              </div>
              {(!isOrder && requestData.workshopName) || (customerId && users.find((u: any) => u.uid === customerId)?.workshopName) ? (
                <div className="flex justify-between border-b border-white/10 pb-3 items-center">
                  <span className="text-white/60">{isAr ? "اسم المكان/الورشة" : "Workshop"}</span>
                  {customerId ? (
                    <Link href={`/${locale}/admin/customers/${customerId}`} className="text-gold font-bold hover:underline hover:text-yellow-400">
                      {requestData.workshopName || users.find((u: any) => u.uid === customerId)?.workshopName}
                    </Link>
                  ) : (
                    <span>{requestData.workshopName}</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <button 
            onClick={handleSaveReport}
            disabled={isSubmitting}
            className={cn(
              "w-full py-5 text-xl font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3",
              isSubmitting ? "bg-gray-300 text-gray-500" : "bg-gold text-navy hover:bg-yellow-400"
            )}
          >
            <Save size={24} />
            {isSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ وإصدار الفاتورة" : "Save & Issue Invoice")}
          </button>
        </div>
      </div>
    </div>
  );
}

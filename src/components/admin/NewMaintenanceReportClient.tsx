"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  User
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { createMaintenanceReport, createCustomerProfile } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";

interface PartUsed {
  name: string;
  qty: number;
  price: number;
}

export default function NewMaintenanceReportClient({ users, products, staffMembers, locale }: any) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Selection
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerId, setCustomerId] = useState("");
  
  // New Customer Form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    workshopName: "",
    workshopAddress: ""
  });

  // Report Data
  const [machineSpecs, setMachineSpecs] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [parts, setParts] = useState<PartUsed[]>([]);
  const [visitCost, setVisitCost] = useState<number>(300);
  const [notes, setNotes] = useState("");
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [engineerId, setEngineerId] = useState("");

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

  const totalPartsCost = parts.reduce((sum, p) => sum + (p.price * p.qty), 0);
  const totalCost = totalPartsCost + visitCost;

  const addPart = () => setParts([...parts, { name: "", qty: 1, price: 0 }]);
  const updatePart = (index: number, field: keyof PartUsed, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setParts(newParts);
  };
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));

  const handleSaveReport = async () => {
    if (!diagnosis || !actionsTaken || !engineerId) {
      addToast("error", isAr ? "يرجى تعبئة كافة الحقول المطلوبة (التشخيص، الإجراء، والمهندس)" : "Please fill all required fields");
      return;
    }

    if (isNewCustomer && (!newCustomer.name || !newCustomer.phone)) {
      addToast("error", isAr ? "يرجى تعبئة بيانات العميل الجديد" : "Please fill new customer data");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCustomerId = customerId;

      // 1. Create New Customer Profile if needed
      if (isNewCustomer) {
        finalCustomerId = await createCustomerProfile(newCustomer);
      }

      // 2. Create Maintenance Report
      const reportData = {
        requestId: `direct_${Date.now()}`, // Dummy ID since there is no request
        customerId: finalCustomerId || "guest",
        customerName: isNewCustomer ? newCustomer.name : (users.find((u: any) => u.uid === customerId)?.name || ""),
        customerPhone: isNewCustomer ? newCustomer.phone : (users.find((u: any) => u.uid === customerId)?.phone || ""),
        workshopName: isNewCustomer ? newCustomer.workshopName : (users.find((u: any) => u.uid === customerId)?.workshopName || ""),
        workshopAddress: isNewCustomer ? newCustomer.workshopAddress : "", // Address might not be in the users map directly, but we can save what we know
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

      await createMaintenanceReport(reportData);

      addToast("success", isAr ? "تم حفظ التقرير بنجاح" : "Report saved successfully");
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
          {isAr ? "تقرير صيانة مباشر" : "Direct Maintenance Report"}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h1 className="text-2xl font-black text-navy mb-8 flex items-center gap-3">
              <FileText className="text-gold" size={28} />
              {isAr ? "إنشاء تقرير زيارة هندسية" : "Create Engineering Visit Report"}
            </h1>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Engineer Selection */}
                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "اسم المهندس" : "Engineer Name"} *</span>
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

                {/* Report Date */}
                <label className="block">
                  <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "تاريخ التقرير/الزيارة" : "Visit/Report Date"} *</span>
                  <input 
                    type="date"
                    value={reportDate} 
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "مواصفات الماكينة (الموديل، القوة، نوع الكنترول)" : "Machine Specs"}</span>
                <input 
                  type="text" 
                  value={machineSpecs} 
                  onChange={(e) => setMachineSpecs(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "تشخيص العطل (المشكلة)" : "Diagnosis"} *</span>
                <textarea 
                  rows={3}
                  value={diagnosis} 
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none resize-none font-medium text-navy bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "الإجراءات المتخذة (الحل)" : "Actions Taken"} *</span>
                <textarea 
                  rows={4}
                  value={actionsTaken} 
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none resize-none font-medium text-navy bg-white"
                />
              </label>

              {/* Parts Used */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-navy">{isAr ? "قطع الغيار المستخدمة الجديدة" : "New Parts Used"}</h3>
                  <button onClick={addPart} className="text-sm font-bold text-gold hover:text-navy flex items-center gap-1 bg-gold/10 px-4 py-2 rounded-xl transition-colors">
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
                              if (selectedPartInfo) {
                                newParts[idx].price = selectedPartInfo.price;
                              }
                              setParts(newParts);
                            }} 
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gold text-navy bg-white font-bold"
                          >
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

            {/* Toggle New / Existing */}
            <div className="flex bg-white/10 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setIsNewCustomer(false)}
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors", !isNewCustomer ? "bg-white text-navy" : "text-white/60 hover:text-white")}
              >
                {isAr ? "عميل مسجل" : "Existing"}
              </button>
              <button
                type="button"
                onClick={() => setIsNewCustomer(true)}
                className={cn("flex-1 py-2 text-sm font-bold rounded-xl transition-colors", isNewCustomer ? "bg-white text-navy" : "text-white/60 hover:text-white")}
              >
                {isAr ? "عميل جديد" : "New Customer"}
              </button>
            </div>

            {!isNewCustomer ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-white/80 mb-2 block">{isAr ? "اختر العميل" : "Select Customer"}</span>
                  <select 
                    value={customerId} 
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-transparent outline-none font-bold text-navy bg-white"
                  >
                    <option value="" className="text-gray-500 font-medium">{isAr ? "اختر العميل..." : "Select Customer..."}</option>
                    {users.map((u: any) => (
                      <option key={u.uid} value={u.uid} className="text-navy font-bold">
                        {u.name} {u.workshopName ? `- ${u.workshopName}` : ""} {u.phone ? `(${u.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-white/80 mb-1 block">{isAr ? "اسم العميل" : "Customer Name"} *</span>
                  <input 
                    type="text" 
                    value={newCustomer.name} 
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full p-3 rounded-xl outline-none font-bold text-navy bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-white/80 mb-1 block">{isAr ? "رقم الهاتف" : "Phone"} *</span>
                  <input 
                    type="text" 
                    value={newCustomer.phone} 
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full p-3 rounded-xl outline-none font-bold text-navy bg-white text-left"
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-white/80 mb-1 block">{isAr ? "اسم المكان/الورشة" : "Workshop Name"}</span>
                  <input 
                    type="text" 
                    value={newCustomer.workshopName} 
                    onChange={(e) => setNewCustomer({...newCustomer, workshopName: e.target.value})}
                    className="w-full p-3 rounded-xl outline-none font-bold text-navy bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-white/80 mb-1 block">{isAr ? "العنوان بالتفصيل" : "Detailed Address"}</span>
                  <input 
                    type="text" 
                    value={newCustomer.workshopAddress} 
                    onChange={(e) => setNewCustomer({...newCustomer, workshopAddress: e.target.value})}
                    className="w-full p-3 rounded-xl outline-none font-bold text-navy bg-white"
                  />
                </label>
                <p className="text-xs text-gold font-bold mt-2 text-center bg-gold/10 p-2 rounded-lg">
                  {isAr ? "سيتم حفظ هذا العميل تلقائياً في السجلات عند حفظ التقرير." : "Customer will be saved automatically."}
                </p>
              </div>
            )}
          </div>

          <label className="block bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-navy mb-2 flex items-center gap-2"><FileText size={16}/> {isAr ? "ملاحظات إدارية" : "Admin Notes"}</span>
            <textarea 
              rows={3}
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none resize-none font-medium text-navy bg-gray-50"
              placeholder={isAr ? "ملاحظات تظهر للإدارة فقط..." : "Notes visible to admin only..."}
            />
          </label>

          <button 
            onClick={handleSaveReport}
            disabled={isSubmitting}
            className={cn(
              "btn btn-primary w-full py-5 text-lg font-black rounded-[24px] shadow-xl flex items-center justify-center gap-3 transition-all",
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-gold/30"
            )}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-navy border-t-transparent animate-spin rounded-full" />
            ) : (
              <>
                <Save size={24} />
                {isAr ? "حفظ وإصدار الفاتورة" : "Save and Issue Invoice"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

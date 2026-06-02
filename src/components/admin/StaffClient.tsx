"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  Wrench, 
  User as UserIcon,
  Phone,
  Mail,
  History,
  CheckCircle2,
  UserPlus,
  X
} from "lucide-react";
import { updateUserRole } from "@/lib/firestore";
import { createStaffMember } from "@/lib/auth";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function StaffClient({ initialUsers, locale }: any) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "engineer" | "customer">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStaffData, setNewStaffData] = useState({ name: "", email: "", password: "", role: "engineer" });

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.workshopName && u.workshopName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map((u: any) => u.uid === userId ? { ...u, role: newRole } : u));
      addToast("success", isAr ? "تم تحديث الصلاحية بنجاح" : "Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      addToast("error", isAr ? "حدث خطأ أثناء التحديث" : "Error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffData.name || !newStaffData.email || !newStaffData.password) return;
    setIsCreating(true);
    try {
      const newUser = await createStaffMember(newStaffData.name, newStaffData.email, newStaffData.password, newStaffData.role);
      setUsers([newUser, ...users]);
      setIsCreateOpen(false);
      setNewStaffData({ name: "", email: "", password: "", role: "engineer" });
      addToast("success", isAr ? "تم إضافة الموظف بنجاح" : "Staff added successfully");
    } catch (error: any) {
      console.error(error);
      addToast("error", isAr ? "حدث خطأ أثناء الإضافة: " + error.message : "Error creating staff");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-navy text-gold flex items-center justify-center mb-6 shadow-xl">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight mb-2">
            {isAr ? "إدارة الموظفين والعملاء" : "Staff & Customers Management"}
          </h1>
          <p className="text-text-muted font-bold">
            {isAr ? "تحديد صلاحيات المهندسين والوصول لسجلات العملاء" : "Set engineer roles and access customer history"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-orange-600 mb-1">{users.filter((u: any) => u.role === "engineer").length}</p>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">{isAr ? "مهندس صيانة" : "Engineers"}</p>
          </div>
          <div className="bg-navy/5 border border-navy/10 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-navy mb-1">{users.filter((u: any) => u.role === "customer" || !u.role).length}</p>
            <p className="text-xs font-bold text-navy/80 uppercase tracking-widest">{isAr ? "عملاء" : "Customers"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-gold text-navy shadow-md hover:bg-yellow-400 whitespace-nowrap"
          >
            <UserPlus size={16} /> {isAr ? "إضافة موظف" : "Add Staff"}
          </button>
          <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block"></div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex overflow-x-auto">
          <button
            onClick={() => setFilterRole("all")}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap", filterRole === "all" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
          >
            {isAr ? "الكل" : "All"}
          </button>
          <button
            onClick={() => setFilterRole("customer")}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap", filterRole === "customer" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
          >
            <UserIcon size={16} /> {isAr ? "العملاء" : "Customers"}
          </button>
          <button
            onClick={() => setFilterRole("engineer")}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap", filterRole === "engineer" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
          >
            <Wrench size={16} /> {isAr ? "المهندسين" : "Engineers"}
          </button>
          <button
            onClick={() => setFilterRole("admin")}
            className={cn("px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap", filterRole === "admin" ? "bg-navy text-white shadow-md" : "text-text-muted hover:text-navy hover:bg-gray-50")}
          >
            <ShieldAlert size={16} /> {isAr ? "الإدارة" : "Admins"}
          </button>
        </div>
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <input
            type="text"
            placeholder={isAr ? "بحث بالاسم، الإيميل، الهاتف..." : "Search name, email, phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none transition-colors font-bold text-sm bg-white text-navy"
            dir={isAr ? "rtl" : "ltr"}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                <th className="p-4 font-black text-navy text-center w-16">#</th>
                <th className="p-4 font-black text-navy">{isAr ? "البيانات الأساسية" : "Basic Info"}</th>
                <th className="p-4 font-black text-navy">{isAr ? "الورشة/المكان" : "Workshop"}</th>
                <th className="p-4 font-black text-navy text-center">{isAr ? "الصلاحية" : "Role"}</th>
                <th className="p-4 font-black text-navy text-center">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 font-bold">
                    {isAr ? "لا توجد نتائج مطابقة" : "No matching results"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any, idx: number) => (
                  <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-navy">{user.name}</span>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {user.phone && <span className="flex items-center gap-1"><Phone size={12}/> <span dir="ltr">{user.phone}</span></span>}
                          {user.email && <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-bold">
                      {user.workshopName || "-"}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                        disabled={updatingId === user.uid}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest outline-none transition-colors border-2",
                          user.role === "admin" ? "bg-red-50 text-red-700 border-red-100 focus:border-red-300" :
                          user.role === "engineer" ? "bg-orange-50 text-orange-700 border-orange-100 focus:border-orange-300" :
                          "bg-gray-50 text-gray-700 border-gray-100 focus:border-gray-300",
                          updatingId === user.uid && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="customer" className="text-gray-900 font-bold">{isAr ? "عميل" : "Customer"}</option>
                        <option value="engineer" className="text-orange-700 font-bold">{isAr ? "مهندس صيانة" : "Engineer"}</option>
                        <option value="admin" className="text-red-700 font-bold">{isAr ? "مدير نظام" : "Admin"}</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        href={`/${locale}/admin/customers/${user.uid}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-navy transition-all"
                      >
                        <History size={14} />
                        <span className="hidden sm:inline">{isAr ? "ملف العميل" : "History"}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-6 end-6 text-gray-400 hover:text-navy transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-navy mb-6 flex items-center gap-2">
              <UserPlus className="text-gold" /> {isAr ? "إضافة موظف جديد" : "Add New Staff"}
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "الاسم" : "Name"}</span>
                <input 
                  type="text" 
                  required
                  value={newStaffData.name} 
                  onChange={(e) => setNewStaffData({...newStaffData, name: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-gray-50"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "البريد الإلكتروني" : "Email"}</span>
                <input 
                  type="email" 
                  required
                  value={newStaffData.email} 
                  onChange={(e) => setNewStaffData({...newStaffData, email: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-gray-50 text-left"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "كلمة المرور" : "Password"}</span>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={newStaffData.password} 
                  onChange={(e) => setNewStaffData({...newStaffData, password: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-gray-50 text-left"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-navy mb-2 block">{isAr ? "الصلاحية" : "Role"}</span>
                <select 
                  value={newStaffData.role} 
                  onChange={(e) => setNewStaffData({...newStaffData, role: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-navy bg-gray-50"
                >
                  <option value="engineer">{isAr ? "مهندس صيانة" : "Engineer"}</option>
                  <option value="admin">{isAr ? "مدير نظام" : "Admin"}</option>
                </select>
              </label>
              <button 
                type="submit" 
                disabled={isCreating}
                className={cn(
                  "w-full py-4 rounded-xl font-black text-lg transition-all mt-6",
                  isCreating ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-navy text-white hover:bg-navy-deep shadow-lg"
                )}
              >
                {isCreating ? (isAr ? "جاري الإضافة..." : "Creating...") : (isAr ? "إنشاء الحساب" : "Create Account")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

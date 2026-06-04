"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { EGYPT_GOVERNORATES, cn } from "@/lib/utils";
import { Camera, KeyRound, User, Lock, Mail, Phone, Wrench, RefreshCw, EyeOff } from "lucide-react";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

interface Props {
  locale: string;
}

export default function AccountProfileClient({ locale }: Props) {
  const isAr = locale === "ar";
  const { userData, isLoading } = useAuth();
  const { addToast } = useUIStore();

  // Basic Info States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Partner Fields States
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [selectedGovs, setSelectedGovs] = useState<string[]>([]);
  const [companyAffiliated, setCompanyAffiliated] = useState(false);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setPhone(userData.phone || "");
      setWorkshopName(userData.workshopName || "");
      setWorkshopAddress(userData.workshopAddress || "");
      setAvatarUrl(userData.avatarUrl || "");
      setExperienceYears(userData.experienceYears || 0);
      setSelectedGovs(userData.governorateScope || []);
      setCompanyAffiliated(userData.companyAffiliated || false);
    }
  }, [userData]);

  const handleGovToggle = (govKey: string) => {
    setSelectedGovs(prev =>
      prev.includes(govKey)
        ? prev.filter(k => k !== govKey)
        : [...prev, govKey]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    setIsUploading(true);
    try {
      const result = await uploadMultipleToCloudinary([file], "roma-users");
      if (result.length > 0) {
        const newUrl = result[0].url;
        await updateUser(userData.uid, { avatarUrl: newUrl });
        setAvatarUrl(newUrl);
        addToast("success", isAr ? "تم تحديث الصورة الشخصية بنجاح" : "Profile picture updated successfully");
      }
    } catch (err) {
      console.error(err);
      addToast("error", isAr ? "فشل رفع الصورة الشخصية" : "Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    if (!name.trim() || !phone.trim() || (userData.role === "customer" && (!workshopName.trim() || !workshopAddress.trim()))) {
      addToast("error", isAr ? "يرجى ملء جميع الحقول الإجبارية." : "Please fill in all required fields.");
      return;
    }

    if (userData.role !== "customer" && selectedGovs.length === 0) {
      addToast("error", isAr ? "يرجى اختيار محافظة واحدة على الأقل لنطاق العمل." : "Please select at least one governorate for work scope.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedFields: any = {
        name: name.trim(),
        phone: phone.trim(),
      };

      if (userData.role === "customer") {
        updatedFields.workshopName = workshopName.trim();
        updatedFields.workshopAddress = workshopAddress.trim();
      }

      if (userData.role !== "customer") {
        updatedFields.experienceYears = Number(experienceYears || 0);
        updatedFields.governorateScope = selectedGovs;
      }
      if (userData.role === "technician") {
        updatedFields.companyAffiliated = companyAffiliated;
      }

      await updateUser(userData.uid, updatedFields);
      addToast("success", isAr ? "تم حفظ البيانات بنجاح" : "Profile updated successfully");
    } catch (error) {
      addToast("error", isAr ? "تعذر حفظ البيانات. حاول مرة أخرى." : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("error", isAr ? "يرجى ملء جميع حقول كلمة المرور." : "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", isAr ? "كلمتا المرور الجديدتان غير متطابقتين." : "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      addToast("error", isAr ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل." : "Password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        addToast("success", isAr ? "تم تغيير كلمة المرور بنجاح" : "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error("User not logged in");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        addToast("error", isAr ? "كلمة المرور الحالية غير صحيحة." : "Incorrect current password.");
      } else {
        addToast("error", isAr ? "فشل تحديث كلمة المرور. يرجى المحاولة مرة أخرى." : "Failed to update password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !userData) {
    return (
      <main className="container-romad py-20">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-navy/80 p-10 text-center text-white/70">
          {isAr ? "جاري تحميل بيانات الحساب..." : "Loading account details..."}
        </div>
      </main>
    );
  }

  const isPartner = userData.role === "technician" || userData.role === "distributor";

  return (
    <main className="container-romad py-20">
      <div className="mx-auto grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        
        {/* Main Details Section */}
        <section className="rounded-[32px] border border-white/10 bg-navy/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/10">
            {/* Avatar Upload Grid */}
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-gold shadow-lg bg-navy flex-shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-white/40" />
              )}
              {isUploading ? (
                <div className="absolute inset-0 bg-navy/80 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-gold" size={20} />
                </div>
              ) : (
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-black tracking-wider">
                  <Camera size={18} className="mb-1 text-gold" />
                  <span className="text-gold">{isAr ? "تغيير" : "CHANGE"}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
            
            <div className="text-center sm:text-right rtl:sm:text-right">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl lg:text-3xl font-black text-white">{name || (isAr ? "شريك نجاح" : "Romaα Partner")}</h1>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  userData.role === "admin" ? "bg-red-500 text-white" :
                  userData.role === "technician" ? "bg-gold text-navy" :
                  userData.role === "distributor" ? "bg-cyan-500 text-navy" :
                  "bg-white/10 text-white"
                )}>
                  {userData.role === "admin" ? (isAr ? "مسؤول النظام" : "ADMIN") :
                   userData.role === "technician" ? (isAr ? "فني معتمد" : "TECHNICIAN") :
                   userData.role === "distributor" ? (isAr ? "موزع معتمد" : "DISTRIBUTOR") :
                   (isAr ? "عميل" : "CUSTOMER")}
                </span>
              </div>
              <p className="text-white/60 text-sm mt-1">{userData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-white/85">{isAr ? "الاسم الكامل" : "Full name"} *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder={isAr ? "الاسم" : "Full name"}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-white/85">{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} *</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input mt-2 w-full"
                  placeholder={isAr ? "01XXXXXXXXX" : "+201XXXXXXXXX"}
                />
              </label>

              {userData.role === "customer" && (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-white/85">{isAr ? "اسم المصنع/الورشة/المكتب" : "Factory / Workshop / Office name"} *</span>
                    <input
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="input mt-2 w-full"
                      placeholder={isAr ? "اسم الورشة" : "Workshop name"}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-white/85">{isAr ? "عنوان المصنع / الورشة بالتفصيل" : "Factory / Workshop detailed address"} *</span>
                    <input
                      value={workshopAddress}
                      onChange={(e) => setWorkshopAddress(e.target.value)}
                      className="input mt-2 w-full"
                      placeholder={isAr ? "الحي، المدينة، المحافظة" : "District, City, Governorate"}
                    />
                  </label>
                </>
              )}
            </div>

            {/* Dynamic Partner Editor */}
            {isPartner && (
              <div className="pt-6 mt-6 border-t border-white/10 space-y-6">
                <h3 className="text-lg font-black text-gold flex items-center gap-2">
                  <Wrench size={18} />
                  {isAr ? "البيانات المهنية للشراكة" : "Professional Partner Details"}
                </h3>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-white/85">{isAr ? "سنين الخبرة" : "Years of Experience"} *</span>
                    <input
                      type="number"
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="input mt-2 w-full"
                    />
                  </label>
                  
                  {userData.role === "technician" && (
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={companyAffiliated}
                          onChange={(e) => setCompanyAffiliated(e.target.checked)}
                          className="rounded text-gold focus:ring-gold w-5 h-5 bg-navy border-white/15"
                        />
                        <span className="text-sm font-bold text-white/90">
                          {isAr ? "الرغبة في تكليفي بطلبات تركيب وصيانة لعملاء الشركة" : "Accept company job requests"}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="block">
                  <span className="text-sm font-semibold text-white/85 mb-2 block">{isAr ? "نطاق المحافظات التي تغطيها" : "Covered Governorates Scope"} *</span>
                  <div className="max-h-40 overflow-y-auto border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/20">
                    {Object.entries(EGYPT_GOVERNORATES).map(([key, gov]) => (
                      <label key={key} className="flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-gold cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedGovs.includes(key)}
                          onChange={() => handleGovToggle(key)}
                          className="rounded text-gold focus:ring-gold bg-navy border-white/15"
                        />
                        <span>{isAr ? gov.nameAr : gov.nameEn}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isSaving} className="btn btn-primary w-full py-4 text-base font-black shadow-lg">
              {isSaving ? (isAr ? "جاري حفظ التعديلات..." : "Saving details...") : isAr ? "حفظ التعديلات الشخصية" : "Save changes"}
            </button>
          </form>
        </section>

        {/* Sidebar: Change Password & Quick Links */}
        <aside className="space-y-6">
          {/* Change Password Card */}
          <div className="rounded-[32px] border border-white/10 bg-navy/80 p-6 text-white shadow-xl backdrop-blur-xl">
            <h2 className="text-xl font-black text-gold mb-4 flex items-center gap-2">
              <KeyRound size={20} />
              {isAr ? "تغيير كلمة المرور" : "Change Password"}
            </h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-white/80">{isAr ? "كلمة المرور الحالية" : "Current Password"}</span>
                <div className="relative mt-2">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input w-full p-4 pr-10"
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-white/80">{isAr ? "كلمة المرور الجديدة" : "New Password"}</span>
                <div className="relative mt-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input w-full p-4 pr-10"
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-white/80">{isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</span>
                <div className="relative mt-2">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input w-full p-4 pr-10"
                    required
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                </div>
              </label>

              <button type="submit" disabled={isChangingPassword} className="btn bg-gold text-navy hover:bg-yellow-400 border-none font-black w-full py-3 mt-2 shadow-lg flex items-center justify-center gap-2">
                {isChangingPassword ? <RefreshCw className="animate-spin" size={16} /> : null}
                {isAr ? "تحديث كلمة المرور" : "Update Password"}
              </button>
            </form>
          </div>

          {/* Quick Links Card */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white/80">
            <h2 className="text-xl font-bold text-white mb-3">{isAr ? "روابط سريعة" : "Quick links"}</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/account/orders`} className="text-cyan-300 hover:text-cyan-200 block">
                  {isAr ? "عرض طلبات الشراء" : "View orders"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account/wishlist`} className="text-gold hover:text-gold-light block">
                  {isAr ? "المفضلة الخاصة بي" : "My Wishlist"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop`} className="text-white/95 hover:text-white block">
                  {isAr ? "الذهاب لتصفح المتجر" : "Back to shop"}
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

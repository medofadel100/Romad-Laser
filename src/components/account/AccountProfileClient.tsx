"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/firestore";
import { useUIStore } from "@/store/uiStore";

interface Props {
  locale: string;
}

export default function AccountProfileClient({ locale }: Props) {
  const isAr = locale === "ar";
  const { userData, isLoading } = useAuth();
  const { addToast } = useUIStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setPhone(userData.phone || "");
      setWorkshopName(userData.workshopName || "");
      setWorkshopAddress(userData.workshopAddress || "");
    }
  }, [userData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    if (!name.trim() || !phone.trim() || !workshopName.trim() || !workshopAddress.trim()) {
      addToast("error", isAr ? "يرجى ملء جميع الحقول." : "Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(userData.uid, {
        name: name.trim(),
        phone: phone.trim(),
        workshopName: workshopName.trim(),
        workshopAddress: workshopAddress.trim(),
      });
      addToast("success", isAr ? "تم حفظ البيانات بنجاح" : "Profile updated successfully");
    } catch (error) {
      addToast("error", isAr ? "تعذر حفظ البيانات. حاول مرة أخرى." : "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
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

  return (
    <main className="container-romad py-20">
      <div className="mx-auto grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-navy/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl text-white">
          <div className="mb-8">
            <p className="text-sm font-semibold text-cyan-300/90">{isAr ? "بيانات الحساب" : "Account details"}</p>
            <h1 className="mt-3 text-4xl font-black text-white">{isAr ? "معلومات الورشة" : "Workshop information"}</h1>
            <p className="mt-3 text-white/70 max-w-2xl">
              {isAr
                ? "تعديل رقم الهاتف، عنوان الورشة واسم المصنع الذي سنستخدمه لاحقاً في التواصل." 
                : "Edit the phone number, workshop address, and factory name used for later contact."}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-white/80">{isAr ? "الاسم" : "Full name"}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-2 w-full"
                placeholder={isAr ? "الاسم" : "Full name"}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/80">{isAr ? "البريد الإلكتروني" : "Email"}</span>
              <input
                value={userData.email}
                readOnly
                className="input mt-2 w-full bg-white/5 text-white/70"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/80">{isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input mt-2 w-full"
                placeholder={isAr ? "01XXXXXXXXX" : "+201XXXXXXXXX"}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/80">{isAr ? "اسم المصنع/الورشة" : "Factory / Workshop name"}</span>
              <input
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="input mt-2 w-full"
                placeholder={isAr ? "اسم الورشة" : "Workshop name"}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-white/80">{isAr ? "عنوان المصنع / الورشة" : "Factory / Workshop address"}</span>
              <input
                value={workshopAddress}
                onChange={(e) => setWorkshopAddress(e.target.value)}
                className="input mt-2 w-full"
                placeholder={isAr ? "الحي، المدينة، المحافظة" : "District, City, Governorate"}
              />
            </label>

            <button type="submit" disabled={isSaving} className="btn btn-primary w-full py-3">
              {isSaving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ البيانات" : "Save profile"}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 text-white/80">
            <h2 className="text-xl font-bold text-white mb-3">{isAr ? "روابط سريعة" : "Quick links"}</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/account/orders`} className="text-cyan-300 hover:text-cyan-200 block">
                  {isAr ? "عرض الطلبات" : "View orders"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account/wishlist`} className="text-gold hover:text-gold-light block">
                  {isAr ? "المفضلة" : "Wishlist"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop`} className="text-white/90 hover:text-white block">
                  {isAr ? "العودة إلى المتجر" : "Back to shop"}
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

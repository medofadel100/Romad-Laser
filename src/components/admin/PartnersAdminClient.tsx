"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  MessageCircle, 
  CheckCircle,
  Building,
  Star,
  Award
} from "lucide-react";
import { EGYPT_GOVERNORATES, formatPhone, formatWhatsAppPhone, cn } from "@/lib/utils";
import type { AppUser } from "@/types";

interface Props {
  initialPartners: AppUser[];
  locale: string;
}

export default function PartnersAdminClient({ initialPartners, locale }: Props) {
  const isAr = locale === "ar";
  const [partners, setPartners] = useState<AppUser[]>(initialPartners);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "technician" | "distributor" | "engineer">("all");
  const [filterGov, setFilterGov] = useState("");
  const [filterAffiliated, setFilterAffiliated] = useState<"all" | "yes" | "no">("all");

  const filteredPartners = partners.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.workshopName && p.workshopName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.workshopAddress && p.workshopAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === "all" || p.role === filterRole;

    const matchesGov = !filterGov || (p.governorateScope && p.governorateScope.includes(filterGov));

    const matchesAffiliated = 
      filterAffiliated === "all" || 
      (filterAffiliated === "yes" && p.companyAffiliated === true) || 
      (filterAffiliated === "no" && p.companyAffiliated !== true);

    return matchesSearch && matchesRole && matchesGov && matchesAffiliated;
  });

  return (
    <div className="space-y-8 pb-20 text-navy">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-navy text-gold flex items-center justify-center mb-6 shadow-xl">
            <Award size={32} />
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight mb-2">
            {isAr ? "دليل الشركاء والوكلاء" : "Partners & Agents Directory"}
          </h1>
          <p className="text-text-muted font-bold">
            {isAr ? "عرض وإدارة الفنيين والموزعين المعتمدين وتعيين مهام الصيانة" : "Manage technicians, distributors, and allocate maintenance jobs"}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-orange-600 mb-1">
              {partners.filter(u => u.role === "technician" || u.role === "engineer").length}
            </p>
            <p className="text-xs font-bold text-orange-800 uppercase tracking-widest">{isAr ? "فني / مهندس" : "Technicians"}</p>
          </div>
          <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-3xl font-black text-cyan-600 mb-1">
              {partners.filter(u => u.role === "distributor").length}
            </p>
            <p className="text-xs font-bold text-cyan-800 uppercase tracking-widest">{isAr ? "موزع معتمد" : "Distributors"}</p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder={isAr ? "بحث بالاسم، الورشة، الهاتف..." : "Search name, workshop, phone..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none transition-colors font-bold text-sm bg-white text-navy"
              dir={isAr ? "rtl" : "ltr"}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-sm bg-white text-navy"
          >
            <option value="all">{isAr ? "جميع الأدوار" : "All Roles"}</option>
            <option value="technician">{isAr ? "الفنيين فقط" : "Technicians Only"}</option>
            <option value="distributor">{isAr ? "الموزعين المعتمدين" : "Distributors Only"}</option>
            <option value="engineer">{isAr ? "مهندسي الصيانة" : "Maintenance Engineers"}</option>
          </select>

          {/* Governorate Filter */}
          <select
            value={filterGov}
            onChange={(e) => setFilterGov(e.target.value)}
            className="h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-sm bg-white text-navy"
          >
            <option value="">{isAr ? "كل نطاقات المحافظات" : "All Governorate Scopes"}</option>
            {Object.entries(EGYPT_GOVERNORATES).map(([key, gov]) => (
              <option key={key} value={key}>
                {isAr ? gov.nameAr : gov.nameEn}
              </option>
            ))}
          </select>

          {/* Affiliation Filter */}
          <select
            value={filterAffiliated}
            onChange={(e) => setFilterAffiliated(e.target.value as any)}
            className="h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-gold outline-none font-bold text-sm bg-white text-navy"
            disabled={filterRole !== "all" && filterRole !== "technician" && filterRole !== "engineer"}
          >
            <option value="all">{isAr ? "الكل (المستقل والتابع للشركة)" : "All Affiliations"}</option>
            <option value="yes">{isAr ? "فني معتمد لدى الشركة" : "Company Affiliated Only"}</option>
            <option value="no">{isAr ? "فني مستقل" : "Independent Only"}</option>
          </select>
        </div>
      </div>

      {/* Grid of Partner Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-gray-400 font-bold rounded-[32px] border border-gray-100 shadow-sm">
            {isAr ? "لا توجد نتائج مطابقة للفلاتر المحددة" : "No partners matching your filters"}
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div 
              key={partner.uid} 
              className="bg-white rounded-[40px] border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                {/* Header: Role Badges */}
                <div className="flex items-center justify-between mb-5">
                  <span className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider",
                    partner.role === "distributor" ? "bg-cyan-100 text-cyan-700 border border-cyan-200" : "bg-orange-100 text-orange-700 border border-orange-200"
                  )}>
                    {partner.role === "distributor" ? (isAr ? "موزع معتمد" : "DISTRIBUTOR") : (isAr ? "فني / مهندس صيانة" : "TECHNICIAN")}
                  </span>
                  {partner.companyAffiliated && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle size={10} />
                      {isAr ? "معتمد لدى الشركة" : " Romaα Staff"}
                    </span>
                  )}
                </div>

                {/* Profile Brief */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 border-2 border-gold/40 flex-shrink-0 flex items-center justify-center">
                    {partner.avatarUrl ? (
                      <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={28} className="text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-navy text-lg truncate">{partner.name}</h3>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-1 font-bold">
                      <Building size={12} className="text-gold" />
                      <span className="truncate">{partner.workshopName || (isAr ? "لا يوجد ورشة" : "No Workshop")}</span>
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 mb-6 text-sm">
                  {partner.phone && (
                    <div className="flex items-center gap-3 text-gray-600 font-bold">
                      <Phone size={14} className="text-gold" />
                      <span dir="ltr">{formatPhone(partner.phone, locale as any)}</span>
                    </div>
                  )}

                  {partner.email && (
                    <div className="flex items-center gap-3 text-gray-600 font-bold min-w-0">
                      <Mail size={14} className="text-gold" />
                      <span className="truncate">{partner.email}</span>
                    </div>
                  )}

                  {partner.workshopAddress && (
                    <div className="flex items-start gap-3 text-gray-600 font-bold">
                      <MapPin size={14} className="text-gold mt-1 flex-shrink-0" />
                      <span className="leading-tight">{partner.workshopAddress}</span>
                    </div>
                  )}

                  {partner.experienceYears !== undefined && (
                    <div className="flex items-center gap-3 text-gray-600 font-bold">
                      <Briefcase size={14} className="text-gold" />
                      <span>
                        {isAr 
                          ? `الخبرة: ${partner.experienceYears} سنوات` 
                          : `Experience: ${partner.experienceYears} Years`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Governorate Scope Tags */}
                {partner.governorateScope && partner.governorateScope.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{isAr ? "نطاق المحافظات" : "COVERED GOVERNORATES"}</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-gray-50 rounded-xl">
                      {partner.governorateScope.map((govKey) => {
                        const govData = EGYPT_GOVERNORATES[govKey];
                        const govName = govData ? (isAr ? govData.nameAr : govData.nameEn) : govKey;
                        return (
                          <span key={govKey} className="px-2.5 py-1 bg-white text-navy font-bold text-[10px] rounded-lg shadow-sm border border-gray-100">
                            {govName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mt-auto">
                <a 
                  href={`tel:${partner.phone}`}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 font-black text-xs transition-colors"
                >
                  <Phone size={14} />
                  {isAr ? "اتصال هاتف" : "Call Phone"}
                </a>
                
                {partner.phone && (
                  <a 
                    href={`https://wa.me/${formatWhatsAppPhone(partner.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-11 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-black text-xs transition-colors"
                  >
                    <MessageCircle size={14} />
                    {isAr ? "واتساب" : "WhatsApp"}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

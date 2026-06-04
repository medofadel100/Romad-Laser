import { getAllUsers } from "@/lib/firestore.server";
import PartnersAdminClient from "@/components/admin/PartnersAdminClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إدارة الشركاء والوكلاء | لوحة الإدارة",
  description: "عرض وإدارة الفنيين والموزعين المعتمدين وتصفية نطاق عملهم",
};

interface Props {
  params: { locale: string };
}

export default async function AdminPartnersPage({ params }: Props) {
  const { locale } = await params;
  const allUsers = await getAllUsers();
  
  // Filter for partners only (technicians, distributors, or engineers)
  const partners = allUsers.filter(
    (u) => u.role === "technician" || u.role === "distributor" || u.role === "engineer"
  );

  return (
    <div className="container-romad py-10">
      <PartnersAdminClient 
        initialPartners={partners} 
        locale={locale} 
      />
    </div>
  );
}

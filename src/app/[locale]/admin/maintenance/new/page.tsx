import type { Metadata } from "next";
import { getAllProducts, getAllUsers } from "@/lib/firestore.server";
import NewMaintenanceReportClient from "@/components/admin/NewMaintenanceReportClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إنشاء تقرير صيانة | لوحة الإدارة" : "New Maintenance Report | Admin",
  };
}

export default async function NewMaintenanceReportPage({ params }: Props) {
  const { locale } = await params;

  const [products, users] = await Promise.all([
    getAllProducts(),
    getAllUsers()
  ]);

  const serializedUsers = users.map((u: any) => ({
    uid: u.id || u.uid,
    name: u.name,
    email: u.email,
    phone: u.phone,
    workshopName: u.workshopName,
    role: u.role
  }));

  const staffMembers = serializedUsers.filter(u => u.role === "admin" || u.role === "engineer");

  return (
    <NewMaintenanceReportClient 
      users={serializedUsers as any}
      products={products as any}
      staffMembers={staffMembers as any}
      locale={locale} 
    />
  );
}

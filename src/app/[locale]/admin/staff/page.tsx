import type { Metadata } from "next";
import { getAllUsers } from "@/lib/firestore.server";
import StaffClient from "@/components/admin/StaffClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إدارة الموظفين والعملاء | لوحة الإدارة" : "Staff & Customers | Admin",
  };
}

export default async function StaffPage({ params }: Props) {
  const { locale } = await params;
  const users = await getAllUsers();

  const serializeDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') return date;
    if (date.seconds) return new Date(date.seconds * 1000).toISOString();
    return new Date().toISOString();
  };

  const serializedUsers = users.map((u: any) => ({
    uid: u.id || u.uid,
    name: u.name,
    email: u.email,
    phone: u.phone,
    workshopName: u.workshopName,
    role: u.role || "customer",
    createdAt: serializeDate(u.createdAt)
  }));

  return (
    <StaffClient 
      initialUsers={serializedUsers as any} 
      locale={locale} 
    />
  );
}

import type { Metadata } from "next";
import { getUserById, getAllOrders, getCustomerMaintenanceHistory } from "@/lib/firestore.server";
import { notFound } from "next/navigation";
import CustomerHistoryClient from "@/components/admin/CustomerHistoryClient";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "ملف العميل | لوحة الإدارة" : "Customer Profile | Admin",
  };
}

export default async function CustomerProfilePage({ params }: Props) {
  const { locale, id } = await params;

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  // Fetch all orders
  const allOrders = await getAllOrders();
  const customerOrders = allOrders.filter(o => o.userId === id || (o.guestInfo && o.id === id)); // Simple filter

  // Fetch all maintenance reports for this customer
  const reports = await getCustomerMaintenanceHistory(id);

  const serializeDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') return date;
    if (date.seconds) return new Date(date.seconds * 1000).toISOString();
    return new Date().toISOString();
  };

  const serializedOrders = customerOrders.map(o => ({
    ...o,
    createdAt: serializeDate(o.createdAt),
    updatedAt: serializeDate(o.updatedAt),
  }));

  const serializedReports = reports.map((r: any) => ({
    ...r,
    createdAt: serializeDate(r.createdAt),
    reportDate: r.reportDate || serializeDate(r.createdAt),
  }));

  const serializedUser = {
    ...user,
    createdAt: serializeDate(user.createdAt),
  };

  return (
    <CustomerHistoryClient 
      customer={serializedUser as any} 
      orders={serializedOrders as any}
      reports={serializedReports as any}
      locale={locale} 
    />
  );
}

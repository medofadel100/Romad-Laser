import type { Metadata } from "next";
import { getAllMaintenanceRequests, getAllOrders } from "@/lib/firestore.server";
import MaintenanceAdminClient from "@/components/admin/MaintenanceAdminClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "إدارة الصيانة والزيارات | لوحة الإدارة" : "Maintenance Management | Admin",
    description: isAr ? "إدارة طلبات الصيانة وتقارير زيارات المهندسين" : "Manage maintenance requests and engineer visit reports",
  };
}

export default async function AdminMaintenancePage({ params }: Props) {
  const { locale } = await params;
  
  // Fetch both standalone maintenance requests and orders that requested an engineer visit
  const [rawRequests, rawOrders] = await Promise.all([
    getAllMaintenanceRequests(),
    getAllOrders()
  ]);

  // Filter orders that explicitly requested an engineer visit
  const engineerVisitOrders = rawOrders.filter(order => order.engineerVisit === true);

  // Robust serialization for client component
  const serializeDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') return date;
    if (date.seconds) return new Date(date.seconds * 1000).toISOString();
    return new Date().toISOString();
  };

  const requests = rawRequests.map(req => ({
    ...req,
    createdAt: serializeDate(req.createdAt),
    updatedAt: serializeDate(req.updatedAt),
    scheduledDate: serializeDate(req.scheduledDate),
  }));

  const orderRequests = engineerVisitOrders.map(order => ({
    ...order,
    createdAt: serializeDate(order.createdAt),
    updatedAt: serializeDate(order.updatedAt),
  }));

  return (
    <MaintenanceAdminClient 
      initialRequests={requests as any} 
      orderRequests={orderRequests as any}
      locale={locale} 
    />
  );
}

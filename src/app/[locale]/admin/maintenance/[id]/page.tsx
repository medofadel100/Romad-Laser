import type { Metadata } from "next";
import { fetchFirestore, mapRestDoc, getAllUsers, getAllProducts } from "@/lib/firestore.server";
import MaintenanceReportClient from "@/components/admin/MaintenanceReportClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "تقرير الصيانة | لوحة الإدارة" : "Maintenance Report | Admin",
  };
}

export default async function AdminMaintenanceReportPage({ params }: Props) {
  const { locale, id } = await params;
  
  // Try to fetch as standalone request first
  let requestData = null;
  let isOrder = false;
  
  try {
    const rawReq = await fetchFirestore(`/maintenance_requests/${id}`);
    requestData = mapRestDoc(rawReq);
  } catch (e) {
    // If not found, try to fetch as an order
    try {
      const rawOrder = await fetchFirestore(`/orders/${id}`);
      requestData = mapRestDoc(rawOrder);
      isOrder = true;
    } catch (err) {
      notFound();
    }
  }

  // Fetch existing report if any
  let existingReport = null;
  try {
    const reportsQuery = await fetchFirestore(`/maintenance_reports?target=customerId`); // Simplified, usually need a proper query
    // Actually, we should fetch by requestId. We'll let the client handle fetching the report or history for simplicity,
    // or we can fetch it via server if we have the right index. 
    // For now, we will pass the request data and let the client handle report state.
  } catch(e) {}

  // Get all users to link this report to a specific customer history
  const [users, products] = await Promise.all([
    getAllUsers(),
    getAllProducts()
  ]);

  const serializeDate = (date: any) => {
    if (!date) return new Date().toISOString();
    if (typeof date.toDate === 'function') return date.toDate().toISOString();
    if (date instanceof Date) return date.toISOString();
    if (typeof date === 'string') return date;
    if (date.seconds) return new Date(date.seconds * 1000).toISOString();
    return new Date().toISOString();
  };

  const serializedData = {
    ...requestData,
    createdAt: serializeDate(requestData.createdAt),
    updatedAt: serializeDate(requestData.updatedAt),
    scheduledDate: serializeDate(requestData.scheduledDate),
  };

  const serializedUsers = users.map(u => ({
    uid: u.id || u.uid,
    name: u.name,
    email: u.email,
    phone: u.phone,
    workshopName: u.workshopName,
    role: u.role
  }));

  const staffMembers = serializedUsers.filter(u => u.role === "admin" || u.role === "engineer");

  return (
    <MaintenanceReportClient 
      requestData={serializedData as any} 
      isOrder={isOrder}
      users={serializedUsers as any}
      products={products as any}
      staffMembers={staffMembers as any}
      locale={locale} 
    />
  );
}

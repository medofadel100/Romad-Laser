import type { Metadata } from "next";
import { getAllOrders } from "@/lib/firestore.server";
import OrdersAdminClient from "@/components/admin/OrdersAdminClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "إدارة الطلبات | لوحة الإدارة" : "Order Management | Admin",
    description: isAr ? "متابعة وإدارة طلبات العملاء" : "Monitor and manage customer orders",
  };
}

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params;
  const rawOrders = await getAllOrders();

  // Robust serialization for client component
  const orders = rawOrders.map(order => {
    // Helper to serialize Firestore Timestamps or Dates
    const serializeDate = (date: any) => {
      if (!date) return new Date().toISOString();
      if (typeof date.toDate === 'function') return date.toDate().toISOString();
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') return date;
      if (date.seconds) return new Date(date.seconds * 1000).toISOString();
      return new Date().toISOString();
    };

    return {
      ...order,
      createdAt: serializeDate(order.createdAt),
      updatedAt: serializeDate(order.updatedAt),
    };
  });

  return (
    <OrdersAdminClient 
      initialOrders={orders as any} 
      locale={locale} 
    />
  );
}

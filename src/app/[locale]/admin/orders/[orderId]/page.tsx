import { getOrderById, getUserById } from "@/lib/firestore.server";
import OrderDetailClient from "@/components/admin/OrderDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { locale, orderId } = await params;
  const isAr = locale === "ar";

  const order = await getOrderById(orderId);
  if (!order) {
    notFound();
  }

  // Fetch user if userId exists
  let customerUser = null;
  if (order.userId) {
    customerUser = await getUserById(order.userId);
  }

  // Deep serialization
  const serializedOrder = JSON.parse(JSON.stringify(order));
  const serializedUser = customerUser ? JSON.parse(JSON.stringify(customerUser)) : null;

  return (
    <main className="container-romad py-8 lg:py-12 bg-gray-50 min-h-screen">
      <OrderDetailClient 
        locale={locale} 
        order={serializedOrder} 
        customerUser={serializedUser}
      />
    </main>
  );
}

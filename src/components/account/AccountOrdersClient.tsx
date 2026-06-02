"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrders } from "@/lib/firestore";
import { formatPrice, formatDate, orderStatusLabels, paymentStatusLabels } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  locale: string;
}

export default function AccountOrdersClient({ locale }: Props) {
  const { user, isLoading } = useAuth();
  const isAr = locale === "ar";
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isLoading && !user) {
      window.location.href = `/${locale}/auth/login`;
      return;
    }
    if (user) {
      getUserOrders(user.uid)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [user, isLoading, locale]);

  if (isLoading || isFetching) {
    return (
      <main className="container-romad py-20">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 rounded-full border-4 border-gold border-t-transparent animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="container-romad py-16 lg:py-20">
      <div className="mb-10">
        <Link
          href={`/${locale}`}
          className="text-sm text-text-muted hover:text-navy inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          {isAr ? "العودة للرئيسية" : "Back to home"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-pale flex items-center justify-center">
            <Package size={20} className="text-gold" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-4">
              {isAr ? "طلباتي" : "My Orders"}
            </h1>
            <p className="text-text-muted text-sm">
              {isAr ? "متابعة وعرض جميع طلباتك" : "Track and view all your orders"}
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center">
          <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-white mb-2">
            {isAr ? "لا يوجد طلبات بعد" : "No orders yet"}
          </p>
          <p className="text-text-muted mb-6">
            {isAr ? "ابدأ التسوق وستظهر طلباتك هنا" : "Start shopping and your orders will appear here"}
          </p>
          <Link href={`/${locale}/shop`} className="btn btn-primary">
            {isAr ? "تصفح المتجر" : "Browse Shop"}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = orderStatusLabels[order.status] || { ar: order.status, en: order.status, color: "text-gray-600 bg-gray-50" };
            const payStatus = paymentStatusLabels[order.paymentStatus] || { ar: order.paymentStatus, en: order.paymentStatus, color: "text-gray-600 bg-gray-50" };

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-text-muted mb-1">
                      {isAr ? "رقم الطلب" : "Order #"}
                    </p>
                    <p className="font-black text-white text-lg">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {isAr ? status.ar : status.en}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${payStatus.color}`}>
                      {isAr ? payStatus.ar : payStatus.en}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted">{isAr ? "التاريخ" : "Date"}</p>
                    <p className="font-semibold text-navy">
                      {order.createdAt?.toDate
                        ? formatDate(order.createdAt.toDate(), locale as "ar" | "en")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">{isAr ? "عدد المنتجات" : "Items"}</p>
                    <p className="font-semibold text-navy">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-text-muted">{isAr ? "طريقة الدفع" : "Payment"}</p>
                    <p className="font-semibold text-navy capitalize">
                      {order.paymentMethod === "cod"
                        ? isAr ? "كاش" : "Cash"
                        : order.paymentMethod === "instapay"
                        ? "Instapay"
                        : isAr ? "محفظة" : "Wallet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted">{isAr ? "الإجمالي" : "Total"}</p>
                    <p className="font-black text-gold">{formatPrice(order.total, locale as "ar" | "en")}</p>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs text-navy"
                      >
                        {isAr ? item.name_ar : item.name_en} × {item.qty}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs text-text-muted">
                        +{order.items.length - 3} {isAr ? "منتجات" : "more"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { 
  ShoppingBag, 
  Truck, 
  Package, 
  Wrench, 
  Users, 
  MapPin, 
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight
} from "lucide-react";

import { getAllOrders, getAllProducts } from "@/lib/firestore.server";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr ? "لوحة الإدارة" : "Admin Dashboard",
    description: isAr
      ? "إدارة الطلبات والشحن والمخزون والصيانة والموظفين"
      : "Manage orders, shipping, inventory, maintenance, and staff",
  };
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  // Fetch real data
  const orders = await getAllOrders();
  const products = await getAllProducts();

  // Calculate stats
  const newOrders = orders.filter(o => o.status === "pending").length;
  const totalSales = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const maintenanceRequests = orders.filter(o => o.engineerVisit === true && o.status !== "delivered" && o.status !== "cancelled").length;

  const nav = [
    {
      href: `/${locale}/admin/orders`,
      label: isAr ? "إدارة الطلبات" : "Order Management",
      desc: isAr ? "متابعة الطلبات وتحديث حالتها" : "Track orders and update status",
      icon: ShoppingBag,
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600",
    },
    {
      href: `/${locale}/admin/inventory`,
      label: isAr ? "المخزن والمخزون" : "Inventory & Stock",
      desc: isAr ? "إضافة المنتجات وتعديل الكميات" : "Add products and edit stock",
      icon: Package,
      color: "bg-gold",
      lightColor: "bg-gold/10 text-gold",
    },
    {
      href: `/${locale}/admin/shipping-rates`,
      label: isAr ? "أسعار الشحن" : "Shipping Rates",
      desc: isAr ? "ضبط تكلفة الشحن للمحافظات" : "Set shipping costs per city",
      icon: MapPin,
      color: "bg-purple-500",
      lightColor: "bg-purple-50 text-purple-600",
    },
    {
      href: `/${locale}/admin/shipments`,
      label: isAr ? "إدارة الشحنات" : "Shipment Tracking",
      desc: isAr ? "تنسيق الشحن مع شركات النقل" : "Coordinate with shipping companies",
      icon: Truck,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 text-emerald-600",
    },
    {
      href: `/${locale}/admin/maintenance`,
      label: isAr ? "قسم الصيانة" : "Maintenance Dept.",
      desc: isAr ? "إدارة طلبات صيانة الماكينات" : "Manage machine repair requests",
      icon: Wrench,
      color: "bg-orange-500",
      lightColor: "bg-orange-50 text-orange-600",
    },
    {
      href: `/${locale}/admin/staff`,
      label: isAr ? "الموظفون" : "Staff Members",
      desc: isAr ? "إدارة الصلاحيات والموظفين" : "Manage roles and permissions",
      icon: Users,
      color: "bg-navy",
      lightColor: "bg-gray-100 text-navy",
    },
  ];

  const stats = [
    { 
      label: isAr ? "طلبات جديدة" : "New Orders", 
      value: newOrders.toString(), 
      trend: isAr ? "انتظار" : "Pending", 
      icon: ShoppingBag, 
      color: "text-blue-600" 
    },
    { 
      label: isAr ? "إجمالي المبيعات" : "Total Sales", 
      value: formatPrice(totalSales, locale), 
      trend: "+100%", 
      icon: TrendingUp, 
      color: "text-emerald-600" 
    },
    { 
      label: isAr ? "منتجات نشطة" : "Active Products", 
      value: activeProducts.toString(), 
      trend: "OK", 
      icon: Package, 
      color: "text-gold" 
    },
    { 
      label: isAr ? "طلبات صيانة" : "Maintenance", 
      value: maintenanceRequests.toString(), 
      trend: isAr ? "نشط" : "Active", 
      icon: Wrench, 
      color: "text-orange-600" 
    },
  ];

  const lastUpdate = new Date().toLocaleTimeString(isAr ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="container-romad py-8 lg:py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-10 bg-gold rounded-full" />
            <span className="text-sm font-black text-gold uppercase tracking-widest">
              {isAr ? "نظام الإدارة" : "ERP SYSTEM"}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-navy leading-tight">
            {isAr ? "لوحة التحكم الرئيسية" : "Main Control Panel"}
          </h1>
          <p className="text-text-muted mt-3 max-w-2xl text-lg">
            {isAr
              ? "مرحباً بك في لوحة التحكم الشاملة. من هنا يمكنك إدارة جميع جوانب Romad-Laser."
              : "Welcome to the dashboard. Here is the real-time overview of Romad-Laser."}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-2 rounded-[24px] flex items-center gap-2 shadow-sm">
          <div className="bg-navy text-white p-3 rounded-2xl">
            <Clock className="h-5 w-5" />
          </div>
          <div className="px-4 text-right">
            <p className="text-[10px] text-text-muted font-bold uppercase">{isAr ? "آخر تحديث" : "LAST UPDATE"}</p>
            <p className="text-sm font-black text-navy">{isAr ? `اليوم، ${lastUpdate}` : `Today, ${lastUpdate}`}</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className={`p-4 rounded-2xl bg-gray-50 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl lg:text-2xl font-black text-navy">{stat.value}</span>
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-lg">
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background Accent */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${item.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="relative flex flex-col h-full">
                <div className={`h-16 w-16 rounded-3xl ${item.lightColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-navy mb-2 group-hover:text-gold transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs font-black text-navy group-hover:translate-x-2 transition-transform rtl:group-hover:-translate-x-2">
                    <span>{isAr ? "دخول القسم" : "Enter Section"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access / Help Section */}
      <div className="mt-12 bg-navy rounded-[40px] p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gold/10 -skew-x-12 translate-x-1/2" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black mb-4">{isAr ? "تحتاج للمساعدة؟" : "Need Assistance?"}</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              {isAr 
                ? "إذا واجهت أي مشكلة في لوحة التحكم أو كان لديك اقتراح لتحسين النظام، تواصل مع فريق التطوير."
                : "If you encounter any issues with the dashboard or have suggestions for improvement, contact the dev team."}
            </p>
            <button className="btn bg-gold text-navy border-none hover:bg-white font-black px-10 h-14 rounded-2xl">
              {isAr ? "الدعم الفني" : "Technical Support"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-gold mb-2">{isAr ? "دليل الاستخدام" : "GUIDE"}</p>
              <p className="text-sm font-bold">{isAr ? "تعلم كيف تدير المخزن" : "Manage Inventory Guide"}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-gold mb-2">{isAr ? "التقارير" : "REPORTS"}</p>
              <p className="text-sm font-bold">{isAr ? "مشاهدة تقارير المبيعات" : "View Sales Reports"}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

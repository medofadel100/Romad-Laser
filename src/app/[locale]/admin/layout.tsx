import AdminAuthGateClient from "./AdminAuthGateClient";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={locale === "ar" ? "font-cairo" : "font-inter"}
    >
      <AdminAuthGateClient locale={locale}>{children}</AdminAuthGateClient>
    </div>
  );
}



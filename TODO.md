# ERP Dashboard TODO

## المرحلة 1: Admin UI routes (Next.js App Router)
- [x] إنشاء `/src/app/[locale]/admin/layout.tsx` مع RTL/LTR + Auth حماية.
- [x] إنشاء `/src/app/[locale]/admin/page.tsx` Dashboard overview.
- [x] إنشاء `/src/app/[locale]/admin/orders/page.tsx` Orders + shipment status.
- [x] إنشاء `/src/app/[locale]/admin/orders/[orderId]/page.tsx` صفحة تفاصيل order + send WhatsApp update.
- [x] إنشاء `/src/app/[locale]/admin/shipping-rates/page.tsx` صفحة أسعار الشحن (Governorate + City overrides).
- [x] إنشاء `/src/app/[locale]/admin/shipments/page.tsx` Shipments tracking.
- [x] إنشاء `/src/app/[locale]/admin/inventory/page.tsx` Stock + low-stock alerts + reorder requests.
- [x] إنشاء `/src/app/[locale]/admin/maintenance/page.tsx` Create maintenance sale.
- [x] إنشاء `/src/app/[locale]/admin/maintenance/sales/page.tsx` maintenance sales history.
- [x] إنشاء `/src/app/[locale]/admin/staff/page.tsx` CRUD staff + permissions.

## المرحلة 2: Firestore schema (Collections جديدة)
- [ ] تجهيز collections: staff / shippingCompanies / shippingRates / shipments / shippingUpdates / whatsappMessageLogs
- [ ] تجهيز collections: inventory / inventoryMovements
- [ ] تجهيز collections: maintenanceSales / maintenanceSaleItems / maintenanceReports

## المرحلة 3: Firestore rules
- [ ] تحديث `firestore.rules` لتطابق RBAC (admin/shipping/maintenance/staff/viewer).

## المرحلة 4: Backend endpoints
- [ ] إضافة API routes لـ: إرسال WhatsApp + تسجيل logs + عمليات inventoryMovements/shippingUpdates.

## المرحلة 5: الربط مع UI
- [ ] ربط الصفحات بقراء/كتابة Firestore.
- [ ] إضافة صفحات تقارير: filters حسب فترة زمنية (week/month/custom).

## تعديل أمني (UI)
- [x] إضافة صفحة Forgot Password داخل الموقع.
- [x] ربط “Forgot Password” في صفحة Login.


## المرحلة 6: جودة وتشغيل
- [ ] تشغيل `npm run dev` + اختبار Routes.
- [ ] إصلاح أي TypeScript/ESLint issues.


import { Timestamp } from "firebase/firestore";

// ─── Product Types ───────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
}

export interface ProductSize {
  label: string;
  price: number;
  salePrice?: number;
}

export interface Product {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  salePrice?: number;
  categories: string[];
  images: ProductImage[];
  stock: number;
  sku: string;
  specs: string;
  sizes?: ProductSize[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category Types ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  parent: string | null;
  image?: string;
  order: number;
  productCount: number;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export type PaymentMethod = "instapay" | "wallet" | "cod";
export type PaymentStatus =
  | "pending"
  | "uploaded"
  | "confirmed"
  | "rejected";
export type ShippingMethod =
  | "public_transport"
  | "courier"
  | "engineer_visit"
  | "pickup"
  | "microbus";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name_ar: string;
  name_en: string;
  price: number;
  qty: number;
  image: string;
  size?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  governorate: string;
  city: string;
  details: string;
}

export interface Order {
  id: string;
  userId?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentScreenshot?: string;
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  notes?: string;
  adminNotes?: string;
  engineerVisit?: boolean;
  shippingType: "courier" | "pickup" | "microbus";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = "admin" | "staff" | "customer";

export interface Address {
  id: string;
  name: string;
  phone: string;
  governorate: string;
  city: string;
  details: string;
  isDefault: boolean;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  workshopName?: string;
  workshopAddress?: string;
  role: UserRole;
  addresses: Address[];
  createdAt: Timestamp;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  isApproved: boolean;
  createdAt: Timestamp;
}

// ─── Coupon Types ─────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Timestamp;
  isActive: boolean;
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  size?: string;
  name_ar: string;
  name_en: string;
  price: number;
  salePrice?: number;
  image: string;
  slug: string;
  sku: string;
  stock: number;
  qty: number;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type Locale = "ar" | "en";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// ─── Maintenance Types ────────────────────────────────────────────────────────

export type MaintenanceStatus = "pending" | "scheduled" | "completed" | "cancelled";

export interface MaintenanceRequest {
  id: string;
  type: "order_visit" | "diagnostic_visit";
  orderId?: string; // If linked to an order
  userId?: string;  // If logged in
  customerName: string;
  customerPhone: string;
  workshopName?: string;
  workshopAddress: string;
  description?: string;
  status: MaintenanceStatus;
  scheduledDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceReport {
  id: string;
  requestId: string;
  userId?: string;
  customerId?: string; // for history
  machineSpecs: string;
  diagnosis: string;
  actionsTaken: string;
  partsUsed: Array<{ name: string; qty: number; price: number }>;
  totalPartsCost: number;
  visitCost: number;
  totalCost: number;
  notes: string;
  createdAt: Timestamp;
}

export interface MachineInfo {
  id: string;
  customerId: string;
  machineName: string;
  specs: string;
  installDate?: Timestamp;
  lastMaintenanceDate?: Timestamp;
  notes?: string;
}

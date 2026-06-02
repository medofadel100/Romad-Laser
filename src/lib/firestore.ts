import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Product,
  Category,
  Order,
  AppUser,
  Review,
  Coupon,
} from "@/types";

const PRODUCTS_PER_PAGE = 12;

// Helper: get Firestore instance or null (for SSR/build safety)
function getDbOrNull() {
  return db ?? null;
}

function getDbOrThrow() {
  const _db = getDbOrNull();
  if (!_db) throw new Error("Firebase not initialized");
  return _db;
}


// Helper: recursively remove undefined fields
export function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;

  // Don't traverse Firestore special objects (Timestamps, FieldValues, etc.)
  if (obj.toDate || obj._methodName || obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((v: any) => v !== undefined);
  }

  const cleaned: any = {};
  for (const key in obj) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = removeUndefined(val);
    }
  }
  return cleaned;
}


// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(
  categoryId?: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
) {
  const _db = getDbOrNull();
  if (!_db) {
    return { products: [], lastVisible: undefined as any, hasMore: false };
  }

  let q = query(
    collection(_db, "products"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(PRODUCTS_PER_PAGE)
  );

  if (categoryId) {
    q = query(
      collection(_db, "products"),
      where("isActive", "==", true),
      where("categories", "array-contains", categoryId),
      orderBy("createdAt", "desc"),
      limit(PRODUCTS_PER_PAGE)
    );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { products, lastVisible, hasMore: snapshot.docs.length === PRODUCTS_PER_PAGE };
}

export async function getAllProducts() {
  const _db = getDbOrNull();
  if (!_db) return [];

  const q = query(
    collection(_db, "products"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getFeaturedProducts(count = 8) {
  const _db = getDbOrNull();
  if (!_db) return [];


  // Query without orderBy to avoid requiring composite index
  const q = query(
    collection(_db, "products"),
    where("isActive", "==", true),
    where("isFeatured", "==", true),
    limit(count * 2) // Fetch extra to account for sorting
  );
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  
  // Sort by createdAt in application code
  return products
    .sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    })
    .slice(0, count);
}

export async function getProductBySlug(slug: string) {
  const _db = getDbOrNull();
  if (!_db) return null;

  const q = query(collection(_db, "products"), where("slug", "==", slug), limit(1));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
}

export async function getProductById(id: string) {
  const _db = getDbOrNull();
  if (!_db) return null;

  const docRef = doc(_db, "products", id);

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const _db = getDbOrNull();
  if (!_db) throw new Error("Firebase not initialized");

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  const docRef = await addDoc(collection(_db, "products"), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const _db = getDbOrNull();
  if (!_db) throw new Error("Firebase not initialized");

  const docRef = doc(_db, "products", id);

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  await updateDoc(docRef, { ...cleanData, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  const _db = getDbOrNull();
  if (!_db) return;

  await deleteDoc(doc(_db, "products", id));
}

export async function searchProducts(searchTerm: string) {
  const _db = getDbOrNull();
  if (!_db) return [];

  // Firestore doesn't support full-text search natively
  // We query by name_ar and tags and merge results
  const snapshot = await getDocs(
    query(collection(_db, "products"), where("isActive", "==", true), limit(50))

  );
  const term = searchTerm.toLowerCase();
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Product))
    .filter(
      (p) =>
        p.name_ar.toLowerCase().includes(term) ||
        p.name_en.toLowerCase().includes(term) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
}

export async function getAllAdminProducts() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "categories"), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getCategoryBySlug(slug: string) {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "categories"), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Category;
}

export async function createCategory(data: Omit<Category, "id">) {
  const _db = getDbOrThrow();

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  const docRef = await addDoc(collection(_db, "categories"), cleanData);
  return docRef.id;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const _db = getDbOrNull();
  if (!_db) return;

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  await updateDoc(doc(_db, "categories", id), cleanData);
}

export async function deleteCategory(id: string) {
  const _db = getDbOrNull();
  if (!_db) return;

  await deleteDoc(doc(_db, "categories", id));
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">) {
  const _db = getDbOrThrow();

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  const docRef = await addDoc(collection(_db, "orders"), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrderById(id: string) {
  const _db = getDbOrNull();
  if (!_db) return null;

  const snapshot = await getDoc(doc(_db, "orders", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Order;
}

export async function getUserOrders(userId: string) {
  const _db = getDbOrNull();
  if (!_db) return [];

  // Query without orderBy to avoid requiring composite index
  const q = query(
    collection(_db, "orders"),
    where("userId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

  // Sort by createdAt in application code
  return orders.sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });
}

export async function getAllOrders() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const _db = getDbOrThrow();

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  await updateDoc(doc(_db, "orders", id), { ...cleanData, updatedAt: serverTimestamp() });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserById(uid: string) {
  const _db = getDbOrThrow();

  const snapshot = await getDoc(doc(_db, "users", uid));
  if (!snapshot.exists()) return null;
  return { uid: snapshot.id, ...snapshot.data() } as AppUser;
}

export async function createUser(uid: string, data: Omit<AppUser, "uid" | "createdAt">) {
  const _db = getDbOrThrow();

  await updateDoc(doc(_db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
  }).catch(async () => {
    // Document doesn't exist, use setDoc via addDoc approach
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(_db, "users", uid), {
      uid,
      ...data,
      createdAt: serverTimestamp(),
    });
  });
}

export async function updateUser(uid: string, data: Partial<AppUser>) {
  const _db = getDbOrThrow();

  await updateDoc(doc(_db, "users", uid), data);
}

export async function getAllUsers() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "users"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  const _db = getDbOrThrow();

  const q = query(
    collection(_db, "reviews"),
    where("productId", "==", productId),
    where("isApproved", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

export async function createReview(data: Omit<Review, "id" | "createdAt">) {
  const _db = getDbOrThrow();

  const docRef = await addDoc(collection(_db, "reviews"), {
    ...removeUndefined(data),
    isApproved: false,
    createdAt: serverTimestamp(),
  });



  // Update product rating
  await updateProductRating(data.productId);
  return docRef.id;
}

export async function approveReview(id: string) {
  const _db = getDbOrThrow();

  await updateDoc(doc(_db, "reviews", id), { isApproved: true });
}

export async function rejectReview(id: string) {
  const _db = getDbOrThrow();

  await deleteDoc(doc(_db, "reviews", id));
}

export async function getAllReviews() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "reviews"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

async function updateProductRating(productId: string) {
  const _db = getDbOrThrow();

  const reviews = await getProductReviews(productId);
  if (reviews.length === 0) return;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await updateDoc(doc(_db, "products", productId), {
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────


export async function getCouponByCode(code: string) {
  const _db = getDbOrThrow();

  const q = query(
    collection(_db, "coupons"),
    where("code", "==", code.toUpperCase()),
    where("isActive", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Coupon;
}

export async function getAllCoupons() {
  const _db = getDbOrThrow();

  const q = query(collection(_db, "coupons"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
}

export async function createCoupon(data: Omit<Coupon, "id">) {
  const _db = getDbOrThrow();

  const docRef = await addDoc(collection(_db, "coupons"), removeUndefined(data));
  return docRef.id;
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  const _db = getDbOrThrow();

  // Remove undefined fields to avoid Firestore errors
  const cleanData = removeUndefined(data);

  await updateDoc(doc(_db, "coupons", id), cleanData);
}

export async function useCoupon(id: string) {
  const _db = getDbOrThrow();

  await updateDoc(doc(_db, "coupons", id), { usedCount: increment(1) });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getShippingSettings() {
  const _db = getDbOrNull();
  if (!_db) return null;

  const docRef = doc(_db, "settings", "shipping");
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Return defaults if document doesn't exist
    return {
      freeShippingThreshold: 1500,
      rates: {
        cairo: 50,
        giza: 50,
        alexandria: 60,
        sharqia: 65,
        dakahlia: 65,
        beheira: 65,
        minya: 85,
        sohag: 90,
        qena: 95,
        assiut: 85,
        fayoum: 70,
        beni_suef: 75,
        menoufia: 65,
        kafr_el_sheikh: 65,
        damietta: 65,
        port_said: 65,
        ismailia: 65,
        suez: 65,
        north_sinai: 120,
        south_sinai: 120,
        red_sea: 120,
        new_valley: 130,
        matruh: 120,
        luxor: 100,
        aswan: 110,
      } as Record<string, number>
    };
  }

  return snapshot.data() as { freeShippingThreshold: number; rates: Record<string, number> };
}

export async function updateShippingSettings(data: { freeShippingThreshold: number; rates: Record<string, number> }) {
  const _db = getDbOrThrow();
  const { setDoc } = await import("firebase/firestore");
  
  const docRef = doc(_db, "settings", "shipping");
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export { serverTimestamp, Timestamp };

// ─── Maintenance ─────────────────────────────────────────────────────────────

export async function createMaintenanceRequest(
  data: Omit<import("../types").MaintenanceRequest, "id" | "createdAt" | "updatedAt">
) {
  const _db = getDbOrThrow();
  const cleanData = removeUndefined(data);
  const docRef = await addDoc(collection(_db, "maintenance_requests"), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getMaintenanceRequests() {
  const _db = getDbOrThrow();
  const q = query(collection(_db, "maintenance_requests"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import("../types").MaintenanceRequest));
}

export async function updateMaintenanceRequest(
  id: string,
  data: Partial<import("../types").MaintenanceRequest>
) {
  const _db = getDbOrThrow();
  const cleanData = removeUndefined(data);
  const docRef = doc(_db, "maintenance_requests", id);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  });
}

export async function createMaintenanceReport(
  data: Omit<import("../types").MaintenanceReport, "id" | "createdAt">
) {
  const _db = getDbOrThrow();
  const cleanData = removeUndefined(data);
  const docRef = await addDoc(collection(_db, "maintenance_reports"), {
    ...cleanData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCustomerMaintenanceHistory(customerId: string) {
  const _db = getDbOrThrow();
  const q = query(
    collection(_db, "maintenance_reports"),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import("../types").MaintenanceReport));
}
export async function updateUserRole(userId: string, role: string) {
  const _db = getDbOrThrow();
  const userRef = doc(_db, "users", userId);
  await updateDoc(userRef, { role });
}

export async function createCustomerProfile(data: { name: string, phone: string, workshopName: string, workshopAddress: string }) {
  const _db = getDbOrThrow();
  const docRef = doc(collection(_db, "users")); // Generate unique ID
  await setDoc(docRef, {
    uid: docRef.id,
    name: data.name,
    phone: data.phone,
    workshopName: data.workshopName,
    workshopAddress: data.workshopAddress,
    role: "customer",
    addresses: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

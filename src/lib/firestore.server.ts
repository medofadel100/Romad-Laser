import type { Product, Category, Order, AppUser } from "@/types";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const PRODUCTS_PER_PAGE = 12;

export type PaginatedProducts = {
  products: Product[];
  lastVisible: any;
  hasMore: boolean;
};

export async function fetchFirestore(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    next: { revalidate: 0 },
  });

  const text = await response.text();
  
  if (!response.ok) {
    try {
      const error = JSON.parse(text);
      throw new Error(`Firestore REST API error: ${JSON.stringify(error)}`);
    } catch {
      throw new Error(`Firestore REST API HTTP error ${response.status}: ${text.slice(0, 200)}`);
    }
  }

  try {
    return JSON.parse(text);
  } catch (err: any) {
    console.error("JSON Parse Error at URL:", url);
    console.error("Response text preview:", text.slice(0, 500));
    throw new Error(`Failed to parse Firestore response: ${err.message}`);
  }
}

export function mapRestDoc(doc: any) {
  const fields = doc.fields || {};
  const data: any = {
    id: doc.name.split("/").pop(),
  };

  for (const [key, value] of Object.entries(fields)) {
    data[key] = unwrapValue(value);
  }

  return data;
}

function unwrapValue(value: any): any {
  if ("stringValue" in value) return value.stringValue;
  if ("doubleValue" in value) return value.doubleValue;
  if ("integerValue" in value) return parseInt(value.integerValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(unwrapValue);
  }
  if ("mapValue" in value) {
    const map: any = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      map[k] = unwrapValue(v);
    }
    return map;
  }
  if ("nullValue" in value) return null;
  return value;
}

export async function getAllProducts() {
  const data = await fetchFirestore("/products?pageSize=100");
  const products = (data.documents || []).map(mapRestDoc) as Product[];
  
  return products
    .filter((p) => p.isActive !== false)
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return timeB - timeA;
    });
}

export async function getProducts(categoryId?: string): Promise<PaginatedProducts> {
  const all = await getAllProducts();
  let filtered = all;
  
  if (categoryId) {
    filtered = all.filter((p) => p.categories?.includes(categoryId));
  }

  const paginated = filtered.slice(0, PRODUCTS_PER_PAGE);

  return {
    products: paginated,
    lastVisible: undefined,
    hasMore: filtered.length > PRODUCTS_PER_PAGE,
  };
}

export async function getCategories() {
  const data = await fetchFirestore("/categories?pageSize=100");
  const categories = (data.documents || []).map(mapRestDoc) as Category[];
  
  return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

export async function getProductBySlug(slug: string) {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function searchProducts(searchTerm: string) {
  const products = await getAllProducts();
  const normalized = searchTerm.trim().toLowerCase();
  
  return products.filter(
    (product) =>
      product.name_ar.toLowerCase().includes(normalized) ||
      product.name_en.toLowerCase().includes(normalized) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

export async function getOrderById(orderId: string) {
  try {
    const doc = await fetchFirestore(`/orders/${orderId}`);
    return mapRestDoc(doc) as Order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
}

export async function getShippingSettings() {
  try {
    const doc = await fetchFirestore("/settings/shipping");
    return mapRestDoc(doc) as { freeShippingThreshold: number; rates: Record<string, number> };
  } catch (error) {
    return {
      freeShippingThreshold: 1500,
      rates: {
        cairo: 50,
        giza: 50,
        alexandria: 60,
        sharqia: 65,
        dakahlia: 65,
        beheira: 65,
        gharbia: 65,
        qalyubia: 65,
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
}

export async function getAllOrders() {
  try {
    const data = await fetchFirestore("/orders?pageSize=1000");
    const orders = (data.documents || []).map(mapRestDoc) as Order[];
    return orders.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

export async function getFeaturedProducts(limitCount: number = 8) {
  const products = await getAllProducts();
  return products
    .filter((p) => p.isFeatured === true)
    .slice(0, limitCount);
}

export async function getAllUsers() {
  try {
    const data = await fetchFirestore("/users?pageSize=1000");
    if (!data.documents) return [];
    return data.documents.map(mapRestDoc) as AppUser[];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getUserById(uid: string) {
  if (uid.startsWith("guest_")) {
    return {
      id: uid,
      name: "زائر (Guest)",
      email: "غير متوفر",
      role: "customer"
    };
  }

  try {
    const doc = await fetchFirestore(`/users/${uid}`);
    return mapRestDoc(doc);
  } catch (error: any) {
    if (!error?.message?.includes("404")) {
      console.error(`Error fetching user by ID ${uid}:`, error);
    }
    return null;
  }
}

export async function getAllMaintenanceRequests() {
  try {
    const data = await fetchFirestore("/maintenance_requests");
    if (!data.documents) return [];

    return data.documents.map((doc: any) => mapRestDoc(doc)).sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error fetching all maintenance requests:", error);
    return [];
  }
}

export async function getCustomerMaintenanceHistory(customerId: string) {
  try {
    // In REST API, filtering requires structuredQuery, but for simplicity we can fetch all reports and filter
    const data = await fetchFirestore("/maintenance_reports?pageSize=1000");
    if (!data.documents) return [];
    
    const reports = data.documents.map(mapRestDoc);
    return reports
      .filter((r: any) => r.customerId === customerId)
      .sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error(`Error fetching maintenance history for ${customerId}:`, error);
    return [];
  }
}

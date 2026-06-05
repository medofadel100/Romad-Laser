import type { Product, Category, Order, AppUser } from "@/types";
import * as admin from "firebase-admin";
import { cache } from "react";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const PRODUCTS_PER_PAGE = 12;

let adminDb: any = null;

// Initialize Firebase Admin SDK if service account is available on the server
if (typeof window === "undefined" && !admin.apps.length) {
  const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      adminDb = admin.firestore();
    } catch (error) {
      console.error("Error initializing Firebase Admin in firestore.server.ts:", error);
    }
  }
}

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

// Optimized structured REST query helper
export async function runStructuredQuery(queryBody: any) {
  const url = `${BASE_URL}:runQuery`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(queryBody),
    next: { revalidate: 0 },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Firestore runQuery REST API error: ${text}`);
  }

  const results = JSON.parse(text);
  return (results || [])
    .filter((r: any) => r.document)
    .map((r: any) => mapRestDoc(r.document));
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

export const getAllProducts = cache(async () => {
  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("products")
        .where("isActive", "==", true)
        .get();
      const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Product[];
      
      return products.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error fetching all products using firebase-admin:", error);
    }
  }

  // Fallback to optimized REST structuredQuery without orderBy to avoid requiring composite indexes
  try {
    const products = await runStructuredQuery({
      structuredQuery: {
        from: [{ collectionId: "products" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "isActive" },
            op: "EQUAL",
            value: { booleanValue: true },
          },
        },
      },
    }) as Product[];

    return products.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching all products using runQuery REST:", error);
    // Ultimate fallback
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
});

export const getProducts = cache(async (categoryId?: string): Promise<PaginatedProducts> => {
  if (adminDb) {
    try {
      let q = adminDb.collection("products").where("isActive", "==", true);
      if (categoryId) {
        q = q.where("categories", "array-contains", categoryId);
      }
      const snapshot = await q.get();
      const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Product[];
      
      products.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
        return timeB - timeA;
      });

      const paginated = products.slice(0, PRODUCTS_PER_PAGE);
      const hasMore = products.length > PRODUCTS_PER_PAGE;

      return {
        products: paginated,
        lastVisible: undefined,
        hasMore,
      };
    } catch (error) {
      console.error("Error in getProducts using Admin SDK:", error);
    }
  }

  // Fallback to runQuery REST (without orderBy to remain composite index-independent)
  try {
    const filters: any[] = [
      {
        fieldFilter: {
          field: { fieldPath: "isActive" },
          op: "EQUAL",
          value: { booleanValue: true },
        },
      },
    ];

    if (categoryId) {
      filters.push({
        fieldFilter: {
          field: { fieldPath: "categories" },
          op: "ARRAY_CONTAINS",
          value: { stringValue: categoryId },
        },
      });
    }

    const products = await runStructuredQuery({
      structuredQuery: {
        from: [{ collectionId: "products" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters,
          },
        },
      },
    }) as Product[];

    // Sort in application memory
    products.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return timeB - timeA;
    });

    const hasMore = products.length > PRODUCTS_PER_PAGE;
    const slicedProducts = products.slice(0, PRODUCTS_PER_PAGE);

    return {
      products: slicedProducts,
      lastVisible: undefined,
      hasMore,
    };
  } catch (error) {
    console.error("Error in getProducts using runQuery REST:", error);
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
});

export const getCategories = cache(async () => {
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("categories").orderBy("order", "asc").get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Category[];
    } catch (error) {
      console.error("Error fetching categories using admin SDK:", error);
    }
  }

  const data = await fetchFirestore("/categories?pageSize=100");
  const categories = (data.documents || []).map(mapRestDoc) as Category[];
  
  return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
});

export const getProductBySlug = cache(async (slug: string) => {
  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("products")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
    } catch (error) {
      console.error("Error fetching product by slug using admin SDK:", error);
    }
  }

  const products = await getAllProducts();
  return products.find((p) => p.slug === slug) || null;
});

export const searchProducts = cache(async (searchTerm: string) => {
  const products = await getAllProducts();
  const normalized = searchTerm.trim().toLowerCase();
  
  return products.filter(
    (product) =>
      product.name_ar.toLowerCase().includes(normalized) ||
      product.name_en.toLowerCase().includes(normalized) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(normalized))
  );
});

export const getOrderById = cache(async (orderId: string) => {
  if (adminDb) {
    try {
      const doc = await adminDb.collection("orders").doc(orderId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as Order;
      }
      return null;
    } catch (error) {
      console.error("Error fetching order by ID using admin SDK:", error);
    }
  }

  try {
    const doc = await fetchFirestore(`/orders/${orderId}`);
    return mapRestDoc(doc) as Order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
});

export const getShippingSettings = cache(async () => {
  if (adminDb) {
    try {
      const doc = await adminDb.collection("settings").document("shipping").get();
      if (doc.exists) {
        return doc.data() as { freeShippingThreshold: number; rates: Record<string, number> };
      }
    } catch (error) {
      console.error("Error fetching shipping settings using admin SDK:", error);
    }
  }

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
});

export const getAllOrders = cache(async () => {
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Order[];
    } catch (error) {
      console.error("Error fetching all orders using admin SDK:", error);
    }
  }

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
});

export const getFeaturedProducts = cache(async (limitCount: number = 8) => {
  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("products")
        .where("isActive", "==", true)
        .where("isFeatured", "==", true)
        .get();
      const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Product[];
      
      return products
        .sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error fetching featured products using admin SDK:", error);
    }
  }

  // REST API fallback
  try {
    const products = await runStructuredQuery({
      structuredQuery: {
        from: [{ collectionId: "products" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "isActive" },
                  op: "EQUAL",
                  value: { booleanValue: true },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "isFeatured" },
                  op: "EQUAL",
                  value: { booleanValue: true },
                },
              },
            ],
          },
        },
      },
    }) as Product[];

    return products
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching featured products using runQuery REST:", error);
    const products = await getAllProducts();
    return products
      .filter((p) => p.isFeatured === true)
      .slice(0, limitCount);
  }
});

export const getAllUsers = cache(async () => {
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc: any) => ({ uid: doc.id, ...doc.data() })) as AppUser[];
    } catch (error) {
      console.error("Error fetching all users using admin SDK:", error);
    }
  }

  try {
    const data = await fetchFirestore("/users?pageSize=1000");
    if (!data.documents) return [];
    return data.documents.map(mapRestDoc) as AppUser[];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
});

export const getUserById = cache(async (uid: string) => {
  if (uid.startsWith("guest_")) {
    return {
      id: uid,
      name: "زائر (Guest)",
      email: "غير متوفر",
      role: "customer"
    };
  }

  if (adminDb) {
    try {
      const doc = await adminDb.collection("users").doc(uid).get();
      if (doc.exists) {
        return { uid: doc.id, ...doc.data() } as AppUser;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user ${uid} using admin SDK:`, error);
    }
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
});

export const getAllMaintenanceRequests = cache(async () => {
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("maintenance_requests").orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as any[];
    } catch (error) {
      console.error("Error fetching maintenance requests using admin SDK:", error);
    }
  }

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
});

export const getCustomerMaintenanceHistory = cache(async (customerId: string) => {
  if (adminDb) {
    try {
      const snapshot = await adminDb
        .collection("maintenance_reports")
        .where("customerId", "==", customerId)
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as any[];
    } catch (error) {
      console.error("Error fetching customer maintenance history using admin SDK:", error);
    }
  }

  try {
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
});

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { removeUndefined } from "@/lib/firestore";

function getDbOrNull() {
  return db ?? null;
}


interface WishlistItem {
  productId: string;
  name_ar: string;
  name_en: string;
  price: number;
  salePrice?: number;
  image: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;

  addItem: (item: WishlistItem, userId?: string) => Promise<void>;
  removeItem: (productId: string, userId?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithFirestore: (userId: string, items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (newItem, userId) => {
        const { items } = get();
        if (items.find((i) => i.productId === newItem.productId)) return;

        set({ items: [...items, newItem] });

        // Sync to Firestore if logged in
        const _db = getDbOrNull();
        if (userId && _db) {
          try {
            await updateDoc(doc(_db, "users", userId), {
              wishlist: arrayUnion(removeUndefined(newItem)),
            });
          } catch {
            // Silently fail — local state is still updated
          }
        }
      },

      removeItem: async (productId, userId) => {
        const { items } = get();
        const item = items.find((i) => i.productId === productId);
        set({ items: items.filter((i) => i.productId !== productId) });

        // Sync to Firestore if logged in
        const _db = getDbOrNull();
        if (userId && item && _db) {
          try {
            await updateDoc(doc(_db, "users", userId), {
              wishlist: arrayRemove(removeUndefined(item)),
            });

          } catch {
            // Silently fail
          }
        }
      },

      isInWishlist: (productId) =>
        get().items.some((i) => i.productId === productId),

      clearWishlist: () => set({ items: [] }),

      syncWithFirestore: (userId, items) => {
        set({ items });
      },
    }),
    {
      name: "roma-wishlist",
    }
  )
);

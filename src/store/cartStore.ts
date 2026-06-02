import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.id === newItem.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === newItem.id
                ? { ...i, qty: Math.min(i.qty + newItem.qty, i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
        // Auto-open cart drawer
        set({ isOpen: true });
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },

      updateQty: (itemId, qty) => {
        if (qty < 1) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId
              ? { ...i, qty: Math.min(qty, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], isOpen: false }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.salePrice ?? i.price) * i.qty,
          0
        ),
    }),
    {
      name: "romad-cart",
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
    }
  )
);

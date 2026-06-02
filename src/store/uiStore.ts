import { create } from "zustand";
import type { ToastMessage } from "@/types";

let toastId = 0;

interface UIStore {
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: ToastMessage["type"], message: string) => void;
  removeToast: (id: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Mobile nav
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Image lightbox
  lightboxImages: string[];
  lightboxIndex: number;
  openLightbox: (images: string[], index: number) => void;
  closeLightbox: () => void;

  // Delete confirm modal
  deleteConfirm: { isOpen: boolean; onConfirm?: () => void; message?: string };
  openDeleteConfirm: (onConfirm: () => void, message?: string) => void;
  closeDeleteConfirm: () => void;
}

export const useUIStore = create<UIStore>()((set, get) => ({
  // Toast
  toasts: [],
  addToast: (type, message) => {
    const id = `toast-${++toastId}`;
    set({ toasts: [...get().toasts, { id, type, message }] });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  // Search
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, searchQuery: "" }),

  // Mobile nav
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Lightbox
  lightboxImages: [],
  lightboxIndex: 0,
  openLightbox: (images, index) =>
    set({ lightboxImages: images, lightboxIndex: index }),
  closeLightbox: () =>
    set({ lightboxImages: [], lightboxIndex: 0 }),

  // Delete confirm
  deleteConfirm: { isOpen: false },
  openDeleteConfirm: (onConfirm, message) =>
    set({ deleteConfirm: { isOpen: true, onConfirm, message } }),
  closeDeleteConfirm: () =>
    set({ deleteConfirm: { isOpen: false } }),
}));

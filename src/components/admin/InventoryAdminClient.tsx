"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useUIStore } from "@/store/uiStore";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import {
  createCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllAdminProducts,
  getCategories,
} from "@/lib/firestore";
import type { Category, Product, ProductImage, ProductSize } from "@/types";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  LayoutDashboard, 
  Package, 
  Tag, 
  Layers, 
  Eye, 
  EyeOff, 
  Star,
  ChevronRight,
  Filter
} from "lucide-react";

interface InventoryAdminClientProps {
  locale: string;
}

type FormSize = {
  label: string;
  price: number;
  salePrice?: number;
};

interface FormValues {
  id?: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  salePrice?: number;
  categories: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string;
  specs: string;
  sizes: FormSize[];
  images: FileList | null;
}

export default function InventoryAdminClient({ locale }: InventoryAdminClientProps) {
  const isAr = locale === "ar";
  const { addToast } = useUIStore();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Form State
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      price: 0,
      salePrice: undefined,
      categories: [],
      stock: 0,
      sku: "",
      isActive: true,
      isFeatured: false,
      tags: "",
      specs: "",
      sizes: [{ label: "", price: 0, salePrice: undefined }],
      images: null,
    },
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: "sizes",
  });

  const imageFiles = watch("images");
  const selectedCategoryIds = watch("categories");

  // Load Data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getAllAdminProducts(),
          getCategories(),
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error(error);
        addToast("error", isAr ? "خطأ في تحميل البيانات" : "Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [addToast, isAr]);

  // Handle Image Previews
  useEffect(() => {
    if (!imageFiles || imageFiles.length === 0) {
      setImagePreviews([]);
      return;
    }
    const urls = Array.from(imageFiles).map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || p.categories.includes(categoryFilter);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Open Modal for Add
  const openAddModal = () => {
    setEditingProduct(null);
    setExistingImages([]);
    setImagePreviews([]);
    reset({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      price: 0,
      salePrice: undefined,
      categories: [],
      stock: 0,
      sku: "",
      isActive: true,
      isFeatured: false,
      tags: "",
      specs: "",
      sizes: [{ label: "", price: 0, salePrice: undefined }],
      images: null,
    });
    setMainImageIndex(0);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setExistingImages(product.images || []);
    setImagePreviews([]);
    reset({
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      price: product.price,
      salePrice: product.salePrice,
      categories: product.categories,
      stock: product.stock,
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      tags: product.tags?.join(", ") || "",
      specs: product.specs || "",
      sizes: product.sizes?.length ? product.sizes : [{ label: "", price: 0, salePrice: undefined }],
      images: null,
    });
    setMainImageIndex(0);
    setIsModalOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, "-");
      await createCategory({
        slug,
        name_ar: newCategoryName.trim(),
        name_en: newCategoryName.trim(),
        parent: null,
        order: categories.length + 1,
        productCount: 0,
      });
      const updated = await getCategories();
      setCategories(updated);
      setNewCategoryName("");
      addToast("success", isAr ? "تم إضافة التصنيف" : "Category added");
    } catch (error) {
      addToast("error", isAr ? "فشل إضافة التصنيف" : "Failed to add category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      // 1. Upload new images if any
      let uploadedImages: ProductImage[] = [];
      if (data.images && data.images.length > 0) {
        const uploads = await uploadMultipleToCloudinary(Array.from(data.images), "roma-products");
        uploadedImages = uploads.map(u => ({
          url: u.url,
          publicId: u.publicId,
          alt: isAr ? data.name_ar : data.name_en
        }));
      }

      // 2. Combine with existing images (minus any deleted ones - if we add deletion logic)
      let finalImages = [...existingImages, ...uploadedImages];
      
      if (finalImages.length === 0) {
        addToast("error", isAr ? "يرجى رفع صورة واحدة على الأقل" : "Please upload at least one image");
        setSaving(false);
        return;
      }

      // Reorder finalImages to put the selected main image at index 0
      if (mainImageIndex > 0 && mainImageIndex < finalImages.length) {
        const mainImg = finalImages.splice(mainImageIndex, 1)[0];
        finalImages.unshift(mainImg);
      }

      // 3. Prepare payload
      // Automatically generate tags from selected category names for searchability
      const selectedCats = categories.filter(c => data.categories.includes(c.id));
      const tagsArray = selectedCats.flatMap(c => [c.name_ar, c.name_en]);
      const sizesPayload = data.sizes
        .filter(s => s.label.trim() && !isNaN(s.price))
        .map(s => ({
          label: s.label.trim(),
          price: Number(s.price),
          salePrice: s.salePrice ? Number(s.salePrice) : undefined
        }));

      const productPayload: any = {
        name_ar: data.name_ar,
        name_en: data.name_en,
        description_ar: data.description_ar,
        description_en: data.description_en,
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : undefined,
        categories: data.categories,
        images: finalImages,
        stock: Number(data.stock),
        sku: data.sku,
        specs: data.specs,
        sizes: sizesPayload.length ? sizesPayload : undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: tagsArray,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        addToast("success", isAr ? "تم تحديث المنتج بنجاح" : "Product updated successfully");
      } else {
        const slug = `${data.name_en.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
        await createProduct({
          ...productPayload,
          slug,
          rating: 0,
          reviewCount: 0,
        });
        addToast("success", isAr ? "تم إضافة المنتج بنجاح" : "Product added successfully");
      }

      setIsModalOpen(false);
      const updatedProducts = await getAllAdminProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error(error);
      addToast("error", isAr ? "حدث خطأ أثناء الحفظ" : "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      addToast("success", isAr ? "تم حذف المنتج" : "Product deleted");
    } catch (error) {
      addToast("error", isAr ? "فشل حذف المنتج" : "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy flex items-center gap-3">
            <Package className="h-8 w-8 text-gold" />
            {isAr ? "المخزن" : "Inventory"}
          </h1>
          <p className="text-text-muted mt-1">
            {isAr ? "متابعة المنتجات، الكميات والأسعار" : "Monitor products, quantities and prices"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={openAddModal}
            className="btn bg-gold text-navy border-none hover:bg-navy hover:text-white flex items-center gap-2 shadow-lg shadow-gold/20 font-black h-12 px-6 rounded-2xl transition-all"
          >
            <Plus className="h-5 w-5" />
            {isAr ? "إضافة منتج جديد" : "Add New Product"}
          </button>
          <Link 
            href={`/${locale}/admin`} 
            className="btn bg-white text-navy border-gray-200 hover:border-navy hover:bg-navy hover:text-white flex items-center gap-2 font-black h-12 px-6 rounded-2xl transition-all shadow-sm"
          >
            <div className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-white/20">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            {isAr ? "لوحة التحكم" : "Dashboard"}
          </Link>
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input 
              type="text" 
              placeholder={isAr ? "بحث بالاسم أو SKU..." : "Search by name or SKU..."}
              className="input pr-12 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gold" />
            <select 
              className="input py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{isAr ? "كل التصنيفات" : "All Categories"}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-6 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm px-8">
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase font-bold">{isAr ? "إجمالي المنتجات" : "Total Products"}</p>
            <p className="text-2xl font-black text-navy">{products.length}</p>
          </div>
          <div className="w-px bg-gray-100 h-10 self-center" />
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase font-bold">{isAr ? "في المخزن" : "In Stock"}</p>
            <p className="text-2xl font-black text-gold">{products.reduce((acc, p) => acc + p.stock, 0)}</p>
          </div>
        </div>
      </div>

      {/* Products Table/Grid */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-muted">{isAr ? "جاري تحميل المنتجات..." : "Loading products..."}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-navy">{isAr ? "لا توجد منتجات" : "No products found"}</p>
            <button onClick={openAddModal} className="text-gold font-bold mt-2 hover:underline">
              {isAr ? "أضف منتجك الأول الآن" : "Add your first product now"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-navy">
                  <th className="px-6 py-4">{isAr ? "المنتج" : "Product"}</th>
                  <th className="px-6 py-4">{isAr ? "SKU" : "SKU"}</th>
                  <th className="px-6 py-4">{isAr ? "السعر" : "Price"}</th>
                  <th className="px-6 py-4">{isAr ? "الكمية" : "Stock"}</th>
                  <th className="px-6 py-4">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                          <img 
                            src={product.images?.[0]?.url || "/images/logo.png"} 
                            alt={product.name_ar}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm line-clamp-1">{isAr ? product.name_ar : product.name_en}</p>
                          <p className="text-xs text-text-muted">{product.categories.map(cid => categories.find(c => c.id === cid)?.name_ar).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-text-muted">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${product.salePrice ? "text-xs text-text-muted line-through" : "text-navy"}`}>
                          {product.price} {isAr ? "ج.م" : "EGP"}
                        </span>
                        {product.salePrice && (
                          <span className="font-black text-gold text-sm">
                            {product.salePrice} {isAr ? "ج.م" : "EGP"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        product.stock > 10 ? "bg-green-100 text-green-700" : 
                        product.stock > 0 ? "bg-orange-100 text-orange-700" : 
                        "bg-red-100 text-red-700"
                      }`}>
                        {product.stock} {isAr ? "قطعة" : "pcs"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <span className={`inline-flex items-center gap-1 text-xs font-bold ${product.isActive ? "text-green-600" : "text-gray-400"}`}>
                          {product.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {product.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "مخفي" : "Hidden")}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">
                            <Star className="h-3 w-3 fill-gold" />
                            {isAr ? "مميز" : "Featured"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 hover:bg-gold/10 text-navy hover:text-gold rounded-lg transition-colors"
                          title={isAr ? "تعديل" : "Edit"}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gold/10 p-2 rounded-2xl">
                  <Package className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-navy">
                    {editingProduct ? (isAr ? "تعديل منتج" : "Edit Product") : (isAr ? "إضافة منتج جديد" : "Add New Product")}
                  </h2>
                  <p className="text-sm text-text-muted">
                    {isAr ? "املأ البيانات التالية لحفظ المنتج" : "Fill in the details to save the product"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "الاسم (عربي)" : "Name (AR)"}</label>
                      <input type="text" {...register("name_ar", { required: true })} className="input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "الاسم (EN)" : "Name (EN)"}</label>
                      <input type="text" {...register("name_en", { required: true })} className="input w-full" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "الوصف (عربي)" : "Description (AR)"}</label>
                      <textarea rows={3} {...register("description_ar", { required: true })} className="input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "الوصف (EN)" : "Description (EN)"}</label>
                      <textarea rows={3} {...register("description_en", { required: true })} className="input w-full" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "السعر الأساسي" : "Base Price"}</label>
                      <input type="number" step="0.01" {...register("price", { required: true, valueAsNumber: true })} className="input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "سعر التخفيض" : "Sale Price"}</label>
                      <input type="number" step="0.01" {...register("salePrice", { valueAsNumber: true })} className="input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-navy">{isAr ? "الكمية" : "Stock Quantity"}</label>
                      <input type="number" {...register("stock", { required: true, valueAsNumber: true })} className="input w-full" />
                    </div>
                  </div>

                  {/* Sizes & Multi-pricing */}
                  <div className="bg-gray-50 rounded-[30px] p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-navy">{isAr ? "مقاسات وأسعار متعددة" : "Sizes & Multi-pricing"}</h3>
                        <p className="text-xs text-text-muted">{isAr ? "اختياري: إذا كان للمنتج أحجام مختلفة بأسعار مختلفة" : "Optional: If the product has different sizes with different prices"}</p>
                      </div>
                      <button type="button" onClick={() => appendSize({ label: "", price: 0 })} className="btn btn-sm btn-outline">
                        <Plus className="h-4 w-4" /> {isAr ? "أضف مقاس" : "Add Size"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {sizeFields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] items-end bg-white p-3 rounded-2xl border border-gray-100">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-text-muted">{isAr ? "المقاس" : "Size"}</label>
                            <input type="text" {...register(`sizes.${index}.label` as const, { required: true })} className="input py-2 text-sm w-full" placeholder="e.g. XL, 150cm..." />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-text-muted">{isAr ? "السعر" : "Price"}</label>
                            <input type="number" step="0.01" {...register(`sizes.${index}.price` as const, { required: true, valueAsNumber: true })} className="input py-2 text-sm w-full" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-text-muted">{isAr ? "تخفيض" : "Sale"}</label>
                            <input type="number" step="0.01" {...register(`sizes.${index}.salePrice` as const, { valueAsNumber: true })} className="input py-2 text-sm w-full" />
                          </div>
                          <button type="button" onClick={() => removeSize(index)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-navy">{isAr ? "المواصفات الفنية" : "Technical Specs"}</label>
                    <textarea rows={4} {...register("specs")} className="input w-full" placeholder={isAr ? "اكتب المواصفات الفنية هنا..." : "Write tech specs here..."} />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status & Options */}
                  <div className="bg-gray-50 rounded-[30px] p-6 border border-gray-100 space-y-4">
                    <h3 className="font-black text-navy flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gold" />
                      {isAr ? "الحالة والظهور" : "Status & Visibility"}
                    </h3>
                    
                    {/* Active Switch */}
                    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      watch("isActive") 
                        ? "bg-green-50 border-green-200" 
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${watch("isActive") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                          {watch("isActive") ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </div>
                        <span className={`text-sm font-black ${watch("isActive") ? "text-green-700" : "text-gray-500"}`}>
                          {isAr ? "نشط في المتجر" : "Active in Shop"}
                        </span>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${watch("isActive") ? "bg-green-500" : "bg-gray-200"}`}>
                        <div className={`absolute top-1 transition-all w-4 h-4 bg-white rounded-full ${isAr ? (watch("isActive") ? "right-7" : "right-1") : (watch("isActive") ? "left-7" : "left-1")}`} />
                      </div>
                      <input type="checkbox" {...register("isActive")} className="hidden" />
                    </label>

                    {/* Featured Switch */}
                    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      watch("isFeatured") 
                        ? "bg-gold/10 border-gold/30" 
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${watch("isFeatured") ? "bg-gold text-navy" : "bg-gray-100 text-gray-400"}`}>
                          <Star className={`h-4 w-4 ${watch("isFeatured") ? "fill-current" : ""}`} />
                        </div>
                        <span className={`text-sm font-black ${watch("isFeatured") ? "text-gold-dark" : "text-gray-500"}`}>
                          {isAr ? "منتج مميز (رئيسية)" : "Featured Product"}
                        </span>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${watch("isFeatured") ? "bg-gold" : "bg-gray-200"}`}>
                        <div className={`absolute top-1 transition-all w-4 h-4 bg-white rounded-full ${isAr ? (watch("isFeatured") ? "right-7" : "right-1") : (watch("isFeatured") ? "left-7" : "left-1")}`} />
                      </div>
                      <input type="checkbox" {...register("isFeatured")} className="hidden" />
                    </label>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-bold text-navy flex items-center gap-2">
                        <Tag className="h-3 w-3 text-gold" />
                        {isAr ? "كود المنتج (SKU)" : "Product SKU"}
                      </label>
                      <input 
                        type="text" 
                        {...register("sku", { required: true })} 
                        className="input w-full py-2 font-mono uppercase bg-white border-gray-100 focus:border-gold" 
                        placeholder="ROMA-001..."
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="bg-gray-50 rounded-[30px] p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-navy">{isAr ? "التصنيفات" : "Categories"}</h3>
                      <Layers className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const selected = selectedCategoryIds?.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const current = selectedCategoryIds ?? [];
                              if (selected) setValue("categories", current.filter((id) => id !== cat.id));
                              else setValue("categories", [...current, cat.id]);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              selected ? "bg-gold text-navy border-gold" : "bg-white border-gray-200 text-text-muted hover:border-gold"
                            }`}
                          >
                            {isAr ? cat.name_ar : cat.name_en}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={isAr ? "إضافة تصنيف جديد..." : "New category name..."}
                        className="input flex-1 py-2 text-sm bg-white border-gray-100"
                      />
                      <button 
                        type="button" 
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                        className="bg-navy text-white px-4 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-50"
                        title={isAr ? "إضافة" : "Add"}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="bg-gray-50 rounded-[30px] p-6 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-navy">{isAr ? "صور المنتج" : "Images"}</h3>
                      <ImageIcon className="h-4 w-4 text-gold" />
                    </div>
                    
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((img, i) => (
                          <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${mainImageIndex === i ? 'border-gold shadow-md' : 'border-gray-200'}`}>
                            <img src={img.url} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                            <button
                              type="button"
                              onClick={() => setMainImageIndex(i)}
                              className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-navy hover:bg-white transition-colors"
                            >
                              <div className={`w-3 h-3 rounded-full border ${mainImageIndex === i ? 'bg-gold border-gold' : 'border-gray-400'}`} />
                              {isAr ? "الرئيسية" : "Main"}
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setExistingImages(existingImages.filter((_, idx) => idx !== i));
                                if (mainImageIndex === i) setMainImageIndex(0);
                                else if (mainImageIndex > i) setMainImageIndex(mainImageIndex - 1);
                              }}
                              className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Preview */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, i) => {
                          const absIndex = existingImages.length + i;
                          return (
                          <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${mainImageIndex === absIndex ? 'border-gold shadow-md' : 'border-gold/30'}`}>
                            <img src={src} className="h-full w-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                            <button
                              type="button"
                              onClick={() => setMainImageIndex(absIndex)}
                              className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-navy hover:bg-white transition-colors"
                            >
                              <div className={`w-3 h-3 rounded-full border ${mainImageIndex === absIndex ? 'bg-gold border-gold' : 'border-gray-400'}`} />
                              {isAr ? "الرئيسية" : "Main"}
                            </button>
                          </div>
                        )})}
                      </div>
                    )}

                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-200 rounded-3xl hover:bg-gold/5 hover:border-gold transition-all cursor-pointer bg-white group">
                      <div className="bg-gray-50 p-3 rounded-full group-hover:bg-gold/10 transition-colors">
                        <Plus className="h-6 w-6 text-text-muted group-hover:text-gold" />
                      </div>
                      <span className="text-xs font-black text-text-muted mt-2 group-hover:text-gold uppercase tracking-wider">
                        {isAr ? "إضافة صور للمنتج" : "Add Product Images"}
                      </span>
                      <input type="file" {...register("images")} multiple accept="image/*" className="hidden" />
                    </label>
                  </div>

                </div>
              </div>

              {/* Form Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn btn-primary min-w-[150px]"
                >
                  {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ المنتج" : "Save Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

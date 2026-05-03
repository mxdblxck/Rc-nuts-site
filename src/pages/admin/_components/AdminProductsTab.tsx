import { useState, useMemo } from "react";
import { Search, Plus, Grid3X3, List, Edit, Trash2, CheckCircle, XCircle, Image as ImageIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import AdminProductForm from "./AdminProductForm.tsx";

type Props = {
  products: Doc<"products">[] | undefined;
};

export default function AdminProductsTab({ products }: Props) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showInStockFilter, setShowInStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Doc<"products"> | null>(null);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (search && !(p.nameAr || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (showInStockFilter === "inStock" && !p.inStock) return false;
      if (showInStockFilter === "outOfStock" && p.inStock) return false;
      return true;
    });
  }, [products, search, showInStockFilter]);

  const handleToggleStock = async (product: Doc<"products">) => {
    await updateProduct({
      id: product._id,
      inStock: !product.inStock,
      stockQuantity: !product.inStock ? (product.stockQuantity ?? 10) : 0,
    });
    toast.success(!product.inStock ? "تم تفعيل المنتج" : "تم تحديد المنتج كـنـفذت الكمية");
  };

  // iOS-style toggle button
  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled 
          ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30" 
          : "bg-red-400 border-red-300 shadow-lg shadow-red-500/30"
      }`}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
      {/* Status indicator */}
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 transition-opacity duration-200 ${enabled ? "opacity-0" : "opacity-100"}`}>
        ✕
      </span>
    </button>
  );

  const handleEdit = (product: Doc<"products">) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = async (product: Doc<"products">) => {
    if (confirm(`هل أنت متأكد من حذف "${product.nameAr}"؟`)) {
      await deleteProduct({ id: product._id });
      toast.success("تم حذف المنتج");
    }
  };

  const handleClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (products === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 w-24" /></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} منتج</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="البحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-background"
          />
        </div>
        <select
          value={showInStockFilter}
          onChange={(e) => setShowInStockFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-border bg-background"
        >
          <option value="all">الكل</option>
          <option value="inStock">المتوفرة</option>
          <option value="outOfStock">المنتهية</option>
        </select>
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      {filteredProducts.length !== products.length && (
        <p className="text-sm text-muted-foreground">{filteredProducts.length} / {products.length}</p>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div key={p._id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group">
              <div className="aspect-square relative bg-muted/30">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {!p.inStock && <div className="absolute top-2 left-2 bg-destructive text-white text-xs px-2 py-1 rounded-full font-bold">غير متوفر</div>}
                {p.featured && <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">مميز</div>}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">{p.nameAr}</h3>
                <p className="text-sm text-muted-foreground mb-2">{p.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black text-primary">{p.price?.toLocaleString("ar-DZ")} دج</span>
                  <span className={`text-xs ${p.inStock ? "text-green-600" : "text-destructive"}`}>
                    {p.inStock ? `(${p.stockQuantity || 0})` : "غير متوفر"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <ToggleSwitch enabled={p.inStock} onChange={() => handleToggleStock(p)} />
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-muted"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p)} className="p-2 rounded-lg bg-muted hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div key={p._id} className={`bg-card rounded-2xl border border-border p-4 flex items-center gap-4 ${!p.inStock ? "border-destructive/30 bg-destructive/5" : ""}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/30 shrink-0">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.nameAr} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground truncate">{p.nameAr}</h3>
                  {!p.inStock && <Badge variant="destructive" className="text-[10px]">غير متوفر</Badge>}
                  {p.featured && <Badge className="text-[10px] bg-primary/10 text-primary">مميز</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{p.category}</p>
              </div>
              <div className="text-left shrink-0">
                <p className="font-black text-lg text-primary">{p.price?.toLocaleString("ar-DZ")} دج</p>
                <p className={`text-sm ${p.inStock ? "text-green-600" : "text-destructive"}`}>{p.inStock ? `${p.stockQuantity || 0} في المخزن` : "غير متوفر"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <ToggleSwitch enabled={p.inStock} onChange={() => handleToggleStock(p)} />
                <button onClick={() => handleEdit(p)} className="p-2 rounded-xl bg-muted"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p)} className="p-2 rounded-xl bg-muted hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <AdminProductForm onClose={handleClose} editProduct={editingProduct} />
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Gift, X,
  UploadCloud, Link as LinkIcon, Check, Minus, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

const PLACEHOLDER = "/logo.png";

// One line in the pack: a product + how many + optional weight override
type PackItem = {
  productId: Id<"products">;
  quantity: number;
  customWeight: string; // empty = use product's default weight
};

type PackFormData = {
  nameAr: string;
  descriptionAr: string;
  price: string;
  originalPrice: string;
  packItems: PackItem[];
  imageUrl: string;
  active: boolean;
  slug: string;
};

const emptyForm = (): PackFormData => ({
  nameAr: "",
  descriptionAr: "",
  price: "",
  originalPrice: "",
  packItems: [],
  imageUrl: "",
  active: true,
  slug: "",
});

export default function AdminPacksTab() {
  const packs = useQuery(api.packs.listAllPacks, {});
  const products = useQuery(api.products.listProducts, {});
  const createPack = useMutation(api.packs.createPack);
  const updatePack = useMutation(api.packs.updatePack);
  const deletePack = useMutation(api.packs.deletePack);
  const toggleActive = useMutation(api.packs.togglePackActive);
  const generateUploadUrl = useMutation(api.packs.generateUploadUrl);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"packs"> | null>(null);
  const [form, setForm] = useState<PackFormData>(emptyForm());
  const [imageType, setImageType] = useState<"url" | "upload">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setImageType("url");
    setSelectedFile(null);
    setPreviewUrl(null);
    setProductSearch("");
    setShowForm(true);
  };

  const openEdit = (pack: any) => {
    setEditingId(pack._id);
    // Reconstruct packItems from stored data
    const packItems: PackItem[] = pack.packItems && pack.packItems.length > 0
      ? pack.packItems.map((i: any) => ({
          productId: i.productId,
          quantity: i.quantity,
          customWeight: i.customWeight ?? "",
        }))
      : (pack.productIds ?? []).map((pid: any) => ({
          productId: pid,
          quantity: 1,
          customWeight: "",
        }));

    setForm({
      nameAr: pack.nameAr,
      descriptionAr: pack.descriptionAr,
      price: String(pack.price),
      originalPrice: pack.originalPrice ? String(pack.originalPrice) : "",
      packItems,
      imageUrl: pack.imageUrl ?? "",
      active: pack.active,
      slug: pack.slug,
    });
    setImageType(pack.imageStorageId ? "upload" : "url");
    setSelectedFile(null);
    setPreviewUrl(pack.imageUrl ?? null);
    setProductSearch("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Add product to pack items list (or increment qty if already there)
  const addProduct = (id: Id<"products">) => {
    setForm((prev) => {
      const existing = prev.packItems.find((i) => i.productId === id);
      if (existing) {
        // increment quantity
        return {
          ...prev,
          packItems: prev.packItems.map((i) =>
            i.productId === id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...prev,
        packItems: [...prev.packItems, { productId: id, quantity: 1, customWeight: "" }],
      };
    });
  };

  const removeItem = (id: Id<"products">) => {
    setForm((prev) => ({
      ...prev,
      packItems: prev.packItems.filter((i) => i.productId !== id),
    }));
  };

  const updateItemQty = (id: Id<"products">, qty: number) => {
    if (qty < 1) { removeItem(id); return; }
    setForm((prev) => ({
      ...prev,
      packItems: prev.packItems.map((i) =>
        i.productId === id ? { ...i, quantity: qty } : i
      ),
    }));
  };

  const updateItemWeight = (id: Id<"products">, weight: string) => {
    setForm((prev) => ({
      ...prev,
      packItems: prev.packItems.map((i) =>
        i.productId === id ? { ...i, customWeight: weight } : i
      ),
    }));
  };

  const handleSave = async () => {
    if (!form.nameAr.trim()) { toast.error("اسم الباقة مطلوب"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("السعر مطلوب"); return; }
    if (form.packItems.length === 0) { toast.error("أضف منتجاً واحداً على الأقل"); return; }
    if (!form.slug.trim()) { toast.error("المعرف (slug) مطلوب"); return; }

    setIsSaving(true);
    try {
      let finalStorageId: Id<"_storage"> | undefined;
      if (imageType === "upload" && selectedFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await res.json();
        finalStorageId = storageId;
      }

      const packItems = form.packItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        customWeight: i.customWeight.trim() || undefined,
      }));

      const payload = {
        nameAr: form.nameAr.trim(),
        descriptionAr: form.descriptionAr.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        packItems,
        imageUrl: imageType === "url" ? (form.imageUrl.trim() || undefined) : undefined,
        imageStorageId: finalStorageId,
        active: form.active,
        slug: form.slug.trim(),
      };

      if (editingId) {
        await updatePack({ id: editingId, ...payload });
        toast.success("تم تحديث الباقة");
      } else {
        await createPack(payload);
        toast.success("تم إنشاء الباقة");
      }
      closeForm();
    } catch (e: any) {
      toast.error(e?.message ?? "حدث خطأ");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = (products ?? []).filter(
    (p) => p.nameAr.includes(productSearch) || p.category.includes(productSearch)
  );

  // Map productId → product for quick lookup
  const productMap = new Map((products ?? []).map((p) => [p._id, p]));

  if (packs === undefined || products === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">إدارة الباقات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            الباقات النشطة تظهر في صفحة الباقات مع توصيل مجاني تلقائي
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          إنشاء باقة
        </Button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {editingId ? "تعديل الباقة" : "إنشاء باقة جديدة"}
            </h2>
            <button onClick={closeForm} className="p-1.5 hover:bg-muted rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>اسم الباقة *</Label>
              <Input
                placeholder="باقة المكسرات الفاخرة"
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label>المعرف (URL slug) *</Label>
              <Input
                placeholder="premium-nuts-pack"
                dir="ltr"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label>الوصف *</Label>
              <Textarea
                placeholder="وصف الباقة..."
                rows={3}
                value={form.descriptionAr}
                onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>سعر الباقة (دج) *</Label>
              <Input
                type="number"
                placeholder="3500"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>

            {/* Original price */}
            <div className="space-y-2">
              <Label>السعر الأصلي (دج) — اختياري</Label>
              <Input
                type="number"
                placeholder="4500"
                value={form.originalPrice}
                onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
              />
            </div>

            {/* Image */}
            <div className="space-y-3 sm:col-span-2 border border-border p-4 rounded-xl">
              <Label className="flex justify-between items-center">
                صورة الباقة
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageType("url")}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${imageType === "url" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <LinkIcon className="w-3 h-3" /> رابط
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageType("upload")}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${imageType === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <UploadCloud className="w-3 h-3" /> رفع
                  </button>
                </div>
              </Label>
              {imageType === "url" ? (
                <Input
                  placeholder="https://..."
                  dir="ltr"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, imageUrl: e.target.value }));
                    setPreviewUrl(e.target.value || null);
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setSelectedFile(file);
                      setPreviewUrl(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 ml-1" />
                    اختر صورة
                  </Button>
                  {selectedFile && <p className="text-xs text-muted-foreground">{selectedFile.name}</p>}
                </div>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="معاينة"
                  className="w-32 h-24 object-cover rounded-xl border border-border mt-2"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                />
              )}
            </div>

            {/* ── PRODUCT ITEMS SECTION ── */}
            <div className="space-y-4 sm:col-span-2 border border-border p-4 rounded-xl">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                محتويات الباقة *
                <span className="text-xs text-muted-foreground font-normal">
                  ({form.packItems.reduce((s, i) => s + i.quantity, 0)} قطعة إجمالاً)
                </span>
              </Label>

              {/* Selected items list */}
              {form.packItems.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.packItems.map((item) => {
                    const p = productMap.get(item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <img
                          src={p.imageUrl ?? PLACEHOLDER}
                          alt={p.nameAr}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{p.nameAr}</div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                        </div>

                        {/* Quantity control */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.productId, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQty(item.productId, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Custom weight override */}
                        <Input
                          className="w-24 h-7 text-xs shrink-0"
                          placeholder={p.weight ?? "الوزن"}
                          value={item.customWeight}
                          onChange={(e) => updateItemWeight(item.productId, e.target.value)}
                          title="تخصيص الوزن (اتركه فارغاً لاستخدام وزن المنتج الافتراضي)"
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Product search + add */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">ابحث عن منتج وانقر عليه لإضافته:</p>
                <Input
                  placeholder="ابحث عن منتج..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredProducts.map((p) => {
                    const alreadyIn = form.packItems.some((i) => i.productId === p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => addProduct(p._id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-right ${
                          alreadyIn
                            ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                        }`}
                      >
                        <img
                          src={p.imageUrl ?? PLACEHOLDER}
                          alt={p.nameAr}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                        <div className="flex-1 min-w-0 text-right">
                          <div className="font-medium text-sm text-foreground truncate">{p.nameAr}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.category} • {p.weight ?? ""} • {p.price.toLocaleString("ar-DZ")} دج
                          </div>
                        </div>
                        <div className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                          alreadyIn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {alreadyIn ? "+ إضافة مرة أخرى" : "+ إضافة"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">نشر الباقة (تظهر للزوار)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeForm}>إلغاء</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إنشاء الباقة"}
            </Button>
          </div>
        </div>
      )}

      {/* ── PACKS LIST ── */}
      {packs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
          <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد باقات بعد</p>
          <p className="text-sm mt-1">أنشئ باقتك الأولى لتظهر في الموقع</p>
        </div>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => {
            const discount =
              pack.originalPrice && pack.originalPrice > pack.price
                ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                : 0;
            const totalQty = (pack.packItems ?? []).reduce((s: number, i: any) => s + i.quantity, 0)
              || (pack.products ?? []).length;
            return (
              <div
                key={pack._id}
                className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${
                  pack.active ? "border-border" : "border-border/50 opacity-60"
                }`}
              >
                <img
                  src={pack.imageUrl ?? PLACEHOLDER}
                  alt={pack.nameAr}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">{pack.nameAr}</span>
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      <Gift className="w-2.5 h-2.5 ml-1" />
                      باقة
                    </Badge>
                    {!pack.active && <Badge variant="secondary" className="text-[10px]">مخفية</Badge>}
                    {discount > 0 && <Badge variant="destructive" className="text-[10px]">-{discount}%</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {pack.price.toLocaleString("ar-DZ")} دج
                    {pack.originalPrice && (
                      <span className="line-through mr-2 text-xs">{pack.originalPrice.toLocaleString("ar-DZ")} دج</span>
                    )}
                    {" • "}
                    {(pack.products ?? []).length} منتجات ({totalQty} قطعة)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      await toggleActive({ id: pack._id, active: !pack.active });
                      toast.success(pack.active ? "تم إخفاء الباقة" : "تم نشر الباقة");
                    }}
                    className="cursor-pointer"
                    title={pack.active ? "إخفاء" : "نشر"}
                  >
                    {pack.active
                      ? <ToggleRight className="w-7 h-7 text-primary" />
                      : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => openEdit(pack)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`حذف باقة "${pack.nameAr}"؟`)) {
                        await deletePack({ id: pack._id });
                        toast.success("تم حذف الباقة");
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

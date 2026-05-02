import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { UploadCloud, Link as LinkIcon, X, Plus, Trash, Images, Package, Wallet, Save } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useEffect, useRef, useState } from "react";

const schema = z.object({
  nameAr: z.string().min(2, "الاسم مطلوب"),
  descriptionAr: z.string().min(10, "الوصف مطلوب"),
  category: z.string().min(1, "الفئة مطلوبة"),
  price: z.coerce.number().positive("السعر يجب أن يكون موجباً"),
  originalPrice: z.coerce.number().optional(),
  imageUrl: z.string().optional(),
  baseWeightValue: z.string().optional(),
  baseWeightUnit: z.string(),
  stockQuantity: z.coerce.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
  inStock: z.boolean(),
  featured: z.boolean(),
  slug: z.string().min(2, "المعرف مطلوب"),
  tasteOptions: z.array(z.string()).optional(),
  packagingOptions: z.array(
    z.object({
      weightValue: z.string().min(1, "القيمة مطلوبة"),
      weightUnit: z.string(),
      price: z.coerce.number().positive("السعر يجب أن يكون موجباً"),
      originalPrice: z.coerce.number().optional(),
    })
  ).optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  onClose: () => void;
  editProduct?: Doc<"products"> | null;
};

export default function AdminProductForm({ onClose, editProduct }: Props) {
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [imageType, setImageType] = useState<"url" | "upload">(editProduct?.imageStorageId ? "upload" : "url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gallery state: each entry is either a URL string or a file to upload
  type GalleryEntry =
    | { type: "url"; url: string }
    | { type: "file"; file: File; previewUrl: string };

  const [galleryEntries, setGalleryEntries] = useState<GalleryEntry[]>([]);
  // Existing gallery storage IDs (from edit mode) — user can remove them
  const [existingGalleryIds, setExistingGalleryIds] = useState<Id<"_storage">[]>(
    editProduct?.galleryStorageIds ?? []
  );
  // Existing external URL gallery entries (from edit mode)
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>(
    // Only keep URLs that are NOT the main imageUrl (avoid duplicates)
    (editProduct?.images ?? []).filter(
      (u) => u !== editProduct?.imageUrl
    )
  );
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryInputType, setGalleryInputType] = useState<"url" | "upload">("upload");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      inStock: true,
      featured: false,
      stockQuantity: 0,
      tasteOptions: [],
      packagingOptions: [],
      baseWeightUnit: "غ",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "packagingOptions",
  });

  const stockQty = watch("stockQuantity");

  // Populate form when editing
  useEffect(() => {
    if (editProduct) {
      setExistingGalleryIds(editProduct.galleryStorageIds ?? []);
      setExistingGalleryUrls(
        (editProduct.images ?? []).filter((u) => u !== editProduct.imageUrl)
      );
      setGalleryEntries([]);
      reset({
        nameAr: editProduct.nameAr,
        descriptionAr: editProduct.descriptionAr,
        category: editProduct.category,
        price: editProduct.price,
        originalPrice: editProduct.originalPrice,
        imageUrl: editProduct.imageUrl,
        baseWeightValue: (() => {
          let v = editProduct.weight ?? "";
          return v.replace(/غرام|كغ|غ|kg|g/g, "").trim();
        })(),
        baseWeightUnit: (editProduct.weight ?? "").includes("كغ") ? "كغ" : "غ",
        stockQuantity: editProduct.stockQuantity ?? 0,
        inStock: editProduct.inStock,
        featured: editProduct.featured ?? false,
        slug: editProduct.slug,
        tasteOptions: editProduct.tasteOptions ?? [],
        packagingOptions: editProduct.packagingOptions?.map((p) => {
          const match = p.name.match(/^(.+?)(غ|كغ)$/);
          return {
            weightValue: match ? match[1] : p.name,
            weightUnit: match ? match[2] : "غ",
            price: p.price,
            originalPrice: p.originalPrice,
          };
        }) ?? [],
      });
    }
  }, [editProduct, reset]);

  // Auto-set inStock based on quantity
  useEffect(() => {
    if (stockQty !== undefined) {
      setValue("inStock", stockQty > 0);
    }
  }, [stockQty, setValue]);

  const onSubmit = async (data: FormData) => {
    if (imageType === "url" && !data.imageUrl) {
      toast.error("يرجى إدخال رابط الصورة");
      return;
    }
    if (imageType === "upload" && !selectedFile && !editProduct?.imageStorageId) {
      toast.error("يرجى اختيار صورة لرفعها");
      return;
    }

    setIsUploading(true);
    try {
      let finalStorageId = editProduct?.imageStorageId;
      
      if (imageType === "upload" && selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        const { storageId } = await result.json();
        finalStorageId = storageId;
      }

      // Upload gallery files and collect new storage IDs + URL entries
      const newGalleryIds: Id<"_storage">[] = [];
      const newGalleryUrls: string[] = [];
      for (const entry of galleryEntries) {
        if (entry.type === "file") {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": entry.file.type },
            body: entry.file,
          });
          const { storageId } = await result.json();
          newGalleryIds.push(storageId as Id<"_storage">);
        } else {
          newGalleryUrls.push(entry.url);
        }
      }

      // Merge: existing kept IDs + newly uploaded IDs
      const finalGalleryIds: Id<"_storage">[] = [
        ...existingGalleryIds,
        ...newGalleryIds,
      ];
      // Merge: existing kept URL entries + new URL entries
      const finalGalleryUrls: string[] = [
        ...existingGalleryUrls,
        ...newGalleryUrls,
      ];

      const { baseWeightValue, baseWeightUnit, ...restData } = data;
      const payload = {
        ...restData,
        weight: baseWeightValue ? `${baseWeightValue}${baseWeightUnit}` : undefined,
        originalPrice: restData.originalPrice === 0 ? undefined : restData.originalPrice,
        imageStorageId: imageType === "upload" ? finalStorageId : undefined,
        imageUrl: imageType === "url" ? restData.imageUrl : undefined,
        galleryStorageIds: finalGalleryIds,
        images: finalGalleryUrls,
        packagingOptions: restData.packagingOptions?.map((p) => ({
          name: `${p.weightValue}${p.weightUnit}`,
          price: p.price,
          originalPrice: p.originalPrice === 0 ? undefined : p.originalPrice,
        })),
      };

      if (editProduct) {
        await updateProduct({ id: editProduct._id, ...payload });
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createProduct(payload);
        toast.success("تم إضافة المنتج بنجاح");
      }
      onClose();
    } catch {
      toast.error("حدث خطأ. حاول مجدداً.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-2xl text-primary-foreground">
              {editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h3>
            <p className="text-sm text-primary-foreground/70">
              {editProduct ? "حدث بيانات المنتج" : "أضف منتج جديد للمتجر"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer">
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Image Preview */}
      {watch("imageUrl") && (
        <div className="p-4 bg-muted/30 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">معاينة الصورة:</p>
          <div className="w-32 h-32 rounded-xl overflow-hidden border border-border">
            <img src={watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Section: Basic Info */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Package className="w-4 h-4 text-primary" />
            المعلومات الأساسية
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">اسم المنتج (عربي) *</Label>
              <Input placeholder="بذور اليقطين" {...register("nameAr")} className="h-12" />
              {errors.nameAr && <p className="text-destructive text-xs">{errors.nameAr.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الفئة *</Label>
              <select className="w-full border border-border rounded-xl p-3 bg-background h-12" {...register("category")}>
                <option value="">-- اختر الفئة --</option>
                {["مكسرات", "بذور", "خلطات", "مجففات"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="font-medium">الوصف *</Label>
              <Textarea placeholder="وصف المنتج..." rows={3} {...register("descriptionAr")} className="rounded-xl" />
              {errors.descriptionAr && <p className="text-destructive text-xs">{errors.descriptionAr.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-medium">معرف URL *</Label>
              <Input placeholder="product-name" dir="ltr" {...register("slug")} className="h-12" />
              {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
            </div>
          </div>
        </div>

        {/* Section: Pricing */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Wallet className="w-4 h-4 text-primary" />
            التسعير
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">السعر (دج) *</Label>
              <Input type="number" placeholder="1000" {...register("price")} className="h-12 text-lg" />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="font-medium">السعر القديم (دج) (اختياري)</Label>
              <Input type="number" placeholder="يترك فارغاً إذا لا يوجد تخفيض" {...register("originalPrice")} className="h-12" />
            </div>
          </div>
        </div>

        {/* Section: Image */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Images className="w-4 h-4 text-primary" />
            صورة المنتج
          </h4>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setImageType("url")} className={`px-4 py-2 rounded-xl font-medium transition-colors ${imageType === "url" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              رابط
            </button>
            <button type="button" onClick={() => setImageType("upload")} className={`px-4 py-2 rounded-xl font-medium transition-colors ${imageType === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              رفع صورة
            </button>
          </div>
          {imageType === "url" ? (
            <Input placeholder="https://..." dir="ltr" {...register("imageUrl")} className="h-12" />
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="cursor-pointer" />
              {editProduct?.imageStorageId && !selectedFile && <p className="text-xs text-muted-foreground mt-2">توجد صورة مرفوعة مسبقاً</p>}
            </div>
          )}
        </div>

        {/* Section: Stock */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <Package className="w-4 h-4 text-primary" />
            المخزن والوزن
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">الوزن الأساسي</Label>
              <div className="flex gap-2">
                <Input placeholder="250" {...register("baseWeightValue")} className="h-12 flex-1" />
                <select {...register("baseWeightUnit")} className="border border-border rounded-xl bg-background px-3 h-12">
                  <option value="غ">غ</option>
                  <option value="كغ">كغ</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">الكمية المتاحة *</Label>
              <Input type="number" min={0} placeholder="0" {...register("stockQuantity")} className="h-12" />
            </div>
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("inStock")} className="w-5 h-5 rounded" />
              <span className="text-sm font-medium">متوفر في المخزن</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("featured")} className="w-5 h-5 rounded" />
              <span className="text-sm font-medium">منتج مميز</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1 h-12 rounded-xl gap-2">
            {isSubmitting || isUploading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {editProduct ? "حفظ التغييرات" : "إضافة المنتج"}
          </Button>
        </div>
      </form>
    </div>
  );
}

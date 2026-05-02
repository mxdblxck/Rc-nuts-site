import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { UploadCloud, Link as LinkIcon, X, Plus, Trash } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useEffect, useState } from "react";

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

      const { baseWeightValue, baseWeightUnit, ...restData } = data;
      const payload = {
        ...restData,
        weight: baseWeightValue ? `${baseWeightValue}${baseWeightUnit}` : undefined,
        originalPrice: restData.originalPrice === 0 ? undefined : restData.originalPrice,
        imageStorageId: imageType === "upload" ? finalStorageId : undefined,
        imageUrl: imageType === "url" ? restData.imageUrl : undefined,
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
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">
          {editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h3>
        <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اسم المنتج (عربي) *</Label>
          <Input placeholder="بذور اليقطين" {...register("nameAr")} />
          {errors.nameAr && <p className="text-destructive text-xs">{errors.nameAr.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>الفئة *</Label>
          <select
            className="w-full border border-border rounded-lg p-2 bg-background text-sm"
            {...register("category")}
          >
            <option value="">-- اختر الفئة --</option>
            {["مكسرات", "بذور", "خلطات", "مجففات"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>الوصف *</Label>
          <Textarea placeholder="وصف المنتج..." rows={3} {...register("descriptionAr")} />
          {errors.descriptionAr && <p className="text-destructive text-xs">{errors.descriptionAr.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>السعر المخفض (دج) *</Label>
          <Input type="number" placeholder="1000" {...register("price")} />
          {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>السعر الأصلي (دج) (اختياري)</Label>
          <Input type="number" placeholder="يترك فارغاً إذا لا يوجد تخفيض" {...register("originalPrice")} />
          {errors.originalPrice && <p className="text-destructive text-xs">{errors.originalPrice.message}</p>}
        </div>

        <div className="space-y-3 sm:col-span-2 border border-border p-4 rounded-xl">
          <Label className="flex justify-between items-center">
            صورة المنتج *
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
            <Input placeholder="https://..." dir="ltr" {...register("imageUrl")} />
          ) : (
            <div className="space-y-2">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {editProduct?.imageStorageId && !selectedFile && (
                <p className="text-xs text-muted-foreground">توجد صورة مرفوعة مسبقاً، ارفع صورة جديدة لتغييرها.</p>
              )}
            </div>
          )}
          {errors.imageUrl && imageType === "url" && <p className="text-destructive text-xs">{errors.imageUrl.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>الوزن الأساسي</Label>
          <div className="flex gap-2">
            <Input placeholder="مثال: 250" {...register("baseWeightValue")} className="flex-1" />
            <select {...register("baseWeightUnit")} className="border border-border rounded-lg bg-background text-sm px-2 w-20">
              <option value="غ">غ</option>
              <option value="كغ">كغ</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>الكمية المتاحة *</Label>
          <Input type="number" min={0} placeholder="0" {...register("stockQuantity")} />
          {errors.stockQuantity && <p className="text-destructive text-xs">{errors.stockQuantity.message}</p>}
          <p className="text-xs text-muted-foreground">
            الكمية 0 = نفذت الكمية تلقائياً
          </p>
        </div>

        <div className="space-y-2">
          <Label>معرف URL *</Label>
          <Input placeholder="product-name" dir="ltr" {...register("slug")} />
          {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
        </div>

        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("inStock")} className="w-4 h-4" />
            <span className="text-sm font-medium">متوفر في المخزن</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("featured")} className="w-4 h-4" />
            <span className="text-sm font-medium">منتج مميز (يظهر في الرئيسية)</span>
          </label>
        </div>

        {/* Variations Section */}
        <div className="sm:col-span-2 border-t border-border pt-4 mt-2">
          <h4 className="font-bold mb-4">خيارات المنتج (اختياري)</h4>

          <div className="mb-6 space-y-3">
            <Label>خيارات الذوق (اختر ما ينطبق)</Label>
            <div className="flex flex-wrap gap-4">
              {["محمص مملح", "محمص غير مملح", "طبيعي"].map((taste) => (
                <label key={taste} className="flex items-center gap-2 cursor-pointer bg-muted/30 px-3 py-2 rounded-lg border border-border">
                  <input type="checkbox" value={taste} {...register("tasteOptions")} className="w-4 h-4" />
                  <span className="text-sm font-medium">{taste}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>خيارات التعليب / الوزن</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ weightValue: "", weightUnit: "غ", price: 0 })}>
                <Plus className="w-4 h-4 ml-1" />
                إضافة خيار تعليب
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3 bg-muted/50 p-3 rounded-xl border border-border flex-wrap">
                <div className="flex-1 min-w-[150px] space-y-2">
                  <Label className="text-xs">الوزن / الكمية</Label>
                  <div className="flex gap-2">
                    <Input {...register(`packagingOptions.${index}.weightValue` as const)} placeholder="مثال: 500" className="flex-1" />
                    <select {...register(`packagingOptions.${index}.weightUnit` as const)} className="border border-border rounded-lg bg-background text-sm px-2 w-20">
                      <option value="غ">غ</option>
                      <option value="كغ">كغ</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label className="text-xs">السعر المخفض</Label>
                  <Input type="number" {...register(`packagingOptions.${index}.price` as const)} placeholder="1650" />
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label className="text-xs">السعر الأصلي</Label>
                  <Input type="number" {...register(`packagingOptions.${index}.originalPrice` as const)} placeholder="2000" />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="shrink-0 mb-0.5">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد خيارات تعليب إضافية. سيتم استخدام السعر الأساسي للمنتج.</p>
            )}
          </div>
        </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) ? "جاري الحفظ..." : "حفظ المنتج"}
            </Button>
          </div>
      </form>
    </div>
  );
}

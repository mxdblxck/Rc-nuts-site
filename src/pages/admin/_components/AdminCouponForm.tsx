import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { X } from "lucide-react";

const schema = z.object({
  code: z.string().min(3, "الكود مطلوب"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("القيمة يجب أن تكون موجبة"),
  minOrderAmount: z.coerce.number().optional(),
  maxUses: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function AdminCouponForm({ onClose }: { onClose: () => void }) {
  const createCoupon = useMutation(api.coupons.createCoupon);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { discountType: "percentage", active: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCoupon({
        ...data,
        minOrderAmount: data.minOrderAmount ?? undefined,
        maxUses: data.maxUses ?? undefined,
        expiresAt: data.expiresAt ?? undefined,
      });
      toast.success("تم إضافة الكوبون بنجاح");
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء إضافة الكوبون");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">إضافة كوبون جديد</h3>
        <button onClick={onClose} className="cursor-pointer text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>كود الخصم *</Label>
          <Input placeholder="WELCOME20" dir="ltr" {...register("code")} />
          {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>نوع الخصم *</Label>
          <select {...register("discountType")} className="w-full border border-border rounded-lg p-2 bg-background text-sm">
            <option value="percentage">نسبة مئوية (%)</option>
            <option value="fixed">مبلغ ثابت (دج)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>قيمة الخصم *</Label>
          <Input type="number" placeholder="20" {...register("discountValue")} />
          {errors.discountValue && <p className="text-destructive text-xs">{errors.discountValue.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>الحد الأدنى للطلب (دج)</Label>
          <Input type="number" placeholder="اختياري" {...register("minOrderAmount")} />
        </div>

        <div className="space-y-2">
          <Label>الحد الأقصى للاستخدام</Label>
          <Input type="number" placeholder="اختياري" {...register("maxUses")} />
        </div>

        <div className="space-y-2">
          <Label>تاريخ انتهاء الصلاحية</Label>
          <Input type="date" dir="ltr" {...register("expiresAt")} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" {...register("active")} className="w-4 h-4" />
          <Label htmlFor="active">فعال فوراً</Label>
        </div>

        <div className="sm:col-span-2 flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ الكوبون"}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { ShoppingBag, Tag, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import { useConvex } from "convex/react";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import algeriaCities from "@/lib/algeria_cities.json";

type DeliveryOption = "office" | "home";

const schema = z.object({
  customerName: z.string().min(3, "الاسم مطلوب"),
  customerPhone: z
    .string()
    .regex(/^0[567]\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 0 ويتكون من 10 أرقام (مثال: 0551234567)"),
  customerEmail: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  daira: z.string().min(1, "الدائرة مطلوبة"),
  commune: z.string().min(1, "البلدية مطلوبة"),
  customerAddress: z.string().min(5, "العنوان التفصيلي مطلوب"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useMutation(api.orders.createOrder);
  const convex = useConvex();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("office");

  const shippingRates = useQuery(api.shipping.getShippingRates);
  const activeWilayas = shippingRates?.filter(r => r.active).map(r => r.wilayaName) ?? [];
  const availableCities = algeriaCities.filter(w => activeWilayas.includes(w.name));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedWilaya = watch("wilaya");
  const watchedDaira = watch("daira");

  const selectedWilayaData = availableCities.find((w) => w.name === watchedWilaya);
  const dairas = selectedWilayaData?.dairas ?? [];
  const selectedDairaData = dairas.find((d) => d.name === watchedDaira);
  const communes = selectedDairaData?.communes ?? [];

  const selectedShippingRate = shippingRates?.find((r) => r.wilayaName === watchedWilaya);
  const deskPrice = selectedShippingRate?.deskDeliveryCost ?? 400;
  const homePrice = selectedShippingRate?.homeDeliveryCost ?? 900;
  const deliveryPrice = deliveryOption === "home" ? homePrice : deskPrice;

  const dynamicDeliveryOptions = [
    { id: "office" as const, label: "توصيل للمكتب", description: "استلام من أقرب مكتب وكالة توصيل", price: deskPrice },
    { id: "home" as const, label: "توصيل لباب المنزل", description: "يصلك الطلب مباشرة إلى عنوانك", price: homePrice },
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-4">سلتك فارغة</h2>
          <Button asChild>
            <Link to="/shop">تسوق الآن</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode) return;
    const result = await convex.query(api.coupons.validateCoupon, {
      code: couponCode,
      orderAmount: total,
    });
    if (result.valid && result.discount) {
      setDiscount(result.discount);
      setCouponApplied(true);
      toast.success(`تم تطبيق كود الخصم! وفّرت ${result.discount.toLocaleString("ar-DZ")} دج`);
    } else {
      toast.error(result.message ?? "كود الخصم غير صالح");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const cityFull = `${data.wilaya} - ${data.daira} - ${data.commune}`;
      const orderId = await createOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail ?? undefined,
        customerAddress: data.customerAddress,
        customerCity: cityFull,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          weight: i.weight,
          taste: i.taste,
        })),
        subtotal: total,
        discount: discount > 0 ? discount : undefined,
        couponCode: couponApplied ? couponCode : undefined,
        total: total - discount + deliveryPrice,
        paymentMethod: "cash_on_delivery",
        notes: data.notes ?? undefined,
      });
      clearCart();
      navigate(`/order-confirm/${orderId}`);
    } catch {
      toast.error("حدث خطأ أثناء إرسال الطلب. حاول مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalTotal = total - discount + deliveryPrice;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
        <h1 className="text-3xl font-black text-foreground font-serif mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">البيانات الشخصية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">الاسم الكامل *</Label>
                    <Input
                      id="customerName"
                      placeholder="محمد أحمد"
                      {...register("customerName")}
                    />
                    {errors.customerName && (
                      <p className="text-destructive text-xs">{errors.customerName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">رقم الهاتف</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="0551234567"
                      dir="ltr"
                      maxLength={10}
                      {...register("customerPhone")}
                      onInput={(e) => {
                        let val = e.currentTarget.value.replace(/[^0-9]/g, '');
                        // Force starting with 0
                        if (val.length > 0 && val[0] !== '0') val = '0' + val;
                        // Force second digit to be 5, 6, or 7
                        if (val.length > 1 && !['5', '6', '7'].includes(val[1])) {
                          val = val[0];
                        }
                        e.currentTarget.value = val;
                      }}
                    />
                    {errors.customerPhone && (
                      <p className="text-destructive text-xs">{errors.customerPhone.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="customerEmail">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="example@gmail.com"
                      dir="ltr"
                      {...register("customerEmail")}
                    />
                    {errors.customerEmail && (
                      <p className="text-destructive text-xs">{errors.customerEmail.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  عنوان التوصيل
                </h2>

                {/* Country - Fixed */}
                <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 mb-4">
                  <span className="text-2xl">🇩🇿</span>
                  <div>
                    <div className="text-xs text-muted-foreground">البلد</div>
                    <div className="font-bold text-foreground">الجزائر</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Wilaya selector */}
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">الولاية *</Label>
                    <select
                      id="wilaya"
                      className="w-full border border-border rounded-lg p-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register("wilaya", {
                        onChange: (e) => {
                          setValue("daira", "");
                          setValue("commune", "");
                        },
                      })}
                    >
                      <option value="">-- اختر الولاية --</option>
                      {availableCities.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                    {errors.wilaya && (
                      <p className="text-destructive text-xs">{errors.wilaya.message}</p>
                    )}
                  </div>

                  {/* Daira selector */}
                  <div className="space-y-2">
                    <Label htmlFor="daira">الدائرة *</Label>
                    <select
                      id="daira"
                      className="w-full border border-border rounded-lg p-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      disabled={dairas.length === 0}
                      {...register("daira", {
                        onChange: (e) => {
                          setValue("commune", "");
                        },
                      })}
                    >
                      <option value="">
                        {dairas.length === 0 ? "اختر الولاية أولاً" : "-- اختر الدائرة --"}
                      </option>
                      {dairas.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.daira && (
                      <p className="text-destructive text-xs">{errors.daira.message}</p>
                    )}
                  </div>

                  {/* Commune selector */}
                  <div className="space-y-2">
                    <Label htmlFor="commune">البلدية *</Label>
                    <select
                      id="commune"
                      className="w-full border border-border rounded-lg p-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      disabled={communes.length === 0}
                      {...register("commune")}
                    >
                      <option value="">
                        {communes.length === 0 ? "اختر الدائرة أولاً" : "-- اختر البلدية --"}
                      </option>
                      {communes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.commune && (
                      <p className="text-destructive text-xs">{errors.commune.message}</p>
                    )}
                  </div>

                  {/* Detailed address */}
                  <div className="space-y-2 sm:col-span-3">
                    <Label htmlFor="customerAddress">العنوان التفصيلي *</Label>
                    <Input
                      id="customerAddress"
                      placeholder="الحي، الشارع، رقم البناية، الطابق..."
                      {...register("customerAddress")}
                    />
                    {errors.customerAddress && (
                      <p className="text-destructive text-xs">{errors.customerAddress.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-3">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      placeholder="أي تعليمات خاصة للتوصيل..."
                      rows={3}
                      {...register("notes")}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  طريقة التوصيل
                </h2>
                <div className="space-y-3">
                  {dynamicDeliveryOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryOption(option.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer text-right ${deliveryOption === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${deliveryOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                          {deliveryOption === option.id && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                      <span className="font-black text-primary text-base shrink-0 mr-2">
                        {option.price.toLocaleString("ar-DZ")} دج
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment - Cash only */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">طريقة الدفع</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5">
                  <span className="text-3xl">💵</span>
                  <div>
                    <div className="font-bold text-foreground">الدفع عند الاستلام</div>
                    <div className="text-sm text-muted-foreground">
                      تدفع نقداً عند وصول طلبك إليك
                    </div>
                  </div>
                  <div className="mr-auto">
                    <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  كود الخصم
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="أدخل الكود"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className="shrink-0 cursor-pointer"
                  >
                    تطبيق
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-primary text-xs mt-2 font-medium">
                    ✓ تم تطبيق الخصم بنجاح
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-4">ملخص الطلب</h3>
                <div className="space-y-2 text-sm mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between items-start">
                      <div className="min-w-0 ml-2">
                        <span className="text-muted-foreground truncate block">
                          {item.productName} ×{item.quantity}
                        </span>
                        {(item.weight || item.taste) && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.weight && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.weight}</span>}
                            {item.taste && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.taste}</span>}
                          </div>
                        )}
                      </div>
                      <span className="font-medium shrink-0">
                        {(item.price * item.quantity).toLocaleString("ar-DZ")} دج
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span>{total.toLocaleString("ar-DZ")} دج</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>الخصم</span>
                      <span>-{discount.toLocaleString("ar-DZ")} دج</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">سعر التوصيل</span>
                    <span className="font-medium text-foreground">
                      {deliveryPrice.toLocaleString("ar-DZ")} دج
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-base border-t border-border pt-2">
                    <span>الإجمالي</span>
                    <span className="text-primary">
                      {finalTotal.toLocaleString("ar-DZ")} دج
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                بالضغط على تأكيد الطلب، أنت توافق على شروط الاستخدام
              </p>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

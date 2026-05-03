import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Gift, ShoppingCart, Truck, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

const PLACEHOLDER = "/logo.png";

export default function PacksPage() {
  const packs = useQuery(api.packs.listActivePacks, {});
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAddPack = (pack: any) => {
    addItem({
      cartItemId: `pack-${pack._id}`,
      productId: pack._id, // reuse Id field — pack id stored here
      productName: `🎁 ${pack.nameAr}`,
      price: pack.price,
      quantity: 1,
      imageUrl: pack.imageUrl ?? PLACEHOLDER,
      isPack: true,
    });
    setAddedIds((prev) => new Set(prev).add(pack._id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(pack._id); return s; }), 3000);

    toast(
      <div className="flex items-center gap-3 w-full min-w-0" dir="rtl">
        {/* Left: icon + name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Gift className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">تمت إضافة الباقة: {pack.nameAr}</span>
        </div>
        {/* Right: CTA — solid primary button, same as cart */}
        <button
          onClick={() => { toast.dismiss(); navigate("/cart"); }}
          className="shrink-0 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
        >
          الذهاب إلى السلة
        </button>
      </div>,
      { duration: 4000 }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gift className="w-4 h-4" />
            عروض حصرية
          </div>
          <h1 className="text-4xl font-black text-foreground font-serif mb-3">الباقات الخاصة</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            اختر باقتك المفضلة واستمتع بأفضل الأسعار مع توصيل مجاني على جميع الباقات
          </p>
          {/* Free shipping badge */}
          <div className="inline-flex items-center gap-2 mt-4 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-full text-sm font-bold">
            <Truck className="w-4 h-4" />
            توصيل مجاني على جميع الباقات
          </div>
        </div>

        {/* Packs grid */}
        {packs === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold mb-2">لا توجد باقات متاحة حالياً</p>
            <p className="text-sm">تابعونا قريباً لعروض حصرية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => {
              const discount =
                pack.originalPrice && pack.originalPrice > pack.price
                  ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                  : 0;
              const isAdded = addedIds.has(pack._id);

              return (
                <div
                  key={pack._id}
                  className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={pack.imageUrl ?? PLACEHOLDER}
                      alt={pack.nameAr}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                    />
                    {/* Pack Special badge */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <Badge className="bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 shadow">
                        <Gift className="w-3 h-3" />
                        باقة خاصة
                      </Badge>
                      {discount > 0 && (
                        <Badge className="bg-destructive text-white text-xs font-bold shadow">
                          -{discount}%
                        </Badge>
                      )}
                    </div>
                    {/* Free shipping ribbon */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      <Truck className="w-3 h-3" />
                      توصيل مجاني
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-xl font-black text-foreground mb-2">{pack.nameAr}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {pack.descriptionAr}
                    </p>

                    {/* Included products */}
                    {pack.products && pack.products.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                          يتضمن ({pack.products.reduce((s: number, p: any) => s + (p.quantity ?? 1), 0)} قطعة):
                        </p>
                        <div className="space-y-1.5">
                          {pack.products.map((p: any, idx: number) => (
                            <div key={`${p._id}-${idx}`} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-foreground font-medium">{p.nameAr}</span>
                              {(p.quantity ?? 1) > 1 && (
                                <span className="text-xs bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                                  ×{p.quantity}
                                </span>
                              )}
                              <span className="text-muted-foreground text-xs mr-auto">
                                {p.displayWeight || p.weight || ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-3xl font-black text-primary">
                        {pack.price.toLocaleString("ar-DZ")} دج
                      </span>
                      {pack.originalPrice && pack.originalPrice > pack.price && (
                        <div className="flex flex-col items-start">
                          <span className="text-sm text-muted-foreground line-through">
                            {pack.originalPrice.toLocaleString("ar-DZ")} دج
                          </span>
                          <span className="text-xs text-emerald-600 font-bold">
                            وفّر {(pack.originalPrice - pack.price).toLocaleString("ar-DZ")} دج
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Button
                      size="lg"
                      className="w-full gap-2"
                      variant={isAdded ? "secondary" : "default"}
                      onClick={() => !isAdded && handleAddPack(pack)}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          تمت الإضافة ✓
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          أضف الباقة للسلة
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

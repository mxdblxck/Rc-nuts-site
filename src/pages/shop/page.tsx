import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Filter, Search, Gift, Truck, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import ProductCard from "@/components/ProductCard.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const PLACEHOLDER = "/logo.png";
const categories = ["الكل", "مكسرات", "بذور", "خلطات", "مجففات"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") ?? "الكل";
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "sale">("all");
  const [activeTab, setActiveTab] = useState<"products" | "packs">("products");

  const products = useQuery(api.products.listProducts, {});
  const activePacks = useQuery(api.packs.listActivePacks, {});
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [addedPackIds, setAddedPackIds] = useState<Set<string>>(new Set());

  const filtered = (products ?? []).filter((p) => {
    const matchCat = selectedCategory === "الكل" || p.category === selectedCategory;
    const matchSearch = p.nameAr.includes(search) || p.descriptionAr.includes(search);
    const matchPrice = priceFilter === "all" || (priceFilter === "sale" && p.originalPrice !== undefined && p.price < p.originalPrice);
    return matchCat && matchSearch && matchPrice;
  });

  const handleAddPack = (pack: any) => {
    addItem({
      cartItemId: `pack-${pack._id}`,
      productId: pack._id,
      productName: `🎁 ${pack.nameAr}`,
      price: pack.price,
      quantity: 1,
      imageUrl: pack.imageUrl ?? PLACEHOLDER,
      isPack: true,
    });
    setAddedPackIds((prev) => new Set(prev).add(pack._id));
    setTimeout(() => setAddedPackIds((prev) => { const s = new Set(prev); s.delete(pack._id); return s; }), 3000);
    toast(
      <div className="flex items-center justify-between gap-3 w-full" dir="rtl">
        <div className="flex items-center gap-2 min-w-0">
          <Gift className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">تمت إضافة الباقة: {pack.nameAr}</span>
        </div>
        <button
          onClick={() => { toast.dismiss(); navigate("/cart"); }}
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary border border-primary/40 bg-primary/5 hover:bg-primary/15 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          الذهاب إلى السلة <ArrowLeft className="w-3 h-3" />
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
        <div className="mb-6">
          <h1 className="text-3xl font-black text-foreground font-serif mb-2">المتجر</h1>
          <p className="text-muted-foreground">اكتشف تشكيلتنا من أجود المكسرات والبذور</p>
        </div>

        {/* Main tabs: Products / Packs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab("packs")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
              activeTab === "packs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gift className="w-4 h-4" />
            باقات خاصة
            {activePacks && activePacks.length > 0 && (
              <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                {activePacks.length}
              </span>
            )}
          </button>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منتج..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? "default" : "secondary"}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchParams(cat !== "الكل" ? { category: cat } : {});
                    }}
                    className="cursor-pointer"
                  >
                    {cat}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={priceFilter === "sale" ? "default" : "secondary"}
                  onClick={() => setPriceFilter(priceFilter === "sale" ? "all" : "sale")}
                  className="gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  العروض فقط
                </Button>
              </div>
            </div>

            {products === undefined ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-medium">لا توجد منتجات مطابقة</p>
                <p className="text-sm">جرب البحث بكلمة مختلفة أو غيّر الفئة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            )}
          </>
        )}

        {/* ── PACKS TAB ── */}
        {activeTab === "packs" && (
          <>
            {/* Free shipping notice */}
            <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm font-bold">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              جميع الباقات تشمل توصيلاً مجانياً تلقائياً
            </div>

            {activePacks === undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : activePacks.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Gift className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">لا توجد باقات متاحة حالياً</p>
                <p className="text-sm">تابعونا قريباً لعروض حصرية</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePacks.map((pack) => {
                  const discount = pack.originalPrice && pack.originalPrice > pack.price
                    ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                    : 0;
                  const isAdded = addedPackIds.has(pack._id);
                  return (
                    <div key={pack._id} className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col">
                      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                        <img
                          src={pack.imageUrl ?? PLACEHOLDER}
                          alt={pack.nameAr}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                          <Badge className="bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                            <Gift className="w-3 h-3" /> باقة خاصة
                          </Badge>
                          {discount > 0 && <Badge className="bg-destructive text-white text-xs">-{discount}%</Badge>}
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          <Truck className="w-3 h-3" /> توصيل مجاني
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h2 className="text-lg font-black text-foreground mb-1">{pack.nameAr}</h2>
                        <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">{pack.descriptionAr}</p>
                        {pack.products && pack.products.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {pack.products.slice(0, 3).map((p: any) => (
                              <div key={p._id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                                {p.nameAr}
                              </div>
                            ))}
                            {pack.products.length > 3 && (
                              <div className="text-xs text-muted-foreground pr-4">+{pack.products.length - 3} منتجات أخرى</div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-black text-primary">{pack.price.toLocaleString("ar-DZ")} دج</span>
                          {pack.originalPrice && pack.originalPrice > pack.price && (
                            <span className="text-sm text-muted-foreground line-through">{pack.originalPrice.toLocaleString("ar-DZ")} دج</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          variant={isAdded ? "secondary" : "default"}
                          onClick={() => !isAdded && handleAddPack(pack)}
                        >
                          {isAdded ? <><CheckCircle className="w-4 h-4" /> تمت الإضافة ✓</> : <><Gift className="w-4 h-4" /> أضف الباقة للسلة</>}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link to="/packs" className="text-sm text-primary hover:underline font-medium">
                عرض صفحة الباقات الكاملة ←
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

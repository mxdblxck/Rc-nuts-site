import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import ProductCard from "@/components/ProductCard.tsx";

const categories = ["الكل", "مكسرات", "بذور", "خلطات", "مجففات"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") ?? "الكل";
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "sale">("all");

  const products = useQuery(api.products.listProducts, {});

  const filtered = (products ?? []).filter((p) => {
    const matchCat = selectedCategory === "الكل" || p.category === selectedCategory;
    const matchSearch = p.nameAr.includes(search) || p.descriptionAr.includes(search);
    const matchPrice = priceFilter === "all" || (priceFilter === "sale" && p.originalPrice !== undefined && p.price < p.originalPrice);
    return matchCat && matchSearch && matchPrice;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground font-serif mb-2">المتجر</h1>
          <p className="text-muted-foreground">اكتشف تشكيلتنا من أجود المكسرات والبذور</p>
        </div>

        {/* Filters */}
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

        {/* Products Grid */}
        {products === undefined ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">لا توجد منتجات مطابقة</p>
            <p className="text-sm">جرب البحث بكلمة مختلفة أو غيّر الفئة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

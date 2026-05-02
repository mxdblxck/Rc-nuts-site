import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowRight, CheckCircle, Minus, Plus, ShoppingCart, Star, StarHalf, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(null);
  const [selectedTaste, setSelectedTaste] = useState<string | null>(null);

  const product = useQuery(api.products.getProductBySlug, { slug: slug ?? "" });

  const packagingOptions = product?.packagingOptions ?? [];
  const activePackaging = packagingOptions.find((p) => p.name === selectedPackaging) ?? packagingOptions[0];

  const TASTE_OPTIONS = product?.tasteOptions ?? [];
  const activeTaste = selectedTaste ?? TASTE_OPTIONS[0];

  const currentPrice = activePackaging ? activePackaging.price : (product?.price ?? 0);
  const currentOriginalPrice = activePackaging ? (activePackaging.originalPrice ?? activePackaging.price) : (product?.originalPrice ?? 0);
  const discount = Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) || 0;

  const handleAddToCart = () => {
    if (!product) return;
    const weightLabel = activePackaging?.name ?? product.weight;
    const tasteLabel = TASTE_OPTIONS.length > 0 ? activeTaste : undefined;
    const cartItemId = `${product._id}-${weightLabel ?? "default"}-${tasteLabel ?? "default"}`;

    addItem({
      cartItemId,
      productId: product._id,
      productName: product.nameAr,
      price: currentPrice,
      quantity,
      imageUrl: product.imageUrl,
      weight: weightLabel,
      taste: tasteLabel,
    });
    toast.success(`تمت الإضافة إلى السلة: ${product.nameAr} (${quantity})`);
  };

  if (product === undefined) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10 flex-1 grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          المنتج غير موجود
        </div>
      </div>
    );
  }

  // Loading and Not Found are handled above

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمتجر
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted shadow-lg">
            <img
              src={product.imageUrl}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-white text-sm px-3 py-1">
                خصم {discount}%
              </Badge>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">{product.category}</div>
            <h1 className="text-3xl font-black text-foreground font-serif mb-4">{product.nameAr}</h1>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: Math.floor(4.5 + (product._id.charCodeAt(0) % 6) * 0.1) }).map((_, i) => (
                <Star key={`f-${i}`} className="w-4 h-4 fill-accent text-accent" />
              ))}
              {(4.5 + (product._id.charCodeAt(0) % 6) * 0.1) % 1 !== 0 && (
                <StarHalf className="w-4 h-4 fill-accent text-accent" />
              )}
              <span className="text-sm text-muted-foreground mr-2">
                (تقييم {(4.5 + (product._id.charCodeAt(0) % 6) * 0.1).toFixed(1)}/5)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-primary">{currentPrice.toLocaleString("ar-DZ")} دج</span>
              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{currentOriginalPrice.toLocaleString("ar-DZ")} دج</span>
                  <span className="text-sm font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                    وفّر {(currentOriginalPrice - currentPrice).toLocaleString("ar-DZ")} دج
                  </span>
                </>
              )}
            </div>

            {/* Packaging Options */}
            {packagingOptions.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-bold text-foreground mb-3 text-sm">اختر الوزن / التعليب</h3>
                <div className="grid grid-cols-2 gap-3">
                  {packagingOptions.map((pkg) => {
                    const isSelected = activePackaging?.name === pkg.name;
                    return (
                      <button
                        key={pkg.name}
                        onClick={() => setSelectedPackaging(pkg.name)}
                        className={`text-right p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="font-bold text-sm mb-1">{pkg.name}</div>
                        <div className="text-primary font-black text-lg">
                          {pkg.price.toLocaleString("ar-DZ")} دج
                        </div>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <div className="text-xs text-muted-foreground">
                            بدل <span className="line-through">{pkg.originalPrice.toLocaleString("ar-DZ")}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              product.weight && (
                <div className="text-sm text-muted-foreground mb-4">
                  الوزن: <span className="font-medium text-foreground">{product.weight}</span>
                </div>
              )
            )}

            {/* Taste Options */}
            {TASTE_OPTIONS.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-foreground mb-3 text-sm">اختر الذوق</h3>
                <div className="flex flex-wrap gap-2">
                  {TASTE_OPTIONS.map((taste) => {
                    const isSelected = activeTaste === taste;
                    return (
                      <button
                        key={taste}
                        onClick={() => setSelectedTaste(taste)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {taste}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">{product.descriptionAr}</p>

            {/* Benefits */}
            {product.benefitsAr && product.benefitsAr.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  الفوائد الصحية
                </h3>
                <ul className="space-y-2">
                  {product.benefitsAr.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Add to cart */}
            {product.inStock ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5" />
                  أضف للسلة - {(currentPrice * quantity).toLocaleString("ar-DZ")} دج
                </Button>
              </div>
            ) : (
              <div className="bg-muted rounded-xl p-4 text-center text-muted-foreground font-medium">
                نفذت الكمية - سيتوفر قريباً
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

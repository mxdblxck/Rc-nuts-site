import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useState } from "react";
import { showAddedToCartToast } from "@/lib/cart-toast.tsx";

const PLACEHOLDER = "/logo.png";

type Product = {
  _id: Id<"products">;
  nameAr: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
  inStock: boolean;
  slug: string;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Build resolved images array: prefer gallery, fallback to imageUrl, then placeholder
  const resolvedImages: string[] = (() => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.imageUrl) return [product.imageUrl];
    return [PLACEHOLDER];
  })();

  const primaryImage = resolvedImages[0] ?? PLACEHOLDER;
  const hoverImage = resolvedImages[1] ?? null;
  const hasHoverImage = hoverImage !== null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      cartItemId: `${product._id}-default-default`,
      productId: product._id,
      productName: product.nameAr,
      price: product.price,
      quantity: 1,
      imageUrl: primaryImage,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
    showAddedToCartToast(product.nameAr, () => navigate("/cart"));
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Image with hover swap effect */}
        <div
          className="relative overflow-hidden aspect-square bg-muted"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.nameAr}
            width={400}
            height={400}
            className={`w-full h-full object-cover transition-all duration-500 ${
              hasHoverImage
                ? isHovered
                  ? "opacity-0 scale-105"
                  : "opacity-100 scale-100"
                : "group-hover:scale-105"
            }`}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          />
          {/* Hover image (second image) */}
          {hasHoverImage && (
            <img
              src={hoverImage}
              alt={`${product.nameAr} - صورة بديلة`}
              width={400}
              height={400}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
            />
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-destructive text-white text-xs flex items-center gap-1">
              <Tag className="w-3 h-3" />
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-foreground font-bold text-lg">نفذت الكمية</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
          <h3 className="font-bold text-foreground mb-2 text-base leading-snug group-hover:text-primary transition-colors">
            {product.nameAr}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-black text-primary">{product.price.toLocaleString("ar-DZ")} دج</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">{product.originalPrice.toLocaleString("ar-DZ")} دج</span>
            )}
          </div>
          {product.inStock ? (
            justAdded ? (
              <Button
                size="sm"
                variant="secondary"
                className="w-full gap-2 cursor-pointer"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                تمت الإضافة ✓
              </Button>
            ) : (
              <Button
                variant="mesh"
                size="sm"
                className="w-full gap-2 cursor-pointer"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                اشتري الآن
              </Button>
            )
          ) : (
            <Button size="sm" className="w-full" disabled>
              نفذت الكمية
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}

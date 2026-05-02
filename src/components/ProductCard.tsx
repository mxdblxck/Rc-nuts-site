import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { toast } from "sonner";
import { useState } from "react";

type Product = {
  _id: Id<"products">;
  nameAr: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  inStock: boolean;
  slug: string;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      cartItemId: `${product._id}-default-default`,
      productId: product._id,
      productName: product.nameAr,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
    toast.success(`تمت الإضافة إلى السلة: ${product.nameAr}`);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-muted">
          <img
            src={product.imageUrl}
            alt={product.nameAr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-1 cursor-pointer text-xs"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-3 h-3" />
                  تمت الإضافة ✓
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1 cursor-pointer text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/cart"); }}
                >
                  الذهاب إلى السلة
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="w-full gap-2 cursor-pointer"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                أضف للسلة
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

import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

/**
 * Shows a cart-added notification with a solid "الذهاب إلى السلة" button.
 * The button uses the site's primary color (dark olive green) to match other buttons.
 */
export function showAddedToCartToast(productName: string, onGoToCart: () => void) {
  toast(
    <div className="flex items-center gap-3 w-full min-w-0" dir="rtl">
      {/* Left: icon + name */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <ShoppingCart className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate">تمت الإضافة: {productName}</span>
      </div>
      {/* Right: CTA — solid primary button, never overflows */}
      <button
        onClick={onGoToCart}
        className="shrink-0 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
      >
        الذهاب إلى السلة
      </button>
    </div>,
    { duration: 4000 }
  );
}

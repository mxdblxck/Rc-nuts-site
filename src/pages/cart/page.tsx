import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useCart } from "@/hooks/use-cart.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">سلتك فارغة</h2>
          <p className="text-muted-foreground mb-8">لم تضف أي منتجات إلى سلتك بعد</p>
          <Button asChild size="lg">
            <Link to="/shop">تصفح المنتجات</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-foreground font-serif">سلة المشتريات</h1>
          <button
            onClick={clearCart}
            className="text-sm text-destructive hover:underline cursor-pointer"
          >
            إفراغ السلة
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{item.productName}</h3>
                  {(item.weight || item.taste) && (
                    <div className="flex gap-2 mt-1">
                      {item.weight && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.weight}</span>}
                      {item.taste && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.taste}</span>}
                    </div>
                  )}
                  <div className="text-primary font-bold mt-1">
                    {item.price.toLocaleString("ar-DZ")} دج
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      المجموع: {(item.price * item.quantity).toLocaleString("ar-DZ")} دج
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-bold text-foreground mb-4 text-lg">ملخص الطلب</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">{total.toLocaleString("ar-DZ")} دج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التوصيل</span>
                <span className="font-medium text-primary">-</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                <span>الإجمالي</span>
                <span className="text-primary text-lg">{total.toLocaleString("ar-DZ")} دج</span>
              </div>
            </div>
            <Button className="w-full mb-3 gap-2" size="lg" onClick={() => navigate("/checkout")}>
              المتابعة للدفع
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link to="/shop">متابعة التسوق</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

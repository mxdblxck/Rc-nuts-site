import { useParams } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

export default function OrderConfirmPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground font-serif mb-3">تم استلام طلبك!</h1>
          <p className="text-muted-foreground mb-2 text-lg">
            شكراً لتسوقك من آر سي ناتس
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            سنتواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل.
          </p>

          <div className="bg-card border border-border rounded-2xl p-4 mb-8 text-sm text-muted-foreground">
            <p>رقم طلبك:</p>
            <p className="font-mono font-bold text-foreground mt-1 break-all">{orderId}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                الرئيسية
              </Link>
            </Button>
            <Button variant="secondary" asChild size="lg" className="gap-2">
              <Link to="/shop">
                <ShoppingBag className="w-4 h-4" />
                متابعة التسوق
              </Link>
            </Button>
          </div>

          {/* WhatsApp follow up */}
          <div className="mt-8">
            <a
              href="https://wa.me/213549845460?text=مرحبا، لقد أكملت طلبي وأريد متابعة حالته"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline flex items-center justify-center gap-2"
            >
              تابع طلبك عبر واتساب
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

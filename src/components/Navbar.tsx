import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المتجر" },
  { href: "/about", label: "من نحن" },
  { href: "/#contact", label: "اتصل بنا" },
];

export default function Navbar() {
  const { itemCount, total } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="RC Nuts" className="w-10 h-10 object-contain rounded-full shadow" />
          <div>
            <div className="font-bold text-lg leading-none text-primary font-serif">RC Nuts</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">الخيار الملكي للمكسرات</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                  {itemCount}
                </Badge>
              )}
            </div>
            {itemCount > 0 && (
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground">{itemCount} منتج</span>
                <span className="text-xs font-bold text-primary">{total.toLocaleString("ar-DZ")} دج</span>
              </div>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-foreground/80 hover:text-primary transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

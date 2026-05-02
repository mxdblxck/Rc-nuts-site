<<<<<<< HEAD
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Gift } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import PackAnnouncementBanner from "@/components/PackAnnouncementBanner.tsx";
=======
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المتجر" },
<<<<<<< HEAD
  { href: "/packs", label: "الباقات", icon: Gift },
=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
  { href: "/about", label: "من نحن" },
  { href: "/#contact", label: "اتصل بنا" },
];

export default function Navbar() {
  const { itemCount, total } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
<<<<<<< HEAD
  const location = useLocation();

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href.split("#")[0]) && href !== "/";

  return (
    <>
      <PackAnnouncementBanner />

      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="RC Nuts" className="w-9 h-9 object-contain rounded-full shadow" />
            <div className="hidden xs:block">
              <div className="font-bold text-base leading-none text-primary font-serif">RC Nuts</div>
              <div className="text-[9px] text-muted-foreground tracking-widest uppercase">الخيار الملكي للمكسرات</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  isActive(link.href)
                    ? "text-primary font-bold"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: cart + hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
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

            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="القائمة"
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                    menuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                  }`}
                >
                  <X className="w-5 h-5" />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                    menuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
                  }`}
                >
                  <Menu className="w-5 h-5" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu — animated slide down */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-border bg-background/98 px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground/80 hover:bg-muted hover:text-primary"
                } ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
              >
                {link.icon
                  ? <link.icon className="w-4 h-4 shrink-0" />
                  : <span className="w-4 h-4 shrink-0 flex items-center justify-center text-primary/40 text-xs">•</span>
                }
                {link.label}
                {link.href === "/packs" && (
                  <span className="mr-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                    جديد
                  </span>
                )}
              </Link>
            ))}

            {/* Cart summary in mobile menu */}
            {itemCount > 0 && (
              <button
                onClick={() => { setMenuOpen(false); navigate("/cart"); }}
                className="mt-2 flex items-center justify-between px-3 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold transition-colors hover:bg-primary/10"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">السلة ({itemCount} منتج)</span>
                </div>
                <span className="text-sm font-black">{total.toLocaleString("ar-DZ")} دج</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
=======

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
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
  );
}

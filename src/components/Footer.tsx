import { Link } from "react-router-dom";
import { Leaf, Phone, MapPin, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-start">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="RC Nuts" className="w-10 h-10 object-contain rounded-full" />
            <div>
              <div className="font-bold text-lg text-background font-serif">آر سي ناتس</div>
              <div className="text-[10px] text-background/60 tracking-widest uppercase">RC Nuts</div>
            </div>
          </div>
          <p className="text-sm text-background/70 leading-relaxed">
            متجر متخصص في أجود أنواع المكسرات والبذور والمنتجات المجففة. جودة ممتازة وأسعار تنافسية.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-bold text-background mb-4">روابط سريعة</h3>
          <ul className="space-y-2 text-sm text-background/70">
            {[
              { to: "/", label: "الرئيسية" },
              { to: "/shop", label: "المتجر" },
              { to: "/about", label: "من نحن" },
              { to: "/contact", label: "اتصل بنا" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div id="contact" className="flex flex-col items-center md:items-start">
          <h3 className="font-bold text-background mb-4">تواصل معنا</h3>
          <ul className="space-y-3 text-sm text-background/70">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent shrink-0" />
              <span dir="ltr">+213 549 84 54 60</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent shrink-0" />
              <span><a href="mailto:rcnutsdz@gmail.com"></a>rcnutsdz@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <span>الجزائر العاصمة، الجزائر</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent shrink-0" />
              <a
                href="https://www.facebook.com/profile.php?id=100071813446402"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                صفحة الفيسبوك
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 px-4 py-4 text-center text-xs text-background/50">
        © {year} آر سي ناتس - RC Nuts. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

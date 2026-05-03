import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useSpring, useTransform } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowLeft, Award, Leaf, ShieldCheck, Star, Truck, Nut, Sprout, Blend, Grape, Camera, Sparkles, Check, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import ProductCard from "@/components/ProductCard.tsx";

const testimonials = [
  { name: ".BRAHIM B", rating: 5, comment: "شرينا من عندكم الكاجو التين و الميكس و الحمد لله دايما تكونو عند الثقة التغليف ممتاز و الطعم حاجة ماشاء الله ربي يبارك فيكم " },
  { name: ".SARA M", rating: 5, comment: "Salam j'ai recu ma commande tres bien presenté Mashallah et mm pas une heure khlast 😍" },
  { name: ".KARIM A", rating: 5, comment: "يعطيكم الصحة لحقني الطلب ، الذوق روعة ما تشبعوش زيد عجبني التغليف ، ماشاء الله خدمة Professionelle 👍" },
];

const features = [
  { icon: <Award className="w-6 h-6" />, title: "جودة ممتازة", desc: "منتجات مختارة بعناية من أفضل المصادر" },
  { icon: <Leaf className="w-6 h-6" />, title: "طبيعي 100%", desc: "بدون مواد حافظة أو إضافات اصطناعية" },
  { icon: <Truck className="w-6 h-6" />, title: "توصيل سريع", desc: "توصيل لجميع ولايات الجزائر" },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "ضمان الجودة", desc: "خدمة ما بعد البيع متوفرة لكم" },
];

const categories = [
  { name: "مكسرات", img: "/مكسرات.png" },
  { name: "بذور", img: "/بذور.png" },
  { name: "خلطات", img: "/خلطات.png" },
  { name: "مجففات", img: "/مجففات.png" },
];

// Professional Counter Component
function CounterItem({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-black text-primary">
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// Animated Counter that counts up
function AnimatedCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            // Smooth count up animation
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setCount(target);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-black text-primary">
        <span className="tabular-nums">{count}{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// Big Buy Button with click animation
function BuyButton({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  const [clicked, setClicked] = useState(false);
  const isPrimary = !secondary;
  
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="inline-block w-full sm:w-auto">
      <Button 
        size="lg"
        asChild
        className={`
          gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 shadow-lg border-2 w-full sm:w-auto
          ${isPrimary 
            ? "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25" 
            : "border-border/50 bg-transparent text-foreground hover:bg-muted border-border/30"
          }
          ${clicked ? "bg-green-500 border-green-500 text-white" : ""}
          transition-all duration-200 font-semibold
        `}
        onClick={() => { if (isPrimary) { setClicked(true); setTimeout(() => setClicked(false), 1500); }}}
      >
        {isPrimary && clicked ? (
          <><CheckCircle className="w-5 sm:w-6" />تم!</>
        ) : children}
      </Button>
    </motion.div>
  );
}

export default function Index() {
  const seedProducts = useMutation(api.products.seedProducts);
  const featuredProducts = useQuery(api.products.listProducts, { featured: true });

  useEffect(() => {
    seedProducts().catch(() => { });
  }, [seedProducts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-[92vh] flex items-center">
        {/* Background decoration - enhanced */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-16 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text - First on mobile, left on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-start"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              مرحبا بزبائننا الكرام
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.15] mb-5 font-serif">
              أجود المكسرات
              <br />
              <span className="text-primary">والفواكه المجففة</span>
            </h1>
            <p className="text-base sm:text-lg md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
              مكسرات وبذور فاخرة مختارة بعناية، طازجة ومغذية. تسوّق من راحة منزلك بأسعار تنافسية وتوصيل سريع لجميع ولايات الجزائر.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start justify-center md:justify-start mb-10">
              <BuyButton>
                <Link to="/shop">
                  <><ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />اشتري الآن</>
                </Link>
              </BuyButton>
              <BuyButton secondary>
                <Link to="/#about">
                  <><ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />تفاصيل أكثر</>
                </Link>
              </BuyButton>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex gap-8 sm:gap-12 justify-center md:justify-start"
            >
              <AnimatedCounter target={15} suffix="+" label="منتج فاخر" />
              <AnimatedCounter target={100} suffix="%" label="طبيعي" />
              <AnimatedCounter target={500} suffix="+" label="عميل راضٍ" />
            </motion.div>
          </motion.div>

          {/* Image - Last on mobile, right on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square max-w-sm mx-auto md:max-w-none md:aspect-[4/5] lg:aspect-square">
              <img
                src={`/hero2.png`}
                alt="مكسرات طبيعية فاخرة"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="800"
                height="800"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 bg-card rounded-2xl shadow-2xl p-4 sm:p-5 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">صور حقيقية</div>
                  <div className="text-xs text-muted-foreground">للمنتجات</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features - Apple Style */}
      <section className="py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center justify-center p-4 lg:p-6 rounded-2xl hover:bg-muted/50 transition-colors duration-300 cursor-pointer"
              >
                <div className="text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1 text-center">{f.title}</h3>
                <p className="text-xs text-muted-foreground text-center leading-snug">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Premium Cards */}
      <section className="py-10 max-w-7xl mx-auto px-4 w-full">
        {/* Cool separator with center diamond */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <div className="w-2 h-2 rotate-45 bg-primary/30" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6 font-serif text-center">تصفح حسب الفئة</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm md:text-base">اختر ما يناسبك من تشكيلتنا الواسعة</p>
        
        {/* Desktop: 4 cols | Mobile: 2x2 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="aspect-square"
            >
              <Link
                to={`/shop?category=${cat.name}`}
                className="relative flex flex-col items-center justify-center gap-2 h-full rounded-xl bg-primary/5 border border-primary/10 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:bg-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                {/* Image - Center */}
                <div className="w-20 h-20 md:w-24 md:h-24 relative">
                  <img 
                    src={cat.img} 
                    alt={cat.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Title - Bottom */}
                <h3 className="font-bold text-base md:text-lg text-foreground/90">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-muted/20 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-foreground font-serif">المنتجات المميزة</h2>
              <p className="text-muted-foreground mt-1">أفضل مبيعاتنا وعروض حصرية</p>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/shop" className="gap-2 flex items-center">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {featuredProducts === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="py-12 max-w-7xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-primary rounded-3xl p-8 md:p-12 text-primary-foreground"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48" />
          <div className="relative text-center">
            <h2 className="text-2xl md:text-4xl font-black mb-4 font-serif">
              عروض حصرية على جميع المنتجات
            </h2>
            <p className="text-primary-foreground/80 mb-6 text-lg">
              وفّر حتى 25% على منتجاتنا المميزة - عروض محدودة الوقت!
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-primary font-bold px-8"
            >
              <Link to="/shop">استفد من العروض الآن</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-muted/30 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-foreground mb-2 font-serif text-center">ماذا يقول زبائننا؟</h2>
          <p className="text-muted-foreground text-center mb-10">آراء حقيقية من زبائن راضين</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm"
              >
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">{`"${t.comment}"`}</p>
                <div className="font-bold text-foreground text-sm">{t.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
            <img
              src="https://rcnuts.store/cdn/shop/files/1000001555.jpg?v=1777467685&width=3840"
              alt="عن آر سي ناتس"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground mb-4 font-serif">من نحن؟</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              آر سي ناتس هو متجر جزائري متخصص في توفير أجود أنواع المكسرات والبذور والمنتجات المجففة.
              نؤمن بأن الغذاء الصحي يجب أن يكون في متناول الجميع بأسعار معقولة.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              نختار منتجاتنا بعناية فائقة من أفضل المصادر العالمية والمحلية، ونضمن لك الطزاجة والجودة في كل طلب.
              مع توصيل سريع لجميع ولايات الجزائر.
            </p>
            <div className="flex gap-4">
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-black text-primary">7+</div>
                <div className="text-xs text-muted-foreground">سنوات خبرة</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-black text-primary">15+</div>
                <div className="text-xs text-muted-foreground">منتج فاخر</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-black text-primary">500+</div>
                <div className="text-xs text-muted-foreground"> زبون راضي</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/213549845460?text=مرحبا،أريد%20الاستفسار%20عن%20منتجاتكم"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors cursor-pointer"
        title="تواصل عبر واتساب"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
      </a>
    </div>
  );
}

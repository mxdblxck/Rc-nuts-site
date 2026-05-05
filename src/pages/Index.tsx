import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowLeft, Award, Leaf, ShieldCheck, Star, Truck, Sparkles, CheckCircle, ArrowRight, Camera } from "lucide-react";
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-lg sm:text-3xl md:text-5xl font-black text-primary tabular-nums leading-none">
        {count}{suffix}
      </div>
      <div className="mt-1 text-[0.55rem] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </motion.div>
  );
}

function BuyButton({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  const isPrimary = !secondary;
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="inline-block w-full sm:w-auto">
      <Button
        size="lg"
        asChild
        className={`
          gap-2 sm:gap-3 text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 border-2 w-full sm:w-auto
          transition-all duration-200 font-semibold
          ${isPrimary
            ? "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/40"
            : "border-border/40 bg-background/80 text-foreground hover:bg-background shadow-sm backdrop-blur-sm"
          }
        `}
      >
        {children}
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

      {/* ── Hero Section ── */}
      <section
        dir="rtl"
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: "620px" }}
      >
        {/* Background image — smooth fade-in entrance */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          {/* Mobile image — WebP with PNG fallback */}
          <picture className="md:hidden w-full h-full">
            <source srcSet="/hero_premium_phone.webp" type="image/webp" />
            <img
              src="/hero_premium_phone.png"
              alt="RC Nuts — أجود المكسرات"
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width={800}
              height={1600}
              onError={(e) => { e.currentTarget.src = "/hero_premium.png"; }}
            />
          </picture>
          {/* Desktop image — WebP with PNG fallback */}
          <picture className="hidden md:block w-full h-full">
            <source srcSet="/hero_premium.webp" type="image/webp" />
            <img
              src="/hero_premium.png"
              alt="RC Nuts — أجود المكسرات"
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width={1920}
              height={1080}
              onError={(e) => { e.currentTarget.src = "/logo.png"; }}
            />
          </picture>
        </motion.div>

        {/* Desktop gradient — theme-aware, right side only. Jars left, text right (RTL) */}
        <div
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            background: "linear-gradient(to right, transparent 30%, color-mix(in srgb, var(--background) 80%, transparent) 60%, var(--background) 100%)",
          }}
        />
        {/* Mobile gradient — top, extended reach */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background: "linear-gradient(to bottom, var(--background) 0%, color-mix(in srgb, var(--background) 20%, transparent) 52%, transparent 85%)", /*modify gradient hna b pourcentage */
          }}
        />
        {/* Mobile gradient — bottom green, reduced reach */}
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background: "linear-gradient(to bottom, transparent 70%, rgba(53,115,53,0.20) 85%, rgba(53,115,53,0.55) 100%)",
          }}
        />

        {/* Content overlay — top on mobile (centered), centered on desktop */}
        <div className="absolute inset-0 flex items-start md:items-center">
          <div
            className="w-full h-full flex items-start md:items-center pt-12 md:pt-0"
            style={{
              paddingRight: "clamp(1rem, 4vw, 3rem)",
              paddingLeft: "1rem",
            }}
          // Desktop only — no paddingTop, tighter right. Mobile keeps natural flow.
          >
            {/* Mobile: full width centered | Desktop: right-aligned 52% block */}
            <div className="w-full md:w-[52%] text-center md:text-right flex flex-col">

              {/* Headline — black text, green span */}
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-black leading-[1.12] mb-5 text-foreground text-[2.6rem] sm:text-[2.2rem] md:text-[clamp(2.5rem,5.5vw,5rem)]"
                style={{ textShadow: "0 2px 24px rgba(0,0,0,0.08)" }}
              >
                أجود المكسرات
                <br />
                <span className="text-primary">والفواكه المجففة</span>
              </motion.h1>

              {/* Subtext — dark gray */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto md:mx-0"
              >

                مكسرات وبذور فاخرة مختارة بعناية، طازجة ومغذية. تسوّق من راحة منزلك بأسعار تنافسية وتوصيل سريع لجميع ولايات الجزائر.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-end sm:justify-start mb-10"
              >
                <BuyButton>
                  <Link to="/shop">
                    <><ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />اشتري الآن</>
                  </Link>
                </BuyButton>
                <BuyButton secondary>
                  <Link to="/about">
                    <><ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />تفاصيل أكثر</>
                  </Link>
                </BuyButton>
              </motion.div>

              {/* Counters — first on mobile, last on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="flex gap-5 sm:gap-10 md:gap-14 justify-center md:justify-start order-first md:order-last mb-4 pb-2 md:mb-0 md:pb-0"
              >
                <AnimatedCounter target={15} suffix="+" label="منتج فاخر" />
                <AnimatedCounter target={100} suffix="%" label="طبيعي" />
                <AnimatedCounter target={500} suffix="+" label="عميل راضٍ" />
              </motion.div>

            </div>
          </div>
        </div>

        {/* Scroll dot — updated color for light background */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-[22px] h-[36px] rounded-full flex items-start justify-center pt-2 border-2 border-foreground/20"
          >
            <div className="w-[3px] h-[8px] rounded-full bg-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Green line separator ── */}
      <div className="relative h-[8px] w-full -mt-[0px] -mb-[3px] z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-92 " />
      </div>

      {/* Features */}
      <section className="py-10 md:py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-5 md:p-6 rounded-3xl bg-muted/35"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white mb-4 shadow-md shadow-primary/25">
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm md:text-base text-foreground mb-1 leading-snug">{f.title}</h3>
                <p className="text-[0.72rem] md:text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12 max-w-7xl mx-auto px-4 w-full">
        <div className="flex items-end justify-between mb-6">
          <div className="text-right">
            <h2 className="text-xl md:text-2xl font-black text-foreground font-serif">تصفح حسب الفئة</h2>
            <p className="text-muted-foreground text-xs md:text-sm mt-0.5">اختر ما يناسبك</p>
          </div>
          <Link to="/shop" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            عرض الكل <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <Link
                to={`/shop?category=${cat.name}`}
                className="group block rounded-3xl overflow-hidden bg-muted/40 hover:bg-muted/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-square flex items-center justify-center p-6 md:p-8">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                  />
                </div>
                {/* Label */}
                <div className="px-4 pb-4 text-right">
                  <h3 className="font-bold text-sm md:text-base text-foreground">{cat.name}</h3>
                  <span className="text-[0.7rem] text-primary font-semibold">تسوق الآن ›</span>
                </div>
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
              <Link to="/shop" className="gap-2 flex items-center">عرض الكل<ArrowLeft className="w-4 h-4" /></Link>
            </Button>
          </div>
          {featuredProducts === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
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
            <h2 className="text-2xl md:text-4xl font-black mb-4 font-serif">عروض حصرية على جميع المنتجات</h2>
            <p className="text-primary-foreground/80 mb-6 text-lg">وفّر حتى 25% على منتجاتنا المميزة - عروض محدودة الوقت!</p>
            <Button size="lg" variant="secondary" asChild className="text-primary font-bold px-8">
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
                <div className="text-xs text-muted-foreground">زبون راضي</div>
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
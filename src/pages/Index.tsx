import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ArrowLeft, Award, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
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
  { name: "مكسرات", emoji: "🥜", color: "bg-amber-50 border-amber-200" },
  { name: "بذور", emoji: "🌱", color: "bg-green-50 border-green-200" },
  { name: "خلطات", emoji: "✨", color: "bg-yellow-50 border-yellow-200" },
  { name: "مجففات", emoji: "🍇", color: "bg-purple-50 border-purple-200" },
];

export default function Index() {
  const seedProducts = useMutation(api.products.seedProducts);
  const featuredProducts = useQuery(api.products.listProducts, { featured: true });

  useEffect(() => {
    seedProducts().catch(() => { });
  }, [seedProducts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-accent/10 min-h-[90vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              مرحبا بزبائننا الكرام
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight mb-4 font-serif">
              أجود المكسرات
              <br />
              <span className="text-primary">والفواكه المجففة</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              مكسرات وبذور فاخرة مختارة بعناية، طازجة ومغذية. تسوّق من راحة منزلك بأسعار تنافسية وتوصيل سريع لجميع ولايات الجزائر.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="gap-2 text-base px-8">
                <Link to="/shop">
                  اشتري الآن
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="gap-2 text-base px-8">
                <Link to="/#about">تفاصيل أكثر</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              {[
                { value: "+15", label: "منتج فاخر" },
                { value: "100%", label: "طبيعي" },
                { value: "+500", label: "عميل راضٍ" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img
                src={`/hero2.png?t=${Date.now()}`}
                alt="مكسرات طبيعية فاخرة"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-4 -right-4 bg-card rounded-2xl shadow-xl p-4 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">جودة ممتازة</div>
                  <div className="text-xs text-muted-foreground">مضمونة 100%</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-card rounded-2xl border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-3xl font-black text-foreground mb-2 font-serif text-center">تصفح حسب الفئة</h2>
        <p className="text-muted-foreground text-center mb-8">اختر ما يناسبك من تشكيلتنا الواسعة</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/shop?category=${cat.name}`}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 ${cat.color} hover:shadow-md transition-all cursor-pointer`}
              >
                <span className="text-4xl">{cat.emoji}</span>
                <span className="font-bold text-foreground">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/20 w-full">
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
      <section className="py-16 bg-muted/30 w-full">
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
      <section id="about" className="py-16 max-w-7xl mx-auto px-4 w-full">
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

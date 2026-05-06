import { motion } from "motion/react";
import { Leaf, Award, Truck, ShieldCheck, Heart, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

const values = [
  { icon: <Leaf className="w-5 h-5" />, title: "طبيعي 100%", desc: "خالية من المواد الحافظة والإضافات الاصطناعية" },
  { icon: <Award className="w-5 h-5" />, title: "جودة ممتازة", desc: "نختار كل منتج بعناية من أفضل المصادر" },
  { icon: <Truck className="w-5 h-5" />, title: "توصيل لكل الجزائر", desc: "نوصّل لجميع الولايات الـ58 بسرعة وأمان" },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "ضمان الرضا", desc: "خدمة ما بعد البيع متوفرة" },

];

const stats = [
  { value: "7+", label: "سنوات خبرة" },
  { value: "15+", label: "منتج فاخر" },
  { value: "500+", label: "زبون راضٍ" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/15 via-background to-accent/10 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/25 blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/15 blur-3xl opacity-25" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Leaf className="w-4 h-4" />
              قصتنا مع المكسرات الطبيعية
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-serif text-foreground mb-5 leading-tight">
              من نحن؟
            </h1>
            <p className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-xl mx-auto">
              متجر جزائري أصيل متخصص في أجود أنواع المكسرات والبذور والفواكه المجففة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-20 max-w-6xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black font-serif text-foreground mb-5">حكايتنا</h2>
            <p className="text-muted-foreground leading-loose mb-4">
              آر سي ناتس مشروع وُلد من شغف حقيقي بالغذاء الصحي الطبيعي. بدأنا منذ أكثر من 7 سنوات بهدف واحد بسيط: نوفّر لكل عائلة جزائرية مكسرات طازجة بجودة ممتازة وبأسعار منصفة.
            </p>
            <p className="text-muted-foreground leading-loose mb-6">
              نؤمن بأن الفرق الحقيقي يبدأ من الطريقة — من اختيار المنتج إلى طريقة التحميص حتى وصوله إلى بيتك.
            </p>

            {/* Slogan */}
            <div className="relative rounded-3xl bg-primary/8 border border-primary/20 px-6 py-5 mb-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <p className="font-black text-lg font-serif text-foreground mb-1">
                "تاكل وش راك تشوف بعينك"
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                كل صورة في متجرنا حقيقية — نحمصوها نحن بأيدينا ونصوّرها قبل ما توصلك. لا صور تجارية مستعارة.
              </p>
            </div>

            <p className="text-muted-foreground leading-loose">
              منتجاتنا 100% طبيعية بدون أي مواد حافظة أو إضافات. نعمل مع أفضل الموردين لنضمن لك جودة لا مثيل لها.
            </p>
          </motion.div>

          {/* Image + floating stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src="https://scontent.fcfk1-1.fna.fbcdn.net/v/t39.30808-6/480578192_639844061752703_3940767381785573545_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=hBHQAJnSJgIQ7kNvwG_0auk&_nc_oc=Adpy8nCRimx-PyaQ9-OJRejDaHzoJYUp78_Sa1HCAgrIIxrsveSW_bHrs2ICbKO9oSE&_nc_zt=23&_nc_ht=scontent.fcfk1-1.fna&_nc_gid=2oZELI2ytn7BOqfqJqlS2w&_nc_ss=782a8&oh=00_Af6P3vmxg-PPgwTD5jqJIl9an9aS9HTGqMfIWZfLERIH2Q&oe=69FB817B"
                alt="مكسرات آر سي ناتس"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Stats overlay card */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[88%] bg-card/95 backdrop-blur border border-border rounded-2xl shadow-xl px-5 py-4 flex justify-around">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black text-primary">{s.value}</div>
                  <div className="text-[0.7rem] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 bg-muted/25 w-full">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black font-serif text-foreground mb-2">قيمنا ومبادئنا</h2>
            <p className="text-muted-foreground text-sm">ما يجعلنا مختلفين</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"> {/* change grid menna */}
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-5 rounded-3xl bg-background border border-border/60"
              >
                <div className="w-11 h-11 bg-primary flex items-center justify-center rounded-2xl text-white mb-3 shadow-md shadow-primary/25">
                  {v.icon}
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1 leading-snug">{v.title}</h3>
                <p className="text-[0.7rem] text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 max-w-3xl mx-auto px-4 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-black font-serif text-foreground mb-3">جاهز تجرّب الفرق؟</h2>
          <p className="text-muted-foreground mb-8">اطلب الآن وذوّق الجودة الحقيقية</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" asChild className="px-9 shadow-lg shadow-primary/30">
              <Link to="/shop" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                اشتري الآن
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-9">
              <Link to="/contact">تواصل معنا</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

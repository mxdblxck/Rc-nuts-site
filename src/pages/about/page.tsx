import { motion } from "motion/react";
import { Leaf, Award, Truck, ShieldCheck, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";

const values = [
  { icon: <Leaf className="w-6 h-6" />, title: "طبيعي 100%", desc: "منتجاتنا خالية من المواد الحافظة والإضافات الاصطناعية" },
  { icon: <Award className="w-6 h-6" />, title: "جودة ممتازة", desc: "نختار كل منتج بعناية فائقة من أفضل المصادر المحلية والعالمية" },
  { icon: <Truck className="w-6 h-6" />, title: "توصيل لكل الجزائر", desc: "نوصل لجميع ولايات الجزائر الـ58 بسرعة وأمان" },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "ضمان الرضا", desc: "غير راضٍ عن الطلب؟ راسلنا" },
  { icon: <Heart className="w-6 h-6" />, title: "بأيدينا نحمص", desc: "تاكل وش راك تشوف بعينك — كل صورة حقيقية لمنتجاتنا نحمصوها حنا بأيدينا" },
  { icon: <Users className="w-6 h-6" />, title: "+500 عميل راضٍ", desc: "ثقة مئات العائلات الجزائرية منذ سنوات" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/15 via-background to-accent/10 py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              قصتنا مع المكسرات الطبيعية
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-serif text-foreground mb-6 leading-tight">
              من نحن؟
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              متجر جزائري أصيل متخصص في أجود أنواع المكسرات والبذور والفواكه المجففة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black font-serif text-foreground mb-6">حكايتنا </h2>
            <p className="text-muted-foreground leading-loose mb-5 text-base">
              آر سي ناتس مشروع وُلد من شغف حقيقي بالغذاء الصحي الطبيعي. بدأنا رحلتنا منذ أكثر من 7 سنوات بهدف واحد بسيط: نوفّر لكل عائلة جزائرية مكسرات وبذورًا طازجة بجودة ممتازة وبأسعار منصفة.
            </p>
            <p className="text-muted-foreground leading-loose mb-5 text-base">
              نؤمن بأن الفرق الحقيقي يبدأ من الطريقة. لهذا نهتم بكل تفصيلة — من اختيار المنتج إلى طريقة التحميص حتى وصوله إلى بيتك طازج.
            </p>

            {/* Slogan highlight */}
            <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-6 py-5 my-6">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">
                ✦
              </div>
              <p className="text-foreground font-semibold text-lg leading-relaxed font-serif">
                "تاكل وش راك تشوف بعينك"
              </p>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                كل صورة في متجرنا هي لمنتجاتنا الحقيقية ، نحمصوها نحن بأيدينا ونصوّرها قبل ما توصلك. لا صور تجارية مستعارة، لا وعود فارغة.
              </p>
            </div>

            <p className="text-muted-foreground leading-loose text-base">
              منتجاتنا 100% طبيعية بدون أي مواد حافظة أو إضافات. نعمل مع أفضل الموردين المحليين والعالميين لنضمن لك جودة لا مثيل لها في كل طلب.
            </p>
          </motion.div>

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
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>
            {/* Stats overlay */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-card border border-border rounded-2xl shadow-xl px-6 py-4 flex justify-around">
              {[
                { value: "7+", label: "سنوات خبرة" },
                { value: "15+", label: "منتج فاخر" },
                { value: "500+", label: "زبون راضٍ" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-black text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30 w-full">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black font-serif text-foreground mb-3">قيمنا ومبادئنا</h2>
            <p className="text-muted-foreground">ما يجعلنا مختلفين</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm leading-snug">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-4xl mx-auto px-4 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-black font-serif text-foreground mb-4">جاهز تجرّب الفرق؟</h2>
          <p className="text-muted-foreground mb-8 text-lg">اطلب الآن وذوّق الجودة الحقيقية</p>
          <Button size="lg" asChild className="px-10 text-base">
            <Link to="/shop">اشتري الآن</Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

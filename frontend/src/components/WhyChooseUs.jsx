import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award, DollarSign, Truck, Users, Package, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const WhyChooseUs = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  const features = [
    { icon: Award, title: t("why.f1.title"), desc: t("why.f1.desc") },
    { icon: DollarSign, title: t("why.f2.title"), desc: t("why.f2.desc") },
    { icon: Truck, title: t("why.f3.title"), desc: t("why.f3.desc") },
    { icon: Users, title: t("why.f4.title"), desc: t("why.f4.desc") },
    { icon: Package, title: t("why.f5.title"), desc: t("why.f5.desc") },
    { icon: MessageSquare, title: t("why.f6.title"), desc: t("why.f6.desc") },
  ];

  return (
    <section
      className="py-14 md:py-20 bg-[#0A0A0A]"
      data-testid="why-choose-us"
      ref={ref}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4">
            Advantages
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-white section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("why.heading")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 border border-white/8 hover:border-[#D4AF37]/40 bg-white/3 backdrop-blur-sm hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,175,55,0.12)] transition-all duration-500 group"
                data-testid={`why-card-${i}`}
              >
                <div className="w-12 h-12 border border-[#D4AF37]/30 flex items-center justify-center mb-6 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300">
                  <Icon className="text-[#D4AF37]" size={20} />
                </div>
                <h3 className={`text-base font-poppins font-semibold text-white mb-3 ${lang === "ur" ? "font-urdu" : ""}`}>
                  {f.title}
                </h3>
                <p className={`text-sm font-inter text-gray-400 leading-relaxed ${lang === "ur" ? "font-urdu" : ""}`}>
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

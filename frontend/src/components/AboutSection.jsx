import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Handshake, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL =
  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20want%20to%20partner%20as%20a%20wholesale%20retailer.%20Please%20share%20details.";

const AboutSection = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    { icon: Shield, title: t("about.f1.title"), text: t("about.f1.text") },
    { icon: Handshake, title: t("about.f2.title"), text: t("about.f2.text") },
    { icon: MapPin, title: t("about.f3.title"), text: t("about.f3.text") },
  ];

  return (
    <section id="about" className="py-14 md:py-20 bg-background" data-testid="about-section">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className={`text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4 ${lang === "ur" ? "font-urdu" : ""}`}>
            Why Choose Us
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-foreground section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("about.heading")}
          </h2>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 bg-white dark:bg-[#18181B] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(212,175,55,0.12)] group"
                data-testid={`about-feature-${i}`}
              >
                <div className="w-14 h-14 border border-[#D4AF37]/40 flex items-center justify-center mb-6 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-300">
                  <Icon className="text-[#D4AF37]" size={22} />
                </div>
                <h3 className={`text-xl font-poppins font-semibold text-foreground mb-3 ${lang === "ur" ? "font-urdu" : ""}`}>
                  {f.title}
                </h3>
                <p className={`text-sm font-inter text-muted-foreground leading-relaxed ${lang === "ur" ? "font-urdu" : ""}`}>
                  {f.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Story Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1609143739217-01b60dad1c67?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
              alt="AZ Distribution Wholesale Warehouse Operations"
              className="w-full object-cover border border-[#D4AF37]/20"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
            />
            <div className="absolute inset-0 border border-[#D4AF37]/20 m-3 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm p-4 border border-[#D4AF37]/30">
              <p className="text-[#D4AF37] font-montserrat font-bold text-xs tracking-widest uppercase">
                Mirpur's #1 Wholesale Distributor
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className={`space-y-6 ${lang === "ur" ? "text-right" : ""}`}
          >
            <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase">
              Our Story
            </p>
            <h3 className={`text-2xl md:text-3xl font-poppins font-bold text-foreground ${lang === "ur" ? "font-urdu" : ""}`}>
              {t("about.story_heading")}
            </h3>
            <p className={`text-base font-inter text-muted-foreground leading-relaxed ${lang === "ur" ? "font-urdu" : ""}`}>
              {t("about.story_text")}
            </p>
            <div className="flex flex-wrap gap-4">
              {["500+ Products", "100+ Retailers", "4+ Years", "Mirpur, AJK"].map((item, i) => (
                <span key={i} className="px-3 py-1.5 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-montserrat font-semibold tracking-wider">
                  {item}
                </span>
              ))}
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all duration-300 hover:scale-105 ${lang === "ur" ? "font-urdu" : ""}`}
              data-testid="about-partner-btn"
            >
              Partner With Us
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

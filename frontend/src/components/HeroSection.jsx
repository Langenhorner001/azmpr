import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, PackageSearch, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { trackWhatsAppClick } from "../utils/analytics";

const WHATSAPP_URL =
  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20am%20interested%20in%20bulk%20purchase.%20Please%20share%20product%20catalog%20and%20pricing.";

const HeroSection = () => {
  const { t, lang } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/18325786/pexels-photo-18325786.jpeg?auto=compress&cs=tinysrgb&w=1600)",
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />

      {/* Floating Product Visual */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[40%] max-w-md hidden lg:block opacity-30"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="https://images.pexels.com/photos/14275711/pexels-photo-14275711.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Premium imported Iranian chocolate gift box — AZ Distribution wholesale"
          className="w-full object-cover"
          style={{ aspectRatio: "3/4", objectPosition: "center" }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="800"
          height="1066"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 md:px-8 max-w-7xl py-20 md:py-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={`max-w-3xl ${lang === "ur" ? "ml-auto text-right" : ""}`}>
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <span className="inline-block px-4 py-2 border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
              {t("hero.eyebrow")}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className={`text-4xl md:text-6xl lg:text-7xl font-poppins font-black text-white leading-tight mb-6 ${
              lang === "ur" ? "font-urdu" : ""
            }`}
          >
            <span className="gold-text">{t("hero.headline").split(" ").slice(0, 3).join(" ")}</span>
            <br />
            <span className="text-white">{t("hero.headline").split(" ").slice(3).join(" ")}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className={`text-base md:text-lg text-gray-300 font-inter max-w-2xl mb-10 leading-relaxed ${
              lang === "ur" ? "font-urdu text-right" : ""
            }`}
          >
            {t("hero.subheadline")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className={`flex flex-col sm:flex-row gap-4 mb-12 ${
              lang === "ur" ? "justify-end" : ""
            }`}
          >
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
              data-testid="hero-catalog-btn"
              onClick={() => trackWhatsAppClick("hero_catalog")}
            >
              <PackageSearch size={18} />
              {t("hero.cta_primary")}
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#25D366] text-[#25D366] font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#25D366] hover:text-white transition-all duration-300 hover:scale-105"
              data-testid="hero-whatsapp-btn"
              onClick={() => trackWhatsAppClick("hero_whatsapp")}
            >
              <MessageCircle size={18} />
              {t("hero.cta_secondary")}
            </a>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className={`flex flex-wrap gap-3 ${lang === "ur" ? "justify-end" : ""}`}
          >
            {[t("hero.badge1"), t("hero.badge2")].map((badge, i) => (
              <span
                key={i}
                className={`flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest backdrop-blur-sm ${
                  lang === "ur" ? "font-urdu" : ""
                }`}
              >
                <span className="text-green-400">✓</span>
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-10 bg-gradient-to-b from-[#D4AF37]/60 to-transparent" />
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
};

export default HeroSection;

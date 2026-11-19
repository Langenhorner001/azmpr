import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, Download } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL =
  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20want%20to%20start%20a%20wholesale%20order.%20Please%20share%20the%20catalog%20and%20pricing.";

const TRUST_ITEMS = [
  { label: "Minimum Order:", value: "Flexible" },
  { label: "Payment:", value: "Cash / Bank Transfer" },
  { label: "Delivery:", value: "24-48 Hours" },
];

const WholesaleCTA = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      className="py-14 md:py-20 bg-[#0A0A0A] relative overflow-hidden"
      data-testid="wholesale-cta"
      ref={ref}
    >
      {/* Gold gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/6 via-transparent to-[#D4AF37]/4 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-6">
            Partner With Us
          </p>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-poppins font-black text-white mb-6 leading-tight ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("cta.heading")}
          </h2>

          <p className={`text-base md:text-lg text-gray-400 font-inter max-w-3xl mx-auto mb-10 leading-relaxed ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("cta.subtext")}
          </p>

          {/* Trust Items */}
          <div className="flex flex-wrap gap-6 justify-center mb-12">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-inter">
                <span className="text-[#D4AF37]">✓</span>
                <span className="text-gray-400">{item.label}</span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-300 hover:scale-105 ${lang === "ur" ? "font-urdu" : ""}`}
              data-testid="cta-wholesale-btn"
            >
              <MessageCircle size={18} />
              {t("cta.primary_btn")}
            </a>
            <button
              className={`inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-white/20 text-white font-montserrat font-bold text-sm tracking-widest uppercase hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 ${lang === "ur" ? "font-urdu" : ""}`}
              data-testid="cta-download-btn"
              onClick={() =>
                window.open(
                  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20Please%20share%20the%20product%20catalog.",
                  "_blank"
                )
              }
            >
              <Download size={18} />
              {t("cta.secondary_btn")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WholesaleCTA;

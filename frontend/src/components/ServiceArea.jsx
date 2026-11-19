import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const AREAS = [
  "Mirpur City",
  "Dadyal",
  "Kotli",
  "Bhimber",
  "Surrounding AJK Districts",
];

const ServiceArea = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      className="py-14 md:py-20 bg-background relative overflow-hidden"
      data-testid="service-area"
      ref={ref}
    >
      {/* Decorative gold radial bg */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #D4AF37 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4">
            Coverage
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-foreground section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("service.heading")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Area List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-3"
          >
            {AREAS.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-4 p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all duration-300 group"
                data-testid={`area-item-${i}`}
              >
                <MapPin size={16} className="text-[#D4AF37] flex-shrink-0" />
                <span className="font-poppins font-medium text-foreground group-hover:text-[#D4AF37] transition-colors text-sm md:text-base">
                  {area}
                </span>
              </motion.div>
            ))}

            <div className="flex items-start gap-3 pt-4 pl-2 border-l-2 border-[#D4AF37]/40">
              <Clock size={16} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <p className={`text-sm font-inter text-muted-foreground ${lang === "ur" ? "font-urdu" : ""}`}>
                {t("service.cta")}
              </p>
            </div>
          </motion.div>

          {/* Map Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <img
              src="https://images.pexels.com/photos/7019319/pexels-photo-7019319.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="AZ Distribution Delivery Coverage Mirpur AJK"
              className="w-full object-cover border border-[#D4AF37]/20"
              style={{ aspectRatio: "4/3" }}
              loading="lazy"
            />
            <div className="absolute inset-0 border border-[#D4AF37]/25 m-4 pointer-events-none" />
            <div className="absolute bottom-8 left-8 bg-black/85 backdrop-blur-sm p-4 border border-[#D4AF37]/30">
              <p className="text-[#D4AF37] text-xs font-montserrat font-bold tracking-widest uppercase">
                Delivery: 24-48 Hours
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServiceArea;

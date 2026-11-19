import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

const TESTIMONIALS = [
  {
    name: "Asad Khan",
    business: "Khan Traders, Mirpur",
    quote:
      "Best wholesale distributor in the region. Genuine Iranian products at unbeatable prices. My customers keep coming back for more.",
    rating: 5,
    initials: "AK",
  },
  {
    name: "Sara Ahmed",
    business: "Premium Retail Store, Mirpur",
    quote:
      "Fast delivery and excellent customer service. Our customers absolutely love the authentic taste of these Iranian imports.",
    rating: 5,
    initials: "SA",
  },
  {
    name: "Bilal Hussain",
    business: "City Supermarket, AJK",
    quote:
      "Partnering with AZ Distribution increased our confectionery sales by 30%. The lava shak sheets are a bestseller every month.",
    rating: 5,
    initials: "BH",
  },
  {
    name: "Tariq Mehmood",
    business: "Mega Mart, Dadyal",
    quote:
      "Consistent stock availability and responsive support. They never let us down during peak seasons. Highly recommended.",
    rating: 5,
    initials: "TM",
  },
];

const TestimonialCard = ({ t: testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex-shrink-0 w-[300px] md:w-[380px] p-8 border border-[#D4AF37]/20 dark:border-[#D4AF37]/30 bg-white dark:bg-[#18181B] hover:border-[#D4AF37]/60 hover:shadow-[0_4px_20px_rgba(212,175,55,0.12)] transition-all duration-400 group"
    data-testid={`testimonial-card-${index}`}
  >
    {/* Stars */}
    <div className="flex gap-1 mb-5">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <span key={i} className="text-[#D4AF37] text-lg">★</span>
      ))}
    </div>

    {/* Quote */}
    <p className="text-sm font-inter text-muted-foreground mb-6 leading-relaxed italic">
      "{testimonial.quote}"
    </p>

    {/* Author */}
    <div className="flex items-center gap-4 pt-4 border-t border-[#D4AF37]/10">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center text-black font-poppins font-black text-sm flex-shrink-0">
        {testimonial.initials}
      </div>
      <div>
        <p className="font-poppins font-semibold text-sm text-foreground">
          {testimonial.name}
        </p>
        <p className="text-xs font-inter text-muted-foreground">{testimonial.business}</p>
      </div>
    </div>
  </motion.div>
);

const Testimonials = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      className="py-14 md:py-20 bg-background overflow-hidden"
      data-testid="testimonials-section"
      ref={ref}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4">
            Testimonials
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-foreground section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("testimonials.heading")}
          </h2>
        </motion.div>

        {/* Horizontal Scroll */}
        <div
          className="flex gap-6 overflow-x-auto pb-4 testimonials-scroll"
          data-testid="testimonials-scroll"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#D4AF37 transparent" }}
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={i} t={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

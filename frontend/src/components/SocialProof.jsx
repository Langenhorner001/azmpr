import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const useCountUp = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
};

const StatItem = ({ value, suffix, label }) => {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-poppins font-black gold-text mb-2">
        {count}{suffix}
      </div>
      <p className="text-xs md:text-sm text-gray-400 font-inter tracking-wider uppercase">{label}</p>
    </div>
  );
};

const SocialProof = () => {
  const { t, lang } = useLanguage();

  const stats = [
    { value: 500, suffix: "+", label: t("social.products") },
    { value: 100, suffix: "+", label: t("social.retailers") },
    { value: 4, suffix: "+", label: t("social.years") },
  ];

  const trust = [t("social.authentic"), t("social.pricing"), t("social.delivery")];

  return (
    <section
      className="py-14 md:py-20 bg-[#0A0A0A] border-y border-[#D4AF37]/20"
      data-testid="social-proof"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12">
          {stats.map((stat, i) => (
            <StatItem key={i} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {trust.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-4 py-2.5 border border-[#D4AF37]/30 text-[#D4AF37] text-xs md:text-sm font-montserrat tracking-wide ${
                lang === "ur" ? "font-urdu" : ""
              }`}
              data-testid={`trust-badge-${i}`}
            >
              <span className="text-green-400">✓</span>
              {item}
            </div>
          ))}
        </div>

        {/* Rating Line */}
        <p
          className={`text-center text-[#D4AF37] font-poppins font-semibold text-sm md:text-base ${
            lang === "ur" ? "font-urdu" : ""
          }`}
        >
          ★★★★★ &nbsp;{t("social.rating")}
        </p>
      </div>
    </section>
  );
};

export default SocialProof;

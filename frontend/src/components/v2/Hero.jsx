import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, ShieldCheck, Truck, Zap } from "lucide-react";
import { waUrl } from "./constants";

const HERO_WA = waUrl(
  "Hello AZ Distribution, I would like to start a wholesale order. Please share your latest catalog and pricing."
);

const trustChips = [
  { icon: Truck, label: "Pakistan-wide Delivery" },
  { icon: Zap, label: "30-sec WhatsApp Order" },
  { icon: ShieldCheck, label: "100% Authentic" },
];

// Initials avatar circle (no real photos — keeps clean)
const AvatarCircle = ({ initials, color, ring }) => (
  <span
    className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-[11px] font-bold text-white ring-2 ring-white dark:ring-stone-950 ${color} ${ring || ""}`}
    aria-hidden
  >
    {initials}
  </span>
);

const Hero = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white dark:bg-stone-950"
      data-testid="hero-section"
    >
      {/* Subtle warm pattern bg */}
      <div
        className="absolute inset-0 opacity-[0.55] dark:opacity-30 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(245,158,11,0.12), transparent 36%), radial-gradient(circle at 92% 90%, rgba(16,185,129,0.10), transparent 38%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-14 sm:pb-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[12px] font-semibold"
            data-testid="hero-eyebrow"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            50+ premium products in stock
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-display font-extrabold text-stone-900 dark:text-white tracking-tight leading-[1.05] text-[36px] sm:text-5xl lg:text-[64px]"
            data-testid="hero-headline"
          >
            Premium Imported{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Snacks &amp; Sweets
            </span>
            <br className="hidden sm:block" />{" "}
            at Wholesale Prices
          </motion.h1>

          {/* Sub-line */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 text-[15px] sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed"
            data-testid="hero-subheadline"
          >
            Pakistan ka trusted distributor. Authentic Iranian chocolates,
            candies, dates and gum delivered fast — order on WhatsApp in under
            30 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href={HERO_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-semibold text-[15px] shadow-md hover:shadow-lg hover:bg-[#1fb359] transition-all w-full sm:w-auto"
              data-testid="hero-whatsapp-cta"
            >
              <MessageCircle size={17} />
              Order on WhatsApp
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#products"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-[15px] hover:bg-stone-700 dark:hover:bg-stone-200 transition-all w-full sm:w-auto"
              data-testid="hero-browse-cta"
            >
              Browse Products
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>

          {/* Customer avatars + count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-8 flex items-center justify-center gap-3"
            aria-label="Customer trust signal"
          >
            <div className="flex -space-x-2">
              <AvatarCircle initials="AH" color="bg-amber-500" />
              <AvatarCircle initials="SA" color="bg-rose-500" />
              <AvatarCircle initials="ZK" color="bg-emerald-600" />
              <AvatarCircle initials="MR" color="bg-sky-500" />
              <AvatarCircle initials="FA" color="bg-violet-500" />
            </div>
            <div className="text-left">
              <div className="text-[13px] font-bold text-stone-900 dark:text-white">
                100+ retailers
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                trust AZ Distribution
              </div>
            </div>
          </motion.div>

          {/* Mini trust strip */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            data-testid="hero-trust-strip"
          >
            {trustChips.map((c) => (
              <li
                key={c.label}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-600 dark:text-stone-300"
              >
                <c.icon size={14} className="text-emerald-600 dark:text-emerald-400" />
                {c.label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
};

export default Hero;

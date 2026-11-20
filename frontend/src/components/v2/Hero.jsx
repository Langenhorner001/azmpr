import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, MessageCircle, ShieldCheck, Truck, Zap } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { MovingBorder, Shine } from "../magic/MovingBorder";

const FLOAT_BADGES = [
  { icon: Truck, title: "24h dispatch", sub: "Across Pakistan", pos: "left-6 2xl:left-16 top-24", tone: "text-amber-600 bg-amber-100 dark:bg-amber-500/15", delay: 0 },
  { icon: ShieldCheck, title: "Genuine imports", sub: "Verified batches", pos: "right-6 2xl:right-16 top-40", tone: "text-emerald-700 bg-emerald-100 dark:bg-emerald-500/15", delay: 0.8 },
  { icon: Zap, title: "Deal in 30 sec", sub: "On WhatsApp", pos: "left-14 2xl:left-28 bottom-20", tone: "text-rose-600 bg-rose-100 dark:bg-rose-500/15", delay: 1.6 },
];

const FloatingBadges = () => {
  const reduce = useReducedMotion();
  return FLOAT_BADGES.map((b) => (
    <motion.div
      key={b.title}
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: reduce ? 0 : [0, -10, 0] }}
      transition={{ opacity: { duration: 0.6, delay: 0.4 + b.delay / 2 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: b.delay } }}
      className={`hidden xl:flex absolute ${b.pos} items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-[0_10px_30px_rgba(28,25,23,0.08)]`}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${b.tone}`}>
        <b.icon size={17} />
      </span>
      <span className="text-left">
        <span className="block text-[13px] font-bold text-stone-900 dark:text-white leading-tight">{b.title}</span>
        <span className="block text-[11px] text-stone-500 dark:text-stone-400">{b.sub}</span>
      </span>
    </motion.div>
  ));
};

const trustIcons = [Truck, Zap, ShieldCheck, BadgeCheck];

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
  const { settings, loaded, waUrl } = useSiteSettings();
  const h = settings.header;
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
      {/* 21st.dev-style faded grid */}
      <div
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(120,113,108,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,113,108,0.09)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_40%,black_20%,transparent_75%)]"
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-14 sm:pb-20">
        <FloatingBadges />
        <div className={`text-center max-w-3xl mx-auto transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
          {/* Eyebrow pill */}
          {h.hero_eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex"
          >
            <MovingBorder radius="rounded-full" duration={5} innerClassName="bg-amber-50 dark:bg-stone-950">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[12px] font-semibold"
                data-testid="hero-eyebrow"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                {h.hero_eyebrow}
              </span>
            </MovingBorder>
          </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-display font-extrabold text-stone-900 dark:text-white tracking-tight leading-[1.05] text-[36px] sm:text-5xl lg:text-[64px]"
            data-testid="hero-headline"
          >
            {h.hero_title_before}{" "}
            {h.hero_title_highlight && (
              <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] animate-gradient-x motion-reduce:animate-none bg-clip-text text-transparent">
                {h.hero_title_highlight}
              </span>
            )}
            {h.hero_title_after && (
              <>
                <br className="hidden sm:block" />{" "}
                {h.hero_title_after}
              </>
            )}
          </motion.h1>

          {/* Sub-line */}
          {h.hero_subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 text-[15px] sm:text-base lg:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed"
            data-testid="hero-subheadline"
          >
            {h.hero_subtitle}
          </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href={waUrl(h.hero_primary_message)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white font-semibold text-[15px] shadow-[0_8px_24px_rgba(37,211,102,0.35)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:bg-[#1fb359] transition-[background-color,box-shadow] w-full sm:w-auto"
              data-testid="hero-whatsapp-cta"
            >
              <Shine />
              <MessageCircle size={17} />
              {h.hero_primary_label}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            {h.hero_secondary_label && (
            <a
              href={h.hero_secondary_href || "#products"}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-[15px] hover:bg-stone-700 dark:hover:bg-stone-200 transition-all w-full sm:w-auto"
              data-testid="hero-browse-cta"
            >
              {h.hero_secondary_label}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            )}
          </motion.div>

          {/* Customer avatars + count */}
          {(h.hero_trust_title || h.hero_trust_subtitle) && (
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
              <div className="text-[13px] font-bold text-stone-900 dark:text-white" data-testid="hero-trust-title">
                {h.hero_trust_title}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400" data-testid="hero-trust-subtitle">
                {h.hero_trust_subtitle}
              </div>
            </div>
          </motion.div>
          )}

          {/* Mini trust strip */}
          {h.hero_chips.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            data-testid="hero-trust-strip"
          >
            {h.hero_chips.map((label, i) => {
              const Icon = trustIcons[i % trustIcons.length];
              return (
                <li
                  key={`${label}-${i}`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-600 dark:text-stone-300"
                  data-testid={`hero-chip-${i}`}
                >
                  <Icon size={14} className="text-emerald-600 dark:text-emerald-400" />
                  {label}
                </li>
              );
            })}
          </motion.ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;

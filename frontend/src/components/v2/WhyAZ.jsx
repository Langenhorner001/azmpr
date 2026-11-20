import React from "react";
import { motion } from "framer-motion";
import { Zap, BadgeCheck, Wallet, Headphones, CheckCheck } from "lucide-react";
import { SpotlightCard } from "../magic/SpotlightCard";

// Bento layout: lg = [wide, small] / [small, wide]
const SPANS = ["sm:col-span-2 lg:col-span-2", "", "", "sm:col-span-2 lg:col-span-2"];

const MESSAGES = [
  { me: true, text: "Assalam o Alaikum, FOX wafer ki 5 carton deal chahiye", time: "10:02" },
  { me: false, text: "Wa Alaikum Assalam! Behtareen rate bhej diya hai", time: "10:02" },
  { me: true, text: "Done, order confirm kar dein", time: "10:03" },
  { me: false, text: "Confirmed — kal dispatch ho jayega", time: "10:03" },
];

const ChatMockup = () => (
  <div className="mt-5 md:mt-0 md:w-1/2 rounded-xl p-3 bg-[#efeae2] dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-2" aria-hidden>
    {MESSAGES.map((m, i) => (
      <motion.div
        key={m.text}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 + i * 0.3, duration: 0.3 }}
        className={`max-w-[88%] px-3 py-1.5 rounded-xl text-[12px] leading-snug shadow-sm ${
          m.me
            ? "ml-auto bg-[#d9fdd3] dark:bg-emerald-800/60 text-stone-800 dark:text-emerald-50 rounded-br-sm"
            : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-100 rounded-bl-sm"
        }`}
      >
        {m.text}
        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] opacity-60 align-bottom">
          {m.time}
          {m.me && <CheckCheck size={12} className="text-sky-500" />}
        </span>
      </motion.div>
    ))}
  </div>
);

const SupportStrip = () => (
  <div className="mt-5 flex items-center gap-3" aria-hidden>
    <div className="flex -space-x-2">
      {["AZ", "HR", "MS"].map((n, i) => (
        <span key={n} className={`w-8 h-8 rounded-full ring-2 ring-white dark:ring-stone-950 text-[10px] font-bold text-white flex items-center justify-center ${["bg-amber-500", "bg-emerald-600", "bg-rose-500"][i]}`}>
          {n}
        </span>
      ))}
    </div>
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Online now · avg reply under 5 min
    </span>
  </div>
);

const features = [
  {
    icon: Zap,
    title: "30-second WhatsApp orders",
    desc: "Skip the cart — message us, confirm, get a quote, done. No login, no friction.",
  },
  {
    icon: BadgeCheck,
    title: "Verified imports only",
    desc: "Every SKU sourced through verified channels with traceable batch info.",
  },
  {
    icon: Wallet,
    title: "True wholesale pricing",
    desc: "Bulk-tier pricing tailored for retailers, supermarkets and resellers.",
  },
  {
    icon: Headphones,
    title: "Real human support",
    desc: "WhatsApp & phone support 7 days a week — no ticket queues, no bots.",
  },
];

const WhyAZ = () => (
  <section
    id="why"
    className="bg-stone-50 dark:bg-stone-900/40 py-14 sm:py-20 border-y border-stone-200/70 dark:border-stone-800"
    data-testid="why-section"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[12px] font-bold tracking-wide uppercase text-orange-600 dark:text-amber-400">
          Why AZ Distribution
        </p>
        <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
          Built for{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
            Pakistan&apos;s retailers
          </span>
        </h2>
        <p className="mt-3 text-[14px] sm:text-[15px] text-stone-500 dark:text-stone-400">
          Faster ordering, tighter prices, and a partner who actually picks up
          the phone.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {features.map((f, i) => (
          <SpotlightCard
            key={f.title}
            className={`rounded-2xl bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors ${SPANS[i]}`}
            innerClassName={`h-full p-5 sm:p-6 ${i === 0 ? "md:flex md:gap-6" : ""}`}
            data-testid={`why-card-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
          >
            <div className={i === 0 ? "md:w-1/2" : ""}>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-sm transition-transform duration-300 group-hover/spot:rotate-6 group-hover/spot:scale-105">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-display font-bold text-[16px] sm:text-[17px] text-stone-900 dark:text-white leading-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-[13.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
            {i === 0 && <ChatMockup />}
            {i === 3 && <SupportStrip />}
          </SpotlightCard>
        ))}
      </div>
    </div>
  </section>
);

export default WhyAZ;

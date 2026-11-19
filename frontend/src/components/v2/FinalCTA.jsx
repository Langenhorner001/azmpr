import React from "react";
import { ArrowRight, MessageCircle, Truck, ShieldCheck, Zap } from "lucide-react";
import { waUrl } from "./constants";

const FINAL_WA = waUrl(
  "Hello AZ Distribution, I'm ready to start a wholesale order. Please send me the latest catalog and pricing."
);

const microBadges = [
  { icon: Truck, label: "Pakistan-wide delivery" },
  { icon: ShieldCheck, label: "100% authentic" },
  { icon: Zap, label: "30-sec ordering" },
];

const FinalCTA = () => (
  <section
    id="contact"
    className="relative overflow-hidden bg-white dark:bg-stone-950 py-14 sm:py-20"
    data-testid="final-cta"
  >
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl">
        {/* Decorative blob */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-stone-900/20 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Ready to stock up?
          </h2>
          <p className="mt-4 text-[14px] sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
            Message us on WhatsApp — we&apos;ll send you the latest catalog,
            confirm pricing, and arrange delivery. Most orders are quoted in
            under 5 minutes.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={FINAL_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-stone-900 font-bold text-[15px] hover:bg-stone-100 transition-all w-full sm:w-auto shadow-md hover:shadow-lg"
              data-testid="final-cta-whatsapp"
            >
              <MessageCircle size={17} className="text-emerald-600" />
              Order on WhatsApp
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-stone-900/70 backdrop-blur text-white font-semibold text-[15px] hover:bg-stone-900/90 transition-colors w-full sm:w-auto border border-white/20"
              data-testid="final-cta-browse"
            >
              Browse products
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] font-medium text-white/90">
            {microBadges.map((b) => (
              <li key={b.label} className="inline-flex items-center gap-1.5">
                <b.icon size={14} className="opacity-90" />
                {b.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;

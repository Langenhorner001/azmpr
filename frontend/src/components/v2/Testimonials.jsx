import React from "react";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { SpotlightCard } from "../magic/SpotlightCard";

// PLACEHOLDER reviews — swap with real customer testimonials when available.
// Names + cities are fictional / generic Pakistani names. Quotes are written
// to reflect realistic FMCG-distributor feedback.
const reviews = [
  {
    initials: "AH",
    name: "Ahsan Hussain",
    role: "Owner, Gulshan Mart",
    city: "Karachi",
    color: "bg-amber-500",
    quote:
      "Order WhatsApp se kar deta hoon, agle din shop pe pohanch jata hai. Pricing bhi local market se behtar hai.",
    purchase: "Imported chocolates — bulk order",
  },
  {
    initials: "SA",
    name: "Sana Akhtar",
    role: "Retailer",
    city: "Lahore",
    color: "bg-rose-500",
    quote:
      "Genuine imported products, packaging perfect, expiry dates fresh. Mein 4 mahine se order kar rahi hoon.",
    purchase: "Candies & dates assortment",
  },
  {
    initials: "ZK",
    name: "Zahid Khan",
    role: "Supermarket Manager",
    city: "Islamabad",
    color: "bg-emerald-600",
    quote:
      "Stock consistent rehta hai aur support team within minutes reply karti hai. Trusted partner banta ja raha hai.",
    purchase: "Mixed FMCG wholesale",
  },
];

const Stars = () => (
  <div className="flex items-center gap-0.5" aria-label="5 star review">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        className="fill-amber-400 stroke-amber-400"
      />
    ))}
  </div>
);

const Testimonials = () => (
  <section
    id="reviews"
    className="bg-white dark:bg-stone-950 py-14 sm:py-20"
    data-testid="testimonials-section"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[12px] font-bold tracking-wide uppercase text-orange-600 dark:text-amber-400">
          What Customers Say
        </p>
        <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
          Real reviews from{" "}
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            Pakistani retailers
          </span>
        </h2>
        <p className="mt-3 text-[14px] sm:text-[15px] text-stone-500 dark:text-stone-400">
          Average <span className="font-bold text-stone-900 dark:text-white">4.9 / 5</span>{" "}
          rating across 100+ partner shops.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {reviews.map((r) => (
          <SpotlightCard
            as="figure"
            key={r.name}
            className="rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-300/70 dark:hover:border-amber-500/40 hover:-translate-y-0.5 transition-[transform,border-color] duration-300 flex flex-col"
            innerClassName="p-5 sm:p-6 flex flex-col flex-1"
            data-testid={`testimonial-${r.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Quote size={38} className="absolute -top-1 right-0 text-amber-400/20 dark:text-amber-400/15" aria-hidden />
            <div className="flex items-center justify-between gap-2">
              <Stars />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold mr-8">
                <BadgeCheck size={12} /> Verified retailer
              </span>
            </div>
            <blockquote className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-stone-700 dark:text-stone-200 flex-1">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <span
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-[12px] font-bold ${r.color}`}
                aria-hidden
              >
                {r.initials}
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-stone-900 dark:text-white truncate">
                  {r.name}
                </div>
                <div className="text-[11.5px] text-stone-500 dark:text-stone-400 truncate">
                  {r.role} • {r.city}
                </div>
              </div>
            </figcaption>
            <div className="mt-3 text-[10.5px] font-semibold tracking-wide uppercase text-emerald-700 dark:text-emerald-400">
              Purchased: {r.purchase}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;

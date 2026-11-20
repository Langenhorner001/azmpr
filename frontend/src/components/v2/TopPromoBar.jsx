import React from "react";
import { Sparkles, Truck } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const TopPromoBar = () => {
  const { settings, loaded } = useSiteSettings();
  const h = settings.header;
  if (!h.promo_enabled || !h.promo_text) return null;

  return (
    <div
      className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[12px] sm:text-xs font-semibold tracking-wide py-2 px-3"
      data-testid="top-promo-bar"
      role="region"
      aria-label="Promotional message"
    >
      <div className={`max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Sparkles size={13} className="shrink-0 animate-pulse" />
        <span className="text-center leading-tight" data-testid="top-promo-text">
          {h.promo_text}
        </span>
        <Truck size={13} className="shrink-0 hidden sm:inline" />
      </div>
    </div>
  );
};

export default TopPromoBar;

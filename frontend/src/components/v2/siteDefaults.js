import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "./constants";
import { FOOTER_DEFAULTS } from "./footerDefaults";

// Default site content — used until the admin saves custom settings.
export const GENERAL_DEFAULTS = {
  whatsapp_number: WHATSAPP_NUMBER,
  whatsapp_display: WHATSAPP_DISPLAY,
};

export const HEADER_DEFAULTS = {
  promo_enabled: true,
  promo_text: "Pakistan-wide delivery via WhatsApp — Order in 30 sec",
  header_button_label: "WhatsApp",
  header_whatsapp_message: "Hello AZ Distribution, I would like to know more about your wholesale catalog and pricing.",
  hero_eyebrow: "50+ premium products in stock",
  hero_title_before: "Premium Imported",
  hero_title_highlight: "Snacks & Sweets",
  hero_title_after: "at Wholesale Prices",
  hero_subtitle:
    "Pakistan ka trusted distributor. Authentic Iranian chocolates, candies, dates and gum delivered fast — order on WhatsApp in under 30 seconds.",
  hero_primary_label: "Order on WhatsApp",
  hero_primary_message:
    "Hello AZ Distribution, I would like to start a wholesale order. Please share your latest catalog and pricing.",
  hero_secondary_label: "Browse Products",
  hero_secondary_href: "#products",
  hero_trust_title: "100+ retailers",
  hero_trust_subtitle: "trust AZ Distribution",
  hero_chips: ["Pakistan-wide Delivery", "30-sec WhatsApp Order", "100% Authentic"],
};

export const SITE_DEFAULTS = { general: GENERAL_DEFAULTS, header: HEADER_DEFAULTS, footer: FOOTER_DEFAULTS };

export const mergeSettings = (data = {}) => ({
  general: { ...GENERAL_DEFAULTS, ...(data.general || {}) },
  header: { ...HEADER_DEFAULTS, ...(data.header || {}) },
  footer: { ...FOOTER_DEFAULTS, ...(data.footer || {}) },
});

export const buildWaUrl = (number, message) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message || "")}`;

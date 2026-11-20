import { BRAND, EMAIL, NAV_LINKS, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "./constants";

// Default footer content — used until the admin saves custom footer settings.
export const FOOTER_DEFAULTS = {
  logo_text: "AZ",
  brand_name: BRAND,
  description:
    "Pakistan's trusted distributor of imported snacks, sweets, dates and gum — wholesale prices for retailers and bulk buyers.",
  quick_links_title: "Quick links",
  quick_links: NAV_LINKS.map(({ label, href }) => ({ label, href })),
  contact_title: "Get in touch",
  whatsapp_message: "Hello AZ Distribution, I want to start a wholesale partnership.",
  email: EMAIL,
  phone_number: WHATSAPP_NUMBER,
  phone_display: WHATSAPP_DISPLAY,
  address: "Mirpur, Azad Kashmir, Pakistan",
  social_title: "Follow",
  socials: [
    { platform: "facebook", url: "#" },
    { platform: "instagram", url: "#" },
    { platform: "linkedin", url: "#" },
  ],
  cta_label: "Start order",
  copyright_text: "Made in Pakistan 🇵🇰",
  bottom_links: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  show_admin_link: true,
};

export const SOCIAL_PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "tiktok", label: "TikTok" },
];

export const SAFE_HREF = /^(#|\/|https?:\/\/|mailto:|tel:)/i;

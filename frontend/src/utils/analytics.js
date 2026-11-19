// GA4 Analytics Utility for AZ Distribution
// Usage: import { trackWhatsAppClick, trackFormSubmit, trackCatalogFilter, trackProductInquiry } from '../utils/analytics';

export const trackEvent = (eventName, params = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const trackWhatsAppClick = (location) =>
  trackEvent("whatsapp_click", {
    event_category: "CTA",
    event_label: location,
    location,
  });

export const trackFormSubmit = (success) =>
  trackEvent("contact_form_submit", {
    event_category: "Form",
    event_label: success ? "success" : "error",
    success,
  });

export const trackCatalogFilter = (category) =>
  trackEvent("catalog_filter_change", {
    event_category: "Catalog",
    event_label: category,
    category,
  });

export const trackProductInquiry = (productId, productName, category) =>
  trackEvent("product_inquiry", {
    event_category: "Product",
    product_id: productId,
    product_name: productName,
    category,
  });

export const trackPageScroll = (section) =>
  trackEvent("section_view", {
    event_category: "Engagement",
    event_label: section,
    section,
  });

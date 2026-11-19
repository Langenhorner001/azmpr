import { useEffect } from "react";

// Inject GA4 script dynamically if REACT_APP_GA4_ID is set
const Analytics = () => {
  const gaId = process.env.REACT_APP_GA4_ID;

  useEffect(() => {
    if (!gaId || gaId === "G-XXXXXXXXXX" || !gaId.startsWith("G-")) return;

    // Inject gtag.js script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      send_page_view: true,
      anonymize_ip: true,
    });

    // Track WhatsApp link clicks globally
    const handleClick = (e) => {
      const anchor = e.target.closest("a[href*='wa.me']");
      if (anchor && window.gtag) {
        window.gtag("event", "whatsapp_click", {
          event_category: "CTA",
          event_label: anchor.dataset.location || "unknown",
        });
      }
    };
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [gaId]);

  return null;
};

export default Analytics;

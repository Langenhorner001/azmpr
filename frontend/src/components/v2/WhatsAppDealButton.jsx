import React from "react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { trackWhatsAppClick } from "../../utils/analytics";

export const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.37 9.37 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42a9.36 9.36 0 0 1 6.67 2.76 9.36 9.36 0 0 1 2.75 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.71 5.84.71 12.09c0 2 .52 3.95 1.52 5.67L.62 23.25l5.63-1.48a11.3 11.3 0 0 0 5.8 1.48h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.33-8.03z" />
  </svg>
);

const WhatsAppDealButton = ({ product }) => {
  const { waUrl } = useSiteSettings();
  return (
  <a
    href={waUrl(`Assalam o Alaikum, mujhe ${product.product_name} ki deal chahiye.`)}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => trackWhatsAppClick(`product_deal_${product.id}`)}
    className="group/wa relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 w-full px-2 sm:px-3 py-2 rounded-xl bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:bg-[#1fb359] hover:shadow-[0_6px_20px_rgba(37,211,102,0.5)] active:scale-[0.97] transition-[background-color,box-shadow,transform] duration-200"
    aria-label={`Behtareen Deal WhatsApp par — ${product.product_name}`}
    data-testid={`product-whatsapp-deal-btn-${product.id}`}
  >
    <span className="relative shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-40" />
      <WhatsAppIcon size={17} className="relative transition-transform duration-200 group-hover/wa:rotate-12 group-hover/wa:scale-110" />
    </span>
    <span className="flex flex-col leading-tight text-left min-w-0">
      <span className="text-[10px] sm:text-[10.5px] font-semibold text-white/90 whitespace-nowrap">Behtareen Deal</span>
      <span className="font-display font-extrabold text-[12.5px] sm:text-[14px] whitespace-nowrap">WhatsApp par</span>
    </span>
  </a>
  );
};

export default WhatsAppDealButton;

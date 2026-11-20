import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackWhatsAppClick } from "../utils/analytics";
import { useSiteSettings } from "../context/SiteSettingsContext";

const WHATSAPP_MSG = "Hello AZ Distribution, I am interested in bulk purchase. Please share product catalog and pricing.";

const FloatingWhatsApp = () => {
  const [open, setOpen] = useState(false);
  const { waUrl } = useSiteSettings();

  return (
    <div
      className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3"
      data-testid="floating-whatsapp"
    >
      {/* Tooltip Card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#18181B] border border-[#D4AF37]/30 shadow-2xl p-5 w-60 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            data-testid="whatsapp-tooltip"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-xs font-montserrat font-bold text-[#D4AF37] tracking-widest">
                  AZ DISTRIBUTION
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs font-inter text-muted-foreground mb-4 leading-relaxed">
              Chat with us for bulk orders, pricing & catalog. We reply within minutes!
            </p>
            <a
              href={waUrl(WHATSAPP_MSG)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white text-xs font-montserrat font-bold tracking-wider hover:bg-[#1ebe5d] transition-colors"
              data-testid="whatsapp-tooltip-btn"
            >
              <MessageCircle size={14} />
              Start Chat
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => {
          setOpen(!open);
          if (!open) trackWhatsAppClick("floating_button");
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] transition-shadow"
        aria-label="Chat on WhatsApp"
        data-testid="floating-whatsapp-btn"
      >
        <MessageCircle size={26} />
      </motion.button>
    </div>
  );
};

export default FloatingWhatsApp;

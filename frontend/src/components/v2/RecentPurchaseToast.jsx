import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";

// PLACEHOLDER social-proof toast — uses synthetic name/city/time per cycle.
// Picks real product names from the loaded /api/products array if available,
// otherwise falls back to the static sample set below.

const NAMES = [
  "Ahmed", "Bilal", "Fatima", "Hassan", "Ayesha", "Usman", "Zainab",
  "Imran", "Sana", "Hamza", "Mariam", "Junaid", "Saira", "Rizwan",
  "Aisha", "Asad", "Hina", "Faisal", "Nida", "Tariq", "Sadia",
  "Adeel", "Iqra", "Zeeshan", "Komal", "Amna", "Saad", "Iram",
  "Waqas", "Anum",
];
const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur",
  "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Mardan", "Mirpur",
  "Abbottabad", "Murree", "DHA Lahore", "Gulberg", "Clifton", "Bahria Town",
];
const TIMES = [
  "just now", "1 minute ago", "3 minutes ago", "8 minutes ago",
  "15 minutes ago", "an hour ago",
];

const FALLBACK_PRODUCTS = [
  { product_name: "FOX Choco Wafer Chocolate Bar", image_url: null },
  { product_name: "Imported Chocolate Box", image_url: null },
  { product_name: "Persian Date Mix", image_url: null },
];

const SHOW_AFTER_INITIAL = 5000;
const VISIBLE_FOR = 6000;
const HIDDEN_FOR = 8000;
const SESSION_FLAG = "azdist_recent_toast_closed";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const RecentPurchaseToast = ({ products }) => {
  const [entry, setEntry] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      return false;
    }
  });
  const timersRef = useRef([]);

  const productPool = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const generateEntry = () => {
    const product = pick(productPool);
    return {
      name: pick(NAMES),
      city: pick(CITIES),
      time: pick(TIMES),
      productName: product.product_name,
      image: product.image_url,
    };
  };

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    if (closed) return undefined;
    const cycle = (firstDelay) => {
      const showT = setTimeout(() => {
        setEntry(generateEntry());
        setVisible(true);
        const hideT = setTimeout(() => {
          setVisible(false);
          cycle(HIDDEN_FOR);
        }, VISIBLE_FOR);
        timersRef.current.push(hideT);
      }, firstDelay);
      timersRef.current.push(showT);
    };
    cycle(SHOW_AFTER_INITIAL);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closed, productPool.length]);

  const dismiss = () => {
    setVisible(false);
    setClosed(true);
    try {
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // ignore
    }
    clearTimers();
  };

  if (closed) return null;

  return (
    <div
      className="fixed bottom-5 left-4 sm:left-6 z-[55] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
      data-testid="recent-purchase-toast"
    >
      <AnimatePresence>
        {visible && entry && (
          <motion.div
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40, y: 10 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="pointer-events-auto bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-3 pr-9 max-w-[280px] sm:max-w-[320px] flex items-start gap-3 relative"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 flex items-center justify-center">
              {entry.image ? (
                <img
                  src={entry.image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ShoppingBag size={18} className="text-stone-400" />
              )}
            </div>
            <div className="min-w-0 text-[12px] leading-snug text-stone-700 dark:text-stone-200">
              <span className="font-bold text-stone-900 dark:text-white">{entry.name}</span>
              <span> from </span>
              <span className="font-semibold text-stone-800 dark:text-stone-100">{entry.city}</span>
              <span> just purchased </span>
              <span className="font-semibold text-stone-900 dark:text-white line-clamp-1">
                {entry.productName}
              </span>
              <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-stone-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {entry.time}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 w-6 h-6 inline-flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Dismiss"
              data-testid="recent-purchase-toast-close"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentPurchaseToast;

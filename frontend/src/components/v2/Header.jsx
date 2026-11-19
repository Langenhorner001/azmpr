import React, { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Sun, Moon, Monitor, ShoppingBag } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { NAV_LINKS, BRAND, waUrl } from "./constants";

const HEADER_WA = waUrl(
  "Hello AZ Distribution, I would like to know more about your wholesale catalog and pricing."
);

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ThemeIcon = mode === "auto" ? Monitor : mode === "dark" ? Sun : Moon;

  const CartButton = ({ className = "", testid }) => (
    <button
      onClick={openCart}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-white transition-colors ${className}`}
      aria-label={`Open cart (${count} items)`}
      data-testid={testid}
    >
      <ShoppingBag size={16} />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow ring-2 ring-white dark:ring-stone-950"
          data-testid="header-cart-count"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-stone-950/95 backdrop-blur shadow-sm border-b border-stone-200/80 dark:border-stone-800"
            : "bg-white dark:bg-stone-950 border-b border-stone-200/60 dark:border-stone-900"
        }`}
        data-testid="site-header"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <a
              href="#home"
              className="flex items-center gap-2 group shrink-0"
              data-testid="header-logo-link"
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-sm shadow-sm group-hover:shadow-md transition-shadow"
                aria-hidden
              >
                AZ
              </span>
              <span className="font-display font-extrabold text-[15px] md:text-base tracking-tight text-stone-900 dark:text-stone-50">
                {BRAND}
              </span>
            </a>

            <nav
              className="hidden lg:flex items-center gap-8"
              aria-label="Primary"
              data-testid="header-nav"
            >
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[14px] font-medium text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-amber-400 transition-colors"
                  data-testid={`header-nav-${l.href.replace("#", "")}`}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label={`Theme: ${mode}`}
                title={`Theme: ${mode}`}
                data-testid="header-theme-toggle"
              >
                <ThemeIcon size={16} />
              </button>

              <a
                href={HEADER_WA}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1fb359] transition-all shadow-sm hover:shadow-md hover:-translate-y-px"
                data-testid="header-whatsapp-btn"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>

              <CartButton testid="header-cart-btn" />

              <button
                onClick={() => setOpen(true)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
                aria-label="Open menu"
                data-testid="header-menu-toggle"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" data-testid="mobile-drawer">
          <button
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white dark:bg-stone-950 shadow-xl border-l border-stone-200 dark:border-stone-800 flex flex-col animate-[slide-in_0.25s_ease-out]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <span className="font-display font-extrabold text-stone-900 dark:text-white">
                {BRAND}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-200"
                aria-label="Close menu"
                data-testid="mobile-drawer-close"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900"
                  data-testid={`mobile-drawer-link-${l.href.replace("#", "")}`}
                >
                  {l.label}
                  <span className="text-stone-300 dark:text-stone-600">→</span>
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <button
                onClick={() => {
                  setOpen(false);
                  openCart();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-sm font-medium relative"
                data-testid="mobile-drawer-cart"
              >
                <ShoppingBag size={15} />
                View cart
                {count > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-sm font-medium"
                data-testid="mobile-drawer-theme"
              >
                <ThemeIcon size={15} />
                Theme: {mode}
              </button>
              <a
                href={HEADER_WA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm shadow-sm hover:bg-[#1fb359] transition-colors"
                data-testid="mobile-drawer-whatsapp"
              >
                <MessageCircle size={16} />
                Order on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;

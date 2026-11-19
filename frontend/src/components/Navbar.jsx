import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Monitor, Globe } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL =
  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20am%20interested%20in%20bulk%20purchase.%20Please%20share%20product%20catalog%20and%20pricing.";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "#home", label: t("nav.home") },
    { href: "#products", label: t("nav.products") },
    { href: "#about", label: t("nav.about") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.1)] border-b border-[#D4AF37]/20"
            : "bg-transparent"
        }`}
        data-testid="navbar"
      >
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center" data-testid="nav-logo">
              <span className="text-lg md:text-xl font-poppins font-black tracking-widest gold-text">
                AZ DISTRIBUTION
              </span>
            </a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-300 tracking-wide hover:text-[#D4AF37] ${
                    scrolled ? "text-foreground" : "text-white"
                  } ${lang === "ur" ? "font-urdu" : ""}`}
                  data-testid={`nav-link-${link.href.slice(1)}`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-montserrat font-semibold border transition-all duration-300 tracking-widest ${
                  scrolled
                    ? "border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                    : "border-white/40 text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                }`}
                data-testid="lang-toggle"
                aria-label="Toggle Language"
              >
                <Globe size={11} />
                {lang === "en" ? "UR" : "EN"}
              </button>

              {/* Theme Toggle (auto / light / dark) */}
              <button
                onClick={toggleTheme}
                className={`p-2 border transition-all duration-300 ${
                  scrolled
                    ? "border-[#D4AF37]/40 text-foreground hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    : "border-white/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                }`}
                data-testid="theme-toggle"
                aria-label={`Theme: ${mode}`}
                title={`Theme: ${mode} (click to cycle auto → light → dark)`}
              >
                {mode === "auto" ? <Monitor size={15} /> : mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* WhatsApp CTA – desktop */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-[#D4AF37] text-black font-montserrat font-bold text-xs tracking-widest uppercase hover:bg-[#FFD700] transition-all duration-300"
                data-testid="nav-whatsapp-btn"
              >
                Order Now
              </a>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`md:hidden p-2 ${scrolled ? "text-foreground" : "text-white"}`}
                data-testid="mobile-menu-toggle"
                aria-label="Toggle Menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#0F0F0F] z-50 md:hidden shadow-2xl border-r border-[#D4AF37]/20 flex flex-col animate-slide-in"
            data-testid="mobile-menu"
          >
            <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20">
              <span className="font-poppins font-black tracking-widest gold-text text-base">
                AZ DISTRIBUTION
              </span>
              <button onClick={() => setMenuOpen(false)} className="text-foreground">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block px-8 py-4 text-sm font-medium text-foreground hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors border-b border-border/30 ${
                    lang === "ur" ? "font-urdu text-right" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                  data-testid={`mobile-nav-${link.href.slice(1)}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="p-6">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-white font-montserrat font-bold text-sm tracking-widest uppercase"
                onClick={() => setMenuOpen(false)}
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;

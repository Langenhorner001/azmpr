import React from "react";
import { Facebook, Instagram, Linkedin, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL =
  "https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20am%20interested%20in%20wholesale%20partnership.";

const Footer = () => {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const socials = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-[#080808] border-t border-[#D4AF37]/20" data-testid="footer">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className={lang === "ur" ? "text-right" : ""}>
            <div className="text-xl font-poppins font-black tracking-widest gold-text mb-4">
              AZ DISTRIBUTION
            </div>
            <p className={`text-sm font-inter text-gray-400 leading-relaxed mb-5 ${lang === "ur" ? "font-urdu" : ""}`}>
              {t("footer.tagline")}
            </p>
            <p className="text-xs font-inter text-gray-600">
              © {year} AZ Distribution. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-montserrat font-bold tracking-widest text-[#D4AF37] uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-sm font-inter text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
                    data-testid={`footer-link-${link.href.slice(1)}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-montserrat font-bold tracking-widest text-[#D4AF37] uppercase mb-6">
              Contact Us
            </h4>
            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-inter text-gray-400 hover:text-[#25D366] transition-colors"
                data-testid="footer-whatsapp"
              >
                <MessageCircle size={14} className="flex-shrink-0" />
                +92 318 4214075
              </a>
              <a
                href="mailto:contactazdist@gmail.com"
                className="flex items-center gap-3 text-sm font-inter text-gray-400 hover:text-[#D4AF37] transition-colors"
                data-testid="footer-email"
              >
                <Mail size={14} className="flex-shrink-0" />
                contactazdist@gmail.com
              </a>
              <a
                href="tel:+923184214075"
                className="flex items-center gap-3 text-sm font-inter text-gray-400 hover:text-[#D4AF37] transition-colors"
                data-testid="footer-phone"
              >
                <Phone size={14} className="flex-shrink-0" />
                +92 318 4214075
              </a>
              <div className="flex items-start gap-3 text-sm font-inter text-gray-400">
                <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                Mirpur, Azad Kashmir, Pakistan
              </div>
            </div>
          </div>

          {/* Social + Newsletter */}
          <div>
            <h4 className="text-xs font-montserrat font-bold tracking-widest text-[#D4AF37] uppercase mb-6">
              Follow Us
            </h4>
            <div className="flex gap-3 mb-6">
              {socials.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 border border-[#D4AF37]/25 flex items-center justify-center text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300"
                    data-testid={`footer-social-${social.label.toLowerCase()}`}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white text-xs font-montserrat font-bold tracking-wider uppercase hover:bg-[#1ebe5d] transition-colors"
              data-testid="footer-order-btn"
            >
              <MessageCircle size={14} />
              Order on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#D4AF37]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-inter text-gray-600">
            Designed with Excellence for Wholesale Distribution
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-inter text-gray-600 hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs font-inter text-gray-600 hover:text-[#D4AF37] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

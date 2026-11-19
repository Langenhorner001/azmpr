import React from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import {
  BRAND,
  EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  NAV_LINKS,
  waUrl,
} from "./constants";

const FOOTER_WA = waUrl("Hello AZ Distribution, I want to start a wholesale partnership.");

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      className="bg-stone-950 text-stone-300 border-t border-stone-900"
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white text-[13px] font-extrabold">
                AZ
              </span>
              <span className="font-display font-extrabold text-white text-[15px]">
                {BRAND}
              </span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-stone-400 max-w-xs">
              Pakistan&apos;s trusted distributor of imported snacks, sweets,
              dates and gum — wholesale prices for retailers and bulk buyers.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <h4 className="text-[12px] font-bold tracking-wide uppercase text-white">
              Quick links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[13.5px] text-stone-400 hover:text-amber-400 transition-colors"
                    data-testid={`footer-link-${l.href.replace("#", "")}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wide uppercase text-white">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={FOOTER_WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[13.5px] text-stone-300 hover:text-[#25D366] transition-colors"
                  data-testid="footer-whatsapp"
                >
                  <MessageCircle size={15} className="shrink-0" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2.5 text-[13.5px] text-stone-300 hover:text-amber-400 transition-colors break-all"
                  data-testid="footer-email"
                >
                  <Mail size={15} className="shrink-0" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="inline-flex items-center gap-2.5 text-[13.5px] text-stone-300 hover:text-amber-400 transition-colors"
                  data-testid="footer-phone"
                >
                  <Phone size={15} className="shrink-0" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="inline-flex items-start gap-2.5 text-[13.5px] text-stone-400">
                <MapPin size={15} className="shrink-0 mt-0.5" />
                Mirpur, Azad Kashmir, Pakistan
              </li>
            </ul>
          </div>

          {/* Social + CTA */}
          <div>
            <h4 className="text-[12px] font-bold tracking-wide uppercase text-white">
              Follow
            </h4>
            <div className="mt-4 flex gap-2">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                  data-testid={`footer-social-${label.toLowerCase()}`}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <a
              href={FOOTER_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1fb359] transition-colors"
              data-testid="footer-whatsapp-cta"
            >
              <MessageCircle size={15} />
              Start order
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-stone-500">
            © {year} {BRAND}. Made in Pakistan 🇵🇰
          </p>
          <div className="flex items-center gap-5 text-[12px] text-stone-500">
            <a href="#" className="hover:text-amber-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              Terms
            </a>
            <a href="/admin" className="hover:text-amber-400 transition-colors" data-testid="footer-admin-link">
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

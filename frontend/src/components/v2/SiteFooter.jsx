import React from "react";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { SocialIcon } from "./SocialIcon";

const heading = "text-[12px] font-bold tracking-wide uppercase text-white";
const contactLink = "inline-flex items-center gap-2.5 text-[13.5px] text-stone-300 transition-colors";
const isExternal = (href) => /^https?:\/\//i.test(href);

const ContactList = ({ s, g, waLink }) => (
  <ul className="mt-4 space-y-3">
    {g.whatsapp_number && (
      <li>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${contactLink} hover:text-[#25D366]`} data-testid="footer-whatsapp">
          <MessageCircle size={15} className="shrink-0" />
          {g.whatsapp_display || `+${g.whatsapp_number}`}
        </a>
      </li>
    )}
    {s.email && (
      <li>
        <a href={`mailto:${s.email}`} className={`${contactLink} hover:text-amber-400 break-all`} data-testid="footer-email">
          <Mail size={15} className="shrink-0" />
          {s.email}
        </a>
      </li>
    )}
    {s.phone_number && (
      <li>
        <a href={`tel:+${s.phone_number}`} className={`${contactLink} hover:text-amber-400`} data-testid="footer-phone">
          <Phone size={15} className="shrink-0" />
          {s.phone_display || `+${s.phone_number}`}
        </a>
      </li>
    )}
    {s.address && (
      <li className="inline-flex items-start gap-2.5 text-[13.5px] text-stone-400" data-testid="footer-address">
        <MapPin size={15} className="shrink-0 mt-0.5" />
        {s.address}
      </li>
    )}
  </ul>
);

// Reads saved content from SiteSettingsProvider (admin preview wraps it with an override).
const SiteFooter = () => {
  const { settings, loaded, waUrl } = useSiteSettings();
  const s = settings.footer;
  const g = settings.general;
  const year = new Date().getFullYear();
  const waLink = waUrl(s.whatsapp_message);
  const socials = (s.socials || []).filter((x) => x.url);

  return (
    <footer
      className={`bg-stone-950 text-stone-300 border-t border-stone-900 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white text-[13px] font-extrabold" data-testid="footer-logo-text">
                {s.logo_text}
              </span>
              <span className="font-display font-extrabold text-white text-[15px]" data-testid="footer-brand-name">{s.brand_name}</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-stone-400 max-w-xs" data-testid="footer-description">{s.description}</p>
          </div>

          <nav aria-label="Footer quick links">
            <h4 className={heading}>{s.quick_links_title}</h4>
            <ul className="mt-4 space-y-2.5">
              {(s.quick_links || []).map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <a
                    href={l.href}
                    {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-[13.5px] text-stone-400 hover:text-amber-400 transition-colors"
                    data-testid={`footer-link-${l.href.startsWith("#") ? l.href.slice(1) : i}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className={heading}>{s.contact_title}</h4>
            <ContactList s={s} g={g} waLink={waLink} />
          </div>

          <div>
            <h4 className={heading}>{s.social_title}</h4>
            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {socials.map(({ platform, url }, i) => (
                  <a
                    key={`${platform}-${i}`}
                    href={url}
                    {...(isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={platform}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                    data-testid={`footer-social-${platform}`}
                  >
                    <SocialIcon platform={platform} />
                  </a>
                ))}
              </div>
            )}
            {s.cta_label && g.whatsapp_number && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1fb359] transition-colors"
                data-testid="footer-whatsapp-cta"
              >
                <MessageCircle size={15} />
                {s.cta_label}
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-stone-500" data-testid="footer-copyright">
            © {year} {s.brand_name}. {s.copyright_text}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-[12px] text-stone-500">
            {(s.bottom_links || []).map((l, i) => (
              <a key={`${l.label}-${i}`} href={l.href} className="hover:text-amber-400 transition-colors" data-testid={`footer-bottom-link-${i}`}>
                {l.label}
              </a>
            ))}
            {s.show_admin_link && (
              <a href="/admin" className="hover:text-amber-400 transition-colors" data-testid="footer-admin-link">
                Admin
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

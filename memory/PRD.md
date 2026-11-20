# AZMPR (AZ Distribution) — PRD

## Original Problem Statement
Clone `https://github.com/Langenhorner001/azmpr.git` and work on products; don't change other code.
Approved plan: keep the website exactly as is; hide product prices from customers and replace them with an eye-catchy Roman Urdu WhatsApp deal button that opens WhatsApp with a prefilled message containing the product name. Prices remain stored (admin can still see them).

## Architecture
- React (CRA + craco, Tailwind, framer-motion) frontend — v2 storefront components
- FastAPI backend + MongoDB, products seeded from `backend/data/products.json` (50 products)
- Admin panel at `/admin` (password login, JWT)

## User Personas
- Owner/admin: wants deals done privately over WhatsApp, prices not public
- Customers/retailers: browse products and contact on WhatsApp in one tap

## Implemented (Nov 2026 / iteration 1)
- Admin image upload (/api/admin/upload) now saves to Emergent Object Storage; images served publicly via GET /api/files/{path} (needed so uploads persist on the live site)
- Repo cloned and running as-is (frontend src/public, backend server + seed data)
- Product cards: price + fake original price removed; green WhatsApp button "Behtareen Deal / WhatsApp par" (wa.me/923184214075, message: "Assalam o Alaikum, mujhe <product> ki deal chahiye.")
- Price sort options removed from sort dropdown
- Cart drawer: no prices; "Price WhatsApp par" per item, subtotal shows "Behtareen Deal WhatsApp par"; checkout message has no prices
- Public `/api/products` no longer exposes price; admin API/edit modal still shows real prices (DB untouched)
- Tested: backend 100%, frontend 100% (desktop + 390px mobile)

## Implemented — iteration 2 (Nov 2026)
- Admin panel rebuilt (`/admin`, AdminDashboard + components/admin/*): 6 clickable stat cards, search/category/status/sort filters, inline edit (category, price, stock, status, live switch), duplicate (hidden copy opens in editor), Add form with "Save & add another", image upload/URL
- Bulk: multi-select + floating bar (edit fields, show, hide, export, trash); bulk edit dialog (category, stock status, stock qty, fixed price or % change with preview, visibility)
- CSV/Excel import (template download, dry-run preview with errors, create/update by id, blank image keeps existing), CSV export (all or selected)
- Trash: soft delete with Undo toast, restore, permanent delete (confirm), bulk restore/delete, empty trash; tombstones stop re-seeding deleted products; unique index on product id
- Public API excludes hidden + trashed; recent-purchase toast only uses visible in-stock products (no static fallback)
- Landing 21st.dev-style: moving-border eyebrow, animated gradient headline, floating badges, shine CTAs, product image marquee, spotlight trust tiles, bento WhyAZ with WhatsApp chat mockup, testimonials spotlight + verified pill, number tickers, moving-border final CTA
- ADMIN_PASSWORD / SECRET_KEY moved to backend/.env
- Note: digizee-store reference repo was private/404 — not used

## Implemented — iteration 3 (Nov 2026)
- Admin "Customization" tab: edit every footer item (logo text, brand, description, quick links with reorder, contact column, WhatsApp number/message — footer only, phone, email, address, socials incl. YouTube/X/TikTok, CTA text, copyright, bottom links, admin-link toggle) with live preview, save/discard/restore defaults
- Backend: GET /api/settings/footer (public), PUT /api/admin/settings/footer (validated, safe links only) in settings_routes.py; stored in db.site_settings {key:"footer"}
- "Made with Emergent" badge removed from public/index.html
- ADMIN_PASSWORD is a user-managed secret (set via secrets card)

## Implemented — iteration 4 (Nov 2026)
- Customization tab now has 3 sub-sections: WhatsApp number (site-wide, incl. footer), Header & Hero (promo bar on/off + text, header button text/message, hero badge, 3-part heading, sub-heading, both buttons, trust line, up to 4 chips), Footer; live previews, per-section save, unsaved-dot, discard, restore defaults
- Backend: GET /api/settings (all), GET /api/settings/{section}, PUT /api/admin/settings/{general|header|footer} (validated; replace_one per section)
- Frontend SiteSettingsProvider (context + localStorage cache) feeds every WhatsApp link: header, mobile drawer, hero, product deal buttons, cart checkout, final CTA, floating button, footer
- Low stock alerts — CODE ONLY, nothing sent yet: stock_alerts.py records an alert in db.stock_alerts when stock drops below 10 (PATCH/PUT/bulk/import); GET /api/admin/stock-alerts; send_alert() is a stub awaiting provider choice (CallMeBot / Twilio / email)
- Low-stock card unified to <10; removed unused legacy components with hardcoded numbers

## Backlog
- P0 (when owner decides): connect low stock alert delivery (WhatsApp via CallMeBot/Twilio or email) + choose instant vs daily summary
- P1: Owner on/off setting to show prices again without a developer
- P1: Editable WhatsApp number & button text from admin
- P2: Upload button for brand photos/banners

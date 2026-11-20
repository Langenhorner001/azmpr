import React from "react";
import { Building2, Link2, Phone, Share2, PanelBottom } from "lucide-react";
import { Switch } from "../ui/switch";
import LinkListEditor from "./LinkListEditor";
import SocialListEditor from "./SocialListEditor";
import { Field, Section } from "./SettingsSection";
import { inputCls } from "./ui";

export default function FooterForm({ form, setForm }) {
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const bind = (key, max) => ({
    value: form[key] ?? "",
    onChange: (e) => set(key, e.target.value),
    maxLength: max,
    className: inputCls,
    "data-testid": `footer-input-${key}`,
  });

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <Section icon={Building2} title="Brand" desc="Logo, naam aur chhota sa taaruf" testId="footer-section-brand">
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <Field label="Logo text"><input {...bind("logo_text", 4)} /></Field>
          <Field label="Brand name"><input {...bind("brand_name", 60)} /></Field>
        </div>
        <Field label="Description">
          <textarea {...bind("description", 400)} rows={3} className={`${inputCls} h-auto py-2.5 resize-none`} />
        </Field>
      </Section>

      <Section icon={Phone} title="Contact" desc="WhatsApp number 'WhatsApp number' tab se poori website par lagta hai" testId="footer-section-contact">
        <Field label="Column title"><input {...bind("contact_title", 40)} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Phone number" hint="Empty = phone row hidden"><input {...bind("phone_number", 20)} inputMode="numeric" /></Field>
          <Field label="Phone shown as"><input {...bind("phone_display", 30)} /></Field>
        </div>
        <Field label="WhatsApp pre-filled message"><input {...bind("whatsapp_message", 300)} /></Field>
        <Field label="Email" hint="Empty = email row hidden"><input {...bind("email", 120)} type="email" /></Field>
        <Field label="Address"><input {...bind("address", 200)} /></Field>
      </Section>

      <Section icon={Link2} title="Quick links" desc="Footer ka navigation (max 10)" testId="footer-section-links">
        <Field label="Column title"><input {...bind("quick_links_title", 40)} /></Field>
        <LinkListEditor items={form.quick_links} onChange={(v) => set("quick_links", v)} max={10} testId="footer-quick-links" />
      </Section>

      <Section icon={Share2} title="Social & button" desc="Social profiles aur WhatsApp button" testId="footer-section-social">
        <Field label="Column title"><input {...bind("social_title", 40)} /></Field>
        <SocialListEditor items={form.socials} onChange={(v) => set("socials", v)} />
        <Field label="WhatsApp button text" hint="Empty = button hidden"><input {...bind("cta_label", 40)} /></Field>
      </Section>

      <Section icon={PanelBottom} title="Bottom bar" desc="Copyright line aur chhote links" testId="footer-section-bottom">
        <Field label="Text after © year + brand"><input {...bind("copyright_text", 120)} /></Field>
        <LinkListEditor items={form.bottom_links} onChange={(v) => set("bottom_links", v)} max={6} testId="footer-bottom-links" hrefPlaceholder="/privacy or https://…" />
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.08] cursor-pointer">
          <span className="text-sm font-semibold">Show "Admin" link in footer</span>
          <Switch checked={!!form.show_admin_link} onCheckedChange={(v) => set("show_admin_link", v)} className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-600" data-testid="footer-show-admin-switch" />
        </label>
      </Section>
    </div>
  );
}

import React from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import { Field, Section } from "./SettingsSection";
import { inputCls } from "./ui";

const USED_IN = [
  "Header WhatsApp button",
  "Hero 'Order on WhatsApp' button",
  "Har product ka 'Behtareen Deal WhatsApp par' button",
  "Cart checkout message",
  "Final 'Ready to stock up?' button",
  "Kone wala floating WhatsApp button",
  "Footer WhatsApp link aur 'Start order' button",
];

export const digitsOf = (v) => String(v || "").replace(/\D/g, "");

export const validateGeneral = (g) => {
  const n = digitsOf(g.whatsapp_number).length;
  return n >= 10 && n <= 15 ? "" : "WhatsApp number: country code ke saath 10–15 digits (e.g. 923184214075)";
};

export default function GeneralForm({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const digits = digitsOf(form.whatsapp_number);

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <Section icon={MessageCircle} title="Business WhatsApp number" desc="Ek number — poori website ke saare WhatsApp buttons" testId="general-section-whatsapp">
        <Field label="WhatsApp number" hint="Country code ke saath, bina + ke. e.g. 923184214075">
          <input value={form.whatsapp_number} onChange={set("whatsapp_number")} inputMode="numeric" maxLength={20} className={inputCls} data-testid="general-input-whatsapp_number" />
        </Field>
        <Field label="Number shown as" hint="Footer mein yeh likha dikhega">
          <input value={form.whatsapp_display} onChange={set("whatsapp_display")} maxLength={30} placeholder="+92 318 4214075" className={inputCls} data-testid="general-input-whatsapp_display" />
        </Field>
        {digits.length >= 10 && (
          <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline" data-testid="general-test-whatsapp-link">
            <ExternalLink size={13} /> Test this number on WhatsApp
          </a>
        )}
      </Section>
      <Section icon={MessageCircle} title="Yeh number kahan lagega" testId="general-section-usage">
        <ul className="space-y-2">
          {USED_IN.map((u) => (
            <li key={u} className="flex items-center gap-2 text-sm text-stone-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
              {u}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

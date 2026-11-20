import React from "react";
import { Megaphone, MousePointerClick, Type, BadgeCheck, PanelTop, Plus, X } from "lucide-react";
import { Switch } from "../ui/switch";
import { hrefError } from "./LinkListEditor";
import { Field, Section } from "./SettingsSection";
import { btn, inputCls } from "./ui";

export const validateHeader = (h) => {
  if (!h.hero_primary_label.trim()) return "Hero WhatsApp button ka text zaroori hai";
  if (hrefError(h.hero_secondary_href)) return `Second button link: ${hrefError(h.hero_secondary_href)}`;
  return "";
};

const ChipsEditor = ({ chips, onChange }) => (
  <div className="space-y-2" data-testid="hero-chips-editor">
    {chips.map((c, i) => (
      <div key={i} className="flex gap-2">
        <input value={c} onChange={(e) => onChange(chips.map((x, j) => (j === i ? e.target.value : x)))} maxLength={40} className={inputCls} data-testid={`hero-chip-input-${i}`} />
        <button type="button" onClick={() => onChange(chips.filter((_, j) => j !== i))} className={`${btn.icon} hover:text-rose-400 shrink-0`} aria-label="Remove chip" data-testid={`hero-chip-remove-${i}`}>
          <X size={15} />
        </button>
      </div>
    ))}
    {chips.length < 4 && (
      <button type="button" onClick={() => onChange([...chips, ""])} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300" data-testid="hero-chip-add">
        <Plus size={14} /> Add chip
      </button>
    )}
  </div>
);

export default function HeaderHeroForm({ form, setForm }) {
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const bind = (key, max) => ({
    value: form[key] ?? "",
    onChange: (e) => set(key, e.target.value),
    maxLength: max,
    className: inputCls,
    "data-testid": `header-input-${key}`,
  });
  const area = (key, max) => ({ ...bind(key, max), rows: 3, className: `${inputCls} h-auto py-2.5 resize-none` });

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <Section icon={Megaphone} title="Top promo bar" desc="Sab se upar rangeen patti" testId="header-section-promo">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.08] cursor-pointer">
          <span className="text-sm font-semibold">Show promo bar</span>
          <Switch checked={!!form.promo_enabled} onCheckedChange={(v) => set("promo_enabled", v)} className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-600" data-testid="header-promo-switch" />
        </label>
        <Field label="Promo text"><input {...bind("promo_text", 120)} /></Field>
      </Section>

      <Section icon={PanelTop} title="Header button" desc="Menu ke saath hara WhatsApp button" testId="header-section-button">
        <Field label="Button text"><input {...bind("header_button_label", 30)} /></Field>
        <Field label="Pre-filled WhatsApp message"><textarea {...area("header_whatsapp_message", 300)} /></Field>
      </Section>

      <Section icon={Type} title="Hero heading" desc="Bari heading — beech wala hissa rangeen dikhta hai" testId="header-section-heading">
        <Field label="Small badge above heading" hint="Empty = badge hidden"><input {...bind("hero_eyebrow", 60)} /></Field>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Heading start"><input {...bind("hero_title_before", 60)} /></Field>
          <Field label="Coloured part"><input {...bind("hero_title_highlight", 60)} /></Field>
          <Field label="Heading end"><input {...bind("hero_title_after", 60)} /></Field>
        </div>
        <Field label="Sub-heading"><textarea {...area("hero_subtitle", 300)} /></Field>
      </Section>

      <Section icon={MousePointerClick} title="Hero buttons" testId="header-section-buttons">
        <Field label="WhatsApp button text *"><input {...bind("hero_primary_label", 40)} /></Field>
        <Field label="WhatsApp pre-filled message"><textarea {...area("hero_primary_message", 300)} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Second button text" hint="Empty = button hidden"><input {...bind("hero_secondary_label", 40)} /></Field>
          <Field label="Second button link" hint={hrefError(form.hero_secondary_href) || "#products, /path ya https://…"}><input {...bind("hero_secondary_href", 300)} /></Field>
        </div>
      </Section>

      <Section icon={BadgeCheck} title="Trust line" desc="Buttons ke neeche customers ki line aur chhote chips" testId="header-section-trust">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Bold line"><input {...bind("hero_trust_title", 40)} /></Field>
          <Field label="Small line"><input {...bind("hero_trust_subtitle", 60)} /></Field>
        </div>
        <Field label="Trust chips (max 4)">
          <ChipsEditor chips={form.hero_chips} onChange={(v) => set("hero_chips", v)} />
        </Field>
      </Section>
    </div>
  );
}

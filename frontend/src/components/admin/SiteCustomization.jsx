import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LayoutTemplate, MessageCircle, PanelBottom, RotateCcw } from "lucide-react";
import { adminApi, errMsg } from "./adminApi";
import { SiteSettingsProvider, fetchSiteSettings } from "../../context/SiteSettingsContext";
import { SITE_DEFAULTS, mergeSettings } from "../v2/siteDefaults";
import SiteFooter from "../v2/SiteFooter";
import TopPromoBar from "../v2/TopPromoBar";
import Header from "../v2/Header";
import Hero from "../v2/Hero";
import GeneralForm, { validateGeneral } from "./GeneralForm";
import HeaderHeroForm, { validateHeader } from "./HeaderHeroForm";
import FooterForm from "./FooterForm";
import { hrefError } from "./LinkListEditor";
import SaveBar from "./SaveBar";
import { btn } from "./ui";

const validateFooter = (f) => {
  const links = [...f.quick_links, ...f.bottom_links];
  if (!f.brand_name.trim()) return "Footer brand name zaroori hai";
  if (links.some((l) => !l.label.trim() || hrefError(l.href))) return "Footer ke kisi link ka naam ya address ghalat hai";
  if (f.socials.some((x) => hrefError(x.url))) return "Social link ghalat hai";
  return "";
};

const SECTIONS = [
  { id: "general", label: "WhatsApp number", icon: MessageCircle, Form: GeneralForm, validate: validateGeneral, save: "Save number" },
  { id: "header", label: "Header & Hero", icon: LayoutTemplate, Form: HeaderHeroForm, validate: validateHeader, save: "Save header & hero" },
  { id: "footer", label: "Footer", icon: PanelBottom, Form: FooterForm, validate: validateFooter, save: "Save footer" },
];

const strip = ({ updated_at, whatsapp_number, whatsapp_display, ...rest }, keepNumber) =>
  keepNumber ? { ...rest, whatsapp_number, whatsapp_display } : rest;
const clean = (s) => ({ general: strip(s.general, true), header: strip(s.header), footer: strip(s.footer) });

const Preview = ({ section, form }) => {
  if (section === "general") return null;
  return (
    <div className="mt-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Live preview</p>
      <div className="rounded-2xl overflow-hidden border border-white/[0.08] pointer-events-none select-none bg-white isolate [&_header]:!static" data-testid={`${section}-live-preview`}>
        <SiteSettingsProvider override={form}>
          {section === "header" ? (
            <>
              <TopPromoBar />
              <Header />
              <Hero />
            </>
          ) : (
            <SiteFooter />
          )}
        </SiteSettingsProvider>
      </div>
    </div>
  );
};

export default function SiteCustomization() {
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [section, setSection] = useState("general");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSiteSettings()
      .then((data) => {
        if (!alive) return;
        const s = clean(mergeSettings(data));
        setSaved(s);
        setForm(s);
      })
      .catch((e) => alive && toast.error(errMsg(e, "Could not load website settings")));
    return () => {
      alive = false;
    };
  }, []);

  const active = SECTIONS.find((s) => s.id === section);
  const isDirty = (id) => !!form && JSON.stringify(form[id]) !== JSON.stringify(saved[id]);
  const setSectionForm = (updater) =>
    setForm((f) => ({ ...f, [section]: typeof updater === "function" ? updater(f[section]) : updater }));
  const error = useMemo(() => (form ? active.validate(form[section]) : ""), [form, section, active]);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await adminApi.put(`/settings/${section}`, form[section]);
      const next = strip(data, section === "general");
      setSaved((s) => ({ ...s, [section]: next }));
      setForm((f) => ({ ...f, [section]: next }));
      toast.success(`${active.label} saved — live on the website`);
    } catch (e) {
      toast.error(errMsg(e, "Could not save"));
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <div className="h-64 rounded-2xl bg-[#111827] animate-pulse" data-testid="customization-loading" />;

  return (
    <section className="pb-6" data-testid="customization-view">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display font-extrabold text-xl">Website customization</h2>
          <p className="text-sm text-stone-400">Har hissa alag save hota hai. Preview mein foran dekhein.</p>
        </div>
        <button onClick={() => setSectionForm(clean(SITE_DEFAULTS)[section])} className={btn.ghost} data-testid="settings-restore-defaults-btn">
          <RotateCcw size={15} /> Restore defaults
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto" role="tablist">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-colors ${
              section === id ? "border-amber-500/60 bg-amber-500/10 text-amber-300" : "border-white/10 text-stone-400 hover:text-white"
            }`}
            data-testid={`customize-section-${id}`}
          >
            <Icon size={15} /> {label}
            {isDirty(id) && <span className="w-2 h-2 rounded-full bg-amber-400" aria-label="unsaved" />}
          </button>
        ))}
      </div>

      <active.Form form={form[section]} setForm={setSectionForm} />
      <Preview section={section} form={form} />
      <SaveBar dirty={isDirty(section)} error={error} busy={busy} onDiscard={() => setSectionForm(saved[section])} onSave={save} label={active.save} />
    </section>
  );
}

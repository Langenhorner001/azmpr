import React from "react";
import { Plus, X } from "lucide-react";
import { SOCIAL_PLATFORMS } from "../v2/footerDefaults";
import { SocialIcon } from "../v2/SocialIcon";
import { hrefError } from "./LinkListEditor";
import { btn, inputCls, selectCls } from "./ui";

const PLACEHOLDER = {
  facebook: "https://facebook.com/yourpage",
  instagram: "https://instagram.com/yourpage",
  linkedin: "https://linkedin.com/company/yourpage",
  youtube: "https://youtube.com/@yourchannel",
  twitter: "https://x.com/yourhandle",
  tiktok: "https://tiktok.com/@yourhandle",
};

export default function SocialListEditor({ items, onChange }) {
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  const unused = SOCIAL_PLATFORMS.find((p) => !items.some((it) => it.platform === p.value));

  return (
    <div className="space-y-2" data-testid="footer-socials-editor">
      {items.map((it, i) => {
        const err = hrefError(it.url);
        return (
          <div key={i}>
            <div className="flex gap-2 items-center">
              <span className="w-10 h-10 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-stone-300">
                <SocialIcon platform={it.platform} />
              </span>
              <select value={it.platform} onChange={(e) => update(i, "platform", e.target.value)} className={`${selectCls} w-[34%]`} data-testid={`footer-social-platform-${i}`}>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value} disabled={p.value !== it.platform && items.some((x) => x.platform === p.value)}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input value={it.url} onChange={(e) => update(i, "url", e.target.value)} placeholder={PLACEHOLDER[it.platform]} className={`${inputCls} flex-1 ${err ? "border-rose-500/60" : ""}`} data-testid={`footer-social-url-${i}`} />
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className={`${btn.icon} hover:text-rose-400 shrink-0`} aria-label="Remove" data-testid={`footer-social-remove-${i}`}>
                <X size={15} />
              </button>
            </div>
            {err && <p className="mt-1 ml-12 text-[11px] text-rose-400">{err}</p>}
          </div>
        );
      })}
      {unused && (
        <button type="button" onClick={() => onChange([...items, { platform: unused.value, url: "" }])} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300" data-testid="footer-social-add">
          <Plus size={14} /> Add social profile
        </button>
      )}
      <p className="text-[11px] text-stone-500">Empty link = icon hidden on website.</p>
    </div>
  );
}

import React from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { SAFE_HREF } from "../v2/footerDefaults";
import { btn, inputCls } from "./ui";

export const hrefError = (href) => (href && !SAFE_HREF.test(href.trim()) ? "Start with https://, #, /, mailto: or tel:" : "");

const move = (arr, i, d) => {
  const next = [...arr];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
};

// Editable list of {label, href} links with reorder/remove/add.
export default function LinkListEditor({ items, onChange, max, testId, hrefPlaceholder = "#products or https://…" }) {
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));

  return (
    <div className="space-y-2" data-testid={testId}>
      {items.map((it, i) => {
        const err = hrefError(it.href);
        return (
          <div key={i}>
            <div className="flex gap-2">
              <input value={it.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Label" maxLength={40} className={`${inputCls} w-[38%]`} data-testid={`${testId}-label-${i}`} />
              <input value={it.href} onChange={(e) => update(i, "href", e.target.value)} placeholder={hrefPlaceholder} className={`${inputCls} flex-1 ${err ? "border-rose-500/60" : ""}`} data-testid={`${testId}-href-${i}`} />
              <div className="flex shrink-0">
                <button type="button" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} className={`${btn.icon} disabled:opacity-30`} aria-label="Move up"><ArrowUp size={14} /></button>
                <button type="button" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} className={`${btn.icon} disabled:opacity-30`} aria-label="Move down"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className={`${btn.icon} hover:text-rose-400`} aria-label="Remove" data-testid={`${testId}-remove-${i}`}><X size={15} /></button>
              </div>
            </div>
            {err && <p className="mt-1 text-[11px] text-rose-400">{err}</p>}
          </div>
        );
      })}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { label: "", href: "#" }])} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300" data-testid={`${testId}-add`}>
          <Plus size={14} /> Add link
        </button>
      )}
    </div>
  );
}

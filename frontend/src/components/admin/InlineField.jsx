import React, { useEffect, useState } from "react";

// Click-to-edit cell: saves on Enter/blur, Escape reverts.
export default function InlineField({ value, onSave, type = "text", placeholder, testId }) {
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => setDraft(String(value ?? "")), [value]);

  const commit = () => {
    if (draft.trim() === String(value ?? "").trim()) return;
    if (type === "number") {
      if (draft.trim() === "") return onSave(null);
      const n = Number(draft);
      if (!Number.isInteger(n) || n < 0) {
        setDraft(String(value ?? ""));
        return;
      }
      return onSave(n);
    }
    onSave(draft.trim() || "Contact for pricing");
  };

  return (
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setDraft(String(value ?? ""));
      }}
      className="h-9 w-full rounded-lg bg-transparent border border-transparent px-2 text-[13px] text-white placeholder:text-stone-600 hover:border-white/15 focus:border-amber-500/60 focus:bg-[#0B0F17] focus:outline-none transition-colors tabular-nums"
      data-testid={testId}
    />
  );
}
